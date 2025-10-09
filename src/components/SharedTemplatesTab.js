import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useUser } from '../contexts/UserContext';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TagIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import TemplatePreviewModal from './TemplatePreviewModal';

const SharedTemplatesTab = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [allTemplates, setAllTemplates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterTags, setFilterTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Template categories
  const categories = [
    { value: 'quotes', label: 'Quotes' },
    { value: 'invoices', label: 'Invoices' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'safety', label: 'Safety' },
    { value: 'reports', label: 'Reports' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadSharedTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [allTemplates, searchTerm, filterCategory, filterTags]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const loadSharedTemplates = async () => {
    try {
      setLoading(true);

      // Load all shared templates
      const { data, error } = await supabase
        .from('shared_document_templates')
        .select('id, name, category, tags, content, created_at, updated_at')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        setAllTemplates(data);

        // Extract all unique tags for filter options
        const allTags = new Set();
        data.forEach(template => {
          if (template.tags && Array.isArray(template.tags)) {
            template.tags.forEach(tag => allTags.add(tag));
          }
        });
        setAvailableTags(Array.from(allTags).sort());
      }
    } catch (error) {
      console.error('Error loading shared templates:', error);
      let errorMessage = 'Failed to load shared templates';

      if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      // Check for common RLS or table access issues
      if (error.message && error.message.includes('permission denied')) {
        errorMessage = 'Access denied to shared templates. Please check Row Level Security settings.';
      } else if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
        errorMessage = 'Shared templates table not found. Please check database setup.';
      }

      showAlert('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...allTemplates];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.content.toLowerCase().includes(searchLower) ||
        (template.category && template.category.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(template => template.category === filterCategory);
    }

    // Apply tag filter
    if (filterTags.length > 0) {
      filtered = filtered.filter(template =>
        template.tags &&
        Array.isArray(template.tags) &&
        filterTags.some(tag => template.tags.includes(tag))
      );
    }

    setTemplates(filtered);
  };

  const copyTemplate = async (template) => {
    if (!user?.company_id) {
      showAlert('error', 'You must be logged in to copy templates');
      return;
    }

    try {
      setSaving(true);

      // Copy template to company's document_templates using Supabase
      const { data, error } = await supabase
        .from('document_templates')
        .insert({
          company_id: user.company_id,
          name: `${template.name} (Copy)`,
          category: template.category,
          content: template.content,
          is_default: false
        })
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        showAlert('success', `Template "${template.name}" copied to your templates`);
      }
    } catch (error) {
      console.error('Error copying template:', error);
      showAlert('error', `Failed to copy template: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const toggleTagFilter = (tag) => {
    setFilterTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('all');
    setFilterTags([]);
  };



  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-lg border ${
          alert.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {alert.type === 'success' ? (
              <CheckIcon className="w-5 h-5 mr-2" />
            ) : (
              <XMarkIcon className="w-5 h-5 mr-2" />
            )}
            {alert.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GlobeAltIcon className="w-7 h-7 text-blue-600" />
            Shared Templates
          </h2>
          <p className="text-gray-600 mt-1">Browse and use community-contributed document templates</p>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">Important Notice</h3>
            <p className="text-sm text-amber-700 mt-1">
              These templates are provided for free use by the community. Please verify all information for accuracy and compliance in your location. No guarantees are made regarding legal compliance or suitability for your specific business needs.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates by name or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-center justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Tag Filters */}
        {availableTags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              Filter by Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTagFilter(tag)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterTags.includes(tag)
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                  {filterTags.includes(tag) && (
                    <XMarkIcon className="w-3 h-3 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {templates.length} template{templates.length !== 1 ? 's' : ''} found
            {(searchTerm || filterCategory !== 'all' || filterTags.length > 0) && (
              <span className="ml-1">matching your filters</span>
            )}
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCategory !== 'all' || filterTags.length > 0
              ? 'Try adjusting your search or filter criteria'
              : allTemplates.length === 0
                ? 'No shared templates are available at this time. This could be due to database setup or access permissions.'
                : 'No templates match your current filters'
            }
          </p>
          {(searchTerm || filterCategory !== 'all' || filterTags.length > 0) && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                          <div className="text-sm text-gray-500">
                            Created {new Date(template.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {template.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {template.tags && template.tags.length > 0 ? (
                          template.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No tags</span>
                        )}
                        {template.tags && template.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{template.tags.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {template.content ? template.content.substring(0, 150) + '...' : 'No content preview'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handlePreview(template)}
                          className="text-blue-600 hover:text-blue-700 p-1 rounded"
                          title="Preview Template"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyTemplate(template)}
                          disabled={saving}
                          className="text-green-600 hover:text-green-700 p-1 rounded disabled:opacity-50"
                          title="Use Template"
                        >
                          <DocumentDuplicateIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setPreviewTemplate(null);
        }}
        template={previewTemplate}
        onUseTemplate={copyTemplate}
        saving={saving}
      />

      {/* Save Status */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Copying template...</span>
        </div>
      )}
    </div>
  );
};

export default SharedTemplatesTab;
