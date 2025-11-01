import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import { getSupabaseClient } from '../utils/supabaseClient';
import { isStatusTransitionAllowed } from '../utils/statusHelpers';
import CancellationModal from './CancellationModal';
import ReschedulingModal from './ReschedulingModal';
import CompletionPromptModal from './CompletionPromptModal';
import ExtendJobModal from './ExtendJobModal';
import OnHoldModal from './OnHoldModal';

// ✅ PHASE 3B: Import new job modals
import StartJobModal from './StartJobModal';
import ResumeJobModal from './ResumeJobModal';

// ✅ UNIFIED: Completion + Invoice modal (replaces 3 separate modals)
import CompletionAndInvoiceModal from './CompletionAndInvoiceModal';


// Supabase configuration
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';
import settingsService from '../services/SettingsService';
import { InvoicesService, computeInvoiceTotals } from '../services/InvoicesService';
import invoiceSendingService from '../services/InvoiceSendingService';
import WorkOrderCompletionService from '../services/WorkOrderCompletionService';
import inventoryService from '../services/InventoryService';

const JobsDatabasePanel = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [jobToCancel, setJobToCancel] = useState(null);
  const [showReschedulingModal, setShowReschedulingModal] = useState(false);
  const [jobToReschedule, setJobToReschedule] = useState(null);
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);
  const [jobToComplete, setJobToComplete] = useState(null);
  const [showExtendJobModal, setShowExtendJobModal] = useState(false);
  const [jobToExtend, setJobToExtend] = useState(null);
  const [showOnHoldModal, setShowOnHoldModal] = useState(false);
  const [jobToHold, setJobToHold] = useState(null);

  // ✅ PHASE 3B: New job modal states
  const [showStartJobModal, setShowStartJobModal] = useState(false);
  const [jobToStart, setJobToStart] = useState(null);
  const [showResumeJobModal, setShowResumeJobModal] = useState(false);
  const [jobToResume, setJobToResume] = useState(null);

  // ✅ UNIFIED: Completion + Invoice modal (replaces 3 separate modals)
  const [showCompletionAndInvoiceModal, setShowCompletionAndInvoiceModal] = useState(false);
  // jobToComplete already declared at line 43



  const [formData, setFormData] = useState({
    id: '',
    job_title: '',
    customer_id: '',
    quote_id: '',
    employee_id: '',  // ✅ INDUSTRY STANDARD: Use employee_id (employees.id), not user_id
    job_status: 'draft',  // ✅ FIXED: lowercase (enum cleanup)
    start_time: '',
    end_time: '',
    job_location: '',
    description: '',
    notes: ''
  });

  // ✅ NEW: Watch for refresh parameter in URL to reload jobs
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refreshParam = params.get('refresh');
    if (refreshParam) {
      console.log('🔄 Refresh parameter detected, reloading jobs...');
      loadInitialData();
      // Remove refresh parameter from URL
      params.delete('refresh');
      window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadJobs(),
        loadCustomers(),
        loadEmployees()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      showAlert('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      // ✅ INDUSTRY STANDARD: Job stage only (approved → completed)
      // Matches ServiceTitan/Jobber/Housecall Pro: Jobs page shows job-stage statuses only
      // - approved: Unscheduled jobs (quote was approved, needs scheduling)
      // - scheduled: Job scheduled with date/time
      // - in_progress: Work started
      // - on_hold: Job paused
      // - needs_rescheduling: Job needs to be rescheduled (frees up calendar)
      // - completed: Work finished
      // ✅ EXCLUDE cancelled: Cancelled jobs are archived (soft delete)
      // Quote stage → Quotes page, Invoice stage → Invoices page
      // ✅ JOIN users table to get assigned technician name
      let response = await supaFetch(`work_orders?status=in.(approved,scheduled,in_progress,on_hold,completed,needs_rescheduling)&order=created_at.desc&select=*,customers(name,email,phone),assigned_user:users!assigned_to(id,first_name,last_name,name)`, { method: 'GET' }, user.company_id);

      if (response.ok) {
        const data = await response.json();


        // Load work order items for each job to calculate costs and duration
        const jobsWithItems = await Promise.all((data || []).map(async (job) => {
          try {
            // Skip if job.id is undefined or null - use work_order_id as fallback
            if (!job.id) {
              job.id = job.work_order_id;
              if (!job.id) {
                console.warn('Skipping job with no valid ID');
                return { ...job, items: [], laborCost: 0, materialCost: 0, totalCost: 0, estimatedDuration: 0 };
              }
            }

            const itemsResponse = await supaFetch(`work_order_line_items?work_order_id=eq.${job.id}`, { method: 'GET' }, user.company_id);
            let items = [];
            let laborCost = 0;
            let materialCost = 0;
            let totalCost = 0;
            let estimatedDuration = 0;

            if (itemsResponse.ok) {
              items = await itemsResponse.json();
              // Calculate costs and duration from items
              if (Array.isArray(items)) {
                laborCost = items.filter(item => item.item_type === 'labor').reduce((sum, item) => sum + (item.total || 0), 0);
                materialCost = items.filter(item => item.item_type === 'material').reduce((sum, item) => sum + (item.total || 0), 0);
                totalCost = items.reduce((sum, item) => sum + (item.total || 0), 0);
                estimatedDuration = items.filter(item => item.item_type === 'labor').reduce((sum, item) => sum + (item.quantity || 0), 0);
              }
            } else {
              console.warn(`⚠️ Failed to load work_order_line_items for job ${job.id}:`, itemsResponse.status);
            }

            // Map unified fields to legacy UI expectations with calculated values
            return {
              ...job,
              job_title: job.title || 'Untitled Job',
              job_location: job.work_location || job.customers?.address || '',
              total_cost: totalCost || job.total_amount || 0,
              labor_cost: laborCost,
              material_cost: materialCost,
              estimated_duration: estimatedDuration || job.estimated_duration || 0,
              quote_id: job.id, // In unified system, the same ID flows through all stages
              customer_name: job.customers?.name || 'Unknown Customer',
              customer_phone: job.customers?.phone || '',
              customer_email: job.customers?.email || '',
              work_order_items: items, // Include items for editing
              // ✅ FIX: Map 'assigned_to' to 'assigned_technician_id' for UI compatibility
              assigned_technician_id: job.assigned_to || job.assigned_technician_id,
              // Add scheduling status for filtering - ✅ FIX: work_orders uses 'scheduled_start' not 'start_time'
              is_scheduled: !!(job.scheduled_start || job.start_time),
              job_status: job.status || (job.stage === 'WORK_ORDER' ? job.work_status : job.job_status)
            };
          } catch (error) {
            console.error(`Error loading items for job ${job.id}:`, error);
            return {
              ...job,
              job_title: job.title || 'Untitled Job',
              job_location: job.work_location || '',
              total_cost: job.total_amount || 0,
              labor_cost: 0,
              material_cost: 0,
              estimated_duration: job.estimated_duration || 0,
              quote_id: job.id,
              customer_name: job.customers?.name || 'Unknown Customer',
              work_order_items: [],
              // ✅ FIX: Map 'assigned_to' to 'assigned_technician_id' for UI compatibility
              assigned_technician_id: job.assigned_to || job.assigned_technician_id,
              // Add scheduling status for filtering - ✅ FIX: work_orders uses 'scheduled_start' not 'start_time'
              is_scheduled: !!(job.scheduled_start || job.start_time),
              job_status: job.status || (job.stage === 'WORK_ORDER' ? job.work_status : job.job_status)
            };
          }
        }));

        setJobs(jobsWithItems);
      } else if (!response.ok) {
        // Fallback to work_orders table
        await loadJobsFromWorkOrders();
      }    } catch (error) {
      console.error('Error loading jobs:', error);
      showAlert('error', 'Failed to load jobs. Trying fallback...');
      await loadJobsFromWorkOrders();
    }
  };

  const loadJobsFromWorkOrders = async () => {
    try {
      // ✅ INDUSTRY STANDARD: Job stage only (approved → completed → invoiced)
      // Matches ServiceTitan/Jobber/Housecall Pro: Jobs page shows job-stage statuses only
      // Quote stage → Quotes page, Invoice stage → Invoices page
      // ✅ Include 'invoiced' status so jobs don't disappear after invoice is sent
      // ✅ EXCLUDE 'cancelled': Cancelled jobs are archived (soft delete)
      // ✅ JOIN users table to get assigned technician name
      const response = await supaFetch(`work_orders?status=in.(approved,scheduled,in_progress,on_hold,completed,invoiced,needs_rescheduling)&select=*,customers(name,address,phone,email),assigned_user:users!assigned_to(id,first_name,last_name,name)&order=created_at.desc`, { method: 'GET' }, user.company_id);
      if (response.ok) {
        const data = await response.json();
        const mapped = (data || []).map(j => ({
          ...j,
          job_title: j.title || 'Untitled Job',
          job_location: j.work_location || j.customers?.address || '',
          total_cost: j.total_amount || 0,
          labor_cost: 0,
          material_cost: 0,
          estimated_duration: j.estimated_duration || 0,
          quote_id: j.id,
          customer_name: j.customers?.name || 'Unknown Customer',
          work_order_items: [],
          // Add scheduling status for filtering
          job_status: j.status
        }));
        setJobs(mapped);
      }
    } catch (error) {
      console.error('Error loading jobs from work_orders:', error);
      setJobs([]);
    }
  };

  // Auto-complete jobs whose scheduled_end is in the past to keep Active Jobs clean
  const autoCompleteRanRef = useRef(false);
  useEffect(() => {
    if (autoCompleteRanRef.current) return;
    const now = new Date();
    const bufferMinutes = 15; // small grace period
    const cutoff = new Date(now.getTime() - bufferMinutes * 60000);
    const candidates = (jobs || []).filter(j => {
      const st = (j.status || j.job_status || '').toLowerCase();
      if (!(st === 'scheduled' || st === 'in_progress')) return false;
      const endStr = j.scheduled_end || j.end_time || j.scheduled_start || j.start_time;
      if (!endStr) return false;
      const end = new Date(endStr);
      if (isNaN(end.getTime())) return false;
      return end < cutoff;
    });
    if (!candidates.length) return;

    (async () => {
      try {
        // 1) Mark candidates as completed
        await Promise.all(candidates.map(async (j) => {
          try {
            await supaFetch(`work_orders?id=eq.${j.id}`,
              { method: 'PATCH', headers: { 'Prefer': 'return=representation' }, body: { status: 'completed' } },
              user.company_id
            );
          } catch (e) { console.warn('Auto-complete patch failed for job', j.id, e?.message || e); }
        }));

        // 2) Optionally auto-invoice on completion based on company settings
        let autoInvoice = false;
        try {
          const unified = await settingsService.getSettings(user.company_id);
          autoInvoice = !!unified?.businessSettings?.auto_invoice_on_completion;
        } catch (e) { console.warn('Failed to load settings for auto-invoice:', e?.message || e); }

        if (autoInvoice) {
          for (const j of candidates) {
            try {
              const created = await createInvoiceFromJob(j, false);
              const createdInvoice = Array.isArray(created) ? created[0] : created;
              if (createdInvoice?.id) {
                await supaFetch(`work_orders?id=eq.${j.id}`,
                  { method: 'PATCH', headers: { 'Prefer': 'return=representation' }, body: { status: 'invoiced', invoice_date: createdInvoice.issued_at || createdInvoice.created_at || new Date().toISOString() } },
                  user.company_id
                );
              }
            } catch (e) {
              console.warn('Auto-invoice failed for job', j.id, e?.message || e);
            }
          }
        }

        // 3) Reload list after automation
        await loadJobs();
      } finally {
        autoCompleteRanRef.current = true;
      }
    })();
  }, [jobs]);

  // Listen for global refresh requests from SmartSchedulingAssistant
  useEffect(() => {
    const handler = () => {
      try { loadJobs(); } catch {}
    };
    window.addEventListener('jobs:refresh', handler);
    return () => window.removeEventListener('jobs:refresh', handler);
  }, []);



  const loadCustomers = async () => {
    try {
      // Load complete customer data to match QuotesDatabasePanel and support AddressCard
      const response = await supaFetch(`customers?select=*&order=name.asc`, { method: 'GET' }, user.company_id);

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      // ✅ BACKEND RPC: Single source of truth for employee queries
      // Backend handles JOIN with users table, filtering, and ordering
      console.log('🔍 JOBS PANEL - Loading schedulable employees via RPC for company:', user.company_id);

      const supabase = getSupabaseClient();
      const { data, error } = await supabase.rpc('get_schedulable_employees', {
        p_company_id: user.company_id
      });

      if (error) {
        console.error('❌ JOBS PANEL - RPC Error:', error);
        setEmployees([]);
        return;
      }

      console.log('✅ JOBS PANEL - Loaded employees via RPC:', data);
      if (!data || data.length === 0) {
        console.warn('⚠️ JOBS PANEL - No employees returned for company:', user.company_id);
        setEmployees([]);
        return;
      }

      // Map to expected format (RPC returns flat data, not nested)
      const mappedEmployees = data.map(emp => ({
        id: emp.id,
        user_id: emp.user_id,
        employee_id: emp.employee_id,
        full_name: emp.full_name,
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        role: emp.role,
        status: emp.status,
        job_title: emp.job_title,
        is_schedulable: emp.is_schedulable
      }));

      // Include owner and admin roles for scheduling
      const allowedRoles = new Set(['owner', 'admin', 'technician', 'lead_technician', 'field_tech']);
      setEmployees(mappedEmployees.filter(emp => allowedRoles.has((emp.role || '').toLowerCase())));
    } catch (error) {
      console.error('❌ Error loading employees:', error);
      setEmployees([]);
    }
  };

  // Legacy jobs table creation removed. Jobs are represented in unified work_orders.
  const createJobsTable = async () => {
    // No-op: using work_orders table
  };

  const createJob = async (e) => {
    e.preventDefault();

    if (!formData.job_title || !formData.customer_id) {
      showAlert('error', 'Job title and customer are required');
      return;
    }

    try {
      // Create a new JOB directly in unified work_orders
      const woData = {
        title: formData.job_title,
        customer_id: formData.customer_id || null,
        employee_id: formData.employee_id || null,  // ✅ INDUSTRY STANDARD: employee_id
        status: 'scheduled',  // Use status, not stage. Jobs start as scheduled
        work_location: formData.job_location || null,
        description: formData.description || null,
        notes: formData.notes || null,
        created_at: new Date().toISOString()
      };

      const response = await supaFetch(`work_orders`, {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: woData
      }, user.company_id);

      if (response.ok) {
        const createdRows = await response.json().catch(() => []);
        const created = Array.isArray(createdRows) ? createdRows[0] : createdRows;
        const newId = created?.id;
        // Create material reservations immediately upon scheduling
        try {
          if (newId) await inventoryService.reserveForWorkOrder(user.company_id, newId);
        } catch (e) {
          console.warn('Reservation creation failed (non-blocking):', e?.message || e);
        }
        showAlert('success', 'Job created successfully!');
        resetForm();
        setShowCreateForm(false);
        loadJobs();
      } else {
        throw new Error('Failed to create job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      showAlert('error', 'Failed to create job');
    }
  };

  const pushInvoiceItems = async (invoiceId, items) => {
    if (!invoiceId || !Array.isArray(items) || items.length === 0) return;
    try {
      const payload = items.map((it, index) => ({
        invoice_id: invoiceId,
        description: it.description,
        quantity: it.quantity,
        unit_price: it.unit_price,
        tax_rate: it.tax_rate || 0,
        // server will compute tax_amount/line_total or we can precompute here
        sort_order: it.sort_order || index + 1
      }));
      await supaFetch('invoice_items', { method: 'POST', body: payload }, user.company_id);
    } catch (e) {
      console.warn('Failed to create invoice items:', e);
    }
  };

  const createInvoiceFromJob = async (job, navigateOnSuccess = false) => {
    try {
      // Store job data in localStorage for debugging (persists across page navigation)
      const jobDebugData = {
        id: job.id,
        title: job.title,
        job_title: job.job_title,
        work_location: job.work_location,
        street_address: job.street_address,
        city: job.city,
        state: job.state,
        zip_code: job.zip_code,
        technician_name: job.technician_name,
        employee_id: job.employee_id,  // ✅ INDUSTRY STANDARD: employee_id
        start_time: job.start_time,
        end_time: job.end_time,
        job_status: job.job_status,
        allFields: Object.keys(job)
      };

      localStorage.setItem('lastJobDataForInvoice', JSON.stringify(jobDebugData, null, 2));

      // 1) Check if an invoice already exists for this job
      const existingRes = await supaFetch(`invoices?select=*,customers(name,email,phone)&work_order_id=eq.${job.id}&order=created_at.desc&limit=1`, { method: 'GET' }, user.company_id);
      if (existingRes.ok) {
        const [existing] = await existingRes.json();
        if (existing) {
          showAlert('success', `Invoice ${existing.invoice_number} already exists for this job`);
          return existing;
        }
      }

      // 2) Create a new invoice
      const seqNumber = await settingsService.getAndIncrementInvoiceNumber(user.company_id);
      // Compute due_date from business_settings (default_invoice_terms field)
      const issuedDate = new Date();
      let dueDateISO = null;
      try {
        // ✅ FIX: Use business_settings table instead of company_settings
        const res = await supaFetch(`business_settings?company_id=eq.${user.company_id}&select=default_invoice_terms`, { method: 'GET' }, user.company_id);
        let days = 30; // Default to 30 days if not configured
        if (res.ok) {
          const rows = await res.json();
          if (rows?.length) {
            const terms = rows[0].default_invoice_terms;
            console.log('📋 Invoice terms from business_settings:', terms);
            // Parse NET30, NET15, etc.
            if (terms && /NET(\d{1,3})/.test(terms)) {
              days = parseInt(terms.match(/NET(\d{1,3})/)[1], 10);
            } else if (terms && /(\d{1,3})/.test(terms)) {
              days = parseInt(terms.match(/(\d{1,3})/)[1], 10);
            }
          }
        } else {
          console.warn('⚠️ Failed to fetch invoice terms:', res.status);
        }
        const due = new Date(issuedDate);
        due.setDate(due.getDate() + (Number.isFinite(days) ? days : 30));
        due.setHours(0,0,0,0);
        dueDateISO = due.toISOString().split('T')[0]; // DATE format (YYYY-MM-DD)
      } catch (e) {
        const due = new Date(issuedDate);
        due.setDate(due.getDate() + 30);
        dueDateISO = due.toISOString().split('T')[0];
      }

      // Map job work_order_line_items to invoice_items on creation
      const itemsRes = await supaFetch(`work_order_line_items?work_order_id=eq.${job.id}`, { method: 'GET' }, user.company_id);
      const jobItems = itemsRes.ok ? await itemsRes.json() : [];

      // Build invoice items based on pricing model
      const pricingModel = job.pricing_model || 'TIME_MATERIALS';
      let mappedItems = [];

      if (pricingModel === 'TIME_MATERIALS') {
        mappedItems = jobItems.map((it, idx) => {
          const description = it.item_name || it.description || 'Item';
          const quantity = Number(it.quantity || 1);
          const unit_price = Number(it.rate || 0);
          const tax_rate = Number(it.tax_rate ?? job.tax_rate ?? 0);
          const preTax = +(quantity * unit_price).toFixed(2);
          const tax_amount = +(preTax * (tax_rate / 100)).toFixed(2);
          const line_total = +(preTax + tax_amount).toFixed(2);
          return {
            description,
            quantity,
            unit_price,
            tax_rate,
            tax_amount,
            line_total,
            sort_order: idx + 1
          };
        });
      } else {
        // Non T&M models: use a single summary line from job financials
        const tax_rate = Number(job.tax_rate || 0);

        let subtotal = 0;
        let description = 'Job total';

        if (pricingModel === 'FLAT_RATE') {
          subtotal = Number(job.flat_rate_amount || job.subtotal || 0);
          description = 'Flat rate job';
        } else if (pricingModel === 'UNIT_PRICE') {
          const units = Number(job.unit_count || 0);
          const unitPrice = Number(job.unit_price || 0);
          subtotal = +(units * unitPrice).toFixed(2);
          description = `Unit price job: ${units} units @ ${unitPrice.toFixed(2)}`;
        } else if (pricingModel === 'PERCENTAGE') {
          const base = Number(job.percentage_base_amount || job.subtotal || 0);
          const pct = Number(job.percentage || 0);
          subtotal = +((base * pct) / 100).toFixed(2);
          description = `Percentage job: ${pct}% of ${base.toFixed(2)}`;
        } else {
          // Fallback: use job subtotal
          subtotal = Number(job.subtotal || 0);
        }

        const tax_amount = +(subtotal * (tax_rate / 100)).toFixed(2);
        const total_amount = +(subtotal + tax_amount).toFixed(2);

        mappedItems = [{
          description,
          quantity: 1,
          unit_price: subtotal,
          tax_rate,
          tax_amount,
          line_total: total_amount,
          sort_order: 1
        }];
      }

      // ✅ FIX: Calculate totals from mapped items, not from job fields
      const calculatedSubtotal = mappedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const calculatedTaxAmount = mappedItems.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
      const calculatedTotalAmount = mappedItems.reduce((sum, item) => sum + (item.line_total || 0), 0);

      console.log('📊 Invoice totals calculated from items:', {
        subtotal: calculatedSubtotal,
        tax_amount: calculatedTaxAmount,
        total_amount: calculatedTotalAmount,
        itemCount: mappedItems.length
      });

      // ✅ Call backend RPC to create invoice AND update work order (atomic transaction)
      console.log('🔄 Calling backend RPC: create_invoice_and_update_work_order');
      const rpcRes = await supaFetch('rpc/create_invoice_and_update_work_order', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: {
          p_company_id: user.company_id,
          p_work_order_id: job.id,
          p_customer_id: job.customer_id,
          p_invoice_number: seqNumber,
          p_total_amount: calculatedTotalAmount,
          p_subtotal: calculatedSubtotal,
          p_tax_amount: calculatedTaxAmount,
          p_issue_date: issuedDate.toISOString().split('T')[0],
          p_due_date: dueDateISO,
          p_notes: job.description ? `Work Performed: ${job.description}` : `Invoice for job: ${job.title || job.job_title || 'Untitled Job'}`
        }
      }, user.company_id);

      if (rpcRes.ok) {
        const rpcResult = await rpcRes.json();
        console.log('✅ RPC Result:', rpcResult);

        if (rpcResult.success) {
          const createdInvoice = {
            id: rpcResult.invoice_id,
            invoice_number: rpcResult.invoice_number,
            work_order_id: job.id,
            customer_id: job.customer_id,
            total_amount: calculatedTotalAmount,
            subtotal: calculatedSubtotal,
            tax_amount: calculatedTaxAmount,
            status: 'draft'
          };

          // TODO: Create invoice items when RLS is fixed (currently 403 Forbidden)
          // await pushInvoiceItems(createdInvoice.id, mappedItems);

          console.log('✅ Invoice created and work order updated via RPC');

          showAlert('success', 'Invoice created successfully!');



          // Reload jobs to remove this job from Active Jobs (now invoiced)
          await loadJobs();

          return createdInvoice;
        } else {
          const errorText = await rpcRes.text().catch(() => '');
          console.error('❌ Invoice creation failed:', rpcRes.status, errorText);
          throw new Error(`Failed to create invoice: ${rpcRes.status}`);
        }
      } else {
        const errorText = await rpcRes.text().catch(() => '');
        console.error('❌ RPC call failed:', rpcRes.status, errorText);
        throw new Error(`Failed to create invoice via RPC: ${rpcRes.status}`);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      showAlert('error', 'Failed to create invoice from job');
      throw error;
    }
  };

  const updateJob = async (e) => {
    e.preventDefault();

    // Check for completion choice from event (for direct calls) or formData (for form submits)
    const completionChoiceFromEvent = e._completionChoice;

    // 🔍 DEBUG: Log entry to updateJob
    console.log('🔍 JobsDatabasePanel.updateJob - ENTRY:', {
      formData_job_status: formData.job_status,
      selectedJob_status: selectedJob?.status,
      selectedJob_id: selectedJob?.id,
      formData_id: formData.id
    });

    if (!formData.job_title || !formData.customer_id) {
      showAlert('error', 'Job title and customer are required');
      return;
    }

    try {
      // ✅ FIXED: Use lowercase 'draft' (enum cleanup)
      const status = ((e && e._overrideStatus) || formData.job_status || 'draft').toLowerCase();

      // ✅ INTERCEPT CANCELLATION: Show modal for tracking
      const currentStatus = (selectedJob?.status || '').toLowerCase();

      // 🔍 DEBUG: Log status change
      console.log('🔍 JobsDatabasePanel.updateJob - Status Change:', {
        currentStatus,
        newStatus: status,
        formData_job_status: formData.job_status,
        selectedJob_status: selectedJob?.status,
        willInterceptOnHold: status === 'on_hold' && currentStatus !== 'on_hold',
        comparison: {
          status_equals_on_hold: status === 'on_hold',
          currentStatus_not_equals_on_hold: currentStatus !== 'on_hold',
          both_conditions: status === 'on_hold' && currentStatus !== 'on_hold'
        }
      });

      if (status === 'cancelled' && currentStatus !== 'cancelled') {
        // Store job and show cancellation modal
        setJobToCancel({ ...selectedJob, ...formData });
        setShowCancellationModal(true);
        return; // Don't proceed with update yet
      }

      // ✅ INTERCEPT RESCHEDULING: Show modal for tracking + option to reschedule now
      if (status === 'needs_rescheduling' && currentStatus !== 'needs_rescheduling') {
        // Store job and show rescheduling modal
        setJobToReschedule({ ...selectedJob, ...formData });
        setShowReschedulingModal(true);
        return; // Don't proceed with update yet
      }

      // ✅ INTERCEPT ON HOLD: Capture reason and details
      if (status === 'on_hold' && currentStatus !== 'on_hold') {
        // Store job and show on-hold modal
        setJobToHold({ ...selectedJob, ...formData });
        setShowOnHoldModal(true);
        return; // Don't proceed with update yet
      }

      // ✅ INTERCEPT SCHEDULING: Open Smart Scheduling Assistant when moving to 'scheduled'
      // For non-on-hold flows, scheduling should go through the assistant to set date/time
      if (status === 'scheduled' && currentStatus !== 'on_hold') {
        try { sessionStorage.setItem('openSmartSchedulingFor', selectedJob?.id); } catch (e) {}
        // Close the edit form; parent Jobs.js watches the sessionStorage flag and opens the Assistant
        setShowEditForm(false);
        showAlert && showAlert('info', 'Opening Smart Scheduler to pick a date/time...');
        return; // Do not PATCH yet; scheduling will persist after selecting a slot
      }


      // ✅ PHASE 3B: INTERCEPT START JOB (scheduled → in_progress)
      if (status === 'in_progress' && currentStatus === 'scheduled') {
        setJobToStart({ ...selectedJob, ...formData });
        setShowStartJobModal(true);
        return; // Don't proceed with update yet
      }

      // ✅ PHASE 3B: INTERCEPT RESUME JOB (on_hold → scheduled/in_progress)
      if ((status === 'scheduled' || status === 'in_progress') && currentStatus === 'on_hold') {
        setJobToResume({ ...selectedJob, ...formData });
        setShowResumeJobModal(true);
        return; // Don't proceed with update yet
      }

      // ✅ INTERCEPT COMPLETION (in_progress → completed)
      // Restore original behavior: show the Completion Prompt first so user can choose
      //  - Create Invoice now (opens 3-step modal)
      //  - Mark Complete (no invoice)
      //  - Extend Job
      if (status === 'completed' && currentStatus === 'in_progress') {
        setJobToComplete({ ...selectedJob, ...formData });
        setShowCompletionPrompt(true);
        return; // Don't proceed with update yet
      }



      // ✅ VALIDATE STATUS TRANSITION
      if (currentStatus && status !== currentStatus) {
        if (!isStatusTransitionAllowed(currentStatus, status)) {
          showAlert('error', `Cannot change status from "${currentStatus}" to "${status}". Invalid transition.`);
          return;
        }
      }

      // Normalize datetime inputs
      const toISOOrNull = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d.toISOString();
      };

      // Map unified fields to work_orders (columns that exist)
      const jobData = {
        title: formData.job_title,
        customer_id: formData.customer_id || null,
        employee_id: formData.employee_id || null,  // ✅ INDUSTRY STANDARD: employee_id
        scheduled_start: toISOOrNull(formData.start_time),
        scheduled_end: toISOOrNull(formData.end_time),
        // ✅ FIXED: No 'work_location' column - use service_address_line_1 for location text
        description: formData.description || null,
        notes: formData.notes || null,
        // Save address to service address fields
        service_address_line_1: formData.street_address || formData.job_location || null,
        service_city: formData.city || null,
        service_state: formData.state || null,
        service_zip_code: formData.zip_code || null,
      };

      // Unified status field
      jobData.status = status;

      // Do not attempt to change stage here; DB triggers/guards handle it
      // Only update invoice link after successful invoice creation.




      const response = await supaFetch(`work_orders?id=eq.${selectedJob.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: jobData
      }, user.company_id);

      if (response.ok) {
        // Read updated row to decide navigation based on new stage
        let updated = null;
        try {
          const txt = await response.text();
          if (txt && txt.trim()) {
            const arr = JSON.parse(txt);
            updated = Array.isArray(arr) ? arr[0] : arr;
          }
        } catch (_) {}

        showAlert('success', 'Job updated successfully!');

        // Handle completion choice from event (direct call) or form (regular submit)
        const completionChoice = completionChoiceFromEvent || formData._completionChoice;

        if (completionChoice === 'INVOICE') {
          // Create invoice and open SendInvoiceModal
          try {
            const createdInvoice = await createInvoiceFromJob(updated || selectedJob, true); // navigateOnSuccess = true

            // ✅ FIX: Don't try to set invoice_id on work_orders (column doesn't exist)
            // The relationship is one-way: invoices.work_order_id → work_orders.id

            // ✅ FIX: Modal state is already set in createInvoiceFromJob
            // Just close the edit form and return - modal will show
            if (createdInvoice) {
              resetForm();
              setShowEditForm(false);
              setSelectedJob(null);
              // Don't reload jobs - let modal show first
              return;
            }
          } catch (e) {
            console.error('Failed to create invoice:', e);
            showAlert('error', 'Job updated but failed to create invoice');
            // Don't return, fall through to default behavior
          }
        }

        if (completionChoice === 'WORK_ORDER' || (updated?.stage === 'WORK_ORDER' && !completionChoice)) {
          // Navigate to work orders
          window.location.href = `/work-orders?edit=${selectedJob.id}`;
        } else if (completionChoice === 'STAY') {
          // Stay on jobs page, just refresh
          resetForm();
          setShowEditForm(false);
          setSelectedJob(null);
          loadJobs();
        } else {
          // Default behavior
          resetForm();
          setShowEditForm(false);
          setSelectedJob(null);
          loadJobs();
        }
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('❌ Job update failed:', response.status, errorText);
        throw new Error('Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      showAlert('error', 'Failed to update job');
    }
  };

  const handleCancellationConfirm = async (cancellationData) => {
    if (!jobToCancel) return;

    try {
      // Normalize datetime inputs
      const toISOOrNull = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d.toISOString();
      };

      // Build update payload with cancellation tracking
      const jobData = {
        title: jobToCancel.job_title,
        customer_id: jobToCancel.customer_id || null,
        employee_id: jobToCancel.employee_id || null,
        // Free up tech/time slot on cancellation
        scheduled_start: null,
        scheduled_end: null,
        description: jobToCancel.description || null,
        notes: jobToCancel.notes || null,
        service_address_line_1: jobToCancel.street_address || jobToCancel.job_location || null,
        service_city: jobToCancel.city || null,
        service_state: jobToCancel.state || null,
        service_zip_code: jobToCancel.zip_code || null,
        status: 'cancelled',
        // ✅ COMPETITIVE ADVANTAGE: Cancellation tracking
        cancelled_by: user.profile_id, // Current user's profile ID
        cancellation_reason: cancellationData.reason,
        cancellation_notes: cancellationData.notes,
        cancellation_initiated_by: cancellationData.initiatedBy
        // cancelled_at will be set automatically by trigger
      };

      const response = await supaFetch(`work_orders?id=eq.${jobToCancel.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: jobData
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Job cancelled successfully and moved to Closed Jobs');
        setShowCancellationModal(false);
        setJobToCancel(null);
        resetForm();
        setShowEditForm(false);
        setSelectedJob(null);
        loadJobs();
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('Failed to cancel job:', response.status, errorText);
        throw new Error('Failed to cancel job');
      }
    } catch (error) {
      console.error('Error cancelling job:', error);
      showAlert('error', 'Failed to cancel job');
    }
  };

  const handleReschedulingConfirm = async (reschedulingData) => {
    if (!jobToReschedule) return;

    try {
      // Normalize datetime inputs
      const toISOOrNull = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d.toISOString();
      };

      // Build update payload with rescheduling tracking
      const jobData = {
        title: jobToReschedule.job_title,
        customer_id: jobToReschedule.customer_id || null,
        employee_id: jobToReschedule.employee_id || null,
        // Free up tech/time slot for rescheduling
        scheduled_start: null,
        scheduled_end: null,
        description: jobToReschedule.description || null,
        notes: jobToReschedule.notes || null,
        service_address_line_1: jobToReschedule.street_address || jobToReschedule.job_location || null,
        service_city: jobToReschedule.city || null,
        service_state: jobToReschedule.state || null,
        service_zip_code: jobToReschedule.zip_code || null,
        status: 'needs_rescheduling',
        // ✅ COMPETITIVE ADVANTAGE: Rescheduling tracking
        rescheduling_requested_by: user.profile_id, // Current user's profile ID
        rescheduling_reason: reschedulingData.reason,
        rescheduling_notes: reschedulingData.notes
        // rescheduling_requested_at will be set automatically by trigger
      };

      const response = await supaFetch(`work_orders?id=eq.${jobToReschedule.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: jobData
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Job marked as needs rescheduling. Technician calendar freed up.');
        setShowReschedulingModal(false);
        setJobToReschedule(null);
        resetForm();
        setShowEditForm(false);
        setSelectedJob(null);
        loadJobs();
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('Failed to mark job for rescheduling:', response.status, errorText);
        throw new Error('Failed to mark job for rescheduling');
      }
    } catch (error) {
      console.error('Error marking job for rescheduling:', error);
      showAlert('error', 'Failed to mark job for rescheduling');
    }
  };

  const handleRescheduleNow = (reschedulingData) => {
    // First save the rescheduling data
    handleReschedulingConfirm(reschedulingData);

    // Then trigger Smart Scheduling Assistant
    // This will be handled by the parent component (Jobs.js)
    // by setting a flag that the parent can detect
    if (jobToReschedule) {
      // Store in sessionStorage so parent can pick it up
      sessionStorage.setItem('openSmartSchedulingFor', jobToReschedule.id);
    }
  };

  // ✅ PHASE 2: Completion Prompt Handlers
  const handleCompletionCreateInvoice = async () => {
    if (!jobToComplete) return;

    try {
      // First mark job as completed
      await markJobCompleted(jobToComplete);

      // Then create invoice
      await createInvoiceFromJob(jobToComplete.id);

      setShowCompletionPrompt(false);
      setJobToComplete(null);
      showAlert('success', 'Job completed and invoice created successfully');
    } catch (error) {
      console.error('Error completing job and creating invoice:', error);
      showAlert('error', 'Failed to complete job and create invoice');
    }
  };

  const handleCompletionMarkComplete = async () => {
    if (!jobToComplete) return;

    try {
      // Mark job as completed (will go to "Requires Invoicing" status)
      await markJobCompleted(jobToComplete);

      setShowCompletionPrompt(false);
      setJobToComplete(null);
      showAlert('success', 'Job marked as completed. Ready to invoice.');
    } catch (error) {
      console.error('Error marking job complete:', error);
      showAlert('error', 'Failed to mark job complete');
    }
  };

  const handleCompletionExtendJob = () => {
    // Close completion prompt and open extend job modal
    setShowCompletionPrompt(false);
    setJobToExtend(jobToComplete);
    setShowExtendJobModal(true);
  };

  const markJobCompleted = async (job) => {
    // Normalize datetime inputs
    const toISOOrNull = (dateStr) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d.toISOString();
    };

    // Build update payload
    const jobData = {
      title: job.job_title,
      customer_id: job.customer_id || null,
      employee_id: job.employee_id || null,
      scheduled_start: toISOOrNull(job.start_time),
      scheduled_end: toISOOrNull(job.end_time),
      description: job.description || null,
      notes: job.notes || null,
      service_address_line_1: job.street_address || job.job_location || null,
      service_city: job.city || null,
      service_state: job.state || null,
      service_zip_code: job.zip_code || null,
      status: 'completed'
      // completed_at will be set automatically by trigger
    };

    const response = await supaFetch(`work_orders?id=eq.${job.id}`, {
      method: 'PATCH',
      headers: { 'Prefer': 'return=representation' },
      body: jobData
    }, user.company_id);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Failed to mark job complete:', response.status, errorText);
      throw new Error('Failed to mark job complete');
    }

    // Best-effort: consume allocated inventory for this job
    try {
      await inventoryService.createConsumptionForWorkOrder(user.company_id, job.id, user.id);
    } catch (e) {
      console.warn('Inventory consumption on completion failed (non-blocking):', e?.message || e);
    }

    resetForm();
    setShowEditForm(false);
    setSelectedJob(null);
    loadJobs();
  };

  const handleExtendJobConfirm = async (extensionData) => {
    if (!jobToExtend) return;

    try {
      // Calculate new scheduled_end time
      const currentEnd = new Date(jobToExtend.end_time || jobToExtend.scheduled_end);
      const newEnd = new Date(currentEnd.getTime() + extensionData.extensionMinutes * 60000);

      // Normalize datetime inputs
      const toISOOrNull = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d.toISOString();
      };

      // Build update payload
      const jobData = {
        title: jobToExtend.job_title,
        customer_id: jobToExtend.customer_id || null,
        employee_id: jobToExtend.employee_id || null,
        scheduled_start: toISOOrNull(jobToExtend.start_time),
        scheduled_end: newEnd.toISOString(), // Extended end time
        description: jobToExtend.description || null,
        notes: (jobToExtend.notes || '') + `\n\n[Extended ${extensionData.extensionMinutes} minutes: ${extensionData.reason}]`,
        service_address_line_1: jobToExtend.street_address || jobToExtend.job_location || null,
        service_city: jobToExtend.city || null,
        service_state: jobToExtend.state || null,
        service_zip_code: jobToExtend.zip_code || null,
        status: 'in_progress' // Keep in progress
      };

      const response = await supaFetch(`work_orders?id=eq.${jobToExtend.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: jobData
      }, user.company_id);

      if (response.ok) {
        showAlert('success', `Job extended by ${extensionData.extensionMinutes} minutes`);
        setShowExtendJobModal(false);
        setJobToExtend(null);
        setJobToComplete(null); // Clear completion job too
        resetForm();
        setShowEditForm(false);
        setSelectedJob(null);
        loadJobs();
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('Failed to extend job:', response.status, errorText);
        throw new Error('Failed to extend job');
      }
    } catch (error) {
      console.error('Error extending job:', error);
      showAlert('error', 'Failed to extend job');
    }
  };

  // ✅ PHASE 2B: On-Hold Handler
  const handleOnHoldConfirm = async (onHoldData) => {
    if (!jobToHold) return;

    try {
      // Normalize datetime inputs
      const toISOOrNull = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d.toISOString();
      };

      // Build update payload with on-hold details
      const jobData = {
        title: jobToHold.job_title,
        customer_id: jobToHold.customer_id || null,
        employee_id: jobToHold.employee_id || null,
        // Free up tech/time slot while on hold
        scheduled_start: null,
        scheduled_end: null,
        description: jobToHold.description || null,
        notes: jobToHold.notes || null,
        service_address_line_1: jobToHold.street_address || jobToHold.job_location || null,
        service_city: jobToHold.city || null,
        service_state: jobToHold.state || null,
        service_zip_code: jobToHold.zip_code || null,
        status: 'on_hold',
        // ✅ On-hold tracking fields
        on_hold_reason: onHoldData.reason,
        on_hold_notes: onHoldData.notes,
        on_hold_by: user.id,
        estimated_resume_date: onHoldData.estimatedResumeDate || null
      };

      const response = await supaFetch(`work_orders?id=eq.${jobToHold.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: jobData
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Job put on hold successfully');
        setShowOnHoldModal(false);
        setJobToHold(null);
        resetForm();
        setShowEditForm(false);
        setSelectedJob(null);
        loadJobs();

        // TODO: Phase 5 - Send notification to customer if requested
        if (onHoldData.notifyCustomer) {
          console.log('TODO: Send customer notification about hold');
        }
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('Failed to put job on hold:', response.status, errorText);
        throw new Error('Failed to put job on hold');
      }
    } catch (error) {
      console.error('Error putting job on hold:', error);
      showAlert('error', 'Failed to put job on hold');
    }
  };

  // ✅ PHASE 3B: Handler - Start Job
  const handleStartJobConfirm = async (startData) => {
    if (!jobToStart) return;

    try {
      const jobData = {
        status: 'in_progress',
        started_at: startData.actualStartTime,
        start_notes: startData.startNotes,
        timer_enabled: startData.startTimer || false
      };

      const response = await supaFetch(`work_orders?id=eq.${jobToStart.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: jobData
      }, user.company_id);

      if (response.ok) {
        // Ensure reservations exist and generate a pick list on start
        try {
          await inventoryService.reserveForWorkOrder(user.company_id, jobToStart.id);
          await inventoryService.generatePickList(user.company_id, jobToStart.id);
        } catch (e) {
          console.warn('Pick list generation failed (non-blocking):', e?.message || e);
        }
        showAlert('success', 'Job started successfully!');
        setShowStartJobModal(false);
        setJobToStart(null);
        resetForm();
        setShowEditForm(false);
        setSelectedJob(null);
        loadJobs();
      } else {
        throw new Error('Failed to start job');
      }
    } catch (error) {
      console.error('Error starting job:', error);
      showAlert('error', 'Failed to start job');
    }
  };

  // ✅ PHASE 3B: Handler - Resume Job
  const handleResumeJobConfirm = async (resumeData) => {
    if (!jobToResume) return;

    try {
      const jobData = {
        status: resumeData.resumeAction === 'start_now' ? 'in_progress' : 'scheduled',
        resumed_at: new Date().toISOString(),
        on_hold_issue_resolved: true,
        resume_notes: resumeData.resolutionNotes
      };

      // If starting now, also set started_at
      if (resumeData.resumeAction === 'start_now') {
        jobData.started_at = new Date().toISOString();
      }

      const response = await supaFetch(`work_orders?id=eq.${jobToResume.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: jobData
      }, user.company_id);

      if (response.ok) {
        const actionMsg = resumeData.resumeAction === 'start_now' ? 'started' : 'scheduled';
        try {
          // If resuming to scheduled or start_now, ensure reservations exist
          await inventoryService.reserveForWorkOrder(user.company_id, jobToResume.id);
          // If starting now, also pre-generate a pick list
          if (resumeData.resumeAction === 'start_now') {
            await inventoryService.generatePickList(user.company_id, jobToResume.id);
          }
        } catch (e) {
          console.warn('Reservation/Pick list step failed (non-blocking):', e?.message || e);
        }
        // If resuming to scheduled, open Smart Scheduler to pick a new time
        if (resumeData.resumeAction !== 'start_now') {
          try { sessionStorage.setItem('openSmartSchedulingFor', jobToResume.id); } catch (e) {}
        }
        showAlert('success', `Job resumed and ${actionMsg} successfully!`);
        setShowResumeJobModal(false);
        setJobToResume(null);
        resetForm();
        setShowEditForm(false);
        setSelectedJob(null);
        loadJobs();
      } else {
        throw new Error('Failed to resume job');
      }
    } catch (error) {
      console.error('Error resuming job:', error);
      showAlert('error', 'Failed to resume job');
    }
  };

  // ✅ UNIFIED: Handler - Complete Job + Create Invoice + Send Invoice (all in one flow)
  const handleCompletionAndInvoiceConfirm = async (completionData) => {
    if (!jobToComplete) return;

    try {
      // STEP 1: Mark job as completed
      const jobData = {
        status: 'completed',
        work_performed: completionData.workPerformed,
        materials_used: completionData.materialsUsed,
        completion_notes: completionData.completionNotes
      };

      const response = await supaFetch(`work_orders?id=eq.${jobToComplete.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: jobData
      }, user.company_id);

      if (!response.ok) throw new Error('Failed to complete job');

      // STEP 2: Create invoice
      const seqNumber = await settingsService.getAndIncrementInvoiceNumber(user.company_id);
      const rpcRes = await supaFetch('rpc/create_invoice_and_update_work_order', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: {
          p_company_id: user.company_id,
          p_work_order_id: jobToComplete.id,
          p_customer_id: jobToComplete.customer_id,
          p_invoice_number: seqNumber,
          p_total_amount: jobToComplete.total_amount || 0,
          p_subtotal: jobToComplete.total_amount || 0,
          p_tax_amount: 0,
          p_issue_date: completionData.invoiceDate,
          p_due_date: completionData.dueDate,
          p_notes: completionData.invoiceNotes || ''
        }
      }, user.company_id);

      if (!rpcRes.ok) throw new Error('Failed to create invoice');

      const rpcResult = await rpcRes.json();
      if (!rpcResult.success) throw new Error(rpcResult.error || 'Failed to create invoice');

      // STEP 3: Record payment if selected
      if (completionData.recordPaymentNow && completionData.paymentAmount > 0) {
        try {
          await InvoicesService.addPayment(
            rpcResult.invoice_id,
            completionData.paymentAmount,
            completionData.paymentMethod.toUpperCase(),
            user.company_id,
            jobToComplete.customer_id,
            user.id,
            null
          );
        } catch (e) {
          console.warn('Payment recording failed:', e);
        }
      }

      // STEP 4: Send invoice if delivery method selected
      if (completionData.deliveryMethod === 'email') {
        try {
          console.log('📧 Sending invoice via email...');
          // Pass the WORK ORDER ID (not the invoice id) to the email sender
          await invoiceSendingService.sendInvoiceEmail(user.company_id, jobToComplete.id, {
            customMessage: completionData.customMessage,
            includePDF: completionData.includeAttachment
          });
          console.log('✅ Invoice sent successfully');
        } catch (e) {
          console.warn('Invoice email send failed:', e);
          showAlert('warning', 'Invoice created but email send failed. You can send it manually from the Invoices page.');
        }
      }

      showAlert('success', 'Job completed and invoice created successfully!');
      setShowCompletionAndInvoiceModal(false);
      setJobToComplete(null);
      resetForm();
      setShowEditForm(false);
      setSelectedJob(null);
      loadJobs();
    } catch (error) {
      console.error('Error in completion and invoice flow:', error);
      showAlert('error', error.message || 'Failed to complete job and create invoice');
    }
  };



  const deleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to cancel this job: ${jobTitle}? This will archive it and remove it from active jobs.`)) {
      return;
    }

    try {
      console.log('🗑️ deleteJob: Cancelling job', jobId, jobTitle);

      // ✅ ENTERPRISE SOFT DELETE: Set status to 'cancelled' instead of hard delete
      // This preserves:
      // - All invoice history and audit trail
      // - All related timesheets, expenses, documents
      // - All customer communications and feedback
      // - Referential integrity (no FK violations)
      // Matches industry standard (ServiceTitan, Jobber, Housecall Pro)
      const response = await supaFetch(`work_orders?id=eq.${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }, user.company_id);

      console.log('🗑️ deleteJob: PATCH response status:', response.status, 'ok:', response.ok);

      if (response.ok) {
        console.log('✅ deleteJob: Job cancelled successfully, reloading list...');
        showAlert('success', `Job ${jobTitle} cancelled and archived successfully`);
        loadJobs();
      } else {
        const errorText = await response.text();
        console.error('❌ deleteJob: Cancel failed:', errorText);
        throw new Error(`Failed to cancel job: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error cancelling job:', error);
      showAlert('error', `Failed to cancel job: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      job_title: '',
      customer_id: '',
      quote_id: '',
      employee_id: '',  // ✅ INDUSTRY STANDARD: employee_id
      job_status: 'draft',  // ✅ FIXED: lowercase (enum cleanup)
      start_time: '',
      end_time: '',
      job_location: '',
      description: '',
      notes: '',
      estimated_duration: 0,
      actual_duration: 0,
      labor_cost: 0,
      material_cost: 0,
      total_cost: 0
    });
  };

  const openEditForm = (job) => {


    setSelectedJob(job);

    // Determine if this job uses Time & Materials or a model price
    const pricing_model = job.pricing_model || 'TIME_MATERIALS';
    const isTM = pricing_model === 'TIME_MATERIALS';

    // Calculate duration from scheduled times if not set
    let calculatedDuration = job.estimated_duration || 0;
    if (!calculatedDuration && job.scheduled_start && job.scheduled_end) {
      const start = new Date(job.scheduled_start);
      const end = new Date(job.scheduled_end);
      calculatedDuration = Math.round((end - start) / (1000 * 60 * 60)); // Convert ms to hours
    }

    setFormData({
      id: job.id,
      job_title: job.title || job.job_title || '',
      customer_id: job.customer_id || '',
      quote_id: job.quote_id || '',
      assigned_technician_id: job.assigned_to || job.employee_id || job.assigned_technician_id || '',  // ✅ FIX: Form expects 'assigned_technician_id'
      job_status: job.status || (job.stage === 'WORK_ORDER' ? 'scheduled' : job.job_status) || 'draft', // ✅ FIXED: lowercase (enum cleanup)
      start_time: job.scheduled_start ? job.scheduled_start.slice(0, 16) : (job.start_time ? job.start_time.slice(0, 16) : ''), // ✅ FIX: work_orders uses 'scheduled_start'
      end_time: job.scheduled_end ? job.scheduled_end.slice(0, 16) : (job.end_time ? job.end_time.slice(0, 16) : ''), // ✅ FIX: work_orders uses 'scheduled_end'
      job_location: job.job_location || job.work_location || '',
      // Include individual address fields for the new 4-field address form
      // Use service address fields from work_order, fallback to legacy fields
      street_address: job.service_address_line_1 || job.street_address || '',
      city: job.service_city || job.city || '',
      state: job.service_state || job.state || '',
      zip_code: job.service_zip_code || job.zip_code || '',
      description: job.description || '',
      notes: job.notes || '',
      estimated_duration: calculatedDuration, // ✅ FIX: Calculate from scheduled times
      actual_duration: job.actual_duration || 0,
      // Costs: for non-T&M, show total from quote and keep labor/material at 0
      labor_cost: isTM ? (job.labor_cost || 0) : 0,
      material_cost: isTM ? (job.material_cost || 0) : 0,
      total_cost: job.total_amount || job.total_cost || 0,
      // Pricing fields for display/reference
      pricing_model,
      subtotal: job.subtotal || 0,
      tax_rate: job.tax_rate || 0,
      tax_amount: job.tax_amount || 0,
      total_amount: job.total_amount || 0,
      flat_rate_amount: job.flat_rate_amount || null,
      unit_count: job.unit_count || null,
      unit_price: job.unit_price || null,
      percentage: job.percentage || null,
      percentage_base_amount: job.percentage_base_amount || null,
      recurring_interval: job.recurring_interval || null,
      recurring_rate: job.recurring_rate || null,
      recurring_custom_interval_days: job.recurring_custom_interval_days || null,
      milestone_base_amount: job.milestone_base_amount || null,
    });



    setShowEditForm(true);
  };

  // Filter jobs based on search and scheduling status
  const filteredJobs = jobs.filter(job => {
    // Enhanced search: job name, job ID, customer name
    const customerName = customers.find(c => c.id === job.customer_id)?.name || '';
    const jobTitle = job.title || job.job_title || '';
    const jobId = job.id?.toString() || '';

    const matchesSearch = searchTerm === '' ||
                         jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jobId.includes(searchTerm.toLowerCase()) ||
                         customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Scheduling status filter
    let matchesStatus = true;
    if (statusFilter === 'unscheduled') {
      matchesStatus = !job.scheduled_start || String(job.scheduled_start).trim() === '';
    } else if (statusFilter === 'scheduled') {
      matchesStatus = !!(job.scheduled_start && String(job.scheduled_start).trim() !== '');
    }
    // 'all' matches everything

    return matchesSearch && matchesStatus;
  });

  return {
    jobs: filteredJobs,
    customers,
    employees,
    loading,
    showCreateForm,
    showEditForm,
    selectedJob,
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
    // ✅ Cancellation modal state and handlers
    showCancellationModal,
    setShowCancellationModal,
    jobToCancel,
    handleCancellationConfirm,
    // ✅ Rescheduling modal state and handlers
    showReschedulingModal,
    setShowReschedulingModal,
    jobToReschedule,
    handleReschedulingConfirm,
    handleRescheduleNow,
    // ✅ PHASE 2: Completion prompt modal state and handlers
    showCompletionPrompt,
    setShowCompletionPrompt,
    jobToComplete,
    handleCompletionCreateInvoice,
    handleCompletionMarkComplete,
    handleCompletionExtendJob,
    // ✅ PHASE 2: Extend job modal state and handlers
    showExtendJobModal,
    setShowExtendJobModal,
    jobToExtend,
    handleExtendJobConfirm,
    // ✅ PHASE 2B: On-hold modal state and handlers
    showOnHoldModal,
    setShowOnHoldModal,
    jobToHold,
    handleOnHoldConfirm,
    // ✅ PHASE 3B: Start job modal state and handlers
    showStartJobModal,
    setShowStartJobModal,
    jobToStart,
    handleStartJobConfirm,
    // ✅ PHASE 3B: Resume job modal state and handlers
    showResumeJobModal,
    setShowResumeJobModal,
    jobToResume,
    handleResumeJobConfirm,
    // ✅ UNIFIED: Completion + Invoice modal (replaces 3 separate modals)
    showCompletionAndInvoiceModal,
    setShowCompletionAndInvoiceModal,
    jobToComplete,
    handleCompletionAndInvoiceConfirm
  };
};

export default JobsDatabasePanel;
