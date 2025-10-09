import React, { useState } from 'react';
import {
  XMarkIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

/**
 * ExtendJobModal
 * 
 * Purpose: Allow users to extend job duration when it runs over scheduled time
 * Shows quick options (30min, 1hr, 2hr, 4hr) plus custom input
 * Updates scheduled_end time and keeps job in 'in_progress' status
 * 
 * Part of: Phase 2 - Smart Status Progression
 */

const ExtendJobModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  jobTitle,
  currentScheduledEnd 
}) => {
  const [extensionMinutes, setExtensionMinutes] = useState(60); // Default 1 hour
  const [customMinutes, setCustomMinutes] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const quickOptions = [
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '4 hours', value: 240 },
  ];

  const handleQuickSelect = (minutes) => {
    setExtensionMinutes(minutes);
    setCustomMinutes('');
  };

  const handleCustomChange = (e) => {
    const value = e.target.value;
    setCustomMinutes(value);
    if (value && !isNaN(value) && parseInt(value) > 0) {
      setExtensionMinutes(parseInt(value));
    }
  };

  const handleConfirm = () => {
    if (extensionMinutes > 0) {
      onConfirm({
        extensionMinutes,
        reason: reason.trim() || 'Job extended'
      });
      onClose();
    }
  };

  const calculateNewEndTime = () => {
    if (!currentScheduledEnd || !extensionMinutes) return null;
    
    const endDate = new Date(currentScheduledEnd);
    endDate.setMinutes(endDate.getMinutes() + extensionMinutes);
    
    return endDate.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Extend Job</h2>
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
          <p className="text-gray-600 mb-6">
            <span className="font-medium text-gray-900">{jobTitle}</span> needs more time? Add additional hours to continue working.
          </p>

          {/* Quick Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Select
            </label>
            <div className="grid grid-cols-4 gap-2">
              {quickOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleQuickSelect(option.value)}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    extensionMinutes === option.value && !customMinutes
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Duration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="480"
              value={customMinutes}
              onChange={handleCustomChange}
              placeholder="Enter custom minutes"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum 8 hours (480 minutes)
            </p>
          </div>

          {/* Reason (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why does this job need more time?"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* New End Time Preview */}
          {calculateNewEndTime() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ExclamationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    New Scheduled End Time
                  </p>
                  <p className="text-sm text-blue-700">
                    {calculateNewEndTime()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Adding {extensionMinutes} minutes to current schedule
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!extensionMinutes || extensionMinutes <= 0}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Extend Job
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtendJobModal;

