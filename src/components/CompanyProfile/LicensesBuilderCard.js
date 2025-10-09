import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const LicensesBuilderCard = ({ data, setData, errors }) => {
  const [newLicense, setNewLicense] = useState({
    number: '',
    state: '',
    expiry_date: ''
  });

  // Convert simple license_numbers array to structured format
  const getLicenses = () => {
    if (!data.license_numbers || data.license_numbers.length === 0) {
      return [];
    }
    
    // If it's already structured, return as is
    if (typeof data.license_numbers[0] === 'object') {
      return data.license_numbers;
    }
    
    // Convert simple strings to structured format
    return data.license_numbers.map((license, index) => ({
      id: `license_${index}`,
      number: license,
      state: '',
      expiry_date: ''
    }));
  };

  const licenses = getLicenses();

  const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const updateLicenses = (newLicenses) => {
    setData(prev => ({
      ...prev,
      license_numbers: newLicenses
    }));
  };

  const addLicense = () => {
    if (!newLicense.number.trim()) return;

    const license = {
      id: `license_${Date.now()}`,
      number: newLicense.number.trim(),
      state: newLicense.state,
      expiry_date: newLicense.expiry_date
    };

    updateLicenses([...licenses, license]);
    setNewLicense({ number: '', state: '', expiry_date: '' });
  };

  const updateLicense = (id, field, value) => {
    const updatedLicenses = licenses.map(license =>
      license.id === id ? { ...license, [field]: value } : license
    );
    updateLicenses(updatedLicenses);
  };

  const removeLicense = (id) => {
    const updatedLicenses = licenses.filter(license => license.id !== id);
    updateLicenses(updatedLicenses);
  };

  const isLicenseExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    return expiry <= threeMonthsFromNow && expiry >= today;
  };

  const isLicenseExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Licenses & Certifications</h3>
            <p className="text-sm text-gray-600">Professional credentials and permits</p>
          </div>
          {licenses.length > 0 && (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">{licenses.length} License{licenses.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Existing Licenses */}
        {licenses.length > 0 && (
          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900">Current Licenses</h4>
            {licenses.map((license) => (
              <div key={license.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* License Number */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">License Number</label>
                    <input
                      type="text"
                      value={license.number}
                      onChange={(e) => updateLicense(license.id, 'number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="License #"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                    <select
                      value={license.state}
                      onChange={(e) => updateLicense(license.id, 'state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="">Select State</option>
                      {US_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={license.expiry_date}
                      onChange={(e) => updateLicense(license.id, 'expiry_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-end">
                    <button
                      onClick={() => removeLicense(license.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove license"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expiry Warning */}
                {license.expiry_date && (
                  <div className="mt-3">
                    {isLicenseExpired(license.expiry_date) ? (
                      <div className="flex items-center text-red-600 text-sm">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                        <span>Expired on {formatDate(license.expiry_date)}</span>
                      </div>
                    ) : isLicenseExpiringSoon(license.expiry_date) ? (
                      <div className="flex items-center text-yellow-600 text-sm">
                        <CalendarDaysIcon className="w-4 h-4 mr-2" />
                        <span>Expires soon: {formatDate(license.expiry_date)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        <span>Valid until {formatDate(license.expiry_date)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add New License */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 transition-colors">
          <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add New License
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
              <input
                type="text"
                value={newLicense.number}
                onChange={(e) => setNewLicense(prev => ({ ...prev, number: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter license number"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <select
                value={newLicense.state}
                onChange={(e) => setNewLicense(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select State</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
              <input
                type="date"
                value={newLicense.expiry_date}
                onChange={(e) => setNewLicense(prev => ({ ...prev, expiry_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={addLicense}
              disabled={!newLicense.number.trim()}
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add License
            </button>
          </div>
        </div>

        {/* License Examples */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
            <InformationCircleIcon className="w-4 h-4 mr-2" />
            Common License Types
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
            <div>• General Contractor License</div>
            <div>• Electrical License</div>
            <div>• Plumbing License</div>
            <div>• HVAC License</div>
            <div>• Business License</div>
            <div>• Insurance Certification</div>
          </div>
          <p className="mt-2 text-sm text-blue-700">
            These credentials will be displayed on your public profile to build customer trust.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LicensesBuilderCard;
