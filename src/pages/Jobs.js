import React, { useState, useEffect, useRef, useMemo } from 'react';
import { InvoicesService } from '../services/InvoicesService';

import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/Common/PageHeader';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import ModernCard from '../components/Common/ModernCard';
import '../styles/modern-enhancements.css';
import JobsDatabasePanel from '../components/JobsDatabasePanel';
import { JobsStats, JobsStatsClickable, JobsFiltersBar, JobsUtilization, JobsTable, Alert } from '../components/JobsUI';
import { JobForm } from '../components/JobsForms';
import { JobBuilder } from '../components/JobBuilder';
import SmartSchedulingAssistant from '../components/SmartSchedulingAssistant';
import JobAllocationModal from '../components/Inventory/JobAllocationModal';
import UsageConfirmationModal from '../components/Inventory/UsageConfirmationModal';
import RecurringJobs from '../components/RecurringJobs';
import CancellationModal from '../components/CancellationModal';
import ReschedulingModal from '../components/ReschedulingModal';
import CompletionPromptModal from '../components/CompletionPromptModal';
import ExtendJobModal from '../components/ExtendJobModal';
import OnHoldModal from '../components/OnHoldModal';
import CloseoutDataModal from '../components/CloseoutDataModal';
import PartialInvoiceModal from '../components/PartialInvoiceModal';
import settingsService from '../services/SettingsService';

// ✅ PHASE 3B: Import new job modals
import StartJobModal from '../components/StartJobModal';
import ResumeJobModal from '../components/ResumeJobModal';
// ✅ FIX #2: Import completion modal
import CompletionModal from '../components/CompletionModal';
// ✅ FIX #3: Import invoice creation modal
import InvoiceCreationModal from '../components/InvoiceCreationModal';

