import React, { useState } from 'react';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

/**
 * ReschedulingModal - Captures rescheduling details and offers immediate rescheduling
 * 
 * Competitive Advantage: Streamlined rescheduling workflow
 * - Capture WHY job needs rescheduling
 * - Option to reschedule immediately via Smart Scheduling Assistant
 * - Or defer to "Needs Rescheduling" queue
 */
const ReschedulingModal = ({ isOpen, onClose, onConfirm, onRescheduleNow, jobTitle }) => {
  const [formData, setFormData] = useState({
    reason: '',
    notes: '',
    rescheduleNow: false
  });

  const [errors, setErrors] = useState({});

  const reschedulingReasons = [
    { value: '', label: 'Select a reason...', disabled: true },
    
    // Customer-Initiated
    { value: 'customer_request', label: '👤 Customer Requested Reschedule', category: 'customer' },
    { value: 'customer_unavailable', label: '👤 Customer Not Available', category: 'customer' },
    { value: 'customer_emergency', label: '👤 Customer Emergency', category: 'customer' },
    
    // Company-Initiated
    { value: 'technician_unavailable', label: '🔧 Technician Unavailable', category: 'company' },
    { value: 'equipment_issue', label: '🔧 Equipment Not Available', category: 'company' },
    { value: 'parts_delay', label: '🔧 Parts/Materials Delayed', category: 'company' },
    { value: 'crew_shortage', label: '🔧 Crew Shortage', category: 'company' },
    { value: 'overbooked', label: '🔧 Schedule Overbooked', category: 'company' },
    
    // External Factors
    { value: 'weather', label: '🌧️ Weather Conditions', category: 'external' },
    { value: 'permit_delay', label: '📋 Permit Delay', category: 'external' },
    { value: 'site_not_ready', label: '🏗️ Site Not Ready', category: 'external' },
    { value: 'emergency_priority', label: '🚨 Emergency Job Priority', category: 'external' },
    
    { value: 'other', label: '📝 Other (explain in notes)', category: 'other' }
  ];

  const handleConfirm = () => {
    // Validate
    const newErrors = {};
    if (!formData.reason) {
      newErrors.reason = 'Please select a reason';
    }
    if (formData.reason === 'other' && !formData.notes.trim()) {
      newErrors.notes = 'Please provide details when selecting "Other"';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // If user wants to reschedule now, call onRescheduleNow
    if (formData.rescheduleNow) {
      onRescheduleNow(formData);
    } else {
      // Otherwise, just mark as needs_rescheduling
      onConfirm(formData);
    }

    // Reset form
    setFormData({ reason: '', notes: '', rescheduleNow: false });
    setErrors({});
  };

  const handleClose = () => {
    setFormData({ reason: '', notes: '', rescheduleNow: false });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Reschedule Job</h2>
              <p className="text-sm text-gray-500 mt-1">{jobTitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">This will free up the technician's calendar</p>
              <p className="mt-1">The current schedule will be cancelled and the technician's time slot will become available.</p>
            </div>
          </div>

          {/* Reason Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rescheduling <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.reason}
              onChange={(e) => {
                setFormData({ ...formData, reason: e.target.value });
                setErrors({ ...errors, reason: '' });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {reschedulingReasons.map((reason) => (
                <option key={reason.value} value={reason.value} disabled={reason.disabled}>
                  {reason.label}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes {formData.reason === 'other' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => {
                setFormData({ ...formData, notes: e.target.value });
                setErrors({ ...errors, notes: '' });
              }}
              rows={4}
              placeholder="Provide any additional details about why this job needs to be rescheduled..."
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none ${
                errors.notes ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              These notes will be saved with the job for future reference
            </p>
          </div>

          {/* Reschedule Now Option */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rescheduleNow}
                onChange={(e) => setFormData({ ...formData, rescheduleNow: e.target.checked })}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Reschedule this job now</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Opens Smart Scheduling Assistant to find the next available time slot
                </p>
              </div>
            </label>
          </div>

          {/* Info: What happens if not rescheduled now */}
          {!formData.rescheduleNow && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">If you don't reschedule now:</span>
              </p>
              <ul className="mt-2 text-sm text-gray-600 space-y-1 ml-4 list-disc">
                <li>Job will be marked as "Needs Rescheduling"</li>
                <li>Appears in unscheduled jobs queue with yellow badge</li>
                <li>Can be rescheduled later from Jobs page or Calendar</li>
                <li>Technician's time slot is freed up immediately</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
          >
            {formData.rescheduleNow ? (
              <>
                <CalendarIcon className="h-4 w-4" />
                <span>Reschedule Now</span>
              </>
            ) : (
              <>
                <ClockIcon className="h-4 w-4" />
                <span>Mark as Needs Rescheduling</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReschedulingModal;

