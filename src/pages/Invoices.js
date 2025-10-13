import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSupabaseClient } from '../utils/supabaseClient';
import { supaFetch } from '../utils/supaFetch';
import { createCurrencyInputProps, createPercentageInputProps } from '../utils/inputUtils';
import PageHeader from '../components/Common/PageHeader';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';
import ModernCard from '../components/Common/ModernCard';
import '../styles/modern-enhancements.css';

import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  PaperAirplaneIcon,
  CreditCardIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ChartBarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  PhotoIcon,
  XMarkIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  PrinterIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  XCircleIcon as XCircleIconSolid
} from '@heroicons/react/24/solid';
import settingsService from '../services/SettingsService';
import InvoiceTemplate from '../components/InvoiceTemplate';
import { formatCurrency as fmtCurrency } from '../utils/formatters';

import InvoiceFormModal from '../components/InvoiceFormModal';
import { InvoicesService } from '../services/InvoicesService';
import { EmailService } from '../services/EmailService';
import PaymentReceiptService from '../services/PaymentReceiptService';

// ✅ PHASE 3C: Import new invoice modals
import PaymentModal from '../components/PaymentModal';
import CloseWorkOrderModal from '../components/CloseWorkOrderModal';


// Export Customer Statements (PDF) - module-level helper with branding
const exportStatementsPDF = async (rows, companyId) => {
  try {
    // Load company branding/settings
    let companyProfile = null, businessSettings = null;
    try {
      companyProfile = await settingsService.getCompanyProfile(companyId);
      businessSettings = await settingsService.getBusinessSettings(companyId);
    } catch {}
    const company = { ...(businessSettings || {}), ...(companyProfile || {}) };
    const logoUrl = company.company_logo_url || company.logo_url || '';

    const byCustomer = rows.reduce((acc, inv)=>{
      const name = inv.customers?.name || 'Unknown Customer';
      acc[name] = acc[name] || [];
      acc[name].push(inv);
      return acc;
    }, {});

    const html = `<!DOCTYPE html><html><head><meta charset='utf-8'/>
      <title>Customer Statements</title>
      <style>
        body{font-family:Arial,sans-serif;color:#111;padding:24px}
        header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .brand{display:flex;align-items:center;gap:12px}
        .brand img{height:36px}
        h1{margin:8px 0 0 0;font-size:20px}
        h2{margin-top:24px;border-bottom:1px solid #eee;padding-bottom:4px}
        table{width:100%;border-collapse:collapse;margin-top:8px}
        th,td{padding:6px;border-bottom:1px solid #f2f2f2;text-align:left;font-size:12px}
        .right{text-align:right}
        .tot{font-weight:700}
      </style></head><body>
      <header>
        <div class="brand">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo"/>` : ''}
          <div>
            <div style="font-weight:700">${company.name || company.company_name || 'TradeMate Pro'}</div>
            ${company.street_address ? `<div style="font-size:12px;color:#555">${company.street_address}${company.city?', '+company.city:''}${company.state?' '+company.state:''}${company.postal_code?' '+company.postal_code:''}</div>` : ''}
          </div>
        </div>
        <div style="font-size:12px;color:#555">${new Date().toLocaleDateString()}</div>
      </header>
      <h1>Customer Statements</h1>
      ${Object.entries(byCustomer).map(([name,invs])=>{
        const total = invs.reduce((s,i)=>s+Number(i.total_amount||0),0);
        return `<h2>${name}</h2>
          <table><thead><tr><th>Invoice #</th><th>Status</th><th>Issued</th><th>Due</th><th class='right'>Amount</th></tr></thead>
          <tbody>
            ${invs.map(i=>`<tr><td>${i.invoice_number||''}</td><td>${i.invoice_status||i.status||''}</td>
              <td>${(i.issued_at||i.created_at||'').toString().slice(0,10)}</td>
              <td>${(i.due_date||i.due_at||'').toString().slice(0,10)}</td>
              <td class='right'>$${Number(i.total_amount||0).toFixed(2)}</td></tr>`).join('')}
            <tr><td colspan='4' class='tot right'>Total</td><td class='right tot'>$${total.toFixed(2)}</td></tr>
          </tbody></table>`;
      }).join('')}
    </body></html>`;

    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
      try { w.focus(); } catch {}
    }
  } catch (e) { console.warn('exportStatementsPDF failed', e); }
};

const Invoices = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Core data
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // UI state
  // Saved Views (Invoices)
  const savedDropdownRef = useRef(null);
  const storageKey = useMemo(() => `invoices_saved_views_${user?.company_id || 'guest'}`,[user?.company_id]);
  const lastViewKey = useMemo(() => `invoices_last_view_${user?.company_id || 'guest'}`,[user?.company_id]);
  const [savedViews, setSavedViews] = useState([]);
  const [showManageViews, setShowManageViews] = useState(false);
  const [selectedViewName, setSelectedViewName] = useState('');

  // Competitive enhancement states
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPaymentReminders, setShowPaymentReminders] = useState(false);
  const [showPaymentPlans, setShowPaymentPlans] = useState(false);
  const [showCommissions, setShowCommissions] = useState(false);
  const [showRevenueForecasting, setShowRevenueForecasting] = useState(false);
  const [invoiceAnalytics, setInvoiceAnalytics] = useState([]);
  const [paymentReminders, setPaymentReminders] = useState([]);
  const [paymentPlans, setPaymentPlans] = useState([]);
  const [commissionData, setCommissionData] = useState([]);
  const [revenueForecasts, setRevenueForecasts] = useState([]);
  const [customerPaymentBehavior, setCustomerPaymentBehavior] = useState([]);

  // ✅ PHASE 3C: New invoice modal states
  const [showPaymentModalNew, setShowPaymentModalNew] = useState(false);
  const [invoiceToPayment, setInvoiceToPayment] = useState(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [invoiceToClose, setInvoiceToClose] = useState(null);

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
    setDateRange(view.dateRange||{start:'',end:''});
    try { localStorage.setItem(lastViewKey, view.name); } catch {}
    window?.toast?.success?.('View applied');
  };
  const quickSaveCurrentView = () => {
    const base='View'; let i=1; const names = new Set(savedViews.map(v=>v.name)); while(names.has(base+' '+i)) i++;
    const newView = { name: base+' '+i, searchTerm, statusFilter, dateRange };
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => (searchParams.get('filter') || 'all')); // all, outstanding, paid, overdue
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Debug modal state changes
  useEffect(() => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`🎭 [${timestamp}] Detail modal state changed:`, showDetailModal, 'for invoice:', selectedInvoice?.id);
  }, [showDetailModal, selectedInvoice]);

  useEffect(() => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`🛠️ [${timestamp}] Edit modal state changed:`, showEditForm, 'selected invoice:', selectedInvoice?.id);
  }, [showEditForm, selectedInvoice]);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });


  // Selection for batch email
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState(new Set());
  const toggleInvoiceSelected = (id) => {
    setSelectedInvoiceIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSelectAllVisible = () => {
    setSelectedInvoiceIds(prev => {
      const idsOnPage = sortedInvoices.map(inv => inv.id);
      const allSelected = idsOnPage.length>0 && idsOnPage.every(id => prev.has(id));
      const next = new Set(prev);
      idsOnPage.forEach(id => { if (allSelected) next.delete(id); else next.add(id); });
      return next;
    });
  };
  // Placeholder: batch email (marks as sent will come later)
  const batchEmailSelected = async () => {
    const ids = Array.from(selectedInvoiceIds);
    if (ids.length === 0) return showAlert('info', 'No invoices selected');
    showAlert('info', 'Email sending is coming soon. For now, this will mark as SENT in a future update.');
  };

  // Payments modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);

	  const [paymentsHistory, setPaymentsHistory] = useState([]);



	  // Record Payment modal local state
	  const [paymentAmount, setPaymentAmount] = useState('');

	  useEffect(() => {
	    if (!showPaymentModal || !activeInvoice) return;
	    (async () => {
	      const list = await fetchPaymentsFor(activeInvoice.id);



	      const paidToDate = list.reduce((s, p) => s + Number(p.amount || 0), 0);
	      const total = Number(activeInvoice.total_amount || 0);
	      setPaymentsHistory(list);

	      const remain = Math.max(0, total - paidToDate);
	      setRemainingBalance(remain);
	      setPaymentAmount(remain > 0 ? String(remain.toFixed(2)) : '');
	      // Prefer last used method if available
	      const last = list[list.length - 1];
	      if (last?.payment_method) setPaymentMethod(last.payment_method);
	      setPaymentReference(''); setPaymentNote(''); setPaymentRefund(false);
	    })();
	  }, [showPaymentModal, activeInvoice]);

	  const [paymentMethod, setPaymentMethod] = useState('cash');
	  const [paymentReference, setPaymentReference] = useState('');
	  const [paymentNote, setPaymentNote] = useState('');
	  const [paymentRefund, setPaymentRefund] = useState(false);
	  const [remainingBalance, setRemainingBalance] = useState(0);

  const openPaymentModal = (invoice) => {
    setActiveInvoice(invoice);
    setShowPaymentModal(true);
  };

  const fetchPaymentsFor = async (invoiceId) => {
    const res = await supaFetch(`payments?invoice_id=eq.${invoiceId}`, { method: 'GET' }, user.company_id);
    return res.ok ? await res.json() : [];
  };

  const recordPayment = async ({ amount, method, reference, note, refund }) => {
    if (!activeInvoice) return;

    try {
      // Compute current paid-to-date for safeguard
      const list = await fetchPaymentsFor(activeInvoice.id);
      const paidToDate = list.reduce((s, p) => s + Number(p.amount || 0), 0);
      const total = Number(activeInvoice.total_amount || 0);
      const remaining = Math.max(0, total - paidToDate);

      const amt = Number(amount || 0);
      if (!refund && amt > remaining + 0.005) {
        showAlert('error', `Payment exceeds remaining balance by $${(amt - remaining).toFixed(2)}. Enter a valid amount or mark as refund.`);
        return;
      }

      const signedAmount = refund ? -Math.abs(amt) : Math.abs(amt);
      const createdPayment = await InvoicesService.addPayment(
        activeInvoice.id,
        signedAmount,
        method,
        user.company_id,
        activeInvoice.customer_id,
        user.id,
        reference || null
      );
      try {
        PaymentReceiptService.openReceiptWindow(activeInvoice, createdPayment);
        await EmailService.sendPaymentReceipt(user.company_id, activeInvoice.id, createdPayment.id);
      } catch (e) { /* non-blocking */ }

      const justPaid = !refund && Math.abs(amt - remaining) <= 0.005;
      if (justPaid) {
        // Optimistically update UI to reflect paid status without waiting for reload
        setInvoices(prev => prev.map(inv => inv.id === activeInvoice.id ? { ...inv, invoice_status: 'PAID', status: 'PAID' } : inv));
      }

      showAlert('success', refund ? 'Refund recorded' : (justPaid ? 'Payment recorded. Invoice marked as paid.' : 'Payment recorded'));
      setShowPaymentModal(false);
      setActiveInvoice(null);
      await loadInvoices();
    } catch (e) {
      console.error('Record payment failed', e);
      showAlert('error', 'Failed to record payment');
    }
  };

  // Form data
  const [formData, setFormData] = useState({
    customer_id: '',
    job_id: '',
    invoice_number: '',
    title: '',
    description: '',
    line_items: [],
    subtotal: 0,
    tax_rate: 0,
    tax_amount: 0,
    total_amount: 0,
    status: 'UNPAID',
    due_date: '',
    notes: '',
    terms_conditions: ''
  });

  const [businessSettings, setBusinessSettings] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [invoiceConfig, setInvoiceConfig] = useState(null);

  useEffect(() => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`📄 [${timestamp}] Invoices page mounted/updated`);
    console.log(`📄 [${timestamp}] URL params:`, new URLSearchParams(window.location.search).toString());
    console.log(`📄 [${timestamp}] showDetailModal state:`, showDetailModal);
    console.log(`📄 [${timestamp}] selectedInvoice:`, selectedInvoice?.id);
    console.log(`📄 [${timestamp}] user?.company_id:`, user?.company_id);
    console.log(`📄 [${timestamp}] Stack trace:`, new Error().stack?.split('\n').slice(1, 4));

    if (user?.company_id) {
      (async () => {
        const [businessSettings, companyProfile, invoiceConfig] = await Promise.all([
          settingsService.getBusinessSettings(user.company_id),
          settingsService.getCompanyProfile(user.company_id),
          settingsService.getInvoiceConfig(user.company_id)
        ]);
        setBusinessSettings(businessSettings);
        setCompanyProfile(companyProfile);
        setInvoiceConfig(invoiceConfig);
      })();
      loadAllData();
    }
  }, [user?.company_id]);

  // Apply URL filter (e.g., aging_*) when page loads
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) setStatusFilter(filterParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Keep URL in sync when statusFilter changes so refresh keeps filter
  useEffect(() => {
    const current = searchParams.get('filter') || 'all';
    if (statusFilter !== current) {
      const next = new URLSearchParams(searchParams);
      if (statusFilter === 'all') next.delete('filter'); else next.set('filter', statusFilter);
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);


  useEffect(() => {
    const viewInvoiceId = searchParams.get('view');
    const guardKey = `opening_invoice_${viewInvoiceId}`;
    const guardValue = sessionStorage.getItem(guardKey);

    if (viewInvoiceId && !guardValue) {
      sessionStorage.setItem(guardKey, Date.now().toString());
      loadAndShowInvoice(viewInvoiceId);
    }
  }, [searchParams]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadInvoices(),
        loadCustomers(),
        loadJobs()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showAlert('error', 'Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      const supabase = getSupabaseClient();
      // ✅ FIX: Specify FK relationship to avoid "multiple relationships" error
      const { data, error } = await supabase
        .from('invoices')
        .select('*,customers(name,email,phone),work_orders!work_order_id(id,title)')
        .eq('company_id', user.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch invoices: ${error.message}`);
      }

      const normalized = (data || []).map(inv => ({ ...inv, invoice_status: inv.status }));
      setInvoices(normalized);
      try {
        // Generate overdue notifications (non-blocking)
        const { default: NotificationGenerator } = await import('../services/NotificationGenerator');
        const overdueNow = (normalized || []).filter(inv => {
          if (!inv.due_date) return false;
          const due = new Date(inv.due_date);
          return inv.invoice_status !== 'PAID' && inv.invoice_status !== 'VOID' && due < new Date();
        });
        for (const inv of overdueNow) {
          await NotificationGenerator.invoiceOverdue(user.company_id, inv);
        }
      } catch (e) { /* ignore */ }
    } catch (error) {
      console.error('Error loading invoices:', error);
      return [];
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await supaFetch('customers?select=*&order=name.asc', { method: 'GET' }, user.company_id);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data || []);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadJobs = async () => {
    try {
      // Use unified status field - load jobs for invoicing
      const response = await supaFetch('work_orders?select=*,customers(name)&status=in.(scheduled,in_progress,completed)&order=created_at.desc', { method: 'GET' }, user.company_id);
      if (response.ok) {
        const data = await response.json();
        setJobs(data || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  // ✅ PHASE 3C: Handler - Record Payment
  const handlePaymentConfirm = async (paymentData) => {
    if (!invoiceToPayment) return;

    try {
      const invoiceData = {
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_amount: paymentData.paymentAmount,
        payment_method: paymentData.paymentMethod,
        payment_reference: paymentData.referenceNumber,
        payment_notes: paymentData.notes
      };

      const response = await supaFetch(`work_orders?id=eq.${invoiceToPayment.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: invoiceData
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Payment recorded successfully!');
        setShowPaymentModalNew(false);
        setInvoiceToPayment(null);
        await loadInvoices();
      } else {
        throw new Error('Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      showAlert('error', 'Failed to record payment');
    }
  };

  // ✅ PHASE 3C: Handler - Close Work Order
  const handleCloseConfirm = async (closeData) => {
    if (!invoiceToClose) return;

    try {
      const invoiceData = {
        status: 'closed',
        closed_at: new Date().toISOString(),
        customer_satisfaction_rating: closeData.satisfactionRating,
        final_notes: closeData.finalNotes,
        lessons_learned: closeData.lessonsLearned,
        request_review: closeData.requestReview || false
      };

      const response = await supaFetch(`work_orders?id=eq.${invoiceToClose.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: invoiceData
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Work order closed successfully!');
        setShowCloseModal(false);
        setInvoiceToClose(null);
        await loadInvoices();
      } else {
        throw new Error('Failed to close work order');
      }
    } catch (error) {
      console.error('Error closing work order:', error);
      showAlert('error', 'Failed to close work order');
    }
  };

  const loadAndShowInvoice = async (invoiceId) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`🔍 [${timestamp}] loadAndShowInvoice called for:`, invoiceId);

    try {
      // Skip if modal is already open for this invoice
      if (showDetailModal && selectedInvoice?.id === invoiceId) {
        console.log(`🔍 [${timestamp}] SKIPPING: Modal already open for invoice:`, invoiceId);
        return;
      }

      console.log(`🔍 [${timestamp}] Loading fresh invoice data...`);
      // Ensure we have freshest data
      const fresh = await loadInvoices();
      const invoice = (fresh || []).find(inv => inv.id === invoiceId);

      // If user closed the modal or URL param changed while loading, do not reopen
      const currentViewId = new URLSearchParams(window.location.search).get('view');
      if (currentViewId !== invoiceId) {
        console.log(`🔍 [${timestamp}] ABORT: view param changed or cleared; not opening modal for:`, invoiceId);
        return;
      }

      if (invoice) {
        console.log(`🔍 [${timestamp}] OPENING MODAL: Found invoice, opening modal for:`, invoiceId);
        setSelectedInvoice(invoice);
        setShowDetailModal(true);
        showAlert('success', 'Invoice loaded');
        // Don't clear URL params - this was causing the modal to close/reopen
        // setSearchParams({});
      } else {
        console.log('❌ URL navigation: Invoice not found:', invoiceId);
        showAlert('error', 'Invoice not found');
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      showAlert('error', 'Failed to load invoice');
    }
  };

  // Calculate invoice analytics
  const getInvoiceAnalytics = () => {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const unpaidInvoices = invoices.filter(inv => inv.status === 'UNPAID');
    const partiallyPaidInvoices = invoices.filter(inv => inv.status === 'PARTIALLY_PAID');
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID');
    const overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE');
    const voidInvoices = invoices.filter(inv => inv.status === 'VOID');

    // Calculate additional overdue invoices (beyond status-based)
    const additionalOverdueInvoices = invoices.filter(inv => {
      if (inv.status === 'PAID' || inv.status === 'VOID' || !inv.due_date) return false;
      const dueDate = new Date(inv.due_date);
      return dueDate < today && inv.status !== 'OVERDUE';
    });

    // Total overdue count includes both status-based and date-based
    const totalOverdueCount = overdueInvoices.length + additionalOverdueInvoices.length;

    const outstandingBalance = invoices
      .filter(inv => ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status))
      .reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);

    const totalPaidThisMonth = invoices
      .filter(inv => inv.status === 'PAID' && new Date(inv.updated_at) >= thisMonth)
      .reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);

    const overdueBalance = overdueInvoices
      .reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);

    // Calculate average days to pay
    const paidInvoicesWithDates = paidInvoices.filter(inv => inv.created_at && inv.updated_at);
    const avgDaysToPay = paidInvoicesWithDates.length > 0
      ? paidInvoicesWithDates.reduce((sum, inv) => {
          const created = new Date(inv.created_at);
          const paid = new Date(inv.updated_at);
          return sum + Math.ceil((paid - created) / (1000 * 60 * 60 * 24));
        }, 0) / paidInvoicesWithDates.length
      : 0;

    return {
      totalInvoices: invoices.length,
      unpaidInvoices: unpaidInvoices.length,
      partiallyPaidInvoices: partiallyPaidInvoices.length,
      paidInvoices: paidInvoices.length,
      overdueInvoices: totalOverdueCount,
      voidInvoices: voidInvoices.length,
      outstandingBalance,
      totalPaidThisMonth,
      overdueBalance,
      avgDaysToPay: Math.round(avgDaysToPay)
    };
  };

  const analytics = getInvoiceAnalytics();

  // Filter invoices
  // Sorting state
  const [sortBy, setSortBy] = useState({ key: 'issued_at', dir: 'desc' });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !searchTerm ||
      invoice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'outstanding' && ['UNPAID', 'PARTIALLY_PAID'].includes(invoice.status)) ||
      (statusFilter === 'paid' && invoice.status === 'PAID') ||
      (statusFilter === 'overdue' && (invoice.status === 'OVERDUE' || isOverdue(invoice))) ||
      (statusFilter === 'aging_0_30' && isOverdue(invoice) && daysOverdue(invoice) <= 30) ||
      (statusFilter === 'aging_31_60' && isOverdue(invoice) && daysOverdue(invoice) > 30 && daysOverdue(invoice) <= 60) ||
      (statusFilter === 'aging_61_90' && isOverdue(invoice) && daysOverdue(invoice) > 60 && daysOverdue(invoice) <= 90) ||
      (statusFilter === 'aging_90_plus' && isOverdue(invoice) && daysOverdue(invoice) > 90);

    const matchesDateRange = (!dateRange.start || new Date(invoice.created_at) >= new Date(dateRange.start)) &&
                            (!dateRange.end || new Date(invoice.created_at) <= new Date(dateRange.end));

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Utility functions
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      job_id: '',
      invoice_number: '',
      title: '',
      description: '',
      line_items: [],
      subtotal: 0,
      tax_rate: 0,
      tax_amount: 0,
      total_amount: 0,
      status: 'UNPAID',
      due_date: '',
      notes: '',
      terms_conditions: ''
    });
  };

  // Load competitive enhancement data
  const loadInvoiceAnalytics = async () => {
    try {
      const response = await supaFetch('invoice_performance_dashboard?select=*', {
        method: 'GET'
      }, user.company_id);

      if (response.ok) {
        const data = await response.json();
        setInvoiceAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading invoice analytics:', error);
    }
  };

  const loadPaymentReminders = async () => {
    try {
      const response = await supaFetch('payment_reminders?select=*,invoices(invoice_number,total_amount,customers(name))&order=scheduled_date.asc', {
        method: 'GET'
      }, user.company_id);

      if (response.ok) {
        const data = await response.json();
        setPaymentReminders(data);
      }
    } catch (error) {
      console.error('Error loading payment reminders:', error);
    }
  };

  const loadPaymentPlans = async () => {
    try {
      const response = await supaFetch('payment_plans?select=*,invoices(invoice_number,total_amount),customers(name)&order=created_at.desc', {
        method: 'GET'
      }, user.company_id);

      if (response.ok) {
        const data = await response.json();
        setPaymentPlans(data);
      }
    } catch (error) {
      console.error('Error loading payment plans:', error);
    }
  };

  const loadCommissionData = async () => {
    try {
      const response = await supaFetch('sales_rep_commission_summary?select=*&order=total_sales.desc', {
        method: 'GET'
      }, user.company_id);

      if (response.ok) {
        const data = await response.json();
        setCommissionData(data);
      }
    } catch (error) {
      console.error('Error loading commission data:', error);
    }
  };

  const loadRevenueForecasts = async () => {
    try {
      const response = await supaFetch('revenue_forecasts?select=*&order=forecast_date.desc&limit=12', {
        method: 'GET'
      }, user.company_id);

      if (response.ok) {
        const data = await response.json();
        setRevenueForecasts(data);
      }
    } catch (error) {
      console.error('Error loading revenue forecasts:', error);
    }
  };

  const loadCustomerPaymentBehavior = async () => {
    try {
      const response = await supaFetch('customer_payment_summary?select=*&order=payment_reliability_score.desc', {
        method: 'GET'
      }, user.company_id);

      if (response.ok) {
        const data = await response.json();
        setCustomerPaymentBehavior(data);
      }
    } catch (error) {
      console.error('Error loading customer payment behavior:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'UNPAID': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border border-blue-200', label: 'Unpaid', icon: ClockIcon },
      'PARTIALLY_PAID': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border border-yellow-200', label: 'Partially Paid', icon: ClockIcon },
      'PAID': { bg: 'bg-green-100', text: 'text-green-800', border: 'border border-green-200', label: 'Paid', icon: CheckCircleIcon },
      'OVERDUE': { bg: 'bg-red-100', text: 'text-red-800', border: 'border border-red-200', label: 'Overdue', icon: ExclamationTriangleIcon },
      'VOID': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border border-gray-200', label: 'Void', icon: XCircleIcon }
    };
    const cfg = statusMap[status] || statusMap['UNPAID'];
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
        <Icon className="w-4 h-4 mr-1" /> {cfg.label}
      </span>
    );
  };
  const agingBucket = (invoice) => {
    const d = daysOverdue(invoice);
    if (d <= 0) return null;
    if (d <= 30) return '0-30';
    if (d <= 60) return '31-60';
    if (d <= 90) return '61-90';
    return '91+';
  };

  // Consistent aging badge renderer used in list and detail views
  const renderAgingBadge = (invoice) => {
    const bucket = agingBucket(invoice);
    if (!bucket) return null;
    const cls = bucket === '0-30'
      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
      : bucket === '31-60'
        ? 'bg-orange-50 text-orange-700 border border-orange-200'
        : bucket === '61-90'
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-red-50 text-red-700 border border-red-200';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
        {bucket} days
      </span>
    );
  };


  const daysOverdue = (invoice) => {
    if (!isOverdue(invoice)) return 0;
    const today = new Date();
    const dueDate = new Date(invoice.due_date);
    return Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
  };


  const formatCurrency = (amount) => fmtCurrency(amount, businessSettings?.currency || companyProfile?.currency || 'USD');

  const isOverdue = (invoice) => {
    if (invoice.invoice_status === 'PAID' || invoice.invoice_status === 'VOID' || !invoice.due_date) return false;
    const today = new Date();
    const dueDate = new Date(invoice.due_date);
    return dueDate < today;
  };
  const exportCSV = (rows) => {
    const cols = ['invoice_number','customers.name','invoice_status','total_amount','issued_at','due_date'];
    const lines = [cols.join(',')];
    for (const r of rows) {
      const vals = [
        r.invoice_number,
        (r.customers?.name||''),
        r.invoice_status,
        (Number(r.total_amount||0)).toFixed(2),
        r.issued_at || r.created_at || '',
        r.due_at || r.due_date || ''
      ].map(v => '"'+String(v ?? '').replaceAll('"','""')+'"');
      lines.push(vals.join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `invoices_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export Customer Statements (CSV) for the current filtered+sorted view
  const exportStatementsCSV = (rows) => {
    const columns = ['Customer','Invoice #','Status','Amount','Issued','Due'];
    const lines = [columns.join(',')];
    for (const inv of rows) {
      const vals = [
        inv.customers?.name || '',
        inv.invoice_number || '',
        inv.invoice_status || inv.status || '',
        (Number(inv.total_amount || 0)).toFixed(2),
        inv.issued_at || inv.created_at || '',
        inv.due_at || inv.due_date || ''
      ].map(v => '"' + String(v ?? '').replaceAll('"','""') + '"');
      lines.push(vals.join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `customer_statements_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const sortedInvoices = useMemo(() => {
    const key = sortBy.key; const dir = sortBy.dir === 'asc' ? 1 : -1;
    const arr = [...filteredInvoices];
    arr.sort((a,b) => {
      const va = (a[key] ?? (key==='customers' ? a.customers?.name : key==='total_amount' ? Number(a.total_amount||0) : ''));
      const vb = (b[key] ?? (key==='customers' ? b.customers?.name : key==='total_amount' ? Number(b.total_amount||0) : ''));
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
    return arr;
  }, [filteredInvoices, sortBy]);


  const generateInvoiceNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const count = invoices.length + 1;
    return `INV-${year}${month}-${String(count).padStart(4, '0')}`;
  };

  // Form handlers
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      // If a job/work order was selected, create invoice from that job and copy items
      if (formData.job_id) {
        const invoiceId = await InvoicesService.createFromWorkOrder(user.company_id, formData.job_id);
        showAlert('success', 'Invoice created from job with items');
        setShowCreateForm(false);
        resetForm();
        await loadInvoices();
        // Optionally open detail or edit modal here
        // const created = invoices.find(inv => inv.id === invoiceId);
        // if (created) openEditForm(created);


        return;
      }

      // Otherwise create a blank invoice (no items yet)
      const items = Array.isArray(formData.line_items) ? formData.line_items : [];
      const payload = {
        customer_id: formData.customer_id,
        work_order_id: null,
        notes: formData.description || formData.notes || '',
        tax_rate: typeof formData.tax_rate === 'number' ? formData.tax_rate : 0,
        discount_amount: typeof formData.discount_amount === 'number' ? formData.discount_amount : 0,
        currency: 'USD',
      };
      await InvoicesService.createInvoice(payload, items, user.company_id);

      showAlert('success', 'Invoice created successfully!');
      setShowCreateForm(false);
      resetForm();
      await loadInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
      showAlert('error', 'Failed to create invoice');
    }
  };

  const handleUpdateInvoice = async (e) => {
    e.preventDefault();
    try {
      const items = Array.isArray(formData.line_items) ? formData.line_items : [];
      await InvoicesService.updateInvoice(
        selectedInvoice.id,
        {
          customer_id: formData.customer_id,
          job_id: formData.job_id || null,
          notes: formData.description || formData.notes || '',
          tax_rate: typeof formData.tax_rate === 'number' ? formData.tax_rate : 0,
          discount_amount: typeof formData.discount_amount === 'number' ? formData.discount_amount : 0,
          currency: 'USD',
          status: formData.status
        },
        items,
        user.company_id
      );

      showAlert('success', 'Invoice updated successfully!');
      setShowEditForm(false);
      resetForm();
      await loadInvoices();
    } catch (error) {
      console.error('Error updating invoice:', error);
      showAlert('error', 'Failed to update invoice');
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      // 1) unlink any work_orders that reference this invoice
      await supaFetch(`work_orders?invoice_id=eq.${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: { invoice_id: null }
      }, user.company_id);

      // 2) delete invoice record
      const response = await supaFetch(`invoices?id=eq.${invoiceId}`, {
        method: 'DELETE'
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Invoice deleted successfully!');
        await loadInvoices();
      } else {
        const t = await response.text().catch(() => '');
        console.error('Failed to delete invoice:', response.status, t);
        showAlert('error', 'Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      showAlert('error', 'Failed to delete invoice');
    }
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      const ok = await InvoicesService.markInvoiceStatus(invoiceId, newStatus, user.company_id);
      if (ok) {
        showAlert('success', `Invoice marked as ${newStatus.toLowerCase().replace('_', ' ')}`);
        await loadInvoices();
      } else {
        showAlert('error', 'Failed to update invoice status');
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      showAlert('error', 'Failed to update invoice status');
    }
  };

  const handleSendInvoice = async (invoiceId) => {
    try {
      // Mark as sent (non-breaking if sent_at column does not exist)
      try {
        await supaFetch(`invoices?id=eq.${invoiceId}`, { method: 'PATCH', body: { sent_at: new Date().toISOString(), sent_by: user.id } }, user.company_id);
      } catch(e) { /* column may not exist yet - ignore */ }
      await EmailService.sendInvoiceEmail(user.company_id, invoiceId, {});
      showAlert('success', 'Invoice sent (stub) and marked as sent');
      await loadInvoices();
    } catch (error) {
      console.error('Send invoice failed', error);
      showAlert('error', 'Failed to send invoice');
    }
  };

  const handlePayNow = (invoice) => {
    const portal = businessSettings?.payment_portal_url;
    if (portal) {
      window.open(`${portal}?invoice=${invoice.id}`, '_blank');
    } else {
      showAlert('info', 'Online payments are not enabled in settings.');
    }
  };


  const copyPayLink = (invoice) => {
    const portal = businessSettings?.payment_portal_url;
    if (!portal) return showAlert('info', 'Online payments are not enabled in settings.');
    const link = `${portal}?invoice=${invoice.id}`;
    navigator.clipboard.writeText(link).then(() => showAlert('success', 'Pay link copied'));
  };

  const handleExportPDF = async (invoice) => {

    try {
      // Load complete invoice data, items, and job reference
      const [invoiceRes, itemsRes, jobRes] = await Promise.all([
        supaFetch(`invoices?id=eq.${invoice.id}&select=*`, { method: 'GET' }, user.company_id),
        supaFetch(`invoice_items?invoice_id=eq.${invoice.id}&order=sort_order.asc.nullsfirst,created_at.asc`, { method: 'GET' }),
        invoice.job_id ? supaFetch(`work_orders?id=eq.${invoice.job_id}&select=*`, { method: 'GET' }, user.company_id) : Promise.resolve({ ok: true, json: async () => [] })
      ]);

      // Use complete invoice data (includes notes field)
      const [fullInvoice] = invoiceRes.ok ? await invoiceRes.json() : [invoice];
      const items = itemsRes.ok ? await itemsRes.json() : [];
      const [job] = jobRes.ok ? await jobRes.json() : [];

      // Use fullInvoice instead of invoice for the rest of the function
      let invoiceData = fullInvoice || invoice;

      // Note: No auto-flip needed - invoices start as UNPAID and stay that way until payment
      console.log('📧 Exporting invoice with status:', invoiceData?.status);

      // Debug: Check if notes field exists
      console.log('🧾 PDF Export Debug - invoiceData.notes:', invoiceData.notes);
      console.log('🧾 PDF Export Debug - invoiceData keys:', Object.keys(invoiceData));

      // Mirror InvoiceTemplate formatting
      const company = companyProfile || {};
      const currency = businessSettings?.currency || company.currency || 'USD';
      const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(n || 0));

      // Format company address similar to InvoiceTemplate
      const formatCompanyAddress = (c = {}) => {
        const s = (c.street_address || '').trim();
        const city = (c.city || '').trim();
        const state = (c.state || '').trim();
        const zip = (c.postal_code || c.zip_code || '').trim();
        const lower = s.toLowerCase();
        const parts = [];
        if (s) parts.push(s);
        if (city && !lower.includes(city.toLowerCase())) parts.push(city);
        if (state && !lower.includes(state.toLowerCase())) parts.push(state);
        if (zip && !s.includes(zip)) parts.push(zip);
        return parts.filter(Boolean).join(', ');
      };

      const companyAddr = formatCompanyAddress(company);
      const customer = invoice.customers || {};
      // Note: Customer address fields not available in current schema
      const customerAddr = customer.name || 'Customer Address Not Available';

      // Terms text (mirror InvoiceTemplate)
      const rawTerms = company.default_invoice_terms || invoiceConfig?.default_invoice_terms || 'NET_30';
      const termsText = (() => {
        const termMap = {
          'DUE_ON_RECEIPT': 'Payment due upon receipt',
          'NET_7': 'Payment due within 7 days',
          'NET_15': 'Payment due within 15 days',
          'NET_30': 'Payment due within 30 days',
          'NET_45': 'Payment due within 45 days',
          'NET_60': 'Payment due within 60 days'
        };
        if (termMap[rawTerms]) return termMap[rawTerms];
        const m = String(rawTerms || '').match(/(\d{1,3})/);
        return m ? `Payment due within ${m[1]} days` : `Payment terms: ${rawTerms || 'None'}`;
      })();

      // Compute totals: mirror template logic with fallback if line_total absent
      const itemsPresent = items.length > 0;
      const subtotal = items.reduce((s, it) => s + (it.line_total ? Number(it.line_total) - Number(it.tax_amount||0) : (Number(it.quantity||0) * Number(it.unit_price||0))), 0);
      const tax_amount = items.reduce((s, it) => s + Number(it.tax_amount || 0), 0);
      const total_amount = itemsPresent ? (subtotal + tax_amount) : Number(invoice.total_amount || 0);

      const rows = items.length ? items.map(it => `
        <tr>
          <td>${it.description || it.item_name || ''}</td>
          <td style="text-align:right">${Number(it.quantity || it.qty || 0)}</td>
          <td style="text-align:right">${fmt(it.unit_price || it.rate)}</td>
          <td style="text-align:right">${fmt(it.tax_amount || 0)}</td>
          <td style="text-align:right">${fmt(it.line_total || (Number(it.quantity||0)*Number(it.unit_price||0)))}</td>
        </tr>`).join('') : `<tr><td colspan="5" style="text-align:center;color:#6b7280;padding:16px">No items</td></tr>`;

      const logoHtml = company.company_logo_url
        ? `<img src="${company.company_logo_url}" alt="Logo" style="height:120px;object-fit:contain;max-width:560px" />`
        : `<div style="font-size:20px;font-weight:700">${company.name || company.company_name || 'Your Company'}</div>`;

      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice #${invoice.invoice_number}</title>
      <style>
      body{font-family:Inter,system-ui,Segoe UI,Roboto,Arial;color:#111827;padding:24px;line-height:1.6;background:#fff}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #e5e7eb}
      .brand{display:flex;gap:16px;align-items:flex-start}
      .meta{font-size:14px;color:#6b7280;line-height:1.4}
      .section{margin:24px 0;padding:20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px}
      .section h4{margin:0 0 16px 0;font-weight:600;color:#111827;font-size:18px;border-bottom:1px solid #d1d5db;padding-bottom:8px}
      .section-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px}
      .section-item{margin-bottom:12px}
      .section-label{color:#6b7280;font-size:13px;font-weight:500;margin-bottom:4px}
      .section-value{color:#111827;font-size:14px}
      .job-description{background:#f0f9ff;padding:16px;border-radius:6px;border:1px solid #e0f2fe;margin-top:12px;color:#1e40af;font-size:14px}
      table{width:100%;border-collapse:collapse;margin:24px 0;background:white;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden}
      th,td{padding:16px 12px;border-bottom:1px solid #e5e7eb;text-align:left;font-size:14px}
      th{background:#f3f4f6;font-weight:600;color:#374151}
      .totals{margin-top:32px;padding:20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;max-width:400px;margin-left:auto}
      .totals div{margin:8px 0;display:flex;justify-content:space-between;font-size:16px}
      .totals div:last-child{border-top:2px solid #374151;font-weight:700;font-size:20px;padding-top:12px;margin-top:12px;color:#111827}
      @media print{body{padding:12px} .section{break-inside:avoid}}
      </style></head><body>
        <div class="header">
          <div class="brand">
            ${logoHtml}
            <div>
              <div style="font-size:18px;font-weight:600">${company.name || company.company_name || ''}</div>
              <div class="meta">${companyAddr}</div>
              <div class="meta">${company.phone || ''}${company.email ? ` • ${company.email}` : ''}</div>
            </div>
          </div>
          <div class="meta">Invoice #${invoiceData.invoice_number}<br/>Date: ${invoiceData.issued_at ? new Date(invoiceData.issued_at).toLocaleDateString() : ''}<br/>Due: ${(invoiceData.due_at||invoiceData.due_date) ? new Date(invoiceData.due_at||invoiceData.due_date).toLocaleDateString() : ''}<br/>Terms: ${termsText}</div>
        </div>
        <div class="section">
          <h4>Bill To</h4>
          <div>${customer.name || ''}</div>
          <div class="meta">${customer.email || ''}${customer.phone ? ` • ${customer.phone}` : ''}</div>
          <div class="meta">${customerAddr || '<span style="color:#9ca3af">No billing address on file</span>'}</div>
        </div>
        ${job ? `<div class="section">
          <h4>Job Details</h4>
          <div class="section-item" style="margin-bottom: 16px;">
            <div class="section-label">Work Performed</div>
            <div class="section-value">${job.title || job.job_title || 'Service Call'}</div>
          </div>
          <div class="section-item" style="margin-bottom: 16px;">
            <div class="section-label">Work Location</div>
            <div class="section-value">${
              job.service_address_line_1 ?
                `${job.service_address_line_1}${job.service_address_line_2 ? ', ' + job.service_address_line_2 : ''}, ${job.service_city || ''} ${job.service_state || ''} ${job.service_zip_code || ''}`.trim() :
              [job.street_address, job.city, job.state, job.zip_code].filter(Boolean).join(', ') ||
              job.work_location || job.job_location || 'No Service Address'
            }</div>
          </div>
          ${job.description ? `<div class="section-item">
            <div class="section-label">Description of Work</div>
            <div class="job-description">${job.description}</div>
          </div>` : ''}
        </div>` : ''}
        ${invoiceData.notes ? `<div class="section"><h4>Work Description</h4><div style="background:#f0f9ff;padding:12px;border-radius:6px;border:1px solid #e0f2fe">${invoiceData.notes}</div></div>` : ''}
        <table><thead><tr><th>Description</th><th style="text-align:right">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Tax</th><th style="text-align:right">Line Total</th></tr></thead>
        <tbody>${rows}</tbody></table>
        <div class="totals">
          <div><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
          <div><span>Tax</span><span>${fmt(tax_amount)}</span></div>
          <div style="font-weight:700"><span>Total Due</span><span>${fmt(total_amount)}</span></div>
        </div>
        ${ (invoiceConfig?.payment_instructions || company.payment_instructions) ? `<div class="section"><h4>Payment Instructions</h4><div>${invoiceConfig?.payment_instructions || company.payment_instructions}</div></div>` : ''}
        ${ (invoiceConfig?.invoice_footer || company.invoice_footer) ? `<div class="section"><div>${invoiceConfig?.invoice_footer || company.invoice_footer}</div></div>` : ''}
      </body></html>`;

      const w = window.open('', '_blank');
      if (w) {
        w.document.write(html);
        w.document.close();
        w.onload = () => {
          try { w.focus(); w.print(); } catch (e) {}
          setTimeout(() => { try { w.close(); } catch (e) {} }, 800);
        };
      }
    } catch (e) {
      showAlert('error', 'Failed to export PDF');
    }
  };

  const openEditForm = async (invoiceSummary) => {
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`📝 [${ts}] openEditForm called for invoice:`, invoiceSummary?.id);

    // Open immediately with summary so UI responds, then hydrate with full data
    setSelectedInvoice(invoiceSummary);
    setShowEditForm(true);
    setFormData({
      customer_id: invoiceSummary.customer_id || invoiceSummary.customers?.id || '',
      job_id: invoiceSummary.job_id || '',
      invoice_number: invoiceSummary.invoice_number || '',
      title: invoiceSummary.title || '',
      description: invoiceSummary.description || '',
      line_items: invoiceSummary.items || [],
      subtotal: invoiceSummary.subtotal || 0,
      tax_rate: typeof invoiceSummary.tax_rate === 'number' ? invoiceSummary.tax_rate : 0,
      tax_amount: invoiceSummary.tax_amount || 0,
      total_amount: invoiceSummary.total_amount || 0,
      status: invoiceSummary.status || 'UNPAID',
      due_date: invoiceSummary.due_date || '',
      notes: invoiceSummary.notes || '',
      terms_conditions: invoiceSummary.terms_conditions || ''
    });

    try {
      // Fetch full invoice with items to properly prefill the form
      const full = await InvoicesService.getInvoiceById(invoiceSummary.id, user.company_id);
      if (full) {
        setSelectedInvoice(full);
        setFormData({
          customer_id: full.customer_id || full.customers?.id || '',
          job_id: full.job_id || '',
          invoice_number: full.invoice_number || '',
          title: full.title || '',
          description: full.description || '',
          line_items: full.items || [],
          subtotal: full.subtotal || 0,
          tax_rate: typeof full.tax_rate === 'number' ? full.tax_rate : 0,
          tax_amount: full.tax_amount || 0,
          total_amount: full.total_amount || 0,
          status: full.status || 'UNPAID',
          due_date: full.due_date || '',
          notes: full.notes || '',
          terms_conditions: full.terms_conditions || ''
        });
      } else {
        console.warn('openEditForm: getInvoiceById returned null; hydrating items directly');
        // Fallback: try to fetch items alone and attach them
        try {
          const itemsRes = await supaFetch(`invoice_line_items?invoice_id=eq.${invoiceSummary.id}&order=sort_order.asc.nullsfirst,created_at.asc`, { method: 'GET' });
          if (itemsRes.ok) {
            const items = await itemsRes.json();
            setSelectedInvoice((prev) => prev ? { ...prev, items } : { ...invoiceSummary, items });
          }

        } catch (e) {
          console.warn('openEditForm fallback: failed to load items:', e);
        }
      }
    } catch (e) {
      console.error('Failed to load full invoice for edit:', e);
    }
  };

  const openDetailModal = (invoice) => {
    console.log('🔍 openDetailModal called for invoice:', invoice.id);
    console.log('🔍 Current showDetailModal state:', showDetailModal);
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
    console.log('🔍 Modal should now be open');
  };

  // Invoices Table Component
  const InvoicesTable = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2">
                <input type="checkbox" onChange={toggleSelectAllVisible}
                  checked={sortedInvoices.length>0 && sortedInvoices.every(inv=>selectedInvoiceIds.has(inv.id))}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={()=>setSortBy(s=>({ key:'invoice_number', dir: s.key==='invoice_number' && s.dir==='asc' ? 'desc':'asc' }))}>
                Invoice #{sortBy.key==='invoice_number' ? (sortBy.dir==='asc' ? ' ▲' : ' ▼') : ''}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={()=>setSortBy(s=>({ key:'customers', dir: s.key==='customers' && s.dir==='asc' ? 'desc':'asc' }))}>
                Customer{sortBy.key==='customers' ? (sortBy.dir==='asc' ? ' ▲' : ' ▼') : ''}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={()=>setSortBy(s=>({ key:'total_amount', dir: s.key==='total_amount' && s.dir==='asc' ? 'desc':'asc' }))}>
                Amount{sortBy.key==='total_amount' ? (sortBy.dir==='asc' ? ' ▲' : ' ▼') : ''}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={()=>setSortBy(s=>({ key:'issued_at', dir: s.key==='issued_at' && s.dir==='asc' ? 'desc':'asc' }))}>
                Date{sortBy.key==='issued_at' ? (sortBy.dir==='asc' ? ' ▲' : ' ▼') : ''}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={()=>setSortBy(s=>({ key:'due_at', dir: s.key==='due_at' && s.dir==='asc' ? 'desc':'asc' }))}>
                Due Date{sortBy.key==='due_at' ? (sortBy.dir==='asc' ? ' ▲' : ' ▼') : ''}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedInvoices.map((invoice) => {
              const customer = invoice.customers;

              return (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-2">
                    <input type="checkbox" checked={selectedInvoiceIds.has(invoice.id)} onChange={()=>toggleInvoiceSelected(invoice.id)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <button className="hover:underline" onClick={() => openDetailModal(invoice)}>#{invoice.invoice_number}</button>
                    </div>
                    {invoice.work_orders?.title && (
                      <div className="text-xs text-gray-500">{invoice.work_orders.title}</div>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      {renderAgingBadge(invoice)}
                      {invoice.sent_at && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          Sent · {new Date(invoice.sent_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {invoice.job_id && (
                      <div className="text-xs text-gray-500 mt-1">
                        Linked Job: <a href={`/jobs?edit=${invoice.job_id}`} className="text-primary-600 hover:underline" onClick={(e) => e.stopPropagation()}>Open</a>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer?.name || 'Unknown Customer'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(isOverdue(invoice) ? 'OVERDUE' : invoice.invoice_status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${parseFloat(invoice.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.due_at ? new Date(invoice.due_at).toLocaleDateString() : (invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '—')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => openDetailModal(invoice)}
                        className="text-primary-600 hover:text-primary-900"
                        title="View Invoice"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditForm(invoice)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Invoice"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>

                      {invoice.status === 'UNPAID' ? (
                        <div className="relative group">
                          <button
                            onClick={() => {
                              if (businessSettings?.email_enabled) {
                                handleSendInvoice(invoice.id);
                              } else {
                                showAlert('info', 'Email delivery coming soon. Configure in Settings → Invoicing.');
                              }
                            }}
                            className={`hover:text-green-900 ${businessSettings?.email_enabled ? 'text-green-600' : 'text-gray-400'}`}
                            title={businessSettings?.email_enabled ? 'Send Invoice' : 'Send (Coming soon)'}
                          >
                            <PaperAirplaneIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : null}

                      {['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status) && (
                        <>
                          <button
                            onClick={() => openPaymentModal(invoice)}
                            className="text-green-600 hover:text-green-900"
                            title="Record Payment"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {invoice.invoice_status === 'PAID' && (
                        <>
                          <button
                            onClick={() => openPaymentModal(invoice)}
                            className="text-red-600 hover:text-red-900"
                            title="Add Refund"
                          >
                            <CurrencyDollarIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <div className="relative group">
                        <button
                          onClick={() => handleExportPDF(invoice)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Export PDF"
                        >
                          <DocumentArrowDownIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="relative group">
                        <button
                          onClick={() => {
                            if (businessSettings?.payment_portal_url) {
                              handlePayNow(invoice);
                            } else {
                              showAlert('info', 'Online payments coming soon. Connect in Settings → Invoicing.');
                            }
                          }}
                          className={`hover:text-indigo-900 ${businessSettings?.payment_portal_url ? 'text-indigo-600' : 'text-gray-400'}`}
                          title={businessSettings?.payment_portal_url ? 'Pay Now' : 'Pay Now (Coming soon)'}
                        >
                          <CurrencyDollarIcon className="w-4 h-4" />
                        </button>

	                      <div className="relative group">
	                        <button
	                          onClick={() => copyPayLink(invoice)}
	                          className={`hover:text-indigo-900 ${businessSettings?.payment_portal_url ? 'text-indigo-600' : 'text-gray-400'}`}
	                          title={businessSettings?.payment_portal_url ? 'Copy Pay Link' : 'Copy Pay Link (disabled)'}
	                        >
	                          <LinkIcon className="w-4 h-4" />
	                        </button>
	                      </div>

                      </div>

                      {invoice.invoice_status !== 'VOID' && (
                        <button
                          onClick={() => handleStatusChange(invoice.id, 'VOID')}
                          className="text-orange-600 hover:text-orange-900"
                          title="Void Invoice"
                        >
                          <XCircleIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Invoice"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Quick Actions Dropdown Component
  const QuickActionsDropdown = ({ invoice }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
        >
          <EllipsisVerticalIcon className="w-5 h-5" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            ></div>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
              <div className="py-1">
                <button
                  onClick={() => {
                    openDetailModal(invoice);
                    setIsOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <EyeIcon className="w-4 h-4 mr-3" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    openEditForm(invoice);
                    setIsOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <PencilIcon className="w-4 h-4 mr-3" />
                  Edit Invoice
                </button>

                {/* Status-based actions */}
                {invoice.status === 'UNPAID' && (
                  <button
                    onClick={() => {
                      handleSendInvoice(invoice.id);
                      setIsOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <PaperAirplaneIcon className="w-4 h-4 mr-3" />
                    Send Invoice
                  </button>
                )}

                {['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status) && (
                  <>
                    <button
                      onClick={() => {
                        openPaymentModal(invoice);
                        setIsOpen(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-3" />
                      Record Payment
                    </button>
                    <button
                      onClick={() => {
                        openPaymentModal(invoice);
                        setTimeout(() => {
                          const chk = document.getElementById('payment-refund');
                          if (chk) chk.checked = true;
                        }, 0);
                        setIsOpen(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                    >
                      <XCircleIcon className="w-4 h-4 mr-3" />
                      Add Refund
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    handleExportPDF(invoice);
                    setIsOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-3" />
                  Export PDF
                </button>

                {invoice.invoice_status !== 'VOID' && (
                  <button
                    onClick={() => {
                      handleStatusChange(invoice.id, 'VOID');
                      setIsOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 w-full text-left"
                  >
                    <XCircleIcon className="w-4 h-4 mr-3" />
                    Void Invoice
                  </button>
                )}
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this invoice?')) {
                      handleDeleteInvoice(invoice.id);
                    }
                    setIsOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <TrashIcon className="w-4 h-4 mr-3" />
                  Delete Invoice
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Invoice Form Component
  const InvoiceForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create New Invoice</h3>
          <button
            onClick={() => setShowCreateForm(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleCreateInvoice} className="space-y-6">
          {/* Customer Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer *
              </label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Order (Optional)
              </label>
              <select
                value={formData.job_id || ''}
                onChange={(e) => setFormData({ ...formData, job_id: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">No job</option>
                {jobs.filter(job => job.customer_id === formData.customer_id).map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms
              </label>
              <select
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="NET_30">Net 30</option>
                <option value="NET_15">Net 15</option>
                <option value="NET_10">Net 10</option>
                <option value="DUE_ON_RECEIPT">Due on Receipt</option>
              </select>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Kitchen Renovation Invoice"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe the work performed..."
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtotal
              </label>
              <input
                {...createCurrencyInputProps(
                  formData.subtotal,
                  (subtotal) => {
                    const taxAmount = subtotal * (formData.tax_rate / 100);
                    const totalAmount = subtotal + taxAmount;
                    setFormData({
                      ...formData,
                      subtotal,
                      tax_amount: taxAmount,
                      total_amount: totalAmount
                    });
                  }
                )}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                {...createPercentageInputProps(
                  formData.tax_rate / 100,
                  (taxRateDecimal) => {
                    const taxRate = taxRateDecimal * 100;
                    const taxAmount = formData.subtotal * taxRateDecimal;
                    const totalAmount = formData.subtotal + taxAmount;
                    setFormData({
                      ...formData,
                      tax_rate: taxRate,
                      tax_amount: taxAmount,
                      total_amount: totalAmount
                    });
                  },
                  { max: 50 }
                )}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.total_amount}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Additional notes or terms..."


            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Invoice Edit Modal - reuse InvoiceFormModal with existing invoice data
  function InvoiceEditModal() {
    if (!showEditForm) return null;
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`🧩 [${ts}] Rendering InvoiceEditModal for invoice:`, selectedInvoice?.id);
    return (
      <InvoiceFormModal
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        companyId={user.company_id}
        invoice={selectedInvoice}
        onStatusChange={(nextStatus) => handleStatusChange(selectedInvoice.id, nextStatus)}
        onSubmit={async (data, items) => {
          await InvoicesService.updateInvoice(selectedInvoice.id, data, items, user.company_id);
          showAlert('success', 'Invoice updated successfully');
          setShowEditForm(false);
          await loadInvoices();
        }}
      />
    );
  }



  // Invoice Detail Modal - renders full template with items and job
  const InvoiceDetailModal = () => {
    const [detail, setDetail] = React.useState(null);
    const [loadingDetail, setLoadingDetail] = React.useState(true);

    React.useEffect(() => {
      let cancelled = false;
      if (!selectedInvoice) {
        setDetail(null);
        setLoadingDetail(false);
        return () => { cancelled = true; };
      }
      setLoadingDetail(true);
      (async () => {
        try {
          // ✅ FIX: Specify FK relationship to avoid "multiple relationships" error
          const invRes = await supaFetch(`invoices?id=eq.${selectedInvoice.id}&select=*,customers(*),work_orders!work_order_id(*)`, { method: 'GET' }, user.company_id);
          let [inv] = invRes.ok ? await invRes.json() : [];

          // Fallback: if embed didn't resolve (FK missing), fetch job by job_id
          if (inv && (!inv.work_orders || !inv.work_orders.id) && inv.job_id) {
            try {
              const jobRes = await supaFetch(`work_orders?id=eq.${inv.job_id}&select=*`, { method: 'GET' }, user.company_id);
              if (jobRes.ok) {
                const rows = await jobRes.json();
                inv = { ...inv, work_orders: rows[0] || null };


              }
            } catch (e) {
              // ignore; will show blanks if unavailable
            }
          }

          const itemsRes = await supaFetch(`invoice_line_items?invoice_id=eq.${selectedInvoice.id}&order=sort_order.asc.nullsfirst,created_at.asc`, { method: 'GET' }, user.company_id);
          const items = itemsRes.ok ? await itemsRes.json() : [];

          const paysRes = await supaFetch(`payments?invoice_id=eq.${selectedInvoice.id}&order=received_at.asc`, { method: 'GET' }, user.company_id);
          const payments = paysRes.ok ? await paysRes.json() : [];
          const paidToDate = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
          const balanceDue = Math.max(0, Number(inv?.total_amount || 0) - paidToDate);

          if (!cancelled) setDetail(inv ? { ...inv, items, payments, paidToDate, balanceDue } : null);
        } catch (e) {
          if (!cancelled) setDetail(null);



        } finally {
          if (!cancelled) setLoadingDetail(false);
        }
      })();
      return () => { cancelled = true; };
    }, [selectedInvoice?.id, user.company_id]);


    // Reusable component for payment history in the detail modal
    const PaymentHistory = ({ payments }) => {
      if (!payments || payments.length === 0) return (
        <div className="text-sm text-gray-500">No payments recorded.</div>
      );
      return (
        <table className="min-w-full divide-y divide-gray-200 mt-2">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>

            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2 text-sm text-gray-700">{new Date(p.received_at).toLocaleString()}</td>
                <td className="px-3 py-2 text-sm text-gray-700">{p.method}</td>
                <td className="px-3 py-2 text-sm text-gray-700">{p.transaction_reference || p.note || '—'}</td>
                <td className={`px-3 py-2 text-sm text-right ${Number(p.amount) < 0 ? 'text-red-600' : 'text-gray-900'}`}>${Number(p.amount).toFixed(2)}</td>
                <td className="px-3 py-2 text-sm text-right space-x-3">
                  <button className="text-indigo-600 hover:text-indigo-900" onClick={async ()=>{
                    try {
                      await EmailService.sendPaymentReceipt(user.company_id, selectedInvoice.id, p.id);
                      showAlert('success', 'Receipt sent');
                    } catch (e) {
                      showAlert('error', 'Failed to send receipt');
                    }
                  }}>Send receipt</button>
                  <button className="text-red-600 hover:text-red-700" onClick={async ()=>{
                    try {
                      await InvoicesService.deletePayment(p.id, user.company_id);
                      showAlert('success', 'Payment deleted');
                      await loadInvoices();
                      setSelectedInvoice(prev => prev ? { ...prev, payments: prev.payments?.filter(x=>x.id!==p.id) } : prev);
                    } catch (e) {
                      showAlert('error', 'Failed to delete payment');
                    }
                  }}>Delete</button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      );
    };

    if (!selectedInvoice) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold text-gray-900">Invoice #{selectedInvoice.invoice_number}</div>
                {getStatusBadge(isOverdue(selectedInvoice) ? 'OVERDUE' : (selectedInvoice.invoice_status || selectedInvoice.status))}
                {renderAgingBadge(selectedInvoice)}
              </div>
              {selectedInvoice.work_orders?.title && (
                <div className="text-sm text-gray-500">{selectedInvoice.work_orders.title}</div>
              )}
              {selectedInvoice.job_id && (
                <div className="text-sm text-gray-500 mt-1">
                  Linked Job: <a href={`/jobs?edit=${selectedInvoice.job_id}`} className="text-primary-600 hover:underline">View Job</a>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Print Button */}
              <button
                onClick={() => {
                  // Use the existing professional PDF export but with current data
                  handleExportPDF(detail);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="Print Invoice"
              >
                <PrinterIcon className="w-4 h-4" />
                Print
              </button>

              {/* Download Button */}
              <button
                onClick={() => {
                  // Same as print - the handleExportPDF function handles both
                  handleExportPDF(detail);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="Download PDF"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Download
              </button>

              <button
                onClick={() => {
                  closeDetailModal();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {loadingDetail ? (
            <div className="p-8 text-center text-gray-500">Loading…</div>
          ) : !detail ? (
            <div className="p-8 text-center text-gray-500">Failed to load invoice</div>
          ) : (
            <>
              <InvoiceTemplate
                company={companyProfile || {}}
                config={invoiceConfig || {}}
                invoice={detail}
                customer={detail.customers}
                job={detail.work_orders}
              />

              {/* Payment Summary */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h4 className="text-md font-semibold text-gray-800">Payment History</h4>
                  <PaymentHistory payments={detail.payments} />
                </div>
                <div className="md:col-span-1">
                  <div className="bg-gray-50 rounded-md p-4 border">
                    <div className="flex justify-between text-sm">
                      <span>Amount Due</span>
                      <span>${Number(detail.total_amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Paid to Date</span>
                      <span>-${Number(detail.paidToDate || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg mt-2 border-t pt-2">
                      <span>Balance Due</span>
                      <span>${Number(detail.balanceDue || 0).toFixed(2)}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      {Number(detail.balanceDue || 0) <= 0 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-md bg-green-100 text-green-800 text-sm font-medium cursor-not-allowed opacity-75">
                          <CheckCircleIcon className="w-4 h-4 mr-1" /> Close (Paid)
                        </span>
                      ) : (
                        <button className="btn-primary" onClick={() => openPaymentModal(detail)}>Record Payment</button>
                      )}
                      <button className="btn-danger" onClick={() => openPaymentModal(detail)} title="Add Refund">
                        Add Refund
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          </div>
        </div>


    );
  };

  // When the user manually closes the modal, remove the view param so auto-open won't retrigger
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedInvoice(null);
    const params = new URLSearchParams(searchParams);
    params.delete('view');
    setSearchParams(params);
  };

  // Calculate KPIs
  const kpis = {
    outstandingAmount: invoices.filter(inv => inv.status === 'UNPAID' || inv.status === 'OVERDUE' || inv.status === 'PARTIALLY_PAID').reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
    thisMonthCount: invoices.filter(inv => new Date(inv.created_at).getMonth() === new Date().getMonth()).length,
    avgDaysToPay: invoices.filter(inv => inv.status === 'paid' && inv.paid_date).reduce((sum, inv, _, arr) => {
      const daysToPay = Math.floor((new Date(inv.paid_date) - new Date(inv.created_at)) / (1000 * 60 * 60 * 24));
      return sum + daysToPay / arr.length;
    }, 0)
  };

  // Export function
  const exportFilteredCSV = () => {
    const csvData = filteredInvoices.map(invoice => ({
      'Invoice Number': invoice.invoice_number,
      'Customer': invoice.customer_name,
      'Amount': invoice.total,
      'Status': invoice.status,
      'Date': new Date(invoice.created_at).toLocaleDateString()
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Invoice Management"
        subtitle="Create, track, and manage customer invoices and payments"
        icon={DocumentTextIcon}
        gradient="blue"
        stats={[
          { label: 'Outstanding', value: formatCurrency(kpis.outstandingAmount) },
          { label: 'This Month', value: kpis.thisMonthCount },
          { label: 'Avg Days', value: Math.round(kpis.avgDaysToPay) },
          { label: 'Collection Rate', value: `${Math.round(kpis.collectionRate)}%` },
          { label: 'Revenue Velocity', value: `${Math.round(kpis.revenueVelocity)}` }
        ]}
        actions={[
          {
            label: 'Create Invoice',
            icon: PlusIcon,
            onClick: () => setShowCreateForm(true)
          },
          {
            label: 'Analytics',
            icon: ChartBarIcon,
            onClick: () => {
              loadInvoiceAnalytics();
              loadCustomerPaymentBehavior();
              setShowAnalytics(true);
            }
          },
          {
            label: 'Payment Reminders',
            icon: ClockIcon,
            onClick: () => {
              loadPaymentReminders();
              setShowPaymentReminders(true);
            },
            badge: paymentReminders.filter(r => r.reminder_status === 'scheduled' && new Date(r.scheduled_date) <= new Date()).length
          },
          {
            label: 'Payment Plans',
            icon: CreditCardIcon,
            onClick: () => {
              loadPaymentPlans();
              setShowPaymentPlans(true);
            },
            badge: paymentPlans.filter(p => p.plan_status === 'active').length
          },
          {
            label: 'Commissions',
            icon: BanknotesIcon,
            onClick: () => {
              loadCommissionData();
              setShowCommissions(true);
            }
          },
          {
            label: 'Revenue Forecast',
            icon: ChartBarIcon,
            onClick: () => {
              loadRevenueForecasts();
              setShowRevenueForecasting(true);
            }
          },
          {
            label: 'Export CSV',
            icon: ArrowDownTrayIcon,
            onClick: () => exportCSV(sortedInvoices)
          },
          {
            label: 'Export Statements (PDF)',
            icon: PrinterIcon,
            onClick: () => exportStatementsPDF(sortedInvoices, user.company_id)
          }
        ]}
      />

      {/* Enhanced Invoice Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <ModernStatCard
          title="Outstanding"
          value={formatCurrency(kpis.outstandingAmount)}
          icon={CurrencyDollarIcon}
          gradient="blue"
          onClick={() => setStatusFilter('UNPAID')}
        />

        <ModernStatCard
          title="Paid This Month"
          value={formatCurrency(kpis.thisMonthRevenue)}
          icon={CheckCircleIcon}
          gradient="green"
          onClick={() => setStatusFilter('PAID')}
        />

        <ModernStatCard
          title="Overdue"
          value={kpis.overdueCount}
          icon={ExclamationTriangleIcon}
          gradient="orange"
          onClick={() => setStatusFilter('OVERDUE')}
        />

        <ModernStatCard
          title="Avg Collection"
          value={`${Math.round(kpis.avgDaysToPay)} days`}
          icon={ClockIcon}
          gradient="purple"
        />

        <ModernStatCard
          title="Collection Rate"
          value={`${Math.round(kpis.collectionRate)}%`}
          icon={ChartBarIcon}
          gradient="indigo"
          onClick={() => {
            loadInvoiceAnalytics();
            setShowAnalytics(true);
          }}
        />

        <ModernStatCard
          title="Revenue Velocity"
          value={`${Math.round(kpis.revenueVelocity)}`}
          icon={BanknotesIcon}
          gradient="purple"
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* Filters and Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={exportFilteredCSV}
                className="btn-secondary flex items-center gap-2"
                title="Export filtered list to CSV"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                Export CSV
              </button>

              <button
                onClick={batchEmailSelected}
                disabled={selectedInvoiceIds.size===0}
                className={`btn-secondary flex items-center gap-2 ${selectedInvoiceIds.size===0?'opacity-50 cursor-not-allowed':''}`}
                title="Email selected invoices"
              >
                Email Selected
              </button>
            </div>
          </div>
        </div>
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
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn-secondary" onClick={()=>setShowManageViews(false)}>Close</button>
            </div>
          </div>
        </div>
      )}


      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-md ${
          alert.type === 'success' ? 'bg-green-100 text-green-700' :
          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
          alert.type === 'info' ? 'bg-blue-100 text-blue-700' :
          'bg-red-100 text-red-700'
        }`}>
          {alert.message}
        </div>
      )}



      {/* Revenue KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <BanknotesIcon className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.outstandingBalance)}</div>
              <div className="text-sm text-gray-500">Outstanding Balance</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalPaidThisMonth)}</div>
              <div className="text-sm text-gray-500">Paid This Month</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.overdueBalance)}</div>
              <div className="text-sm text-gray-500">Overdue</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">{analytics.avgDaysToPay}</div>
              <div className="text-sm text-gray-500">Avg Days to Pay</div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{analytics.totalInvoices}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{analytics.unpaidInvoices}</div>
          <div className="text-sm text-gray-500">Unpaid</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{analytics.partiallyPaidInvoices}</div>
          <div className="text-sm text-gray-500">Partially Paid</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{analytics.overdueInvoices}</div>
          <div className="text-sm text-gray-500">Overdue</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{analytics.paidInvoices}</div>
          <div className="text-sm text-gray-500">Paid</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{analytics.overdueInvoices}</div>
          <div className="text-sm text-gray-500">Overdue</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices by number, customer, or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Invoices</option>
              <option value="outstanding">Outstanding</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="aging_0_30">Aging 0–30</option>
              <option value="aging_31_60">Aging 31–60</option>
              <option value="aging_61_90">Aging 61–90</option>
              <option value="aging_90_plus">Aging 90+</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <input
              type="date"

              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            {filteredInvoices.length} invoices found
          </div>
        </div>

      </div>

      {/* Invoices Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <div className="mt-2 text-gray-600">Loading invoices...</div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first invoice</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Create Invoice
          </button>
        </div>
      ) : (
        <InvoicesTable />
      )}


      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-1">Record Payment</h3>
            <div className="text-sm text-gray-500 mb-4">Remaining balance: {formatCurrency(remainingBalance)}</div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input type="number" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={paymentAmount} onChange={(e)=>setPaymentAmount(e.target.value)} />
                <div className="flex gap-2 mt-2">
                  {[0.25,0.5,1].map(p => (
                    <button key={p} className="btn-secondary btn-xs" onClick={()=> setPaymentAmount(((remainingBalance * p) || 0).toFixed(2))}>{p*100}%</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Method</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reference / Check # (optional)</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={paymentReference} onChange={(e)=>setPaymentReference(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Note (optional)</label>
                <textarea className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows={2} value={paymentNote} onChange={(e)=>setPaymentNote(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="payment-refund" className="h-4 w-4" checked={paymentRefund} onChange={(e)=>setPaymentRefund(e.target.checked)} />
                <label htmlFor="payment-refund" className="text-sm text-gray-700">This is a refund</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => { setShowPaymentModal(false); setActiveInvoice(null); }}>Cancel</button>
              <button
                className="btn-primary"
                onClick={() => {
                  const amount = parseFloat(paymentAmount || '0');
                  const method = paymentMethod;
                  const reference = paymentReference;
                  const note = paymentNote;
                  const refund = paymentRefund;
                  recordPayment({ amount, method, reference, note, refund });
                }}
              >
                Save Payment
              </button>
            </div>

            {paymentsHistory && paymentsHistory.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <div className="text-sm font-medium mb-2">Recent payments</div>
                <div className="max-h-40 overflow-auto divide-y">
                  {paymentsHistory.slice().reverse().map(p => (
                    <div key={p.id} className="py-2 text-sm flex items-center justify-between">
                      <div>
                        <div className="font-medium">{formatCurrency(Math.abs(Number(p.amount||0)))}</div>
                        <div className="text-gray-500">{new Date(p.received_at).toLocaleString()} • {p.method}</div>
                      </div>
                      <div className={`text-xs px-2 py-0.5 rounded ${Number(p.amount)<0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {Number(p.amount)<0 ? 'Refund' : 'Payment'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateForm && <InvoiceForm />}
      {showEditForm && <InvoiceEditModal />}
      {showDetailModal && <InvoiceDetailModal />}

      {/* Invoice Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Invoice Analytics Dashboard</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-900">
                    {invoiceAnalytics.reduce((sum, a) => sum + (a.total_invoices || 0), 0)}
                  </div>
                  <div className="text-sm text-blue-600">Total Invoices</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(invoiceAnalytics.reduce((sum, a) => sum + (a.collected_revenue || 0), 0))}
                  </div>
                  <div className="text-sm text-green-600">Collected Revenue</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-900">
                    {Math.round(invoiceAnalytics.reduce((sum, a) => sum + (a.average_velocity_score || 0), 0) / Math.max(1, invoiceAnalytics.length))}
                  </div>
                  <div className="text-sm text-purple-600">Avg Velocity Score</div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Customer Payment Behavior</h3>
                {customerPaymentBehavior.length > 0 ? (
                  <div className="space-y-3">
                    {customerPaymentBehavior.slice(0, 10).map((customer) => (
                      <div key={customer.customer_id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{customer.customer_name}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
                              <div>Reliability: {Math.round(customer.payment_reliability_score)}%</div>
                              <div>Avg Days: {Math.round(customer.average_days_to_pay)}</div>
                              <div>Total Revenue: {formatCurrency(customer.total_revenue || 0)}</div>
                              <div>Risk: <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                customer.risk_category === 'low' ? 'bg-green-100 text-green-800' :
                                customer.risk_category === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                customer.risk_category === 'high' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {customer.risk_category}
                              </span></div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(customer.predicted_lifetime_value || 0)}
                            </div>
                            <div className="text-xs text-gray-500">Predicted LTV</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data yet</h3>
                    <p className="text-gray-600">Invoice analytics will appear here as you process more invoices</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Reminders Modal */}
      {showPaymentReminders && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Payment Reminders</h2>
              <button
                onClick={() => setShowPaymentReminders(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {paymentReminders.length > 0 ? (
                <div className="space-y-4">
                  {paymentReminders.map((reminder) => (
                    <div key={reminder.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {reminder.invoices?.customers?.name} - Invoice #{reminder.invoices?.invoice_number}
                          </h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>Type: {reminder.reminder_type}</span>
                            <span>Amount: {formatCurrency(reminder.invoices?.total_amount || 0)}</span>
                            <span>Scheduled: {new Date(reminder.scheduled_date).toLocaleDateString()}</span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              reminder.reminder_status === 'sent' ? 'bg-green-100 text-green-800' :
                              reminder.reminder_status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {reminder.reminder_status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => alert('COMING SOON: Send reminder now')}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <PaperAirplaneIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => alert('COMING SOON: Edit reminder')}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payment reminders</h3>
                  <p className="text-gray-600 mb-4">Set up automated payment reminders to improve collections</p>
                  <button
                    onClick={() => alert('COMING SOON: Setup payment reminders')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Setup Reminders
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Plans Modal */}
      {showPaymentPlans && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Payment Plans</h2>
              <button
                onClick={() => setShowPaymentPlans(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {paymentPlans.length > 0 ? (
                <div className="space-y-4">
                  {paymentPlans.map((plan) => (
                    <div key={plan.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {plan.customers?.name} - {plan.plan_name}
                          </h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>Total: {formatCurrency(plan.total_amount)}</span>
                            <span>Payments: {plan.number_of_payments}</span>
                            <span>Frequency: {plan.payment_frequency}</span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              plan.plan_status === 'active' ? 'bg-green-100 text-green-800' :
                              plan.plan_status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {plan.plan_status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => alert('COMING SOON: View plan details')}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => alert('COMING SOON: Edit plan')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payment plans</h3>
                  <p className="text-gray-600 mb-4">Create payment plans to help customers pay large invoices over time</p>
                  <button
                    onClick={() => alert('COMING SOON: Create payment plan')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Payment Plan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sales Commissions Modal */}
      {showCommissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Sales Commissions</h2>
              <button
                onClick={() => setShowCommissions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {commissionData.length > 0 ? (
                <div className="space-y-4">
                  {commissionData.map((commission) => (
                    <div key={commission.sales_rep_id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{commission.sales_rep_name}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
                            <div>Total Sales: {formatCurrency(commission.total_sales || 0)}</div>
                            <div>Commission Earned: {formatCurrency(commission.total_commission_earned || 0)}</div>
                            <div>Commission Paid: {formatCurrency(commission.commission_paid || 0)}</div>
                            <div>Pending: {formatCurrency(commission.commission_pending || 0)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {Math.round(commission.average_commission_rate || 0)}%
                          </div>
                          <div className="text-xs text-gray-500">Avg Rate</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BanknotesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No commission data</h3>
                  <p className="text-gray-600">Commission tracking will appear here when sales reps are assigned to invoices</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Forecasting Modal */}
      {showRevenueForecasting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Revenue Forecasting</h2>
              <button
                onClick={() => setShowRevenueForecasting(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {revenueForecasts.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-900">
                        {formatCurrency(revenueForecasts.reduce((sum, f) => sum + (f.forecasted_revenue || 0), 0))}
                      </div>
                      <div className="text-sm text-blue-600">Total Forecasted</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-900">
                        {formatCurrency(revenueForecasts.reduce((sum, f) => sum + (f.actual_revenue || 0), 0))}
                      </div>
                      <div className="text-sm text-green-600">Actual Revenue</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-900">
                        {Math.round(revenueForecasts.reduce((sum, f) => sum + Math.abs(f.variance_percentage || 0), 0) / Math.max(1, revenueForecasts.length))}%
                      </div>
                      <div className="text-sm text-purple-600">Avg Variance</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {revenueForecasts.map((forecast) => (
                      <div key={forecast.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {forecast.forecast_period} - {new Date(forecast.forecast_date).toLocaleDateString()}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
                              <div>Forecasted: {formatCurrency(forecast.forecasted_revenue || 0)}</div>
                              <div>Actual: {formatCurrency(forecast.actual_revenue || 0)}</div>
                              <div>Variance: {Math.round(forecast.variance_percentage || 0)}%</div>
                              <div>Confidence: {Math.round((forecast.forecast_confidence || 0) * 100)}%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No revenue forecasts</h3>
                  <p className="text-gray-600 mb-4">Revenue forecasting will help you predict future cash flow</p>
                  <button
                    onClick={() => alert('COMING SOON: Create revenue forecast')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Forecast
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ PHASE 3C: INVOICE MODALS */}

      {/* Payment Modal - Record invoice payment */}
      <PaymentModal
        isOpen={showPaymentModalNew}
        onClose={() => setShowPaymentModalNew(false)}
        onConfirm={handlePaymentConfirm}
        invoiceNumber={invoiceToPayment?.invoice_number || 'N/A'}
        totalAmount={invoiceToPayment?.total_amount || 0}
        amountPaid={invoiceToPayment?.amount_paid || 0}
      />

      {/* Close Work Order Modal - Final closure */}
      <CloseWorkOrderModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleCloseConfirm}
        workOrderTitle={invoiceToClose?.title || invoiceToClose?.work_orders?.title || 'this work order'}
        customerName={invoiceToClose?.customers?.name || 'Customer'}
      />
    </div>
  );
};

export default Invoices;
