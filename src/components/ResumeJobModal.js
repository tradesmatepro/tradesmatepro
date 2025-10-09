import React, { useState } from 'react';
import { 
  XMarkIcon, 
  PlayIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

/**
 * ResumeJobModal
 * 
 * Purpose: Resume job from on-hold status
 * Industry Standard: ServiceTitan has this, Jobber basic, Housecall Pro basic
 * 
 * What it does:
 * 1. Confirms hold issue is resolved
 * 2. Records resolution notes
 * 3. Choose next status (scheduled or in_progress)
 * 4. Optional: Reschedule if needed
 * 5. Changes status from 'on_hold' → 'scheduled' or 'in_progress'
 * 6. Records resumed_at timestamp
 * 
 * Part of: Phase 2E - Medium Priority
 * Competitive Advantage: Better workflow than competitors
 */

const ResumeJobModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  onSchedule,
  jobTitle,
  onHoldReason,
  onHoldSince 
}) => {
  const [formData, setFormData] = useState({
    resumeAction: 'schedule', // 'schedule' or 'start_now'
    resolutionNotes: '',
    issueResolved: false
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.issueResolved) {
      newErrors.issueResolved = 'Please confirm the issue is resolved before resuming';
    }
    
    if (!formData.resolutionNotes.trim()) {
      newErrors.resolutionNotes = 'Please describe how the issue was resolved';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    
    const resumeData = {
      resumeAction: formData.resumeAction,
      resolutionNotes: formData.resolutionNotes.trim(),
      issueResolved: formData.issueResolved
    };
    
    if (formData.resumeAction === 'schedule' && onSchedule) {
      onSchedule(resumeData);
    } else {
      onConfirm(resumeData);
    }
    
    // Reset form
    setFormData({
      resumeAction: 'schedule',
      resolutionNotes: '',
      issueResolved: false
    });
    setErrors({});
  };

  const getOnHoldDuration = () => {
    if (!onHoldSince) return null;
    const holdDate = new Date(onHoldSince);
    const now = new Date();
    const diffDays = Math.floor((now - holdDate) / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((now - holdDate) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
      return 'Less than 1 hour';
    }
  };

  const holdDuration = getOnHoldDuration();

  // Map hold reason codes to readable text
  const getReadableReason = (reason) => {
    const reasonMap = {
      'customer_not_ready': 'Customer Not Ready',
      'customer_requested_delay': 'Customer Requested Delay',
      'customer_unavailable': 'Customer Unavailable',
      'awaiting_customer_decision': 'Awaiting Customer Decision',
      'awaiting_customer_payment': 'Awaiting Customer Payment',
      'awaiting_parts': 'Awaiting Parts/Materials',
      'parts_on_backorder': 'Parts on Backorder',
      'wrong_parts_delivered': 'Wrong Parts Delivered',
      'awaiting_permit': 'Awaiting Permit/Approval',
      'awaiting_inspection': 'Awaiting Inspection',
      'awaiting_hoa_approval': 'Awaiting HOA Approval',
      'weather_delay': 'Weather Delay',
      'site_not_accessible': 'Site Not Accessible',
      'unsafe_conditions': 'Unsafe Conditions',
      'technician_unavailable': 'Technician Unavailable',
      'equipment_unavailable': 'Equipment Unavailable',
      'scheduling_conflict': 'Scheduling Conflict',
      'other': 'Other'
    };
    return reasonMap[reason] || reason;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Resume Job</h2>
              <p className="text-sm text-gray-500 mt-0.5">{jobTitle}</p>
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
          {/* On-Hold Summary */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-orange-900 mb-2">Job has been on hold</p>
            <div className="space-y-1 text-xs text-orange-700">
              <p><span className="font-semibold">Reason:</span> {getReadableReason(onHoldReason)}</p>
              {holdDuration && <p><span className="font-semibold">Duration:</span> {holdDuration}</p>}
            </div>
          </div>

          {/* Issue Resolved Confirmation */}
          <div className="mb-6">
            <label className={`flex items-start gap-3 cursor-pointer p-4 border-2 rounded-lg transition-all ${
              formData.issueResolved 
                ? 'border-green-500 bg-green-50' 
                : errors.issueResolved 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="checkbox"
                checked={formData.issueResolved}
                onChange={(e) => handleChange('issueResolved', e.target.checked)}
                className="mt-1"
              />
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Issue has been resolved <span className="text-red-500">*</span>
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Confirm that the reason for the hold has been addressed
                </p>
              </div>
            </label>
            {errors.issueResolved && (
              <p className="mt-2 text-sm text-red-600">{errors.issueResolved}</p>
            )}
          </div>

          {/* Resolution Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How was the issue resolved? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.resolutionNotes}
              onChange={(e) => handleChange('resolutionNotes', e.target.value)}
              placeholder="Describe what was done to resolve the hold (e.g., 'Parts arrived', 'Customer approved', 'Permit obtained', etc.)..."
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                errors.resolutionNotes ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.resolutionNotes && (
              <p className="mt-2 text-sm text-red-600">{errors.resolutionNotes}</p>
            )}
          </div>

          {/* Resume Action */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What would you like to do next?
            </label>
            <div className="space-y-3">
              <label
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.resumeAction === 'schedule'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="resume-action"
                  value="schedule"
                  checked={formData.resumeAction === 'schedule'}
                  onChange={(e) => handleChange('resumeAction', e.target.value)}
                  className="mt-1 mr-3"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">📅 Schedule the job</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Open Smart Scheduling Assistant to schedule when to resume work
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.resumeAction === 'start_now'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="resume-action"
                  value="start_now"
                  checked={formData.resumeAction === 'start_now'}
                  onChange={(e) => handleChange('resumeAction', e.target.value)}
                  className="mt-1 mr-3"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">▶️ Start work now</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Resume work immediately and change status to "In Progress"
                  </p>
                </div>
              </label>
            </div>
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
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
          >
            <PlayIcon className="w-5 h-5" />
            {formData.resumeAction === 'schedule' ? 'Schedule Job' : 'Start Job Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeJobModal;

