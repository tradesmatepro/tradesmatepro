import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import {
  ClockIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const SchedulingSetupStep = ({ onNext, onBack, onValidationChange }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    business_hours_start: '08:00',
    business_hours_end: '17:00',
    working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timezone: 'America/Los_Angeles',
    job_buffer_minutes: 30,
    default_buffer_before_minutes: 30,
    default_buffer_after_minutes: 30,
    min_advance_booking_hours: 2,
    max_advance_booking_days: 90
  });

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' }
  ];

  const weekdays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  // Load existing settings
  useEffect(() => {
    loadSettings();
  }, []);

  // Validate on mount and when formData changes
  useEffect(() => {
    const isValid = validateForm();
    onValidationChange?.(isValid);
  }, [formData]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await supaFetch(
        `settings?company_id=eq.${user.company_id}&select=*`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const settings = data[0];
          // Convert working_days from JSONB object to array
          let workingDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

          if (settings.working_days) {
            if (typeof settings.working_days === 'object' && !Array.isArray(settings.working_days)) {
              // JSONB format: {monday: true, tuesday: true, ...}
              workingDays = Object.keys(settings.working_days)
                .filter(day => settings.working_days[day] === true);
            } else if (Array.isArray(settings.working_days)) {
              // Array format
              workingDays = settings.working_days;
            } else if (typeof settings.working_days === 'string') {
              // String format: "monday,tuesday,..."
              workingDays = settings.working_days.split(',').map(d => d.trim()).filter(d => d);
            }
          }

          setFormData({
            business_hours_start: settings.business_hours_start || '08:00',
            business_hours_end: settings.business_hours_end || '17:00',
            working_days: workingDays,
            timezone: settings.timezone || 'America/Los_Angeles',
            job_buffer_minutes: settings.job_buffer_minutes || 30,
            default_buffer_before_minutes: settings.default_buffer_before_minutes || 30,
            default_buffer_after_minutes: settings.default_buffer_after_minutes || 30,
            min_advance_booking_hours: settings.min_advance_booking_hours || 2,
            max_advance_booking_days: settings.max_advance_booking_days || 90
          });
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    // Must have at least one working day
    if (!formData.working_days || formData.working_days.length === 0) {
      return false;
    }

    // Business hours must be valid
    if (!formData.business_hours_start || !formData.business_hours_end) {
      return false;
    }

    // End time must be after start time
    const start = formData.business_hours_start.split(':').map(Number);
    const end = formData.business_hours_end.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    if (endMinutes <= startMinutes) {
      return false;
    }

    return true;
  };

  const handleWorkingDayToggle = (day) => {
    const newWorkingDays = formData.working_days.includes(day)
      ? formData.working_days.filter(d => d !== day)
      : [...formData.working_days, day];
    
    setFormData({ ...formData, working_days: newWorkingDays });
  };

  const handleSave = async () => {
    if (!validateForm()) {
      alert('Please fix validation errors before continuing');
      return;
    }

    try {
      setSaving(true);

      // Convert working_days array to JSONB object format
      const workingDaysObj = {};
      const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      allDays.forEach(day => {
        workingDaysObj[day] = formData.working_days.includes(day);
      });

      // Update settings table
      const response = await supaFetch(
        `settings?company_id=eq.${user.company_id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_hours_start: formData.business_hours_start,
            business_hours_end: formData.business_hours_end,
            working_days: workingDaysObj,
            timezone: formData.timezone,
            job_buffer_minutes: parseInt(formData.job_buffer_minutes),
            default_buffer_before_minutes: parseInt(formData.default_buffer_before_minutes),
            default_buffer_after_minutes: parseInt(formData.default_buffer_after_minutes),
            min_advance_booking_hours: parseInt(formData.min_advance_booking_hours),
            max_advance_booking_days: parseInt(formData.max_advance_booking_days)
          })
        },
        user.company_id
      );

      if (!response.ok) {
        throw new Error('Failed to save scheduling settings');
      }

      console.log('✅ Scheduling settings saved successfully');
      onNext?.();
    } catch (error) {
      console.error('Error saving scheduling settings:', error);
      alert('Failed to save scheduling settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isValid = validateForm();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
          <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Scheduling Setup</h2>
        <p className="mt-2 text-sm text-gray-600">
          Configure your business hours and scheduling preferences for customer self-scheduling
        </p>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClockIcon className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={formData.business_hours_start}
              onChange={(e) => setFormData({ ...formData, business_hours_start: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="time"
              value={formData.business_hours_end}
              onChange={(e) => setFormData({ ...formData, business_hours_end: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {timezones.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Working Days */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Days</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {weekdays.map(day => (
            <button
              key={day.value}
              type="button"
              onClick={() => handleWorkingDayToggle(day.value)}
              className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                formData.working_days.includes(day.value)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
        {formData.working_days.length === 0 && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <ExclamationTriangleIcon className="h-4 w-4" />
            Please select at least one working day
          </p>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buffer Between Jobs (minutes)
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={formData.job_buffer_minutes}
              onChange={(e) => setFormData({ ...formData, job_buffer_minutes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Advance Booking (hours)
            </label>
            <input
              type="number"
              min="0"
              max="72"
              value={formData.min_advance_booking_hours}
              onChange={(e) => setFormData({ ...formData, min_advance_booking_hours: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Validation Status */}
      {isValid && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-3">
          <CheckCircleIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Scheduling settings are valid</span>
        </div>
      )}

      {/* Note: Buttons are handled by OnboardingWizard parent component */}
    </div>
  );
};

export default SchedulingSetupStep;

