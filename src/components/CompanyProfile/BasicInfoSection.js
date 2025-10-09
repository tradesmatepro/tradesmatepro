import React, { useState } from 'react';
import {
  BuildingOfficeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const BasicInfoSection = ({ data, setData, errors, expanded, onToggle }) => {
  const [showTaxId, setShowTaxId] = useState(false);

  const handleInputChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const maskTaxId = (taxId) => {
    if (!taxId) return '';
    if (taxId.length <= 4) return taxId;
    return '*'.repeat(taxId.length - 4) + taxId.slice(-4);
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
            <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              <p className="text-sm text-gray-600">Company name, contact details, and tax information</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-transparent'
                }`}
                placeholder="Enter your company name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-transparent'
                }`}
                placeholder="company@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-transparent'
                }`}
                placeholder="(555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={data.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.website ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-transparent'
                }`}
                placeholder="https://www.yourcompany.com"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Must start with http:// or https://
              </p>
            </div>

            {/* Tax ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID / EIN
              </label>
              <div className="relative">
                <input
                  type={showTaxId ? "text" : "password"}
                  value={showTaxId ? data.tax_id : maskTaxId(data.tax_id)}
                  onChange={(e) => {
                    if (showTaxId) {
                      handleInputChange('tax_id', e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="XX-XXXXXXX"
                  readOnly={!showTaxId}
                />
                <button
                  type="button"
                  onClick={() => setShowTaxId(!showTaxId)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showTaxId ? (
                    <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {showTaxId ? 'Click the eye icon to hide' : 'Click the eye icon to edit'}
              </p>
            </div>
          </div>

          {/* Required Fields Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Required Information</h4>
                <p className="mt-1 text-sm text-blue-700">
                  Company name, email, and phone number are required. This information will appear on quotes, invoices, and other business documents.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicInfoSection;
