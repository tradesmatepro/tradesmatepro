import React, { useState } from 'react';
import { 
  XMarkIcon, 
  PauseCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

/**
 * OnHoldModal
 * 
 * Purpose: Capture details when job is put on hold
 * Industry Standard: ServiceTitan, Jobber, Housecall Pro all track hold reasons
 * 
 * What it does:
 * 1. Asks WHY job is on hold (15 common reasons)
 * 2. Captures estimated resume date
 * 3. Optional notes
 * 4. Tracks who put it on hold
 * 5. Auto-frees technician calendar (via trigger)
 * 
 * Part of: Phase 2 - Smart Status Progression
 * Competitive Advantage: Better tracking than competitors
 */

const OnHoldModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  jobTitle 
}) => {
  const [formData, setFormData] = useState({
    reason: '',
    estimatedResumeDate: '',
    notes: '',
    notifyCustomer: false
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  // Industry-standard on-hold reasons (researched from ServiceTitan, Jobber, Housecall Pro)
  const onHoldReasons = [
    // Customer-Related
    { value: 'customer_not_ready', label: '👤 Customer Not Ready', category: 'Customer' },
    { value: 'customer_requested_delay', label: '👤 Customer Requested Delay', category: 'Customer' },
    { value: 'customer_unavailable', label: '👤 Customer Unavailable', category: 'Customer' },
    { value: 'awaiting_customer_decision', label: '👤 Awaiting Customer Decision', category: 'Customer' },
    { value: 'awaiting_customer_payment', label: '💰 Awaiting Customer Payment', category: 'Customer' },
    
    // Parts/Materials
    { value: 'awaiting_parts', label: '📦 Awaiting Parts/Materials', category: 'Parts' },
    { value: 'parts_on_backorder', label: '📦 Parts on Backorder', category: 'Parts' },
    { value: 'wrong_parts_delivered', label: '📦 Wrong Parts Delivered', category: 'Parts' },
    
    // Permits/Approvals
    { value: 'awaiting_permit', label: '📋 Awaiting Permit/Approval', category: 'Permits' },
    { value: 'awaiting_inspection', label: '📋 Awaiting Inspection', category: 'Permits' },
    { value: 'awaiting_hoa_approval', label: '📋 Awaiting HOA Approval', category: 'Permits' },
    
    // Weather/Site Conditions
    { value: 'weather_delay', label: '🌧️ Weather Delay', category: 'Conditions' },
    { value: 'site_not_accessible', label: '🚧 Site Not Accessible', category: 'Conditions' },
    { value: 'unsafe_conditions', label: '⚠️ Unsafe Working Conditions', category: 'Conditions' },

    // Company/Resource Issues
    { value: 'technician_unavailable', label: '🔧 Technician Unavailable', category: 'Company' },
    { value: 'equipment_unavailable', label: '🛠️ Equipment Unavailable', category: 'Company' },
    { value: 'scheduling_conflict', label: '📅 Scheduling Conflict', category: 'Company' },

    // Other
    { value: 'other', label: '📝 Other (Specify in Notes)', category: 'Other' }
  ];

  // Group reasons by category
  const groupedReasons = onHoldReasons.reduce((acc, reason) => {
    if (!acc[reason.category]) {
      acc[reason.category] = [];
    }
    acc[reason.category].push(reason);
    return acc;
  }, {});

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
      newErrors.reason = 'Please select a reason';
    }

    if (formData.reason === 'other' && !formData.notes.trim()) {
      newErrors.notes = 'Please provide details when selecting "Other"';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;

    onConfirm({
      reason: formData.reason,
      estimatedResumeDate: formData.estimatedResumeDate || null,
      notes: formData.notes.trim(),
      notifyCustomer: formData.notifyCustomer
    });

    // Reset form
    setFormData({
      reason: '',
      estimatedResumeDate: '',
      notes: '',
      notifyCustomer: false
    });
    setErrors({});
  };

  const getReasonLabel = (value) => {
    const reason = onHoldReasons.find(r => r.value === value);
    return reason ? reason.label : value;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <PauseCircleIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Put Job On Hold</h2>
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
          {/* Warning Message */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-900 mb-1">
                  This will pause the job and free up the technician's calendar
                </p>
                <p className="text-xs text-orange-700">
                  The job will move to "On Hold" status and can be resumed later.
                </p>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Why is this job being put on hold? <span className="text-red-500">*</span>
            </label>

            <div className="space-y-4">
              {Object.entries(groupedReasons).map(([category, reasons]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {category}
                  </p>
                  <div className="space-y-2">
                    {reasons.map((reason) => (
                      <label
                        key={reason.value}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.reason === reason.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="on-hold-reason"
                          value={reason.value}
                          checked={formData.reason === reason.value}
                          onChange={(e) => handleChange('reason', e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-sm text-gray-900">{reason.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {errors.reason && (
              <p className="mt-2 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Estimated Resume Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Resume Date (Optional)
            </label>
            <input
              type="date"
              value={formData.estimatedResumeDate}
              onChange={(e) => handleChange('estimatedResumeDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              When do you expect to resume this job?
            </p>
          </div>

          {/* Additional Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes {formData.reason === 'other' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Provide any additional details about why this job is on hold..."
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                errors.notes ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.notes && (
              <p className="mt-2 text-sm text-red-600">{errors.notes}</p>
            )}
          </div>

          {/* Notify Customer Checkbox */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifyCustomer}
                onChange={(e) => handleChange('notifyCustomer', e.target.checked)}
                className="mt-1"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Notify customer about this delay
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Send an automatic notification to the customer explaining the delay
                </p>
              </div>
            </label>
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
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
          >
            Put On Hold
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnHoldModal;
