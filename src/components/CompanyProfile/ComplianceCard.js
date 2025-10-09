import React, { useState } from 'react';
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const ComplianceCard = ({ data, setData, errors }) => {
  const [showFields, setShowFields] = useState({
    tax_id: false,
    ein: false,
    duns: false
  });

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const toggleVisibility = (field) => {
    setShowFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const maskValue = (value, field) => {
    if (!value || showFields[field]) return value;
    if (value.length <= 4) return value;
    return '*'.repeat(value.length - 4) + value.slice(-4);
  };

  const formatTaxId = (value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '-' + cleaned.slice(2, 9);
    }
    return cleaned;
  };

  const formatEIN = (value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '-' + cleaned.slice(2, 9);
    }
    return cleaned;
  };

  const getCompletionCount = () => {
    let count = 0;
    if (data.tax_id) count++;
    if (data.registration_numbers?.ein) count++;
    if (data.registration_numbers?.duns) count++;
    if (data.registration_numbers?.business_license) count++;
    return count;
  };

  const completionCount = getCompletionCount();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <LockClosedIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Compliance & Registration</h3>
            <p className="text-sm text-gray-600">Tax IDs and business registration numbers</p>
          </div>
          {completionCount > 0 && (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">{completionCount} of 4</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tax ID */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Tax ID / EIN
                <span className="ml-2 inline-flex items-center text-xs text-amber-600">
                  <InformationCircleIcon className="w-3 h-3 mr-1" />
                  Federal tax identification
                </span>
              </label>
              <button
                type="button"
                onClick={() => toggleVisibility('tax_id')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title={showFields.tax_id ? 'Hide Tax ID' : 'Show Tax ID'}
              >
                {showFields.tax_id ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={showFields.tax_id ? "text" : "password"}
                value={showFields.tax_id ? data.tax_id : maskValue(data.tax_id, 'tax_id')}
                onChange={(e) => {
                  if (showFields.tax_id) {
                    handleInputChange('tax_id', formatTaxId(e.target.value));
                  }
                }}
                readOnly={!showFields.tax_id}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                placeholder="XX-XXXXXXX"
              />
              <LockClosedIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* EIN */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Employer ID (EIN)
                <span className="ml-2 inline-flex items-center text-xs text-amber-600">
                  <InformationCircleIcon className="w-3 h-3 mr-1" />
                  For payroll and taxes
                </span>
              </label>
              <button
                type="button"
                onClick={() => toggleVisibility('ein')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showFields.ein ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={showFields.ein ? "text" : "password"}
                value={showFields.ein ? data.registration_numbers?.ein || '' : maskValue(data.registration_numbers?.ein || '', 'ein')}
                onChange={(e) => {
                  if (showFields.ein) {
                    handleInputChange('registration_numbers.ein', formatEIN(e.target.value));
                  }
                }}
                readOnly={!showFields.ein}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                placeholder="XX-XXXXXXX"
              />
              <DocumentTextIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* DUNS Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DUNS Number
              <span className="ml-2 inline-flex items-center text-xs text-amber-600">
                <InformationCircleIcon className="w-3 h-3 mr-1" />
                Dun & Bradstreet identifier
              </span>
            </label>
            <input
              type="text"
              value={data.registration_numbers?.duns || ''}
              onChange={(e) => handleInputChange('registration_numbers.duns', e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              placeholder="123456789"
              maxLength="9"
            />
          </div>

          {/* Business License */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business License #
              <span className="ml-2 inline-flex items-center text-xs text-amber-600">
                <InformationCircleIcon className="w-3 h-3 mr-1" />
                Local business permit
              </span>
            </label>
            <input
              type="text"
              value={data.registration_numbers?.business_license || ''}
              onChange={(e) => handleInputChange('registration_numbers.business_license', e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
              placeholder="BL-123456"
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <ShieldExclamationIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-900 mb-1">Security & Privacy</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• All sensitive information is encrypted and securely stored</li>
                <li>• Only you and authorized administrators can view this data</li>
                <li>• Used for tax reporting, compliance, and official documents</li>
                <li>• Never share these numbers with unauthorized parties</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Compliance Status */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`text-center p-3 rounded-lg ${data.tax_id ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className={`text-lg font-semibold ${data.tax_id ? 'text-green-900' : 'text-gray-500'}`}>
              {data.tax_id ? '✓' : '○'}
            </div>
            <div className="text-sm text-gray-700">Tax ID</div>
          </div>
          
          <div className={`text-center p-3 rounded-lg ${data.registration_numbers?.ein ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className={`text-lg font-semibold ${data.registration_numbers?.ein ? 'text-green-900' : 'text-gray-500'}`}>
              {data.registration_numbers?.ein ? '✓' : '○'}
            </div>
            <div className="text-sm text-gray-700">EIN</div>
          </div>
          
          <div className={`text-center p-3 rounded-lg ${data.registration_numbers?.duns ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className={`text-lg font-semibold ${data.registration_numbers?.duns ? 'text-green-900' : 'text-gray-500'}`}>
              {data.registration_numbers?.duns ? '✓' : '○'}
            </div>
            <div className="text-sm text-gray-700">DUNS</div>
          </div>
          
          <div className={`text-center p-3 rounded-lg ${data.registration_numbers?.business_license ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className={`text-lg font-semibold ${data.registration_numbers?.business_license ? 'text-green-900' : 'text-gray-500'}`}>
              {data.registration_numbers?.business_license ? '✓' : '○'}
            </div>
            <div className="text-sm text-gray-700">License</div>
          </div>
        </div>

        {/* Information */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">About These Numbers</h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Tax ID/EIN:</strong> Required for tax filings and business banking</p>
            <p><strong>DUNS:</strong> Used for government contracts and business credit</p>
            <p><strong>Business License:</strong> Local permit to operate your business</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceCard;
