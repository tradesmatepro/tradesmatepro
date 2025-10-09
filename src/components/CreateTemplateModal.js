import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon,
  DocumentDuplicateIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../contexts/UserContext';
import JobTemplatesService from '../services/JobTemplatesService';

const CreateTemplateModal = ({ onClose, onCreated }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General',
    default_pricing_model: 'TIME_MATERIALS',
    default_duration: 120, // minutes
    default_crew_size: 1,
    default_hourly_rate: 75.00,
    default_markup_percentage: 30.00,
    // Pricing model specific defaults
    flat_rate_amount: 0,
    unit_price: 0,
    recurring_interval: 'MONTHLY',
    recurring_rate: 0,
    percentage: 10,
    percentage_base_amount: 1000,
    is_active: true
  });
  
  const [templateItems, setTemplateItems] = useState([
    {
      item_type: 'labor',
      name: 'Standard Labor',
      description: '',
      quantity: 1,
      unit: 'hour',
      unit_price: 75.00,
      estimated_hours: 2,
      labor_rate: 75.00,
      is_required: true
    }
  ]);
  
  const [templateChecklists, setTemplateChecklists] = useState([
    {
      stage: 'PREPARATION',
      task_name: 'Gather tools and materials',
      description: 'Collect all necessary tools and materials for the job',
      estimated_minutes: 15,
      is_required: true,
      sort_order: 1
    }
  ]);

  const categories = ['HVAC', 'Plumbing', 'Electrical', 'General'];
  const pricingModels = [
    { value: 'TIME_MATERIALS', label: 'Time & Materials', description: 'Charge for time spent + materials used' },
    { value: 'FLAT_RATE', label: 'Flat Rate', description: 'Fixed price for the entire job' },
    { value: 'UNIT', label: 'Unit-Based', description: 'Price per unit (sq ft, room, etc.)' },
    { value: 'RECURRING', label: 'Recurring', description: 'Subscription/maintenance contracts' },
    { value: 'MILESTONE', label: 'Milestone', description: 'Progress-based payments' },
    { value: 'PERCENTAGE', label: 'Percentage', description: 'Percentage of base amount' }
  ];

  const itemTypes = [
    { value: 'labor', label: 'Labor', icon: UserGroupIcon },
    { value: 'material', label: 'Material', icon: TagIcon },
    { value: 'part', label: 'Part', icon: TagIcon },
    { value: 'service', label: 'Service', icon: DocumentDuplicateIcon }
  ];

  const stages = ['PREPARATION', 'EXECUTION', 'COMPLETION', 'CLEANUP'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const templateData = {
        ...formData,
        company_id: user.company_id,
        created_by: user.id,
        template_items: templateItems,
        template_checklists: templateChecklists
      };

      await JobTemplatesService.createJobTemplate(templateData, user.company_id);
      onCreated();
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTemplateItem = () => {
    setTemplateItems([...templateItems, {
      item_type: 'material',
      name: '',
      description: '',
      quantity: 1,
      unit: 'each',
      unit_price: 0,
      estimated_hours: 0,
      labor_rate: formData.default_hourly_rate,
      is_required: false
    }]);
  };

  const removeTemplateItem = (index) => {
    setTemplateItems(templateItems.filter((_, i) => i !== index));
  };

  const updateTemplateItem = (index, field, value) => {
    const updated = [...templateItems];
    updated[index] = { ...updated[index], [field]: value };
    setTemplateItems(updated);
  };

  const addChecklistItem = () => {
    setTemplateChecklists([...templateChecklists, {
      stage: 'EXECUTION',
      task_name: '',
      description: '',
      estimated_minutes: 10,
      is_required: false,
      sort_order: templateChecklists.length + 1
    }]);
  };

  const removeChecklistItem = (index) => {
    setTemplateChecklists(templateChecklists.filter((_, i) => i !== index));
  };

  const updateChecklistItem = (index, field, value) => {
    const updated = [...templateChecklists];
    updated[index] = { ...updated[index], [field]: value };
    setTemplateChecklists(updated);
  };

  const getPricingModelColor = (model) => {
    const colors = {
      'TIME_MATERIALS': 'bg-green-100 text-green-800 border-green-200',
      'FLAT_RATE': 'bg-blue-100 text-blue-800 border-blue-200',
      'UNIT': 'bg-purple-100 text-purple-800 border-purple-200',
      'RECURRING': 'bg-orange-100 text-orange-800 border-orange-200',
      'MILESTONE': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'PERCENTAGE': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[model] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Job Template</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a reusable template with pricing model integration
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <DocumentDuplicateIcon className="w-5 h-5" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., HVAC System Installation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe what this template is used for..."
                  />
                </div>
              </div>
            </div>

            {/* Pricing Model Selection */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5" />
                Pricing Model Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {pricingModels.map(model => (
                  <div
                    key={model.value}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.default_pricing_model === model.value
                        ? getPricingModelColor(model.value)
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData({ ...formData, default_pricing_model: model.value })}
                  >
                    <div className="font-medium text-sm mb-1">{model.label}</div>
                    <div className="text-xs text-gray-600">{model.description}</div>
                  </div>
                ))}
              </div>

              {/* Pricing Model Specific Fields */}
              {formData.default_pricing_model === 'FLAT_RATE' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Flat Rate Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.flat_rate_amount}
                      onChange={(e) => setFormData({ ...formData, flat_rate_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}

              {formData.default_pricing_model === 'UNIT' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Unit Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}

              {formData.default_pricing_model === 'RECURRING' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Recurring Interval
                    </label>
                    <select
                      value={formData.recurring_interval}
                      onChange={(e) => setFormData({ ...formData, recurring_interval: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Recurring Rate
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.recurring_rate}
                      onChange={(e) => setFormData({ ...formData, recurring_rate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}

              {formData.default_pricing_model === 'PERCENTAGE' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Percentage
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Base Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.percentage_base_amount}
                      onChange={(e) => setFormData({ ...formData, percentage_base_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Job Defaults */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Job Defaults
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.default_duration}
                    onChange={(e) => setFormData({ ...formData, default_duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Crew Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.default_crew_size}
                    onChange={(e) => setFormData({ ...formData, default_crew_size: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Hourly Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.default_hourly_rate}
                    onChange={(e) => setFormData({ ...formData, default_hourly_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Template Items */}
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <TagIcon className="w-5 h-5" />
                  Template Items
                </h3>
                <button
                  type="button"
                  onClick={addTemplateItem}
                  className="btn-secondary flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {templateItems.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={item.item_type}
                            onChange={(e) => updateTemplateItem(index, 'item_type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            {itemTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateTemplateItem(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Item name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateTemplateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateTemplateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeTemplateItem(index)}
                        className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateTemplateItem(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Item description"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.is_required}
                            onChange={(e) => updateTemplateItem(index, 'is_required', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Required item</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Checklist */}
            <div className="bg-orange-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <DocumentDuplicateIcon className="w-5 h-5" />
                  Workflow Checklist
                </h3>
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="btn-secondary flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Task
                </button>
              </div>

              <div className="space-y-4">
                {templateChecklists.map((task, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                          <select
                            value={task.stage}
                            onChange={(e) => updateChecklistItem(index, 'stage', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            {stages.map(stage => (
                              <option key={stage} value={stage}>{stage}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                          <input
                            type="text"
                            value={task.task_name}
                            onChange={(e) => updateChecklistItem(index, 'task_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Task name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Est. Minutes</label>
                          <input
                            type="number"
                            min="0"
                            value={task.estimated_minutes}
                            onChange={(e) => updateChecklistItem(index, 'estimated_minutes', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeChecklistItem(index)}
                        className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={task.description}
                          onChange={(e) => updateChecklistItem(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Task description"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={task.is_required}
                            onChange={(e) => updateChecklistItem(index, 'is_required', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Required task</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplateModal;
