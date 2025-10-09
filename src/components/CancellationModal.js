import React, { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Cancellation Modal Component
 * Competitive Advantage: Better tracking than ServiceTitan/Jobber/Housecall Pro
 * - 20 cancellation reasons (vs their 5-7)
 * - Track who initiated (customer vs company)
 * - Required notes for "other" reason
 * - Better metrics and reporting
 */
const CancellationModal = ({ isOpen, onClose, onConfirm, jobTitle = 'this job' }) => {
  const [formData, setFormData] = useState({
    initiatedBy: 'customer',
    reason: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Cancellation reasons grouped by category
  const cancellationReasons = {
    'Customer-Initiated': [
      { value: 'customer_budget', label: 'Budget Constraints' },
      { value: 'customer_timing', label: 'Wants to Wait/Delay' },
      { value: 'customer_found_other', label: 'Found Another Provider' },
      { value: 'customer_no_response', label: 'No Response/Ghosted' },
      { value: 'customer_changed_mind', label: 'Changed Mind/No Longer Needed' },
      { value: 'customer_dissatisfied', label: 'Dissatisfied with Quote/Proposal' }
    ],
    'Company-Initiated': [
      { value: 'company_capacity', label: 'At Capacity/Too Busy' },
      { value: 'company_outside_area', label: 'Outside Service Area' },
      { value: 'company_not_qualified', label: 'Lack Expertise/Equipment' },
      { value: 'company_unprofitable', label: 'Not Profitable Enough' }
    ],
    'Mutual/External': [
      { value: 'pricing_disagreement', label: 'Pricing Disagreement' },
      { value: 'scheduling_conflict', label: 'Scheduling Conflict' },
      { value: 'scope_changed', label: 'Scope Changed Significantly' },
      { value: 'duplicate', label: 'Duplicate Work Order' },
      { value: 'entered_in_error', label: 'Entered in Error' },
      { value: 'weather', label: 'Weather Prevented Work' },
      { value: 'emergency', label: 'Emergency Cancellation' },
      { value: 'permit_issues', label: 'Permit/Regulatory Issues' },
      { value: 'property_sold', label: 'Property Sold/Changed Ownership' },
      { value: 'other', label: 'Other (Explain in Notes)' }
    ]
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.reason) {
      newErrors.reason = 'Please select a cancellation reason';
    }

    // Require notes if reason is "other"
    if (formData.reason === 'other' && !formData.notes.trim()) {
      newErrors.notes = 'Notes are required when selecting "Other"';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onConfirm(formData);
      // Reset form
      setFormData({
        initiatedBy: 'customer',
        reason: '',
        notes: ''
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    // Reset form on close
    setFormData({
      initiatedBy: 'customer',
      reason: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose}></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel Job</h3>
                <p className="text-sm text-gray-500">Provide cancellation details for tracking</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Job Title */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Cancelling:</p>
              <p className="text-base font-semibold text-gray-900">{jobTitle}</p>
            </div>

            {/* Who Initiated */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Who is initiating the cancellation? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'customer', label: 'Customer', icon: '👤' },
                  { value: 'company', label: 'Company', icon: '🏢' },
                  { value: 'mutual', label: 'Mutual', icon: '🤝' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('initiatedBy', option.value)}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                      formData.initiatedBy === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-2">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cancellation Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a reason...</option>
                {Object.entries(cancellationReasons).map(([category, reasons]) => (
                  <optgroup key={category} label={category}>
                    {reasons.map(reason => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </optgroup>
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
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
                placeholder="Provide additional details about the cancellation..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.notes ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                These notes will help track patterns and improve future estimates
              </p>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">This action cannot be undone</h4>
                  <p className="mt-1 text-sm text-yellow-700">
                    The job will be moved to Closed Jobs and marked as cancelled. You can view it in the History section.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Keep Job
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;

