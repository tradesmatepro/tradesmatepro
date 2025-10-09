// PTO Request Form - Employee form for submitting time off requests
import React, { useState } from 'react';
import PTOServiceProduction, { ACCRUAL_TYPES } from '../../services/PTOServiceProduction';
import {
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const PTORequestForm = ({ onSubmit, onCancel, balance }) => {
  const [formData, setFormData] = useState({
    accrual_type: 'vacation',
    start_date: '',
    end_date: '',
    hours_requested: '',
    reason: ''
  });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate hours when dates change
    if (name === 'start_date' || name === 'end_date') {
      calculateHours({ ...formData, [name]: value });
    }
  };

  const calculateHours = (data) => {
    if (data.start_date && data.end_date) {
      const businessDays = PTOServiceProduction.calculateBusinessDays(data.start_date, data.end_date);
      const suggestedHours = PTOServiceProduction.calculateHoursFromDays(businessDays);
      
      setFormData(prev => ({
        ...prev,
        hours_requested: suggestedHours.toString()
      }));
    }
  };

  const validateForm = () => {
    const validationErrors = PTOServiceProduction.validateRequestData(formData);
    
    // Additional validation for balance
    if (balance && formData.hours_requested) {
      const requestedHours = parseFloat(formData.hours_requested);
      const availableBalance = formData.accrual_type === 'vacation' 
        ? balance.vacation_balance 
        : balance.sick_balance;
      
      if (requestedHours > availableBalance) {
        validationErrors.push(
          `Insufficient ${formData.accrual_type} balance. Available: ${PTOServiceProduction.formatBalance(availableBalance)} hours`
        );
      }
    }

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        ...formData,
        hours_requested: parseFloat(formData.hours_requested)
      });
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableBalance = () => {
    if (!balance) return 0;
    return formData.accrual_type === 'vacation' 
      ? balance.vacation_balance 
      : balance.sick_balance;
  };

  const getBusinessDaysCount = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    return PTOServiceProduction.calculateBusinessDays(formData.start_date, formData.end_date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Request Time Off</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Please correct the following errors:
                  </h3>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* PTO Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type of Time Off
            </label>
            <select
              name="accrual_type"
              value={formData.accrual_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {Object.entries(ACCRUAL_TYPES).map(([key, value]) => (
                <option key={key} value={value}>
                  {PTOServiceProduction.getAccrualTypeLabel(value)}
                </option>
              ))}
            </select>
            {balance && (
              <p className="mt-1 text-sm text-gray-600">
                Available balance: {PTOServiceProduction.formatBalance(getAvailableBalance())} hours
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <CalendarDaysIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <CalendarDaysIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Business Days Info */}
          {formData.start_date && formData.end_date && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    {getBusinessDaysCount()} business days selected
                  </p>
                  <p className="text-xs text-blue-600">
                    Weekends are automatically excluded
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hours Requested */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hours Requested
            </label>
            <div className="relative">
              <input
                type="number"
                name="hours_requested"
                value={formData.hours_requested}
                onChange={handleInputChange}
                min="0.5"
                step="0.5"
                max={getAvailableBalance()}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="8.0"
                required
              />
              <ClockIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Standard work day is 8 hours. You can request partial days (e.g., 4.0 hours for half day).
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of your time off request..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PTORequestForm;
