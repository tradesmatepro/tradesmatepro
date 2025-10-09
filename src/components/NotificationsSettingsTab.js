import React, { useState, useEffect } from 'react';
import { supaFetch } from '../utils/supaFetch';
import { useUser } from '../contexts/UserContext';
import settingsService from '../services/SettingsService';
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
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

const NotificationsSettingsTab = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // Default notification settings based on schema
  const [settings, setSettings] = useState({
    email_notifications_enabled: true,
    sms_notifications_enabled: false,
    push_notifications_enabled: true,
    in_app_notifications_enabled: true,
    notification_frequency: 'immediate',
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    weekend_notifications_enabled: true,
    
    // Email notification types
    email_new_booking: true,
    email_booking_cancelled: true,
    email_booking_rescheduled: true,
    email_payment_received: true,
    email_invoice_overdue: true,
    email_quote_approved: true,
    email_work_completed: true,
    email_customer_message: true,
    
    // SMS notification types
    sms_new_booking: false,
    sms_booking_reminder: true,
    sms_booking_cancelled: false,
    sms_payment_received: false,
    sms_urgent_updates: true,
    
    // Push notification types
    push_new_booking: true,
    push_booking_reminder: true,
    push_schedule_changes: true,
    push_customer_message: true,
    push_system_alerts: true,
    
    // In-app notification types
    in_app_inventory_alerts: true,
    in_app_pto_events: true,
    in_app_invoice_overdue: true,
    in_app_quote_expiration: true,
    in_app_work_order_updates: true,
    in_app_job_updates: true,
    in_app_timesheet_updates: true,
    in_app_expense_updates: true,
    in_app_purchase_order_updates: true,
    in_app_payment_updates: true,
    in_app_customer_updates: true,
    in_app_employee_updates: true,
    in_app_system_alerts: true,
    in_app_schedule_updates: true,

    // Advanced settings
    digest_email_enabled: false,
    digest_frequency: 'weekly',
    notification_sound_enabled: true,
    marketing_emails_enabled: true,
    product_updates_enabled: true
  });

  const frequencyOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'hourly', label: 'Hourly Digest' },
    { value: 'daily', label: 'Daily Digest' },
    { value: 'weekly', label: 'Weekly Digest' }
  ];

  const digestFrequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
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

      // Use unified SettingsService to get notification settings
      const unifiedSettings = await settingsService.getSettings(user.company_id);

      if (unifiedSettings) {
        // Extract notification-related fields from unified settings
        const notificationSettings = {
          email_notifications: unifiedSettings.email_notifications,
          sms_notifications: unifiedSettings.sms_notifications,
          push_notifications: unifiedSettings.push_notifications,
          notification_frequency: unifiedSettings.notification_frequency,
          // Add any other notification fields that exist in the unified settings
        };
        setSettings(prev => ({ ...prev, ...notificationSettings }));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      showAlert('error', 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updatedSettings) => {
    if (!user?.company_id) return;

    try {
      setSaving(true);

      console.log('💾 Saving unified notification settings:', updatedSettings);

      // Use SettingsService to update notification settings (handles multiple tables internally)
      const success = await settingsService.updateSettings(user.company_id, updatedSettings);

      if (!success) {
        throw new Error('Failed to save settings via SettingsService');
      }

      showAlert('success', 'Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('error', 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    
    // Debounced save - save after 1 second of no changes
    clearTimeout(window.notificationSettingsSaveTimeout);
    window.notificationSettingsSaveTimeout = setTimeout(() => {
      saveSettings(updatedSettings);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading notification settings...</span>
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

      {/* General Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BellIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
              <p className="text-sm text-gray-600">Configure your notification preferences</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dropdown
              value={settings.notification_frequency}
              onChange={(value) => updateSetting('notification_frequency', value)}
              options={frequencyOptions}
              label="Notification Frequency"
              description="How often you receive notifications"
            />
          </div>
          <div className="space-y-4">
            <ToggleSwitch
              enabled={settings.email_notifications_enabled}
              onChange={(value) => updateSetting('email_notifications_enabled', value)}
              label="Email Notifications"
              description="Receive notifications via email"
            />
            <ToggleSwitch
              enabled={settings.sms_notifications_enabled}
              onChange={(value) => updateSetting('sms_notifications_enabled', value)}
              label="SMS Notifications"
              description="Receive notifications via text message"
            />
            <ToggleSwitch
              enabled={settings.push_notifications_enabled}
              onChange={(value) => updateSetting('push_notifications_enabled', value)}
              label="Push Notifications"
              description="Receive browser/app push notifications"
            />
            <ToggleSwitch
              enabled={settings.in_app_notifications_enabled}
              onChange={(value) => updateSetting('in_app_notifications_enabled', value)}
              label="In-App Notifications"
              description="Show notifications within the application"
            />
          </div>
        </div>
      </div>

      {/* In-App Notification Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BellIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">In-App Notifications</h3>
              <p className="text-sm text-gray-600">Choose which events trigger in-app notifications</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToggleSwitch
              enabled={settings.in_app_inventory_alerts}
              onChange={(value) => updateSetting('in_app_inventory_alerts', value)}
              label="Inventory Alerts"
              description="Low stock and out-of-stock notifications"
            />
            <ToggleSwitch
              enabled={settings.in_app_work_order_updates}
              onChange={(value) => updateSetting('in_app_work_order_updates', value)}
              label="Work Order Updates"
              description="Status changes and new work orders"
            />
            <ToggleSwitch
              enabled={settings.in_app_job_updates}
              onChange={(value) => updateSetting('in_app_job_updates', value)}
              label="Job Updates"
              description="Job scheduling and completion"
            />
            <ToggleSwitch
              enabled={settings.in_app_timesheet_updates}
              onChange={(value) => updateSetting('in_app_timesheet_updates', value)}
              label="Timesheet Updates"
              description="Timesheet submissions and approvals"
            />
            <ToggleSwitch
              enabled={settings.in_app_expense_updates}
              onChange={(value) => updateSetting('in_app_expense_updates', value)}
              label="Expense Updates"
              description="Expense submissions and approvals"
            />
            <ToggleSwitch
              enabled={settings.in_app_purchase_order_updates}
              onChange={(value) => updateSetting('in_app_purchase_order_updates', value)}
              label="Purchase Order Updates"
              description="PO creation and approval notifications"
            />
            <ToggleSwitch
              enabled={settings.in_app_payment_updates}
              onChange={(value) => updateSetting('in_app_payment_updates', value)}
              label="Payment Updates"
              description="Payment received and failed notifications"
            />
            <ToggleSwitch
              enabled={settings.in_app_customer_updates}
              onChange={(value) => updateSetting('in_app_customer_updates', value)}
              label="Customer Updates"
              description="New customers and profile changes"
            />
            <ToggleSwitch
              enabled={settings.in_app_employee_updates}
              onChange={(value) => updateSetting('in_app_employee_updates', value)}
              label="Employee Updates"
              description="New employees and profile changes"
            />
            <ToggleSwitch
              enabled={settings.in_app_schedule_updates}
              onChange={(value) => updateSetting('in_app_schedule_updates', value)}
              label="Schedule Updates"
              description="Appointment reminders and changes"
            />
            <ToggleSwitch
              enabled={settings.in_app_invoice_overdue}
              onChange={(value) => updateSetting('in_app_invoice_overdue', value)}
              label="Invoice Overdue"
              description="Overdue invoice notifications"
            />
            <ToggleSwitch
              enabled={settings.in_app_system_alerts}
              onChange={(value) => updateSetting('in_app_system_alerts', value)}
              label="System Alerts"
              description="System errors and maintenance notifications"
            />
          </div>
        </div>
      </div>

      {/* Email Notification Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <EnvelopeIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-600">Configure email notifications to customers and team</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToggleSwitch
              enabled={settings.email_new_booking}
              onChange={(value) => updateSetting('email_new_booking', value)}
              label="New Bookings"
              description="Send confirmation emails for new appointments"
            />
            <ToggleSwitch
              enabled={settings.email_booking_cancelled}
              onChange={(value) => updateSetting('email_booking_cancelled', value)}
              label="Booking Cancellations"
              description="Notify customers of cancelled appointments"
            />
            <ToggleSwitch
              enabled={settings.email_booking_rescheduled}
              onChange={(value) => updateSetting('email_booking_rescheduled', value)}
              label="Booking Rescheduled"
              description="Send updates for rescheduled appointments"
            />
            <ToggleSwitch
              enabled={settings.email_payment_received}
              onChange={(value) => updateSetting('email_payment_received', value)}
              label="Payment Received"
              description="Send payment confirmation emails"
            />
            <ToggleSwitch
              enabled={settings.email_invoice_overdue}
              onChange={(value) => updateSetting('email_invoice_overdue', value)}
              label="Invoice Overdue"
              description="Send overdue payment reminders"
            />
            <ToggleSwitch
              enabled={settings.email_quote_approved}
              onChange={(value) => updateSetting('email_quote_approved', value)}
              label="Quote Approved"
              description="Send thank you emails for approved quotes"
            />
            <ToggleSwitch
              enabled={settings.email_work_completed}
              onChange={(value) => updateSetting('email_work_completed', value)}
              label="Work Completed"
              description="Notify customers when work is finished"
            />
            <ToggleSwitch
              enabled={settings.email_customer_message}
              onChange={(value) => updateSetting('email_customer_message', value)}
              label="Customer Messages"
              description="Forward customer messages via email"
            />
          </div>
        </div>
      </div>

      {/* SMS Notification Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DevicePhoneMobileIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">SMS Notifications</h3>
              <p className="text-sm text-gray-600">Configure text message notifications (requires SMS integration)</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToggleSwitch
              enabled={settings.sms_new_booking}
              onChange={(value) => updateSetting('sms_new_booking', value)}
              label="New Bookings"
              description="Send SMS confirmations for new appointments"
            />
            <ToggleSwitch
              enabled={settings.sms_booking_reminder}
              onChange={(value) => updateSetting('sms_booking_reminder', value)}
              label="Booking Reminders"
              description="Send appointment reminder texts"
            />
            <ToggleSwitch
              enabled={settings.sms_booking_cancelled}
              onChange={(value) => updateSetting('sms_booking_cancelled', value)}
              label="Booking Cancellations"
              description="Notify customers of cancelled appointments"
            />
            <ToggleSwitch
              enabled={settings.sms_payment_received}
              onChange={(value) => updateSetting('sms_payment_received', value)}
              label="Payment Received"
              description="Send payment confirmation texts"
            />
            <ToggleSwitch
              enabled={settings.sms_urgent_updates}
              onChange={(value) => updateSetting('sms_urgent_updates', value)}
              label="Urgent Updates"
              description="Send critical notifications via SMS"
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

export default NotificationsSettingsTab;
