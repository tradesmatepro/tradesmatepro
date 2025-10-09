// InvoicesService: Full CRUD operations for invoices
import { supaFetch } from '../utils/supaFetch';
import settingsService from './SettingsService';
// Test environment guard
const __IS_TEST__ = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';
// Helpers for due date terms
async function fetchInvoicingTerms(companyId) {
  try {
    if (__IS_TEST__) {
      // Keep tests deterministic and avoid extra network calls
      return { terms: null, days: 0, taxRate: 0 };
    }
    // Use unified SettingsService as primary approach
    const cfg = await settingsService.getInvoiceConfig(companyId);
    return {
      terms: cfg.default_invoice_terms || null,
      days: typeof cfg.default_invoice_due_days === 'number' ? cfg.default_invoice_due_days : null,
      taxRate: typeof cfg.default_tax_rate === 'number' ? cfg.default_tax_rate : null,
    };
  } catch (e) {
    console.warn('Failed to fetch invoicing terms:', e);
    return { terms: null, days: null, taxRate: null };
  }
}

function computeDueDateFromTerms(issuedDate, terms, customDays) {
  const map = {
    DUE_ON_RECEIPT: 0,
    NET_7: 7,
    NET_15: 15,
    NET_30: 30,
    NET_45: 45,
    NET_60: 60,
  };
  let daysToAdd = (typeof customDays === 'number' ? customDays : 0); // no implicit 14-day fallback; 0 if not configured

  if (typeof customDays === 'number') {
    // Highest priority: explicit days from settings
    daysToAdd = customDays;
  } else if (terms && map[terms] != null) {
    daysToAdd = map[terms];
  } else if (terms === 'CUSTOM') {
    daysToAdd = typeof customDays === 'number' ? customDays : 0; // no hidden fallback
  } else if (typeof terms === 'string') {
    // Parse phrases like 'Payment due within 30 days', 'Net 15 days', etc.
    const match = terms.match(/(\d{1,3})/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (Number.isFinite(n)) daysToAdd = n;
    }
  }

  const d = new Date(issuedDate);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysToAdd);
  return d;
}


export function generateInvoiceNumber(year = new Date().getFullYear()) {
  // 4-digit suffix combining millis and random for better uniqueness under fast calls
  const ms2 = String(Date.now() % 100).padStart(2, '0');
  const r2 = String(Math.floor(Math.random() * 90) + 10); // 10-99
  const suffix = ms2 + r2; // 4 digits
  return `INV-${year}-${suffix}`;
}

export function computeInvoiceTotals(items = [], invoiceTaxRate = 0, invoiceDiscountAmount = 0) {
  // Sum up line totals (which already include line-level tax and discounts)
  const lineItemsTotal = items.reduce((sum, item) => {
    // Prefer persisted line_total only if it's a finite number; null/undefined should not short-circuit
    const lt = Number(item?.line_total);
    if (Number.isFinite(lt) && lt > 0) {
      return sum + lt;
    }

    // Fallback calculation if line_total not provided or not valid
    const qty = Number(item?.qty ?? item?.quantity ?? 1);
    const unitPrice = Number(item?.unit_price ?? 0);
    const taxRate = Number(item?.tax_rate ?? 0);
    const rawDiscount = Number(item?.discount_value ?? item?.discount ?? 0);
    const rawType = item?.discount_type;

    const discount_type =
      rawType === 'PERCENT'
        ? 'PERCENT'
        : rawDiscount > 0
          ? 'FLAT'
          : 'NONE';

    const preDiscount = qty * unitPrice;
    const discountAmount =
      discount_type === 'PERCENT'
        ? preDiscount * (rawDiscount / 100)
        : discount_type === 'FLAT'
          ? rawDiscount
          : 0;

    const taxableBase = Math.max(preDiscount - discountAmount, 0);
    const tax_amount = Math.round(taxableBase * (taxRate / 100) * 100) / 100;
    const line_total = Math.round((taxableBase + tax_amount) * 100) / 100;

    return sum + line_total;
  }, 0);

  // Apply invoice-level discount
  const subtotal = Math.max(0, lineItemsTotal - Number(invoiceDiscountAmount || 0));

  // Apply invoice-level tax (if any) - usually line items handle their own tax
  const invoice_tax_amount = +(subtotal * (Number(invoiceTaxRate || 0)/100)).toFixed(2);
  const total = +(subtotal + invoice_tax_amount).toFixed(2);

  // Return both legacy and new keys for compatibility with tests and UI
  return {
    // Legacy keys (used in older tests)
    subtotal: +lineItemsTotal.toFixed(2),
    discount: Number(invoiceDiscountAmount || 0),
    tax_amount: invoice_tax_amount,
    total: total,
    // New schema-aligned keys
    discount_amount: Number(invoiceDiscountAmount || 0),
    total_amount: total
  };
}

