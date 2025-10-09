import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';

const LicensesCard = ({ data, setData, errors }) => {
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
    <div className="space-y-8">
      {/* Dynamic License Table */}
      {licenses.length > 0 && (
        <div>
          <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <ShieldCheckIcon className="w-6 h-6 mr-3 text-amber-500" />
            Current Licenses ({licenses.length})
          </h4>

          <div className="space-y-4">
            {licenses.map((license) => (
              <div key={license.id} className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 hover:shadow-lg transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* License Number */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">License Number</label>
                    <input
                      type="text"
                      value={license.number}
                      onChange={(e) => updateLicense(license.id, 'number', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 text-lg font-medium transition-all duration-300"
                      placeholder="License #"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                    <select
                      value={license.state}
                      onChange={(e) => updateLicense(license.id, 'state', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 text-lg font-medium transition-all duration-300"
                    >
                      <option value="">Select State</option>
                      {US_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={license.expiry_date}
                      onChange={(e) => updateLicense(license.id, 'expiry_date', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 text-lg font-medium transition-all duration-300"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-end space-x-3">
                    <button
                      type="button"
                      className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors shadow-lg hover:shadow-xl"
                      title="Upload certificate"
                    >
                      <DocumentArrowUpIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => removeLicense(license.id)}
                      className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors shadow-lg hover:shadow-xl"
                      title="Remove license"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Expiry Status */}
                {license.expiry_date && (
                  <div className="mt-4">
                    {isLicenseExpired(license.expiry_date) ? (
                      <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                        <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                        <span className="font-medium">Expired on {formatDate(license.expiry_date)}</span>
                      </div>
                    ) : isLicenseExpiringSoon(license.expiry_date) ? (
                      <div className="flex items-center text-yellow-600 bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                        <CalendarDaysIcon className="w-5 h-5 mr-2" />
                        <span className="font-medium">Expires soon: {formatDate(license.expiry_date)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-xl border border-green-200">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        <span className="font-medium">Valid until {formatDate(license.expiry_date)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New License */}
      <div className="border-3 border-dashed border-amber-300 rounded-2xl p-8 hover:border-amber-400 transition-colors bg-gradient-to-br from-amber-50 to-orange-50">
        <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <PlusIcon className="w-6 h-6 mr-3 text-amber-500" />
          Add New License
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* License Number */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">License Number *</label>
            <input
              type="text"
              value={newLicense.number}
              onChange={(e) => setNewLicense(prev => ({ ...prev, number: e.target.value }))}
              className="w-full px-4 py-4 border-3 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 text-xl font-medium transition-all duration-300 hover:shadow-lg"
              placeholder="Enter license number"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">State</label>
            <select
              value={newLicense.state}
              onChange={(e) => setNewLicense(prev => ({ ...prev, state: e.target.value }))}
              className="w-full px-4 py-4 border-3 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 text-xl font-medium transition-all duration-300 hover:shadow-lg"
            >
              <option value="">Select State</option>
              {US_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">Expiry Date</label>
            <input
              type="date"
              value={newLicense.expiry_date}
              onChange={(e) => setNewLicense(prev => ({ ...prev, expiry_date: e.target.value }))}
              className="w-full px-4 py-4 border-3 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 text-xl font-medium transition-all duration-300 hover:shadow-lg"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={addLicense}
            disabled={!newLicense.number.trim()}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            <PlusIcon className="w-6 h-6 mr-3" />
            Add License
          </button>
        </div>
      </div>

      {/* License Examples */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
        <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
          <InformationCircleIcon className="w-5 h-5 mr-2" />
          Common License Types
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-blue-800">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>General Contractor License</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Electrical License</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Plumbing License</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>HVAC License</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Business License</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Insurance Certification</span>
          </div>
        </div>
        <p className="mt-4 text-blue-700 font-medium">
          These credentials will be displayed on your public profile to build customer trust.
        </p>
      </div>
    </div>
  );
};

export default LicensesCard;
