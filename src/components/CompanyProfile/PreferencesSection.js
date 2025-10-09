import React from 'react';
import {
  CogIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ClockIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const PreferencesSection = ({ data, setData, errors, expanded, onToggle }) => {
  const handleInputChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const invoiceTermsOptions = [
    { value: 'DUE_ON_RECEIPT', label: 'Due on Receipt', days: 0 },
    { value: 'NET_15', label: 'Net 15 Days', days: 15 },
    { value: 'NET_30', label: 'Net 30 Days', days: 30 },
    { value: 'NET_60', label: 'Net 60 Days', days: 60 }
  ];

  const handleInvoiceTermsChange = (terms) => {
    const selectedOption = invoiceTermsOptions.find(option => option.value === terms);
    handleInputChange('default_invoice_terms', terms);
    if (selectedOption) {
      handleInputChange('default_invoice_due_days', selectedOption.days);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Section Header */}
      <div 
        className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CogIcon className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
              <p className="text-sm text-gray-600">Default settings for invoicing and scheduling</p>
            </div>
          </div>
          {expanded ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>

      {/* Section Content */}
      {expanded && (
        <div className="px-6 py-6">
          <div className="space-y-8">
            {/* Invoice Settings */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                <h4 className="text-lg font-medium text-gray-900">Invoice Settings</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Default Invoice Terms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Payment Terms
                  </label>
                  <select
                    value={data.default_invoice_terms}
                    onChange={(e) => handleInvoiceTermsChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {invoiceTermsOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Default payment terms for new invoices
                  </p>
                </div>

                {/* Default Due Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Due Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={data.default_invoice_due_days}
                    onChange={(e) => handleInputChange('default_invoice_due_days', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.default_invoice_due_days ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-transparent'
                    }`}
                    placeholder="30"
                  />
                  {errors.default_invoice_due_days && (
                    <p className="mt-1 text-sm text-red-600">{errors.default_invoice_due_days}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Number of days customers have to pay invoices
                  </p>
                </div>
              </div>
            </div>

            {/* Scheduling Settings */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <CalendarDaysIcon className="w-5 h-5 text-gray-500" />
                <h4 className="text-lg font-medium text-gray-900">Scheduling Settings</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scheduling Buffer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Buffer Time (minutes)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="480"
                      step="15"
                      value={data.scheduling_buffer_minutes}
                      onChange={(e) => handleInputChange('scheduling_buffer_minutes', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="60"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">min</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Buffer time between scheduled jobs for travel and setup
                  </p>
                </div>

                {/* Quick Buffer Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Options
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[30, 60, 90, 120].map(minutes => (
                      <button
                        key={minutes}
                        type="button"
                        onClick={() => handleInputChange('scheduling_buffer_minutes', minutes)}
                        className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                          data.scheduling_buffer_minutes === minutes
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {minutes} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Info */}
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <CogIcon className="w-5 h-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-800">Default Preferences</h4>
                <p className="mt-1 text-sm text-green-700">
                  These settings will be used as defaults when creating new invoices and scheduling jobs. 
                  You can always override these settings for individual items.
                </p>
                <div className="mt-2">
                  <p className="text-sm text-green-700 font-medium">Current Settings:</p>
                  <ul className="mt-1 text-sm text-green-600 list-disc list-inside">
                    <li>Invoices: {invoiceTermsOptions.find(opt => opt.value === data.default_invoice_terms)?.label}</li>
                    <li>Buffer Time: {data.scheduling_buffer_minutes} minutes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreferencesSection;
