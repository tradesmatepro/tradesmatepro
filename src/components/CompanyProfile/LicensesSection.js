import React from 'react';
import {
  ShieldCheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const LicensesSection = ({ data, setData, errors, expanded, onToggle }) => {
  const handleLicenseChange = (index, value) => {
    const newLicenses = [...data.license_numbers];
    newLicenses[index] = value;
    setData(prev => ({
      ...prev,
      license_numbers: newLicenses
    }));
  };

  const addLicense = () => {
    setData(prev => ({
      ...prev,
      license_numbers: [...prev.license_numbers, '']
    }));
  };

  const removeLicense = (index) => {
    const newLicenses = data.license_numbers.filter((_, i) => i !== index);
    setData(prev => ({
      ...prev,
      license_numbers: newLicenses
    }));
  };

  // Ensure at least one license field exists
  const licenses = data.license_numbers.length > 0 ? data.license_numbers : [''];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Section Header */}
      <div 
        className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Licenses & Certifications</h3>
              <p className="text-sm text-gray-600">Professional licenses and certifications</p>
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
          <div className="space-y-4">
            {/* License List */}
            {licenses.map((license, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License {index + 1}
                  </label>
                  <input
                    type="text"
                    value={license}
                    onChange={(e) => handleLicenseChange(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter license number"
                  />
                </div>
                {licenses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLicense(index)}
                    className="mt-6 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    title="Remove license"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {/* Add License Button */}
            <button
              type="button"
              onClick={addLicense}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add License
            </button>
          </div>

          {/* License Information */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">License Information</h4>
                <p className="mt-1 text-sm text-blue-700">
                  Add all relevant professional licenses and certifications. These will be displayed on 
                  quotes and invoices to build customer confidence in your services.
                </p>
                <div className="mt-2">
                  <p className="text-sm text-blue-700 font-medium">Common license types:</p>
                  <ul className="mt-1 text-sm text-blue-600 list-disc list-inside">
                    <li>Contractor's License</li>
                    <li>Electrical License</li>
                    <li>Plumbing License</li>
                    <li>HVAC License</li>
                    <li>Business License</li>
                    <li>Insurance Certifications</li>
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

export default LicensesSection;
