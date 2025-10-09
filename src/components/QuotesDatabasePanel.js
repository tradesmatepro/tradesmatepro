import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import { isStatusTransitionAllowed } from '../utils/statusHelpers';


// Supabase configuration
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '../utils/env';

const QuotesDatabasePanel = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // ✅ PHASE 3: Modal States for Complete Pipeline
  const [showSendQuoteModal, setShowSendQuoteModal] = useState(false);
  const [showPresentedModal, setShowPresentedModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showChangesRequestedModal, setShowChangesRequestedModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  // ✅ PHASE 3: Temporary storage for quote being processed by modal
  const [quoteToSend, setQuoteToSend] = useState(null);
  const [quoteToPresent, setQuoteToPresent] = useState(null);
  const [quoteToApprove, setQuoteToApprove] = useState(null);
  const [quoteToReject, setQuoteToReject] = useState(null);
  const [quoteToChangeRequest, setQuoteToChangeRequest] = useState(null);
  const [quoteToFollowUp, setQuoteToFollowUp] = useState(null);
  const [quoteToExpire, setQuoteToExpire] = useState(null);

  // Debug: Log when modal states change
  useEffect(() => {
    console.log('🎭 Modal State Changed:', {
      showPresentedModal,
      showApprovalModal,
      showRejectionModal,
      quoteToPresent: quoteToPresent?.id
    });
  }, [showPresentedModal, showApprovalModal, showRejectionModal, quoteToPresent]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customer_id: '',
    status: 'draft', // work_order_status_enum uses lowercase - 'draft' is the initial quote status
    notes: '',
    pricing_model: 'TIME_MATERIALS',
    service_address: null, // Selected service address for commercial/property management
    // Model-specific fields
    flat_rate_amount: null,
    unit_count: null,
    unit_price: null,
    percentage: null,
    percentage_base_amount: null,
    recurring_interval: null, // MONTHLY | QUARTERLY | YEARLY | CUSTOM
    recurring_rate: null,
    recurring_start_date: null,
    recurring_end_date: null,
    recurring_custom_interval_days: null,
    milestones: [],
    quote_items: [] // Start empty - QuoteBuilder will auto-add first item with correct rate
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
        loadQuotes(),
        loadCustomers()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      showAlert('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadQuotes = async () => {
    try {
      // ✅ SMART STATUS FILTERING: Load all quote-stage statuses
      // Includes competitive advantage statuses: presented, changes_requested, follow_up
      // Excludes 'approved' - those move to Jobs page as "Unscheduled"
      const quoteStatuses = ['draft', 'sent', 'presented', 'changes_requested', 'follow_up', 'rejected', 'expired', 'cancelled'];
      const statusList = quoteStatuses.join(',');
      const response = await supaFetch(`work_orders?select=*,customers(name,email,phone)&status=in.(${statusList})&order=created_at.desc`, { method: 'GET' }, user.company_id);

      if (response.ok) {
        const data = await response.json();
        setQuotes(data || []);
      } else {
        throw new Error('Failed to load quotes');
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
      showAlert('error', 'Failed to load quotes');
      setQuotes([]);
    }
  };

  const loadCustomers = async () => {
    try {
      setCustomersLoading(true);
      console.log('=== LOADING CUSTOMERS FOR QUOTES ===');
      console.log('Company ID:', user.company_id);

      // ✅ INDUSTRY STANDARD: Query customers with proper PostgREST joins
      // Get customers with their tags using proper relationship syntax
      const response = await supaFetch(
        'customers?select=*,customer_tag_assignments(customer_tags(*))&order=created_at.desc',
        { method: 'GET' },
        user.company_id
      );

      console.log('Customer fetch response:', response);
      console.log('Response ok:', response.ok);
      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Customer data received:', data);
        console.log('Number of customers:', data.length);

        // Transform data to include tags array for easier access
        const normalized = (data || []).map(c => ({
          ...c,
          tags: (c.customer_tag_assignments || [])
            .map(assignment => assignment.customer_tags)
            .filter(Boolean),
          customer_type: c.type || 'residential',
          // Create display name from available fields
          name: c.company_name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unnamed Customer'
        }));
        setCustomers(normalized);
      } else {
        console.error('Customer fetch failed:', response.status, response.statusText);
        const errorText = await response.text().catch(() => '');
        console.error('Error response:', errorText);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  };

  const createCustomer = async ({ name, phone, email }) => {
    try {
      const response = await supaFetch(`customers`, {
        method: 'POST',
        body: {
          name,
          phone: phone || null,
          email: email || null,
          status: 'active',
          created_at: new Date().toISOString()
        }


      }, user.company_id);

      if (!response.ok) throw new Error('Failed to create customer');
      const [created] = await response.json();
      // Ensure our list is up-to-date
      await loadCustomers();
      return created;
    } catch (e) {
      console.error('Error creating customer:', e);
      throw e;
    }
  };

  const generateQuoteNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const millis = String(now.getMilliseconds()).padStart(3, '0');
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    // Format: QYYYYMMDD-HHMMSSmmm-XXXX (random suffix)
    return `Q${year}${month}${day}-${hours}${minutes}${seconds}${millis}-${rand}`;
  };

  // ✅ INDUSTRY STANDARD: Tax calculation with proper rounding and validation
  const calculateTotals = async (items) => {
    // Pull settings once
    const settingsModule = await import('../services/SettingsService');
    const settingsSvc = settingsModule.default || settingsModule; // singleton
    const settings = await settingsSvc.getBusinessSettings(user.company_id);

    const markupPct = Number(settings.parts_markup_percent) || 0;
    const taxRate = Number(settings.default_tax_rate) || 0;

    console.log('💰 TAX CALCULATION DEBUG:', {
      itemCount: items?.length || 0,
      markupPct,
      taxRate,
      items: items?.map(i => ({
        description: i.item_name || i.description,
        type: i.item_type,
        quantity: i.quantity,
        rate: i.rate,
        lineTotal: (Number(i.quantity) || 0) * (Number(i.rate) || 0)
      }))
    });

    // Sum items; apply markup only to materials/parts (industry standard)
    const subtotal = (items || []).reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      let line = qty * rate;
      const type = (item.item_type || '').toLowerCase();

      // Apply markup to materials/parts only (not labor)
      if (type === 'part' || type === 'material') {
        line = line * (1 + markupPct / 100);
      }

      return sum + line;
    }, 0);

    // ✅ FIX: Round to 2 decimal places to prevent floating point errors
    const roundedSubtotal = Math.round(subtotal * 100) / 100;
    const taxAmount = Math.round(roundedSubtotal * (taxRate / 100) * 100) / 100;
    const totalAmount = Math.round((roundedSubtotal + taxAmount) * 100) / 100;

    console.log('💰 TAX CALCULATION RESULT:', {
      subtotal: roundedSubtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: totalAmount
    });

    return {
      subtotal: roundedSubtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: totalAmount
    };
  };

  // Compute totals from pricing model if not TIME_MATERIALS
  const calculateModelTotals = async (data) => {
    const settingsModule = await import('../services/SettingsService');
    const settingsSvc = settingsModule.default || settingsModule;
    const settings = await settingsSvc.getBusinessSettings(user.company_id);
    const taxRate = Number(settings.default_tax_rate) || 0;

    let subtotal = 0;
    switch (data.pricing_model) {
      case 'FLAT_RATE':
        subtotal = Number(data.flat_rate_amount) || 0;
        break;
      case 'UNIT':
        subtotal = (Number(data.unit_count) || 0) * (Number(data.unit_price) || 0);
        break;
      case 'PERCENTAGE':
        subtotal = ((Number(data.percentage) || 0) / 100) * (Number(data.percentage_base_amount) || 0);
        break;
      case 'RECURRING':
        subtotal = Number(data.recurring_rate) || 0; // per-interval preview
        break;
      case 'MILESTONE': {
        const sums = (data.milestones || []).reduce((acc, m) => {
          const amt = Number(m.amount) || 0;
          const pct = Number(m.percentage) || 0;
          return { amount: acc.amount + amt, percentage: acc.percentage + pct };
        }, { amount: 0, percentage: 0 });
        subtotal = sums.amount + (sums.percentage / 100) * (Number(data.milestone_base_amount) || 0);
        break;
      }
      case 'TIME_MATERIALS':
      default:
        return calculateTotals(data.quote_items);
    }

    const tax_amount = subtotal * (taxRate / 100);
    return { subtotal, tax_rate: taxRate, tax_amount, total_amount: subtotal + tax_amount };
  };

  // Save milestones for a work order (replace all)
  const saveMilestones = async (workOrderId, milestones = []) => {
    // Delete existing
    await supaFetch(`work_order_milestones?work_order_id=eq.${workOrderId}`, { method: 'DELETE' }, user.company_id);
    if (!milestones || milestones.length === 0) return;
    const rows = milestones.map((m, i) => ({
      work_order_id: workOrderId,
      company_id: user.company_id,
      name: m.name || `Milestone ${i + 1}`,
      amount: m.amount ?? null,
      percentage: m.percentage ?? null,
      sort_order: m.sort_order ?? i,
      due_date: m.due_date || null,
      required: m.required ?? true,
    }));
    await supaFetch('work_order_milestones', { method: 'POST', body: rows }, user.company_id);
  };



  const createQuote = async (e, updatedFormData = null) => {
    e.preventDefault();

    // Use updated form data if provided (from QuoteBuilder with labor conversion)
    const dataToUse = updatedFormData || formData;


    // Resolve customer selection: try to match existing by name/email/phone
    if (!dataToUse.customer_id) {
      const q = (dataToUse.customer_query || '').trim().toLowerCase();
      if (q) {
        const digits = (s) => (s || '').replace(/\D/g, '');
        const match = customers.find(c => (
          (c.name && c.name.toLowerCase() === q) ||
          (c.full_name && c.full_name.toLowerCase() === q) ||
          (c.email && c.email.toLowerCase() === q) ||
          (c.phone && digits(c.phone) === digits(q))
        ));
        if (match) {
          dataToUse.customer_id = match.id;
        }
      }
      // Only create new customer if user explicitly opened the Add New section
      if (!dataToUse.customer_id && dataToUse.showAddCustomer && (dataToUse.new_customer_name || dataToUse.customer_query)) {
        const newName = dataToUse.new_customer_name?.trim() || dataToUse.customer_query?.trim();
        if (!newName) {
          showAlert('error', 'Please enter a customer name');
          return;
        }
        const created = await createCustomer({
          name: newName,
          phone: (dataToUse.new_customer_phone || '').trim() || null,
          email: (dataToUse.new_customer_email || '').trim() || null,
        });
        if (created?.id) {
          dataToUse.customer_id = created.id; // bind for quote creation
        }
      }
      // If still no customer_id, require selection/creation
      if (!dataToUse.customer_id) {
        showAlert('error', 'Please select an existing customer (Search) or click Add new to create one.');
        return;
      }
    }

    if (!dataToUse.title || !dataToUse.customer_id) {
      showAlert('error', 'Quote title and customer are required');
      return;
    }

    try {
      const totals = await (dataToUse.pricing_model === 'TIME_MATERIALS' ? calculateTotals(dataToUse.quote_items) : calculateModelTotals(dataToUse));

      console.log('💰 TOTALS CALCULATION DEBUG:', {
        pricing_model: dataToUse.pricing_model,
        quote_items_count: dataToUse.quote_items?.length,
        quote_items: dataToUse.quote_items,
        calculated_totals: totals
      });

      const quoteData = {
        quote_number: generateQuoteNumber(),
        title: dataToUse.title,
        description: dataToUse.description,
        customer_id: dataToUse.customer_id,
        status: dataToUse.status,
        notes: dataToUse.notes,
        // Use new financial fields from database schema
        subtotal: dataToUse.subtotal || totals.subtotal,
        discount_total: dataToUse.discount_total || 0,
        tax_total: dataToUse.tax_total || totals.tax_amount,
        grand_total: dataToUse.grand_total || totals.total_amount,
        // Keep legacy fields for compatibility
        tax_rate: totals.tax_rate,
        tax_amount: totals.tax_amount,
        total_amount: dataToUse.grand_total || totals.total_amount,
        // New fields from schema
        currency: dataToUse.currency || 'USD',
        customer_notes: dataToUse.customer_notes || '',
        internal_notes: dataToUse.internal_notes || '',
        payment_terms: dataToUse.payment_terms || 'Net 30',
        visible_in_portal: dataToUse.visible_in_portal !== false,
        created_at: new Date().toISOString()
      };

      console.log('Creating unified work order (QUOTE stage)...');

      // Get customer address data to copy to work order
      const selectedCustomer = customers.find(c => c.id === dataToUse.customer_id);
      console.log('🔍 Selected customer for address copy:', selectedCustomer);

      // ✅ FIX: labor_summary doesn't exist in work_orders table - removed

      // Prepare service address data
      let serviceAddressData = {};
      if (dataToUse.service_address) {
        // Use selected service address for commercial/property management
        serviceAddressData = {
          service_address_id: dataToUse.service_address.id,
          service_address_line_1: dataToUse.service_address.address_line_1,
          service_address_line_2: dataToUse.service_address.address_line_2,
          service_city: dataToUse.service_address.city,
          service_state: dataToUse.service_address.state,
          service_zip_code: dataToUse.service_address.zip_code,
          access_instructions: dataToUse.service_address.access_instructions
        };
      } else if (selectedCustomer) {
        // Fall back to customer's primary address for residential or when no service address selected
        serviceAddressData = {
          service_address_line_1: selectedCustomer.billing_address_line_1 || selectedCustomer.street_address,
          service_city: selectedCustomer.billing_city || selectedCustomer.city,
          service_state: selectedCustomer.billing_state || selectedCustomer.state,
          service_zip_code: selectedCustomer.billing_zip_code || selectedCustomer.zip_code
        };
      }

      // ✅ Build payload with ONLY defined fields that exist in work_orders table
      const workOrderCreate = {
        quote_number: generateQuoteNumber(),
        work_order_number: generateQuoteNumber(), // Required field
        title: dataToUse.title,
        description: dataToUse.description,
        customer_id: dataToUse.customer_id,
        status: (dataToUse.status || 'draft').toLowerCase(),
        notes: dataToUse.notes,
        customer_notes: dataToUse.customer_notes || '',
        internal_notes: dataToUse.internal_notes || '',
        subtotal: totals.subtotal,
        tax_rate: totals.tax_rate,
        tax_amount: totals.tax_amount,
        total_amount: totals.total_amount,
        pricing_model: dataToUse.pricing_model || 'TIME_MATERIALS',
        payment_terms: dataToUse.payment_terms || 'Net 30',
        created_at: new Date().toISOString()
      };

      // Add service address fields ONLY if they have values
      if (serviceAddressData.service_address_line_1) {
        workOrderCreate.service_address_line_1 = serviceAddressData.service_address_line_1;
      }
      if (serviceAddressData.service_address_line_2) {
        workOrderCreate.service_address_line_2 = serviceAddressData.service_address_line_2;
      }
      if (serviceAddressData.service_city) {
        workOrderCreate.service_city = serviceAddressData.service_city;
      }
      if (serviceAddressData.service_state) {
        workOrderCreate.service_state = serviceAddressData.service_state;
      }
      if (serviceAddressData.service_zip_code) {
        workOrderCreate.service_zip_code = serviceAddressData.service_zip_code;
      }
      if (serviceAddressData.service_address_id) {
        workOrderCreate.service_address_id = serviceAddressData.service_address_id;
      }
      if (serviceAddressData.access_instructions) {
        workOrderCreate.access_instructions = serviceAddressData.access_instructions;
      }

      // Add pricing model fields ONLY if they have values
      if (dataToUse.pricing_model === 'FLAT_RATE' && dataToUse.flat_rate_amount != null) {
        workOrderCreate.flat_rate_amount = dataToUse.flat_rate_amount;
      }
      if (dataToUse.pricing_model === 'UNIT') {
        if (dataToUse.unit_count != null) workOrderCreate.unit_count = dataToUse.unit_count;
        if (dataToUse.unit_price != null) workOrderCreate.unit_price = dataToUse.unit_price;
      }
      if (dataToUse.pricing_model === 'PERCENTAGE') {
        if (dataToUse.percentage != null) workOrderCreate.percentage = dataToUse.percentage;
        if (dataToUse.percentage_base_amount != null) workOrderCreate.percentage_base_amount = dataToUse.percentage_base_amount;
      }
      if (dataToUse.pricing_model === 'RECURRING' && dataToUse.recurring_interval) {
        workOrderCreate.recurring_interval = dataToUse.recurring_interval;
      }

      // Add modal data fields ONLY if they have values
      if (dataToUse.presented_date) workOrderCreate.presented_date = dataToUse.presented_date;
      if (dataToUse.presented_time) workOrderCreate.presented_time = dataToUse.presented_time;
      if (dataToUse.presented_by) workOrderCreate.presented_by = dataToUse.presented_by;
      if (dataToUse.customer_reaction) workOrderCreate.customer_reaction = dataToUse.customer_reaction;
      if (dataToUse.next_steps) workOrderCreate.next_steps = dataToUse.next_steps;
      if (dataToUse.presented_notes) workOrderCreate.presented_notes = dataToUse.presented_notes;
      if (dataToUse.change_types) workOrderCreate.change_types = dataToUse.change_types;
      if (dataToUse.change_details) workOrderCreate.change_details = dataToUse.change_details;
      if (dataToUse.change_urgency) workOrderCreate.change_urgency = dataToUse.change_urgency;
      if (dataToUse.change_follow_up_date) workOrderCreate.change_follow_up_date = dataToUse.change_follow_up_date;
      if (dataToUse.follow_up_date) workOrderCreate.follow_up_date = dataToUse.follow_up_date;
      if (dataToUse.follow_up_time) workOrderCreate.follow_up_time = dataToUse.follow_up_time;
      if (dataToUse.follow_up_method) workOrderCreate.follow_up_method = dataToUse.follow_up_method;
      if (dataToUse.follow_up_reminder_time) workOrderCreate.follow_up_reminder_time = dataToUse.follow_up_reminder_time;
      if (dataToUse.follow_up_reason) workOrderCreate.follow_up_reason = dataToUse.follow_up_reason;
      if (dataToUse.follow_up_notes) workOrderCreate.follow_up_notes = dataToUse.follow_up_notes;
      if (dataToUse.rejection_reason) workOrderCreate.rejection_reason = dataToUse.rejection_reason;
      if (dataToUse.rejection_competitor_name) workOrderCreate.rejection_competitor_name = dataToUse.rejection_competitor_name;
      if (dataToUse.rejection_notes) workOrderCreate.rejection_notes = dataToUse.rejection_notes;

      console.log('🔍 Work order create payload:', {
        quote_number: workOrderCreate.quote_number,
        customer_id: workOrderCreate.customer_id,
        service_address_line_1: workOrderCreate.service_address_line_1,
        service_city: workOrderCreate.service_city,
        service_state: workOrderCreate.service_state,
        service_zip_code: workOrderCreate.service_zip_code,
        status: workOrderCreate.status,
        total_amount: workOrderCreate.total_amount
      });

      let response = await supaFetch(`work_orders`, {
        method: 'POST',
        headers: {
          'Prefer': 'return=representation'
        },
        body: workOrderCreate
      }, user.company_id);

      // ✅ FIX: Show actual error if create fails
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('📝 CREATE QUOTE - ERROR DETAILS:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage: errorText,
          sentData: workOrderCreate
        });
        throw new Error(`Failed to create quote (${response.status}): ${errorText}`);
      }


      if (response.ok) {
        // Parse response JSON if present
        let newWO = null;
        try {
          const responseText = await response.text();
          if (responseText && responseText.trim()) {
            const responseData = JSON.parse(responseText);
            newWO = Array.isArray(responseData) ? responseData[0] : responseData;
          }
        } catch (_) {}
        if (!newWO) newWO = { id: undefined };
        console.log('New work order (QUOTE):', newWO);

        // Save work order items - Industry standard: save all line items with proper validation
        console.log('🔍 CHECKING LINE ITEMS:', {
          quote_items_length: dataToUse.quote_items?.length,
          quote_items: dataToUse.quote_items,
          work_order_id: newWO.id
        });

        // ✅ FIX: Remove strict first-item check - filter happens inside saveQuoteItems
        if (dataToUse.quote_items && dataToUse.quote_items.length > 0) {
          console.log('Saving work order items...');
          await saveQuoteItems(newWO.id, dataToUse.quote_items);
        // After work order is created, save milestones if applicable
        if (dataToUse.pricing_model === 'MILESTONE' && newWO.id) {
          try {
            await saveMilestones(newWO.id, dataToUse.milestones || []);
          } catch (e) {
            console.warn('Saving milestones failed (non-fatal):', e);
          }
        }

        }

        console.log('Quote creation complete, closing modal...');
        showAlert('success', 'Quote created successfully!');

        // ✅ Return the new quote so QuoteBuilder can handle "Send to Customer"
        resetForm();
        setShowCreateForm(false);
        loadQuotes();

        return newWO; // Return the created quote with ID
      } else {
        const errText = await response.text();
        console.error('Create quote failed:', response.status, response.statusText, errText);
        throw new Error('Failed to create quote');
      }
    } catch (error) {
      console.error('Error creating quote:', error);
      showAlert('error', 'Failed to create quote');
    }
  };

  const updateQuote = async (e, updatedFormData = null) => {
    console.log('🎯 updateQuote CALLED:', {
      hasEvent: !!e,
      hasUpdatedFormData: !!updatedFormData,
      updatedFormDataId: updatedFormData?.id,
      selectedQuoteId: selectedQuote?.id
    });

    e?.preventDefault();

    // Use updated form data if provided (from QuoteBuilder with labor conversion)
    const dataToUse = updatedFormData || formData;

    if (!dataToUse.title || !dataToUse.customer_id) {
      showAlert('error', 'Quote title and customer are required');
      return;
    }

    // ✅ VALIDATE STATUS TRANSITION
    const currentStatus = selectedQuote?.status;
    const newStatus = dataToUse.status;
    if (currentStatus && newStatus && newStatus !== currentStatus) {
      if (!isStatusTransitionAllowed(currentStatus, newStatus)) {
        showAlert('error', `Cannot change status from "${currentStatus}" to "${newStatus}". Invalid transition.`);
        return;
      }
    }

    // ✅ PHASE 3: INTERCEPT STATUS CHANGES FOR MODALS
    // Intercept status changes to show appropriate modals for data capture

    const skipInterceptors = !!dataToUse?.skipInterceptors;

    console.log('🔍 INTERCEPT CHECK:', {
      selectedQuote: selectedQuote?.id,
      selectedQuoteStatus: selectedQuote?.status,
      currentStatus,
      newStatus,
      statusChanging: currentStatus !== newStatus,
      dataToUse: dataToUse?.id,
      skipInterceptors
    });

    if (!skipInterceptors) {
      // INTERCEPT: Send Quote (draft → sent)
      if (newStatus === 'sent' && currentStatus !== 'sent') {
        console.log('✅ INTERCEPTING: Opening SendQuoteModal');
        setQuoteToSend({ ...selectedQuote, ...dataToUse });
        setShowSendQuoteModal(true);
        return { modalOpened: true, modalType: 'send' }; // Signal that modal was opened
      }

      // INTERCEPT: Presented (draft/sent → presented)
      console.log('🔍 Checking Presented:', {
        newStatus,
        currentStatus,
        isPresented: newStatus === 'presented',
        notAlreadyPresented: currentStatus !== 'presented',
        shouldIntercept: newStatus === 'presented' && currentStatus !== 'presented'
      });
      if (newStatus === 'presented' && currentStatus !== 'presented') {
        console.log('✅ INTERCEPTING: Opening PresentedModal');
        console.log('🔍 Before setState - showPresentedModal:', showPresentedModal);
        setQuoteToPresent({ ...selectedQuote, ...dataToUse });
        setShowPresentedModal(true);
        console.log('🔍 After setState - called setShowPresentedModal(true)');
        return { modalOpened: true, modalType: 'presented' }; // Signal that modal was opened
      }

      // INTERCEPT: Approved (sent/presented → approved)
      if (newStatus === 'approved' && currentStatus !== 'approved') {
        console.log('✅ INTERCEPTING: Opening ApprovalModal');
        setQuoteToApprove({ ...selectedQuote, ...dataToUse });
        setShowApprovalModal(true);
        return { modalOpened: true, modalType: 'approved' }; // Signal that modal was opened
      }

      // INTERCEPT: Rejected (sent/presented → rejected)
      if (newStatus === 'rejected' && currentStatus !== 'rejected') {
        console.log('✅ INTERCEPTING: Opening RejectionModal');
        setQuoteToReject({ ...selectedQuote, ...dataToUse });
        setShowRejectionModal(true);
        return { modalOpened: true, modalType: 'rejected' }; // Signal that modal was opened
      }

      // INTERCEPT: Changes Requested (sent/presented → changes_requested)
      if (newStatus === 'changes_requested' && currentStatus !== 'changes_requested') {
        setQuoteToChangeRequest({ ...selectedQuote, ...dataToUse });
        setShowChangesRequestedModal(true);
        return { modalOpened: true, modalType: 'changes_requested' }; // Signal that modal was opened
      }

      // INTERCEPT: Follow Up (sent/presented → follow_up)
      if (newStatus === 'follow_up' && currentStatus !== 'follow_up') {
        setQuoteToFollowUp({ ...selectedQuote, ...dataToUse });
        setShowFollowUpModal(true);
        return { modalOpened: true, modalType: 'follow_up' }; // Signal that modal was opened
      }

      // INTERCEPT: Expired (sent → expired)
      if (newStatus === 'expired' && currentStatus !== 'expired') {
        setQuoteToExpire({ ...selectedQuote, ...dataToUse });
        setShowExpiredModal(true);
        return { modalOpened: true, modalType: 'expired' }; // Signal that modal was opened
      }
    }

    try {
      const totals = await (dataToUse.pricing_model === 'TIME_MATERIALS' ? calculateTotals(dataToUse.quote_items) : calculateModelTotals(dataToUse));
      const quoteData = {
        title: dataToUse.title,
        description: dataToUse.description,
        customer_id: dataToUse.customer_id,
        company_id: user.company_id, // Add company_id for multi-tenant isolation
        status: dataToUse.status,
        notes: dataToUse.notes,
        // Use new financial fields from database schema
        subtotal: dataToUse.subtotal || totals.subtotal,
        discount_total: dataToUse.discount_total || 0,
        tax_total: dataToUse.tax_total || totals.tax_amount,
        grand_total: dataToUse.grand_total || totals.total_amount,
        // Keep legacy fields for compatibility
        tax_rate: totals.tax_rate,
        tax_amount: totals.tax_amount,
        total_amount: dataToUse.grand_total || totals.total_amount,
        // New fields from schema
        currency: dataToUse.currency || 'USD',
        customer_notes: dataToUse.customer_notes || '',
        internal_notes: dataToUse.internal_notes || '',
        payment_terms: dataToUse.payment_terms || 'Net 30',
        visible_in_portal: dataToUse.visible_in_portal !== false
      };

      console.log('🔍 RAW quoteData.status:', quoteData.status);
      console.log('🔍 RAW dataToUse.status:', dataToUse.status);
      console.log('🔍 RAW selectedQuote.status:', selectedQuote.status);

      // Get customer address data to copy to work order
      const selectedCustomer = customers.find(c => c.id === dataToUse.customer_id);
      console.log('🔍 Update quote - selected customer for address copy:', selectedCustomer);

      // Normalize status values for comparison (database uses lowercase)
      const newStatusForData = (quoteData.status || 'draft').toLowerCase();
      const currentStatusForData = (selectedQuote.status || 'draft').toLowerCase();

      console.log('🔍 NORMALIZED newStatusForData:', newStatusForData);
      console.log('🔍 NORMALIZED currentStatusForData:', currentStatusForData);

      // ✅ FIX: Only send fields that ACTUALLY EXIST in work_orders table
      // ✅ CRITICAL: Database has CHECK constraint: total_amount = subtotal + tax_amount
      // ✅ RECALCULATE to ensure constraint is satisfied (no rounding errors)
      const calculatedSubtotal = parseFloat(quoteData.subtotal || 0);
      const calculatedTaxRate = parseFloat(quoteData.tax_rate || 0);
      // Recalculate tax from subtotal to ensure precision
      const calculatedTaxAmount = Math.round(calculatedSubtotal * (calculatedTaxRate / 100) * 100) / 100;
      // MUST satisfy constraint: total_amount = subtotal + tax_amount
      const calculatedTotal = Math.round((calculatedSubtotal + calculatedTaxAmount) * 100) / 100;

      const workOrderData = {
        title: quoteData.title,
        description: quoteData.description,
        customer_id: quoteData.customer_id,
        // ✅ ALWAYS send status - trigger needs it even if unchanged
        status: newStatusForData,
        subtotal: calculatedSubtotal,
        tax_rate: calculatedTaxRate,
        tax_amount: calculatedTaxAmount,
        // ✅ MUST match constraint: total_amount = subtotal + tax_amount
        total_amount: calculatedTotal,
        updated_at: new Date().toISOString(),
        // ✅ MODAL DATA FIELDS - Include if present in dataToUse
        ...(dataToUse.presented_date && { presented_date: dataToUse.presented_date }),
        ...(dataToUse.presented_time && { presented_time: dataToUse.presented_time }),
        ...(dataToUse.presented_by && { presented_by: dataToUse.presented_by }),
        ...(dataToUse.customer_reaction && { customer_reaction: dataToUse.customer_reaction }),
        ...(dataToUse.next_steps && { next_steps: dataToUse.next_steps }),
        ...(dataToUse.presented_notes && { presented_notes: dataToUse.presented_notes }),
        ...(dataToUse.change_types && { change_types: dataToUse.change_types }),
        ...(dataToUse.change_details && { change_details: dataToUse.change_details }),
        ...(dataToUse.change_urgency && { change_urgency: dataToUse.change_urgency }),
        ...(dataToUse.change_follow_up_date && { change_follow_up_date: dataToUse.change_follow_up_date }),
        ...(dataToUse.follow_up_date && { follow_up_date: dataToUse.follow_up_date }),
        ...(dataToUse.follow_up_time && { follow_up_time: dataToUse.follow_up_time }),
        ...(dataToUse.follow_up_method && { follow_up_method: dataToUse.follow_up_method }),
        ...(dataToUse.follow_up_reminder_time && { follow_up_reminder_time: dataToUse.follow_up_reminder_time }),
        ...(dataToUse.follow_up_reason && { follow_up_reason: dataToUse.follow_up_reason }),
        ...(dataToUse.follow_up_notes && { follow_up_notes: dataToUse.follow_up_notes }),
        ...(dataToUse.rejection_reason && { rejection_reason: dataToUse.rejection_reason }),
        ...(dataToUse.rejection_competitor_name && { rejection_competitor_name: dataToUse.rejection_competitor_name }),
        ...(dataToUse.rejection_notes && { rejection_notes: dataToUse.rejection_notes })
      };

      console.log('🔍 MODAL DATA INCLUDED:', {
        change_types: workOrderData.change_types,
        change_details: workOrderData.change_details,
        change_urgency: workOrderData.change_urgency,
        presented_by: workOrderData.presented_by,
        follow_up_date: workOrderData.follow_up_date,
        rejection_reason: workOrderData.rejection_reason
      });

      console.log('💰 CONSTRAINT CHECK:', {
        subtotal: calculatedSubtotal,
        tax_rate: calculatedTaxRate,
        tax_amount: calculatedTaxAmount,
        total_amount: calculatedTotal,
        constraint_satisfied: calculatedTotal === (calculatedSubtotal + calculatedTaxAmount),
        calculation: `${calculatedSubtotal} + ${calculatedTaxAmount} = ${calculatedSubtotal + calculatedTaxAmount}`
      });

      console.log('🔍 IMMEDIATELY AFTER CREATION - workOrderData:', {
        ...workOrderData,
        hasStatus: 'status' in workOrderData,
        statusValue: workOrderData.status,
        statusType: typeof workOrderData.status
      });

      // If accepting the quote, construct work_location from customer address
      if (quoteData.status === 'ACCEPTED' && selectedQuote.customers) {
        const customer = selectedQuote.customers;
        const addressParts = [];

        if (customer.street_address) addressParts.push(customer.street_address);

        const cityStateZip = [];
        if (customer.city) cityStateZip.push(customer.city);
        if (customer.state) cityStateZip.push(customer.state);
        if (customer.zip_code) cityStateZip.push(customer.zip_code);

        if (cityStateZip.length > 0) {
          addressParts.push(cityStateZip.join(', '));
        }

        const workLocation = addressParts.join(', ') || customer.address || '';
        if (workLocation) {
          workOrderData.work_location = workLocation;
        }
      }

      console.log('🔍 ===== UPDATE QUOTE DEBUG =====');
      console.log('🔍 Selected Quote:', {
        id: selectedQuote.id,
        title: selectedQuote.title,
        current_status: selectedQuote.status
      });
      console.log('🔍 Status Comparison:', {
        oldStatus: currentStatusForData,
        newStatus: newStatusForData,
        statusChanging: newStatusForData !== currentStatusForData
      });
      console.log('🔍 Work Order Data:', {
        fields: Object.keys(workOrderData),
        hasStatus: 'status' in workOrderData,
        statusValue: workOrderData.status,
        fullData: workOrderData
      });
      console.log('🔍 Quote Items:', {
        count: dataToUse.quote_items?.length || 0,
        items: dataToUse.quote_items
      });

      let response = await supaFetch(`work_orders?id=eq.${selectedQuote.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: workOrderData
      }, user.company_id);

      console.log('🔍 UPDATE RESPONSE:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });

      // ✅ FIX: Show actual error if update fails
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('❌ UPDATE FAILED:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage: errorText,
          sentData: workOrderData
        });
        throw new Error(`Failed to update quote (${response.status}): ${errorText}`);
      }

      console.log('✅ Work order updated successfully!');

      // Save milestones if pricing model is MILESTONE
      if (dataToUse.pricing_model === 'MILESTONE') {
        try {
          console.log('💰 Saving milestones...');
          await saveMilestones(selectedQuote.id, dataToUse.milestones || []);
        } catch (e) {
          console.warn('⚠️ Saving milestones (update) failed (non-fatal):', e);
        }
      }

      // Persist items - ✅ FIXED: Remove strict first-item check
      console.log('🗑️ Deleting old quote items...');
      await deleteQuoteItems(selectedQuote.id);
      if (dataToUse.quote_items && dataToUse.quote_items.length > 0) {
        console.log('💾 Saving line items:', dataToUse.quote_items.length);
        await saveQuoteItems(selectedQuote.id, dataToUse.quote_items);
      } else {
        console.log('⚠️ No line items to save');
      }

      // Get updated row so we can navigate based on NEW.stage (auto trigger handles stage/status)
      let updated = null;
      try {
        const txt = await response.text();
        if (txt && txt.trim()) {
          const arr = JSON.parse(txt);
          updated = Array.isArray(arr) ? arr[0] : arr;
        }
      } catch (_) {}

      const newStatus = updated?.status || dataToUse.status;

      showAlert('success', 'Quote updated successfully!');

      // Navigate based on status change (work_orders uses status enum, not stage)
      // ✅ FIXED: Only check lowercase 'approved' (enum cleanup)
      if (dataToUse.status === 'approved') {
        // Show scheduling prompt
        const shouldSchedule = window.confirm('Quote accepted! Would you like to schedule this job now?');
        console.log('🔍 User clicked schedule?', shouldSchedule);

        if (shouldSchedule) {
          // ✅ PROPER FIX: Pass job data via React Router state to avoid race conditions
          // Load work_order_line_items for the job before navigating
          try {
            console.log('🔄 Loading work_order_line_items for quote:', selectedQuote.id);
            const itemsResponse = await supaFetch(`work_order_line_items?work_order_id=eq.${selectedQuote.id}`, { method: 'GET' }, user.company_id);
            const items = itemsResponse.ok ? await itemsResponse.json() : [];
            console.log('📋 Loaded work_order_line_items for scheduling:', items);

            const jobDataForScheduler = {
              ...selectedQuote,
              work_order_items: items // Keep as work_order_items for SmartSchedulingAssistant compatibility
            };

            console.log('🚀 Navigating to /jobs with state:', {
              openScheduler: true,
              jobData: jobDataForScheduler
            });

            // Navigate with job data in state
            navigate(`/jobs`, {
              state: {
                openScheduler: true,
                jobData: jobDataForScheduler
              }
            });

            console.log('✅ Navigation complete');
          } catch (error) {
            console.error('❌ Error loading work order line items:', error);
            // Fallback to URL params if loading items fails
            console.log('🔄 Falling back to URL params');
            navigate(`/jobs?edit=${selectedQuote.id}&schedule=new`);
          }
        } else {
          // ✅ INDUSTRY STANDARD: Navigate to Jobs page with unscheduled filter
          // Matches ServiceTitan/Jobber/Housecall Pro: Approved quotes go to "Unscheduled Jobs"
          console.log('🔄 User declined scheduling, navigating to /jobs with unscheduled filter');
          navigate(`/jobs?filter=unscheduled`);
        }
      } else if (newStatus === 'scheduled' || newStatus === 'in_progress') {
        // Navigate to jobs/calendar for scheduled/active work
        navigate(`/jobs`);
      } else {
        // Remain on quotes list
        resetForm();
        setShowEditForm(false);
        setSelectedQuote(null);
        loadQuotes();
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      showAlert('error', 'Failed to update quote');
      return null; // Return null on error
    }

    // ✅ Return the updated quote so QuoteBuilder can use it for "Send to Customer"
    return { ...selectedQuote, ...dataToUse };
  };

  // ✅ INDUSTRY STANDARD: Save line items with proper validation and error handling
  const saveQuoteItems = async (workOrderId, items) => {
    console.log('🔍 ===== SAVE QUOTE ITEMS DEBUG =====');
    console.log('🔍 RAW ITEMS RECEIVED:', JSON.stringify(items, null, 2));
    console.log('🔍 Total items received:', items.length);

    // Filter out invalid items (no description)
    const itemsData = items
      .filter(item => {
        const hasDescription = (item.item_name && item.item_name.trim()) || (item.description && item.description.trim());
        console.log('🔍 FILTER CHECK:', {
          item_name: item.item_name,
          description: item.description,
          item_type: item.item_type,
          hasDescription,
          willKeep: hasDescription
        });
        if (!hasDescription) {
          console.warn('⚠️ Skipping line item without description:', item);
        }
        return hasDescription;
      })
      .map((item, index) => {
        // Map frontend fields to database schema (industry standard)
        const lineItem = {
          work_order_id: workOrderId,
          line_type: (item.item_type || item.line_type || 'material').toLowerCase(), // labor, material, equipment, service, fee, discount, tax
          description: item.item_name || item.description,
          quantity: parseFloat(item.quantity) || 1,
          unit_price: parseFloat(item.rate || item.unit_price) || 0,
          sort_order: index
        };

        // Optional fields (industry standard)
        if (item.tax_rate != null) lineItem.tax_rate = parseFloat(item.tax_rate);
        if (item.discount_percent != null) lineItem.discount_percent = parseFloat(item.discount_percent);
        if (item.cost != null) lineItem.cost = parseFloat(item.cost);
        if (item.sku) lineItem.sku = item.sku;
        if (item.unit_of_measure) lineItem.unit_of_measure = item.unit_of_measure;

        return lineItem;
      });

    console.log('📦 SAVING LINE ITEMS:', {
      workOrderId,
      totalItems: items.length,
      validItems: itemsData.length,
      filteredOut: items.length - itemsData.length,
      mappedItems: itemsData
    });

    if (itemsData.length === 0) {
      console.log('⚠️ No valid line items to save (all filtered out)');
      return;
    }

    try {
      const response = await supaFetch(`work_order_line_items`, {
        method: 'POST',
        body: itemsData
      }, user.company_id);

      console.log('📦 LINE ITEMS RESPONSE:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('📦 LINE ITEMS ERROR DETAILS:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          sentData: itemsData
        });
        throw new Error(`Failed to save line items (${response.status}): ${errorText}`);
      }

      console.log('✅ Line items saved successfully:', itemsData.length, 'items');
    } catch (error) {
      console.error('❌ CRITICAL ERROR saving line items:', error);
      // Re-throw to prevent quote from appearing as "created successfully" when line items failed
      throw error;
    }
  };

  const deleteQuoteItems = async (workOrderId) => {
    // ✅ CORRECT TABLE: work_order_line_items
    await supaFetch(`work_order_line_items?work_order_id=eq.${workOrderId}`, { method: 'DELETE' }, user.company_id);
  };

  const deleteQuote = async (quoteId, quoteTitle) => {
    if (!window.confirm(`Are you sure you want to delete quote: ${quoteTitle}?`)) {
      return;
    }

    try {
      // Delete quote items first
      await deleteQuoteItems(quoteId);

      // Delete work order (unified system)
      const response = await supaFetch(`work_orders?id=eq.${quoteId}`, { method: 'DELETE' }, user.company_id);

      if (response.ok) {
        showAlert('success', `Quote ${quoteTitle} deleted successfully`);
        loadQuotes();
      } else {
        throw new Error('Failed to delete quote');
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      showAlert('error', 'Failed to delete quote');
    }
  };

  // ✅ INDUSTRY STANDARD: Duplicate quote as template (major pain point fix!)
  const duplicateQuote = async (quote) => {
    try {
      console.log('📋 Duplicating quote:', quote.id);

      // Load line items from the original quote
      const itemsResponse = await supaFetch(`work_order_line_items?work_order_id=eq.${quote.id}`, { method: 'GET' }, user.company_id);
      let lineItems = [];
      if (itemsResponse.ok) {
        lineItems = await itemsResponse.json();
      }

      console.log('📋 Loaded line items for duplication:', lineItems.length);

      // Convert line items to quote_items format for the form
      const quote_items = lineItems.map(item => ({
        item_name: item.description,
        description: item.description,
        quantity: item.quantity,
        rate: item.unit_price,
        item_type: item.line_type,
        tax_rate: item.tax_rate,
        discount_percent: item.discount_percent,
        cost: item.cost,
        sku: item.sku,
        unit_of_measure: item.unit_of_measure
      }));

      // Populate form with duplicated data (new quote number, same customer/items)
      setFormData({
        ...quote,
        id: null, // Clear ID to create new quote
        quote_number: null, // Will generate new number
        work_order_number: null,
        title: `${quote.title} (Copy)`,
        status: 'draft', // Always start as draft
        quote_items: quote_items,
        created_at: null,
        updated_at: null
      });

      setShowCreateForm(true);
      showAlert('success', 'Quote duplicated! Edit and save to create a new quote.');
    } catch (error) {
      console.error('Error duplicating quote:', error);
      showAlert('error', 'Failed to duplicate quote');
    }
  };

  const convertToJob = async (quote) => {
    if (quote.status !== 'ACCEPTED') {
      showAlert('error', 'Only accepted quotes can be converted to jobs');
      return;
    }

    try {
      // Load items from unified work_order_line_items for job description
      const itemsResponse = await supaFetch(`work_order_line_items?work_order_id=eq.${quote.id}`, { method: 'GET' }, user.company_id);

      let jobDescription = quote.description || '';
      if (itemsResponse.ok) {
        const items = await itemsResponse.json();
        if (items.length > 0) {
          jobDescription += '\n\nQuote Items:\n' + items.map(item =>
            `- ${item.description} (Qty: ${item.quantity}, Rate: $${item.unit_price})`
          ).join('\n');
        }
      }

      console.log('Using GPT-5 promotion function to convert quote to job...');

      // First, construct work_location and service address from quote data
      let workLocation = '';
      let serviceAddressData = {};

      if (quote.customers) {
        const customer = quote.customers;

        // Check if quote has a specific service address (for commercial/property management)
        if (quote.service_address) {
          // Use the selected service address
          const addressParts = [];
          if (quote.service_address.address_line_1) addressParts.push(quote.service_address.address_line_1);
          if (quote.service_address.address_line_2) addressParts.push(quote.service_address.address_line_2);

          const cityStateZip = [];
          if (quote.service_address.city) cityStateZip.push(quote.service_address.city);
          if (quote.service_address.state) cityStateZip.push(quote.service_address.state);
          if (quote.service_address.zip_code) cityStateZip.push(quote.service_address.zip_code);

          if (cityStateZip.length > 0) {
            addressParts.push(cityStateZip.join(', '));
          }

          workLocation = addressParts.join(', ');
          serviceAddressData = {
            service_address_id: quote.service_address.id,
            service_address_line_1: quote.service_address.address_line_1,
            service_address_line_2: quote.service_address.address_line_2,
            service_city: quote.service_address.city,
            service_state: quote.service_address.state,
            service_zip_code: quote.service_address.zip_code,
            access_instructions: quote.service_address.access_instructions
          };
        } else {
          // Fall back to customer's primary address (residential or no service address selected)
          const addressParts = [];
          if (customer.street_address) addressParts.push(customer.street_address);

          const cityStateZip = [];
          if (customer.city) cityStateZip.push(customer.city);
          if (customer.state) cityStateZip.push(customer.state);
          if (customer.zip_code) cityStateZip.push(customer.zip_code);

          if (cityStateZip.length > 0) {
            addressParts.push(cityStateZip.join(', '));
          }

          workLocation = addressParts.join(', ') || customer.address || '';
          serviceAddressData = {
            service_address_line_1: customer.street_address,
            service_city: customer.city,
            service_state: customer.state,
            service_zip_code: customer.zip_code
          };
        }
      }

      // Update the quote status to approved and set work_location + service address for the job stage
      const quoteUpdateResponse = await supaFetch(`work_orders?id=eq.${quote.id}`, {
        method: 'PATCH',
        body: {
          status: 'approved',  // Lowercase to match enum
          quote_accepted_at: new Date().toISOString(),
          work_location: workLocation,  // Set the constructed address for job/work order stages
          ...serviceAddressData  // Add structured service address fields
        }
      }, user.company_id);

      if (!quoteUpdateResponse.ok) {
        throw new Error('Failed to update quote status');
      }

      // Then use GPT-5's promotion function to move to JOB stage
      const promotionResponse = await supaFetch(`rpc/promote_quote_to_job`, {
        method: 'POST',
        body: {
          p_id: quote.id,
          p_job_status: 'DRAFT'
        }
      }, user.company_id);

      console.log('Promotion response:', promotionResponse);

      let response = promotionResponse;

      if (response.ok) {
        console.log('Work order conversion successful');

        // Items already exist in work_order_line_items (no need to copy)
        console.log('✅ Work order line items already exist from quote creation');

        // Show success message and prompt for scheduling
        showAlert('success', `Quote accepted and converted to work order successfully!`);

        // Show scheduling prompt after a brief delay
        setTimeout(() => {
          const shouldSchedule = window.confirm(
            `Work order created successfully! Would you like to schedule this work order now?\n\n` +
            `Click OK to open the scheduling assistant, or Cancel to schedule later.`
          );

          if (shouldSchedule) {
            // Navigate to Work Orders page with scheduling prompt
            window.location.href = `/work-orders?schedule=${quote.id}`;
          }
        }, 1000);

      } else {
        const errorText = await response.text();
        console.error('Job creation failed:', response.status, response.statusText, errorText);
        throw new Error('Failed to convert quote to job');
      }
    } catch (error) {
      console.error('Error converting quote to job:', error);
      showAlert('error', 'Failed to convert quote to job');
    }
  };

  const resetForm = () => {
    setFormData({
      id: null, // Reset id
      title: '',
      description: '',
      customer_id: '',
      status: 'draft',  // Lowercase to match enum
      notes: '',
      customer_notes: '', // ✅ Reset customer notes (if column exists)
      internal_notes: '', // ✅ Reset internal notes
      pricing_model: 'TIME_MATERIALS',
      service_address: null, // Reset service address
      // Financial fields - USE CORRECT COLUMN NAMES FROM DATABASE!
      subtotal: 0,
      tax_amount: 0, // ✅ CORRECT: tax_amount (not tax_total)
      total_amount: 0, // ✅ CORRECT: total_amount (not grand_total)
      currency: 'USD',
      payment_terms: '',
      // Model-specific fields
      flat_rate_amount: null,
      unit_count: null,
      unit_price: null,
      percentage: null,
      percentage_base_amount: null,
      recurring_interval: null,
      recurring_rate: null,
      recurring_start_date: null,
      recurring_end_date: null,
      recurring_custom_interval_days: null,
      milestones: [],
      labor_summary: null,
      quote_items: []
    });
  };

  const openEditForm = async (quote) => {
    setSelectedQuote(quote);

    try {
      // Fetch the latest work_order row to ensure we have labor_summary and current fields
      let wo = quote;
      const woResp = await supaFetch(`work_orders?id=eq.${quote.id}&select=*`, { method: 'GET' }, user.company_id);
      if (woResp.ok) {
        const rows = await woResp.json();
        if (rows && rows[0]) wo = rows[0];
      }

      // Load items from unified work_order_line_items (CORRECT TABLE NAME!)
      const response = await supaFetch(`work_order_line_items?work_order_id=eq.${quote.id}`, { method: 'GET' }, user.company_id);

      let quoteItems = [];
      if (response.ok) {
        const items = await response.json();
        console.log('📦 Loaded work_order_line_items:', items);
        if (items.length > 0) {
          quoteItems = items.map(item => ({
            item_name: item.description || '', // ✅ CORRECT: description (not item_name)
            quantity: item.quantity || 1,
            rate: item.unit_price || 0, // ✅ CORRECT: unit_price (not rate)
            item_type: item.line_type || 'material', // ✅ CORRECT: line_type (not item_type)
            is_overtime: false, // Not in schema
            description: item.description || '',
            photo_url: '' // Not in schema
          }));
          console.log('📦 Converted quote_items:', quoteItems);
        }
      }

      // If model is MILESTONE, try loading milestones (ignore if table not present)
      let milestones = [];
      if (wo.pricing_model === 'MILESTONE') {
        try {
          const msResp = await supaFetch(`work_order_milestones?work_order_id=eq.${quote.id}&order=sort_order.asc`, { method: 'GET' }, user.company_id);
          if (msResp.ok) {
            milestones = await msResp.json();
          }
        } catch (e) {
          console.warn('Milestones table not available or fetch failed (non-fatal).');
        }
      }

      // Load service address if it exists
      let serviceAddress = null;
      if (wo.service_address_id) {
        try {
          const addressResp = await supaFetch(`customer_addresses?id=eq.${wo.service_address_id}`, { method: 'GET' }, user.company_id);
          if (addressResp.ok) {
            const addresses = await addressResp.json();
            if (addresses && addresses[0]) {
              serviceAddress = addresses[0];
            }
          }
        } catch (e) {
          console.warn('Failed to load service address (non-fatal):', e);
        }
      }

      console.log('📝 Setting formData for edit:', {
        id: wo.id,
        title: wo.title,
        customer_id: wo.customer_id,
        status: wo.status, // ✅ LOG STATUS TO DEBUG
        labor_summary: wo.labor_summary,
        quote_items_count: quoteItems.length,
        subtotal: wo.subtotal,
        tax_amount: wo.tax_amount,
        total_amount: wo.total_amount
      });

      // ✅ FIX: Get customer name for customer_query field
      const selectedCustomer = customers.find(c => c.id === wo.customer_id);
      const customerName = selectedCustomer ? (selectedCustomer.name || selectedCustomer.full_name || '') : '';

      setFormData({
        id: wo.id, // ✅ CRITICAL - QuoteBuilder needs this to trigger labor loading!
        title: wo.title || '',
        description: wo.description || '',
        customer_id: wo.customer_id || '',
        customer_query: customerName, // ✅ FIX: Set customer name so it displays in edit form
        status: wo.status || 'draft', // work_order_status_enum uses lowercase - 'draft' is the initial quote status
        notes: wo.notes || '',
        customer_notes: wo.customer_notes || '', // ✅ Load customer notes (if column exists)
        internal_notes: wo.internal_notes || '', // ✅ Load internal notes
        labor_summary: wo.labor_summary || null,
        quote_items: quoteItems,
        service_address: serviceAddress, // Load the service address
        // Financial fields - USE CORRECT COLUMN NAMES FROM DATABASE!
        subtotal: wo.subtotal || 0,
        tax_amount: wo.tax_amount || 0, // ✅ CORRECT: tax_amount (not tax_total)
        total_amount: wo.total_amount || 0, // ✅ CORRECT: total_amount (not grand_total)
        discount_amount: wo.discount_amount || 0, // If this column exists
        currency: wo.currency || 'USD',
        payment_terms: wo.payment_terms || '',
        // Preserve pricing model and its relevant fields
        pricing_model: wo.pricing_model || 'TIME_MATERIALS',
        flat_rate_amount: wo.flat_rate_amount || null,
        unit_count: wo.unit_count || null,
        unit_price: wo.unit_price || null,
        percentage: wo.percentage || null,
        // Base amount for percentage model — from column if present, else labor_summary.pricing
        percentage_base_amount: wo.percentage_base_amount ?? (wo.labor_summary?.pricing?.percentage_base_amount ?? null),
        // Recurring fields
        recurring_interval: wo.recurring_interval || null,
        recurring_rate: wo.recurring_rate ?? (wo.labor_summary?.pricing?.recurring_rate ?? null),
        recurring_custom_interval_days: wo.recurring_custom_interval_days ?? (wo.labor_summary?.pricing?.recurring_custom_interval_days ?? null),
        // Milestones
        milestone_base_amount: wo.milestone_base_amount ?? (wo.labor_summary?.pricing?.milestone_base_amount ?? null),
        milestones: Array.isArray(milestones) ? milestones.map(m => ({
          name: m.name || '',
          amount: m.amount,
          percentage: m.percentage,
          sort_order: m.sort_order,
          due_date: m.due_date || null,
          required: m.required ?? true
        })) : []
      });
      setShowEditForm(true);
    } catch (error) {
      console.error('Error loading quote for edit:', error);
      showAlert('error', 'Failed to load quote details');
    }
  };

  // ✅ PHASE 3: MODAL HANDLERS

  // Handler: Send Quote
  const handleSendQuoteConfirm = async (sendData) => {
    if (!quoteToSend) return;

    try {
      // ✅ FIX: Only send status + tracking fields, preserve financial data
      const quoteData = {
        status: 'sent',
        delivery_method: sendData.deliveryMethod,
        custom_message: sendData.customMessage
        // ✅ sent_at will be set by database trigger automatically
      };

      const response = await supaFetch(`work_orders?id=eq.${quoteToSend.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: quoteData
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Quote sent successfully!');
        setShowSendQuoteModal(false);
        setQuoteToSend(null);
        loadQuotes();
      } else {
        throw new Error('Failed to send quote');
      }
    } catch (error) {
      console.error('Error sending quote:', error);
      showAlert('error', 'Failed to send quote');
    }
  };

  // Handler: Presented
  const handlePresentedConfirm = async (presentedData) => {
    if (!quoteToPresent) return;

    try {
      // ✅ FIX: Only send status + tracking fields
      const quoteData = {
        status: 'presented',
        presented_by: presentedData.presentedBy,
        customer_reaction: presentedData.customerReaction,
        presentation_next_steps: presentedData.nextSteps,
        presentation_notes: presentedData.notes
        // ✅ presented_at will be set by database trigger automatically
      };

      const response = await supaFetch(`work_orders?id=eq.${quoteToPresent.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: quoteData
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Presentation recorded successfully!');
        setShowPresentedModal(false);
        setQuoteToPresent(null);
        loadQuotes();
      } else {
        throw new Error('Failed to record presentation');
      }
    } catch (error) {
      console.error('Error recording presentation:', error);
      showAlert('error', 'Failed to record presentation');
    }
  };

  // Handler: Approval
  const handleApprovalConfirm = async (approvalData) => {
    if (!quoteToApprove) return;

    try {
      // ✅ FIX: Only send status + tracking fields
      const quoteData = {
        status: 'approved',
        deposit_amount: approvalData.depositAmount,
        deposit_method: approvalData.depositMethod,
        approval_notes: approvalData.notes
        // ✅ customer_approved_at will be set by database trigger automatically
      };

      const response = await supaFetch(`work_orders?id=eq.${quoteToApprove.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: quoteData
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Quote approved successfully!');
        setShowApprovalModal(false);
        setQuoteToApprove(null);

        // If user wants to schedule now, open Smart Scheduling Assistant
        if (approvalData.scheduleNow) {
          navigate(`/scheduling?quote_id=${quoteToApprove.id}&auto_schedule=true`);
        } else {
          navigate(`/jobs?filter=approved`);
        }
      } else {
        throw new Error('Failed to approve quote');
      }
    } catch (error) {
      console.error('Error approving quote:', error);
      showAlert('error', 'Failed to approve quote');
    }
  };

  // Handler: Approval with Schedule Now
  const handleApprovalScheduleNow = async (approvalData) => {
    // Same as handleApprovalConfirm but forces scheduleNow = true
    await handleApprovalConfirm({ ...approvalData, scheduleNow: true });
  };

  // Handler: Rejection
  const handleRejectionConfirm = async (rejectionData) => {
    if (!quoteToReject) return;

    try {
      // ✅ FIX: Only send status + tracking fields
      const quoteData = {
        status: 'rejected',
        rejection_reason: rejectionData.reason,
        competitor_name: rejectionData.competitorName,
        rejection_notes: rejectionData.notes
        // ✅ rejected_at will be set by database trigger automatically
      };

      const response = await supaFetch(`work_orders?id=eq.${quoteToReject.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: quoteData
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Quote rejection recorded');
        setShowRejectionModal(false);
        setQuoteToReject(null);
        loadQuotes();
      } else {
        throw new Error('Failed to record rejection');
      }
    } catch (error) {
      console.error('Error recording rejection:', error);
      showAlert('error', 'Failed to record rejection');
    }
  };

  // Handler: Changes Requested
  const handleChangesRequestedConfirm = async (changesData) => {
    if (!quoteToChangeRequest) return;

    try {
      // ✅ FIX: Only send status + tracking fields
      const quoteData = {
        status: 'changes_requested',
        change_types: changesData.changeTypes,
        change_details: changesData.changeDetails,
        change_urgency: changesData.urgency,
        follow_up_date: changesData.followUpDate || null
        // ✅ changes_requested_at will be set by database trigger automatically
      };

      const response = await supaFetch(`work_orders?id=eq.${quoteToChangeRequest.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: quoteData
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Changes request recorded');
        setShowChangesRequestedModal(false);
        setQuoteToChangeRequest(null);
        loadQuotes();
      } else {
        throw new Error('Failed to record changes request');
      }
    } catch (error) {
      console.error('Error recording changes request:', error);
      showAlert('error', 'Failed to record changes request');
    }
  };

  // Handler: Follow Up
  const handleFollowUpConfirm = async (followUpData) => {
    if (!quoteToFollowUp) return;

    try {
      // ✅ FIX: Only send status + tracking fields
      const quoteData = {
        status: 'follow_up',
        follow_up_date: followUpData.followUpDate,
        follow_up_time: followUpData.followUpTime,
        follow_up_method: followUpData.followUpMethod,
        follow_up_reminder: followUpData.reminderTime,
        follow_up_reason: followUpData.reason,
        follow_up_notes: followUpData.notes
        // ✅ follow_up_scheduled_at will be set by database trigger automatically
      };

      const response = await supaFetch(`work_orders?id=eq.${quoteToFollowUp.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: quoteData
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Follow-up scheduled successfully!');
        setShowFollowUpModal(false);
        setQuoteToFollowUp(null);
        loadQuotes();
      } else {
        throw new Error('Failed to schedule follow-up');
      }
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      showAlert('error', 'Failed to schedule follow-up');
    }
  };

  // Handler: Expired
  const handleExpiredConfirm = async (expiredData) => {
    if (!quoteToExpire) return;

    try {
      // ✅ FIX: Only send status + tracking fields
      let quoteData = {
        expired_notes: expiredData.notes
      };

      // Handle different actions
      if (expiredData.action === 'renew') {
        quoteData.status = 'sent'; // Renew back to sent
        quoteData.expiration_date = expiredData.newExpirationDate;
        // ✅ renewed_at will be set by database trigger automatically
      } else if (expiredData.action === 'follow_up') {
        quoteData.status = 'follow_up';
        // ✅ follow_up_scheduled_at will be set by database trigger automatically
      } else if (expiredData.action === 'archive') {
        quoteData.status = 'expired';
        // ✅ expired_at will be set by database trigger automatically
      }

      const response = await supaFetch(`work_orders?id=eq.${quoteToExpire.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: quoteData
      }, user.company_id);

      if (response.ok) {
        const actionMsg = expiredData.action === 'renew' ? 'renewed' :
                         expiredData.action === 'follow_up' ? 'moved to follow-up' : 'archived';
        showAlert('success', `Quote ${actionMsg} successfully!`);
        setShowExpiredModal(false);
        setQuoteToExpire(null);
        loadQuotes();
      } else {
        throw new Error('Failed to handle expired quote');
      }
    } catch (error) {
      console.error('Error handling expired quote:', error);
      showAlert('error', 'Failed to handle expired quote');
    }
  };

  // Filter quotes based on search and status
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    quotes: filteredQuotes,
    customers,
    loading,
    showCreateForm,
    showEditForm,
    selectedQuote,
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
  };
};

export default QuotesDatabasePanel;
