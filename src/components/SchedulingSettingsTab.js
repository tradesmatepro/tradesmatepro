import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { getSchedulingSettings, DEFAULT_SCHEDULING_SETTINGS } from '../utils/smartScheduling';
import { supaFetch } from '../utils/supaFetch';
import {
  ClockIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  BellIcon,
  CogIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const SchedulingSettingsTab = () => {
  const { user } = useUser();
  const [settings, setSettings] = useState(DEFAULT_SCHEDULING_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await getSchedulingSettings(user.company_id);
      setSettings(currentSettings);
    } catch (error) {
      showAlert('error', 'Failed to load scheduling settings');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleWorkingDayToggle = (dayIndex) => {
    setSettings(prev => ({
      ...prev,
      working_days: prev.working_days.includes(dayIndex)
        ? prev.working_days.filter(d => d !== dayIndex)
        : [...prev.working_days, dayIndex].sort()
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      console.log('💾 Saving scheduling settings:', settings);

      const payload = {
        job_buffer_minutes: settings.job_buffer_minutes,
        default_buffer_before_minutes: settings.default_buffer_before_minutes,
        default_buffer_after_minutes: settings.default_buffer_after_minutes,
        enable_customer_self_scheduling: settings.enable_customer_self_scheduling,
        auto_approve_customer_selections: settings.auto_approve_customer_selections,
        business_hours_start: settings.business_hours_start,
        business_hours_end: settings.business_hours_end,
        working_days: settings.working_days,
        min_advance_booking_hours: settings.min_advance_booking_hours,
        max_advance_booking_days: settings.max_advance_booking_days
      };

      // Primary: save to companies (source of truth going forward)
      const response = await supaFetch(`companies?id=eq.${user.company_id}`, {
        method: 'PATCH',
        body: payload
      }, user.company_id);

      if (response.ok) {
        console.log('✅ Scheduling settings saved to companies');
        showAlert('success', 'Scheduling settings saved successfully');
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to save scheduling settings to companies:', response.status, errorText);
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving scheduling settings:', error);
      showAlert('error', 'Failed to save scheduling settings');
    } finally {
      setSaving(false);
    }
  };

  const weekDays = [
    { index: 0, name: 'Sunday', short: 'Sun' },
    { index: 1, name: 'Monday', short: 'Mon' },
    { index: 2, name: 'Tuesday', short: 'Tue' },
    { index: 3, name: 'Wednesday', short: 'Wed' },
    { index: 4, name: 'Thursday', short: 'Thu' },
    { index: 5, name: 'Friday', short: 'Fri' },
    { index: 6, name: 'Saturday', short: 'Sat' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-md ${
          alert.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {alert.message}
        </div>
      )}

      {/* Smart Scheduling Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CalendarDaysIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Smart Scheduling Assistant</h3>
            <p className="text-sm text-blue-700 mt-1">
              Configure intelligent scheduling features that help optimize appointment booking and enable customer self-scheduling.
            </p>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={settings.business_hours_start}
              onChange={(e) => handleSettingChange('business_hours_start', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="time"
              value={settings.business_hours_end}
              onChange={(e) => handleSettingChange('business_hours_end', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Working Days
          </label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map(day => (
              <button
                key={day.index}
                onClick={() => handleWorkingDayToggle(day.index)}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  settings.working_days.includes(day.index)
                    ? 'bg-primary-100 border-primary-300 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {day.short}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scheduling Rules */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <ClockIcon className="w-5 h-5 inline mr-2" />
          Scheduling Rules
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buffer Before Job (minutes)
            </label>
            <input
              type="number"
              min="0"
              max="120"
              step="15"
              value={settings.default_buffer_before_minutes}
              onChange={(e) => handleSettingChange('default_buffer_before_minutes', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Time buffer before each appointment
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buffer After Job (minutes)
            </label>
            <input
              type="number"
              min="0"
              max="120"
              step="15"
              value={settings.default_buffer_after_minutes}
              onChange={(e) => handleSettingChange('default_buffer_after_minutes', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Time buffer after each appointment
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Legacy Buffer (minutes)
            </label>
            <input
              type="number"
              min="0"
              max="120"
              step="15"
              value={settings.job_buffer_minutes}
              onChange={(e) => handleSettingChange('job_buffer_minutes', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              For backward compatibility
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Advance Booking (hours)
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={settings.min_advance_booking_hours}
              onChange={(e) => handleSettingChange('min_advance_booking_hours', parseInt(e.target.value) || 24)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum time required before an appointment can be booked
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Advance Booking (days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={settings.max_advance_booking_days}
              onChange={(e) => handleSettingChange('max_advance_booking_days', parseInt(e.target.value) || 30)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              How far in advance customers can book appointments
            </p>
          </div>
        </div>
      </div>

      {/* Customer Self-Scheduling */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <UserGroupIcon className="w-5 h-5 inline mr-2" />
          Customer Self-Scheduling
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Enable Customer Self-Scheduling</h4>
              <p className="text-sm text-gray-500">
                Allow customers to schedule their own appointments from quotes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_customer_self_scheduling}
                onChange={(e) => handleSettingChange('enable_customer_self_scheduling', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {settings.enable_customer_self_scheduling && (
            <div className="flex items-center justify-between pl-4 border-l-2 border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Auto-Approve Customer Selections</h4>
                <p className="text-sm text-gray-500">
                  Automatically confirm customer-selected appointments without manual approval
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.auto_approve_customer_selections}
                  onChange={(e) => handleSettingChange('auto_approve_customer_selections', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          )}

          {settings.enable_customer_self_scheduling && !settings.auto_approve_customer_selections && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <strong>Manual Approval Required:</strong> Customer appointments will need to be manually approved before confirmation.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <CheckIcon className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SchedulingSettingsTab;
