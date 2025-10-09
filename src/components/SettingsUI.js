import React, { useState } from 'react';
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalculatorIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  LockOpenIcon,
  LockClosedIcon,
  CogIcon
} from '@heroicons/react/24/outline';

// Import the new BusinessSettingsTab
import BusinessSettingsTab from './BusinessSettingsTab';

// Export IntegrationsTab from IntegrationsUI
export { IntegrationsTab } from './IntegrationsUI';

// Alert component for displaying success/error messages
export const Alert = ({ alert }) => {
  if (!alert.show) return null;
  return (
    <div className={`p-4 rounded-lg border mb-6 ${
      alert.type === 'error'
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-green-50 border-green-200 text-green-800'
    }`}>
      {alert.message}
    </div>
  );
};

export const CompanySettingsTab = ({ companySettings, setCompanySettings }) => {
  const addLicense = () => {
    const licenses = companySettings.licenses || [companySettings.licenseNumber || ''];
    setCompanySettings({
      ...companySettings,
      licenses: [...licenses, '']
    });
  };

  const updateLicense = (index, value) => {
    const licenses = [...(companySettings.licenses || [companySettings.licenseNumber || ''])];
    licenses[index] = value;
    setCompanySettings({
      ...companySettings,
      licenses,
      licenseNumber: licenses[0] // Keep first license as primary for backward compatibility
    });
  };

  const removeLicense = (index) => {
    const licenses = [...(companySettings.licenses || [companySettings.licenseNumber || ''])];
    licenses.splice(index, 1);
    setCompanySettings({
      ...companySettings,
      licenses,
      licenseNumber: licenses[0] || '' // Update primary license
    });
  };

  const currentLicenses = companySettings.licenses || [companySettings.licenseNumber || ''];

  return (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
        <BuildingOfficeIcon className="w-5 h-5" />
        Company Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input
            type="text"
            value={companySettings.companyName}
            onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Your Company Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={companySettings.companyPhone}
            onChange={(e) => setCompanySettings({...companySettings, companyPhone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="(555) 123-4567"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
          <input
            type="text"
            value={companySettings.street || ''}
            onChange={(e) => setCompanySettings({...companySettings, street: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="123 Business Street"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            value={companySettings.city || ''}
            onChange={(e) => setCompanySettings({...companySettings, city: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="City"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            value={companySettings.state || ''}
            onChange={(e) => setCompanySettings({...companySettings, state: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="State"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
          <input
            type="text"
            value={companySettings.zipCode || ''}
            onChange={(e) => setCompanySettings({...companySettings, zipCode: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="12345"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={companySettings.companyEmail}
            onChange={(e) => setCompanySettings({...companySettings, companyEmail: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="contact@company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            type="url"
            value={companySettings.website}
            onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="https://www.company.com"
          />
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">License Numbers</label>
            <button
              type="button"
              onClick={addLicense}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              + Add License
            </button>
          </div>
          <div className="space-y-2">
            {currentLicenses.map((license, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={license}
                  onChange={(e) => updateLicense(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={`License #${index + 1}`}
                />
                {currentLicenses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLicense(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-700 border border-red-300 rounded-md hover:bg-red-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
          <input
            type="text"
            value={companySettings.taxId}
            onChange={(e) => setCompanySettings({...companySettings, taxId: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Tax ID #12-3456789"
          />
        </div>
      </div>
    </div>

    {/* Enhanced Business Information Section */}
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
        <InformationCircleIcon className="w-5 h-5" />
        Business Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
          <textarea
            value={companySettings.businessDescription || ''}
            onChange={(e) => setCompanySettings({...companySettings, businessDescription: e.target.value})}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Brief description of your services and specializations..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Years in Business</label>
          <input
            type="number"
            min="0"
            max="100"
            value={companySettings.yearsInBusiness || ''}
            onChange={(e) => setCompanySettings({...companySettings, yearsInBusiness: parseInt(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
          <select
            value={companySettings.employeeCountRange || ''}
            onChange={(e) => setCompanySettings({...companySettings, employeeCountRange: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select team size</option>
            <option value="1">Just me</option>
            <option value="2-5">2-5 employees</option>
            <option value="6-10">6-10 employees</option>
            <option value="11-25">11-25 employees</option>
            <option value="26-50">26-50 employees</option>
            <option value="51+">51+ employees</option>
          </select>
        </div>
      </div>
    </div>

    {/* Branding Section */}
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
        <CogIcon className="w-5 h-5" />
        Branding & Visual Identity
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo URL</label>
          <input
            type="url"
            value={companySettings.companyLogoUrl || ''}
            onChange={(e) => setCompanySettings({...companySettings, companyLogoUrl: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="https://example.com/logo.png"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Brand Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={companySettings.themeColor || '#3B82F6'}
              onChange={(e) => setCompanySettings({...companySettings, themeColor: e.target.value})}
              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={companySettings.themeColor || '#3B82F6'}
              onChange={(e) => setCompanySettings({...companySettings, themeColor: e.target.value})}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="#3B82F6"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Banner URL</label>
          <input
            type="url"
            value={companySettings.companyBannerUrl || ''}
            onChange={(e) => setCompanySettings({...companySettings, companyBannerUrl: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="https://example.com/banner.png"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={companySettings.secondaryColor || '#6B7280'}
              onChange={(e) => setCompanySettings({...companySettings, secondaryColor: e.target.value})}
              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={companySettings.secondaryColor || '#6B7280'}
              onChange={(e) => setCompanySettings({...companySettings, secondaryColor: e.target.value})}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="#6B7280"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export const RateSettingsTab = ({ rateSettings, setRateSettings }) => {
  const [overtimeAuto, setOvertimeAuto] = useState(true);
  const [sampleJob, setSampleJob] = useState({
    hours: 4,
    partsAmount: 150
  });
  const [expandedSections, setExpandedSections] = useState({
    laborRates: true,
    markupTax: true,
    preview: true
  });

  const handleHourlyRateChange = (newRate) => {
    const updatedRates = {
      ...rateSettings,
      defaultHourlyRate: newRate
    };

    // Auto-calculate overtime if enabled
    if (overtimeAuto) {
      updatedRates.defaultOvertimeRate = newRate * 1.5;
    }

    setRateSettings(updatedRates);
  };

  const handleOvertimeToggle = () => {
    const newAuto = !overtimeAuto;
    setOvertimeAuto(newAuto);

    if (newAuto) {
      // Re-calculate overtime rate
      setRateSettings({
        ...rateSettings,
        defaultOvertimeRate: rateSettings.defaultHourlyRate * 1.5
      });
    }
  };

  const handleSliderChange = (field, value) => {
    setRateSettings({
      ...rateSettings,
      [field]: parseFloat(value)
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculate sample job breakdown
  const calculateSampleBreakdown = () => {
    const laborCost = sampleJob.hours * rateSettings.defaultHourlyRate;
    const laborMarkup = laborCost * (rateSettings.laborMarkupPercentage / 100);
    const partsMarkup = sampleJob.partsAmount * (rateSettings.partsMarkupPercent / 100);
    const subtotal = laborCost + laborMarkup + sampleJob.partsAmount + partsMarkup + rateSettings.travelFee;
    const tax = subtotal * (rateSettings.defaultTaxRate / 100);
    const total = subtotal + tax;

    return {
      laborCost,
      laborMarkup,
      partsMarkup,
      travelFee: rateSettings.travelFee,
      subtotal,
      tax,
      total
    };
  };

  const breakdown = calculateSampleBreakdown();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">

          {/* Labor Rates Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div
              className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
              onClick={() => toggleSection('laborRates')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ClockIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Labor Rates</h3>
                    <p className="text-sm text-gray-600">Set your hourly rates and travel fees</p>
                  </div>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.laborRates ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {expandedSections.laborRates && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Standard Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Standard Hourly Rate
                      <span className="ml-2 inline-flex items-center text-xs text-blue-600">
                        <InformationCircleIcon className="w-3 h-3 mr-1" />
                        Typical: $75-125/hr
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-lg">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={rateSettings.defaultHourlyRate}
                        onChange={(e) => handleHourlyRateChange(parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg font-medium"
                        placeholder="75.00"
                      />
                    </div>
                  </div>

                  {/* Overtime Rate */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Overtime Hourly Rate
                      </label>
                      <button
                        type="button"
                        onClick={handleOvertimeToggle}
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                          overtimeAuto
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        title={overtimeAuto ? 'Auto-calculated (1.5x standard)' : 'Manual override enabled'}
                      >
                        {overtimeAuto ? (
                          <>
                            <LockOpenIcon className="w-3 h-3 mr-1" />
                            Auto (1.5x)
                          </>
                        ) : (
                          <>
                            <LockClosedIcon className="w-3 h-3 mr-1" />
                            Manual
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-lg">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={rateSettings.defaultOvertimeRate}
                        onChange={(e) => setRateSettings({...rateSettings, defaultOvertimeRate: parseFloat(e.target.value) || 0})}
                        disabled={overtimeAuto}
                        className={`w-full pl-8 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg font-medium ${
                          overtimeAuto
                            ? 'border-gray-200 bg-gray-50 text-gray-600'
                            : 'border-gray-300 bg-white'
                        }`}
                        placeholder="112.50"
                      />
                    </div>
                  </div>

                  {/* Travel Fee */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Travel Fee
                      <span className="ml-2 inline-flex items-center text-xs text-blue-600">
                        <InformationCircleIcon className="w-3 h-3 mr-1" />
                        Typical: $25-40
                      </span>
                    </label>
                    <div className="relative max-w-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-lg">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={rateSettings.travelFee}
                        onChange={(e) => setRateSettings({...rateSettings, travelFee: parseFloat(e.target.value) || 0})}
                        className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg font-medium"
                        placeholder="25.00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Markup & Tax Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div
              className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-colors"
              onClick={() => toggleSection('markupTax')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CalculatorIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Markup & Tax</h3>
                    <p className="text-sm text-gray-600">Configure profit margins and tax rates</p>
                  </div>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.markupTax ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {expandedSections.markupTax && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tax Rate */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tax Rate
                      <span className="ml-2 inline-flex items-center text-xs text-green-600">
                        <InformationCircleIcon className="w-3 h-3 mr-1" />
                        Typical: 6-10%
                      </span>
                    </label>

                    {/* Tax Rate Slider */}
                    <div className="mb-4">
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="0.25"
                        value={rateSettings.defaultTaxRate}
                        onChange={(e) => handleSliderChange('defaultTaxRate', e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #10B981 0%, #10B981 ${(rateSettings.defaultTaxRate / 20) * 100}%, #E5E7EB ${(rateSettings.defaultTaxRate / 20) * 100}%, #E5E7EB 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>10%</span>
                        <span>20%</span>
                      </div>
                    </div>

                    {/* Tax Rate Input */}
                    <div className="relative max-w-md">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={rateSettings.defaultTaxRate}
                        onChange={(e) => setRateSettings({...rateSettings, defaultTaxRate: parseFloat(e.target.value) || 0})}
                        className="w-full pl-3 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-lg font-medium"
                        placeholder="8.25"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-lg">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Parts Markup */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Parts Markup
                      <span className="ml-2 inline-flex items-center text-xs text-purple-600">
                        <InformationCircleIcon className="w-3 h-3 mr-1" />
                        Typical: 25-40%
                      </span>
                    </label>

                    {/* Parts Markup Slider */}
                    <div className="mb-4">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={rateSettings.partsMarkupPercent}
                        onChange={(e) => handleSliderChange('partsMarkupPercent', e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${(rateSettings.partsMarkupPercent / 50) * 100}%, #E5E7EB ${(rateSettings.partsMarkupPercent / 50) * 100}%, #E5E7EB 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                      </div>
                    </div>

                    {/* Parts Markup Input */}
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={rateSettings.partsMarkupPercent}
                        onChange={(e) => setRateSettings({...rateSettings, partsMarkupPercent: parseFloat(e.target.value) || 0})}
                        className="w-full pl-3 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-lg font-medium"
                        placeholder="35.0"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-lg">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Labor Markup */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Labor Markup
                      <span className="ml-2 inline-flex items-center text-xs text-purple-600">
                        <InformationCircleIcon className="w-3 h-3 mr-1" />
                        Typical: 15-25%
                      </span>
                    </label>

                    {/* Labor Markup Slider */}
                    <div className="mb-4">
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="1"
                        value={rateSettings.laborMarkupPercentage}
                        onChange={(e) => handleSliderChange('laborMarkupPercentage', e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${(rateSettings.laborMarkupPercentage / 30) * 100}%, #E5E7EB ${(rateSettings.laborMarkupPercentage / 30) * 100}%, #E5E7EB 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>15%</span>
                        <span>30%</span>
                      </div>
                    </div>

                    {/* Labor Markup Input */}
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={rateSettings.laborMarkupPercentage}
                        onChange={(e) => setRateSettings({...rateSettings, laborMarkupPercentage: parseFloat(e.target.value) || 0})}
                        className="w-full pl-3 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-lg font-medium"
                        placeholder="15.0"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-lg">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sample Job Calculator - Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            <div
              className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50 cursor-pointer hover:from-indigo-100 hover:to-blue-100 transition-colors"
              onClick={() => toggleSection('preview')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <CalculatorIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Sample Job Calculator</h3>
                    <p className="text-sm text-gray-600">Preview pricing with your rates</p>
                  </div>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.preview ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {expandedSections.preview && (
              <div className="p-6">
                {/* Sample Job Inputs */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={sampleJob.hours}
                      onChange={(e) => setSampleJob({...sampleJob, hours: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parts Cost
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={sampleJob.partsAmount}
                        onChange={(e) => setSampleJob({...sampleJob, partsAmount: parseFloat(e.target.value) || 0})}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="150.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-sm font-medium text-gray-900">Price Breakdown</h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Labor ({sampleJob.hours}h @ {formatCurrency(rateSettings.defaultHourlyRate)})</span>
                      <span className="font-medium">{formatCurrency(breakdown.laborCost)}</span>
                    </div>

                    {breakdown.laborMarkup > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Labor Markup ({formatPercentage(rateSettings.laborMarkupPercentage)})</span>
                        <span className="font-medium">{formatCurrency(breakdown.laborMarkup)}</span>
                      </div>
                    )}

                    {sampleJob.partsAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Parts</span>
                        <span className="font-medium">{formatCurrency(sampleJob.partsAmount)}</span>
                      </div>
                    )}

                    {breakdown.partsMarkup > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Parts Markup ({formatPercentage(rateSettings.partsMarkupPercent)})</span>
                        <span className="font-medium">{formatCurrency(breakdown.partsMarkup)}</span>
                      </div>
                    )}

                    {breakdown.travelFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Travel Fee</span>
                        <span className="font-medium">{formatCurrency(breakdown.travelFee)}</span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">{formatCurrency(breakdown.subtotal)}</span>
                      </div>
                    </div>

                    {breakdown.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax ({formatPercentage(rateSettings.defaultTaxRate)})</span>
                        <span className="font-medium">{formatCurrency(breakdown.tax)}</span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-indigo-600">{formatCurrency(breakdown.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simple Donut Chart */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Cost Breakdown</h4>

                  {breakdown.total > 0 ? (
                    <div className="space-y-3">
                      {/* Labor */}
                      {breakdown.laborCost > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Labor</span>
                          </div>
                          <span className="text-sm font-medium">{formatPercentage((breakdown.laborCost / breakdown.total) * 100)}</span>
                        </div>
                      )}

                      {/* Parts */}
                      {sampleJob.partsAmount > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Parts</span>
                          </div>
                          <span className="text-sm font-medium">{formatPercentage((sampleJob.partsAmount / breakdown.total) * 100)}</span>
                        </div>
                      )}

                      {/* Markup */}
                      {(breakdown.laborMarkup + breakdown.partsMarkup) > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Markup</span>
                          </div>
                          <span className="text-sm font-medium">{formatPercentage(((breakdown.laborMarkup + breakdown.partsMarkup) / breakdown.total) * 100)}</span>
                        </div>
                      )}

                      {/* Tax */}
                      {breakdown.tax > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Tax</span>
                          </div>
                          <span className="text-sm font-medium">{formatPercentage((breakdown.tax / breakdown.total) * 100)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Enter job details to see breakdown
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Export the new BusinessSettingsTab component
export { BusinessSettingsTab };

export const DocumentSettingsTab = ({ documentSettings, setDocumentSettings }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
        <DocumentTextIcon className="w-5 h-5" />
        Document Templates
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quote Terms & Conditions
          </label>
          <textarea
            value={documentSettings.quoteTerms}
            onChange={(e) => setDocumentSettings({...documentSettings, quoteTerms: e.target.value})}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Payment due within 30 days. Work to be completed as scheduled."
          />
          <p className="text-xs text-gray-500 mt-1">Default terms for all quotes</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Footer
          </label>
          <textarea
            value={documentSettings.invoiceFooter}
            onChange={(e) => setDocumentSettings({...documentSettings, invoiceFooter: e.target.value})}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Thank you for your business!"
          />
          <p className="text-xs text-gray-500 mt-1">Appears at the bottom of invoices</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Invoice Terms
          </label>
          <input
            type="text"
            value={documentSettings.defaultInvoiceTerms}
            onChange={(e) => setDocumentSettings({...documentSettings, defaultInvoiceTerms: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Net 15 days"
          />
          <p className="text-xs text-gray-500 mt-1">Default payment terms for invoices</p>
        </div>
      </div>
    </div>

    <div className="bg-green-50 p-4 rounded-lg">
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className="w-5 h-5 text-green-500 mt-0.5" />
        <div>
          <h4 className="font-medium text-green-900">Document Templates</h4>
          <p className="text-sm text-green-800 mt-1">
            These templates will be used as defaults when creating quotes and invoices.
            You can customize them for individual documents as needed.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export const InvoicingSettingsTab = ({ invoicingSettings, setInvoicingSettings }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
        <CurrencyDollarIcon className="w-5 h-5" />
        Invoicing
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Invoice Terms
          </label>
          <select
            value={invoicingSettings.defaultInvoiceTerms}
            onChange={(e) => setInvoicingSettings({ ...invoicingSettings, defaultInvoiceTerms: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="DUE_ON_RECEIPT">Due on Receipt</option>
            <option value="NET_7">Net 7</option>
            <option value="NET_15">Net 15</option>
            <option value="NET_30">Net 30</option>
            <option value="NET_45">Net 45</option>
            <option value="NET_60">Net 60</option>
            <option value="CUSTOM">Custom</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Controls how due_date is calculated for new invoices</p>
        </div>

        {invoicingSettings.defaultInvoiceTerms === 'CUSTOM' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default due in (days)
            </label>
            <input
              type="number"
              min={0}
              value={invoicingSettings.defaultInvoiceDueDays}
              onChange={(e) => setInvoicingSettings({ ...invoicingSettings, defaultInvoiceDueDays: Number(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="14"
            />
            <p className="text-xs text-gray-500 mt-1">Only used when Terms is Custom</p>
          </div>
        )}
      </div>
    </div>
  </div>
);


// Appearance Settings Tab - Database-Integrated
export const AppearanceSettingsTab = () => {
  const React = require('react');
  const { useState, useEffect } = React;
  const { useTheme } = require('../contexts/ThemeContext');
  const { themeMode, setThemeMode } = useTheme();

  const [localValue, setLocalValue] = useState(themeMode);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  // Sync local value with theme mode from context
  useEffect(() => {
    setLocalValue(themeMode);
  }, [themeMode]);

  const handleThemeChange = async (mode) => {
    console.log('🎨 Theme change requested:', { from: localValue, to: mode });
    setLocalValue(mode);
    setSaveStatus('saving');

    try {
      setThemeMode(mode);

      // Show saved status briefly
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('❌ Failed to save theme:', error);
      setSaveStatus('error');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  const themeOptions = [
    {
      value: 'system',
      label: 'System',
      description: 'Automatically match your device settings',
      icon: '🖥️'
    },
    {
      value: 'light',
      label: 'Light',
      description: 'Always use light mode',
      icon: '☀️'
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Always use dark mode',
      icon: '🌙'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Appearance</h3>
          {saveStatus === 'saving' && (
            <span className="text-sm text-blue-600 dark:text-blue-400">💾 Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-600 dark:text-green-400">✅ Saved to database</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-600 dark:text-red-400">❌ Failed to save</span>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Choose how TradeMate Pro looks. Your preference is saved to the database and syncs across all your devices.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-3">
            {themeOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-start p-4 rounded-lg cursor-pointer border-2 transition-all ${
                  localValue === option.value
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  className="mt-1 mr-3"
                  checked={localValue === option.value}
                  onChange={() => handleThemeChange(option.value)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{option.icon}</span>
                    <div className={`font-medium ${
                      localValue === option.value
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {option.label}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          💡 <strong>Tip:</strong> System mode automatically switches between light and dark based on your device's settings.
        </p>
      </div>
    </div>
  );
};