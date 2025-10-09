import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../contexts/UserContext';
import settingsService from '../services/SettingsService';

/**
 * ApprovalModal
 *
 * Purpose: Capture details when customer approves a quote
 * Industry Standard: ALL competitors (ServiceTitan, Jobber, Housecall Pro) have this
 *
 * What it does:
 * 1. Records approval date/time
 * 2. Optional: Capture customer signature (placeholder for now)
 * 3. Optional: Capture deposit/down payment
 * 4. Asks: "Schedule this job now?"
 * 5. Changes status from 'sent/presented' → 'approved'
 * 6. Optionally opens Smart Scheduling Assistant
 *
 * Part of: Phase 2C - Critical Gaps
 * Competitive Advantage: Match competitors + better scheduling integration
 */

const ApprovalModal = ({
  isOpen,
  onClose,
  onConfirm,
  onScheduleNow,
  quoteTitle,
  quoteAmount
}) => {
  const { user } = useUser();
  const [companyDepositPolicy, setCompanyDepositPolicy] = useState(null);

  const [formData, setFormData] = useState({
    approvalDate: new Date().toISOString().split('T')[0],
    approvalTime: new Date().toTimeString().slice(0, 5),
    depositAmount: '',
    depositMethod: '',
    notes: '',
    scheduleNow: true,
    // TODO: Phase 5 - Add signature capture
    signatureRequired: false
  });

  const [errors, setErrors] = useState({});

  // Prefill deposit from company settings when modal opens
  useEffect(() => {
    const loadPolicy = async () => {
      try {
        if (!isOpen || !user?.company_id) return;
        const s = await settingsService.getBusinessSettings(user.company_id);
        setCompanyDepositPolicy(s);
        if (s?.deposit_enabled) {
          let amount = '';
          if (s.deposit_type === 'PERCENTAGE') {
            const pct = parseFloat(s.deposit_percent || 0);
            amount = pct > 0 ? ((parseFloat(quoteAmount || 0) * pct) / 100).toFixed(2) : '';
          } else if (s.deposit_type === 'FIXED') {
            amount = s.deposit_fixed_amount != null ? parseFloat(s.deposit_fixed_amount).toFixed(2) : '';
          }
          setFormData(prev => ({ ...prev, depositAmount: amount }));
        }
      } catch (e) {
        console.warn('Failed to load deposit policy', e);
      }
    };
    loadPolicy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const paymentMethods = [
    { value: '', label: 'No deposit collected' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'ach', label: 'ACH/Bank Transfer' },
    { value: 'other', label: 'Other' }
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

    if (!formData.approvalDate) {
      newErrors.approvalDate = 'Approval date is required';
    }

    if (formData.depositAmount && !formData.depositMethod) {
      newErrors.depositMethod = 'Please select payment method for deposit';
    }

    if (formData.depositAmount && parseFloat(formData.depositAmount) > parseFloat(quoteAmount)) {
      newErrors.depositAmount = 'Deposit cannot exceed quote amount';
    }

    // If policy requires deposit before scheduling, enforce it
    if (formData.scheduleNow && companyDepositPolicy?.require_deposit_before_scheduling && !formData.depositAmount) {
      newErrors.depositAmount = 'A deposit is required before scheduling';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    
    const approvalData = {
      approvalDate: formData.approvalDate,
      approvalTime: formData.approvalTime,
      depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : null,
      depositMethod: formData.depositMethod || null,
      notes: formData.notes.trim(),
      scheduleNow: formData.scheduleNow
    };
    
    if (formData.scheduleNow && onScheduleNow) {
      // Open Smart Scheduling Assistant
      onScheduleNow(approvalData);
    } else {
      // Just approve without scheduling
      onConfirm(approvalData);
    }
    
    // Reset form
    setFormData({
      approvalDate: new Date().toISOString().split('T')[0],
      approvalTime: new Date().toTimeString().slice(0, 5),
      depositAmount: '',
      depositMethod: '',
      notes: '',
      scheduleNow: true,
      signatureRequired: false
    });
    setErrors({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Approve Quote</h2>
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
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900 mb-1">
                  Customer has approved this quote!
                </p>
                <p className="text-xs text-green-700">
                  Quote Amount: <span className="font-semibold">${parseFloat(quoteAmount || 0).toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Approval Date & Time */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.approvalDate}
                onChange={(e) => handleChange('approvalDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.approvalDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.approvalDate && (
                <p className="mt-1 text-sm text-red-600">{errors.approvalDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Time
              </label>
              <input
                type="time"
                value={formData.approvalTime}
                onChange={(e) => handleChange('approvalTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Deposit/Down Payment (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deposit / Down Payment (Optional)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={quoteAmount}
                  value={formData.depositAmount}
                  onChange={(e) => handleChange('depositAmount', e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.depositAmount ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.depositAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.depositAmount}</p>
                )}
              </div>

              <div>
                <select
                  value={formData.depositMethod}
                  onChange={(e) => handleChange('depositMethod', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.depositMethod ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
                {errors.depositMethod && (
                  <p className="mt-1 text-sm text-red-600">{errors.depositMethod}</p>
                )}
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              If customer paid a deposit, enter the amount and payment method
            </p>
          </div>

          {/* TODO: Signature Capture - Phase 5 */}
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DocumentTextIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Customer Signature</span>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Coming Soon</span>
            </div>
            <p className="text-xs text-gray-500">
              Digital signature capture will be available in Phase 5. For now, you can collect signatures on paper and attach them later.
            </p>
          </div>

          {/* Additional Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional details about the approval..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
          </div>

          {/* Schedule Now Checkbox */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.scheduleNow}
                onChange={(e) => handleChange('scheduleNow', e.target.checked)}
                className="mt-1"
              />
              <div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Schedule this job now
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Opens Smart Scheduling Assistant to schedule the job immediately after approval
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
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            {formData.scheduleNow ? 'Approve & Schedule' : 'Approve Quote'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;

