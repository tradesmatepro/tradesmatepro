import React from 'react';
import {
  XMarkIcon,
  DocumentTextIcon,
  TagIcon,
  DocumentDuplicateIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const TemplatePreviewModal = ({ 
  isOpen, 
  onClose, 
  template, 
  onUseTemplate,
  saving = false 
}) => {
  if (!isOpen || !template) return null;

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
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {template.category}
                    </span>
                    <span className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      Created {new Date(template.created_at).toLocaleDateString()}
                    </span>
                  </div>
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

          {/* Content */}
          <div className="bg-white px-6 py-6">
            {/* Tags */}
            {template.tags && template.tags.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <TagIcon className="w-4 h-4" />
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Template Content */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Template Content</h4>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                    {template.content || 'No content available'}
                  </pre>
                </div>
              </div>
            </div>

            {/* Placeholder Information */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="text-sm font-medium text-blue-800 mb-2">About Placeholders</h5>
              <p className="text-sm text-blue-700">
                This template may contain placeholders like <code className="bg-blue-100 px-1 rounded">{'{{customer_name}}'}</code> or <code className="bg-blue-100 px-1 rounded">{'{{invoice_total}}'}</code>. 
                When you use this template, you can replace these placeholders with your actual data or use our template editor to customize them further.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>This template will be copied to your company's templates where you can customize it further.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => onUseTemplate(template)}
                disabled={saving}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  saving
                    ? 'bg-green-400 text-white cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                {saving ? 'Copying...' : 'Use This Template'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewModal;
