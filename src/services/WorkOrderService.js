// Centralized service for loading/saving work orders with items and labor
// Uses work_orders, work_order_items, work_order_labor as single source of truth

import { supaFetch } from '../utils/supaFetch';
import settingsService from './SettingsService';

const WorkOrderService = {
  async loadWorkOrder(id, companyId) {
    const woRes = await supaFetch(`work_orders?id=eq.${id}&select=*`, { method: 'GET' }, companyId);
    if (!woRes.ok) throw new Error('Failed to load work order');
    const [workOrder] = await woRes.json();

    const itemsRes = await supaFetch(`work_order_items?work_order_id=eq.${id}&select=*`, { method: 'GET' }, companyId);
    const items = itemsRes.ok ? await itemsRes.json() : [];

    const laborRes = await supaFetch(`work_order_labor?work_order_id=eq.${id}&select=*`, { method: 'GET' }, companyId);
    const labor = laborRes.ok ? await laborRes.json() : [];

    return { workOrder, items, labor };
  },

  computeTotals({ items = [], labor = [] }, settings) {
    // Items subtotal
    const itemsSubtotal = items.reduce((sum, it) => sum + (Number(it.total) || (Number(it.quantity) || 0) * (Number(it.rate) || 0)), 0);
    // Labor subtotal
    const laborSubtotal = labor.reduce((sum, l) => sum + ((Number(l.hours) || 0) * (Number(l.rate) || settings?.default_hourly_rate || 75)), 0);

    const subtotal = itemsSubtotal + laborSubtotal;
    const taxRate = Number(settings?.default_tax_rate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    return { subtotal, tax_rate: taxRate, tax_amount: taxAmount, total_amount: totalAmount };
  },

  async saveWorkOrder({ workOrder, items, labor }, companyId) {
    // Compute totals only if items or labor provided; otherwise leave totals unchanged
    let totals = null;
    if (Array.isArray(items) || Array.isArray(labor)) {
      const settings = await settingsService.getBusinessSettings(companyId);
      totals = this.computeTotals({ items: items || [], labor: labor || [] }, settings);
    }

    // Upsert work_order row (only include totals if computed)
    const woBody = totals ? { ...workOrder, ...totals } : { ...workOrder };
    const woPatch = await supaFetch(`work_orders?id=eq.${workOrder.id}`, { method: 'PATCH', body: woBody }, companyId);
    if (!woPatch.ok) throw new Error('Failed to save work order');

    // Replace items only if explicitly provided
    if (Array.isArray(items)) {
      await supaFetch(`work_order_items?work_order_id=eq.${workOrder.id}`, { method: 'DELETE' }, companyId);
      if (items.length) {
        const body = items.map(it => ({ ...it, work_order_id: workOrder.id, company_id: companyId }));
        const post = await supaFetch('work_order_items', { method: 'POST', body }, companyId);
        if (!post.ok) throw new Error('Failed to save items');
      }
    }

    // Replace labor entries only if explicitly provided
    if (Array.isArray(labor)) {
      await supaFetch(`work_order_labor?work_order_id=eq.${workOrder.id}`, { method: 'DELETE' }, companyId);
      if (labor.length) {
        const body = labor.map(l => ({ ...l, work_order_id: workOrder.id, company_id: companyId }));
        const post = await supaFetch('work_order_labor', { method: 'POST', body }, companyId);
        if (!post.ok) throw new Error('Failed to save labor');
      }
    }

    return totals;
  },

  async setSchedule(id, { start_time, end_time, assigned_technician_id, employee_id }, companyId) {
    const body = {};
    if (start_time) body.start_time = start_time;
    if (end_time) body.end_time = end_time;
    // ✅ STANDARDIZATION FIX: Support both employee_id (new) and assigned_technician_id (legacy)
    if (employee_id) body.employee_id = employee_id;
    else if (assigned_technician_id) body.employee_id = assigned_technician_id; // Map legacy to new

    const res = await supaFetch(`work_orders?id=eq.${id}`, { method: 'PATCH', body }, companyId);
    if (!res.ok) throw new Error('Failed to update schedule');
    return true;
  }
};

export default WorkOrderService;

