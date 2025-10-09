import React, { useState, useEffect } from 'react';
import { supaFetch } from '../utils/supaFetch';
import { useUser } from '../contexts/UserContext';
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import TemplateEditorModal from './TemplateEditorModal';

const DocumentTemplatesTab = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [templates, setTemplates] = useState([]);
  const [defaultTemplates, setDefaultTemplates] = useState({});
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, template: null });

  // Template categories
  const categories = [
    { value: 'quotes', label: 'Quotes' },
    { value: 'invoices', label: 'Invoices' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'safety', label: 'Safety' },
    { value: 'reports', label: 'Reports' },
    { value: 'other', label: 'Other' }
  ];

  // Default template structure
  const defaultTemplateTypes = [
    {
      key: 'quote_terms',
      category: 'quotes',
      name: 'Quote Terms & Conditions',
      description: 'Default terms and conditions for quotes',
      placeholder: 'Enter your standard quote terms and conditions...'
    },
    {
      key: 'invoice_footer',
      category: 'invoices', 
      name: 'Invoice Footer',
      description: 'Text that appears at the bottom of invoices',
      placeholder: 'Thank you for your business!'
    },
    {
      key: 'invoice_terms',
      category: 'invoices',
      name: 'Invoice Payment Terms',
      description: 'Default payment terms for invoices',
      placeholder: 'Payment due within 30 days'
    }
  ];

  useEffect(() => {
    if (user?.company_id) {
      loadTemplates();
    }
  }, [user?.company_id]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await supaFetch(
        'document_templates?select=*&order=updated_at.desc',
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
        
        // Extract default templates
        const defaults = {};
        data.forEach(template => {
          if (template.is_default) {
            defaults[template.category] = template;
          }
        });
        setDefaultTemplates(defaults);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      showAlert('error', 'Failed to load document templates');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (templateData) => {
    try {
      setSaving(true);
      
      if (editingTemplate) {
        // Update existing template
        const response = await supaFetch(
          `document_templates?id=eq.${editingTemplate.id}`,
          {
            method: 'PATCH',
            body: {
              ...templateData,
              updated_at: new Date().toISOString()
            },
            headers: { 'Prefer': 'return=minimal' }
          },
          user.company_id
        );

        if (!response.ok) {
          throw new Error('Failed to update template');
        }
      } else {
        // Create new template
        const response = await supaFetch(
          'document_templates',
          {
            method: 'POST',
            body: {
              ...templateData,
              company_id: user.company_id
            }
          },
          user.company_id
        );

        if (!response.ok) {
          throw new Error('Failed to create template');
        }
      }

      showAlert('success', `Template ${editingTemplate ? 'updated' : 'created'} successfully`);
      setShowEditor(false);
      setEditingTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      showAlert('error', `Failed to ${editingTemplate ? 'update' : 'create'} template`);
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (templateId) => {
    try {
      const response = await supaFetch(
        `document_templates?id=eq.${templateId}`,
        { method: 'DELETE' },
        user.company_id
      );

      if (response.ok) {
        showAlert('success', 'Template deleted successfully');
        setDeleteConfirm({ show: false, template: null });
        loadTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      showAlert('error', 'Failed to delete template');
    }
  };

  const setAsDefault = async (template) => {
    try {
      // First, unset any existing default for this category
      await supaFetch(
        `document_templates?category=eq.${template.category}`,
        {
          method: 'PATCH',
          body: { is_default: false },
          headers: { 'Prefer': 'return=minimal' }
        },
        user.company_id
      );

      // Then set this template as default
      await supaFetch(
        `document_templates?id=eq.${template.id}`,
        {
          method: 'PATCH',
          body: { is_default: true },
          headers: { 'Prefer': 'return=minimal' }
        },
        user.company_id
      );

      showAlert('success', 'Default template updated');
      loadTemplates();
    } catch (error) {
      console.error('Error setting default template:', error);
      showAlert('error', 'Failed to set default template');
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading document templates...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
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
          <h2 className="text-2xl font-bold text-gray-900">Document Templates</h2>
          <p className="text-gray-600 mt-1">Manage templates for quotes, invoices, and other documents</p>
        </div>
        <button
          onClick={() => {
            setEditingTemplate(null);
            setShowEditor(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Template
        </button>
      </div>

      {/* Default Templates Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <StarSolidIcon className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Default Templates</h3>
              <p className="text-sm text-gray-600">Quick access to your most commonly used templates</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {defaultTemplateTypes.map((defaultType) => {
              const template = defaultTemplates[defaultType.category];
              return (
                <div key={defaultType.key} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{defaultType.name}</h4>
                    {template && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckIcon className="w-3 h-3 mr-1" />
                        Set
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{defaultType.description}</p>
                  {template ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Current: {template.name}</div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingTemplate(template);
                            setShowEditor(true);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setAsDefault({ ...template, is_default: false })}
                          className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                        >
                          Clear Default
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No default template set for {defaultType.category}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom Templates Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <DocumentTextIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Custom Templates</h3>
                <p className="text-sm text-gray-600">All your document templates</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {/* Category Filter */}
              <div className="relative">
                <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterCategory !== 'all' ? 'No templates found' : 'No templates yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first document template to get started'
                }
              </p>
              {!searchTerm && filterCategory === 'all' && (
                <button
                  onClick={() => {
                    setEditingTemplate(null);
                    setShowEditor(true);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Template
                </button>
              )}
            </div>
          ) : (
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
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Default
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTemplates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{template.name}</div>
                            <div className="text-sm text-gray-500">
                              {template.content ? `${template.content.substring(0, 50)}...` : 'No content'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {template.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(template.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setAsDefault(template)}
                          className={`inline-flex items-center ${
                            template.is_default
                              ? 'text-amber-600 hover:text-amber-700'
                              : 'text-gray-400 hover:text-amber-600'
                          } transition-colors`}
                        >
                          {template.is_default ? (
                            <StarSolidIcon className="w-5 h-5" />
                          ) : (
                            <StarIcon className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingTemplate(template);
                              setShowEditor(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 p-1 rounded"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ show: true, template })}
                            className="text-red-600 hover:text-red-700 p-1 rounded"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Template
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{deleteConfirm.template?.name}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => deleteTemplate(deleteConfirm.template?.id)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm({ show: false, template: null })}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Editor Modal */}
      <TemplateEditorModal
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingTemplate(null);
        }}
        onSave={saveTemplate}
        template={editingTemplate}
        saving={saving}
      />

      {/* Save Status */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Saving...</span>
        </div>
      )}
    </div>
  );
};

export default DocumentTemplatesTab;
