import React, { useState } from 'react';
import { 
  XMarkIcon, 
  ClockIcon,
  BellAlertIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';

/**
 * FollowUpModal
 * 
 * Purpose: Schedule follow-up for quote
 * Industry Standard: ServiceTitan has this, Jobber has reminders, Housecall Pro basic
 * 
 * What it does:
 * 1. Sets follow-up date/time
 * 2. Chooses follow-up method (call, email, SMS, visit)
 * 3. Sets reminder (1 day before, same day, etc.)
 * 4. Captures follow-up reason/notes
 * 5. Changes status from 'sent/presented' → 'follow_up'
 * 6. Records follow_up_scheduled_at timestamp
 * 
 * Part of: Phase 2D - High Priority
 * Competitive Advantage: Match ServiceTitan
 * 
 * TODO Phase 5:
 * - Automatic reminders/notifications
 * - Calendar integration
 * - Task creation
 */

const FollowUpModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  quoteTitle,
  customerName 
}) => {
  const [formData, setFormData] = useState({
    followUpDate: '',
    followUpTime: '09:00',
    followUpMethod: 'call',
    reminderTime: '1_day_before',
    reason: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const followUpMethods = [
    { value: 'call', label: '📞 Phone Call', icon: '📞' },
    { value: 'email', label: '📧 Email', icon: '📧' },
    { value: 'sms', label: '💬 Text Message', icon: '💬' },
    { value: 'visit', label: '🏠 In-Person Visit', icon: '🏠' },
    { value: 'other', label: '📋 Other', icon: '📋' }
  ];

  const reminderOptions = [
    { value: 'none', label: 'No reminder' },
    { value: '1_hour_before', label: '1 hour before' },
    { value: '2_hours_before', label: '2 hours before' },
    { value: 'same_day_morning', label: 'Same day (9 AM)' },
    { value: '1_day_before', label: '1 day before' },
    { value: '2_days_before', label: '2 days before' },
    { value: '1_week_before', label: '1 week before' }
  ];

  const commonReasons = [
    'Check if customer has questions',
    'Discuss pricing options',
    'Answer technical questions',
    'Schedule site visit',
    'Provide additional information',
    'Close the sale',
    'Check decision timeline',
    'Address concerns',
    'Offer alternative solutions',
    'Custom reason (specify below)'
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.followUpDate) {
      newErrors.followUpDate = 'Follow-up date is required';
    }
    
    if (!formData.reason) {
      newErrors.reason = 'Please select or enter a reason';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    
    onConfirm({
      followUpDate: formData.followUpDate,
      followUpTime: formData.followUpTime,
      followUpMethod: formData.followUpMethod,
      reminderTime: formData.reminderTime,
      reason: formData.reason,
      notes: formData.notes.trim()
    });
    
    // Reset form
    setFormData({
      followUpDate: '',
      followUpTime: '09:00',
      followUpMethod: 'call',
      reminderTime: '1_day_before',
      reason: '',
      notes: ''
    });
    setErrors({});
  };

  const getFollowUpDateTime = () => {
    if (!formData.followUpDate) return null;
    return new Date(`${formData.followUpDate}T${formData.followUpTime}`);
  };

  const followUpDateTime = getFollowUpDateTime();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Schedule Follow-Up</h2>
              <p className="text-sm text-gray-500 mt-0.5">{quoteTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Info Message */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <BellAlertIcon className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-900 mb-1">
                  Schedule a follow-up with {customerName}
                </p>
                <p className="text-xs text-orange-700">
                  Set a reminder to follow up on this quote at the right time
                </p>
              </div>
            </div>
          </div>

          {/* Follow-Up Date & Time */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-Up Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => handleChange('followUpDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.followUpDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.followUpDate && (
                <p className="mt-1 text-sm text-red-600">{errors.followUpDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-Up Time
              </label>
              <input
                type="time"
                value={formData.followUpTime}
                onChange={(e) => handleChange('followUpTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Preview */}
          {followUpDateTime && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Follow up on:</span>{' '}
                  {followUpDateTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} at {followUpDateTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Follow-Up Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Follow-Up Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {followUpMethods.map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.followUpMethod === method.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="follow-up-method"
                    value={method.value}
                    checked={formData.followUpMethod === method.value}
                    onChange={(e) => handleChange('followUpMethod', e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-900">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reminder Time */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder
              <span className="text-xs text-gray-500 font-normal ml-2">(Phase 5: Auto-notifications)</span>
            </label>
            <select
              value={formData.reminderTime}
              onChange={(e) => handleChange('reminderTime', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {reminderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              📅 Automatic reminder notifications coming in Phase 5
            </p>
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Follow-Up <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.reason ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select a reason...</option>
              {commonReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className="mt-2 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Additional Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional context or talking points for the follow-up..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors flex items-center gap-2"
          >
            <ClockIcon className="w-5 h-5" />
            Schedule Follow-Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;

