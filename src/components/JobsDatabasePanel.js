import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import { isStatusTransitionAllowed } from '../utils/statusHelpers';
import CancellationModal from './CancellationModal';
import ReschedulingModal from './ReschedulingModal';
import CompletionPromptModal from './CompletionPromptModal';
import ExtendJobModal from './ExtendJobModal';
import OnHoldModal from './OnHoldModal';

// ✅ PHASE 3B: Import new job modals
import StartJobModal from './StartJobModal';
import ResumeJobModal from './ResumeJobModal';


// Supabase configuration
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';
import settingsService from '../services/SettingsService';
import { computeInvoiceTotals } from '../services/InvoicesService';
import WorkOrderCompletionService from '../services/WorkOrderCompletionService';

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

  // ✅ FIX #2: Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  // jobToComplete already declared at line 38

  // ✅ FIX #3: Invoice creation modal state
  const [showInvoiceCreationModal, setShowInvoiceCreationModal] = useState(false);
  const [jobToInvoice, setJobToInvoice] = useState(null);


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
      // - cancelled: Job cancelled
      // Quote stage → Quotes page, Invoice stage → Invoices page
      let response = await supaFetch(`work_orders?status=in.(approved,scheduled,in_progress,on_hold,needs_rescheduling)&order=created_at.desc&select=*,customers(name,email,phone)`, { method: 'GET' }, user.company_id);

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
      // ✅ INDUSTRY STANDARD: Job stage only (approved → completed)
      // Matches ServiceTitan/Jobber/Housecall Pro: Jobs page shows job-stage statuses only
      // Quote stage → Quotes page, Invoice stage → Invoices page
      const response = await supaFetch(`work_orders?status=in.(approved,scheduled,in_progress,on_hold,needs_rescheduling)&select=*,customers(name,address,phone,email)&order=created_at.desc`, { method: 'GET' }, user.company_id);
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
                  { method: 'PATCH', headers: { 'Prefer': 'return=representation' }, body: { status: 'invoiced', invoice_id: createdInvoice.id, invoice_date: createdInvoice.issued_at || createdInvoice.created_at || new Date().toISOString() } },
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
      // ✅ INDUSTRY STANDARD: Query employees table, filter by is_schedulable
      // JOIN with users table to get name, role, status
      // Matches Jobber/ServiceTitan/Housecall Pro pattern
      // NOTE: Filter on main table uses column=eq.value, filter on joined table uses table.column=eq.value
      const response = await supaFetch(
        `employees?select=id,user_id,job_title,is_schedulable,users!inner(id,first_name,last_name,name,role,status)&is_schedulable=eq.true&order=users(name).asc`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        // Map to expected format (employees table joined with users table)
        const mappedEmployees = data
          .filter(emp => emp.users) // Only include if user data exists
          .map(emp => ({
            id: emp.user_id, // Use user_id for consistency
            employee_id: emp.id, // Employee record ID
            full_name: emp.users.name, // ✅ Use computed name column from users
            first_name: emp.users.first_name,
            last_name: emp.users.last_name,
            role: emp.users.role,
            status: emp.users.status,
            job_title: emp.job_title
          }));

        // Only field roles are schedulable by default
        const allowedRoles = new Set(['technician', 'lead_technician', 'field_tech']);
        setEmployees(mappedEmployees.filter(emp => allowedRoles.has((emp.role || '').toLowerCase())));
      }
    } catch (error) {
      console.error('Error loading employees:', error);
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
        body: woData
      }, user.company_id);

      if (response.ok) {
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
      const existingRes = await supaFetch(`invoices?select=id,invoice_number&job_id=eq.${job.id}&order=created_at.desc&limit=1`, { method: 'GET' }, user.company_id);
      if (existingRes.ok) {
        const [existing] = await existingRes.json();
        if (existing) {
          showAlert('success', `Invoice ${existing.invoice_number} already exists for this job`);
          if (navigateOnSuccess) {
            setTimeout(() => {
              window.location.href = `/invoices?view=${existing.id}`;
            }, 500);
          }
          return existing;
        }
      }

      // 2) Create a new invoice
      const seqNumber = await settingsService.getAndIncrementInvoiceNumber(user.company_id);
      // Compute due_date from settings to avoid DB default 14 days
      const issuedDate = new Date();
      let dueDateISO = null;
      try {
        const res = await supaFetch(`settings?select=default_invoice_terms,default_invoice_due_days&limit=1`, { method: 'GET' }, user.company_id);
        let days = 0;
        let terms = null;
        if (res.ok) {
          const rows = await res.json();
          if (rows?.length) {
            terms = rows[0].default_invoice_terms;
            const d = rows[0].default_invoice_due_days;
            if (typeof d === 'number') days = d;
            else if (terms && /NET_(\d{1,3})/.test(terms)) days = parseInt(terms.match(/NET_(\d{1,3})/)[1], 10);
          }
        }
        const due = new Date(issuedDate);
        due.setDate(due.getDate() + (Number.isFinite(days) ? days : 0));
        due.setHours(0,0,0,0);
        dueDateISO = due.toISOString();
      } catch (e) {
        dueDateISO = new Date(issuedDate).toISOString();
      }

      const invoiceData = {
        job_id: job.id,
        customer_id: job.customer_id,
        invoice_number: seqNumber,
        total_amount: job.total_cost || job.total_amount || 0,
        status: 'UNPAID',
        issued_at: issuedDate.toISOString(),
        due_date: dueDateISO,
        // Include job description so customers know what work was performed
        notes: job.description ? `Work Performed: ${job.description}` : `Invoice for job: ${job.title || job.job_title || 'Untitled Job'}`
      };



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

      const response = await supaFetch(`invoices`, {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: invoiceData
      }, user.company_id);

      if (response.ok) {
        const responseText = await response.text();
        const created = responseText ? JSON.parse(responseText) : null;
        const createdInvoice = Array.isArray(created) ? created[0] : created;


        // Create invoice items from mappedItems
        await pushInvoiceItems(createdInvoice.id, mappedItems);

        // Recompute totals using service compute and PATCH invoice
        try {
          const subtotal = mappedItems.reduce((s, it) => s + (Number(it.line_total || 0) - Number(it.tax_amount || 0)), 0);
          const tax_amount = mappedItems.reduce((s, it) => s + Number(it.tax_amount || 0), 0);
          const total_amount = subtotal + tax_amount;
          await supaFetch(`invoices?id=eq.${createdInvoice.id}`, {
            method: 'PATCH',
            headers: { 'Prefer': 'return=representation' },
            body: {
              subtotal,
              tax_amount,
              total_amount,
              discount_amount: 0,
              status: total_amount > 0 ? 'UNPAID' : 'PAID'
            }
          }, user.company_id);
        } catch (e) {
          console.warn('Failed to compute totals for invoice:', e);
        }
        showAlert('success', 'Invoice created successfully!');

        // Link work order to invoice (only set invoice_id to avoid 400 errors)
        if (createdInvoice?.id) {
          try {
            const patchBody = {
              invoice_id: createdInvoice.id
            };
            const linkRes = await supaFetch(`work_orders?id=eq.${job.id}`, {
              method: 'PATCH',
              headers: { 'Prefer': 'return=representation' },
              body: patchBody
            }, user.company_id);

            if (!linkRes.ok) {
              const t = await linkRes.text().catch(() => '');
              console.warn('⚠️ Failed to link work_order to invoice:', linkRes.status, t);
            }
          } catch (e) {
            console.warn('⚠️ Link request failed:', e);
          }
        }

        if (navigateOnSuccess && createdInvoice?.id) {
          setTimeout(() => {
            window.location.href = `/invoices?view=${createdInvoice.id}`;
          }, 800);
        }

        return createdInvoice;
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('❌ Invoice creation failed:', response.status, errorText);
        throw new Error(`Failed to create invoice: ${response.status}`);
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

      // ✅ FIX #2: INTERCEPT COMPLETION (in_progress → completed)
      if (status === 'completed' && currentStatus === 'in_progress') {
        setJobToComplete({ ...selectedJob, ...formData });
        setShowCompletionModal(true);
        return; // Don't proceed with update yet
      }

      // ✅ FIX #3: INTERCEPT INVOICE CREATION (completed → invoiced)
      if (status === 'invoiced' && currentStatus === 'completed') {
        setJobToInvoice({ ...selectedJob, ...formData });
        setShowInvoiceCreationModal(true);
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
          // Create invoice and let createInvoiceFromJob handle navigation
          try {
            const createdInvoice = await createInvoiceFromJob(updated || selectedJob, true); // navigateOnSuccess = true
            const invoiceId = Array.isArray(createdInvoice) ? createdInvoice[0]?.id : createdInvoice?.id;

            if (invoiceId) {
              // Link work_order to invoice (avoid status/stage to satisfy DB guard)
              const patchBody = { invoice_id: invoiceId };
              const linkRes = await supaFetch(`work_orders?id=eq.${selectedJob.id}`, {
                method: 'PATCH',
                headers: { 'Prefer': 'return=representation' },
                body: patchBody
              }, user.company_id);

              if (!linkRes.ok) {
                const t = await linkRes.text().catch(() => '');
                console.error('Failed to link work_order to invoice:', linkRes.status, t);
              }


              // Don't navigate here - let createInvoiceFromJob handle it
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

  // ✅ FIX #2: Handler - Complete Job
  const handleCompletionConfirm = async (completionData) => {
    if (!jobToComplete) return;

    try {
      const jobData = {
        status: 'completed',
        work_performed: completionData.workPerformed,
        materials_used: completionData.materialsUsed,
        completion_notes: completionData.completionNotes
        // ✅ completed_at will be set by database trigger automatically
      };

      const response = await supaFetch(`work_orders?id=eq.${jobToComplete.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: jobData
      }, user.company_id);

      if (response.ok) {
        // Phase 2: persist checklist/photos/signature (best effort; do not block completion)
        try {
          await WorkOrderCompletionService.saveAll({
            companyId: user.company_id,
            workOrderId: jobToComplete.id,
            userId: user.id,
            checklist: completionData.checklist || [],
            photos: completionData.photos || [],
            signature: completionData.signature || null,
            closeoutSummary: {
              customerName: jobToComplete?.customers?.name,
              jobTitle: jobToComplete?.job_title || jobToComplete?.title,
              completion: {
                performed: completionData.workPerformed,
                materials: completionData.materialsUsed,
                notes: completionData.completionNotes,
                completedAt: completionData.completionDateTime
              },
              checklist: completionData.checklist || []
            }
          });
        } catch (e) {
          console.warn('Completion extras save failed', e);
        }

        showAlert('success', 'Job completed successfully!');
        setShowCompletionModal(false);

        // If user wants to create invoice now, show invoice creation modal
        if (completionData.createInvoiceNow) {
          // Get the updated job data with completion info
          const updatedJob = {
            ...jobToComplete,
            work_performed: completionData.workPerformed,
            materials_used: completionData.materialsUsed,
            status: 'completed'
          };
          setJobToInvoice(updatedJob);
          setJobToComplete(null);
          setShowInvoiceCreationModal(true);
        } else {
          setJobToComplete(null);
          resetForm();
          setShowEditForm(false);
          setSelectedJob(null);
          loadJobs();
        }
      } else {
        throw new Error('Failed to complete job');
      }
    } catch (error) {
      console.error('Error completing job:', error);
      showAlert('error', 'Failed to complete job');
    }
  };

  // ✅ FIX #3: Handler - Create Invoice
  const handleInvoiceCreationConfirm = async (invoiceData) => {
    if (!jobToInvoice) return;

    try {
      const workOrderData = {
        status: 'invoiced',
        invoice_date: invoiceData.invoiceDate,
        due_date: invoiceData.dueDate,
        payment_terms: invoiceData.paymentTerms,
        invoice_notes: invoiceData.invoiceNotes,
        invoice_sent_at: invoiceData.sendNow ? new Date().toISOString() : null
        // ✅ invoiced_at will be set by database trigger automatically
      };

      const response = await supaFetch(`work_orders?id=eq.${jobToInvoice.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: workOrderData
      }, user.company_id);

      if (response.ok) {
        const sendMsg = invoiceData.sendNow ? ' and sent to customer' : '';
        showAlert('success', `Invoice created${sendMsg} successfully!`);
        setShowInvoiceCreationModal(false);
        setJobToInvoice(null);

        // Navigate to invoices page to show the new invoice
        navigate('/invoices');
      } else {
        throw new Error('Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      showAlert('error', 'Failed to create invoice');
    }
  };

  const deleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to delete job: ${jobTitle}?`)) {
      return;
    }

    try {
      const response = await supaFetch(`work_orders?id=eq.${jobId}`, { method: 'DELETE' }, user.company_id);

      if (response.ok) {
        showAlert('success', `Job ${jobTitle} deleted successfully`);
        loadJobs();
      } else {
        throw new Error('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      showAlert('error', 'Failed to delete job');
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
    // ✅ FIX #2: Completion modal state and handlers
    showCompletionModal,
    setShowCompletionModal,
    // jobToComplete already returned at line 1445
    handleCompletionConfirm,
    // ✅ FIX #3: Invoice creation modal state and handlers
    showInvoiceCreationModal,
    setShowInvoiceCreationModal,
    jobToInvoice,
    handleInvoiceCreationConfirm
  };
};

export default JobsDatabasePanel;
