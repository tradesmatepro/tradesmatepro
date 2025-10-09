import React, { useState } from 'react';
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

const TaxIdCard = ({ data, setData, errors }) => {
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

  const formatTaxId = (taxId) => {
    // Remove all non-alphanumeric characters
    const cleaned = taxId.replace(/[^a-zA-Z0-9]/g, '');
    
    // Format as XX-XXXXXXX for EIN
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '-' + cleaned.slice(2, 9);
    }
    return cleaned;
  };

  const handleTaxIdChange = (value) => {
    // Only allow alphanumeric characters and format
    const formatted = formatTaxId(value);
    handleInputChange('tax_id', formatted);
  };

  return (
    <div className="space-y-8">
      {/* Tax ID Input */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-lg font-bold text-gray-800 flex items-center">
            <LockClosedIcon className="w-6 h-6 mr-3 text-red-500" />
            Tax ID / EIN
            <span className="ml-2 text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowTaxId(!showTaxId)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
            title={showTaxId ? 'Hide Tax ID' : 'Show Tax ID'}
          >
            {showTaxId ? (
              <>
                <EyeSlashIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Hide</span>
              </>
            ) : (
              <>
                <EyeIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Show</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <input
            type={showTaxId ? "text" : "password"}
            value={showTaxId ? data.tax_id : maskTaxId(data.tax_id)}
            onChange={(e) => {
              if (showTaxId) {
                handleTaxIdChange(e.target.value);
              }
            }}
            readOnly={!showTaxId}
            className="w-full pl-12 pr-4 py-4 border-3 border-gray-200 rounded-2xl text-xl font-mono transition-all duration-300 hover:border-red-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 bg-white"
            placeholder="XX-XXXXXXX"
            maxLength="10"
          />
          <LockClosedIcon className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
        </div>

        <p className="mt-3 text-gray-600 text-sm">
          {showTaxId
            ? 'Format: XX-XXXXXXX (e.g., 12-3456789)'
            : 'Click "Show" to view and edit your Tax ID'
          }
        </p>

        {/* Tax ID Status */}
        {data.tax_id ? (
          <div className="mt-4 flex items-center space-x-3 bg-green-50 p-3 rounded-xl border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-700 font-medium">Tax ID provided</span>
            <span className="text-gray-600">
              (Last 4 digits: {data.tax_id.slice(-4) || 'XXXX'})
            </span>
          </div>
        ) : (
          <div className="mt-4 flex items-center space-x-3 bg-yellow-50 p-3 rounded-xl border border-yellow-200">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-700 font-medium">Tax ID not provided</span>
            <span className="text-gray-600">
              (Recommended for business operations)
            </span>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <ShieldExclamationIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-red-900 mb-3">Security & Privacy</h4>
            <ul className="text-red-800 space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Your Tax ID is encrypted and securely stored</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Only you and authorized administrators can view this information</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Used for tax reporting and official business documents</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Never share your Tax ID with unauthorized parties</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tax ID Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
        <h4 className="text-lg font-bold text-blue-900 mb-3">About Tax ID / EIN</h4>
        <div className="text-blue-800 space-y-3">
          <p>
            Your Employer Identification Number (EIN) is a unique 9-digit number assigned by the IRS
            to identify your business for tax purposes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h5 className="font-semibold mb-2">Required For:</h5>
              <ul className="space-y-1 text-sm">
                <li>• Tax filings and returns</li>
                <li>• Business bank accounts</li>
                <li>• Hiring employees</li>
                <li>• Official documentation</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Format:</h5>
              <ul className="space-y-1 text-sm">
                <li>• 9 digits total</li>
                <li>• Format: XX-XXXXXXX</li>
                <li>• Example: 12-3456789</li>
                <li>• No letters or symbols</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxIdCard;
