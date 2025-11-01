import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation as useRouterLocation, useNavigate, useSearchParams } from 'react-router-dom';
import QuotesDatabasePanel from '../components/QuotesDatabasePanel';
import { QuotesStats, QuotesSearchFilter, QuotesTable, Alert } from '../components/QuotesUI';
import { QuoteBuilder } from '../components/QuoteBuilder';
import QuotesContextDrawer from '../components/QuotesContextDrawer';
import SendQuoteModal from '../components/quotes/SendQuoteModal';
import PageHeader from '../components/Common/PageHeader';
import ModernPageHeader, { ModernStatCard, ModernActionButton } from '../components/Common/ModernPageHeader';

// ✅ PHASE 3: Import all new modals
import SendQuoteModalNew from '../components/SendQuoteModal';
import PresentedModal from '../components/PresentedModal';
import ApprovalModal from '../components/ApprovalModal';
import RejectionModal from '../components/RejectionModal';
import ChangesRequestedModal from '../components/ChangesRequestedModal';
import FollowUpModal from '../components/FollowUpModal';
import ExpiredModal from '../components/ExpiredModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useConfirmation } from '../hooks/useConfirmation';
import '../styles/modern-enhancements.css';
import {
  PlusIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  CalendarIcon,
  UserGroupIcon,
  TrophyIcon,
  LightBulbIcon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import QuotePDFService from '../services/QuotePDFService';
import { getQuoteStatuses } from '../utils/statusHelpers';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import IntegrationService from '../services/IntegrationService';
import { quoteSendingService } from '../services/QuoteSendingService';
import twilioService from '../services/TwilioService';

export default function QuotesPro(){
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUser();

  // ✅ FIX: useConfirmation at page level to prevent state loss on re-render
  const { modal, confirm, success, error } = useConfirmation();
  const savedDropdownRef = useRef(null);
  const storageKey = useMemo(() => `quotes_saved_views_${user?.company_id || 'guest'}`,[user?.company_id]);
  const lastViewKey = useMemo(() => `quotes_last_view_${user?.company_id || 'guest'}`,[user?.company_id]);
  const [savedViews, setSavedViews] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [companySettings, setCompanySettings] = useState(null);

  const [showManageViews, setShowManageViews] = useState(false);
  const [selectedViewName, setSelectedViewName] = useState('');

  const loadSavedViews = useMemo(() => () => {
    try { const v = JSON.parse(localStorage.getItem(storageKey) || '[]'); setSavedViews(Array.isArray(v)?v:[]); }
    catch { setSavedViews([]); }
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
    try { localStorage.setItem(lastViewKey, view.name); } catch {}
    window?.toast?.success?.('View applied');
  };
  const quickSaveCurrentView = () => {
    const nameBase = 'View';
    let idx = 1;
    const names = new Set(savedViews.map(v=>v.name));
    while (names.has(nameBase+' '+idx)) idx++;
    const newView = { name: nameBase+' '+idx, searchTerm, statusFilter };
    const next = [...savedViews, newView];
    setSavedViews(next); saveViewsToStorage(next); setSelectedViewName(newView.name);
    try { localStorage.setItem(lastViewKey, newView.name); } catch {}
    window?.toast?.success?.('View saved');
  };
  const renameView = (oldName, newName) => {
    if (!newName || savedViews.some(v=>v.name===newName)) return false;
    const next = savedViews.map(v=> v.name===oldName ? { ...v, name:newName } : v);
    setSavedViews(next); saveViewsToStorage(next); setSelectedViewName(newName);
    try {
      const last = localStorage.getItem(lastViewKey);
      if (last === oldName) localStorage.setItem(lastViewKey, newName);
    } catch {}
    window?.toast?.success?.('View renamed');
    return true;
  };
  const deleteView = (name) => {
    const next = savedViews.filter(v=>v.name!==name);
    setSavedViews(next); saveViewsToStorage(next);
    try {
      const last = localStorage.getItem(lastViewKey);
      if (last === name) localStorage.removeItem(lastViewKey);
    } catch {}
    if (selectedViewName===name) setSelectedViewName('');
    window?.toast?.success?.('View deleted');
  };
  // Auto-apply last view on mount/when savedViews load
  useEffect(() => {
    try {
      const last = localStorage.getItem(lastViewKey);
      if (!last) return;
      const v = savedViews.find(s=>s.name===last);
      if (v) { setSelectedViewName(last); applyView(v); }
    } catch {}
  }, [lastViewKey, savedViews]);

  // eslint-disable-next-line no-unused-vars
  const quotesPanelData = QuotesDatabasePanel({ confirm, success, error });

  const {
    quotes,
    customers,
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
    createQuote,
    updateQuote,
    deleteQuote,
    duplicateQuote, // ✅ NEW: Duplicate quote feature
    convertToJob,
    openEditForm,
    resetForm,
    customersLoading,
    showAlert,
    loadQuotes,

    // ✅ PHASE 3: Modal States and Handlers
    showSendQuoteModal,
    setShowSendQuoteModal,
    quoteToSend,
    handleSendQuoteConfirm,

    showPresentedModal,
    setShowPresentedModal,
    quoteToPresent,
    handlePresentedConfirm,

    showApprovalModal,
    setShowApprovalModal,
    quoteToApprove,
    handleApprovalConfirm,
    handleApprovalScheduleNow,

    showRejectionModal,
    setShowRejectionModal,
    quoteToReject,
    handleRejectionConfirm,

    showChangesRequestedModal,
    setShowChangesRequestedModal,
    quoteToChangeRequest,
    handleChangesRequestedConfirm,

    showFollowUpModal,
    setShowFollowUpModal,
    quoteToFollowUp,
    handleFollowUpConfirm,

    showExpiredModal,
    setShowExpiredModal,
    quoteToExpire,
    handleExpiredConfirm
  } = quotesPanelData;

  // Competitive enhancement states
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [showApprovals, setShowApprovals] = useState(false);
  const [selectedQuoteForAnalytics, setSelectedQuoteForAnalytics] = useState(null);
  const [quoteAnalytics, setQuoteAnalytics] = useState([]);
  const [quoteVersions, setQuoteVersions] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [approvalWorkflows, setApprovalWorkflows] = useState([]);

  // Load quote analytics data
  const loadQuoteAnalytics = async () => {
    try {
      // Simplified query without complex joins to avoid relationship errors
      const response = await supaFetch('quote_analytics?select=*', {
        method: 'GET'
      }, user.company_id);

      if (response.ok) {
        const data = await response.json();
        setQuoteAnalytics(data || []);
        console.log(`📊 Loaded ${data?.length || 0} quote analytics records`);
      } else {
        console.error('Failed to load quote analytics:', response.status);
        setQuoteAnalytics([]);
      }
    } catch (error) {
      console.error('Error loading quote analytics:', error);
      setQuoteAnalytics([]);
    }
  };

  const loadQuoteVersions = async (workOrderId) => {
    try {
      const response = await supaFetch(`quote_versions?work_order_id=eq.${workOrderId}&select=*,users(first_name,last_name)&order=version_number.desc`, {
        method: 'GET'
      }, user.company_id);

      if (response.ok) {
        const data = await response.json();
        setQuoteVersions(data || []);
      } else if (response.status === 400) {
        // Table doesn't exist yet - use empty array
        console.log('Quote versions table not yet implemented - using empty data');
        setQuoteVersions([]);
      }
    } catch (error) {
      console.log('Quote versions not available yet:', error.message);
      setQuoteVersions([]);
    }
  };

  const loadFollowUps = async () => {
    try {
      console.log('🔍 Loading quote follow-ups with proper joins...');
      // ✅ FIXED: Use scheduled_date (correct column name)
      const response = await supaFetch('quote_follow_ups?select=*&order=scheduled_date.asc', {
        method: 'GET'
      }, user.company_id);

      if (response.ok) {
        const data = await response.json();
        setFollowUps(data || []);
        console.log(`✅ Loaded ${data?.length || 0} quote follow-ups with joins`);
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('❌ Failed to load follow-ups with joins:', response.status, errorText);

        // Fallback to basic query without joins using scheduled_date
        console.log('🔄 Trying basic query without joins...');
        const basicResponse = await supaFetch('quote_follow_ups?select=*&order=scheduled_date.asc', {
          method: 'GET'
        }, user.company_id);

        if (basicResponse.ok) {
          const basicData = await basicResponse.json();
          console.log('✅ Loaded follow-ups (basic):', basicData?.length || 0);
          setFollowUps(basicData || []);
        } else {
          console.log('📝 Using empty array for follow-ups');
          setFollowUps([]);
        }
      }
    } catch (error) {
      console.error('💥 Exception loading follow-ups:', error);
      setFollowUps([]);
    }
  };

  const loadApprovalWorkflows = async () => {
    try {
      console.log('🔍 Loading quote approval workflows with proper joins...');
      // Simplified query without complex joins to avoid relationship errors
      const response = await supaFetch('quote_approval_workflows?select=*&order=created_at.desc', {
        method: 'GET'
      }, user.company_id);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Loaded approval workflows with joins:', data?.length || 0);
        setApprovalWorkflows(data || []);
      } else {
        const errorText = await response.text().catch(() => '');
        console.error('❌ Failed to load approval workflows with joins:', response.status, errorText);

        // Fallback to basic query without joins
        console.log('🔄 Trying basic query without joins...');
        const basicResponse = await supaFetch('quote_approval_workflows?select=*&order=created_at.desc', {
          method: 'GET'
        }, user.company_id);

        if (basicResponse.ok) {
          const basicData = await basicResponse.json();
          console.log('✅ Loaded approval workflows (basic):', basicData?.length || 0);
          setApprovalWorkflows(basicData || []);
        } else {
          console.log('📝 Using empty array for approval workflows');
          setApprovalWorkflows([]);
        }
      }
    } catch (error) {
      console.error('💥 Exception loading approval workflows:', error);
      setApprovalWorkflows([]);
    }
  };

  // Load company settings for quote overrides
  useEffect(() => {
    const loadCompanySettings = async () => {
      if (!user?.company_id) return;
      try {
        const response = await supaFetch(`companies?id=eq.${user.company_id}&select=*`, {
          method: 'GET'
        }, user.company_id);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setCompanySettings(data[0]);
            console.log('✅ Loaded company settings for quote overrides');
          }
        }
      } catch (error) {
        console.error('Error loading company settings:', error);
      }
    };
    loadCompanySettings();
  }, [user?.company_id]);

  // Load competitive data on mount (now with proper database tables)
  useEffect(() => {
    if (user?.company_id && user?.id) {
      console.log('🚀 UPDATED CODE: Loading advanced quote features...');
      // Load all advanced quote management features
      loadQuoteAnalytics();
      loadFollowUps();
      loadApprovalWorkflows();
    } else {
      console.log('⏳ UPDATED CODE: Waiting for user context to load...');
    }
  }, [user?.company_id, user?.id]);

  // Competitive enhancement functions
  const createQuoteVersion = async (workOrderId, versionName, versionDescription) => {
    try {
      const response = await supaFetch('rpc/create_quote_version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_work_order_id: workOrderId,
          p_version_name: versionName,
          p_version_description: versionDescription,
          p_created_by: user.id
        })
      }, user.company_id);

      if (response.ok) {
        await loadQuoteVersions(workOrderId);
        return true;
      }
    } catch (error) {
      console.error('Error creating quote version:', error);
    }
    return false;
  };

  const trackQuoteAnalytics = async (workOrderId, eventType, eventData = {}) => {
    try {
      await supaFetch('rpc/update_quote_analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_work_order_id: workOrderId,
          p_event_type: eventType,
          p_event_data: eventData
        })
      }, user.company_id);
    } catch (error) {
      console.error('Error tracking quote analytics:', error);
    }
  };

  const scheduleFollowUp = async (workOrderId, followUpData) => {
    try {
      // ✅ FIXED: Use scheduled_date (correct column name from industry standard schema)
      const response = await supaFetch('quote_follow_ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_order_id: workOrderId,
          company_id: user.company_id,
          scheduled_date: followUpData.scheduled_date || followUpData.follow_up_date || new Date().toISOString(),
          follow_up_type: followUpData.follow_up_type || 'email',
          status: 'SCHEDULED',
          notes: followUpData.notes || '',
          is_automated: followUpData.is_automated || false
        })
      }, user.company_id);

      if (response.ok) {
        await loadFollowUps();
        return true;
      }
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
    }
    return false;
  };

  const createApprovalWorkflow = async (workOrderId, totalAmount) => {
    try {
      // Schema-aligned payload: quote_approval_workflows has approver_id, status fields
      const response = await supaFetch('quote_approval_workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          work_order_id: workOrderId,
          company_id: user.company_id,
          approver_id: user.id, // Set current user as approver initially
          status: 'PENDING' // Default status from schema
        })
      }, user.company_id);

      if (response.ok) {
        await loadApprovalWorkflows();
        return true;
      }
    } catch (error) {
      console.error('Error creating approval workflow:', error);
    }
    return false;
  };

  // Enhanced quote actions
  const openQuoteAnalytics = (quote) => {
    setSelectedQuoteForAnalytics(quote);
    trackQuoteAnalytics(quote.id, 'view');
    setShowAnalytics(true);
  };

  const openVersionHistory = (quote) => {
    setSelectedQuoteForAnalytics(quote);
    loadQuoteVersions(quote.id);
    setShowVersionHistory(true);
  };

  const openFollowUpManager = () => {
    setShowFollowUps(true);
  };

  const openApprovalManager = () => {
    setShowApprovals(true);
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeQuote, setActiveQuote] = useState(null);
  // Phase 2 - Part 1: lightweight send (sent status) from QuotesPro only
  const sendActiveQuote = async () => {
    if (!activeQuote || !user) return;
    try {
      const res = await supaFetch(`work_orders?id=eq.${activeQuote.id}`, {
        method: 'PATCH',
        body: {
          status: 'sent',  // Lowercase to match enum
          quote_sent_at: new Date().toISOString()
        }
      }, user.company_id);
      if (!res.ok) throw new Error('Failed to send');
      window?.toast?.success?.('Quote marked as sent');
    } catch (e) {
      console.error('Send quote error', e);
      window?.toast?.error?.('Failed to send quote');
    }
  };

  // ✅ FIXED: Proper workflow handling with modals (uses QuotesDatabasePanel's updateQuote)
  // Handle quote status changes - calls updateQuote which triggers modal interception
  const handleQuoteStatusChange = async (quote, newStatus) => {
    console.log('🎯 handleQuoteStatusChange called:', {
      quoteId: quote?.id,
      quoteTitle: quote?.title,
      currentStatus: quote?.status,
      newStatus: newStatus,
      statusChanging: quote?.status !== newStatus
    });

    // Call updateQuote from QuotesDatabasePanel
    // This will trigger the interception logic (lines 603-650 in QuotesDatabasePanel.js)
    // which will set the appropriate quote state and show the modal
    await updateQuote(quote.id, { status: newStatus });
  };

  // Legacy function for backward compatibility
  const setActiveQuoteStatus = async (newStatus) => {
    console.log('🔘 setActiveQuoteStatus called:', {
      newStatus,
      hasActiveQuote: !!activeQuote,
      activeQuoteId: activeQuote?.id,
      activeQuoteTitle: activeQuote?.title,
      activeQuoteStatus: activeQuote?.status,
      hasUser: !!user
    });

    if (!activeQuote || !user) {
      console.warn('⚠️ Cannot change status: missing activeQuote or user');
      return;
    }

    await handleQuoteStatusChange(activeQuote, newStatus);
  };

  // Phase 2 - Part 3: Convert polish (guard + scheduling prompt)
  const convertWithPrompt = async () => {
    if (!activeQuote) return;
    // Guard: only allow if accepted
    const status = activeQuote.status;
    if (status !== 'ACCEPTED') {
      window?.toast?.error?.('Accept the quote before converting to a job');
      return;
    }
    try {
      await convertToJob(activeQuote);
      // Optional scheduling prompt
      setTimeout(() => {
        if (window.confirm('Job created. Would you like to schedule it now?')) {
          window.location.href = '/jobs?schedule=new';
        }
      }, 200);
    } catch (e) {
      // convertToJob already alerts internally; keep this quiet
    }
  };

  const openContext = (quote) => { setActiveQuote(quote); setDrawerOpen(true); };

  // Close Manage Views with Escape
  useEffect(() => {
    if (!showManageViews) return;
    const onEsc = (e) => { if (e.key === 'Escape') setShowManageViews(false); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [showManageViews]);

  // Filter quotes for consistent counts and table
  const filteredQuotes = useMemo(() => {
    const term = (searchTerm || '').toLowerCase().trim();
    return (quotes || []).filter(q => {
      const statusOk = statusFilter === 'all' || q.status === statusFilter;
      if (!term) return statusOk;
      const title = (q.title || '').toLowerCase();
      const number = (q.quote_number || '').toLowerCase();
      const customerName = (customers.find(c=>c.id===q.customer_id)?.name || '').toLowerCase();
      const matches = title.includes(term) || number.includes(term) || customerName.includes(term);
      return statusOk && matches;
    });
  }, [quotes, customers, searchTerm, statusFilter]);

  // Deep link: /quotes?open=<id> opens the context drawer for a quote
  useEffect(() => {
    const openId = searchParams.get('open');
    if (!openId) return;
    const quote = (quotes || []).find(q => q.id === openId);
    if (quote) {
      setActiveQuote(quote);
      setDrawerOpen(true);
    }
  }, [searchParams, quotes]);

  // PDF Export Handler (Preview - doesn't auto-close)
  const handleExportPDF = async (quote) => {
    try {
      if (!quote?.id) {
        window?.toast?.error?.('Cannot export PDF: Quote ID missing');
        return;
      }
      await QuotePDFService.previewPDF(user.company_id, quote.id);
      window?.toast?.success?.('PDF opened in new tab');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      window?.toast?.error?.(error.message || 'Failed to generate PDF');
    }
  };

  // Send to Customer Handler -> open modal with options
  const handleSendToCustomer = async (quote) => {
    console.log('🚀 handleSendToCustomer CALLED!', {
      quote,
      hasQuote: !!quote,
      quoteId: quote?.id,
      customerId: quote?.customer_id,
      companyId: user?.company_id
    });

    // Instead of sending immediately, open the Send modal (multi-choice)
    setActiveQuote(quote);
    setShowSendModal(true);
  };

  // Confirm action from Send modal
  const handleSendModalConfirm = async (sendData) => {
    try {
      if (!activeQuote) throw new Error('No active quote');
      console.log('📨 Send modal confirm:', sendData);

      let emailSuccess = false;
      let smsSuccess = false;

      // Send via Email
      if (sendData.deliveryMethod === 'email' || sendData.deliveryMethod === 'both') {
        try {
          const result = await quoteSendingService.sendQuoteEmail(
            user.company_id,
            activeQuote.id,
            {
              customMessage: sendData.customMessage,
              includePDF: sendData.includeAttachment
            }
          );
          console.log('✅ Quote sent via email:', result);
          emailSuccess = true;
          window?.toast?.success?.(`Quote sent via email to ${result.sentTo}!`);
        } catch (emailError) {
          console.error('❌ Email sending failed:', emailError);
          window?.toast?.error?.(`Email failed: ${emailError.message}`);
        }
      }

      // Send via SMS (Twilio)
      if (sendData.deliveryMethod === 'sms' || sendData.deliveryMethod === 'both') {
        try {
          // Get customer phone from activeQuote
          const customer = customers.find(c => c.id === activeQuote?.customer_id);
          const customerPhone = customer?.phone;

          if (!customerPhone) {
            throw new Error('Customer phone number not found');
          }

          // Prepare quote data for SMS
          const quoteForSMS = {
            ...activeQuote,
            customer_phone: customerPhone,
            customers: customer
          };

          // Send SMS via Twilio
          const smsResult = await twilioService.sendQuoteNotification(quoteForSMS, user.company_id);

          if (smsResult.success) {
            console.log('✅ Quote sent via SMS:', smsResult.messageSid);
            smsSuccess = true;
            window?.toast?.success?.(`Quote sent via SMS to ${customerPhone}!`);
          } else {
            throw new Error(smsResult.error || 'SMS sending failed');
          }
        } catch (smsError) {
          console.error('❌ SMS sending failed:', smsError);
          window?.toast?.error?.(`SMS failed: ${smsError.message}`);
        }
      }

      // Update quote status AND save overrides if at least one method succeeded
      if (emailSuccess || smsSuccess) {
        try {
          const updateBody = {
            status: 'sent',
            quote_sent_at: new Date().toISOString(),

            // Save scheduling overrides
            scheduling_mode: sendData.schedulingMode || 'customer_choice',
            custom_availability_days: sendData.customAvailabilityDays || null,
            custom_availability_hours_start: sendData.customAvailabilityHoursStart || null,
            custom_availability_hours_end: sendData.customAvailabilityHoursEnd || null,

            // Save deposit overrides
            deposit_required: sendData.depositRequired || false,
            deposit_required_before_scheduling: sendData.depositRequiredBeforeScheduling || false,
            allowed_payment_methods: sendData.allowedPaymentMethods || ['online', 'cash', 'check']
          };

          console.log('💾 Saving quote with overrides:', updateBody);

          await supaFetch(`work_orders?id=eq.${activeQuote.id}`, {
            method: 'PATCH',
            body: updateBody
          }, user.company_id);

          console.log('✅ Quote overrides saved to database');
        } catch (updateError) {
          console.error('❌ Failed to update quote status:', updateError);
        }
      }

      // Reload quotes to show updated status
      await loadQuotes();
      const anySuccess = emailSuccess || smsSuccess;
      if (anySuccess) {
        window?.toast?.success?.(`Quote sent${emailSuccess && smsSuccess ? ' via email and SMS' : emailSuccess ? ' via email' : ' via SMS'}.`);
        setShowSendModal(false);
      } else {
        window?.toast?.error?.('Nothing was sent. Please fix the errors and try again.');
      }
    } catch (error) {
      console.error('❌ Failed to send quote from modal:', error);
      window?.toast?.error?.(error.message || 'Failed to send quote');
    }
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Quotes"
        subtitle="Create professional quotes and convert them to jobs with superior UX"
        icon={DocumentTextIcon}
        gradient="blue"
        stats={[
          { label: 'Total Quotes', value: filteredQuotes.length },
          { label: 'Pending', value: filteredQuotes.filter(q => q.status === 'draft' || q.status === 'sent').length },
          { label: 'Accepted', value: filteredQuotes.filter(q => q.status === 'approved').length }
        ]}
        actions={[
          {
            label: 'Analytics',
            icon: ChartBarIcon,
            onClick: () => setShowAnalytics(true),
            variant: 'secondary'
          },
          {
            label: 'Follow-ups',
            icon: CalendarIcon,
            onClick: openFollowUpManager,
            variant: 'secondary',
            badge: followUps.filter(f => f.status === 'pending').length
          },
          {
            label: 'Approvals',
            icon: UserGroupIcon,
            onClick: openApprovalManager,
            variant: 'secondary',
            badge: approvalWorkflows.filter(a => a.status === 'pending').length
          },
          {
            label: 'Templates',
            icon: DocumentTextIcon,
            onClick: () => setShowTemplates(true),
            variant: 'secondary'
          },
          {
            label: 'Create Quote',
            icon: PlusIcon,
            onClick: () => setShowCreateForm(true)
          }
        ]}
      />

      {/* Enhanced Summary Statistics with Competitive Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <ModernStatCard
          title="Total Quotes"
          value={filteredQuotes.length}
          icon={DocumentTextIcon}
          gradient="blue"
          onClick={() => setStatusFilter('all')}
        />
        <ModernStatCard
          title="Pending Quotes"
          value={filteredQuotes.filter(q => q.status === 'draft' || q.status === 'sent').length}
          icon={ClockIcon}
          gradient="orange"
          onClick={() => setStatusFilter('sent')}
        />
        <ModernStatCard
          title="Accepted Quotes"
          value={filteredQuotes.filter(q => q.status === 'approved').length}
          icon={CheckCircleIcon}
          gradient="green"
          onClick={() => setStatusFilter('approved')}
        />
        <ModernStatCard
          title="Quote Value"
          value={`$${filteredQuotes.reduce((sum, q) => sum + (q.total_amount || 0), 0).toLocaleString()}`}
          icon={CurrencyDollarIcon}
          gradient="purple"
          onClick={() => navigate('/reports')}
        />
        <ModernStatCard
          title="Win Rate"
          value={`${filteredQuotes.length > 0 ? Math.round((filteredQuotes.filter(q => q.status === 'approved').length / filteredQuotes.length) * 100) : 0}%`}
          icon={TrophyIcon}
          gradient="emerald"
          onClick={() => setShowAnalytics(true)}
        />
        <ModernStatCard
          title="Avg Response Time"
          value={quoteAnalytics.length > 0 ? `${Math.round(quoteAnalytics.reduce((sum, a) => sum + (a.customer_response_time_hours || 0), 0) / quoteAnalytics.length)}h` : 'N/A'}
          icon={LightBulbIcon}
          gradient="indigo"
          onClick={() => setShowAnalytics(true)}
        />
      </div>

      {/* Saved Views and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <select
            ref={savedDropdownRef}
            aria-label="Saved Views"
            value={selectedViewName}
            onChange={(e)=>{ const v = savedViews.find(s=>s.name===e.target.value); setSelectedViewName(e.target.value); applyView(v); }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Saved Views</option>
            {savedViews.map(v=> (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))}
          </select>
          <button onClick={()=>setShowManageViews(true)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Manage Views
          </button>
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

      <Alert alert={alert} />

      <QuotesStats quotes={filteredQuotes} />

      <QuotesSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <QuotesTable
        quotes={filteredQuotes}
        customers={customers}
        loading={loading}
        openEditForm={openEditForm}
        deleteQuote={deleteQuote}
        duplicateQuote={duplicateQuote}
        convertToJob={convertToJob}
        openContext={openContext}
        handleExportPDF={handleExportPDF}
      />

      {showCreateForm && (
        <QuoteBuilder
          formData={formData}
          setFormData={setFormData}
          customers={customers}
          customersLoading={customersLoading}
          onSubmit={createQuote}
          onCancel={() => { setShowCreateForm(false); resetForm(); }}
          handleExportPDF={handleExportPDF}
          handleSendToCustomer={handleSendToCustomer}
          showAlert={showAlert}
        />
      )}
      {showSendModal && (
        <SendQuoteModalNew
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          onConfirm={handleSendModalConfirm}
          quoteTitle={activeQuote?.title || `Quote ${activeQuote?.quote_number || activeQuote?.id}`}
          customerName={(customers.find(c=>c.id===activeQuote?.customer_id)?.company_name) || `${customers.find(c=>c.id===activeQuote?.customer_id)?.first_name || ''} ${customers.find(c=>c.id===activeQuote?.customer_id)?.last_name || ''}`.trim()}
          customerEmail={customers.find(c=>c.id===activeQuote?.customer_id)?.email}
          customerPhone={customers.find(c=>c.id===activeQuote?.customer_id)?.phone}
          quoteAmount={activeQuote?.total_amount || activeQuote?.grand_total || 0}
          portalLink={`${window.location.origin}/portal/quote/${activeQuote?.id}`}
          quoteId={activeQuote?.id}
          companySettings={companySettings}
        />
      )}


      {showEditForm && (
        <QuoteBuilder
          isEdit={true}
          formData={formData}
          setFormData={setFormData}
          customers={customers}
          customersLoading={customersLoading}
          onSubmit={updateQuote}
          onCancel={() => { setShowEditForm(false); resetForm(); }}
          handleExportPDF={handleExportPDF}
          handleSendToCustomer={handleSendToCustomer}
          showAlert={showAlert}
        />
      )}

      <QuotesContextDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        quote={activeQuote}
        customers={customers}
        onConvertToJob={convertWithPrompt}
        onSend={() => setShowSendModal(true)}
        onAccept={() => setActiveQuoteStatus('approved')}
        onReject={() => setActiveQuoteStatus('rejected')}
        onPrint={() => activeQuote && user && QuotePDFService.previewPDF(user.company_id, activeQuote.id)}
      />

      {showTemplates && (
        <QuoteTemplatesModal
          onClose={() => setShowTemplates(false)}
          onUseTemplate={(template) => {
            setFormData(prev => ({
              ...prev,
              title: template.content.title || '',
              description: template.content.description || '',
              items: template.content.items || [],
              // Apply pricing model from template
              pricing_model: template.pricing_model || 'TIME_MATERIALS',
              flat_rate_amount: template.content.flat_rate_amount || 0,
              unit_price: template.content.unit_price || 0,
              recurring_interval: template.content.recurring_interval || 'MONTHLY',
              recurring_rate: template.content.recurring_rate || 0,
              percentage: template.content.percentage || 10,
              percentage_base_amount: template.content.percentage_base_amount || 1000
            }));
            setShowTemplates(false);
            setShowCreateForm(true);
          }}
          companyId={user?.company_id}
        />
      )}

      {/* Quote Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Quote Analytics Dashboard</h2>
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
                    {quoteAnalytics.reduce((sum, a) => sum + (a.views_count || 0), 0)}
                  </div>
                  <div className="text-sm text-blue-600">Total Quote Views</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-900">
                    {quoteAnalytics.reduce((sum, a) => sum + (a.customer_views_count || 0), 0)}
                  </div>
                  <div className="text-sm text-green-600">Customer Views</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-900">
                    {quoteAnalytics.reduce((sum, a) => sum + (a.emails_sent_count || 0), 0)}
                  </div>
                  <div className="text-sm text-purple-600">Emails Sent</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Quote Performance</h3>
                {quoteAnalytics.length > 0 ? (
                  <div className="space-y-3">
                    {quoteAnalytics.map((analytics) => (
                      <div key={analytics.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {analytics.work_orders?.title || 'Quote'}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
                              <div>Views: {analytics.views_count || 0}</div>
                              <div>Customer Views: {analytics.customer_views_count || 0}</div>
                              <div>Emails: {analytics.emails_sent_count || 0}</div>
                              <div>Follow-ups: {analytics.follow_up_count || 0}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => openVersionHistory(analytics.work_orders)}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data yet</h3>
                    <p className="text-gray-600">Quote analytics will appear here as customers interact with your quotes</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Follow-ups Manager Modal */}
      {showFollowUps && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Quote Follow-ups</h2>
              <button
                onClick={() => setShowFollowUps(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {followUps.length > 0 ? (
                <div className="space-y-4">
                  {followUps.map((followUp) => (
                    <div key={followUp.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {followUp.work_orders?.title || 'Quote Follow-up'}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{followUp.subject}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Type: {followUp.follow_up_type}</span>
                            <span>Due: {new Date(followUp.scheduled_date).toLocaleDateString()}</span>
                            <span>Assigned: {followUp.users?.first_name} {followUp.users?.last_name}</span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              followUp.status === 'completed' ? 'bg-green-100 text-green-800' :
                              followUp.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {followUp.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => alert('COMING SOON: Complete follow-up')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => alert('COMING SOON: Edit follow-up')}
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
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No follow-ups scheduled</h3>
                  <p className="text-gray-600 mb-4">Schedule follow-ups to stay on top of your quotes</p>
                  <button
                    onClick={() => alert('COMING SOON: Schedule follow-up')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Schedule Follow-up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval Workflows Modal */}
      {showApprovals && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Quote Approvals</h2>
              <button
                onClick={() => setShowApprovals(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {approvalWorkflows.length > 0 ? (
                <div className="space-y-4">
                  {approvalWorkflows.map((workflow) => (
                    <div key={workflow.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {workflow.work_orders?.title || 'Quote Approval'}
                          </h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>Amount: ${workflow.total_amount?.toLocaleString()}</span>
                            <span>Level: {workflow.approval_level}</span>
                            <span>Created: {new Date(workflow.created_at).toLocaleDateString()}</span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              workflow.status === 'approved' ? 'bg-green-100 text-green-800' :
                              workflow.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {workflow.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => alert('COMING SOON: Approve quote')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => alert('COMING SOON: View details')}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No approvals needed</h3>
                  <p className="text-gray-600">High-value quotes requiring approval will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && selectedQuoteForAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Version History - {selectedQuoteForAnalytics.title}
              </h2>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {quoteVersions.length > 0 ? (
                <div className="space-y-4">
                  {quoteVersions.map((version) => (
                    <div key={version.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Version {version.version_number}
                            {version.is_current && (
                              <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Current
                              </span>
                            )}
                          </h4>
                          {version.version_name && (
                            <p className="text-sm text-gray-600 mt-1">{version.version_name}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Amount: ${version.total_amount?.toLocaleString()}</span>
                            <span>Created: {new Date(version.created_at).toLocaleDateString()}</span>
                            <span>By: {version.users?.first_name} {version.users?.last_name}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => alert('COMING SOON: View version details')}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => alert('COMING SOON: Restore version')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <ArrowPathIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No versions yet</h3>
                  <p className="text-gray-600 mb-4">Quote versions will appear here when you create revisions</p>
                  <button
                    onClick={() => alert('COMING SOON: Create version')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Version
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function QuoteTemplatesModal({ onClose, onUseTemplate, companyId }) {
  const [templates, setTemplates] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateTemplate, setShowCreateTemplate] = React.useState(false);
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [pricingModelFilter, setPricingModelFilter] = React.useState('all');
  const [newTemplate, setNewTemplate] = React.useState({
    name: '',
    description: '',
    category: 'GENERAL',
    pricing_model: 'TIME_MATERIALS',
    content: {
      title: '',
      description: '',
      items: [],
      flat_rate_amount: 0,
      unit_price: 0,
      recurring_interval: 'MONTHLY',
      recurring_rate: 0,
      percentage: 10,
      percentage_base_amount: 1000
    }
  });

  React.useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await supaFetch('quote_templates?order=name.asc', { method: 'GET' }, companyId);
      const data = res.ok ? await res.json() : [];
      setTemplates(data);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    if (!newTemplate.name.trim()) return;

    try {
      const payload = {
        name: newTemplate.name.trim(),
        description: newTemplate.description.trim(),
        category: newTemplate.category,
        pricing_model: newTemplate.pricing_model,
        content: {
          title: newTemplate.content.title || '',
          description: newTemplate.content.description || '',
          items: newTemplate.content.items || [],
          // Pricing model specific fields
          flat_rate_amount: newTemplate.content.flat_rate_amount || 0,
          unit_price: newTemplate.content.unit_price || 0,
          recurring_interval: newTemplate.content.recurring_interval || 'MONTHLY',
          recurring_rate: newTemplate.content.recurring_rate || 0,
          percentage: newTemplate.content.percentage || 10,
          percentage_base_amount: newTemplate.content.percentage_base_amount || 1000
        },
        company_id: companyId
      };

      await supaFetch('quote_templates', { method: 'POST', body: payload }, companyId);
      setNewTemplate({
        name: '',
        description: '',
        category: 'GENERAL',
        pricing_model: 'TIME_MATERIALS',
        content: {
          title: '',
          description: '',
          items: [],
          flat_rate_amount: 0,
          unit_price: 0,
          recurring_interval: 'MONTHLY',
          recurring_rate: 0,
          percentage: 10,
          percentage_base_amount: 1000
        }
      });
      setShowCreateTemplate(false);
      loadTemplates();
    } catch (err) {
      alert(`Failed to create template: ${err.message}`);
    }
  };

  const deleteTemplate = async (template) => {
    if (!window.confirm(`Delete template "${template.name}"?`)) return;

    try {
      await supaFetch(`quote_templates?id=eq.${template.id}`, { method: 'DELETE' }, companyId);
      loadTemplates();
    } catch (err) {
      alert(`Failed to delete template: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Quote Templates</h3>
          <button className="text-gray-500" onClick={onClose}>✕</button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">Create reusable quote templates to speed up quote creation</p>
          <button onClick={() => setShowCreateTemplate(true)} className="btn-primary">
            Create Template
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="HVAC">HVAC</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="GENERAL">General</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Pricing Model:</label>
            <select
              value={pricingModelFilter}
              onChange={(e) => setPricingModelFilter(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Models</option>
              <option value="TIME_MATERIALS">Time & Materials</option>
              <option value="FLAT_RATE">Flat Rate</option>
              <option value="UNIT">Unit Based</option>
              <option value="RECURRING">Recurring</option>
              <option value="MILESTONE">Milestone</option>
              <option value="PERCENTAGE">Percentage</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <h4 className="text-lg font-medium mb-2">No templates yet</h4>
            <p className="text-sm text-gray-600 mb-4">Create your first quote template to get started</p>
            <button onClick={() => setShowCreateTemplate(true)} className="btn-primary">
              Create First Template
            </button>
          </div>
        ) : (() => {
          // Filter templates
          const filteredTemplates = templates.filter(template => {
            const categoryMatch = categoryFilter === 'all' || template.category === categoryFilter;
            const pricingMatch = pricingModelFilter === 'all' || template.pricing_model === pricingModelFilter;
            return categoryMatch && pricingMatch;
          });

          return filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <h4 className="text-lg font-medium mb-2">No templates match your filters</h4>
              <p className="text-sm text-gray-600 mb-4">Try adjusting your filters or create a new template</p>
              <button onClick={() => setShowCreateTemplate(true)} className="btn-primary">
                Create Template
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {template.category && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {template.category}
                          </span>
                        )}
                        {template.pricing_model && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            {template.pricing_model.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => deleteTemplate(template)} className="text-red-600 hover:text-red-800 text-sm">
                      Delete
                    </button>
                  </div>
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  )}
                  <div className="text-xs text-gray-500 mb-3">
                    Created {new Date(template.created_at).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => onUseTemplate(template)}
                    className="w-full btn-secondary text-sm"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          );
        })()}

        {showCreateTemplate && (
          <div className="fixed inset-0 bg-black/40 z-60 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Create Template</h4>
                <button className="text-gray-500" onClick={() => setShowCreateTemplate(false)}>✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Template Name *</label>
                  <input
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., HVAC Installation"
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Description</label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this template"
                    rows={3}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Category *</label>
                    <select
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="GENERAL">General</option>
                      <option value="HVAC">HVAC</option>
                      <option value="PLUMBING">Plumbing</option>
                      <option value="ELECTRICAL">Electrical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Pricing Model *</label>
                    <select
                      value={newTemplate.pricing_model}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, pricing_model: e.target.value }))}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="TIME_MATERIALS">Time & Materials</option>
                      <option value="FLAT_RATE">Flat Rate</option>
                      <option value="UNIT">Unit Based</option>
                      <option value="RECURRING">Recurring</option>
                      <option value="MILESTONE">Milestone</option>
                      <option value="PERCENTAGE">Percentage</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Default Title</label>
                  <input
                    value={newTemplate.content.title || ''}
                    onChange={(e) => setNewTemplate(prev => ({
                      ...prev,
                      content: { ...prev.content, title: e.target.value }
                    }))}
                    placeholder="Default quote title"
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Default Description</label>
                  <textarea
                    value={newTemplate.content.description || ''}
                    onChange={(e) => setNewTemplate(prev => ({
                      ...prev,
                      content: { ...prev.content, description: e.target.value }
                    }))}
                    placeholder="Default quote description"
                    rows={3}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-6">
                <button onClick={() => setShowCreateTemplate(false)} className="px-4 py-2 border rounded-md">
                  Cancel
                </button>
                <button onClick={createTemplate} disabled={!newTemplate.name.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  Create Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ PHASE 3: ALL QUOTE MODALS */}
      {/* eslint-disable no-undef */}

      {/* Send Quote Modal */}
      <SendQuoteModalNew
        isOpen={showSendQuoteModal}
        onClose={() => setShowSendQuoteModal(false)}
        onConfirm={handleSendQuoteConfirm}
        quoteTitle={quoteToSend?.title || 'this quote'}
        customerName={quoteToSend?.customers?.name || 'Customer'}
        customerEmail={quoteToSend?.customers?.email || ''}
        customerPhone={quoteToSend?.customers?.phone || ''}
        quoteAmount={quoteToSend?.grand_total || quoteToSend?.total_amount || 0}
        quoteId={quoteToSend?.id}
      />

      {/* Presented Modal */}
      {console.log('🎬 QuotesPro rendering PresentedModal:', { showPresentedModal, quoteToPresent: quoteToPresent?.id })}
      <PresentedModal
        isOpen={showPresentedModal}
        onClose={() => setShowPresentedModal(false)}
        onConfirm={handlePresentedConfirm}
        quoteTitle={quoteToPresent?.title || 'this quote'}
        customerName={quoteToPresent?.customers?.name || 'Customer'}
      />

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onConfirm={handleApprovalConfirm}
        onScheduleNow={handleApprovalScheduleNow}
        quoteTitle={quoteToApprove?.title || 'this quote'}
        quoteAmount={quoteToApprove?.grand_total || quoteToApprove?.total_amount || 0}
      />

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onConfirm={handleRejectionConfirm}
        quoteTitle={quoteToReject?.title || 'this quote'}
      />

      {/* Changes Requested Modal */}
      <ChangesRequestedModal
        isOpen={showChangesRequestedModal}
        onClose={() => setShowChangesRequestedModal(false)}
        onConfirm={handleChangesRequestedConfirm}
        quoteTitle={quoteToChangeRequest?.title || 'this quote'}
      />

      {/* Follow Up Modal */}
      <FollowUpModal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        onConfirm={handleFollowUpConfirm}
        quoteTitle={quoteToFollowUp?.title || 'this quote'}
        customerName={quoteToFollowUp?.customers?.name || 'Customer'}
      />

      {/* Expired Modal */}
      <ExpiredModal
        isOpen={showExpiredModal}
        onClose={() => setShowExpiredModal(false)}
        onConfirm={handleExpiredConfirm}
        quoteTitle={quoteToExpire?.title || 'this quote'}
        expirationDate={quoteToExpire?.expiration_date}
        customerName={quoteToExpire?.customers?.name || 'Customer'}
      />

      {/* Modern Confirmation Modal */}
      {console.log('🗑️ QuotesPro: modal state:', modal)}
      {modal && <ConfirmationModal {...modal} />}

      {/* eslint-enable no-undef */}
    </div>
  );
}
