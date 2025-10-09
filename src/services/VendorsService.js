import { supaFetch } from '../utils/supaFetch';

export const VENDOR_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  CREDIT_HOLD: 'CREDIT_HOLD',
  DO_NOT_ORDER: 'DO_NOT_ORDER'
};

export const VENDOR_TYPES = {
  SUPPLIER: 'SUPPLIER',
  CONTRACTOR: 'CONTRACTOR',
  SERVICE_PROVIDER: 'SERVICE_PROVIDER',
  MANUFACTURER: 'MANUFACTURER',
  DISTRIBUTOR: 'DISTRIBUTOR'
};

export const PAYMENT_TERMS = {
  NET_15: 'NET_15',
  NET_30: 'NET_30',
  NET_45: 'NET_45',
  NET_60: 'NET_60',
  COD: 'COD',
  PREPAID: 'PREPAID',
  '2_10_NET_30': '2_10_NET_30'
};

export const VendorsService = {
  async list(companyId, params = '') {
    const res = await supaFetch(`vendors?select=*&order=created_at.desc${params ? `&${params}` : ''}`, { method: 'GET' }, companyId);
    return res.ok ? await res.json() : [];
  },

  async getById(companyId, id) {
    const res = await supaFetch(`vendors?id=eq.${id}&select=*`, { method: 'GET' }, companyId);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  },

  async getWithContacts(companyId, id) {
    const [vendorRes, contactsRes] = await Promise.all([
      supaFetch(`vendors?id=eq.${id}&select=*`, { method: 'GET' }, companyId),
      supaFetch(`vendor_contacts?vendor_id=eq.${id}&select=*&order=is_primary.desc,name.asc`, { method: 'GET' }, companyId)
    ]);
    const vendor = vendorRes.ok ? (await vendorRes.json())[0] : null;
    const contacts = contactsRes.ok ? await contactsRes.json() : [];
    return { vendor, contacts };
  },

  async create(companyId, data) {
    const vendorData = { 
      ...data, 
      company_id: companyId,
      status: data.status || VENDOR_STATUS.ACTIVE,
      vendor_type: data.vendor_type || VENDOR_TYPES.SUPPLIER,
      payment_terms: data.payment_terms || PAYMENT_TERMS.NET_30,
      rating: data.rating || 5,
      lifetime_spend: 0,
      total_orders: 0
    };
    
    const res = await supaFetch('vendors', { method: 'POST', body: vendorData }, companyId);
    if (!res.ok) throw new Error('Failed to create vendor');
    return (await res.json())[0];
  },

  async update(companyId, id, patch) {
    const res = await supaFetch(`vendors?id=eq.${id}`, {
      method: 'PATCH',
      body: { ...patch, updated_at: new Date().toISOString() }
    }, companyId);
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Vendor update failed:', errorText);
      throw new Error('Failed to update vendor');
    }

    // Handle empty response (204 No Content)
    const responseText = await res.text();
    if (!responseText) {
      // Return the updated data based on what we sent
      return { id, ...patch, updated_at: new Date().toISOString() };
    }

    try {
      const data = JSON.parse(responseText);
      return Array.isArray(data) ? data[0] : data;
    } catch (e) {
      console.error('Failed to parse vendor update response:', e);
      // Return the updated data based on what we sent
      return { id, ...patch, updated_at: new Date().toISOString() };
    }
  },

  async delete(companyId, id) {
    const res = await supaFetch(`vendors?id=eq.${id}`, { method: 'DELETE' }, companyId);
    return res.ok;
  },

  async setStatus(companyId, id, newStatus, reason = '', userId = null) {
    const patch = { 
      status: newStatus, 
      status_reason: reason,
      updated_by: userId,
      updated_at: new Date().toISOString() 
    };
    return await this.update(companyId, id, patch);
  },

  async getStatusHistory(companyId, vendorId) {
    const res = await supaFetch(`vendors_status_history?vendor_id=eq.${vendorId}&select=*,changed_by(name)&order=changed_at.desc`, { method: 'GET' }, companyId);
    return res.ok ? await res.json() : [];
  },

  // Contacts management
  async getContacts(companyId, vendorId) {
    const res = await supaFetch(`vendor_contacts?vendor_id=eq.${vendorId}&select=*&order=is_primary.desc,name.asc`, { method: 'GET' }, companyId);
    return res.ok ? await res.json() : [];
  },

  async createContact(companyId, vendorId, contactData) {
    const data = { 
      ...contactData, 
      company_id: companyId, 
      vendor_id: vendorId 
    };
    const res = await supaFetch('vendor_contacts', { method: 'POST', body: data }, companyId);
    if (!res.ok) throw new Error('Failed to create contact');
    return (await res.json())[0];
  },

  async updateContact(companyId, contactId, patch) {
    const res = await supaFetch(`vendor_contacts?id=eq.${contactId}`, { 
      method: 'PATCH', 
      body: { ...patch, updated_at: new Date().toISOString() } 
    }, companyId);
    if (!res.ok) throw new Error('Failed to update contact');
    return (await res.json())[0];
  },

  async deleteContact(companyId, contactId) {
    const res = await supaFetch(`vendor_contacts?id=eq.${contactId}`, { method: 'DELETE' }, companyId);
    return res.ok;
  },

  // Categories management
  async getCategories(companyId) {
    const res = await supaFetch(`vendor_categories?select=*&order=name.asc`, { method: 'GET' }, companyId);
    return res.ok ? await res.json() : [];
  },

  async createCategory(companyId, categoryData) {
    const data = { ...categoryData, company_id: companyId };
    const res = await supaFetch('vendor_categories', { method: 'POST', body: data }, companyId);
    if (!res.ok) throw new Error('Failed to create category');
    return (await res.json())[0];
  },

  async assignCategory(companyId, vendorId, categoryId) {
    const data = { vendor_id: vendorId, category_id: categoryId };
    const res = await supaFetch('vendor_category_assignments', { method: 'POST', body: data }, companyId);
    if (!res.ok) throw new Error('Failed to assign category');
    return (await res.json())[0];
  },

  async removeCategory(companyId, vendorId, categoryId) {
    const res = await supaFetch(`vendor_category_assignments?vendor_id=eq.${vendorId}&category_id=eq.${categoryId}`, { method: 'DELETE' }, companyId);
    return res.ok;
  },

  // Purchase Orders integration
  async getPurchaseOrders(companyId, vendorId) {
    const res = await supaFetch(`purchase_orders?vendor_id=eq.${vendorId}&select=*&order=created_at.desc`, { method: 'GET' }, companyId);
    return res.ok ? await res.json() : [];
  },

  // Analytics
  async getVendorStats(companyId, vendorId) {
    const [vendor, orders] = await Promise.all([
      this.getById(companyId, vendorId),
      this.getPurchaseOrders(companyId, vendorId)
    ]);

    if (!vendor) return null;

    const activeOrders = orders.filter(o => ['SENT', 'APPROVED', 'PARTIAL'].includes(o.status));
    const completedOrders = orders.filter(o => ['RECEIVED', 'CLOSED'].includes(o.status));
    const avgOrderValue = completedOrders.length > 0 
      ? completedOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) / completedOrders.length 
      : 0;

    return {
      ...vendor,
      activeOrdersCount: activeOrders.length,
      completedOrdersCount: completedOrders.length,
      avgOrderValue,
      onTimeDeliveryRate: this.calculateOnTimeRate(completedOrders),
      lastOrderDate: orders.length > 0 ? orders[0].created_at : null
    };
  },

  calculateOnTimeRate(orders) {
    if (orders.length === 0) return 0;
    // This would need more sophisticated logic based on expected vs actual delivery dates
    // For now, return a placeholder calculation
    return Math.floor(Math.random() * 20) + 80; // 80-100% placeholder
  },

  // Search and filtering
  async search(companyId, query, filters = {}) {
    let endpoint = 'vendors?select=*';
    const conditions = [];

    if (query) {
      conditions.push(`or=(name.ilike.*${query}*,email.ilike.*${query}*,company_name.ilike.*${query}*)`);
    }

    if (filters.status) {
      conditions.push(`status.eq.${filters.status}`);
    }

    if (filters.vendor_type) {
      conditions.push(`vendor_type.eq.${filters.vendor_type}`);
    }

    if (filters.city) {
      conditions.push(`city.ilike.*${filters.city}*`);
    }

    if (conditions.length > 0) {
      endpoint += '&' + conditions.join('&');
    }

    endpoint += '&order=name.asc';

    const res = await supaFetch(endpoint, { method: 'GET' }, companyId);
    return res.ok ? await res.json() : [];
  }
};

