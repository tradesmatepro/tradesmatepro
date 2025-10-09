import React from 'react';
import PageHeader from '../components/Common/PageHeader';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import ModernCard from '../components/Common/ModernCard';
import '../styles/modern-enhancements.css';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import {
  CurrencyDollarIcon,
  PlusIcon,
  ChartBarIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  CameraIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import DocumentService from '../services/DocumentService';
import ReimbursementRequestModal from '../components/Expenses/ReimbursementRequestModal';

const Expenses = () => {
  const { user } = useUser();

  // Data & loading
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  // Filters
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [approvalStatus, setApprovalStatus] = React.useState('');
  const [entryType, setEntryType] = React.useState('');
  const [reimbursableFilter, setReimbursableFilter] = React.useState('');

  // Sorting & pagination
  const [sortBy, setSortBy] = React.useState('date');
  const [sortDir, setSortDir] = React.useState('desc');
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  // Modal state
  const [showForm, setShowForm] = React.useState(false);
  const [showImport, setShowImport] = React.useState(false);

  const [showApprovals, setShowApprovals] = React.useState(false);
  const [editing, setEditing] = React.useState(null);

  // Reference data
  const [categoryOptions, setCategoryOptions] = React.useState([]);
  const [projectOptions, setProjectOptions] = React.useState([]);
  const [mileageExpenses, setMileageExpenses] = React.useState([]);
  const [pendingApprovals, setPendingApprovals] = React.useState([]);
  const [reimbursementRequests, setReimbursementRequests] = React.useState([]);
  const [showReimbursementRequest, setShowReimbursementRequest] = React.useState(false);

  // Views
  const [viewTab, setViewTab] = React.useState('list'); // 'list' | 'reports'


  const loadExpenses = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await supaFetch('expenses?order=date.desc', { method: 'GET' }, user?.company_id);
      const data = res.ok ? await res.json() : [];
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [user?.company_id]);
  // Load reference data (categories, projects)
  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Categories
        const catRes = await supaFetch('expense_categories?order=name.asc', { method: 'GET' }, user?.company_id);
        const cats = catRes.ok ? await catRes.json() : [];
        if (mounted) setCategoryOptions(cats);
      } catch(e){ /* ignore */ }
      try {
        // Use work_orders as projects (no separate projects table exists)
        const wRes = await supaFetch('work_orders?select=id,title&order=created_at.desc&limit=200', { method: 'GET' }, user?.company_id);
        let proj = wRes.ok ? await wRes.json() : [];
        // normalize to match expected format
        proj = proj.map(w => ({ id: w.id, name: w.title || `Work Order ${w.id.slice(0,6)}` }));
        if (mounted) setProjectOptions(proj);
      } catch(e){
        console.warn('Could not load projects/work orders for expenses:', e);
        if (mounted) setProjectOptions([]);
      }
      try {
        // Load reimbursement requests
        const reimRes = await supaFetch('reimbursement_requests?order=created_at.desc', { method: 'GET' }, user?.company_id);
        const requests = reimRes.ok ? await reimRes.json() : [];
        if (mounted) setReimbursementRequests(requests);
      } catch(e){
        console.warn('Could not load reimbursement requests:', e);
        if (mounted) setReimbursementRequests([]);
      }
    })();
    return () => { mounted = false; };
  }, [user?.company_id]);


  React.useEffect(() => {
    let mounted = true;
    (async () => {
      await loadExpenses();
    })();
    return () => { mounted = false; };
  }, [loadExpenses]);
  // Derived data: filtering, sorting, paging
  // Simple confirm using non-blocking modal pattern to satisfy lint rule
  const [confirmState, setConfirmState] = React.useState({ open: false, target: null });
  const askConfirmDelete = (expense) => setConfirmState({ open: true, target: expense });
  const closeConfirm = () => setConfirmState({ open: false, target: null });

  const filtered = React.useMemo(() => {
    return rows.filter(r => {
      const matchesSearch = !search || (r.description?.toLowerCase().includes(search.toLowerCase()) || r.vendor?.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = !category || r.category?.toLowerCase().includes(category.toLowerCase());
      const matchesApprovalStatus = !approvalStatus || r.approval_status === approvalStatus;
      const matchesExpenseType = !entryType || r.entry_type === entryType;
      const matchesReimbursable = !reimbursableFilter || (reimbursableFilter === 'yes' ? r.reimbursable === true : r.reimbursable !== true);
      const d = r.date ? new Date(r.date) : null;
      const afterStart = !startDate || (d && d >= new Date(startDate));
      const beforeEnd = !endDate || (d && d <= new Date(endDate));
      return matchesSearch && matchesCategory && matchesApprovalStatus && matchesExpenseType && matchesReimbursable && afterStart && beforeEnd;
    }).sort((a,b)=>{
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'amount') return dir * (((parseFloat(a.amount)||0) - (parseFloat(b.amount)||0)));
      if (sortBy === 'category') return dir * (String(a.category||'').localeCompare(String(b.category||'')));
      if (sortBy === 'status') return dir * (String(a.approval_status||'').localeCompare(String(b.approval_status||'')));
      // default: date
      return dir * ((new Date(a.date||0)) - (new Date(b.date||0)));
    });
  }, [rows, search, category, approvalStatus, entryType, reimbursableFilter, startDate, endDate, sortBy, sortDir]);

  const paged = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  function renderHeader(key, label, align='left'){
    const active = sortBy === key;
    const nextDir = active && sortDir === 'asc' ? 'desc' : 'asc';
    return (
      <th
        onClick={()=>{setSortBy(key); setSortDir(nextDir);} }
        className={`px-4 py-2 text-${align} text-xs font-medium text-gray-500 uppercase cursor-pointer select-none`}
      >


        <span className="inline-flex items-center gap-1">
          {label}
          {active && (<span className="text-gray-400">{sortDir === 'asc' ? '▲' : '▼'}</span>)}
        </span>
      </th>
    );
  }

  function exportCsv(list){
    const headers = ['date','category','vendor','description','amount'];
    const rowsCsv = list.map(r => [r.date, r.category, r.vendor, (r.description||'').replace(/\n/g,' '), r.amount]);
    const csv = [headers.join(','), ...rowsCsv.map(r=>r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'expenses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleDelete(expense){
    setConfirmState({ open: true, target: expense });
  }

  const monthlyTotal = (() => {
    const now = new Date();
    const ym = rows.filter(r => r.date && new Date(r.date).getMonth() === now.getMonth() && new Date(r.date).getFullYear() === now.getFullYear());
    return ym.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  })();

  const yearlyTotal = (() => {
    const now = new Date();
    const yearly = rows.filter(r => r.date && new Date(r.date).getFullYear() === now.getFullYear());
    return yearly.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  })();

  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Business Expenses"
        subtitle="Track, categorize, and manage all your business expenses with receipt uploads, mileage tracking, and approval workflows"
        icon={CurrencyDollarIcon}
        gradient="red"
        stats={[
          { label: 'This Month', value: monthlyTotal.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) },
          { label: 'Total Expenses', value: rows.length },
          { label: 'Pending Approval', value: rows.filter(r => r.approval_status === 'pending_approval').length },
          { label: 'Categories', value: categoryOptions.length }
        ]}
        actions={[
          {
            label: 'Add Expense',
            icon: PlusIcon,
            onClick: () => setShowForm(true),
            variant: 'primary'
          },
          {
            label: 'Import CSV',
            icon: ArrowDownTrayIcon,
            onClick: () => setShowImport(true)
          }
        ]}
      />

      {/* Expense Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <ModernStatCard
          title="This Month"
          value={monthlyTotal.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
          icon={CurrencyDollarIcon}
          gradient="red"
          onClick={() => setViewTab('reports')}

        />

        <ModernStatCard
          title="Year to Date"
          value={yearlyTotal.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
          icon={ChartBarIcon}
          gradient="orange"
          onClick={() => setViewTab('reports')}
        />

        <ModernStatCard
          title="Total Expenses"
          value={rows.length}
          icon={PencilSquareIcon}
          gradient="blue"
          onClick={() => setViewTab('list')}

        />

        <ModernStatCard
          title="Pending Approval"
          value={rows.filter(r => r.approval_status === 'pending_approval').length}
          icon={ClockIcon}
          gradient="orange"
          onClick={() => setApprovalStatus('pending_approval')}
        />

        <ModernStatCard
          title="Reimbursable"
          value={rows.filter(r => r.reimbursable === true).length}
          icon={BanknotesIcon}
          gradient="green"
          onClick={() => {
            // Filter to show reimbursable expenses
            setReimbursableFilter('yes');
            setSearch('');
            setCategory('');
            setApprovalStatus('');
            setEntryType('');
          }}
        />

        <ModernStatCard
          title="Missing Receipts"
          value={rows.filter(r => !r.receipt_url).length}
          icon={ExclamationTriangleIcon}
          gradient="purple"
          onClick={() => setCategory('missing-receipts')}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-4 border-b border-gray-200">
        <button className={`px-3 py-2 ${viewTab==='list'?'border-b-2 border-blue-600 text-blue-600':'text-gray-600'}`} onClick={()=>setViewTab('list')}>Expenses</button>
        <button className={`px-3 py-2 ${viewTab==='reports'?'border-b-2 border-blue-600 text-blue-600':'text-gray-600'}`} onClick={()=>setViewTab('reports')}>Reports</button>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div className="grid grid-cols-12 gap-4 w-full md:flex-1">
          <div className="col-span-12 lg:col-span-6 xl:col-span-4 min-w-[320px]">
            <label className="block text-sm text-gray-600 mb-1">Search</label>
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search description/vendor" className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="col-span-6 md:col-span-4 xl:col-span-2 min-w-[260px]">
            <label className="block text-sm text-gray-600 mb-1">Category</label>
            <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
              <option value="">All Categories</option>
              {categoryOptions.map(c => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-6 md:col-span-4 xl:col-span-2 min-w-[260px]">
            <label className="block text-sm text-gray-600 mb-1">Approval Status</label>
            <select value={approvalStatus} onChange={(e)=>setApprovalStatus(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="col-span-6 md:col-span-4 xl:col-span-2 min-w-[260px]">
            <label className="block text-sm text-gray-600 mb-1">Expense Type</label>
            <select value={entryType} onChange={(e)=>setEntryType(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
              <option value="">All Types</option>
              <option value="receipt">Receipt</option>
              <option value="mileage">Mileage</option>
              <option value="per_diem">Per Diem</option>
              <option value="corporate_card">Corporate Card</option>
            </select>
          </div>
          <div className="col-span-6 md:col-span-4 xl:col-span-2 min-w-[220px]">
            <label className="block text-sm text-gray-600 mb-1">Reimbursable</label>
            <select value={reimbursableFilter} onChange={(e)=>setReimbursableFilter(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
              <option value="">All</option>
              <option value="yes">Reimbursable</option>
              <option value="no">Not Reimbursable</option>
            </select>
          </div>
          <div className="col-span-6 md:col-span-4 xl:col-span-2 min-w-[240px]">
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="col-span-6 md:col-span-4 xl:col-span-2 min-w-[240px]">
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            <PlusIcon className="w-4 h-4" />
            Add Expense
          </button>
          <button onClick={()=>setShowImport(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            <ArrowDownTrayIcon className="w-4 h-4 rotate-180" />
            Import CSV
          </button>
          <button onClick={()=>exportCsv(filtered)} className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Content - Conditional Rendering */}
      {viewTab === 'list' && (
        <>
          {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
            <div className="text-sm text-gray-500">
              {filtered.length} results
            </div>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h4>
              <p className="text-sm text-gray-500 mb-4">Start tracking your business expenses to see them here.</p>
              <button onClick={()=>setShowForm(true)} className="btn-primary">Add First Expense</button>

            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    {renderHeader('date','Date')}
                    {renderHeader('category','Category')}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    {renderHeader('amount','Amount','right')}
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Reimbursable</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paged.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{r.date ? new Date(r.date).toLocaleDateString() : '--'}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{r.category || '--'}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{r.description || '--'}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{r.vendor || '--'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{(parseFloat(r.amount)||0).toLocaleString(undefined,{style:'currency',currency:'USD'})}</td>
                      <td className="px-4 py-2 text-center">
                        {r.reimbursable ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            <BanknotesIcon className="w-3 h-3 mr-1" />
                            Yes
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={()=>{setEditing(r);setShowForm(true);}} className="text-blue-600 hover:text-blue-800 mr-3 inline-flex items-center gap-1 text-sm"><PencilSquareIcon className="w-4 h-4"/>Edit</button>
                        <button onClick={()=>handleDelete(r)} className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 text-sm"><TrashIcon className="w-4 h-4"/>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <div>Page {page} of {Math.max(1, Math.ceil(filtered.length / pageSize))}</div>
                <div className="flex items-center gap-2">
      {/* Confirm Delete Modal */}
      {confirmState.open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Delete expense?</h3>
            <p className="text-sm text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={closeConfirm} className="px-4 py-2 border rounded-md">Cancel</button>
              <button
                onClick={async ()=>{
                  const target = confirmState.target;
                  closeConfirm();
                  await supaFetch(`expenses?id=eq.${target.id}`, { method: 'DELETE' }, user?.company_id);
                  await loadExpenses();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

                  <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                  <button disabled={page>=Math.ceil(filtered.length/pageSize)} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* Reports View */}
      {viewTab === 'reports' && (
        <ReportsView rows={rows} />
      )}

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseFormModal
          onClose={()=>{setShowForm(false);setEditing(null);}}
          onSaved={()=>{setShowForm(false);setEditing(null);loadExpenses();}}
          expense={editing}
          companyId={user?.company_id}
          categoryOptions={categoryOptions}
          projectOptions={projectOptions}
        />
      )}

      {showImport && (
        <CsvImportModal
          onClose={()=>setShowImport(false)}
          onImported={()=>{setShowImport(false);loadExpenses();}}
          companyId={user?.company_id}
          existingExpenses={rows}
        />
      )}


    </div>
  );
};



function ReportsView({ rows }){
  const byCategory = React.useMemo(() => {
    const map = new Map();
    rows.forEach(r => {
      const k = r.category || 'Uncategorized';
      const amt = parseFloat(r.amount)||0;
      map.set(k, (map.get(k)||0) + amt);
    });
    return Array.from(map.entries()).sort((a,b)=>b[1]-a[1]);
  }, [rows]);

  const byMonth = React.useMemo(() => {
    const map = new Map();
    rows.forEach(r => {
      const d = r.date ? new Date(r.date) : null;
      if (!d) return;
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const amt = parseFloat(r.amount)||0;
      map.set(key, (map.get(key)||0) + amt);
    });
    return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
  }, [rows]);

  const exportReport = () => {
    const lines = ['Report Section,Key,Amount'];
    byCategory.forEach(([k,v]) => lines.push(`Category,${k},${v}`));
    byMonth.forEach(([k,v]) => lines.push(`Month,${k},${v}`));
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download','expenses_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Reports</h3>
        <button onClick={exportReport} className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">Export</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-2">By Category</h4>
          <div className="border rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {byCategory.map(([k,v]) => (
                  <tr key={k}>
                    <td className="px-4 py-2 text-sm">{k}</td>
                    <td className="px-4 py-2 text-sm text-right">{v.toLocaleString(undefined,{style:'currency',currency:'USD'})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">By Month</h4>
          <div className="border rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {byMonth.map(([k,v]) => (
                  <tr key={k}>
                    <td className="px-4 py-2 text-sm">{k}</td>
                    <td className="px-4 py-2 text-sm text-right">{v.toLocaleString(undefined,{style:'currency',currency:'USD'})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpenseFormModal({ onClose, onSaved, expense, companyId, categoryOptions = [], projectOptions = [] }){
  const [form, setForm] = React.useState({
    date: expense?.date || new Date().toISOString().slice(0,10),
    entry_type: expense?.entry_type || 'receipt',
    expense_type: expense?.expense_type || 'other',
    category: expense?.category || '',
    vendor: expense?.vendor || '',
    description: expense?.description || '',
    amount: expense?.amount || '',
    tax_amount: expense?.tax_amount || '',
    is_billable: expense?.is_billable || false,
    reimbursable: expense?.reimbursable || false,
    receipt_url: expense?.receipt_url || '',
    project_id: expense?.project_id || '',
    approval_status: expense?.approval_status || 'draft',
    // Mileage fields
    trip_category: expense?.trip_category || '',
    odometer_start: expense?.odometer_start || '',
    odometer_end: expense?.odometer_end || '',
    business_purpose: expense?.business_purpose || ''
  });
  const fileInputRef = React.useRef(null);

  const [saving, setSaving] = React.useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        date: form.date || null,
        entry_type: form.entry_type || 'receipt',
        expense_type: form.expense_type || 'other',
        category: form.category || null,
        vendor: form.vendor || null,
        description: form.description || 'Expense',
        amount: form.amount ? parseFloat(form.amount) : 0,
        tax_amount: form.tax_amount ? parseFloat(form.tax_amount) : 0,
        is_billable: !!form.is_billable,
        reimbursable: !!form.reimbursable,
        receipt_url: form.receipt_url || null,
        project_id: form.project_id || null,
        approval_status: form.approval_status || 'draft',
        trip_category: form.trip_category || null,
        odometer_start: form.odometer_start ? parseInt(form.odometer_start) : null,
        odometer_end: form.odometer_end ? parseInt(form.odometer_end) : null,
        business_purpose: form.business_purpose || null,
        company_id: companyId
      };
      if (expense?.id) {
        const res = await supaFetch(`expenses?id=eq.${expense.id}`, { method: 'PATCH', body: payload }, companyId);
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Failed to update expense: ${err}`);
        }
      } else {
        const res = await supaFetch('expenses', { method: 'POST', body: payload }, companyId);
        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Failed to create expense: ${err}`);
        }
      }
      onSaved?.();
    } catch (err) {
      console.error('Error saving expense:', err);
      alert(err.message || 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };
  const saveAndSubmit = async () => {
    setSaving(true);
    try {
      const basePayload = {
        date: form.date || null,
        entry_type: form.entry_type || 'receipt',
        expense_type: form.expense_type || 'other',
        category: form.category || null,
        vendor: form.vendor || null,
        description: form.description || 'Expense',
        amount: form.amount ? parseFloat(form.amount) : 0,
        tax_amount: form.tax_amount ? parseFloat(form.tax_amount) : 0,
        is_billable: !!form.is_billable,
        reimbursable: !!form.reimbursable,
        receipt_url: form.receipt_url || null,
        project_id: form.project_id || null,
        trip_category: form.trip_category || null,
        odometer_start: form.odometer_start ? parseInt(form.odometer_start) : null,
        odometer_end: form.odometer_end ? parseInt(form.odometer_end) : null,
        business_purpose: form.business_purpose || null,
        company_id: companyId,
        approval_status: 'submitted'
      };

      let expenseId = expense?.id;
      if (expenseId) {
        const res = await supaFetch(`expenses?id=eq.${expenseId}`, { method: 'PATCH', body: basePayload }, companyId);
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await supaFetch('expenses', { method: 'POST', body: basePayload }, companyId);
        if (!res.ok) throw new Error(await res.text());
        const created = await res.json();
        expenseId = created?.[0]?.id;
      }

      if (expenseId) {
        // create initial approval routed to direct supervisor via RPC
        const res = await supaFetch('rpc/create_initial_expense_approval', {
          method: 'POST',
          body: { p_expense_id: expenseId }
        }, companyId);
        if (!res.ok) throw new Error(await res.text());
      }

      onSaved?.();
    } catch (err) {
      console.error('Save & Submit failed:', err);
      alert(err.message || 'Failed to submit expense');
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white">
          <h3 className="text-lg font-semibold">{expense ? 'Edit Expense' : 'Add Expense'}</h3>
          <button className="text-gray-500" onClick={onClose} disabled={saving}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date *</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full border rounded-md px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Expense Type *</label>
              <select name="entry_type" value={form.entry_type} onChange={handleChange} className="w-full border rounded-md px-3 py-2" required>
                <option value="receipt">Receipt</option>
                <option value="mileage">Mileage</option>
                <option value="per_diem">Per Diem</option>
                <option value="corporate_card">Corporate Card</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
                <option value="">Select category</option>
                {categoryOptions.map(c => (
                  <option key={c.id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Vendor</label>
              <input name="vendor" value={form.vendor} onChange={handleChange} placeholder="e.g., Home Depot" className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Amount *</label>
              <input type="number" step="0.01" name="amount" value={form.amount} onChange={handleChange} className="w-full border rounded-md px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tax</label>
              <input type="number" step="0.01" name="tax_amount" value={form.tax_amount} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Project</label>
              <select name="project_id" value={form.project_id} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
                <option value="">None</option>
                {projectOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Receipt URL</label>
                  <input name="receipt_url" value={form.receipt_url} onChange={handleChange} placeholder="https://..." className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1 invisible">Upload</label>
                  <button type="button" className="px-3 py-2 border rounded-md" disabled={saving} onClick={()=>fileInputRef.current?.click()}>
                    {saving ? 'Uploading...' : 'Upload'}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={async (e)=>{
                    const file = e.target.files?.[0]; if (!file) return;
                    const v = DocumentService.validateFile(file, 15); if (!v.valid) { alert(v.message); return; }
                    setSaving(true);
                    try {
                      // Ensure we have an expense id to link; if creating new, create then upload then patch
                      let currentId = expense?.id;
                      if (!currentId) {
                        // Create minimal expense to obtain id
                        const payload = {
                          date: form.date || new Date().toISOString().slice(0,10),
                          entry_type: form.entry_type || 'receipt',
                          expense_type: form.expense_type || 'other',
                          category: form.category || null,
                          vendor: form.vendor || null,
                          description: form.description || 'Expense',
                          amount: form.amount ? parseFloat(form.amount) : 0,
                          tax_amount: form.tax_amount ? parseFloat(form.tax_amount) : 0,
                          is_billable: !!form.is_billable,
                          reimbursable: !!form.reimbursable,
                          project_id: form.project_id || null,
                          approval_status: 'draft',
                          company_id: companyId
                        };
                        const res = await supaFetch('expenses', { method: 'POST', body: payload }, companyId);
                        if (!res.ok) {
                          const errText = await res.text();
                          console.error('Failed to create expense:', errText);
                          throw new Error(`Failed to create expense before upload: ${errText}`);
                        }
                        const created = await res.json();
                        if (!created[0]?.id) throw new Error('Failed to create expense before upload - no ID returned');
                        currentId = created[0].id;
                      }
                      // Upload to storage
                      const result = await DocumentService.uploadFile(companyId, file, currentId, 'expenses', null);
                      if (!result.success) throw new Error(result.message || 'Upload failed');
                      const url = result.document?.file_url;
                      // Save receipt_url on expense
                      await supaFetch(`expenses?id=eq.${currentId}`, { method: 'PATCH', body: { receipt_url: url } }, companyId);
                      setForm(prev => ({ ...prev, receipt_url: url }));
                      alert('Receipt uploaded successfully!');
                    } catch(err){
                      console.error('Receipt upload error:', err);
                      alert(err.message || 'Upload failed');
                    } finally {
                      setSaving(false);
                      e.target.value = '';
                    }
                  }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 sm:col-span-2">
              <div className="flex items-center gap-2">
                <input id="is_billable" type="checkbox" name="is_billable" checked={form.is_billable} onChange={handleChange} />
                <label htmlFor="is_billable" className="text-sm text-gray-700">Billable</label>
              </div>
              <div className="flex items-center gap-2">
                <input id="reimbursable" type="checkbox" name="reimbursable" checked={form.reimbursable} onChange={handleChange} />
                <label htmlFor="reimbursable" className="text-sm text-gray-700">Reimbursable</label>
              </div>
            </div>
          </div>

          {/* Mileage Fields - Show when entry_type is Mileage */}
          {form.entry_type === 'mileage' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Trip Category</label>
                <select name="trip_category" value={form.trip_category} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
                  <option value="">Select trip type</option>
                  <option value="CLIENT_VISIT">Client Visit</option>
                  <option value="BUSINESS_TRAVEL">Business Travel</option>
                  <option value="DELIVERY">Delivery</option>
                  <option value="SITE_VISIT">Site Visit</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Business Purpose</label>
                <input name="business_purpose" value={form.business_purpose} onChange={handleChange} placeholder="e.g., Client meeting, site inspection" className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Odometer Start</label>
                <input name="odometer_start" type="number" value={form.odometer_start} onChange={handleChange} placeholder="Starting mileage" className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Odometer End</label>
                <input name="odometer_end" type="number" value={form.odometer_end} onChange={handleChange} placeholder="Ending mileage" className="w-full border rounded-md px-3 py-2" />
              </div>
              {form.odometer_start && form.odometer_end && (
                <div className="sm:col-span-2 p-3 bg-white rounded border">
                  <p className="text-sm text-gray-600">
                    <strong>Miles Driven:</strong> {parseInt(form.odometer_end) - parseInt(form.odometer_start)} miles
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Estimated Amount:</strong> ${((parseInt(form.odometer_end) - parseInt(form.odometer_start)) * 0.655).toFixed(2)} (at $0.655/mile)
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border rounded-md px-3 py-2" />
          </div>

          <div className="flex items-center justify-end gap-2 sticky bottom-0 bg-white pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button type="button" onClick={saveAndSubmit} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Submitting...' : 'Save & Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CsvImportModal({ onClose, onImported, companyId, existingExpenses }){
  const [step, setStep] = React.useState(1); // 1=upload, 2=map, 3=preview
  const [csvData, setCsvData] = React.useState([]);
  const [headers, setHeaders] = React.useState([]);
  const [mapping, setMapping] = React.useState({});
  const [importing, setImporting] = React.useState(false);
  const [duplicates, setDuplicates] = React.useState([]);

  const fileInputRef = React.useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        alert('CSV must have at least a header row and one data row');
        return;
      }

      const csvHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const csvRows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        csvHeaders.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        return row;
      });

      setHeaders(csvHeaders);
      setCsvData(csvRows);
      setStep(2);

      // Auto-map common columns
      const autoMapping = {};
      csvHeaders.forEach(header => {
        const lower = header.toLowerCase();
        if (lower.includes('date')) autoMapping.date = header;
        if (lower.includes('amount') || lower.includes('total')) autoMapping.amount = header;
        if (lower.includes('description') || lower.includes('memo')) autoMapping.description = header;
        if (lower.includes('vendor') || lower.includes('payee')) autoMapping.vendor = header;
        if (lower.includes('category')) autoMapping.category = header;
      });
      setMapping(autoMapping);
    };
    reader.readAsText(file);
  };

  const handlePreview = () => {
    // Detect duplicates
    const dupes = [];
    csvData.forEach((row, i) => {
      const amount = parseFloat(row[mapping.amount] || 0);
      const date = row[mapping.date];
      const vendor = row[mapping.vendor] || '';

      // Check against existing expenses
      const existing = existingExpenses.find(e =>
        Math.abs((parseFloat(e.amount) || 0) - amount) < 0.01 &&
        e.date === date &&
        (e.vendor || '').toLowerCase() === vendor.toLowerCase()
      );

      if (existing) {
        dupes.push({ csvIndex: i, existing, csvRow: row });
      }
    });

    setDuplicates(dupes);
    setStep(3);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const toImport = csvData.filter((_, i) => !duplicates.some(d => d.csvIndex === i));

      for (const row of toImport) {
        const payload = {
          date: row[mapping.date] || null,
          amount: parseFloat(row[mapping.amount] || 0) || null,
          description: row[mapping.description] || null,
          vendor: row[mapping.vendor] || null,
          category: row[mapping.category] || null,
          company_id: companyId
        };

        await supaFetch('expenses', { method: 'POST', body: payload }, companyId);
      }

      alert(`Imported ${toImport.length} expenses (${duplicates.length} duplicates skipped)`);
      onImported?.();
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Import Expenses from CSV</h3>
          <button className="text-gray-500" onClick={onClose} disabled={importing}>✕</button>
        </div>

        {step === 1 && (
          <div className="text-center py-8">
            <div className="mb-4">
              <ArrowDownTrayIcon className="w-12 h-12 text-gray-400 mx-auto mb-2 rotate-180" />
              <h4 className="text-lg font-medium mb-2">Upload CSV File</h4>
              <p className="text-sm text-gray-600 mb-4">
                Upload a CSV file with columns like Date, Amount, Description, Vendor, Category
              </p>
            </div>
            <button onClick={()=>fileInputRef.current?.click()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Choose File
            </button>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </div>
        )}

        {step === 2 && (
          <div>
            <h4 className="font-medium mb-4">Map CSV Columns to Expense Fields</h4>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {['date', 'amount', 'description', 'vendor', 'category'].map(field => (
                <div key={field}>
                  <label className="block text-sm text-gray-600 mb-1 capitalize">{field} {field === 'date' || field === 'amount' ? '*' : ''}</label>
                  <select value={mapping[field] || ''} onChange={(e)=>setMapping(prev=>({...prev,[field]:e.target.value}))} className="w-full border rounded-md px-3 py-2">
                    <option value="">-- Skip --</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={()=>setStep(1)} className="px-4 py-2 border rounded-md">Back</button>
              <button onClick={handlePreview} disabled={!mapping.date || !mapping.amount} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                Preview Import
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h4 className="font-medium mb-4">Preview & Import ({csvData.length - duplicates.length} new, {duplicates.length} duplicates)</h4>

            {duplicates.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>{duplicates.length} potential duplicates</strong> found (same amount, date, vendor). These will be skipped.
                </p>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto border rounded-md mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {csvData.slice(0, 10).map((row, i) => {
                    const isDupe = duplicates.some(d => d.csvIndex === i);
                    return (
                      <tr key={i} className={isDupe ? 'bg-yellow-50' : ''}>
                        <td className="px-3 py-2 text-sm">{row[mapping.date] || '--'}</td>
                        <td className="px-3 py-2 text-sm">${parseFloat(row[mapping.amount] || 0).toFixed(2)}</td>
                        <td className="px-3 py-2 text-sm">{row[mapping.description] || '--'}</td>
                        <td className="px-3 py-2 text-sm">{row[mapping.vendor] || '--'}</td>
                        <td className="px-3 py-2 text-sm">{isDupe ? '⚠️ Duplicate' : '✅ New'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {csvData.length > 10 && (
                <div className="p-2 text-center text-sm text-gray-500">... and {csvData.length - 10} more rows</div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button onClick={()=>setStep(2)} className="px-4 py-2 border rounded-md">Back</button>
              <button onClick={handleImport} disabled={importing || csvData.length === duplicates.length} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
                {importing ? 'Importing...' : `Import ${csvData.length - duplicates.length} Expenses`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Expenses;
