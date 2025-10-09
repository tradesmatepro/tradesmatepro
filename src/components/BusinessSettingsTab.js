import React, { useState, useEffect } from 'react';
import { supaFetch } from '../utils/supaFetch';
import { useUser } from '../contexts/UserContext';
import settingsService from '../services/SettingsService';
import {
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  CheckIcon,
  XMarkIcon,
  CogIcon
} from '@heroicons/react/24/outline';

// Toggle Switch Component
const ToggleSwitch = ({ enabled, onChange, label, description, disabled = false }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <div className="group relative">
          <InformationCircleIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            {description}
          </div>
        </div>
      </div>
    </div>
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

// Dropdown Component
const Dropdown = ({ value, onChange, options, label, description }) => (
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
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// Input Component
const TextInput = ({ value, onChange, label, description, placeholder, type = "text" }) => (
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
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

// Textarea Component
const TextArea = ({ value, onChange, label, description, placeholder, rows = 3 }) => (
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
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
    />
  </div>
);

const BusinessSettingsTab = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // Default business settings
  const [settings, setSettings] = useState({
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    date_format: 'MM/DD/YYYY',
    time_format: '12',
    number_format: 'US',
    preferred_contact_method: 'email',
    send_auto_reminders: true,
    send_quote_notifications: true,
    send_invoice_notifications: true,
    require_customer_approval: false,
    allow_partial_payments: true,
    auto_generate_work_orders: true,
    require_photo_documentation: false,
    quality_control_enabled: false,
    multi_location_enabled: false,
    franchise_mode: false
  });

  // Options for dropdowns
  const timezoneOptions = [
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKST)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' }
  ];

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
    { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (Dec 31, 2024)' }
  ];

  const contactMethodOptions = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'sms', label: 'SMS/Text' },
    { value: 'app_notification', label: 'App Notification' }
  ];

  useEffect(() => {
    loadSettings();
  }, [user?.company_id]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const loadSettings = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);

      // Use unified SettingsService to get business settings
      const businessSettings = await settingsService.getBusinessSettings(user.company_id);

      if (businessSettings) {
        setSettings(prev => ({ ...prev, ...businessSettings }));
      }
    } catch (error) {
      console.error('Error loading business settings:', error);
      let errorMessage = 'Failed to load business settings';

      if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
        errorMessage = 'Business settings table not found. Please check database setup.';
      } else if (error.message && error.message.includes('permission denied')) {
        errorMessage = 'Access denied to business settings. Please check permissions.';
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      showAlert('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updatedSettings) => {
    if (!user?.company_id) return;

    try {
      setSaving(true);

      console.log('💾 Saving unified business settings:', updatedSettings);

      // Use SettingsService to update business settings (handles multiple tables internally)
      const success = await settingsService.updateSettings(user.company_id, updatedSettings);

      if (!success) {
        throw new Error('Failed to save settings via SettingsService');
      }

      showAlert('success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    
    // Debounced save - save after 1 second of no changes
    clearTimeout(window.settingsSaveTimeout);
    window.settingsSaveTimeout = setTimeout(() => {
      saveSettings(updatedSettings);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading settings...</span>
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

      {/* Regional Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GlobeAltIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Regional Settings</h3>
              <p className="text-sm text-gray-600">Configure timezone, currency, and date formats</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Dropdown
              value={settings.timezone}
              onChange={(value) => updateSetting('timezone', value)}
              options={timezoneOptions}
              label="Timezone"
              description="Default timezone for scheduling and timestamps"
            />
            <Dropdown
              value={settings.currency}
              onChange={(value) => updateSetting('currency', value)}
              options={currencyOptions}
              label="Currency"
              description="Default currency for quotes and invoices"
            />
            <Dropdown
              value={settings.date_format}
              onChange={(value) => updateSetting('date_format', value)}
              options={dateFormatOptions}
              label="Date Format"
              description="How dates appear throughout the app"
            />
          </div>
        </div>
      </div>

      {/* Communication Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Communication Settings</h3>
              <p className="text-sm text-gray-600">Configure notifications and contact preferences</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dropdown
              value={settings.preferred_contact_method}
              onChange={(value) => updateSetting('preferred_contact_method', value)}
              options={contactMethodOptions}
              label="Preferred Contact Method"
              description="Default method for contacting customers"
            />
          </div>
          <div className="space-y-4">
            <ToggleSwitch
              enabled={settings.send_auto_reminders}
              onChange={(value) => updateSetting('send_auto_reminders', value)}
              label="Send Auto Reminders"
              description="Automatically send appointment reminders to customers"
            />
            <ToggleSwitch
              enabled={settings.send_quote_notifications}
              onChange={(value) => updateSetting('send_quote_notifications', value)}
              label="Send Quote Notifications"
              description="Notify customers when quotes are ready or updated"
            />
          </div>
        </div>
      </div>

      {/* Business Rules & Operations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CogIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Business Rules & Operations</h3>
              <p className="text-sm text-gray-600">Configure global business rules and operational settings</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <ToggleSwitch
            enabled={settings.require_customer_approval}
            onChange={(value) => updateSetting('require_customer_approval', value)}
            label="Require Customer Approval"
            description="Require customer approval before starting work"
          />
          <ToggleSwitch
            enabled={settings.allow_partial_payments}
            onChange={(value) => updateSetting('allow_partial_payments', value)}
            label="Allow Partial Payments"
            description="Accept partial payments on invoices"
          />
          <ToggleSwitch
            enabled={settings.auto_generate_work_orders}
            onChange={(value) => updateSetting('auto_generate_work_orders', value)}
            label="Auto-Generate Work Orders"
            description="Automatically create work orders from approved quotes"
          />
          <ToggleSwitch
            enabled={settings.require_photo_documentation}
            onChange={(value) => updateSetting('require_photo_documentation', value)}
            label="Require Photo Documentation"
            description="Require photos for completed work"
          />
          <ToggleSwitch
            enabled={settings.quality_control_enabled}
            onChange={(value) => updateSetting('quality_control_enabled', value)}
            label="Quality Control Workflows"
            description="Enable quality control and review processes"
          />
          <ToggleSwitch
            enabled={settings.multi_location_enabled}
            onChange={(value) => updateSetting('multi_location_enabled', value)}
            label="Multi-Location Support"
            description="Enable support for multiple business locations"
          />
        </div>
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

export default BusinessSettingsTab;
