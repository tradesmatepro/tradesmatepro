import React, { useState, useEffect } from 'react';
import { supaFetch } from '../utils/supaFetch';
import { useUser } from '../contexts/UserContext';
import settingsService from '../services/SettingsService';
import {
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
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

// Number Input Component
const NumberInput = ({ value, onChange, label, description, min, max, suffix }) => (
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
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        min={min}
        max={max}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const SecuritySettingsTab = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // Default security settings based on schema
  const [settings, setSettings] = useState({
    two_factor_enabled: false,
    password_expiry_days: 90,
    min_password_length: 8,
    require_special_chars: true,
    require_numbers: true,
    require_uppercase: true,
    max_login_attempts: 5,
    lockout_duration_minutes: 30,
    session_timeout_minutes: 480,
    ip_whitelist_enabled: false,
    ip_whitelist: '',
    audit_log_retention_days: 365,
    data_encryption_enabled: true,
    backup_encryption_enabled: true,
    api_rate_limiting_enabled: true,
    api_rate_limit_per_minute: 100,
    webhook_security_enabled: true,
    require_https: true,
    security_headers_enabled: true,
    content_security_policy_enabled: true,
    auto_logout_enabled: true,
    device_tracking_enabled: true,
    suspicious_activity_alerts: true,
    failed_login_notifications: true,
    password_breach_checking: true,
    security_questions_required: false
  });

  const passwordExpiryOptions = [
    { value: 30, label: '30 days' },
    { value: 60, label: '60 days' },
    { value: 90, label: '90 days' },
    { value: 180, label: '180 days' },
    { value: 365, label: '1 year' },
    { value: 0, label: 'Never expire' }
  ];

  const sessionTimeoutOptions = [
    { value: 60, label: '1 hour' },
    { value: 240, label: '4 hours' },
    { value: 480, label: '8 hours' },
    { value: 720, label: '12 hours' },
    { value: 1440, label: '24 hours' }
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

      // Use unified SettingsService to get security settings
      const unifiedSettings = await settingsService.getSettings(user.company_id);

      if (unifiedSettings) {
        // Extract security-related fields from unified settings
        const securitySettings = {
          two_factor_enabled: unifiedSettings.two_factor_enabled,
          session_timeout: unifiedSettings.session_timeout,
          password_policy: unifiedSettings.password_policy,
          login_attempts_limit: unifiedSettings.login_attempts_limit,
          // Add any other security fields that exist in the unified settings
        };
        setSettings(prev => ({ ...prev, ...securitySettings }));
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
      showAlert('error', 'Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updatedSettings) => {
    if (!user?.company_id) return;

    try {
      setSaving(true);

      console.log('💾 Saving unified security settings:', updatedSettings);

      // Use SettingsService to update security settings (handles multiple tables internally)
      const success = await settingsService.updateSettings(user.company_id, updatedSettings);

      if (!success) {
        throw new Error('Failed to save settings via SettingsService');
      }

      showAlert('success', 'Security settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('error', 'Failed to save security settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    
    // Debounced save - save after 1 second of no changes
    clearTimeout(window.securitySettingsSaveTimeout);
    window.securitySettingsSaveTimeout = setTimeout(() => {
      saveSettings(updatedSettings);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading security settings...</span>
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

      {/* Authentication & Access Control */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ShieldCheckIcon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Authentication & Access</h3>
              <p className="text-sm text-gray-600">Configure login security and access controls</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <ToggleSwitch
              enabled={settings.two_factor_enabled}
              onChange={(value) => updateSetting('two_factor_enabled', value)}
              label="Two-Factor Authentication"
              description="Require 2FA for all user logins"
            />
            <ToggleSwitch
              enabled={settings.auto_logout_enabled}
              onChange={(value) => updateSetting('auto_logout_enabled', value)}
              label="Auto-Logout"
              description="Automatically log out inactive users"
            />
            <ToggleSwitch
              enabled={settings.device_tracking_enabled}
              onChange={(value) => updateSetting('device_tracking_enabled', value)}
              label="Device Tracking"
              description="Track and monitor user devices"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dropdown
              value={settings.password_expiry_days}
              onChange={(value) => updateSetting('password_expiry_days', parseInt(value))}
              options={passwordExpiryOptions}
              label="Password Expiry"
              description="How often users must change passwords"
            />
            <Dropdown
              value={settings.session_timeout_minutes}
              onChange={(value) => updateSetting('session_timeout_minutes', parseInt(value))}
              options={sessionTimeoutOptions}
              label="Session Timeout"
              description="Automatic logout after inactivity"
            />
            <NumberInput
              value={settings.max_login_attempts}
              onChange={(value) => updateSetting('max_login_attempts', value)}
              label="Max Login Attempts"
              description="Failed attempts before account lockout"
              min={3}
              max={10}
              suffix="attempts"
            />
            <NumberInput
              value={settings.lockout_duration_minutes}
              onChange={(value) => updateSetting('lockout_duration_minutes', value)}
              label="Lockout Duration"
              description="How long accounts remain locked"
              min={5}
              max={1440}
              suffix="minutes"
            />
          </div>
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

export default SecuritySettingsTab;
