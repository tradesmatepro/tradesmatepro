import { supaFetch } from '../utils/supaFetch';
import { EmailService } from './EmailService';

export const PO_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  APPROVED: 'APPROVED',
  PARTIAL: 'PARTIAL',
  RECEIVED: 'RECEIVED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED'
};

function generatePoNumber() {
  const now = new Date();
  return `PO-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getTime()).slice(-4)}`;
}

export const PurchaseOrdersService = {
  async list(companyId, params = '') {
    const res = await supaFetch(`purchase_orders?select=*&order=created_at.desc${params ? `&${params}` : ''}`, { method: 'GET' }, companyId);
    return res.ok ? await res.json() : [];
  },

  async getWithItems(companyId, id) {
    const [poRes, itemsRes] = await Promise.all([
      supaFetch(`purchase_orders?id=eq.${id}&select=*`, { method: 'GET' }, companyId),
      supaFetch(`po_items?purchase_order_id=eq.${id}&select=*`, { method: 'GET' }, companyId)
    ]);
    const po = poRes.ok ? (await poRes.json())[0] : null;
    const items = itemsRes.ok ? await itemsRes.json() : [];
    return { po, items };
  },

  async create(companyId, data, items = []) {
    // Ensure required fields are present and properly formatted
    const poDataBase = {
      po_number: generatePoNumber(),
      status: PO_STATUS.DRAFT,
      company_id: companyId,
      // Ensure numeric fields are properly formatted
      subtotal: Number(data.subtotal || 0),
      tax_rate: Number(data.tax_rate || 0),
      tax_amount: Number(data.tax_amount || 0),
      shipping_amount: Number(data.shipping_amount || 0),
      total_amount: Number(data.total_amount || 0),
      // Ensure date fields are properly formatted
      expected_date: data.expected_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Only include known/safe fields from the incoming data to avoid schema 400s
    const allowedKeys = [
      'vendor_id','vendor_name','vendor_contact','vendor_email','vendor_phone',
      'ship_to_name','ship_to_address_line_1','ship_to_address_line_2','ship_to_city','ship_to_state','ship_to_zip_code',
      'currency','notes','terms','related_work_order_id','location_type','budget_amount'
    ];
    const passthrough = {};
    for (const k of allowedKeys) if (data[k] !== undefined) passthrough[k] = data[k];

    const poData = { ...poDataBase, ...passthrough };

    console.log('Creating PO with data:', poData);

    const poRes = await supaFetch('purchase_orders', { method: 'POST', body: poData }, companyId);
    if (!poRes.ok) {
      const errorText = await poRes.text();
      console.error('PO creation failed:', errorText);
      throw new Error(`Failed to create purchase order: ${errorText}`);
    }

    // With Prefer: return=representation, we can parse JSON safely
    const createdArray = await poRes.json();
    const created = Array.isArray(createdArray) ? createdArray[0] : createdArray;

    if (items && items.length) {
      await this.replaceItems(companyId, created.id, items);
    }
    return created;
  },

  async update(companyId, id, patch) {
    const res = await supaFetch(`purchase_orders?id=eq.${id}`, { method: 'PATCH', body: patch }, companyId);
    if (!res.ok) throw new Error('Failed to update purchase order');
    return (await res.json())[0];
  },

  async setStatus(companyId, id, newStatus, note = '') {
    // Update status
    const updated = await this.update(companyId, id, { status: newStatus, updated_at: new Date().toISOString() });
    // Insert status history (best-effort)
    try {
      await supaFetch('po_status_history', { method: 'POST', body: { company_id: companyId, purchase_order_id: id, new_status: newStatus, note } }, companyId);
    } catch {}
    return updated;
  },

  async replaceItems(companyId, purchaseOrderId, items) {
    // Delete existing
    await supaFetch(`po_items?purchase_order_id=eq.${purchaseOrderId}`, { method: 'DELETE' }, companyId);
    // Insert new
    const payload = items.map((it) => ({
      company_id: companyId,
      purchase_order_id: purchaseOrderId,
      item_sku: it.item_sku || it.sku || null,
      item_name: it.item_name || it.name || '',
      description: it.description || '',
      quantity: Number(it.quantity || 1),
      unit_cost: Number(it.unit_cost || it.cost || 0),
      tax_rate: it.tax_rate != null ? Number(it.tax_rate) : null,
      line_total: Number((it.quantity || 1) * (it.unit_cost || it.cost || 0)),
      supplier_part_number: it.supplier_part_number || null,
      inventory_item_id: it.inventory_item_id || null
    }));
    const res = await supaFetch('po_items', { method: 'POST', body: payload }, companyId);
    if (!res.ok) throw new Error('Failed to save items');
    return await res.json();
  },

  computeTotals(items = [], taxRate = 0, shipping = 0) {
    const subtotal = items.reduce((sum, it) => sum + Number(it.quantity || 0) * Number(it.unit_cost || 0), 0);
    const tax_amount = subtotal * (Number(taxRate || 0) / 100);
    const total = subtotal + tax_amount + Number(shipping || 0);
    return { subtotal, tax_amount, total_amount: total };
  },

  // Vendor integration
  async getVendors(companyId) {
    const res = await supaFetch('vendors?select=*&status=eq.ACTIVE&order=name.asc', { method: 'GET' }, companyId);
    return res.ok ? await res.json() : [];
  },

  async createFromVendor(companyId, vendorId, data, items = []) {
    // Get vendor details to pre-populate PO
    const vendorRes = await supaFetch(`vendors?id=eq.${vendorId}&select=*`, { method: 'GET' }, companyId);
    if (!vendorRes.ok) throw new Error('Vendor not found');
    const [vendor] = await vendorRes.json();

    const poData = {
      ...data,
      vendor_id: vendorId,
      vendor_name: vendor.name,
      vendor_contact: vendor.primary_contact_name || vendor.name,
      vendor_email: vendor.primary_contact_email || vendor.email,
      vendor_phone: vendor.primary_contact_phone || vendor.phone,
      payment_terms: vendor.payment_terms,
      company_id: companyId
    };

    return await this.create(companyId, poData, items);
  },

  // Approval workflow
  async getApprovalRules(companyId) {
    const res = await supaFetch('po_approval_rules?select=*&is_active=eq.true&order=min_amount.asc', { method: 'GET' }, companyId);
    return res.ok ? await res.json() : [];
  },

  async checkApprovalRequired(companyId, totalAmount, vendorId = null) {
    const rules = await this.getApprovalRules(companyId);
    const applicableRules = rules.filter(rule => {
      const amountMatch = totalAmount >= rule.min_amount && (rule.max_amount === null || totalAmount <= rule.max_amount);
      const vendorMatch = rule.vendor_category_id === null; // For now, ignore vendor category matching
      return amountMatch && vendorMatch;
    });
    return applicableRules.length > 0 ? applicableRules[0] : null;
  },

  async submitForApproval(companyId, poId, ruleId, userId) {
    const approvalData = {
      company_id: companyId,
      purchase_order_id: poId,
      rule_id: ruleId,
      status: 'PENDING'
    };

    const res = await supaFetch('po_approvals', { method: 'POST', body: approvalData }, companyId);
    if (!res.ok) throw new Error('Failed to submit for approval');

    // Update PO status to PENDING_APPROVAL
    await this.setStatus(companyId, poId, 'PENDING_APPROVAL', 'Submitted for approval');

    return (await res.json())[0];
  },

  async approvePO(companyId, approvalId, userId, comments = '') {
    // Update approval record
    const approvalRes = await supaFetch(`po_approvals?id=eq.${approvalId}`, {
      method: 'PATCH',
      body: {
        status: 'APPROVED',
        approver_user_id: userId,
        comments,
        approved_at: new Date().toISOString()
      }
    }, companyId);

    if (!approvalRes.ok) throw new Error('Failed to approve');

    // Get the approval to find the PO
    const approval = (await approvalRes.json())[0];

    // Update PO status to APPROVED
    await this.setStatus(companyId, approval.purchase_order_id, 'APPROVED', 'Approved');

    return approval;
  },

  async rejectPO(companyId, approvalId, userId, comments = '') {
    // Update approval record
    const approvalRes = await supaFetch(`po_approvals?id=eq.${approvalId}`, {
      method: 'PATCH',
      body: {
        status: 'REJECTED',
        approver_user_id: userId,
        comments,
        approved_at: new Date().toISOString()
      }
    }, companyId);

    if (!approvalRes.ok) throw new Error('Failed to reject');

    // Get the approval to find the PO
    const approval = (await approvalRes.json())[0];

    // Update PO status to REJECTED
    await this.setStatus(companyId, approval.purchase_order_id, 'REJECTED', comments || 'Rejected');

    return approval;
  },

  // Receiving functionality
  async receiveItems(companyId, poId, receivedItems) {
    // receivedItems: [{ po_item_id, received_quantity }]
    for (const item of receivedItems) {
      await supaFetch(`po_items?id=eq.${item.po_item_id}`, {
        method: 'PATCH',
        body: { received_quantity: Number(item.received_quantity) }
      }, companyId);
    }

    // Check if PO is fully received
    const { items } = await this.getWithItems(companyId, poId);
    const fullyReceived = items.every(item =>
      Number(item.received_quantity || 0) >= Number(item.quantity || 0)
    );
    const partiallyReceived = items.some(item =>
      Number(item.received_quantity || 0) > 0
    );

    let newStatus = 'APPROVED';
    if (fullyReceived) {
      newStatus = 'RECEIVED';
    } else if (partiallyReceived) {
      newStatus = 'PARTIAL';
    }

    await this.setStatus(companyId, poId, newStatus, 'Items received');
    return newStatus;
  },

  // Email functionality
  async sendToVendor(companyId, poId, emailOptions = {}) {
    try {
      // Send email with PDF attachment
      const result = await EmailService.sendPOToVendor(companyId, poId, emailOptions);

      // Update status to SENT
      await this.setStatus(companyId, poId, 'SENT', 'Sent to vendor via email');

      return result;
    } catch (error) {
      console.error('Error sending PO to vendor:', error);
      throw error;
    }
  },

  // Analytics and reporting
  async getSpendAnalytics(companyId, dateRange = {}) {
    let endpoint = 'purchase_orders?select=*,vendor_id,total_amount,created_at,status';

    if (dateRange.start) {
      endpoint += `&created_at=gte.${dateRange.start}`;
    }
    if (dateRange.end) {
      endpoint += `&created_at=lte.${dateRange.end}`;
    }

    const res = await supaFetch(endpoint, { method: 'GET' }, companyId);
    const orders = res.ok ? await res.json() : [];

    const analytics = {
      totalSpend: orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
      orderCount: orders.length,
      avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) / orders.length : 0,
      byStatus: {},
      byVendor: {},
      monthlyTrend: {}
    };

    // Group by status
    orders.forEach(order => {
      analytics.byStatus[order.status] = (analytics.byStatus[order.status] || 0) + Number(order.total_amount || 0);
    });

    // Group by vendor
    orders.forEach(order => {
      if (order.vendor_id) {
        analytics.byVendor[order.vendor_id] = (analytics.byVendor[order.vendor_id] || 0) + Number(order.total_amount || 0);
      }
    });

    return analytics;
  }
};

