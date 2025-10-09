import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  BriefcaseIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  DocumentDuplicateIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import settingsService from '../services/SettingsService';
import { useUser } from '../contexts/UserContext';
import JobTemplates from './JobTemplates';
import JobTemplatesService from '../services/JobTemplatesService';

export const JobBuilder = ({
  isEdit = false,
  formData,
  setFormData,
  customers,
  employees,
  customersLoading = false,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { user } = useUser();
  const [rates, setRates] = useState(null); // Will be loaded from database
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    loadRates();
  }, []);

  // Handle template selection
  const handleTemplateSelect = async (templateData) => {
    try {
      const template = templateData.template;
      const items = templateData.items || [];

      // Apply template data to form
      setFormData(prev => ({
        ...prev,
        job_title: prev.job_title || template.name,
        description: prev.description || template.description,
        estimated_duration: template.default_duration || prev.estimated_duration,
        template_id: template.id,
        // Keep existing customer and other user-entered data
      }));

      // Set template items
      if (items.length > 0) {
        const workOrderItems = items.map(item => ({
          item_type: item.item_type,
          description: item.name,
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          unit: item.unit || 'each',
          labor_hours: item.estimated_hours || 0,
          labor_rate: item.labor_rate || rates?.hourly || 75.00
        }));

        setFormData(prev => ({
          ...prev,
          work_order_items: workOrderItems
        }));
      }

      setSelectedTemplate(template);
      setShowTemplates(false);
    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  const loadRates = async () => {
    try {
      const companyId = user?.company_id;
      const ratesSettings = await settingsService.getRatesPricingSettings(companyId);
      if (!ratesSettings) {
        throw new Error('Rates not configured. Please set up rates in Settings.');
      }

      setRates({
        hourly: ratesSettings.default_hourly_rate,
        overtime: ratesSettings.default_hourly_rate * (ratesSettings.overtime_rate_multiplier || 1.5),
        markup: ratesSettings.parts_markup_percentage,
        tax: ratesSettings.default_tax_rate
      });
    } catch (error) {
      console.error('Error loading rates:', error);
      alert(`Failed to load rates: ${error.message}`);
    }
  };

  const addJobItem = () => {
    setFormData({
      ...formData,
      job_items: [
        ...formData.job_items,
        {
          item_name: '',
          quantity: 1,
          rate: rates?.hourly || 0,
          item_type: 'labor',
          is_overtime: false,
          description: '',
          photo_url: ''
        }
      ]
    });
  };

  const removeJobItem = (index) => {
    if (formData.job_items.length > 1) {
      const newItems = formData.job_items.filter((_, i) => i !== index);
      setFormData({ ...formData, job_items: newItems });
    }
  };

  const updateJobItem = (index, field, value) => {
    const newItems = [...formData.job_items];
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
    
    setFormData({ ...formData, job_items: newItems });
  };

  const calculateItemTotal = (item) => {
    let baseTotal = (item.quantity || 0) * (item.rate || 0);

    // Apply markup for parts/materials
    if (item.item_type === 'part' || item.item_type === 'material') {
      baseTotal = baseTotal * (1 + rates.markup / 100);
    }

    return baseTotal;
  };

  const calculateSubtotal = () => {
    return formData.job_items.reduce((sum, item) => {
      return sum + calculateItemTotal(item);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * (rates.tax / 100);
  const total = subtotal + tax;

  // Update total cost in formData
  useEffect(() => {
    setFormData(prev => ({ ...prev, total_cost: total }));
  }, [total, setFormData]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">
              {isEdit ? 'Edit Job' : 'Create New Job'}
            </h3>
            {selectedTemplate && (
              <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                <DocumentDuplicateIcon className="w-4 h-4" />
                <span>Using: {selectedTemplate.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEdit && (
              <button
                type="button"
                onClick={() => setShowTemplates(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <SparklesIcon className="w-4 h-4" />
                Use Template
              </button>
            )}
            <button
              onClick={onCancel}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Job Information */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
                  <BriefcaseIcon className="w-5 h-5" />
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
                    placeholder="HVAC Installation, Electrical Repair, etc."
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
                    disabled={customersLoading}
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
                    Job Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Detailed description of the work to be performed..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Status
                  </label>
                  <select
                    value={formData.job_status}
                    onChange={(e) => setFormData({...formData, job_status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Schedule & Assignment */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  Schedule & Assignment
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Technician
                  </label>
                  <select
                    value={formData.assigned_technician_id || ''}
                    onChange={(e) => setFormData({...formData, assigned_technician_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select technician</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_start ? formData.scheduled_start.slice(0, 16) : ''}
                      onChange={(e) => setFormData({...formData, scheduled_start: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_end ? formData.scheduled_end.slice(0, 16) : ''}
                      onChange={(e) => setFormData({...formData, scheduled_end: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Job Address - 4 separate fields like customer address */}
                <div className="space-y-4">
                  <h5 className="text-sm font-medium text-gray-900">Job Address</h5>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.street_address || ''}
                      onChange={(e) => setFormData({...formData, street_address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.state || ''}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="State"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={formData.zip_code || ''}
                        onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="12345"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Items Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
                  <CurrencyDollarIcon className="w-5 h-5" />
                  Job Items & Pricing
                </h4>
                <button
                  type="button"
                  onClick={addJobItem}
                  className="btn-secondary flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {formData.job_items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={item.item_type || 'labor'}
                          onChange={(e) => updateJobItem(index, 'item_type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                          onChange={(e) => updateJobItem(index, 'item_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Description of work/item"
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
                          onChange={(e) => updateJobItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rate ($)
                          {item.item_type === 'labor' && item.is_overtime && ' (OT)'}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.rate}
                          onChange={(e) => updateJobItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total
                          {(item.item_type === 'part' || item.item_type === 'material') && ` (+${rates.markup}%)`}
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-medium">
                          ${calculateItemTotal(item).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeJobItem(index)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          disabled={formData.job_items.length === 1}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {item.item_type === 'labor' && (
                      <div className="mt-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.is_overtime || false}
                            onChange={(e) => updateJobItem(index, 'is_overtime', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Overtime Rate</span>
                        </label>
                      </div>
                    )}
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
                    <span>Tax ({rates.tax}%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Total Items: {formData.job_items.filter(item => item.item_name.trim()).length}
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
                  {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Job' : 'Create Job')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Job Templates Modal */}
      {showTemplates && (
        <JobTemplates
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
          selectedPricingModel={formData.pricing_model || 'all'}
        />
      )}
    </div>
  );
};
