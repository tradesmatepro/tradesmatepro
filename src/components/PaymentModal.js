import React, { useState } from 'react';
import { 
  XMarkIcon, 
  CurrencyDollarIcon,
  CreditCardIcon,
  BanknotesIcon 
} from '@heroicons/react/24/outline';

/**
 * PaymentModal
 * 
 * Purpose: Record payment when invoice is paid
 * Industry Standard: ALL competitors (ServiceTitan, Jobber, Housecall Pro) have this
 * 
 * What it does:
 * 1. Records payment amount
 * 2. Records payment method
 * 3. Records payment date
 * 4. Records payment reference/confirmation number
 * 5. Handles partial payments
 * 6. Changes status from 'invoiced' → 'paid' (or stays 'invoiced' if partial)
 * 
 * Part of: Phase 2C - Critical Gaps
 * Competitive Advantage: Match competitors
 */

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  invoiceTitle,
  invoiceAmount,
  amountPaid = 0 // Previously paid amount
}) => {
  const amountDue = parseFloat(invoiceAmount || 0) - parseFloat(amountPaid || 0);

  const [formData, setFormData] = useState({
    paymentAmount: amountDue.toFixed(2),
    paymentMethod: 'credit_card',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentTime: new Date().toTimeString().slice(0, 5),
    referenceNumber: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const paymentMethods = [
    { value: 'cash', label: '💵 Cash', icon: BanknotesIcon },
    { value: 'check', label: '📝 Check', icon: BanknotesIcon },
    { value: 'credit_card', label: '💳 Credit Card', icon: CreditCardIcon },
    { value: 'debit_card', label: '💳 Debit Card', icon: CreditCardIcon },
    { value: 'ach', label: '🏦 ACH/Bank Transfer', icon: BanknotesIcon },
    { value: 'wire_transfer', label: '🏦 Wire Transfer', icon: BanknotesIcon },
    { value: 'paypal', label: '💻 PayPal', icon: CreditCardIcon },
    { value: 'venmo', label: '💻 Venmo', icon: CreditCardIcon },
    { value: 'zelle', label: '💻 Zelle', icon: CreditCardIcon },
    { value: 'other', label: '📋 Other', icon: BanknotesIcon }
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
    
    if (!formData.paymentAmount || parseFloat(formData.paymentAmount) <= 0) {
      newErrors.paymentAmount = 'Payment amount must be greater than 0';
    }
    
    if (parseFloat(formData.paymentAmount) > amountDue) {
      newErrors.paymentAmount = `Payment cannot exceed amount due ($${amountDue.toFixed(2)})`;
    }
    
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    
    const paymentData = {
      paymentAmount: parseFloat(formData.paymentAmount),
      paymentMethod: formData.paymentMethod,
      paymentDate: formData.paymentDate,
      paymentTime: formData.paymentTime,
      referenceNumber: formData.referenceNumber.trim(),
      notes: formData.notes.trim(),
      isFullPayment: parseFloat(formData.paymentAmount) >= amountDue,
      totalPaid: parseFloat(amountPaid) + parseFloat(formData.paymentAmount),
      remainingBalance: amountDue - parseFloat(formData.paymentAmount)
    };
    
    onConfirm(paymentData);
    
    // Reset form
    setFormData({
      paymentAmount: amountDue.toFixed(2),
      paymentMethod: 'credit_card',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentTime: new Date().toTimeString().slice(0, 5),
      referenceNumber: '',
      notes: ''
    });
    setErrors({});
  };

  const isPartialPayment = parseFloat(formData.paymentAmount) < amountDue;
  const remainingAfterPayment = amountDue - parseFloat(formData.paymentAmount || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
              <p className="text-sm text-gray-500 mt-0.5">{invoiceTitle}</p>
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
          {/* Invoice Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-blue-600 font-medium mb-1">Invoice Total</p>
                <p className="text-lg font-bold text-blue-900">${parseFloat(invoiceAmount || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium mb-1">Previously Paid</p>
                <p className="text-lg font-bold text-blue-900">${parseFloat(amountPaid || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium mb-1">Amount Due</p>
                <p className="text-lg font-bold text-blue-900">${amountDue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={amountDue}
                value={formData.paymentAmount}
                onChange={(e) => handleChange('paymentAmount', e.target.value)}
                className={`w-full pl-8 pr-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.paymentAmount ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.paymentAmount && (
              <p className="mt-2 text-sm text-red-600">{errors.paymentAmount}</p>
            )}
            {isPartialPayment && parseFloat(formData.paymentAmount) > 0 && (
              <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                <p className="text-xs text-yellow-800">
                  <span className="font-semibold">Partial Payment:</span> ${remainingAfterPayment.toFixed(2)} will remain due
                </p>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.paymentMethod === method.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={method.value}
                    checked={formData.paymentMethod === method.value}
                    onChange={(e) => handleChange('paymentMethod', e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-900">{method.label}</span>
                </label>
              ))}
            </div>
            {errors.paymentMethod && (
              <p className="mt-2 text-sm text-red-600">{errors.paymentMethod}</p>
            )}
          </div>

          {/* Payment Date & Time */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleChange('paymentDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.paymentDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.paymentDate && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Time
              </label>
              <input
                type="time"
                value={formData.paymentTime}
                onChange={(e) => handleChange('paymentTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Reference/Confirmation Number */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference / Confirmation Number (Optional)
            </label>
            <input
              type="text"
              value={formData.referenceNumber}
              onChange={(e) => handleChange('referenceNumber', e.target.value)}
              placeholder="Check #, Transaction ID, Confirmation #, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              For checks: enter check number. For cards: enter last 4 digits or transaction ID
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
              placeholder="Any additional details about this payment..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
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
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
          >
            <CurrencyDollarIcon className="w-5 h-5" />
            Record Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

