import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../contexts/UserContext';
import JobTemplatesService from '../services/JobTemplatesService';
import CreateTemplateModal from './CreateTemplateModal';

const JobTemplates = ({ onSelectTemplate, onClose, selectedCategory = 'all', selectedPricingModel = 'all' }) => {
  const { user } = useUser();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(selectedCategory);
  const [selectedPricingModelFilter, setSelectedPricingModelFilter] = useState(selectedPricingModel);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [templateStats, setTemplateStats] = useState(null);

  useEffect(() => {
    if (user?.company_id) {
      loadTemplates();
      loadCategories();
      loadStats();
    }
  }, [user?.company_id, selectedCategoryFilter]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await JobTemplatesService.getJobTemplates(
        user.company_id, 
        selectedCategoryFilter
      );
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await JobTemplatesService.getTemplateCategories(user.company_id);
      setCategories(['all', ...cats]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await JobTemplatesService.getTemplateStats(user.company_id);
      setTemplateStats(stats);
    } catch (error) {
      console.error('Error loading template stats:', error);
    }
  };

  const handleSelectTemplate = async (template) => {
    try {
      // Get full template with items
      const fullTemplate = await JobTemplatesService.getJobTemplateWithItems(
        template.id, 
        user.company_id
      );
      onSelectTemplate(fullTemplate);
    } catch (error) {
      console.error('Error loading template details:', error);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Not set';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'HVAC': 'bg-blue-100 text-blue-800',
      'Plumbing': 'bg-cyan-100 text-cyan-800',
      'Electrical': 'bg-yellow-100 text-yellow-800',
      'General': 'bg-gray-100 text-gray-800',
      'default': 'bg-purple-100 text-purple-800'
    };
    return colors[category] || colors.default;
  };

  const getPricingModelColor = (model) => {
    const colors = {
      'TIME_MATERIALS': 'bg-green-100 text-green-800',
      'FLAT_RATE': 'bg-blue-100 text-blue-800',
      'UNIT': 'bg-purple-100 text-purple-800',
      'RECURRING': 'bg-orange-100 text-orange-800',
      'MILESTONE': 'bg-indigo-100 text-indigo-800',
      'PERCENTAGE': 'bg-pink-100 text-pink-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[model] || colors.default;
  };

  const getPricingModelLabel = (model) => {
    const labels = {
      'TIME_MATERIALS': 'Time & Materials',
      'FLAT_RATE': 'Flat Rate',
      'UNIT': 'Unit-Based',
      'RECURRING': 'Recurring',
      'MILESTONE': 'Milestone',
      'PERCENTAGE': 'Percentage'
    };
    return labels[model] || model;
  };

  // Filter templates by category and pricing model
  const filteredTemplates = templates.filter(template => {
    // Category filter
    if (selectedCategoryFilter !== 'all' && template.category !== selectedCategoryFilter) {
      return false;
    }

    // Pricing model filter
    if (selectedPricingModelFilter !== 'all' && template.default_pricing_model !== selectedPricingModelFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Job Templates</h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose a template to quickly create standardized jobs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              New Template
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        {templateStats && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <DocumentDuplicateIcon className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{templateStats.total_templates}</span>
                <span className="text-gray-600">templates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="font-medium">{templateStats.total_usage}</span>
                <span className="text-gray-600">times used</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex items-center gap-2 overflow-x-auto">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategoryFilter(category)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedCategoryFilter === category
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Model Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Model</label>
            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { value: 'all', label: 'All Models' },
                { value: 'TIME_MATERIALS', label: 'Time & Materials' },
                { value: 'FLAT_RATE', label: 'Flat Rate' },
                { value: 'UNIT', label: 'Unit-Based' },
                { value: 'RECURRING', label: 'Recurring' },
                { value: 'MILESTONE', label: 'Milestone' },
                { value: 'PERCENTAGE', label: 'Percentage' }
              ].map(model => (
                <button
                  key={model.value}
                  onClick={() => setSelectedPricingModelFilter(model.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedPricingModelFilter === model.value
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {model.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <DocumentDuplicateIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600 mb-4">
                {selectedCategoryFilter === 'all' && selectedPricingModelFilter === 'all'
                  ? 'Create your first job template to standardize your workflow'
                  : `No templates found matching your filters`
                }
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                Create Template
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleSelectTemplate(template)}
                >
                  {/* Template Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {template.category && (
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                            {template.category}
                          </span>
                        )}
                        {template.default_pricing_model && (
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPricingModelColor(template.default_pricing_model)}`}>
                            {getPricingModelLabel(template.default_pricing_model)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Edit template
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <PencilIcon className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Template Description */}
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Template Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatDuration(template.default_duration)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{template.default_crew_size} crew member{template.default_crew_size !== 1 ? 's' : ''}</span>
                    </div>
                    {template.default_hourly_rate && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span>${template.default_hourly_rate}/hour</span>
                      </div>
                    )}
                  </div>

                  {/* Usage Stats */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Used {template.usage_count || 0} times</span>
                      <span>Click to use</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Select a template to pre-fill job details and items
            </p>
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Create Template Modal */}
      {showCreateForm && (
        <CreateTemplateModal
          onClose={() => setShowCreateForm(false)}
          onCreated={() => {
            setShowCreateForm(false);
            loadTemplates();
          }}
        />
      )}
    </div>
  );
};

export default JobTemplates;