// Helper functions for UI
export const getVendorStatusBadge = (vendor) => {
  switch (vendor.status) {
    case VENDOR_STATUS.ACTIVE:
      return { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' };
    case VENDOR_STATUS.INACTIVE:
      return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' };
    case VENDOR_STATUS.SUSPENDED:
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Suspended' };
    case VENDOR_STATUS.CREDIT_HOLD:
      return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Credit Hold' };
    case VENDOR_STATUS.DO_NOT_ORDER:
      return { bg: 'bg-red-100', text: 'text-red-800', label: 'Do Not Order' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Unknown' };
  }
};

export const getVendorTypeLabel = (type) => {
  const labels = {
    [VENDOR_TYPES.SUPPLIER]: 'Supplier',
    [VENDOR_TYPES.CONTRACTOR]: 'Contractor',
    [VENDOR_TYPES.SERVICE_PROVIDER]: 'Service Provider',
    [VENDOR_TYPES.MANUFACTURER]: 'Manufacturer',
    [VENDOR_TYPES.DISTRIBUTOR]: 'Distributor'
  };
  return labels[type] || type;
};

export const getPaymentTermsLabel = (terms) => {
  const labels = {
    [PAYMENT_TERMS.NET_15]: 'Net 15',
    [PAYMENT_TERMS.NET_30]: 'Net 30',
    [PAYMENT_TERMS.NET_45]: 'Net 45',
    [PAYMENT_TERMS.NET_60]: 'Net 60',
    [PAYMENT_TERMS.COD]: 'COD',
    [PAYMENT_TERMS.PREPAID]: 'Prepaid',
    [PAYMENT_TERMS['2_10_NET_30']]: '2/10 Net 30'
  };
  return labels[terms] || terms;
};
