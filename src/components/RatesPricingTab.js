import React, { useState, useEffect } from 'react';
import { supaFetch } from '../utils/supaFetch';
import { useUser } from '../contexts/UserContext';
import settingsService from '../services/SettingsService';
import {
  CurrencyDollarIcon,
  ClockIcon,
  TruckIcon,
  TagIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Currency Input Component
const CurrencyInput = ({ value, onChange, label, description, placeholder, error }) => (
  <div className="space-y-2">
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      <div className="group relative">
        <InformationCircleIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {description}
        </div>
      </div>
    </div>
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
      <input
        type="number"
        step="0.01"
        min="0"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
        className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
      />
    </div>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

// Percentage Input Component
const PercentageInput = ({ value, onChange, label, description, placeholder, error }) => (
  <div className="space-y-2">
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      <div className="group relative">
        <InformationCircleIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {description}
        </div>
      </div>
    </div>
    <div className="relative">
      <input
        type="number"
        step="0.01"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
        className={`w-full pr-8 pl-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
      />
      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
    </div>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

// Multiplier Input Component
const MultiplierInput = ({ value, onChange, label, description, placeholder, error }) => (
  <div className="space-y-2">
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      <div className="group relative">
        <InformationCircleIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {description}
        </div>
      </div>
    </div>
    <div className="relative">
      <input
        type="number"
        step="0.1"
        min="1.0"
        max="10.0"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 1.0)}
        placeholder={placeholder}
        className={`w-full pr-8 pl-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
      />
      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">x</span>
    </div>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

const RatesPricingTab = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // Settings will be loaded from database - no hardcoded defaults
  const [settings, setSettings] = useState(null);

  // Validation rules
  const validateSettings = (newSettings) => {
    const errors = {};

    // Currency validation (>= 0)
    const currencyFields = ['default_hourly_rate', 'travel_fee', 'mileage_rate', 'minimum_service_charge', 'diagnostic_fee'];
    currencyFields.forEach(field => {
      if (newSettings[field] < 0) {
        errors[field] = 'Must be 0 or greater';
      }
    });

    // Multiplier validation (>= 1)
    const multiplierFields = ['overtime_rate_multiplier', 'weekend_rate_multiplier', 'holiday_rate_multiplier', 'emergency_rate_multiplier'];
    multiplierFields.forEach(field => {
      if (newSettings[field] < 1) {
        errors[field] = 'Must be 1.0 or greater';
      }
    });

    // Percentage validation (0-100)
    const percentageFields = ['parts_markup_percentage', 'material_markup_percentage', 'subcontractor_markup_percentage', 'senior_discount_percentage', 'military_discount_percentage', 'loyalty_discount_percentage', 'default_tax_rate'];
    percentageFields.forEach(field => {
      if (newSettings[field] < 0 || newSettings[field] > 100) {
        errors[field] = 'Must be between 0 and 100';
      }
    });

    return errors;
  };

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadSettings();
  }, [user?.company_id]);

  // Debug: Log current settings state
  useEffect(() => {
    console.log('🔍 Current settings state:', settings);
    if (settings) {
      console.log('🔍 Has default_tax_rate in state?', 'default_tax_rate' in settings, settings.default_tax_rate);
    } else {
      console.log('🔍 Settings is null - not loaded yet or not configured');
    }
  }, [settings]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const loadSettings = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);

      // Load from canonical settings table
      const resp = await supaFetch(
        `settings?company_id=eq.${user.company_id}&select=*`,
        { method: 'GET' },
        user.company_id
      );

      if (!resp.ok) {
        throw new Error('Failed to load settings');
      }

      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        const s = data[0];
        console.log('🔍 Loaded settings:', s);

        const ratesPricingSettings = {
          default_hourly_rate: s.labor_rate || 75.0,
          overtime_rate_multiplier: s.overtime_multiplier || 1.5,
          weekend_rate_multiplier: s.weekend_multiplier || 1.25,
          holiday_rate_multiplier: s.holiday_multiplier || 2.0,
          emergency_rate_multiplier: s.emergency_rate_multiplier || 2.0,
          travel_fee: s.minimum_travel_charge || 0.0,
          mileage_rate: s.travel_charge_per_mile || 0.65,
          minimum_service_charge: s.minimum_travel_charge || 0.0,
          diagnostic_fee: s.diagnostic_fee || 0.0,
          default_tax_rate: s.default_tax_rate || 8.25,
          parts_markup_percentage: s.parts_markup || 30,
          material_markup_percentage: s.material_markup || 25,
          subcontractor_markup_percentage: s.subcontractor_markup || 15,
          senior_discount_percentage: s.senior_discount_percentage || 0,
          military_discount_percentage: s.military_discount_percentage || 0,
          loyalty_discount_percentage: s.loyalty_discount_percentage || 0
        };

        setSettings(ratesPricingSettings);
      } else {
        console.log('🔍 No settings found - using defaults');
        setSettings({
          default_hourly_rate: 75.00,
          overtime_rate_multiplier: 1.5,
          weekend_rate_multiplier: 1.25,
          holiday_rate_multiplier: 2.0,
          emergency_rate_multiplier: 2.0,
          travel_fee: 0.00,
          mileage_rate: 0.65,
          minimum_service_charge: 0.00,
          diagnostic_fee: 0.00,
          default_tax_rate: 8.25,
          parts_markup_percentage: 30,
          material_markup_percentage: 25,
          subcontractor_markup_percentage: 15,
          senior_discount_percentage: 0,
          military_discount_percentage: 0,
          loyalty_discount_percentage: 0
        });
      }
    } catch (error) {
      console.error('Error loading rates and pricing:', error);
      showAlert('error', 'Failed to load rates and pricing settings');
      // Set default settings to prevent null access errors
      setSettings({
        default_hourly_rate: 75.00,
        overtime_rate_multiplier: 1.5,
        weekend_rate_multiplier: 1.25,
        holiday_rate_multiplier: 2.0,
        emergency_rate_multiplier: 2.0,
        travel_fee: 0.00,
        mileage_rate: 0.65,
        minimum_service_charge: 0.00,
        diagnostic_fee: 0.00,
        default_tax_rate: 8.25,
        parts_markup_percentage: 30,
        material_markup_percentage: 25,
        subcontractor_markup_percentage: 15,
        senior_discount_percentage: 0,
        military_discount_percentage: 0,
        loyalty_discount_percentage: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updatedSettings) => {
    if (!user?.company_id) return;

    try {
      setSaving(true);

      console.log('💾 Saving unified rates/pricing settings:', updatedSettings);

      // Map UI fields to canonical settings columns
      const mapped = {
        labor_rate: updatedSettings.default_hourly_rate,
        overtime_multiplier: updatedSettings.overtime_rate_multiplier,
        weekend_multiplier: updatedSettings.weekend_rate_multiplier,
        holiday_multiplier: updatedSettings.holiday_rate_multiplier,
        emergency_rate_multiplier: updatedSettings.emergency_rate_multiplier,
        travel_charge_per_mile: updatedSettings.mileage_rate,
        minimum_travel_charge: updatedSettings.minimum_service_charge || updatedSettings.travel_fee,
        default_tax_rate: updatedSettings.default_tax_rate,
        parts_markup: updatedSettings.parts_markup_percentage,
        material_markup: updatedSettings.material_markup_percentage,
        subcontractor_markup: updatedSettings.subcontractor_markup_percentage,
        senior_discount_percentage: updatedSettings.senior_discount_percentage,
        military_discount_percentage: updatedSettings.military_discount_percentage,
        loyalty_discount_percentage: updatedSettings.loyalty_discount_percentage,
        diagnostic_fee: updatedSettings.diagnostic_fee
      };

      // Use SettingsService to update canonical settings
      const success = await settingsService.updateSettings(user.company_id, mapped);

      if (!success) {
        throw new Error('Failed to save settings via SettingsService');
      }

      showAlert('success', 'Rates and pricing saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('error', 'Failed to save rates and pricing');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);

    // Validate the updated settings
    const errors = validateSettings(updatedSettings);
    setValidationErrors(errors);

    // Only save if there are no validation errors
    if (Object.keys(errors).length === 0) {
      // Debounced save - save after 1 second of no changes
      clearTimeout(window.ratesPricingSaveTimeout);
      window.ratesPricingSaveTimeout = setTimeout(() => {
        saveSettings(updatedSettings);
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading rates and pricing...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-600 mb-2 text-lg font-semibold">Rates and pricing not configured</div>
          <div className="text-gray-500 text-sm">Please configure your rates and pricing settings to continue.</div>
          <div className="text-gray-500 text-sm mt-2">Database connection may be unavailable.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-lg border ${
          alert.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {alert.type === 'success' ? (
              <CheckIcon className="w-5 h-5 mr-2" />
            ) : (
              <XMarkIcon className="w-5 h-5 mr-2" />
            )}
            {alert.message}
          </div>
        </div>
      )}

      {/* Labor Rates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Labor Rates</h3>
              <p className="text-sm text-gray-600">Configure hourly rates and multipliers</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CurrencyInput
              value={settings.default_hourly_rate}
              onChange={(value) => updateSetting('default_hourly_rate', value)}
              label="Standard Hourly Rate"
              description="Base hourly rate for standard work"
              placeholder="75.00"
              error={validationErrors.default_hourly_rate}
            />
            <MultiplierInput
              value={settings.overtime_rate_multiplier}
              onChange={(value) => updateSetting('overtime_rate_multiplier', value)}
              label="Overtime Multiplier"
              description="Multiplier for overtime hours (1.5 = 150%)"
              placeholder="1.5"
              error={validationErrors.overtime_rate_multiplier}
            />
            <MultiplierInput
              value={settings.weekend_rate_multiplier}
              onChange={(value) => updateSetting('weekend_rate_multiplier', value)}
              label="Weekend Multiplier"
              description="Rate multiplier for weekend work"
              placeholder="1.25"
              error={validationErrors.weekend_rate_multiplier}
            />
            <MultiplierInput
              value={settings.holiday_rate_multiplier}
              onChange={(value) => updateSetting('holiday_rate_multiplier', value)}
              label="Holiday Multiplier"
              description="Rate multiplier for holiday work"
              placeholder="2.0"
              error={validationErrors.holiday_rate_multiplier}
            />
            <MultiplierInput
              value={settings.emergency_rate_multiplier}
              onChange={(value) => updateSetting('emergency_rate_multiplier', value)}
              label="Emergency Multiplier"
              description="Rate multiplier for emergency/after-hours work"
              placeholder="2.0"
              error={validationErrors.emergency_rate_multiplier}
            />
          </div>
        </div>
      </div>

      {/* Service Fees */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TruckIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Service Fees</h3>
              <p className="text-sm text-gray-600">Configure travel, diagnostic, and service charges</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CurrencyInput
              value={settings.travel_fee}
              onChange={(value) => updateSetting('travel_fee', value)}
              label="Travel/Trip Charge"
              description="Fixed fee for service calls"
              placeholder="0.00"
              error={validationErrors.travel_fee}
            />
            <CurrencyInput
              value={settings.mileage_rate}
              onChange={(value) => updateSetting('mileage_rate', value)}
              label="Mileage Rate"
              description="Rate per mile for travel"
              placeholder="0.65"
              error={validationErrors.mileage_rate}
            />
            <CurrencyInput
              value={settings.minimum_service_charge}
              onChange={(value) => updateSetting('minimum_service_charge', value)}
              label="Minimum Service Charge"
              description="Minimum charge for any service call"
              placeholder="0.00"
              error={validationErrors.minimum_service_charge}
            />
            <CurrencyInput
              value={settings.diagnostic_fee}
              onChange={(value) => updateSetting('diagnostic_fee', value)}
              label="Diagnostic Fee"
              description="Fee for assessment and diagnosis"
              placeholder="0.00"
              error={validationErrors.diagnostic_fee}
            />
            <PercentageInput
              value={settings.default_tax_rate}
              onChange={(value) => updateSetting('default_tax_rate', value)}
              label="Default Tax Rate"
              description="Standard tax rate for quotes and invoices"
              placeholder="8.25"
              error={validationErrors.default_tax_rate}
            />
          </div>
        </div>
      </div>

      {/* Markup & Margins */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Markup & Margins</h3>
              <p className="text-sm text-gray-600">Configure markup percentages for parts and materials</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PercentageInput
              value={settings.parts_markup_percentage}
              onChange={(value) => updateSetting('parts_markup_percentage', value)}
              label="Parts Markup"
              description="Markup percentage on parts and components"
              placeholder="30"
              error={validationErrors.parts_markup_percentage}
            />
            <PercentageInput
              value={settings.material_markup_percentage}
              onChange={(value) => updateSetting('material_markup_percentage', value)}
              label="Materials Markup"
              description="Markup percentage on raw materials"
              placeholder="25"
              error={validationErrors.material_markup_percentage}
            />
            <PercentageInput
              value={settings.subcontractor_markup_percentage}
              onChange={(value) => updateSetting('subcontractor_markup_percentage', value)}
              label="Subcontractor Markup"
              description="Markup on subcontractor costs"
              placeholder="15"
              error={validationErrors.subcontractor_markup_percentage}
            />
          </div>
        </div>
      </div>

      {/* Discounts & Promotions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TagIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Discounts & Promotions</h3>
              <p className="text-sm text-gray-600">Configure customer discount percentages</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PercentageInput
              value={settings.senior_discount_percentage}
              onChange={(value) => updateSetting('senior_discount_percentage', value)}
              label="Senior Discount"
              description="Discount for senior citizens"
              placeholder="0"
              error={validationErrors.senior_discount_percentage}
            />
            <PercentageInput
              value={settings.military_discount_percentage}
              onChange={(value) => updateSetting('military_discount_percentage', value)}
              label="Military Discount"
              description="Discount for military/veterans"
              placeholder="0"
              error={validationErrors.military_discount_percentage}
            />
            <PercentageInput
              value={settings.loyalty_discount_percentage}
              onChange={(value) => updateSetting('loyalty_discount_percentage', value)}
              label="Loyalty Discount"
              description="Discount for repeat customers"
              placeholder="0"
              error={validationErrors.loyalty_discount_percentage}
            />
          </div>
        </div>
      </div>

      {/* Manual Save Button */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Save Settings</h3>
            <p className="text-sm text-gray-600">
              {Object.keys(validationErrors).length > 0
                ? 'Please fix validation errors before saving'
                : 'Settings are automatically saved as you type'
              }
            </p>
          </div>
          <button
            onClick={() => saveSettings(settings)}
            disabled={saving || Object.keys(validationErrors).length > 0}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              Object.keys(validationErrors).length > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : saving
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Validation Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(validationErrors).map(([field, error]) => (
                <li key={field}>• {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Save Status */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Saving...</span>
        </div>
      )}
    </div>
  );
};

export default RatesPricingTab;