import {
  PlusIcon,
  SparklesIcon,
  CalendarIcon,
  BriefcaseIcon,
  ClockIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { supaFetch } from '../utils/supaFetch';
import { useUser } from '../contexts/UserContext';

const Jobs = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [showSmartAssistant, setShowSmartAssistant] = useState(false);
  const [selectedJobForScheduling, setSelectedJobForScheduling] = useState(null);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedJobForInventory, setSelectedJobForInventory] = useState(null);
  const [showRecurringJobs, setShowRecurringJobs] = useState(false);
  const processedParams = useRef(new Set()); // Track processed URL parameters
  const {
    jobs,
    customers,
    employees,
    loading,
    showCreateForm,
    showEditForm,
    searchTerm,
    statusFilter,
    alert,
    formData,
    setSearchTerm,
    setStatusFilter,
    setShowCreateForm,
    setShowEditForm,
    setFormData,
    createJob,
    updateJob,
    deleteJob,
    openEditForm,
    resetForm,
    createInvoiceFromJob,
    // ✅ Cancellation modal
    showCancellationModal,
    setShowCancellationModal,
    jobToCancel,
    handleCancellationConfirm,
    // ✅ Rescheduling modal
    showReschedulingModal,
    setShowReschedulingModal,
    jobToReschedule,
    handleReschedulingConfirm,
    handleRescheduleNow,
    // ✅ PHASE 2: Completion prompt modal
    showCompletionPrompt,
    setShowCompletionPrompt,
    jobToComplete,
    handleCompletionCreateInvoice,
    handleCompletionMarkComplete,
    handleCompletionExtendJob,
    // ✅ PHASE 2: Extend job modal
    showExtendJobModal,
    setShowExtendJobModal,
    jobToExtend,
    handleExtendJobConfirm,
    // ✅ PHASE 2B: On-hold modal
    showOnHoldModal,
    setShowOnHoldModal,
    jobToHold,
    handleOnHoldConfirm,
    // ✅ PHASE 3B: Start job modal
    showStartJobModal,
    setShowStartJobModal,
    jobToStart,
    handleStartJobConfirm,
    // ✅ PHASE 3B: Resume job modal
    showResumeJobModal,
    setShowResumeJobModal,
    jobToResume,
    handleResumeJobConfirm,
    // ✅ FIX #2: Completion modal
    showCompletionModal,
    setShowCompletionModal,
    handleCompletionConfirm,
    // ✅ FIX #3: Invoice creation modal
    showInvoiceCreationModal,
    setShowInvoiceCreationModal,
    jobToInvoice,
    handleInvoiceCreationConfirm
  } = JobsDatabasePanel();

  // Phase 2: Closeout data modal
  const [showCloseoutModal, setShowCloseoutModal] = useState(false);
  const [closeoutWorkOrderId, setCloseoutWorkOrderId] = useState(null);

  // Phase 3: Partial invoice modal
  const [showPartialInvoiceModal, setShowPartialInvoiceModal] = useState(false);
  const [partialCtx, setPartialCtx] = useState(null);


  // Saved Views (Jobs)
  const savedDropdownRef = useRef(null);
  const storageKey = useMemo(() => `jobs_saved_views_${user?.company_id || 'guest'}`,[user?.company_id]);
  const lastViewKey = useMemo(() => `jobs_last_view_${user?.company_id || 'guest'}`,[user?.company_id]);
  const [savedViews, setSavedViews] = useState([]);
  const [showManageViews, setShowManageViews] = useState(false);
  const [selectedViewName, setSelectedViewName] = useState('');
  const loadSavedViews = useMemo(() => () => {
    try { const v = JSON.parse(localStorage.getItem(storageKey) || '[]'); setSavedViews(Array.isArray(v)?v:[]); } catch { setSavedViews([]); }
  }, [storageKey]);
  useEffect(() => { loadSavedViews(); }, [loadSavedViews]);
  useEffect(() => {
    const onKey = (e) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      const isEditing = ['input','textarea','select'].includes(tag) || document.activeElement?.isContentEditable;
      if (isEditing) return;
      const k = e.key?.toLowerCase();
      if (e.shiftKey && k==='v') { e.preventDefault(); setShowManageViews(true); }
      if (e.altKey && k==='v') { e.preventDefault(); savedDropdownRef.current?.focus(); }
      if (e.shiftKey && k==='s') { e.preventDefault(); quickSaveCurrentView(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const saveViewsToStorage = (views) => { localStorage.setItem(storageKey, JSON.stringify(views)); };
  const applyView = (view) => {
    if (!view) return;
    setSearchTerm(view.searchTerm||'');
    setStatusFilter(view.statusFilter||'all');
    setTechFilter(view.techFilter||'all');
    setDatePreset(view.datePreset||'WEEK');
    try { localStorage.setItem(lastViewKey, view.name); } catch {}
    window?.toast?.success?.('View applied');
  };
  const quickSaveCurrentView = () => {
    const base='View'; let i=1; const names = new Set(savedViews.map(v=>v.name)); while(names.has(base+' '+i)) i++;
    const newView = { name: base+' '+i, searchTerm, statusFilter, techFilter, datePreset };
    const next = [...savedViews, newView]; setSavedViews(next); saveViewsToStorage(next); setSelectedViewName(newView.name);
    try { localStorage.setItem(lastViewKey, newView.name); } catch {}
    window?.toast?.success?.('View saved');
  };
  const renameView = (oldName, newName) => {
    if (!newName || savedViews.some(v=>v.name===newName)) return false;
    const next = savedViews.map(v=> v.name===oldName ? { ...v, name:newName } : v);
    setSavedViews(next); saveViewsToStorage(next); setSelectedViewName(newName);
    try { if (localStorage.getItem(lastViewKey)===oldName) localStorage.setItem(lastViewKey, newName);} catch {}
    window?.toast?.success?.('View renamed');
    return true;
  };
  const deleteView = (name) => {
    const next = savedViews.filter(v=>v.name!==name); setSavedViews(next); saveViewsToStorage(next);
    try { if (localStorage.getItem(lastViewKey)===name) localStorage.removeItem(lastViewKey);} catch {}
    if (selectedViewName===name) setSelectedViewName('');
    window?.toast?.success?.('View deleted');
  };
  useEffect(() => {
    try { const last = localStorage.getItem(lastViewKey); if (!last) return; const v = savedViews.find(s=>s.name===last); if (v) { setSelectedViewName(last); applyView(v); } } catch {}
  }, [lastViewKey, savedViews]);
  // Close Manage Views with Escape
  useEffect(() => {
    if (!showManageViews) return;
    const onEsc = (e) => { if (e.key === 'Escape') setShowManageViews(false); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [showManageViews]);

  // Handle URL parameters for new job creation, scheduling, and editing
  // Filters state (top-level)
  const [datePreset, setDatePreset] = useState(() => localStorage.getItem('jobs_date_preset') || 'WEEK');
  const [techFilter, setTechFilter] = useState(() => new URLSearchParams(location.search).get('tech') || 'all');

  // Sync status filter with URL on mount
  useEffect(() => {
    const urlFilter = new URLSearchParams(location.search).get('filter');
    if (urlFilter) setStatusFilter(urlFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL param in sync when statusFilter changes
  useEffect(() => {
    const cur = new URLSearchParams(location.search).get('filter') || 'all';
    if (statusFilter !== cur) {
      const next = new URLSearchParams(location.search);
      if (statusFilter === 'all') next.delete('filter'); else next.set('filter', statusFilter);
      setSearchParams(next, { replace: true });
    }
    localStorage.setItem('jobs_filter', statusFilter);
  }, [statusFilter, location.search, setSearchParams]);

  // Persist date preset
  useEffect(() => { localStorage.setItem('jobs_date_preset', datePreset); }, [datePreset]);

  // Keep tech in URL
  useEffect(() => {
    const cur = new URLSearchParams(location.search).get('tech') || 'all';
    if (techFilter !== cur) {
      const next = new URLSearchParams(location.search);
      if (techFilter === 'all') next.delete('tech'); else next.set('tech', techFilter);
      setSearchParams(next, { replace: true });
    }
  }, [techFilter, location.search, setSearchParams]);

  // ✅ Handle React Router state (passed from Quotes page)
  useEffect(() => {
    if (location.state?.openScheduler) {
      const openWithJob = async (job) => {
        try {
          // Load line items for duration calculation
          const itemsResponse = await supaFetch(`work_order_line_items?work_order_id=eq.${job.id}`, { method: 'GET' }, user?.company_id);
          if (itemsResponse?.ok) {
            const items = await itemsResponse.json();
            job.work_order_items = items; // Keep as work_order_items for SmartSchedulingAssistant compatibility
          }
        } catch (e) {
          console.warn('Unable to load work order items for scheduler:', e?.message || e);
        }
        setSelectedJobForScheduling(job);
        setShowSmartAssistant(true);
        // Clear the state to prevent reopening on refresh
        navigate(location.pathname, { replace: true, state: {} });
      };

      if (location.state.jobData) {
        console.log('🚀 Opening scheduler from React Router state (jobData)');
        openWithJob(location.state.jobData);
      } else if (location.state.jobId) {
        console.log('🚀 Opening scheduler from React Router state (jobId):', location.state.jobId);
        (async () => {
          let job = jobs.find(j => j.id === location.state.jobId);
          if (!job) {
            try {
              const resp = await supaFetch(`work_orders?id=eq.${location.state.jobId}&select=*&limit=1`, { method: 'GET' }, user?.company_id);
              if (resp?.ok) {
                const arr = await resp.json();
                job = arr?.[0] || null;
              }
            } catch (e) {
              console.error('Failed to fetch work order by id:', e);
            }
          }
          if (job) {
            openWithJob(job);
          } else {
            console.error('Work order not found for scheduler state id:', location.state.jobId);
            // Clear state to avoid repeated attempts
            navigate(location.pathname, { replace: true, state: {} });
          }
        })();
      }
    }
  }, [location.state, navigate, location.pathname]);

  // ✅ Handle "Reschedule Now" from ReschedulingModal
  useEffect(() => {
    const jobIdToSchedule = sessionStorage.getItem('openSmartSchedulingFor');
    if (jobIdToSchedule) {
      // Find the job in the jobs list
      const job = jobs.find(j => String(j.id) === String(jobIdToSchedule));
      if (job) {
        console.log('🚀 Opening Smart Scheduling Assistant for rescheduled job:', job);
        setSelectedJobForScheduling(job);
        setShowSmartAssistant(true);
      }
      // Clear the flag
      sessionStorage.removeItem('openSmartSchedulingFor');
    }
  }, [jobs]); // Re-run when jobs list updates

  // Open Smart Scheduler immediately after closing edit form if a schedule flag is set
  useEffect(() => {
    const jobIdToSchedule = sessionStorage.getItem('openSmartSchedulingFor');
    if (jobIdToSchedule && !showSmartAssistant && !showEditForm) {
      let job = jobs.find(j => String(j.id) === String(jobIdToSchedule));
      const openWithJob = async () => {
        if (!job) {
          try {
            const resp = await supaFetch(`work_orders?id=eq.${jobIdToSchedule}&select=*&limit=1`, { method: 'GET' }, user?.company_id);
            if (resp?.ok) {
              const arr = await resp.json();
              job = arr?.[0] || null;
            }
          } catch (e) {
            console.error('Failed to fetch work order by id for scheduling (post-edit):', e);
          }
        }
        if (job) {
          try {
            const itemsResponse = await supaFetch(`work_order_line_items?work_order_id=eq.${job.id}`, { method: 'GET' }, user?.company_id);
            if (itemsResponse?.ok) {
              const items = await itemsResponse.json();
              job.work_order_items = items;
            }
          } catch {}
          setSelectedJobForScheduling(job);
          setShowSmartAssistant(true);
        }
        sessionStorage.removeItem('openSmartSchedulingFor');
      };
      openWithJob();
    }
  }, [showEditForm, showSmartAssistant, jobs]);


  // ✅ INDUSTRY STANDARD: Handle ?filter=unscheduled URL parameter from Quotes page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    if (filterParam === 'unscheduled') {
      console.log('🔍 Setting filter to unscheduled from URL parameter');
      setStatusFilter('unscheduled');
      // Remove the filter param to clean up URL
      params.delete('filter');
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  }, [location.search, navigate, location.pathname, setStatusFilter]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isNewJob = params.get('new') === 'job';
    const shouldSchedule = params.get('schedule') === 'new';
    const editJobId = params.get('edit');
    const currentSearch = location.search;

    // Skip if we've already processed these parameters
    if (processedParams.current.has(currentSearch)) {
      return;
    }

    // Handle new job creation
    if (isNewJob && !showCreateForm) {
      setShowCreateForm(true);
      processedParams.current.add(currentSearch);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    // Handle scheduling (prefill with job from ?edit=ID if provided)
    if (shouldSchedule && !showSmartAssistant) {
      if (editJobId) {
        (async () => {
          // Try to find in already-loaded jobs
          let jobToSchedule = jobs.find(job => job.id === editJobId);

          // If not found, fetch directly by ID to avoid race conditions
          if (!jobToSchedule) {
            try {
              const resp = await supaFetch(`work_orders?id=eq.${editJobId}&select=*&limit=1`, { method: 'GET' }, user?.company_id);
              if (resp?.ok) {
                const arr = await resp.json();
                jobToSchedule = arr?.[0] || null;
              }
            } catch (e) {
              console.error('Failed to fetch work order by id for scheduling:', e);
            }
          }

          if (jobToSchedule) {
            try {
              const itemsResponse = await supaFetch(`work_order_line_items?work_order_id=eq.${jobToSchedule.id}`, { method: 'GET' }, user?.company_id);
              if (itemsResponse?.ok) {
                const items = await itemsResponse.json();
                jobToSchedule.work_order_items = items; // Keep as work_order_items for SmartSchedulingAssistant compatibility
              }
            } catch (error) {
              console.warn('Could not load work order items for scheduling:', error?.message || error);
            }

            setSelectedJobForScheduling(jobToSchedule);
            setShowSmartAssistant(true);
            processedParams.current.add(currentSearch);
            window.history.replaceState({}, '', window.location.pathname);
          } else {
            console.error('Work order not found for scheduling id:', editJobId);
            processedParams.current.add(currentSearch);
            window.history.replaceState({}, '', window.location.pathname);
          }
        })();
      } else {
        // No specific job - open assistant without prefill
        setShowSmartAssistant(true);
        processedParams.current.add(currentSearch);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }


    // Handle edit job - wait for jobs to load and don't clear URL until form opens
    if (editJobId && !showEditForm && !shouldSchedule) {
      if (jobs.length > 0) {
        const jobToEdit = jobs.find(job => job.id === editJobId);
        if (jobToEdit) {
          console.log('Opening edit form for job:', jobToEdit);
          openEditForm(jobToEdit);
          // Only clear URL after successfully opening form
          processedParams.current.add(currentSearch);
          window.history.replaceState({}, '', window.location.pathname);
        } else {
          console.log('Job not found:', editJobId);
          // Clear URL if job not found
          processedParams.current.add(currentSearch);
          window.history.replaceState({}, '', window.location.pathname);
        }
      } else {
        console.log('Waiting for jobs to load...');
        // Don't mark as processed yet, let it try again when jobs load
      }
    }
  }, [location.search, jobs, showCreateForm, showEditForm, showSmartAssistant, openEditForm]);

  // Derived jobs for display: search + status + tech; sorted by scheduled_start then created_at
  const filteredJobs = (jobs || [])
    .filter(j => {
      const term = (searchTerm || '').toLowerCase();
      const matchesSearch = !term || String(j.id).includes(term) || (j.title || j.job_title || '').toLowerCase().includes(term) || (j.customers?.name || j.customer_name || '').toLowerCase().includes(term);
      if (!matchesSearch) return false;
      // ✅ FIX: work_orders uses 'scheduled_start' not 'start_time'
      const isScheduled = !!(j.scheduled_start || j.start_time);
      // Use the unified job_status field that handles both job_status and work_status
      const currentStatus = (j.status || j.job_status || '').toLowerCase();
      const isInProgress = currentStatus === 'in_progress';
      const isCompleted = currentStatus === 'completed';
      let ok = true;
      if (statusFilter === 'unscheduled') ok = !isScheduled;
      else if (statusFilter === 'scheduled') ok = isScheduled;
      else if (statusFilter === 'in_progress') ok = isInProgress;
      else if (statusFilter === 'completed') ok = isCompleted;
      if (!ok) return false;
      if (techFilter && techFilter !== 'all') {
        if (String(j.assigned_technician_id || '') !== String(techFilter)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // ✅ FIX: work_orders uses 'scheduled_start' not 'start_time'
      const aHas = !!(a.scheduled_start || a.start_time);
      const bHas = !!(b.scheduled_start || b.start_time);
      if (aHas && bHas) return new Date(a.scheduled_start || a.start_time) - new Date(b.scheduled_start || b.start_time);
      if (aHas) return -1; if (bHas) return 1;
      return (new Date(b.created_at || 0)) - (new Date(a.created_at || 0));
    });


  // Phase 2/3 handlers
  const handleViewCloseout = (job) => {
    setCloseoutWorkOrderId(job.id);
    setShowCloseoutModal(true);
  };

  const sumItemsTotal = (items = []) => {
    return items.reduce((s, it) => {
      const lt = Number(it.line_total);
      if (Number.isFinite(lt)) return s + lt;
      const qty = Number(it.quantity || it.qty || 1);
      const price = Number(it.unit_price || it.rate || 0);
      const tax = Number(it.tax_rate || 0);
      const pre = qty * price;
      const taxAmt = +(pre * (tax / 100)).toFixed(2);
      return s + pre + taxAmt;
    }, 0);
  };

  const handleCreatePartialInvoice = async (job) => {
    try {
      const invRes = await supaFetch(`invoices?job_id=eq.${job.id}&order=created_at.asc`, { method: 'GET' }, user?.company_id);
      const invoices = invRes.ok ? await invRes.json() : [];
      const alreadyInvoiced = invoices.reduce((s, inv) => s + Number(inv.total_amount || 0), 0);
      const depositAmount = invoices.filter(i => i.kind === 'deposit').reduce((s, inv) => s + Number(inv.deposit_amount || 0), 0);
      const parentInvoiceId = invoices[0]?.id || null;

      const itemsRes = await supaFetch(`work_order_line_items?work_order_id=eq.${job.id}`, { method: 'GET' }, user?.company_id);
      const woItems = itemsRes.ok ? await itemsRes.json() : [];
      const totalAmount = sumItemsTotal(woItems);

      setPartialCtx({ job, totalAmount, alreadyInvoiced, depositAmount, parentInvoiceId });
      setShowPartialInvoiceModal(true);
    } catch (e) {
      console.error('Failed to prepare partial invoice', e);
      window?.toast?.error?.('Failed to prepare partial invoice');
    }
  };

  const handlePartialInvoiceConfirm = async (partialData) => {
    try {
      if (!partialCtx?.job) return;
      const created = await InvoicesService.createProgressInvoice(
        user?.company_id,
        partialCtx.job.id,
        partialCtx.job.customer_id,
        partialData,
        { parentInvoiceId: partialCtx.parentInvoiceId, createdBy: user?.id }
      );
      const link = `/invoices?new=${created.id}`;
      window?.toast?.success?.(`Partial invoice created. View: ${link}`);
      setShowPartialInvoiceModal(false);
      setPartialCtx(null);
    } catch (e) {
      console.error('Failed to create partial invoice', e);
      window?.toast?.error?.('Failed to create partial invoice');
    }
  };



  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Active Jobs"
        subtitle="Manage accepted quotes and scheduled work with job templates"
        icon={BriefcaseIcon}
        gradient="green"
        stats={[
          { label: 'Total Jobs', value: filteredJobs.length },
          { label: 'Scheduled', value: filteredJobs.filter(j => !!(j.scheduled_start || j.start_time)).length },
          { label: 'In Progress', value: filteredJobs.filter(j => ((j.status || j.job_status || '').toLowerCase() === 'in_progress')).length }
        ]}
        actions={[
          {
            label: 'Create Job',
            icon: PlusIcon,
            onClick: () => setShowCreateForm(true),
            primary: true
          },
          {
            label: 'Recurring Jobs',
            icon: ArrowPathIcon,
            onClick: () => setShowRecurringJobs(true)
          },
          {
            label: 'Smart Assistant',
            icon: SparklesIcon,
            onClick: () => setShowSmartAssistant(true)
          },
          {
            label: 'Closed Jobs',
            icon: CalendarIcon,
            onClick: () => window.location.href = '/jobs/history'
          }
        ]}
      />

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ModernStatCard
          title="Scheduled Today"
          value={filteredJobs.filter(j => {
            // ✅ FIX: work_orders uses 'scheduled_start' not 'start_time'
            const startTime = j.scheduled_start || j.start_time;
            if (!startTime) return false;
            const today = new Date().toDateString();
            return new Date(startTime).toDateString() === today;
          }).length}
          icon={CalendarIcon}
          gradient="green"
          onClick={() => setStatusFilter('scheduled')}

        />

        <ModernStatCard
          title="In Progress"
          value={filteredJobs.filter(j => j.job_status === 'IN_PROGRESS').length}
          icon={ClockIcon}
          gradient="blue"
          onClick={() => setStatusFilter('in_progress')}

        />

        <ModernStatCard
          title="Unscheduled"
          value={filteredJobs.filter(j => !(j.scheduled_start || j.start_time)).length}
          icon={ExclamationTriangleIcon}
          gradient="orange"
          onClick={() => setStatusFilter('unscheduled')}
          subtitle="Approved quotes without schedule"
        />

        <ModernStatCard
          title="Total Revenue"
          value={`$${filteredJobs.reduce((sum, j) => sum + (j.total_amount || 0), 0).toLocaleString()}`}
          icon={CurrencyDollarIcon}
          gradient="purple"
          onClick={() => navigate('/reports')}
        />
      </div>
      {/* Manage Views Modal */}
      {showManageViews && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={()=>setShowManageViews(false)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Manage Views</h3>
              <button className="text-gray-500" onClick={()=>setShowManageViews(false)}>×</button>
            </div>
            <div className="space-y-3">
              {savedViews.length===0 && (
                <div className="text-gray-500 text-sm">No saved views yet. Press Shift+S to quick save the current filters.</div>
              )}
              {savedViews.map(v => (
                <div key={v.name} className="flex items-center gap-2 border rounded p-2">
                  <button className="btn-secondary" onClick={()=>applyView(v)}>Apply</button>
                  <input
                    defaultValue={v.name}
                    className="flex-1 px-2 py-1 border rounded"
                    onBlur={(e)=>{ if (e.target.value!==v.name) {
                      const ok = renameView(v.name, e.target.value.trim());
                      if (!ok) { e.target.value = v.name; window?.toast?.error?.('Name already exists'); }
                    }}}
                  />
                  <button className="btn-danger" onClick={()=>deleteView(v.name)}>Delete</button>
                </div>
              ))}
            </div>

	      {/* Phase 2: Closeout Data Modal */}
	      {showCloseoutModal && (
	        <CloseoutDataModal
	          isOpen={showCloseoutModal}
	          onClose={() => setShowCloseoutModal(false)}
	          workOrderId={closeoutWorkOrderId}
	        />
	      )}

	      {/* Phase 3: Partial Invoice Modal */}
	      {showPartialInvoiceModal && partialCtx && (
	        <PartialInvoiceModal
	          isOpen={showPartialInvoiceModal}
	          onClose={() => setShowPartialInvoiceModal(false)}
	          onConfirm={handlePartialInvoiceConfirm}
	          totalAmount={partialCtx.totalAmount}
	          alreadyInvoiced={partialCtx.alreadyInvoiced}
	          depositAmount={partialCtx.depositAmount}
	        />
	      )}

            <div className="flex justify-end gap-2 mt-4">
              <button className="btn-secondary" onClick={()=>setShowManageViews(false)}>Close</button>
            </div>
          </div>
        </div>
      )}



      {/* Alert */}
      <Alert alert={alert} />

      {/* Jobs Stats (clickable) - ✅ FIX: work_orders uses 'scheduled_start' not 'start_time' */}
      <JobsStatsClickable
        stats={{
          total: jobs.length,
          unscheduled: jobs.filter(j => !(j.scheduled_start || j.start_time)).length,
          scheduled: jobs.filter(j => !!(j.scheduled_start || j.start_time)).length,
          inProgress: jobs.filter(j => ((j.status || j.job_status || '').toLowerCase() === 'in_progress')).length,
          completed: jobs.filter(j => ((j.status || j.job_status || '').toLowerCase() === 'completed')).length,
        }}
        onClick={(key) => {
          const map = { total: 'all', unscheduled: 'unscheduled', scheduled: 'scheduled', inProgress: 'in_progress', completed: 'completed' };
          setStatusFilter(map[key] || 'all');
        }}
      />

      {/* Utilization Gauge */}


      <JobsUtilization jobs={jobs} employees={employees} datePreset={datePreset} />

      {/* Filters Bar */}
      <JobsFiltersBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        datePreset={datePreset}
        setDatePreset={setDatePreset}
        techFilter={techFilter}
        setTechFilter={setTechFilter}
        employees={employees}
      />

      {/* Jobs Table */}
      <JobsTable
        jobs={filteredJobs}
        customers={customers}
        employees={employees}
        loading={loading}
        openEditForm={openEditForm}
        deleteJob={deleteJob}
        onViewCloseout={handleViewCloseout}
        onCreatePartialInvoice={handleCreatePartialInvoice}
        onScheduleJob={(job) => {
          if (job?._expandOnly) {
            // TODO: implement row expand state in Jobs page
            return;
          }
          const next = new URLSearchParams(location.search);
          next.set('schedule', 'new');
          next.set('edit', job.id);
          setSearchParams(next, { replace: true });
        }}
        onCreateInvoice={async (job) => {
          // Prevent double-clicks
          if (window.__creatingInvoice) return;
          window.__creatingInvoice = true;
          try {
            await createInvoiceFromJob(job, true);
          } finally {
            setTimeout(() => { window.__creatingInvoice = false; }, 2000);
          }
        }}
        onAllocateInventory={(job) => {
          setSelectedJobForInventory(job);
          setShowAllocationModal(true);
        }}
        onConfirmUsage={(job) => {
          setSelectedJobForInventory(job);
          setShowUsageModal(true);
        }}
        onScheduleJob={async (job) => {
          // ✅ TABLE NAME FIX: Load work_order_line_items (correct table name)
          try {
            const itemsResponse = await supaFetch(`work_order_line_items?work_order_id=eq.${job.id}`, { method: 'GET' }, user?.company_id);
            if (itemsResponse.ok) {

              const items = await itemsResponse.json();
              job.work_order_items = items; // Keep as work_order_items for SmartSchedulingAssistant compatibility
              console.log('📋 Loaded work_order_line_items for scheduling:', items);
            }
          } catch (error) {
            console.error('Error loading work order line items:', error);
          }

          // Open Smart Assistant with job data pre-populated
          setSelectedJobForScheduling(job);
          setShowSmartAssistant(true);
          console.log('Schedule job:', job);
        }}
        onReopenAsDraft={async (job) => {
          try {
            // Set quote_status back to DRAFT; DB trigger will move stage back to QUOTE
            const res = await supaFetch(`work_orders?id=eq.${job.id}`, {
              method: 'PATCH',
              headers: { 'Prefer': 'return=representation' },
              body: { quote_status: 'DRAFT' }
            }, job.company_id || undefined);
            if (res.ok) {
              window.location.href = '/quotes';
            }
          } catch (e) { console.error('Failed to reopen as draft', e); }
        }}
      />



      {/* Edit Job Modal */}
      {showEditForm && (
        <>
          <div className="flex justify-end mb-3">
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={async () => {
                try {
                  // ✅ TABLE NAME FIX: Load work_order_line_items (correct table name)
                  if (formData?.id) {
                    const itemsResponse = await supaFetch(`work_order_line_items?work_order_id=eq.${formData.id}`, { method: 'GET' }, user?.company_id);
                    if (itemsResponse.ok) {
                      const items = await itemsResponse.json();
                      setSelectedJobForScheduling({ ...formData, work_order_items: items });
                      console.log('📋 Loaded work_order_line_items for scheduling:', items);
                    } else {
                      setSelectedJobForScheduling(formData);
                    }
                  }
                  setShowSmartAssistant(true);
                } catch (e) {
                  console.error('Failed to open scheduler from edit modal', e);
                  setSelectedJobForScheduling(formData);
                  setShowSmartAssistant(true);
                }
              }}
            >
              <CalendarIcon className="w-4 h-4" /> Schedule
            </button>
          </div>
          <JobForm
            isEdit={true}
            formData={formData}
            setFormData={setFormData}
            customers={customers}
            employees={employees}
            onStatusChange={(nextStatus) => {
              // Persist status change immediately using parent's updateJob
              setFormData(prev => ({ ...prev, job_status: nextStatus }));
              // Call updateJob with an override to avoid stale formData in the same tick
              setTimeout(() => {
                try {
                  updateJob({ preventDefault: () => {}, _overrideStatus: nextStatus });
                } catch (e) {
                  console.error('Failed to auto-save job status change:', e);
                }
              }, 0);
            }}
            onSubmit={updateJob}
            onCancel={() => {
              console.log('Edit form cancel clicked');
              setShowEditForm(false);
              resetForm();
              // Clear processed params to allow fresh URL handling
              processedParams.current.clear();
            }}
            onRevertToQuote={async () => {
              try {
                if (!formData) return;
                const id = formData.id || selectedJobForScheduling?.id;
                if (!id) return;
                // Use RPC to perform demotion on the server (avoids CHECK/enum mismatches)
                const res = await supaFetch(`rpc/demote_job_to_quote`, {
                  method: 'POST',
                  headers: { 'Accept': 'application/json' },
                  body: { p_id: id }
                }, user?.company_id);
                if (!res.ok) {
                  const errText = await res.text();
                  console.error('RPC demote_job_to_quote error:', res.status, errText);
                } else {
                  setShowEditForm(false);
                  resetForm();
                  window.location.href = '/quotes';
                }
              } catch (e) {
                console.error('Failed to revert to quote', e);
              }
            }}
          />
        </>
      )}

      {/* Smart Scheduling Assistant */}
      <SmartSchedulingAssistant
        isOpen={showSmartAssistant}
        onClose={() => {
          setShowSmartAssistant(false);
          setSelectedJobForScheduling(null);
        }}
        onEventCreated={() => {
          try { window.dispatchEvent(new Event('jobs:refresh')); } catch {}
        }}
        jobData={selectedJobForScheduling}
        onEventCreated={(eventData) => {
          // Navigate to Work Orders/Calendar after scheduling
          console.log('Job scheduled:', eventData);
          setSelectedJobForScheduling(null);
          // Navigate to calendar to see the scheduled work order
          window.location.href = '/calendar';
        }}
      />

      {/* Inventory Allocation Modal */}
      {showAllocationModal && (
        <JobAllocationModal
          workOrder={selectedJobForInventory}
          onClose={() => {
            setShowAllocationModal(false);
            setSelectedJobForInventory(null);
          }}
          onSave={() => {
            setShowAllocationModal(false);
            setSelectedJobForInventory(null);
            // Refresh jobs data if needed
          }}
        />
      )}

      {/* Usage Confirmation Modal */}
      {showUsageModal && (
        <UsageConfirmationModal
          workOrder={selectedJobForInventory}
          onClose={() => {
            setShowUsageModal(false);
            setSelectedJobForInventory(null);
          }}
          onSave={() => {
            setShowUsageModal(false);
            setSelectedJobForInventory(null);
            // Refresh jobs data if needed
          }}
        />
      )}

      {/* Recurring Jobs Modal */}
      {showRecurringJobs && (
        <RecurringJobs
          onClose={() => setShowRecurringJobs(false)}
        />
      )}

      {/* ✅ Cancellation Modal - Competitive Advantage */}
      <CancellationModal
        isOpen={showCancellationModal}
        onClose={() => {
          setShowCancellationModal(false);
        }}
        onConfirm={handleCancellationConfirm}
        jobTitle={jobToCancel?.job_title || jobToCancel?.title || 'this job'}
      />

      {/* ✅ Rescheduling Modal - Competitive Advantage */}
      <ReschedulingModal
        isOpen={showReschedulingModal}
        onClose={() => {
          setShowReschedulingModal(false);
        }}
        onConfirm={handleReschedulingConfirm}
        onRescheduleNow={handleRescheduleNow}
        jobTitle={jobToReschedule?.job_title || jobToReschedule?.title || 'this job'}
      />

      {/* ✅ PHASE 2: Completion Prompt Modal - Smart Decision Point */}
      <CompletionPromptModal
        isOpen={showCompletionPrompt}
        onClose={() => {
          setShowCompletionPrompt(false);
        }}
        onCreateInvoice={handleCompletionCreateInvoice}
        onMarkComplete={handleCompletionMarkComplete}
        onExtendJob={handleCompletionExtendJob}
        jobTitle={jobToComplete?.job_title || jobToComplete?.title || 'this job'}
      />

      {/* ✅ PHASE 2: Extend Job Modal - Job Extension Workflow */}
      <ExtendJobModal
        isOpen={showExtendJobModal}
        onClose={() => {
          setShowExtendJobModal(false);
        }}
        onConfirm={handleExtendJobConfirm}
        jobTitle={jobToExtend?.job_title || jobToExtend?.title || 'this job'}
        currentScheduledEnd={jobToExtend?.end_time || jobToExtend?.scheduled_end}
      />

      {/* ✅ PHASE 2B: On-Hold Modal - Capture Hold Reason & Details */}
      <OnHoldModal
        isOpen={showOnHoldModal}
        onClose={() => {
          setShowOnHoldModal(false);
        }}
        onConfirm={handleOnHoldConfirm}
        jobTitle={jobToHold?.job_title || jobToHold?.title || 'this job'}
      />

      {/* ✅ PHASE 3B: Start Job Modal - Begin Scheduled Job */}
      <StartJobModal
        isOpen={showStartJobModal}
        onClose={() => {
          setShowStartJobModal(false);
        }}
        onConfirm={handleStartJobConfirm}
        jobTitle={jobToStart?.job_title || jobToStart?.title || 'this job'}
        scheduledStartTime={jobToStart?.start_time || jobToStart?.scheduled_start}
      />

      {/* ✅ PHASE 3B: Resume Job Modal - Resume from On-Hold */}
      <ResumeJobModal
        isOpen={showResumeJobModal}
        onClose={() => {
          setShowResumeJobModal(false);
        }}
        onConfirm={handleResumeJobConfirm}
        jobTitle={jobToResume?.job_title || jobToResume?.title || 'this job'}
        onHoldReason={jobToResume?.on_hold_reason}
        onHoldNotes={jobToResume?.on_hold_notes}
      />

      {/* ✅ FIX #2: Completion Modal */}
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onConfirm={handleCompletionConfirm}
        jobTitle={jobToComplete?.job_title || jobToComplete?.title || 'this job'}
        customerName={jobToComplete?.customers?.name || 'Customer'}
        scheduledDuration={jobToComplete?.scheduled_duration}
        actualStartTime={jobToComplete?.started_at}
      />

      {/* ✅ FIX #3: Invoice Creation Modal */}
      <InvoiceCreationModal
        isOpen={showInvoiceCreationModal}
        onClose={() => setShowInvoiceCreationModal(false)}
        onConfirm={handleInvoiceCreationConfirm}
        jobTitle={jobToInvoice?.job_title || jobToInvoice?.title || 'this job'}
        customerName={jobToInvoice?.customers?.name || 'Customer'}
        jobTotal={jobToInvoice?.total_amount || 0}
        workPerformed={jobToInvoice?.work_performed}
        materialsUsed={jobToInvoice?.materials_used}
        defaultPaymentTerms="Net 30"
      />
    </div>
  );
};

export default Jobs;
