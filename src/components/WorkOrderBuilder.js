import React, { useState, useEffect, useRef } from 'react';
import {
  XMarkIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  PlayIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import settingsService from '../services/SettingsService';
import { useUser } from '../contexts/UserContext';
import AddressCard from './AddressCard';
import {
  WORK_ORDER_STATUS,
  WORK_ORDER_STATUS_LABELS,
  getStatusConfig,
  getStatusBadgeProps,
  getAllowedNextStatuses,
  canSchedule,
  canEdit
} from '../utils/workOrderStatus';
import SkillsPicker from './SkillsPicker';


export const WorkOrderBuilder = ({
  isEdit = false,
  formData,
  setFormData,
  customers,
  employees,
  crew = [],
  customersLoading = false,
  onSubmit,
  onCancel,
  onStatusChange,
  loading = false
}) => {
  const { user } = useUser();

  const didLoadRates = useRef(false); // GPT-5 mount guard
  const [rates, setRates] = useState(null); // Will be loaded from database
  const [defaultHoursPerDay, setDefaultHoursPerDay] = useState(8);

  // Phase 1: Required skills state (edit-only UI)
  const [requiredSkills, setRequiredSkills] = useState([]); // [{skill_id, required_level, quantity}]
  const [originalRequiredSkills, setOriginalRequiredSkills] = useState([]);

  // Load required skills for existing work order
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!isEdit || !formData?.id) return;
        const res = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/work_order_required_skills?work_order_id=eq.${formData.id}&select=skill_id,required_level,quantity`, {
          headers: { 'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}` }
        });
        if (!cancelled && res.ok) {
          const rows = await res.json();
          const mapped = (rows || []).map(r => ({ skill_id: r.skill_id, required_level: r.required_level ?? 1, quantity: r.quantity ?? 1 }));
          setRequiredSkills(mapped);
          setOriginalRequiredSkills(mapped);
        }
      } catch (e) {
        console.warn('Failed to load required skills', e);
      }
    })();
    return () => { cancelled = true; };
  }, [isEdit, formData?.id]);

  const persistRequiredSkills = async (next) => {
    setRequiredSkills(next);
    if (!isEdit || !formData?.id) return;
    try {
      const currentIds = new Set((next || []).map(x => x.skill_id));
      const originalIds = new Set((originalRequiredSkills || []).map(x => x.skill_id));
      const toDelete = [...originalIds].filter(id => !currentIds.has(id));
      const toUpsert = (next || []).map(x => ({ work_order_id: formData.id, skill_id: x.skill_id, required_level: x.required_level ?? 1, quantity: x.quantity ?? 1 }));

      if (toDelete.length > 0) {
        const csv = toDelete.join(',');
        await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/work_order_required_skills?work_order_id=eq.${formData.id}&skill_id=in.(${csv})`, {
          method: 'DELETE', headers: { 'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}` }
        });
      }
      if (toUpsert.length > 0) {
        await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/work_order_required_skills`, {
          method: 'POST', headers: { 'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY, 'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(toUpsert)
        });
      }
      setOriginalRequiredSkills(next);
    } catch (e) {
      console.warn('Failed to save required skills', e);
    }
  };

  // Labor summary (crew size × hours/day × days)
  const [laborSummary, setLaborSummary] = useState(() => {
    const ls = formData.labor_summary;
    if (ls) return { ...ls };
    return {
      crew_size: 1,
      hours_per_day: 8,
      days: 1,
      regular_hours: 8,
      overtime_hours: 0,
      labor_subtotal: 0, // Will be calculated when rates load
    };
  });

  const statusConfig = getStatusConfig(formData.status);
  const statusBadge = getStatusBadgeProps(formData.status);
  const allowedNextStatuses = getAllowedNextStatuses(formData.status);
  const isEditable = canEdit(formData.status);

  // Confirmation modal state for reopen action
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [pendingReopenStatus, setPendingReopenStatus] = useState(null);

  // Determine form title based on status instead of stage
  const getFormTitle = () => {
    if (formData.quote_status) return 'Quote';
    if (formData.job_status) return 'Job';
    if (formData.invoice_status) return 'Invoice';
    return statusConfig.pageTitle; // fallback
  };

  const formTitle = getFormTitle();

  useEffect(() => {
    // GPT-5 mount guard: prevent double loading in StrictMode
    if (!didLoadRates.current) {
      didLoadRates.current = true;
      loadRates();
    }

    // On mount or when formData changes (edit), hydrate from labor_summary if present
    if (formData?.labor_summary) {
      setLaborSummary({ ...formData.labor_summary });
    }
  }, [formData?.labor_summary]);

  const loadRates = async () => {
    try {
      const companyId = user?.company_id;
      const settings = await settingsService.getSettings(companyId);
      setDefaultHoursPerDay(settings.default_hours_per_day || 8);
      const overtime = await settingsService.getOvertimeRate(companyId);
      // Use proper rates service instead of legacy settings
      const ratesSettings = await settingsService.getRatesPricingSettings(companyId);
      if (!ratesSettings) {
        throw new Error('Rates not configured. Please set up rates in Settings.');
      }

      const newRates = {
        hourly: ratesSettings.default_hourly_rate,
        overtime: ratesSettings.default_hourly_rate * (ratesSettings.overtime_rate_multiplier || 1.5),
        markup: ratesSettings.parts_markup_percentage,
        tax: ratesSettings.default_tax_rate
      };
      setRates(newRates);

      // Recompute labor summary totals with up-to-date rates and default hours/day from settings
      setLaborSummary(prev => {
        const defaultHpd = settings.default_hours_per_day || 8;
        const hpd = prev.hours_per_day ?? defaultHpd;
        const crew = prev.crew_size || 0;
        const days = prev.days || 0;
        const regularPerEmpPerDay = Math.min(hpd, 8);
        const otPerEmpPerDay = Math.max(hpd - 8, 0);
        const regularHours = crew * regularPerEmpPerDay * days;
        const overtimeHours = crew * otPerEmpPerDay * days;
        const laborSubtotal = (regularHours * newRates.hourly) + (overtimeHours * newRates.overtime);
        return { ...prev, hours_per_day: hpd, regular_hours: regularHours, overtime_hours: overtimeHours, labor_subtotal: laborSubtotal };
      });
    } catch (error) {
      console.error('Error loading rates:', error);
    }
  };

  const addWorkOrderItem = () => {
    setFormData({
      ...formData,
      work_order_items: [
        ...formData.work_order_items,
        {
          item_name: '',
          description: '',
          item_type: 'labor',
          quantity: 1,
          rate: rates.hourly,
          total: rates.hourly,
          is_overtime: false,
          photo_url: ''
        }
      ]
    });
  };

  const removeWorkOrderItem = (index) => {
    if (formData.work_order_items.length > 1) {
      const newItems = formData.work_order_items.filter((_, i) => i !== index);
      setFormData({ ...formData, work_order_items: newItems });
    }
  };

  const updateWorkOrderItem = (index, field, value) => {
    const newItems = [...formData.work_order_items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-update rate based on type and overtime
    if (field === 'item_type') {
      if (value === 'labor') {
        newItems[index].rate = newItems[index].is_overtime ? rates.overtime : rates.hourly;
      }
    }

    if (field === 'is_overtime' && newItems[index].item_type === 'labor') {
      newItems[index].rate = value ? rates.overtime : rates.hourly;
    }

    // Calculate item total
    const quantity = field === 'quantity' ? value : newItems[index].quantity;
    const rate = field === 'rate' ? value : newItems[index].rate;
    let itemTotal = (quantity || 0) * (rate || 0);

    // Apply markup for parts/materials
    if (newItems[index].item_type === 'part' || newItems[index].item_type === 'material') {
      itemTotal = itemTotal * (1 + rates.markup / 100);
    }

    newItems[index].total = itemTotal;
    setFormData({ ...formData, work_order_items: newItems });
  };

  const calculateSubtotal = () => {
    const itemsTotal = formData.work_order_items.reduce((sum, item) => {
      return sum + (item.total || 0);
    }, 0);
    const laborTotal = (laborSummary?.labor_subtotal || 0);
    return itemsTotal + laborTotal;
  };

  const subtotal = calculateSubtotal();
  const taxRate = formData.tax_rate || rates.tax;
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount;

  // Update totals and labor summary in formData (GPT-5 fix: guard against no-op updates)
  useEffect(() => {
    setFormData(prev => {
      const next = {
        ...prev,
        subtotal: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        labor_summary: laborSummary
      };
      // Guard against no-op updates to prevent infinite loops
      if (prev.subtotal === subtotal &&
          prev.tax_rate === taxRate &&
          prev.tax_amount === taxAmount &&
          prev.total_amount === totalAmount &&
          JSON.stringify(prev.labor_summary) === JSON.stringify(laborSummary)) {
        return prev; // No change, return same object to prevent re-render
      }
      return next;
    });
  }, [subtotal, taxRate, taxAmount, totalAmount, laborSummary]);

  const handleStatusChange = async (newStatus) => {
    // Check if this is a reopen action (moving back to JOB stage)
    if (newStatus === 'JOB' && formData.stage === 'WORK_ORDER') {
      // Show confirmation modal for destructive action
      setPendingReopenStatus(newStatus);
      setShowReopenConfirm(true);
      // Don't update local state yet - wait for confirmation
      return;
    }

    // Update local state immediately for UI responsiveness
    setFormData({ ...formData, status: newStatus });

    // Call the async status change handler directly (bypass form submission)
    if (onStatusChange) {
      await onStatusChange(newStatus);
    }
  };

  const handleReopenConfirm = async () => {
    setShowReopenConfirm(false);

    if (pendingReopenStatus && onStatusChange) {
      // Update local state to show the change
      setFormData({ ...formData, status: pendingReopenStatus });

      // Call the status change handler with reason
      await onStatusChange(pendingReopenStatus, 'User requested to reopen and move back to Job stage');
    }

    setPendingReopenStatus(null);
  };

  const handleReopenCancel = () => {
    setShowReopenConfirm(false);
    setPendingReopenStatus(null);
    // Reset dropdown to current status
    setFormData({ ...formData });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">
              {isEdit ? `Edit ${formTitle}` : `Create ${formTitle}`}
            </h3>
            <span className={statusBadge.className}>
              {statusBadge.label}
            </span>
            {formData.stage && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                Stage: {formData.stage}
              </span>
            )}
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          <form onSubmit={onSubmit}>
            {/* Status Actions */}
            {isEdit && allowedNextStatuses.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Available Actions</h4>
                <div className="flex gap-2">
                  {allowedNextStatuses.map(status => {
                    const config = getStatusConfig(status);
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusChange(status)}
                        className="btn-primary-sm flex items-center gap-2"
                      >
                        {status === WORK_ORDER_STATUS.ACCEPTED && <CheckCircleIcon className="w-4 h-4" />}
                        {status === WORK_ORDER_STATUS.SCHEDULED && <ClockIcon className="w-4 h-4" />}
                        {status === WORK_ORDER_STATUS.IN_PROGRESS && <PlayIcon className="w-4 h-4" />}
                        {status === WORK_ORDER_STATUS.COMPLETED && <CheckCircleIcon className="w-4 h-4" />}
                        {status === WORK_ORDER_STATUS.INVOICED && <CurrencyDollarIcon className="w-4 h-4" />}
                        {config.actionLabel || `Mark ${status}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Work Order Information */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5" />
                  {statusConfig.pageTitle} Information
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="HVAC Installation, Electrical Repair, etc."
                    disabled={!isEditable}
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
                    disabled={customersLoading || !isEditable}
                  >
                    <option value="">Select a customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Detailed description of the work to be performed..."
                    disabled={!isEditable}
                  />
                </div>

                {/* Work Address Card */}
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
                  title="Work Address"
                  showCustomerInfo={true}
                  editable={isEditable}
                />
              </div>

              {/* Schedule & Assignment */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  Schedule & Assignment
                </h4>

                {/* Status Dropdown - Always visible in right column */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => {
                      console.log('🔽 DROPDOWN CHANGE:', {
                        from: formData.status,
                        to: e.target.value,
                        isEditable,
                        stage: formData.stage
                      });
                      handleStatusChange(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={!isEditable}
                  >
                    {(() => {
                      // Show appropriate statuses based on stage
                      if (formData.stage === 'QUOTE') {
                        return ['QUOTE', 'ACCEPTED', 'CANCELLED'].map(status => (
                          <option key={status} value={status}>
                            {WORK_ORDER_STATUS_LABELS[status] || status}
                          </option>
                        ));
                      } else if (formData.stage === 'JOB') {
                        return ['ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
                          <option key={status} value={status}>
                            {WORK_ORDER_STATUS_LABELS[status] || status}
                          </option>
                        ));
                      } else if (formData.job_status) {
                        const forwardStatuses = ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
                        return [
                          // Forward status options
                          ...forwardStatuses.map(status => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))
                        ];
                      } else {
                        // Fallback - show all statuses
                        return Object.entries(WORK_ORDER_STATUS).map(([key, value]) => (
                          <option key={key} value={value}>
                            {WORK_ORDER_STATUS_LABELS[value] || value}
                          </option>
                        ));
                      }
                    })()}
                  </select>
                </div>

                {statusConfig.showScheduling && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Technician
                    </label>
                    <select
                      value={formData.assigned_technician_id || ''}
                      onChange={(e) => setFormData({...formData, assigned_technician_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={!isEditable}
                    >
                      <option value="">Select technician</option>
                      {employees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Labor Summary (always visible) */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5" />
                    Labor Summary
                  </h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employees</label>
                    <input
                      type="number"
                      min="1"
                      value={laborSummary.crew_size || 1}
                      onChange={(e) => {
                        const crew = parseInt(e.target.value) || 1;
                        const hpd = laborSummary.hours_per_day || 0;
                        const days = laborSummary.days || 0;
                        const regularPerEmpPerDay = Math.min(hpd, 8);
                        const otPerEmpPerDay = Math.max(hpd - 8, 0);
                        const regularHours = crew * regularPerEmpPerDay * days;
                        const overtimeHours = crew * otPerEmpPerDay * days;
                        const laborSubtotal = (regularHours * rates.hourly) + (overtimeHours * rates.overtime);
                        setLaborSummary({ ...laborSummary, crew_size: crew, regular_hours: regularHours, overtime_hours: overtimeHours, labor_subtotal: laborSubtotal });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={!isEditable}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hours/Day</label>

                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={laborSummary.hours_per_day || 0}
                      onChange={(e) => {
                        const hpd = parseFloat(e.target.value) || 0;
                        const crew = laborSummary.crew_size || 0;
                        const days = laborSummary.days || 0;
                        const regularPerEmpPerDay = Math.min(hpd, 8);
                        const otPerEmpPerDay = Math.max(hpd - 8, 0);
                        const regularHours = crew * regularPerEmpPerDay * days;
                        const overtimeHours = crew * otPerEmpPerDay * days;
                        const laborSubtotal = (regularHours * rates.hourly) + (overtimeHours * rates.overtime);
                        setLaborSummary({ ...laborSummary, hours_per_day: hpd, regular_hours: regularHours, overtime_hours: overtimeHours, labor_subtotal: laborSubtotal });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={!isEditable}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                    <input
                      type="number"
                      min="1"
                      value={laborSummary.days || 1}
                      onChange={(e) => {
                        const days = parseInt(e.target.value) || 1;
                        const crew = laborSummary.crew_size || 0;
                        const hpd = laborSummary.hours_per_day || 0;
                        const regularPerEmpPerDay = Math.min(hpd, 8);
                        const otPerEmpPerDay = Math.max(hpd - 8, 0);
                        const regularHours = crew * regularPerEmpPerDay * days;
                        const overtimeHours = crew * otPerEmpPerDay * days;
                        const laborSubtotal = (regularHours * rates.hourly) + (overtimeHours * rates.overtime);
                        setLaborSummary({ ...laborSummary, days, regular_hours: regularHours, overtime_hours: overtimeHours, labor_subtotal: laborSubtotal });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={!isEditable}
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="text-sm text-gray-600">Regular Hours</div>
                    <div className="text-sm font-medium">{(laborSummary.regular_hours || 0).toFixed(1)}h @ ${rates.hourly}</div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="text-sm text-gray-600">Overtime Hours</div>
                    <div className="text-sm font-medium">{(laborSummary.overtime_hours || 0).toFixed(1)}h @ ${rates.overtime}</div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="text-sm text-gray-600">Labor Subtotal</div>
                    <div className="text-sm font-semibold">${(laborSummary.labor_subtotal || 0).toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Required Skills (Phase 1) */}
              {isEdit && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
                      <BriefcaseIcon className="w-5 h-5" />
                      Required Skills
                    </h4>
                  </div>
                  <SkillsPicker
                    value={requiredSkills}
                    onChange={persistRequiredSkills}
                    showLevel={true}
                    showQuantity={true}
                    allowCreate={true}
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    Select the skills and levels this job requires. Scheduling will prioritize matching technicians accordingly.
                  </div>
                </div>
              )}


              {/* Scheduling Times */}
              {statusConfig.showScheduling && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
                    <ClockIcon className="w-5 h-5" />
                    Scheduling
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.start_time ? formData.start_time.slice(0, 16) : ''}
                        onChange={(e) => setFormData({...formData, start_time: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled={!canSchedule(formData.status)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.end_time ? formData.end_time.slice(0, 16) : ''}
                        onChange={(e) => setFormData({...formData, end_time: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled={!canSchedule(formData.status)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Crew Section - Show assigned crew members */}
              {isEdit && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2" />
                    Crew ({crew.length})
                  </h4>

                  {crew.length > 0 ? (
                    <div className="space-y-2">
                      {crew.map((member, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                          <div className="flex items-center">
                            <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium">{member.users?.full_name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{member.hours} hours</span>
                            <span>${member.rate}/hr</span>
                            <span>{new Date(member.work_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      No crew assigned yet
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Work Order Items */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
                  <CurrencyDollarIcon className="w-5 h-5" />
                  Items & Pricing
                </h4>
                {isEditable && (
                  <button
                    type="button"
                    onClick={addWorkOrderItem}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Item
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {formData.work_order_items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={item.item_type || 'labor'}
                          onChange={(e) => updateWorkOrderItem(index, 'item_type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          disabled={!isEditable}
                        >
                          <option value="labor">Labor</option>
                          <option value="material">Materials</option>
                          <option value="part">Parts</option>
                          <option value="service">Other Service</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={item.item_name}
                          onChange={(e) => updateWorkOrderItem(index, 'item_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Description of work/item"
                          disabled={!isEditable}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) => updateWorkOrderItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          disabled={!isEditable}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rate ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.rate}
                          onChange={(e) => updateWorkOrderItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          disabled={!isEditable}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-medium">
                          ${(item.total || 0).toFixed(2)}
                        </div>
                      </div>

                      {isEditable && (
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeWorkOrderItem(index)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            disabled={formData.work_order_items.length === 1}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax ({taxRate}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Total Items: {formData.work_order_items.filter(item => item.item_name.trim()).length}
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
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? `Update ${formTitle}` : `Create ${formTitle}`)}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Reopen Confirmation Modal */}
      {showReopenConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Reopen Work Order
                </h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                This will unschedule the job and remove assigned crew. The work order will move back to Job stage and lose all scheduling information.
              </p>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                Continue?
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleReopenCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReopenConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Yes, Reopen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
