import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  StarIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const TemplateEditorModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  template, 
  saving = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    content: '',
    is_default: false
  });
  const [errors, setErrors] = useState({});
  const [showPlaceholders, setShowPlaceholders] = useState(false);

  // Available categories
  const categories = [
    { value: 'quotes', label: 'Quotes' },
    { value: 'invoices', label: 'Invoices' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'safety', label: 'Safety' },
    { value: 'reports', label: 'Reports' },
    { value: 'other', label: 'Other' }
  ];

  // Available placeholders
  const placeholders = [
    { category: 'Customer', items: [
      '{{customer_name}}', '{{customer_email}}', '{{customer_phone}}',
      '{{customer_address}}', '{{customer_city}}', '{{customer_state}}'
    ]},
    { category: 'Company', items: [
      '{{company_name}}', '{{company_phone}}', '{{company_email}}',
      '{{company_address}}', '{{company_website}}'
    ]},
    { category: 'Job/Quote', items: [
      '{{job_number}}', '{{quote_number}}', '{{job_date}}', '{{quote_date}}',
      '{{job_description}}', '{{total_amount}}', '{{labor_cost}}', '{{parts_cost}}'
    ]},
    { category: 'Invoice', items: [
      '{{invoice_number}}', '{{invoice_date}}', '{{due_date}}',
      '{{invoice_total}}', '{{tax_amount}}', '{{subtotal}}'
    ]},
    { category: 'Date/Time', items: [
      '{{current_date}}', '{{current_time}}', '{{current_year}}',
      '{{current_month}}', '{{current_day}}'
    ]}
  ];

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        category: template.category || 'other',
        content: template.content || '',
        is_default: template.is_default || false
      });
    } else {
      setFormData({
        name: '',
        category: 'other',
        content: '',
        is_default: false
      });
    }
    setErrors({});
  }, [template, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Template content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const insertPlaceholder = (placeholder) => {
    const textarea = document.getElementById('template-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    setFormData({
      ...formData,
      content: before + placeholder + after
    });
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {template ? 'Edit Template' : 'Create New Template'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {template ? 'Update your document template' : 'Create a new document template with placeholders'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white">
            <div className="px-6 py-6 space-y-6">
              {/* Template Name and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Standard Quote Terms"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>
              </div>

              {/* Set as Default Toggle */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_default: !formData.is_default })}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                    formData.is_default
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {formData.is_default ? (
                    <StarSolidIcon className="w-5 h-5" />
                  ) : (
                    <StarIcon className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">Set as Default Template</span>
                </button>
                <div className="group relative">
                  <InformationCircleIcon className="w-5 h-5 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    This will be used as the default template for this category
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Template Content *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPlaceholders(!showPlaceholders)}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <CodeBracketIcon className="w-4 h-4 mr-1" />
                    {showPlaceholders ? 'Hide' : 'Show'} Placeholders
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <textarea
                      id="template-content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={12}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                        errors.content ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter your template content here. Use {{placeholders}} for dynamic content..."
                    />
                    {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                  </div>
                  
                  {/* Placeholders Panel */}
                  {showPlaceholders && (
                    <div className="lg:col-span-1">
                      <div className="bg-gray-50 rounded-lg p-4 h-full overflow-y-auto max-h-80">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Available Placeholders</h4>
                        <div className="space-y-4">
                          {placeholders.map((group) => (
                            <div key={group.category}>
                              <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider">
                                {group.category}
                              </h5>
                              <div className="space-y-1">
                                {group.items.map((placeholder) => (
                                  <button
                                    key={placeholder}
                                    type="button"
                                    onClick={() => insertPlaceholder(placeholder)}
                                    className="block w-full text-left px-2 py-1 text-xs font-mono text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  >
                                    {placeholder}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  saving
                    ? 'bg-blue-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {saving ? 'Saving...' : (template ? 'Update Template' : 'Create Template')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditorModal;
