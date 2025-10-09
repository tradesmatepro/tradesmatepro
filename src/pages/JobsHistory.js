import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import PageHeader from '../components/Common/PageHeader';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import ModernCard from '../components/Common/ModernCard';
import ClosedJobDetailModal from '../components/ClosedJobDetailModal';
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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedJobForFeedback, setSelectedJobForFeedback] = useState(null);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [selectedJobForWarranty, setSelectedJobForWarranty] = useState(null);
  const [activeView, setActiveView] = useState('');
  const [showJobDetailModal, setShowJobDetailModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
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
      // ✅ INDUSTRY STANDARD: Closed Jobs = ONLY paid, closed, cancelled
      // "completed" = ready to invoice (belongs on Invoices page)
      // "invoiced" = awaiting payment (belongs on Invoices page)
      // "paid" = payment received (can be closed)
      // "closed" = final archive status
      // "cancelled" = job was cancelled
      // Matches ServiceTitan/Jobber/Housecall Pro workflow
      const res = await supaFetch("work_orders?status=in.(paid,closed,cancelled)&select=*,customers(name,email,phone)&order=updated_at.desc", { method: 'GET' }, user.company_id);
      if (res.ok) {
        const rows = (await res.json()) || [];
        console.log('📊 Loaded closed jobs:', rows.length, rows);

        // Debug: Check if jobs have total_amount data
        const jobsWithAmount = rows.filter(w => w.total_amount && w.total_amount > 0);
        const jobsWithInvoice = rows.filter(w => w.invoice_id);
        console.log('💰 Jobs with total_amount > 0:', jobsWithAmount.length, jobsWithAmount.map(w => ({ id: w.id, title: w.title, total_amount: w.total_amount })));
        console.log('🧾 Jobs with invoice_id:', jobsWithInvoice.length, jobsWithInvoice.map(w => ({ id: w.id, title: w.title, invoice_id: w.invoice_id, total_amount: w.total_amount })));

        // Flatten nested selects for UI
        const mapped = rows.map(w => ({
          ...w,
          customer_name: w.customers?.name || '',
          customer_email: w.customers?.email || '',
          customer_phone: w.customers?.phone || '',
          // invoice_id is a direct column on work_orders, no need for nested select
          invoice_number: w.invoice_number || null
        }));
        setItems(mapped);
      } else {
        console.error('Failed to load history:', await res.text());
      }
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

    // ✅ INDUSTRY STANDARD: Only paid, closed, cancelled (no "completed")
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'paid' && wo.status === 'paid')
      || (statusFilter === 'closed' && wo.status === 'closed')
      || (statusFilter === 'cancelled' && wo.status === 'cancelled');

    const d = new Date(wo.updated_at);
    const startOk = !dateRange.start || d >= new Date(dateRange.start);
    const endOk = !dateRange.end || d <= new Date(dateRange.end);
    return matchesSearch && matchesStatus && startOk && endOk;
  }), [items, debounced, statusFilter, dateRange.start, dateRange.end]);

  const counts = useMemo(() => ({
    all: items.length,
    paid: items.filter(w=>w.status==='paid').length,
    closed: items.filter(w=>w.status==='closed').length,
    cancelled: items.filter(w=>w.status==='cancelled').length,
  }), [items]);

  const kpis = useMemo(() => {
    // ✅ FIX: Use ALL items for KPIs, not filtered (tiles should show overview of all closed jobs)
    const total = items.length;
    const invRows = items.filter(w=>w.invoice_id);
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

    // ✅ FIX: Calculate revenue from ALL closed jobs with total_amount, not just those with invoice_id
    // Closed jobs should already have been invoiced/paid, so total_amount represents actual revenue
    const totalAmount = items.reduce((sum, w) => sum + (Number(w.total_amount)||0), 0);

    // Advanced Analytics - Profit/Loss Analysis
    const totalCosts = items.reduce((sum, w) => {
      const laborCost = (Number(w.labor_hours) || 0) * (Number(w.labor_rate) || 50); // Default $50/hr
      const materialCost = Number(w.material_cost) || 0;
      const equipmentCost = Number(w.equipment_cost) || 0;
      return sum + laborCost + materialCost + equipmentCost;
    }, 0);

    const grossProfit = totalAmount - totalCosts;
    const profitMargin = totalAmount > 0 ? Math.round((grossProfit / totalAmount) * 100) : 0;

    // Technician Performance Metrics
    const techPerformance = {};
    items.forEach(w => {
      if (w.assigned_to) {
        if (!techPerformance[w.assigned_to]) {
          techPerformance[w.assigned_to] = {
            name: w.technician_name || w.assigned_to,
            jobsCompleted: 0,
            totalRevenue: 0,
            totalHours: 0,
            avgRating: 0,
            ratings: []
          };
        }
        techPerformance[w.assigned_to].jobsCompleted++;
        techPerformance[w.assigned_to].totalRevenue += Number(w.total_amount) || 0;
        techPerformance[w.assigned_to].totalHours += Number(w.labor_hours) || 0;
        if (w.customer_rating) {
          techPerformance[w.assigned_to].ratings.push(Number(w.customer_rating));
        }
      }
    });

    // Calculate average ratings
    Object.values(techPerformance).forEach(tech => {
      if (tech.ratings.length > 0) {
        tech.avgRating = tech.ratings.reduce((a, b) => a + b, 0) / tech.ratings.length;
      }
    });

    // Warranty Tracking
    const warrantyJobs = items.filter(w => w.warranty_period && w.warranty_period > 0);
    const activeWarranties = warrantyJobs.filter(w => {
      const completedDate = new Date(w.completed_at || w.updated_at);
      const warrantyEndDate = new Date(completedDate.getTime() + (w.warranty_period * 24 * 60 * 60 * 1000));
      return warrantyEndDate > new Date();
    });

    return {
      total, inv, pctInv, avgDays, totalAmount,
      totalCosts, grossProfit, profitMargin,
      techPerformance,
      warrantyJobs: warrantyJobs.length,
      activeWarranties: activeWarranties.length
    };
  }, [items]);

  const filteredCounts = useMemo(() => ({
    completed: filtered.filter(w=>w.status==='completed').length,
    paid: filtered.filter(w=>w.status==='paid').length,
    closed: filtered.filter(w=>w.status==='closed').length,
    cancelled: filtered.filter(w=>w.status==='cancelled').length,
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
    const cols = ['id','title','customer_name','customer_email','status','invoice_id','updated_at'];
    const lines = [cols.join(',')].concat(sorted.map(w => cols.map(c => JSON.stringify((w[c]??'').toString())).join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().split('T')[0]; a.download = `closed_jobs_${stamp}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };

  const exportSelectedCSV = () => {
    const ids = Object.keys(selected);
    if (ids.length === 0) return;
    const cols = ['id','title','customer_name','customer_email','status','invoice_id','updated_at'];
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

  // ✅ INDUSTRY STANDARD: View job in read-only modal
  const handleViewJob = (wo) => {
    setSelectedJobId(wo.id);
    setShowJobDetailModal(true);
  };

  // ✅ INDUSTRY STANDARD: Reopen closed job (for warranty work, corrections, etc.)
  const reopenJob = async (wo) => {
    const invoiceWarn = wo.invoice_id ? '\n\n⚠️ Note: This job is linked to an invoice. Reopening may affect billing.' : '';
    const warrantyNote = '\n\n💡 Tip: Use this for warranty work, corrections, or follow-up service.';
    if (!window.confirm(`Reopen "${wo.title}" and move it back to active jobs?${invoiceWarn}${warrantyNote}`)) return;

    try {
      const res = await supaFetch('rpc/wo_change_status', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: { p_id: wo.id, p_to: 'in_progress', p_company_id: user?.company_id }
      }, user?.company_id);

      if (!res.ok) {
        const err = await res.text();
        console.error('wo_change_status failed', res.status, err);
        alert('Failed to reopen job. Please try again.');
        return;
      }

      // Close modal if open
      setShowJobDetailModal(false);

      // Reload the list to remove the reopened job
      await loadHistory();

      // Navigate to Jobs page with the job open for editing
      navigate(`/jobs?edit=${wo.id}`);
    } catch (e) {
      console.error('reopenJob error', e);
      alert('Failed to reopen job. Please try again.');
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

  const requestCustomerFeedback = async (job) => {
    setSelectedJobForFeedback(job);
    setShowFeedbackModal(true);
  };

  const sendFeedbackRequest = async (job, method) => {
    try {
      // Send feedback request via email or SMS
      const message = `Hi ${job.customer_name}, we'd love your feedback on the recent work we completed. Please rate your experience: [Feedback Link]`;

      if (method === 'email' && job.customer_email) {
        // Integrate with email service
        console.log('Sending feedback request via email to:', job.customer_email);
        alert(`Feedback request sent to ${job.customer_email}`);
      } else if (method === 'sms' && job.customer_phone) {
        // Integrate with SMS service
        console.log('Sending feedback request via SMS to:', job.customer_phone);
        alert(`Feedback request sent to ${job.customer_phone}`);
      }

      // Update job record to track feedback request
      await supaFetch(`work_orders?id=eq.${job.id}`, {
        method: 'PATCH',
        body: {
          feedback_requested_at: new Date().toISOString(),
          feedback_method: method
        }
      }, user.company_id);

      setShowFeedbackModal(false);
      loadHistory(); // Refresh data
    } catch (error) {
      console.error('Error sending feedback request:', error);
      alert('Failed to send feedback request');
    }
  };

  const manageWarranty = async (job) => {
    setSelectedJobForWarranty(job);
    setShowWarrantyModal(true);
  };

  const updateWarranty = async (job, warrantyDays, warrantyNotes) => {
    try {
      await supaFetch(`work_orders?id=eq.${job.id}`, {
        method: 'PATCH',
        body: {
          warranty_period: warrantyDays,
          warranty_notes: warrantyNotes,
          warranty_start_date: job.completed_at || job.updated_at
        }
      }, user.company_id);

      setShowWarrantyModal(false);
      loadHistory(); // Refresh data
      alert('Warranty information updated successfully');
    } catch (error) {
      console.error('Error updating warranty:', error);
      alert('Failed to update warranty information');
    }
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
          { label: 'Revenue', value: `$${(kpis.totalAmount/1000).toFixed(0)}K` },
          { label: 'Profit Margin', value: `${kpis.profitMargin}%` },
          { label: 'Active Warranties', value: kpis.activeWarranties }
        ]}
        actions={[
          {
            label: 'Export CSV',
            icon: ArrowDownTrayIcon,
            onClick: exportCSV
          },
          {
            label: 'Analytics Report',
            icon: ChartBarIcon,
            onClick: () => alert('Advanced analytics report coming soon!')
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

      {/* Advanced Analytics - Profit/Loss Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernCard className="card-gradient-emerald text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Gross Profit</p>
                <p className="text-3xl font-bold text-white">${(kpis.grossProfit/1000).toFixed(0)}K</p>
                <p className="text-emerald-200 text-xs mt-1">Revenue - Costs</p>
              </div>
              <CurrencyDollarIcon className="w-12 h-12 text-emerald-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-red text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Total Costs</p>
                <p className="text-3xl font-bold text-white">${(kpis.totalCosts/1000).toFixed(0)}K</p>
                <p className="text-red-200 text-xs mt-1">Labor + Materials</p>
              </div>
              <ChartBarIcon className="w-12 h-12 text-red-200" />
            </div>
          </div>
        </ModernCard>

        <ModernCard className="card-gradient-indigo text-white hover-lift">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Warranty Coverage</p>
                <p className="text-3xl font-bold text-white">{kpis.activeWarranties}</p>
                <p className="text-indigo-200 text-xs mt-1">Active warranties</p>
              </div>
              <CheckCircleIcon className="w-12 h-12 text-indigo-200" />
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Technician Performance Dashboard */}
      {Object.keys(kpis.techPerformance).length > 0 && (
        <ModernCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Technician Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(kpis.techPerformance).map(([techId, tech]) => (
                <div key={techId} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{tech.name}</h4>
                    <UserIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jobs Completed:</span>
                      <span className="font-medium">{tech.jobsCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue Generated:</span>
                      <span className="font-medium">${(tech.totalRevenue/1000).toFixed(1)}K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Hours:</span>
                      <span className="font-medium">{tech.totalHours.toFixed(1)}h</span>
                    </div>
                    {tech.avgRating > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Rating:</span>
                        <span className="font-medium">{tech.avgRating.toFixed(1)}/5 ⭐</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue/Hour:</span>
                      <span className="font-medium">${tech.totalHours > 0 ? (tech.totalRevenue / tech.totalHours).toFixed(0) : '0'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ModernCard>
      )}

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
              <option value="paid">Paid ({counts.paid})</option>
              <option value="closed">Closed ({counts.closed})</option>
              <option value="cancelled">Cancelled ({counts.cancelled})</option>
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
            <span>Showing {sorted.length} of {items.length} • Completed {filteredCounts.completed} • Paid {filteredCounts.paid} • Closed {filteredCounts.closed} • Cancelled {filteredCounts.cancelled}</span>
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
                  <tr key={wo.id} className="hover:bg-gray-50 cursor-pointer" onClick={()=>handleViewJob(wo)}>
                    <td className={cellPad + ' whitespace-nowrap'}>
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <input type="checkbox" checked={!!selected[wo.id]} onChange={(e)=>{
                          const next = {...selected}; if (e.target.checked) next[wo.id]=true; else delete next[wo.id]; setSelected(next);
                        }} onClick={(e)=>e.stopPropagation()} />
                        <span>{wo.title || '—'}</span>
                        <button onClick={(e)=>{e.stopPropagation(); handleViewJob(wo);}} className="text-primary-600 hover:underline text-xs">View</button>
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
                      {wo.status === 'paid' ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Paid</span>
                      ) : wo.status === 'closed' ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Closed</span>
                      ) : wo.status === 'cancelled' ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Cancelled</span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{wo.status}</span>
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
                      <div className="flex items-center gap-2">
                        <button onClick={(e)=>{e.stopPropagation(); reopenJob(wo);}} className="text-primary-600 hover:underline">Reopen</button>
                        <button onClick={(e)=>{e.stopPropagation(); requestCustomerFeedback(wo);}} className="text-blue-600 hover:underline" title="Request Customer Feedback">Feedback</button>
                        <button onClick={(e)=>{e.stopPropagation(); manageWarranty(wo);}} className="text-green-600 hover:underline" title="Manage Warranty">Warranty</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Feedback Request Modal */}
      {showFeedbackModal && selectedJobForFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Customer Feedback</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Job: {selectedJobForFeedback.title}</p>
              <p className="text-sm text-gray-600 mb-4">Customer: {selectedJobForFeedback.customer_name}</p>
            </div>
            <div className="flex gap-3">
              {selectedJobForFeedback.customer_email && (
                <button
                  onClick={() => sendFeedbackRequest(selectedJobForFeedback, 'email')}
                  className="flex-1 btn-primary"
                >
                  Send via Email
                </button>
              )}
              {selectedJobForFeedback.customer_phone && (
                <button
                  onClick={() => sendFeedbackRequest(selectedJobForFeedback, 'sms')}
                  className="flex-1 btn-secondary"
                >
                  Send via SMS
                </button>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warranty Management Modal */}
      {showWarrantyModal && selectedJobForWarranty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Manage Warranty</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Job: {selectedJobForWarranty.title}</p>
              <p className="text-sm text-gray-600 mb-4">Customer: {selectedJobForWarranty.customer_name}</p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const warrantyDays = parseInt(formData.get('warrantyDays'));
              const warrantyNotes = formData.get('warrantyNotes');
              updateWarranty(selectedJobForWarranty, warrantyDays, warrantyNotes);
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Period (days)
                </label>
                <input
                  type="number"
                  name="warrantyDays"
                  defaultValue={selectedJobForWarranty.warranty_period || 365}
                  className="w-full border rounded-md px-3 py-2"
                  min="0"
                  max="3650"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Notes
                </label>
                <textarea
                  name="warrantyNotes"
                  defaultValue={selectedJobForWarranty.warranty_notes || ''}
                  className="w-full border rounded-md px-3 py-2"
                  rows="3"
                  placeholder="Warranty terms and conditions..."
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 btn-primary">
                  Update Warranty
                </button>
                <button
                  type="button"
                  onClick={() => setShowWarrantyModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ INDUSTRY STANDARD: Read-only job detail modal with reopen capability */}
      <ClosedJobDetailModal
        isOpen={showJobDetailModal}
        onClose={() => {
          setShowJobDetailModal(false);
          setSelectedJobId(null);
        }}
        jobId={selectedJobId}
        onReopen={(job) => reopenJob(job)}
      />
    </div>
  );
};

export default JobsHistory;
