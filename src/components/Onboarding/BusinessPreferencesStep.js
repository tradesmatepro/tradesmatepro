import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../utils/supabaseClient';
import {
  CogIcon,
  ClockIcon,
  BellIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const BusinessPreferencesStep = ({ onComplete, onValidationChange }) => {
  const { user } = useUser();
  const [preferences, setPreferences] = useState({
    // Business Hours
    business_hours: {
      monday: { open: '08:00', close: '17:00', closed: false },
      tuesday: { open: '08:00', close: '17:00', closed: false },
      wednesday: { open: '08:00', close: '17:00', closed: false },
      thursday: { open: '08:00', close: '17:00', closed: false },
      friday: { open: '08:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '15:00', closed: false },
      sunday: { open: '10:00', close: '14:00', closed: true }
    },
    // Scheduling
    default_job_duration: 60,
    buffer_time: 15,
    advance_booking_days: 30,
    // Notifications
    email_notifications: true,
    sms_notifications: false,
    quote_expiry_days: 30,
    // Customer Communication
    auto_confirm_appointments: false,
    send_arrival_notifications: true,
    follow_up_after_completion: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  // Load existing preferences
  useEffect(() => {
    loadPreferences();
  }, [user?.company_id]);

  const loadPreferences = async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_id', user.company_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences(prev => ({
          ...prev,
          business_hours: data.business_hours || prev.business_hours,
          default_job_duration: data.default_job_duration || prev.default_job_duration,
          buffer_time: data.buffer_time || prev.buffer_time,
          advance_booking_days: data.advance_booking_days || prev.advance_booking_days,
          email_notifications: data.email_notifications ?? prev.email_notifications,
          sms_notifications: data.sms_notifications ?? prev.sms_notifications,
          quote_expiry_days: data.quote_expiry_days || prev.quote_expiry_days,
          auto_confirm_appointments: data.auto_confirm_appointments ?? prev.auto_confirm_appointments,
          send_arrival_notifications: data.send_arrival_notifications ?? prev.send_arrival_notifications,
          follow_up_after_completion: data.follow_up_after_completion ?? prev.follow_up_after_completion
        }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validate preferences
  const validatePreferences = () => {
    const warnings = [];
    
    // Check if all days are closed
    const allDaysClosed = Object.values(preferences.business_hours).every(day => day.closed);
    if (allDaysClosed) {
      warnings.push('Consider setting business hours so customers know when you\'re available');
    }

    onValidationChange?.({
      valid: true, // Preferences are always optional
      errors: [],
      warnings
    });

    return true;
  };

  // Validate on preferences change
  useEffect(() => {
    if (!loading) {
      validatePreferences();
    }
  }, [preferences, loading]);

  // Update business hours
  const updateBusinessHours = (day, field, value) => {
    setPreferences(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: {
          ...prev.business_hours[day],
          [field]: value
        }
      }
    }));
  };

  // Update preference
  const updatePreference = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  // Save preferences
  const savePreferences = async () => {
    if (!user?.company_id) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('company_settings')
        .upsert({
          company_id: user.company_id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      onComplete?.(preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <CogIcon className="w-12 h-12 text-orange-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Preferences</h2>
        <p className="text-gray-600">
          Configure your business hours, scheduling preferences, and communication settings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Business Hours */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-orange-600" />
            Business Hours
          </h3>
          <div className="space-y-3">
            {days.map(day => (
              <div key={day.key} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                  {day.label}
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.business_hours[day.key].closed}
                    onChange={(e) => updateBusinessHours(day.key, 'closed', e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-600">Closed</span>
                </label>
                {!preferences.business_hours[day.key].closed && (
                  <>
                    <input
                      type="time"
                      value={preferences.business_hours[day.key].open}
                      onChange={(e) => updateBusinessHours(day.key, 'open', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={preferences.business_hours[day.key].close}
                      onChange={(e) => updateBusinessHours(day.key, 'close', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scheduling Preferences */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Scheduling Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Job Duration (minutes)
              </label>
              <input
                type="number"
                value={preferences.default_job_duration}
                onChange={(e) => updatePreference('default_job_duration', parseInt(e.target.value) || 60)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="15"
                step="15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buffer Time (minutes)
              </label>
              <input
                type="number"
                value={preferences.buffer_time}
                onChange={(e) => updatePreference('buffer_time', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="0"
                step="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advance Booking (days)
              </label>
              <input
                type="number"
                value={preferences.advance_booking_days}
                onChange={(e) => updatePreference('advance_booking_days', parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Communication Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <BellIcon className="w-5 h-5 text-orange-600" />
            Communication Settings
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Notifications</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={preferences.email_notifications}
                      onChange={(e) => updatePreference('email_notifications', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Email notifications</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={preferences.sms_notifications}
                      onChange={(e) => updatePreference('sms_notifications', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">SMS notifications</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Customer Communication</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={preferences.auto_confirm_appointments}
                      onChange={(e) => updatePreference('auto_confirm_appointments', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Auto-confirm appointments</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={preferences.send_arrival_notifications}
                      onChange={(e) => updatePreference('send_arrival_notifications', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Send arrival notifications</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={preferences.follow_up_after_completion}
                      onChange={(e) => updatePreference('follow_up_after_completion', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Follow up after job completion</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Expiry (days)
              </label>
              <input
                type="number"
                value={preferences.quote_expiry_days}
                onChange={(e) => updatePreference('quote_expiry_days', parseInt(e.target.value) || 30)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="1"
              />
              <p className="text-sm text-gray-600 mt-1">
                How long quotes remain valid before expiring
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="text-center mt-8">
        <button
          onClick={savePreferences}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Save Preferences & Continue
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BusinessPreferencesStep;
