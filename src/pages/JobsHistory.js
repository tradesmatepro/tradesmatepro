import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import PageHeader from '../components/Common/PageHeader';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import ModernCard from '../components/Common/ModernCard';
import '../styles/modern-enhancements.css';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const timeAgo = (iso) => {
  const d = new Date(iso); const s = Math.floor((Date.now() - d.getTime()) / 1000);
  const u = [[31536000,'y'],[2592000,'mo'],[604800,'w'],[86400,'d'],[3600,'h'],[60,'m']];
  for (const [sec, label] of u) { if (s >= sec) return `${Math.floor(s/sec)}${label} ago`; }
  return 'just now';
};

const encodeConfig = (cfg) => btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));
const decodeConfig = (s) => { try { return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch { return null; } };

const JobsHistory = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortDir, setSortDir] = useState('desc');
  const [dense, setDense] = useState(false);
  const [showCustomer, setShowCustomer] = useState(true);
  const [showInvoice, setShowInvoice] = useState(true);
  const [selected, setSelected] = useState({});
  const [savedViews, setSavedViews] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jobs_history_views')||'[]'); } catch { return []; }
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [activeView, setActiveView] = useState('');
  const didInitRef = useRef(false);

  // Load from URL/localStorage on first mount
  useEffect(() => {
    if (didInitRef.current) return; didInitRef.current = true;
    const p = new URLSearchParams(window.location.search);
    const ls = (k) => localStorage.getItem(`jobs_history_${k}`) || '';
    const start = p.get('start') || ls('start'); const end = p.get('end') || ls('end');
    const q = p.get('q') ?? ls('q'); const st = p.get('status') || ls('status') || 'all';
    const sb = p.get('sb') || ls('sb') || 'updated_at'; const sd = p.get('sd') || ls('sd') || 'desc';
    const dn = (p.get('dense') || ls('dense')) === '1';
    const sc = (p.get('sc') || ls('sc')) !== '0'; const si = (p.get('si') || ls('si')) !== '0';
    const sel = sessionStorage.getItem('jobs_history_selected');
    if (q) setSearchTerm(q);
    if (start || end) setDateRange({ start: start||'', end: end||'' });
    setStatusFilter(st); setSortBy(sb); setSortDir(sd); setDense(dn); setShowCustomer(sc); setShowInvoice(si);
    if (sel) { try { const ids = JSON.parse(sel); const obj={}; ids.forEach(id=>obj[id]=true); setSelected(obj);} catch {} }

    // Activate view from URL if provided
    const viewParam = p.get('view');
    if (viewParam) {
      const cfg = decodeConfig(viewParam);
      if (cfg) applyViewConfig(cfg, { skipPersist: true });
    }
  }, []);

  // Persist to URL and localStorage
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (searchTerm) { p.set('q', searchTerm); localStorage.setItem('jobs_history_q', searchTerm); } else { p.delete('q'); localStorage.removeItem('jobs_history_q'); }
    if (statusFilter && statusFilter !== 'all') { p.set('status', statusFilter); localStorage.setItem('jobs_history_status', statusFilter); } else { p.delete('status'); localStorage.removeItem('jobs_history_status'); }
    if (dateRange.start) { p.set('start', dateRange.start); localStorage.setItem('jobs_history_start', dateRange.start); } else { p.delete('start'); localStorage.removeItem('jobs_history_start'); }
    if (dateRange.end) { p.set('end', dateRange.end); localStorage.setItem('jobs_history_end', dateRange.end); } else { p.delete('end'); localStorage.removeItem('jobs_history_end'); }
    if (sortBy) { p.set('sb', sortBy); localStorage.setItem('jobs_history_sb', sortBy); }
    if (sortDir) { p.set('sd', sortDir); localStorage.setItem('jobs_history_sd', sortDir); }
    p.set('dense', dense ? '1' : '0'); localStorage.setItem('jobs_history_dense', dense ? '1' : '0');
    p.set('sc', showCustomer ? '1' : '0'); localStorage.setItem('jobs_history_sc', showCustomer ? '1' : '0');
    p.set('si', showInvoice ? '1' : '0'); localStorage.setItem('jobs_history_si', showInvoice ? '1' : '0');
    const url = `${window.location.pathname}${p.toString() ? `?${p.toString()}` : ''}`;
    window.history.replaceState({}, '', url);
  }, [searchTerm, statusFilter, dateRange.start, dateRange.end, sortBy, sortDir, dense, showCustomer, showInvoice]);

  // Persist saved views
  useEffect(() => {
    localStorage.setItem('jobs_history_views', JSON.stringify(savedViews));
  }, [savedViews]);

  // Persist selection in session
  useEffect(() => {
    const ids = Object.keys(selected);
    sessionStorage.setItem('jobs_history_selected', JSON.stringify(ids));
  }, [selected]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchTerm.trim()), 300); return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => { if (user?.company_id) loadHistory(); }, [user?.company_id]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await supaFetch('jobs_with_payment_status?unified_status=eq.closed_job&order=updated_at.desc', { method: 'GET' }, user.company_id);
      if (res.ok) setItems((await res.json()) || []);
      else console.error('Failed to load history:', await res.text());
    } catch (e) { console.error('Error loading history', e); }
    finally { setLoading(false); }
  };

  const filtered = useMemo(() => items.filter((wo) => {
    const q = debounced.toLowerCase();
    const matchesSearch = !q
      || (wo.title||'').toLowerCase().includes(q)
      || (wo.customer_name||'').toLowerCase().includes(q)
      || (wo.customer_phone||'').toLowerCase().includes(q)
      || (wo.invoice_number||'').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'completed' && wo.job_status === 'COMPLETED')
      || (statusFilter === 'invoiced' && (wo.invoice_id || wo.invoice_number));
    const d = new Date(wo.updated_at); const startOk = !dateRange.start || d >= new Date(dateRange.start); const endOk = !dateRange.end || d <= new Date(dateRange.end);
    return matchesSearch && matchesStatus && startOk && endOk;
  }), [items, debounced, statusFilter, dateRange.start, dateRange.end]);

  const counts = useMemo(() => ({
    all: items.length,
    completed: items.filter(w=>w.job_status==='COMPLETED' && !w.invoice_id).length,
    invoiced: items.filter(w=>w.invoice_id).length,
  }), [items]);

  const kpis = useMemo(() => {
    const total = filtered.length;
    const invRows = filtered.filter(w=>w.invoice_id);
    const inv = invRows.length;
    const pctInv = total ? Math.round((inv/total)*100) : 0;
    const diffs = invRows
      .filter(w=>w.invoice_date && (w.completed_at || w.updated_at))
      .map(w => {
        const start = new Date(w.completed_at || w.updated_at);
        const end = new Date(w.invoice_date);
        return Math.max(0, Math.round((end - start) / (1000*60*60*24)));
      });
    const avgDays = diffs.length ? Math.round(diffs.reduce((a,b)=>a+b,0)/diffs.length) : 0;
    const totalAmount = invRows.reduce((sum, w) => sum + (Number(w.total_amount)||0), 0);
    return { total, inv, pctInv, avgDays, totalAmount };
  }, [filtered]);

  const filteredCounts = useMemo(() => ({
    completed: filtered.filter(w=>w.job_status==='COMPLETED' && !w.invoice_id).length,
    invoiced: filtered.filter(w=>w.invoice_id).length,
  }), [filtered]);

  const sorted = useMemo(() => {
    const factor = sortDir === 'asc' ? 1 : -1;
    const arr = [...filtered];
    arr.sort((a,b) => {
      const A = a[sortBy]; const B = b[sortBy];
      if (sortBy === 'updated_at') {
        return (new Date(A) - new Date(B)) * factor;
      }
      const aVal = (A||'').toString().toLowerCase();
      const bVal = (B||'').toString().toLowerCase();
      if (aVal < bVal) return -1 * factor; if (aVal > bVal) return 1 * factor; return 0;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);

  const selectedCount = useMemo(() => Object.keys(selected).length, [selected]);

  const exportCSV = () => {
    const cols = ['id','title','customer_name','customer_email','job_status','invoice_id','updated_at'];
    const lines = [cols.join(',')].concat(sorted.map(w => cols.map(c => JSON.stringify((w[c]??'').toString())).join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().split('T')[0]; a.download = `closed_jobs_${stamp}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };

  const exportSelectedCSV = () => {
    const ids = Object.keys(selected);
    if (ids.length === 0) return;
    const cols = ['id','title','customer_name','customer_email','job_status','invoice_id','updated_at'];
    const rows = sorted.filter(w => selected[w.id]);
    const lines = [cols.join(',')].concat(rows.map(w => cols.map(c => JSON.stringify((w[c]??'').toString())).join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().split('T')[0]; a.download = `closed_jobs_selected_${stamp}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };

  const bulkReopen = async () => {
    const ids = Object.keys(selected);
    if (ids.length === 0) return;
    if (!window.confirm(`Reopen ${ids.length} job(s)?`)) return;
    try {
      await Promise.allSettled(sorted.filter(w=>selected[w.id]).map(async (wo) => {
        const res = await supaFetch('rpc/wo_change_status', {
          method: 'POST', headers: { 'Accept': 'application/json' },
          body: { p_id: wo.id, p_to: 'IN_PROGRESS', p_company_id: user?.company_id }
        }, user?.company_id);
        if (!res.ok) throw new Error(await res.text());
      }));
      setSelected({});
      await loadHistory();
    } catch (e) { console.error('bulkReopen failed', e); }
  };

  const applyPreset = (key) => {
    const today = new Date(); const toISO = (d)=>d.toISOString().slice(0,10);
    if (key==='7d'){ const s=new Date(today); s.setDate(s.getDate()-7); setDateRange({start:toISO(s),end:toISO(today)}); }
    if (key==='30d'){ const s=new Date(today); s.setDate(s.getDate()-30); setDateRange({start:toISO(s),end:toISO(today)}); }
    if (key==='qtr'){ const m=today.getMonth(); const qStart=new Date(today.getFullYear(), m-m%3, 1); setDateRange({start:toISO(qStart), end:toISO(today)}); }
    if (key==='ytd'){ const s=new Date(today.getFullYear(),0,1); setDateRange({start:toISO(s),end:toISO(today)}); }
    if (key==='clear'){ setDateRange({start:'',end:''}); }
  };

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir(col === 'updated_at' ? 'desc' : 'asc'); }
  };

  const currentViewConfig = () => ({
    q: searchTerm, status: statusFilter,
    start: dateRange.start, end: dateRange.end,
    sb: sortBy, sd: sortDir, dense,
    sc: showCustomer, si: showInvoice
  });

  const applyViewConfig = (cfg, opts={}) => {
    setSearchTerm(cfg.q||'');
    setStatusFilter(cfg.status||'all');
    setDateRange({ start: cfg.start||'', end: cfg.end||'' });
    setSortBy(cfg.sb||'updated_at'); setSortDir(cfg.sd||'desc');
    setDense(!!cfg.dense); setShowCustomer(cfg.sc!==false); setShowInvoice(cfg.si!==false);
    if (!opts.skipPersist) {
      const p = new URLSearchParams(window.location.search);
      p.set('view', encodeConfig(cfg));
      window.history.replaceState({}, '', `${window.location.pathname}?${p.toString()}`);
    }
  };

  const saveCurrentView = () => {
    const name = prompt('Save view as:'); if (!name) return;
    const cfg = currentViewConfig();
    const view = { id: Date.now().toString(), name, cfg };
    setSavedViews(prev => [...prev, view]);
    setActiveView(view.id);
  };

  const shareCurrentView = () => {
    const cfg = currentViewConfig();
    const param = encodeConfig(cfg);
    const url = `${window.location.origin}${window.location.pathname}?view=${param}`;
    navigator.clipboard.writeText(url).then(()=> alert('Share link copied to clipboard')).catch(()=>{});
  };

  const applySavedView = (id) => {
    const v = savedViews.find(v => v.id === id); if (!v) return;
    setActiveView(id);
    applyViewConfig(v.cfg);
  };

  const deleteSavedView = (id) => {
    setSavedViews(prev => prev.filter(v => v.id !== id));
    if (activeView === id) setActiveView('');
  };

  const reopenJob = async (wo) => {
    const invoiceWarn = wo.invoice_id ? '\nNote: This job is linked to an invoice.' : '';
    if (!window.confirm(`Reopen this job and continue editing?${invoiceWarn}`)) return;
    try {
      const res = await supaFetch('rpc/wo_change_status', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: { p_id: wo.id, p_to: 'IN_PROGRESS', p_company_id: user?.company_id }
      }, user?.company_id);
      if (!res.ok) {
        const err = await res.text();
        console.error('wo_change_status failed', res.status, err);
        alert('Failed to reopen job.');
        return;
      }
      navigate(`/jobs?edit=${wo.id}`);
    } catch (e) {
      console.error('reopenJob error', e);
      alert('Failed to reopen job.');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target && ['input','textarea','select'].includes(e.target.tagName.toLowerCase())) return;
      if (e.key === '/') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key.toLowerCase() === 'x') {
        // toggle selection on visible rows
        const next = {...selected};
        for (const w of sorted.slice(0,50)) { // limit for safety
          if (next[w.id]) delete next[w.id]; else next[w.id]=true;
        }
        setSelected(next);
      }
      if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const all={}; filtered.forEach(w=>all[w.id]=true); setSelected(all);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sorted, filtered, selected]);

  const cellPad = dense ? 'px-4 py-2' : 'px-6 py-4';

  const openEmailModal = () => {
    const rows = sorted.filter(w=>selected[w.id]);
    setEmailRecipients(rows.map(w=>({ id: w.customer_id, name: w.customer_name, email: w.customer_email, jobId: w.id })));
    setEmailSubject(`Closeout package for ${rows.length} job(s)`);
    setEmailBody('Hello,\n\nPlease find your job closeout package attached.\n\nThanks,');
    setShowEmailModal(true);
  };

  const sendBulkEmails = async () => {
    // Placeholder: integrate with your email service or messaging
    alert(`Queued ${emailRecipients.length} closeout email(s).`);
    setShowEmailModal(false);
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Closed Jobs"
        subtitle="Completed jobs, invoicing performance, and historical records"
        icon={CheckCircleIcon}
        gradient="green"
        stats={[
          { label: 'Completed', value: kpis.total },
          { label: 'Invoiced', value: kpis.inv },
          { label: 'Revenue', value: `$${(kpis.totalAmount/1000).toFixed(0)}K` }
        ]}
        actions={[
          {
            label: 'Export CSV',
            icon: ArrowDownTrayIcon,
            onClick: exportCSV
          }
        ]}
      />

      {/* Completion Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernCard className="card-gradient-green text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Jobs Completed</p>
                <p className="text-3xl font-bold text-white">{kpis.total}</p>
                <p className="text-green-200 text-xs mt-1">In date range</p>
              </div>
              <CheckCircleIcon className="w-12 h-12 text-green-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-blue text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Revenue Generated</p>
                <p className="text-3xl font-bold text-white">${(kpis.totalAmount/1000).toFixed(0)}K</p>
                <p className="text-blue-200 text-xs mt-1">Total invoiced</p>
              </div>
              <CurrencyDollarIcon className="w-12 h-12 text-blue-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-purple text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Invoicing Rate</p>
                <p className="text-3xl font-bold text-white">{kpis.pctInv}%</p>
                <p className="text-purple-200 text-xs mt-1">Jobs invoiced</p>
              </div>
              <ChartBarIcon className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-orange text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Avg Days to Invoice</p>
                <p className="text-3xl font-bold text-white">{kpis.avgDays}</p>
                <p className="text-orange-200 text-xs mt-1">Processing time</p>
              </div>
              <ClockIcon className="w-12 h-12 text-orange-200" />
            </div>
          </div>
        </ModernCard>
      </div>

      <div className="card mb-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input ref={searchRef} className="w-full pl-10 pr-9 py-2 border rounded-md" placeholder="Search by title, customer, invoice #" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
              {searchTerm && (
                <button aria-label="Clear" onClick={()=>setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5"/></button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <select className="px-3 py-2 border rounded-md" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
              <option value="all">All ({counts.all})</option>
              <option value="completed">Completed ({counts.completed})</option>
              <option value="invoiced">Invoiced ({counts.invoiced})</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <input type="date" className="border rounded px-2 py-1" value={dateRange.start} onChange={(e)=>setDateRange({...dateRange,start:e.target.value})} />
            <span className="text-gray-500">-</span>
            <input type="date" className="border rounded px-2 py-1" value={dateRange.end} onChange={(e)=>setDateRange({...dateRange,end:e.target.value})} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-600">Presets:</span>
          {['7d','30d','qtr','ytd','clear'].map(k=> (
            <button key={k} onClick={()=>applyPreset(k)} className="px-2 py-1 rounded border hover:bg-gray-50 capitalize">{k}</button>
          ))}
          <span className="ml-auto text-gray-600 flex items-center gap-2">
            <span>Showing {sorted.length} of {items.length} • Completed {filteredCounts.completed} • Invoiced {filteredCounts.invoiced}</span>
            {selectedCount>0 && (
              <button onClick={()=>{ const all={}; filtered.forEach(w=>all[w.id]=true); setSelected(all); }} className="btn-xs btn-outline">Select all {filtered.length}</button>
            )}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={showCustomer} onChange={(e)=>setShowCustomer(e.target.checked)} /> Customer</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={showInvoice} onChange={(e)=>setShowInvoice(e.target.checked)} /> Invoice</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={dense} onChange={(e)=>setDense(e.target.checked)} /> Compact rows</label>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3"><input type="checkbox" aria-label="Select all" checked={sorted.length>0 && sorted.every(w=>selected[w.id])} onChange={(e)=>{
                  const all = {...selected};
                  if (e.target.checked) sorted.forEach(w=>all[w.id]=true); else sorted.forEach(w=>delete all[w.id]);
                  setSelected(all);
                }}/></th>
                <th onClick={()=>handleSort('title')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">Job {sortBy==='title' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
                {showCustomer && (<th onClick={()=>handleSort('customer_name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">Customer {sortBy==='customer_name' ? (sortDir==='asc'?'▲':'▼') : ''}</th>)}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                {showInvoice && (<th onClick={()=>handleSort('invoice_number')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">Invoice {sortBy==='invoice_number' ? (sortDir==='asc'?'▲':'▼') : ''}</th>)}
                <th onClick={()=>handleSort('updated_at')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none">Updated {sortBy==='updated_at' ? (sortDir==='asc'?'▲':'▼') : ''}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({length:6}).map((_,i)=> (
                  <tr key={i}>
                    <td className={cellPad}><div className="h-4 w-4 bg-gray-200 animate-pulse rounded"/></td>
                    <td className={cellPad}><div className="h-4 w-40 bg-gray-200 animate-pulse rounded"/></td>
                    {showCustomer && (<td className={cellPad}><div className="h-4 w-48 bg-gray-200 animate-pulse rounded"/></td>)}
                    <td className={cellPad}><div className="h-5 w-20 bg-gray-200 animate-pulse rounded-full"/></td>
                    {showInvoice && (<td className={cellPad}><div className="h-4 w-24 bg-gray-200 animate-pulse rounded"/></td>)}
                    <td className={cellPad}><div className="h-4 w-20 bg-gray-200 animate-pulse rounded"/></td>
                    <td className={cellPad}></td>
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-500">No closed jobs match your filters.</td></tr>
              ) : (
                sorted.map((wo) => (
                  <tr key={wo.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>navigate(`/jobs?edit=${wo.id}`)}>
                    <td className={cellPad + ' whitespace-nowrap'}>
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <input type="checkbox" checked={!!selected[wo.id]} onChange={(e)=>{
                          const next = {...selected}; if (e.target.checked) next[wo.id]=true; else delete next[wo.id]; setSelected(next);
                        }} onClick={(e)=>e.stopPropagation()} />
                        <span>{wo.title || '—'}</span>
                        <a onClick={(e)=>e.stopPropagation()} href={`/jobs?edit=${wo.id}`} className="text-primary-600 hover:underline text-xs">View</a>
                      </div>
                      <div className="text-xs text-gray-500">ID: {wo.id}</div>
                    </td>
                    {showCustomer && (
                      <td className={cellPad + ' whitespace-nowrap'}>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center"><UserIcon className="w-4 h-4 text-gray-600" /></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{wo.customer_name || '—'}</div>
                            <div className="text-xs text-gray-500">{wo.customer_email || ''}</div>
                            <div className="text-xs text-gray-400">{wo.customer_phone || ''}</div>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className={cellPad + ' whitespace-nowrap text-sm'}>
                      {wo.invoice_id ? (
                        <span title="Linked to invoice" className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">Invoiced</span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Completed</span>
                      )}
                    </td>
                    {showInvoice && (
                      <td className={cellPad + ' whitespace-nowrap text-sm'}>
                        {wo.invoice_id ? (
                          <div className="text-sm flex items-center gap-2">
                            <div className="text-gray-900">#{wo.invoice_number || '—'}</div>
                            <a onClick={(e)=>e.stopPropagation()} className="text-primary-600 hover:underline inline-flex items-center gap-1" href={`/invoices?view=${wo.invoice_id}`} title="Open invoice">
                              View <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5"/>
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    )}
                    <td className={cellPad + ' whitespace-nowrap text-sm text-gray-500'} title={`Updated: ${new Date(wo.updated_at).toLocaleString()}${wo.invoice_date ? `\nInvoiced: ${new Date(wo.invoice_date).toLocaleString()}`:''}`}>
                      {timeAgo(wo.updated_at)}
                    </td>
                    <td className={cellPad + ' whitespace-nowrap text-sm'}>
                      <button onClick={(e)=>{e.stopPropagation(); reopenJob(wo);}} className="text-primary-600 hover:underline">Reopen</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobsHistory;