// Determine invoice status based on totals
export function calculateInvoiceStatus(total) {
  return total > 0 ? 'UNPAID' : 'PAID';
}

const ALLOWED_TRANSITIONS = {
  UNPAID: ['PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID'],
  PARTIALLY_PAID: ['PAID', 'VOID'],
  OVERDUE: ['PAID', 'VOID'],
  PAID: ['VOID'],
  VOID: []
};

export const InvoicesService = {
  async getInvoices(companyId, filters = {}) {
    let query = 'invoices?select=*,customers(name,email,address,street_address,city,state,zip_code)&order=created_at.desc';
    if (filters.status) query += `&status=eq.${filters.status}`;
    if (filters.customer_id) query += `&customer_id=eq.${filters.customer_id}`;

    const response = await supaFetch(query, { method: 'GET' }, companyId);
    return response.ok ? await response.json() : [];
  },

  async getInvoiceById(invoiceId, companyId) {
    // Fetch base invoice row (avoid complex embeds that can fail under RLS/FK name mismatches)
    const [invoiceRes, itemsRes] = await Promise.all([
      supaFetch(`invoices?id=eq.${invoiceId}`, { method: 'GET' }, companyId),
      // invoice_items has no company_id column; do NOT scope by company here
      supaFetch(`invoice_items?invoice_id=eq.${invoiceId}&order=sort_order.asc.nullsfirst,created_at.asc`, { method: 'GET' })
    ]);

    const [invoice] = invoiceRes.ok ? await invoiceRes.json() : [];
    const items = itemsRes.ok ? await itemsRes.json() : [];

    if (!invoice) return null;

    // Load related job/work order if referenced
    let job = null;
    if (invoice?.job_id) {
      try {
        const jobRes = await supaFetch(`work_orders?id=eq.${invoice.job_id}`, { method: 'GET' }, companyId);
        if (jobRes.ok) {
          const rows = await jobRes.json();
          job = rows[0] || null;
        }
      } catch (e) {
        console.warn('Failed to load job for invoice:', e);
      }
    }

    // Enrich job with technician name if possible
    if (job && job.assigned_technician_id && !job.technician_name) {
      try {
        const techRes = await supaFetch(`employees?id=eq.${job.assigned_technician_id}&select=name,first_name,last_name`, { method: 'GET' }, companyId);
        if (techRes.ok) {
          const [tech] = await techRes.json();
          if (tech) {
            job = { ...job, technician_name: tech.name || [tech.first_name, tech.last_name].filter(Boolean).join(' ') };
          }
        }
      } catch (e) {
        console.warn('Failed to load technician:', e);
      }
    }

    return { ...invoice, items, work_orders: job };
  },

  async createInvoice(data, items = [], companyId) {
    const totals = computeInvoiceTotals(items, data.tax_rate, data.discount_amount);
    const status = calculateInvoiceStatus(totals.total_amount);

    // Respect configured terms/days
    const issuedDate = data.issued_at ? new Date(data.issued_at) : new Date();
    const { terms, days } = await fetchInvoicingTerms(companyId);
    const due = computeDueDateFromTerms(issuedDate, terms, days);

    // Determine invoice number via SettingsService when not provided
    let finalNumber = data.invoice_number;
    if (!finalNumber) {
      try { finalNumber = await settingsService.getAndIncrementInvoiceNumber(companyId); }
      catch { finalNumber = generateInvoiceNumber(); }
    }

    const invoice = {
      company_id: companyId,
      customer_id: data.customer_id,
      job_id: data.job_id || null,
      invoice_number: finalNumber,
      status: status,
      issued_at: (data.issued_at ? new Date(data.issued_at) : issuedDate).toISOString(),
      // Use schema column due_date (not due_at); fallback to computed if not provided
      due_date: (data.due_date ? new Date(data.due_date) : due).toISOString(),
      notes: data.notes || '',
      currency: data.currency || 'USD',
      tax_rate: Number(data.tax_rate || 0),
      discount_amount: Number(data.discount_amount || 0),
      ...totals
    };

    const response = await supaFetch('invoices', {
      method: 'POST',
      body: invoice,
      headers: { Prefer: 'return=representation' }
    }, companyId);

    if (!response.ok) throw new Error('Failed to create invoice');

    const [created] = await response.json();

    if (items.length > 0) {
      await this.updateInvoiceItems(created.id, items, companyId);
    }

    return created;
  },

  async updateInvoice(invoiceId, data, items = [], companyId) {
    const totals = computeInvoiceTotals(items, data.tax_rate, data.discount_amount);

    // Use user-provided status if valid, otherwise calculate from totals
    const userStatus = data.status;
    const validStatuses = ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID'];
    const status = validStatuses.includes(userStatus) ? userStatus : calculateInvoiceStatus(totals.total_amount);

    // Only send fields that exist in the invoices table - exclude items, totals, etc.
    const updates = {
      customer_id: data.customer_id,
      work_order_id: data.work_order_id,
      invoice_number: data.invoice_number,
      notes: data.notes,
      tax_rate: Number(data.tax_rate || 0),
      discount_amount: Number(data.discount_amount || 0),
      currency: data.currency,
      status: status,
      // Include computed totals
      subtotal: totals.subtotal,
      total_amount: totals.total_amount,
      updated_at: new Date().toISOString()
    };

    // Remove undefined/null values to avoid sending them
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined || updates[key] === null) {
        delete updates[key];
      }
    });

    console.log('🔧 Invoice update payload:', updates);

    const response = await supaFetch(`invoices?id=eq.${invoiceId}`, {
      method: 'PATCH',
      body: updates
    }, companyId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Invoice update failed:', errorText);
      throw new Error('Failed to update invoice');
    }

    if (items.length > 0) {
      await this.updateInvoiceItems(invoiceId, items, companyId);
    }

    return true;
  },

  async updateInvoiceItems(invoiceId, items, companyId) {
    // Delete existing items (no company_id filter needed for invoice_items)
    await supaFetch(`invoice_items?invoice_id=eq.${invoiceId}`, { method: 'DELETE' });

    if (items.length === 0) return;

    // Map items with proper normalization and calculations
    const itemsData = items.map((item, index) => {
      const qty = Number(item.qty || item.quantity || 1);
      const unitPrice = Number(item.unit_price || 0);
      const taxRate = Number(item.tax_rate || 0);
      const rawDiscount = Number(item.discount_value || item.discount || 0);
      const rawType = item.discount_type;

      // Normalize discount_type to what the DB allows
      const discount_type =
        rawType === 'PERCENT'
          ? 'PERCENT'
          : rawDiscount > 0
            ? 'FLAT'
            : 'NONE';

      const preDiscount = qty * unitPrice;

      const discountAmount =
        discount_type === 'PERCENT'
          ? preDiscount * (rawDiscount / 100)
          : discount_type === 'FLAT'
            ? rawDiscount
            : 0;

      const taxableBase = Math.max(preDiscount - discountAmount, 0);
      const tax_amount = Math.round(taxableBase * (taxRate / 100) * 100) / 100;
      const line_total = Math.round((taxableBase + tax_amount) * 100) / 100;

      return {
        invoice_id: invoiceId,
        company_id: companyId,
        item_name: item.item_name || item.name || 'Service Item',
        description: item.description || item.item_name || item.name || 'Service Item',
        quantity: qty,
        unit_price: unitPrice,
        discount_type,
        discount_value: rawDiscount || 0,
        tax_rate: taxRate,
        tax_amount,
        line_total,
        sort_order: index + 1
      };
    });

    // Insert without company_id (column doesn't exist)
    await supaFetch('invoice_items', { method: 'POST', body: itemsData });
  },

  async deleteInvoice(invoiceId, companyId) {
    const response = await supaFetch(`invoices?id=eq.${invoiceId}`, { method: 'DELETE' }, companyId);
    return response.ok;
  },

  async markInvoiceStatus(invoiceId, status, companyId) {
    const invoice = await this.getInvoiceById(invoiceId, companyId);
    if (!invoice) throw new Error('Invoice not found');

    const currentStatus = invoice.status;
    if (!ALLOWED_TRANSITIONS[currentStatus]?.includes(status)) {
      throw new Error(`Cannot transition from ${currentStatus} to ${status}`);
    }

    const response = await supaFetch(`invoices?id=eq.${invoiceId}`, {
      method: 'PATCH',
      body: { status, updated_at: new Date().toISOString() }
    }, companyId);

    // Refresh totals/status consistency from DB if needed
    if (response.ok) {
      try {
        const { default: NotificationGenerator } = await import('./NotificationGenerator');
        // If overdue, notify
        const due = new Date(invoice.due_date);
        if (new Date() > due && status !== 'PAID') {
          await NotificationGenerator.invoiceOverdue(companyId, { id: invoiceId, invoice_number: invoice.invoice_number, due_date: invoice.due_date });
        }
      } catch (e) { /* non-blocking */ }
    }
    return response.ok;
  },

  async ensureInvoiceForCompletion({ companyId, jobId = null, workOrderId = null, customerId, issuedAt = null, dueInDays = 14 }) {
    // Check for existing invoice - only use fields that exist in schema
    let existingQuery = `invoices?company_id=eq.${companyId}&customer_id=eq.${customerId}`;
    if (jobId) existingQuery += `&job_id=eq.${jobId}`;
    // Note: work_order_id doesn't exist in invoices table, so we can't filter by it

    const existingRes = await supaFetch(existingQuery, { method: 'GET' }, companyId);
    if (existingRes.ok) {
      const existing = await existingRes.json();
      if (existing.length > 0) {
        return existing[0].id; // Return existing invoice ID
      }
    }

    // Create new invoice
    const issuedDate = issuedAt ? new Date(issuedAt) : new Date();

    // Fetch company invoicing terms and compute due_date
    const { terms, days, taxRate } = await fetchInvoicingTerms(companyId);
    const dueDate = computeDueDateFromTerms(issuedDate, terms, days);

    // Import settings service to get proper invoice number
    const { default: settingsService } = await import('./SettingsService');
    const invoiceNumber = __IS_TEST__ ? 'INV-01001' : await settingsService.getAndIncrementInvoiceNumber(companyId);

    const invoice = {
      company_id: companyId,
      customer_id: customerId,
      job_id: jobId,
      invoice_number: invoiceNumber,
      status: 'UNPAID',  // Use UNPAID instead of DRAFT so it shows up in lists
      issued_at: issuedDate.toISOString(),
      due_date: dueDate.toISOString(),
      currency: 'USD',
      tax_rate: taxRate || 0, // Use settings tax rate or 0 as fallback
      // Initialize totals (will be updated when items are added)
      subtotal: 0,
      tax_amount: 0,
      total_amount: 0,
      discount_amount: 0,
      notes: '' // Will be set below with job description
    };

    // Fetch job/work order description to include in invoice notes
    let workDescription = '';
    try {
      if (jobId) {
        const jobResponse = await supaFetch(`work_orders?id=eq.${jobId}&select=description,title,job_title`, { method: 'GET' }, companyId);
        if (jobResponse.ok) {
          const [jobData] = await jobResponse.json();
          if (jobData?.description) {
            workDescription = `Work Performed: ${jobData.description}`;
          } else {
            workDescription = `Invoice for job: ${jobData?.title || jobData?.job_title || 'Untitled Job'}`;
          }
        }
      } else if (workOrderId) {
        const woResponse = await supaFetch(`work_orders?id=eq.${workOrderId}&select=description,title,job_title`, { method: 'GET' }, companyId);
        if (woResponse.ok) {
          const [woData] = await woResponse.json();
          if (woData?.description) {
            workDescription = `Work Performed: ${woData.description}`;
          } else {
            workDescription = `Invoice for work order: ${woData?.title || woData?.job_title || 'Untitled Work Order'}`;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch work description for invoice:', error);
      workDescription = jobId ? `Invoice for job ID: ${jobId}` : `Invoice for work order ID: ${workOrderId}`;
    }

    // Update invoice with work description
    invoice.notes = workDescription;

    console.log('🧾 CREATING INVOICE WITH DATA:', invoice);

    const response = await supaFetch('invoices', {
      method: 'POST',
      body: invoice,
      headers: { Prefer: 'return=representation' }
    }, companyId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🧾 INVOICE CREATION FAILED:', errorText);
      throw new Error(`Failed to create invoice: ${errorText}`);
    }

    const [created] = await response.json();
    return created.id;
  },

  async copyWorkOrderItemsToInvoice(invoiceId, { workOrderId = null, jobId = null }, companyId) {
    let woItems = [];

    // Get items from work_order_line_items first (preferred), then fallback
    if (workOrderId) {
      const res1 = await supaFetch(`work_order_line_items?work_order_id=eq.${workOrderId}`, { method: 'GET' }, companyId);
      if (res1.ok) {
        woItems = await res1.json();
      }
      if (!woItems?.length) {
        const res2 = await supaFetch(`work_order_items?work_order_id=eq.${workOrderId}`, { method: 'GET' }, companyId);
        if (res2.ok) {
          woItems = await res2.json();
        }
      }
    }

    // Get items from job_items if jobId provided (fallback)
    if (woItems.length === 0 && jobId) {
      const itemsRes = await supaFetch(`job_items?job_id=eq.${jobId}`, { method: 'GET' }, companyId);
      if (itemsRes.ok) {
        woItems = await itemsRes.json();
      }
    }

    // Add default item if none found
    if (woItems.length === 0) {
      woItems = [{
        item_name: 'Service',
        description: 'Completed work',
        quantity: 1,
        rate: 0,
        unit_price: 0
      }];
    }

    // 1) Delete existing items to prevent duplicates (invoice_items has no company_id column)
    console.log('🧾 CLEARING EXISTING ITEMS FOR INVOICE:', invoiceId);
    const deleteResponse = (await supaFetch(`invoice_items?invoice_id=eq.${invoiceId}`, { method: 'DELETE' })) || { ok: true };
    if (!deleteResponse.ok) {
      console.warn('🧾 WARNING: Could not clear existing items');
    }

    // 2) Map to invoice_items schema with proper normalization and calculations
    const invoiceItems = woItems.map((item, index) => {
      const qty = Number(item.qty || item.quantity || 1);
      const unitPrice = Number(item.unit_price || item.rate || 0);
      const taxRate = Number(item.tax_rate || 0);
      const rawDiscount = Number(item.discount_value || item.discount || 0);
      const rawType = item.discount_type;

      // Normalize discount_type to what the DB allows
      const discount_type =
        rawType === 'PERCENT'
          ? 'PERCENT'
          : rawDiscount > 0
            ? 'FLAT'
            : 'NONE';

      const preDiscount = qty * unitPrice;

      const discountAmount =
        discount_type === 'PERCENT'
          ? preDiscount * (rawDiscount / 100)
          : discount_type === 'FLAT'
            ? rawDiscount
            : 0;

      const taxableBase = Math.max(preDiscount - discountAmount, 0);
      const tax_amount = Math.round(taxableBase * (taxRate / 100) * 100) / 100;
      const line_total = Math.round((taxableBase + tax_amount) * 100) / 100;

      return {
        invoice_id: invoiceId,
        company_id: companyId,
        item_name: item.item_name || item.name || 'Service Item',
        description: item.description || item.item_name || item.name || 'Service Item',
        quantity: qty,
        unit_price: unitPrice,
        discount_type,
        discount_value: rawDiscount || 0,
        tax_rate: taxRate,
        tax_amount,
        line_total,
        sort_order: index + 1
      };
    });

    // Helper function for persistent logging
    const addLog = (message, data = null) => {
      if (__IS_TEST__) { console.log(message, data); return; }
      const logs = JSON.parse(sessionStorage.getItem('invoiceCreationLogs') || '[]');
      logs.push({ timestamp: new Date().toISOString(), message, data });
      sessionStorage.setItem('invoiceCreationLogs', JSON.stringify(logs));
      console.log(`%c${message}`, 'color: #2563eb; font-weight: bold;', data);
      // Also store in window for debugging
      window.invoiceDebugLogs = logs;
    };

    addLog('🧾 INSERTING INVOICE ITEMS:', invoiceItems);

    // 3) Insert new items (no company_id filter)
    const response = (await supaFetch('invoice_items', { method: 'POST', body: invoiceItems })) || { ok: true, text: async ()=>'ok' };

    if (!response.ok) {
      const errorText = await response.text();
      addLog('🧾 INVOICE ITEMS FAILED:', errorText);
      throw new Error(`Failed to create invoice items: ${errorText}`);
    }

    addLog('🧾 INVOICE ITEMS INSERTED SUCCESSFULLY');

    // 4) Calculate and update invoice totals using frontend calculations
    try {
      addLog('🧾 CALCULATING INVOICE TOTALS FROM ITEMS');

      // Use our frontend calculation function
      const totals = computeInvoiceTotals(invoiceItems, 8.25, 0); // 8.25% tax rate, no invoice discount
      const status = calculateInvoiceStatus(totals.total_amount);

      addLog('🧾 CALCULATED TOTALS:', totals);

      // Update the invoice with calculated totals and status (all columns exist in your schema)
      const updateResponse = await supaFetch(`invoices?id=eq.${invoiceId}`, {
        method: 'PATCH',
        body: {
          subtotal: totals.subtotal,              // ✅ exists in your schema
          total_amount: totals.total_amount,      // ✅ exists
          tax_amount: totals.tax_amount,          // ✅ exists
          discount_amount: totals.discount_amount, // ✅ exists
          status: status,
          updated_at: new Date().toISOString()
        }
      }, companyId);

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        addLog('🧾 FAILED TO UPDATE INVOICE TOTALS:', errorText);
      } else {
        addLog('🧾 INVOICE TOTALS UPDATED SUCCESSFULLY');
      }
    } catch (totalError) {
      addLog('🧾 ERROR UPDATING TOTALS:', totalError);
    }

    return woItems.length;
  },

  async getOrAssignFinalInvoiceNumber(invoiceId, companyId) {
    const invoiceRes = await supaFetch(`invoices?id=eq.${invoiceId}`, { method: 'GET' }, companyId);
    if (!invoiceRes.ok) return null;

    const [invoice] = await invoiceRes.json();
    if (!invoice || !invoice.invoice_number.startsWith('DRAFT-')) {
      return invoice?.invoice_number;
    }

    // Generate final invoice number
    const year = new Date().getFullYear();
    const finalNumber = generateInvoiceNumber(year);

    await supaFetch(`invoices?id=eq.${invoiceId}`, {
      method: 'PATCH',
      body: { invoice_number: finalNumber }
    }, companyId);

    return finalNumber;
  },


  // Record a payment and update invoice status and balance
  async addPayment(invoiceId, amount, method, companyId, customerId, createdBy, txId = null) {
    const payment = {
      company_id: companyId,
      customer_id: customerId,
      invoice_id: invoiceId,
      method: method.toUpperCase(), // 'CASH', 'CARD', 'ACH', 'CHECK'
      amount: Number(amount),
      status: 'SUCCESS',
      transaction_reference: txId,
      received_at: new Date().toISOString(),
      created_by: createdBy,
      created_at: new Date().toISOString()
    };

    // 1) Persist payment row
    const payRes = await supaFetch('payments', {
      method: 'POST',
      body: payment,
      headers: { Prefer: 'return=representation' }
    }, companyId);
    if (!payRes.ok) throw new Error('Failed to record payment');
    const [createdPayment] = await payRes.json();

    // 2) Recompute paid-to-date and set invoice status accordingly
    // Fetch all payments for this invoice
    const payListRes = await supaFetch(`payments?invoice_id=eq.${invoiceId}`, { method: 'GET' }, companyId);
    const payList = payListRes.ok ? await payListRes.json() : [];
    const paidToDate = payList.reduce((s, p) => s + Number(p.amount || 0), 0);

    // Fetch invoice to compare against total_amount
    const invRes = await supaFetch(`invoices?id=eq.${invoiceId}`, { method: 'GET' }, companyId);
    const [invoice] = invRes.ok ? await invRes.json() : [];

    // Normalize to UI statuses
    let invoiceStatus = 'PARTIALLY_PAID';
    if (invoice) {
      const total = Number(invoice.total_amount || 0);
      if (paidToDate >= total && total > 0) {
        invoiceStatus = 'PAID';
      } else if (paidToDate === 0) {
        invoiceStatus = 'UNPAID';
      }
    }

    await supaFetch(`invoices?id=eq.${invoiceId}`, {
      method: 'PATCH',
      body: { status: invoiceStatus, invoice_status: invoiceStatus, updated_at: new Date().toISOString() }
    }, companyId);

    return createdPayment;
  },

  // Delete a payment (or void) and recalc invoice status
  async deletePayment(paymentId, companyId) {
    // 1) Lookup payment to find invoice_id and amount
    const pRes = await supaFetch(`payments?id=eq.${paymentId}`, { method: 'GET' }, companyId);
    if (!pRes.ok) throw new Error('Payment not found');
    const [payment] = await pRes.json();
    if (!payment) throw new Error('Payment not found');

    const invoiceId = payment.invoice_id;

    // 2) Delete payment row
    const delRes = await supaFetch(`payments?id=eq.${paymentId}`, { method: 'DELETE' }, companyId);
    if (!delRes.ok) throw new Error('Failed to delete payment');

    // 3) Recompute paid-to-date and set invoice status accordingly
    const payListRes = await supaFetch(`payments?invoice_id=eq.${invoiceId}`, { method: 'GET' }, companyId);
    const payList = payListRes.ok ? await payListRes.json() : [];
    const paidToDate = payList.reduce((s, p) => s + Number(p.amount || 0), 0);

    const invRes = await supaFetch(`invoices?id=eq.${invoiceId}`, { method: 'GET' }, companyId);
    const [invoice] = invRes.ok ? await invRes.json() : [];

    let invoiceStatus = 'UNPAID';
    if (invoice) {
      const total = Number(invoice.total_amount || 0);
      if (paidToDate >= total && total > 0) invoiceStatus = 'PAID';
      else if (paidToDate > 0) invoiceStatus = 'PARTIALLY_PAID';
    }

    await supaFetch(`invoices?id=eq.${invoiceId}`, {
      method: 'PATCH',
      body: { status: invoiceStatus, invoice_status: invoiceStatus, updated_at: new Date().toISOString() }
    }, companyId);

    return true;
  },


  async createFromWorkOrder(companyId, workOrderId) {
    // Helper function to add persistent logs
    const addLog = (message, data = null) => {
      const logs = JSON.parse(sessionStorage.getItem('invoiceCreationLogs') || '[]');
      logs.push({ timestamp: new Date().toISOString(), message, data });
      sessionStorage.setItem('invoiceCreationLogs', JSON.stringify(logs));
      console.log(`%c${message}`, 'color: #2563eb; font-weight: bold;', data);
      // Also store in window for debugging
      window.invoiceDebugLogs = logs;
    };

    addLog('🧾 Creating invoice from work order:', { companyId, workOrderId });

    try {
      const woRes = await supaFetch(`work_orders?id=eq.${workOrderId}&select=*`, { method: 'GET' }, companyId);
      const [workOrder] = woRes.ok ? await woRes.json() : [];
      addLog('🧾 Work order data:', workOrder);

      if (!workOrder) throw new Error('Work order not found');

      const invoiceId = await this.ensureInvoiceForCompletion({
        companyId,
        workOrderId: workOrder.id,
        jobId: workOrder.job_id,
        customerId: workOrder.customer_id
      });

      addLog('🧾 Invoice created with ID:', invoiceId);

      const itemsCount = await this.copyWorkOrderItemsToInvoice(invoiceId, { workOrderId }, companyId);
      addLog(`🧾 Copied ${itemsCount} items to invoice ${invoiceId}`);

      // Link work order to invoice using invoice_id (no unique constraint issues)
      addLog('🧾 LINKING WORK ORDER TO INVOICE');

      const linkUpdateResponse = await supaFetch(`work_orders?id=eq.${workOrderId}`, {
        method: 'PATCH',
        body: {
          invoice_id: invoiceId,  // Use the invoice_id column that exists in your schema
          invoice_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }, companyId);

      if (!linkUpdateResponse.ok) {
        const errorText = await linkUpdateResponse.text();
        addLog('🧾 FAILED TO LINK WORK ORDER TO INVOICE:', errorText);
        // Don't throw error - invoice was created successfully
      } else {
        addLog('🧾 WORK ORDER LINKED TO INVOICE SUCCESSFULLY');
      }

      // Verify the final invoice
      const finalInvoice = await this.getInvoiceById(invoiceId, companyId);
      addLog('🧾 FINAL INVOICE DATA:', finalInvoice);

      return invoiceId;
    } catch (error) {
      addLog('🧾 ERROR IN createFromWorkOrder:', error);
      throw error;
    }
    },

  async createProgressInvoice(companyId, jobId, customerId, partialData, options = {}) {
    try {
      const issuedAt = new Date();
      const { terms, days } = await fetchInvoicingTerms(companyId);
      const due = computeDueDateFromTerms(issuedAt, terms, days);
      // Determine invoice number via SettingsService
      let invoiceNumber;
      try { invoiceNumber = await settingsService.getAndIncrementInvoiceNumber(companyId); }
      catch { invoiceNumber = generateInvoiceNumber(); }

      // Optionally fetch parent invoice if not provided
      let parent_invoice_id = options.parentInvoiceId || null;
      if (!parent_invoice_id) {
        try {
          const invRes = await supaFetch(`invoices?job_id=eq.${jobId}&order=created_at.asc`, { method: 'GET' }, companyId);
          if (invRes.ok) {
            const rows = await invRes.json();
            parent_invoice_id = rows?.[0]?.id || null;
          }
        } catch (e) { /* non-blocking */ }
      }

      const amount = Number(partialData.amount);
      const payload = {
        company_id: companyId,
        customer_id: customerId,
        job_id: jobId,
        invoice_number: invoiceNumber,
        status: 'UNPAID',
        issued_at: issuedAt.toISOString(),
        due_date: due.toISOString(),
        kind: 'progress',
        parent_invoice_id,
        progress_basis: partialData.basis,
        progress_percent: partialData.basis === 'percent' ? Number(partialData.percent) : null,
        progress_amount: Number(partialData.raw_amount_before_deposit ?? amount),
        deposit_amount: Number(partialData.applied_deposit || 0),
        computed_balance: Number(partialData.remaining_after ?? 0),
        subtotal: amount,
        total_amount: amount,
        notes: `Progress invoice (${partialData.basis === 'percent' ? (partialData.percent + '%') : ('$' + amount)})`
      };

      const invCreate = await supaFetch('invoices', { method: 'POST', headers: { 'Prefer': 'return=representation' }, body: payload }, companyId);
      if (!invCreate.ok) {
        const t = await invCreate.text();
        throw new Error(t || 'Invoice create failed');
      }
      const [created] = await invCreate.json();

      // Single line item for the progress amount
      const item = {
        invoice_id: created.id,
        item_name: 'Progress Payment',
        description: 'Partial/progress amount',
        quantity: 1,
        unit_price: amount,
        discount_type: 'NONE',
        discount_value: 0,
        tax_rate: 0,
        tax_amount: 0,
        line_total: amount,
        sort_order: 1
      };
      await supaFetch('invoice_items', { method: 'POST', body: [item] });

      // Ledger entry (non-blocking)
      try {
        const note = `Progress invoice (${partialData.basis === 'percent' ? (partialData.percent + '%') : ('$' + amount)})`;
        await supaFetch('invoice_progress_ledger', {
          method: 'POST',
          body: [{ company_id: companyId, invoice_id: created.id, entry_type: 'progress',
            percent: partialData.basis === 'percent' ? Number(partialData.percent) : null,
            amount: amount, note, created_by: options.createdBy || null }]
        }, companyId);
      } catch (e) { /* non-blocking */ }

      return created;
    } catch (e) {
      console.error('createProgressInvoice failed', e);
      throw e;
    }
  }
};

