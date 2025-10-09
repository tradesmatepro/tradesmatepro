import React, { useState } from 'react';
import { 
  XMarkIcon, 
  PlayCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

/**
 * StartJobModal
 * 
 * Purpose: Confirm job start and record actual start time
 * Industry Standard: ServiceTitan auto-starts, Jobber has manual start, Housecall Pro basic
 * 
 * What it does:
 * 1. Records actual start time (defaults to now)
 * 2. Confirms technician on site
 * 3. Optional: Start timer for time tracking
 * 4. Optional: Take "before" photos (placeholder)
 * 5. Changes status from 'scheduled' → 'in_progress'
 * 6. Records actual_start timestamp
 * 
 * Part of: Phase 2D - High Priority
 * Competitive Advantage: Match ServiceTitan
 * 
 * TODO Phase 5:
 * - Photo upload integration
 * - Timer integration
 * - GPS location verification
 */

const StartJobModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  jobTitle,
  scheduledStart,
  technicianName 
}) => {
  const now = new Date();
  const [formData, setFormData] = useState({
    actualStartDate: now.toISOString().split('T')[0],
    actualStartTime: now.toTimeString().slice(0, 5),
    startTimer: true,
    notes: ''
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
    
    if (!formData.actualStartDate) {
      newErrors.actualStartDate = 'Start date is required';
    }
    
    if (!formData.actualStartTime) {
      newErrors.actualStartTime = 'Start time is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    
    const actualStartDateTime = new Date(`${formData.actualStartDate}T${formData.actualStartTime}`);
    
    onConfirm({
      actualStartDate: formData.actualStartDate,
      actualStartTime: formData.actualStartTime,
      actualStartDateTime: actualStartDateTime.toISOString(),
      startTimer: formData.startTimer,
      notes: formData.notes.trim()
    });
    
    // Reset form
    const newNow = new Date();
    setFormData({
      actualStartDate: newNow.toISOString().split('T')[0],
      actualStartTime: newNow.toTimeString().slice(0, 5),
      startTimer: true,
      notes: ''
    });
    setErrors({});
  };

  const getActualStartDateTime = () => {
    if (!formData.actualStartDate || !formData.actualStartTime) return null;
    return new Date(`${formData.actualStartDate}T${formData.actualStartTime}`);
  };

  const actualStartDateTime = getActualStartDateTime();
  const scheduledStartDate = scheduledStart ? new Date(scheduledStart) : null;
  
  // Check if starting early or late
  let timingStatus = null;
  if (actualStartDateTime && scheduledStartDate) {
    const diffMinutes = (actualStartDateTime - scheduledStartDate) / 1000 / 60;
    if (diffMinutes < -15) {
      timingStatus = { type: 'early', minutes: Math.abs(diffMinutes) };
    } else if (diffMinutes > 15) {
      timingStatus = { type: 'late', minutes: diffMinutes };
    } else {
      timingStatus = { type: 'ontime' };
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <PlayCircleIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Start Job</h2>
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
          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <PlayCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  {technicianName} is starting this job
                </p>
                <p className="text-xs text-blue-700">
                  This will record the actual start time and change the job status to "In Progress"
                </p>
              </div>
            </div>
          </div>

          {/* Scheduled vs Actual */}
          {scheduledStartDate && (
            <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Scheduled Start</p>
                  <p className="text-sm text-gray-900">
                    {scheduledStartDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })} at {scheduledStartDate.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Actual Start</p>
                  {actualStartDateTime && (
                    <p className="text-sm text-gray-900">
                      {actualStartDateTime.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })} at {actualStartDateTime.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timing Status Warning */}
          {timingStatus && timingStatus.type !== 'ontime' && (
            <div className={`mb-6 border rounded-lg p-4 ${
              timingStatus.type === 'early' 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  timingStatus.type === 'early' ? 'text-yellow-600' : 'text-orange-600'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    timingStatus.type === 'early' ? 'text-yellow-900' : 'text-orange-900'
                  }`}>
                    {timingStatus.type === 'early' 
                      ? `Starting ${Math.round(timingStatus.minutes)} minutes early` 
                      : `Starting ${Math.round(timingStatus.minutes)} minutes late`
                    }
                  </p>
                  <p className={`text-xs mt-1 ${
                    timingStatus.type === 'early' ? 'text-yellow-700' : 'text-orange-700'
                  }`}>
                    {timingStatus.type === 'early' 
                      ? 'This is fine! Just noting the early start.' 
                      : 'Consider notifying the customer if significantly delayed.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actual Start Date & Time */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.actualStartDate}
                onChange={(e) => handleChange('actualStartDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.actualStartDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.actualStartDate && (
                <p className="mt-1 text-sm text-red-600">{errors.actualStartDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.actualStartTime}
                onChange={(e) => handleChange('actualStartTime', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.actualStartTime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.actualStartTime && (
                <p className="mt-1 text-sm text-red-600">{errors.actualStartTime}</p>
              )}
            </div>
          </div>

          {/* Timer Option */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all">
              <input
                type="checkbox"
                checked={formData.startTimer}
                onChange={(e) => handleChange('startTimer', e.target.checked)}
                className="mt-1"
              />
              <div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Start timer for time tracking
                  </span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Phase 6
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Automatically track time spent on this job (timer integration coming in Phase 6)
                </p>
              </div>
            </label>
          </div>

          {/* Before Photos - Placeholder */}
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Before Photos</span>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                Phase 5
              </span>
            </div>
            <p className="text-xs text-gray-500">
              📸 Photo upload integration coming in Phase 5. For now, take photos with your phone and upload them later.
            </p>
          </div>

          {/* Additional Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any notes about starting the job (site conditions, customer requests, etc.)..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
          >
            <PlayCircleIcon className="w-5 h-5" />
            Start Job
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartJobModal;

