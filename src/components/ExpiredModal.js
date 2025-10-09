import React, { useState } from 'react';
import { 
  XMarkIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

/**
 * ExpiredModal
 * 
 * Purpose: Handle expired quotes
 * Industry Standard: Housecall Pro has auto-expiration, ServiceTitan basic, Jobber basic
 * 
 * What it does:
 * 1. Shows quote expiration details
 * 2. Offers actions: Renew, Archive, or Follow-Up
 * 3. If renewing: extends expiration date
 * 4. If archiving: changes to 'expired' status
 * 5. If following up: changes to 'follow_up' status
 * 6. Records expired_at timestamp
 * 
 * Part of: Phase 2E - Medium Priority
 * Competitive Advantage: Match Housecall Pro
 * 
 * TODO Phase 5:
 * - Auto-expiration trigger (database function)
 * - Email notifications before expiration
 */

const ExpiredModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  quoteTitle,
  expirationDate,
  customerName 
}) => {
  const [formData, setFormData] = useState({
    action: 'renew', // 'renew', 'archive', 'follow_up'
    newExpirationDate: '',
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
    
    if (formData.action === 'renew' && !formData.newExpirationDate) {
      newErrors.newExpirationDate = 'Please select a new expiration date';
    }
    
    if (formData.action === 'renew') {
      const newDate = new Date(formData.newExpirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (newDate <= today) {
        newErrors.newExpirationDate = 'New expiration date must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    
    onConfirm({
      action: formData.action,
      newExpirationDate: formData.newExpirationDate || null,
      notes: formData.notes.trim()
    });
    
    // Reset form
    setFormData({
      action: 'renew',
      newExpirationDate: '',
      notes: ''
    });
    setErrors({});
  };

  const getExpiredDuration = () => {
    if (!expirationDate) return null;
    const expDate = new Date(expirationDate);
    const now = new Date();
    const diffDays = Math.floor((now - expDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return '1 day ago';
    } else {
      return `${diffDays} days ago`;
    }
  };

  const expiredDuration = getExpiredDuration();

  // Suggest default new expiration (30 days from now)
  const getDefaultNewExpiration = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quote Expired</h2>
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
          {/* Expiration Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900 mb-1">
                  This quote has expired
                </p>
                <div className="text-xs text-red-700 space-y-1">
                  {expirationDate && (
                    <p>
                      <span className="font-semibold">Expired:</span>{' '}
                      {new Date(expirationDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })} ({expiredDuration})
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">Customer:</span> {customerName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What would you like to do?
            </label>
            <div className="space-y-3">
              {/* Renew Quote */}
              <label
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.action === 'renew'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  value="renew"
                  checked={formData.action === 'renew'}
                  onChange={(e) => handleChange('action', e.target.value)}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ArrowPathIcon className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-gray-900">Renew Quote</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Extend the expiration date and keep the quote active
                  </p>
                </div>
              </label>

              {/* Follow Up */}
              <label
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.action === 'follow_up'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  value="follow_up"
                  checked={formData.action === 'follow_up'}
                  onChange={(e) => handleChange('action', e.target.value)}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-orange-600" />
                    <p className="text-sm font-medium text-gray-900">Follow Up with Customer</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Schedule a follow-up to see if customer is still interested
                  </p>
                </div>
              </label>

              {/* Archive */}
              <label
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.action === 'archive'
                    ? 'border-gray-500 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  value="archive"
                  checked={formData.action === 'archive'}
                  onChange={(e) => handleChange('action', e.target.value)}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <XMarkIcon className="w-5 h-5 text-gray-600" />
                    <p className="text-sm font-medium text-gray-900">Archive Quote</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Mark as expired and move to archive (customer not interested)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* New Expiration Date (if renewing) */}
          {formData.action === 'renew' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Expiration Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.newExpirationDate}
                onChange={(e) => handleChange('newExpirationDate', e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.newExpirationDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.newExpirationDate && (
                <p className="mt-2 text-sm text-red-600">{errors.newExpirationDate}</p>
              )}
              <button
                type="button"
                onClick={() => handleChange('newExpirationDate', getDefaultNewExpiration())}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Set to 30 days from now
              </button>
            </div>
          )}

          {/* Additional Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional context about this decision..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Phase 5 Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <span className="font-semibold">📅 Phase 5:</span> Automatic expiration tracking and email notifications before quotes expire
            </p>
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
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              formData.action === 'renew'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : formData.action === 'follow_up'
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {formData.action === 'renew' && 'Renew Quote'}
            {formData.action === 'follow_up' && 'Schedule Follow-Up'}
            {formData.action === 'archive' && 'Archive Quote'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpiredModal;

