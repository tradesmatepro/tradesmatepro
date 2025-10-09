import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import settingsService from '../services/SettingsService';
import { getJobFormStatuses, getStatusLabel } from '../utils/statusHelpers';

import {
  XMarkIcon,
  BriefcaseIcon,
  ClockIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import AddressCard from './AddressCard';

export const JobForm = ({
  isEdit = false,
  formData,
  setFormData,
  customers,
  employees,
  onSubmit,
  onCancel,
  onRevertToQuote,
  loading = false,
  onStatusChange
}) => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [showItems, setShowItems] = useState(false);
  const [editableItems, setEditableItems] = useState([]);
  const [drawerTotals, setDrawerTotals] = useState({ subtotal: 0, tax: 0, total: 0 });
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);
  const [completionChoice, setCompletionChoice] = useState(null);

  // Monitor job status changes for completion prompt
  useEffect(() => {
    if ((formData?.job_status || '').toLowerCase() === 'completed' && !completionChoice) {
      (async () => {
        try {
          const settings = await settingsService.getBusinessSettings(user.company_id);
          const behavior = settings?.job_completion_behavior || 'PROMPT';

          if (behavior === 'AUTO_INVOICE') {
            setCompletionChoice('INVOICE');
          } else if (behavior === 'WORK_ORDER') {
            setCompletionChoice('WORK_ORDER');
          } else {
            setShowCompletionPrompt(true);
          }
        } catch (e) {
          console.error('Failed to fetch completion behavior:', e);
          setShowCompletionPrompt(true);
        }
      })();
    } else if ((formData?.job_status || '').toLowerCase() !== 'completed') {
      setShowCompletionPrompt(false);
      setCompletionChoice(null);
    }
  }, [formData?.job_status, user.company_id, completionChoice]);

  // Pass completion choice to parent via formData
  useEffect(() => {
    if (completionChoice) {
      setFormData(prev => ({ ...prev, _completionChoice: completionChoice }));
    }
  }, [completionChoice, setFormData]);

  const getBadgeClass = (pm) => {
    switch (pm) {
      case 'PERCENTAGE':
        return 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700';
      case 'FLAT_RATE':
        return 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-teal-100 text-teal-700';
      case 'UNIT':
        return 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700';
      case 'RECURRING':
        return 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700';
      case 'MILESTONE':
        return 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-rose-100 text-rose-700';
      default:
        return 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700';
    }
  };

  // Initialize editable items when opening drawer
  useEffect(() => {
    if (showItems) {
      const items = Array.isArray(formData?.work_order_items) ? formData.work_order_items.map(it => ({ ...it })) : [];
      setEditableItems(items);
    }
  }, [showItems, formData?.work_order_items]);

  // Compute drawer totals
  useEffect(() => {
    if (!showItems) return;
    const subtotal = editableItems.reduce((sum, it) => sum + ((Number(it.quantity) || 0) * (Number(it.rate) || 0)), 0);
    const taxRate = Number(formData?.tax_rate) || 0;
    const tax = subtotal * (taxRate / 100);
    setDrawerTotals({ subtotal, tax, total: subtotal + tax });
  }, [showItems, editableItems, formData?.tax_rate]);

  const updateEditableItem = (idx, field, value) => {
    setEditableItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const saveItems = async () => {
    try {
      // Save each item
      for (const it of editableItems) {
        const body = {
          quantity: Number(it.quantity) || 0,
          rate: Number(it.rate) || 0,
          total: (Number(it.quantity) || 0) * (Number(it.rate) || 0)
        };
        await supaFetch(`work_order_items?id=eq.${it.id}`, { method: 'PATCH', body: JSON.stringify(body) }, user.company_id);
      }
      // Recompute labor/material and update work_order totals for T&M
      const laborCost = editableItems.filter(i => i.item_type === 'labor').reduce((s, i) => s + ((Number(i.quantity)||0)*(Number(i.rate)||0)), 0);
      const materialCost = editableItems.filter(i => i.item_type === 'material').reduce((s, i) => s + ((Number(i.quantity)||0)*(Number(i.rate)||0)), 0);
      const subtotal = drawerTotals.subtotal;
      const taxRate = Number(formData?.tax_rate) || 0;
      const tax = drawerTotals.tax;
      const total = drawerTotals.total;

      if (!formData?.pricing_model || formData.pricing_model === 'TIME_MATERIALS') {
        const body = { subtotal, tax_rate: taxRate, tax_amount: tax, total_amount: total };
        await supaFetch(`work_orders?id=eq.${formData.id}`, { method: 'PATCH', body: JSON.stringify(body) }, user.company_id);
        setFormData({ ...formData, labor_cost: laborCost, material_cost: materialCost, total_cost: total, subtotal, tax_rate: taxRate, tax_amount: tax, total_amount: total, work_order_items: editableItems });
      }

      setShowItems(false);
    } catch (e) {
      console.error('Failed saving items:', e);
    }
  };

  return (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">
          {isEdit ? 'Edit Job' : 'Create New Job'}
        </h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={(e) => {
        console.log('🔍 JobsForms - Form submitted:', {
          formData_job_status: formData.job_status,
          formData_id: formData.id
        });
        onSubmit(e);
      }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
              <BriefcaseIcon className="w-5 h-5" />
            {/* Model badge and Edit Quote link for model-priced jobs */}
            <div className="flex items-center justify-between mb-2">
              <span className={getBadgeClass(formData?.pricing_model)}>
                {formData?.pricing_model ? `Model: ${formData.pricing_model.replace('_', ' ')}` : 'Model: Hourly Rate'}
              </span>
              {formData?.pricing_model && formData.pricing_model !== 'HOURLY' && formData?.id && (
                <button
                  type="button"
                  onClick={() => navigate(`/quotes?id=${formData.id}`)}
                  className="text-xs text-primary-600 hover:underline"
                >
                  Edit Quote
                </button>
              )}
            </div>

              Job Information
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">

                Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.job_title}
                onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="HVAC Maintenance, Electrical Repair, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer *
              </label>
              <select
                required
                value={formData.customer_id}
                onChange={(e) => {
                  const customerId = e.target.value;
                  const selectedCustomer = customers.find(c => c.id === customerId);

                  // Auto-populate address fields from customer if not already set
                  const addressUpdate = {};
                  if (selectedCustomer && !formData.street_address && !formData.city && !formData.state && !formData.zip_code) {
                    if (selectedCustomer.street_address) addressUpdate.street_address = selectedCustomer.street_address;
                    if (selectedCustomer.city) addressUpdate.city = selectedCustomer.city;
                    if (selectedCustomer.state) addressUpdate.state = selectedCustomer.state;
                    if (selectedCustomer.zip_code) addressUpdate.zip_code = selectedCustomer.zip_code;
                  }

                  setFormData({...formData, customer_id: customerId, ...addressUpdate});
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name || customer.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Technician
              </label>
              <select
                value={formData.assigned_technician_id}
                onChange={(e) => setFormData({...formData, assigned_technician_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Unassigned</option>
                {Array.from(new Map((employees || []).map(emp => [emp.id, emp])).values()).map((employee, idx) => (
                  <option key={`${employee.id}-${idx}`} value={employee.id}>
                    {employee.full_name} ({employee.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Status
              </label>
              <select
                value={formData.job_status}
                onChange={(e) => {
                  const nextStatus = e.target.value;
                  console.log('🔍 JobsForms - Status dropdown changed:', {
                    oldStatus: formData.job_status,
                    newStatus: nextStatus
                  });
                  setFormData({ ...formData, job_status: nextStatus });
                  // Auto-save status changes immediately using optional callback provided by parent
                  if (typeof onStatusChange === 'function') {
                    onStatusChange(nextStatus);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {/* ✅ SMART STATUS FILTERING: Only show relevant statuses based on current status */}
                {getJobFormStatuses(formData.job_status || 'approved').map(status => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Only relevant status transitions are shown
              </p>
            </div>

            {/* Job Address Card */}
            <AddressCard
              customer={customers.find(c => c.id === formData.customer_id)}
              workAddress={{
                street_address: formData.street_address,
                city: formData.city,
                state: formData.state,
                zip_code: formData.zip_code
              }}
              onAddressChange={(address) => {
                setFormData({
                  ...formData,
                  street_address: address.street_address,
                  city: address.city,
                  state: address.state,
                  zip_code: address.zip_code
                });
              }}
              title="Job Address"
              showCustomerInfo={true}
              editable={true}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quote ID (Optional)
              </label>
              <input
                type="text"
                value={formData.quote_id}
                onChange={(e) => setFormData({...formData, quote_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Link to existing quote"
              />
            </div>
          </div>

          {/* Schedule & Costs */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Schedule & Costs
            </h4>

            {/* T&M: quick access to items */}
            {(!formData?.pricing_model || formData.pricing_model === 'TIME_MATERIALS') && Array.isArray(formData?.work_order_items) && formData.work_order_items.length > 0 && (
              <div className="text-right -mt-2">
                <button type="button" onClick={() => setShowItems(true)} className="text-xs text-primary-600 hover:underline">
                  View items
                </button>
              </div>
            )}

            {/* Invoices section (if any exist) */}
            {Array.isArray(formData?._invoices) && formData._invoices.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Invoices</h4>
                <div className="border rounded">
                  <div className="grid grid-cols-5 gap-2 text-xs font-medium text-gray-500 px-3 py-2 border-b bg-gray-50">
                    <div>#</div>
                    <div>Status</div>
                    <div>Amount</div>
                    <div>Due</div>
                    <div>Action</div>
                  </div>
                  <div className="divide-y">
                    {formData._invoices.map((inv) => (
                      <div key={inv.id} className="grid grid-cols-5 gap-2 px-3 py-2 text-sm">
                        <div>#{inv.invoice_number}</div>
                        <div>{inv.status}</div>
                        <div>${Number(inv.total_amount || 0).toLocaleString()}</div>
                        <div>{inv.due_at ? new Date(inv.due_at).toLocaleDateString() : '—'}</div>
                        <div>
                          <a className="text-primary-600 hover:underline" href={`/invoices?view=${inv.id}`}>View</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


            {/* Pricing summary for non-Hourly jobs */}
            {formData?.pricing_model && formData.pricing_model !== 'HOURLY' && (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-2">
                <div className="text-sm text-gray-700 mb-2">
                  Pricing Model: <span className="font-medium">{formData.pricing_model.replace('_', ' ')}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Subtotal</div>
                    <div className="font-medium">${(Number(formData.subtotal) || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Tax ({Number(formData.tax_rate) || 0}%)</div>
                    <div className="font-medium">${(Number(formData.tax_amount) || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Total</div>
                    <div className="font-semibold text-primary-700">${(Number(formData.total_amount) || Number(formData.total_cost) || 0).toFixed(2)}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">To change price, edit the originating quote.</div>

                {/* Model-specific hint */}
                <div className="text-xs text-gray-600 mt-2">
                  {(() => {
                    const pm = formData?.pricing_model;
                    if (pm === 'PERCENTAGE') {
                      const pct = Number(formData.percentage) || 0;
                      const base = Number(formData.percentage_base_amount) || 0;
                      return `Percentage: ${pct}% of $${base.toFixed(2)} = $${((pct/100)*base).toFixed(2)}`;
                    }
                    if (pm === 'FLAT_RATE') {
                      const amt = Number(formData.flat_rate_amount) || 0;
                      return `Flat Rate: $${amt.toFixed(2)}`;
                    }
                    if (pm === 'UNIT') {
                      const count = Number(formData.unit_count) || 0;
                      const price = Number(formData.unit_price) || 0;
                      return `Unit: ${count} × $${price.toFixed(2)} = $${(count*price).toFixed(2)}`;
                    }
                    if (pm === 'RECURRING') {
                      const rate = Number(formData.recurring_rate) || 0;
                      return `Recurring: $${rate.toFixed(2)} per ${formData.recurring_interval || 'interval'}`;
                    }
                    if (pm === 'MILESTONE') {
                      const base = Number(formData.milestone_base_amount) || 0;
                      return `Milestones: base $${base.toFixed(2)} + fixed/percentage milestones`;
                    }
                    return null;
                  })()}
                </div>

              </div>
            )}


            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Duration (hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData({...formData, estimated_duration: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Duration (hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.actual_duration}
                  onChange={(e) => setFormData({...formData, actual_duration: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Schedule cost inputs: hide when non-Time & Materials to avoid confusion */}
            {(!formData?.pricing_model || formData.pricing_model === 'TIME_MATERIALS') && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Labor Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.labor_cost}
                    onChange={(e) => {
                      const laborCost = parseFloat(e.target.value) || 0;
                      const materialCost = formData.material_cost || 0;
                      setFormData({
                        ...formData,
                        labor_cost: laborCost,
                        total_cost: laborCost + materialCost
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Cost ($)
                  </label>


                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.material_cost}
                    onChange={(e) => {
                      const materialCost = parseFloat(e.target.value) || 0;
                      const laborCost = formData.labor_cost || 0;
                      setFormData({
                        ...formData,
                        material_cost: materialCost,
                        total_cost: laborCost + materialCost
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_cost}
                    onChange={(e) => setFormData({...formData, total_cost: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description & Notes */}
        <div className="mt-6 space-y-4">
          <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5" />
            Description & Notes
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe the work to be performed..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internal Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Internal notes, special instructions, etc..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between gap-3 mt-6">
          <div>
            {isEdit && (
              <button
                type="button"
                onClick={onRevertToQuote}
                className="btn-tertiary text-gray-700 border border-gray-300"
                disabled={loading}
                title="Move back to Quotes as Draft"
              >
                Revert
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>

        {/* Items Drawer (Time & Materials only) */}
        {showItems && (!formData?.pricing_model || formData.pricing_model === 'TIME_MATERIALS') && (
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowItems(false)}>
            <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold">Job Items</h4>
                <button onClick={() => setShowItems(false)} className="p-1 hover:bg-gray-100 rounded">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {Array.isArray(formData?.work_order_items) && formData.work_order_items.length > 0 ? (
                <div className="space-y-3">
                  {formData.work_order_items.map((item, idx) => (
                    <div key={idx} className="border rounded p-3 text-sm">
                      <div className="font-medium">{item.item_name}</div>
                      <div className="text-gray-600">{item.description}</div>
                      <div className="mt-1 grid grid-cols-3 gap-2">
                        <div>Qty: {item.quantity}</div>
                        <div>Rate: ${Number(item.rate || 0).toFixed(2)}</div>
                        <div>Type: {item.item_type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-600">No items found for this job.</div>
              )}
            </div>
          </div>
        )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Job' : 'Create Job')}
            </button>
          </div>
        </div>
      </form>
    </div>

    {/* Completion Prompt Modal */}
    {showCompletionPrompt && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowCompletionPrompt(false)}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold mb-2">Job Completed</h3>
          <p className="text-gray-600 mb-6">What would you like to do next?</p>

          <div className="space-y-3">
            {/* Legacy "Send to Work Orders" removed */}

            <button
              type="button"
              className="w-full btn-primary"
              onClick={() => {
                console.log('🧾 Create Invoice Now clicked - submitting form directly');
                setShowCompletionPrompt(false);

                // Create a form submit event with completion choice attached
                const fakeEvent = {
                  preventDefault: () => {},
                  target: { elements: {} },
                  _completionChoice: 'INVOICE'  // Pass completion choice directly on the event
                };

                console.log('🧾 Calling onSubmit with completion choice on event:', fakeEvent._completionChoice);
                onSubmit(fakeEvent);
              }}
            >
              Create Invoice Now
            </button>

            <button
              type="button"
              className="w-full border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50"
              onClick={() => {
                setCompletionChoice('STAY');
                setShowCompletionPrompt(false);
              }}
            >
              Stay Here
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);



};
