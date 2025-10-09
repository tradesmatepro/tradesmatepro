import React, { useState, useEffect } from 'react';
import { createCurrencyInputProps, createNumericInputProps } from '../utils/inputUtils';
import {
  XMarkIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const PayRateModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  employee = null,
  currentRate = null
}) => {
  const [formData, setFormData] = useState({
    base_rate: 0,
    overtime_multiplier: 1.5,
    effective_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentRate) {
      setFormData({
        base_rate: currentRate.base_rate || 0,
        overtime_multiplier: currentRate.overtime_multiplier || 1.5,
        effective_date: new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        base_rate: 0,
        overtime_multiplier: 1.5,
        effective_date: new Date().toISOString().split('T')[0]
      });
    }
  }, [currentRate, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting pay rate:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const calculateOvertimeRate = () => {
    return (formData.base_rate || 0) * (formData.overtime_multiplier || 1.5);
  };

  const calculateAnnualSalary = () => {
    // Assuming 40 hours per week, 52 weeks per year
    return (formData.base_rate || 0) * 40 * 52;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BanknotesIcon className="w-6 h-6 text-primary-600" />
            Update Pay Rate
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Employee Info */}
        {employee && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-lg font-medium text-primary-700">
                    {employee.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-lg font-medium text-gray-900">
                  {employee.full_name}
                </div>
                <div className="text-sm text-gray-500">
                  {employee.role}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Base Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BanknotesIcon className="w-4 h-4 inline mr-1" />
              Base Hourly Rate *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                {...createCurrencyInputProps(
                  formData.base_rate,
                  (value) => setFormData({ ...formData, base_rate: value }),
                  { min: 0, max: 1000 }
                )}
                required
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Annual equivalent: {formatCurrency(calculateAnnualSalary())}
            </p>
          </div>

          {/* Overtime Multiplier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="w-4 h-4 inline mr-1" />
              Overtime Multiplier *
            </label>
            <input
              {...createNumericInputProps(
                formData.overtime_multiplier,
                (value) => setFormData({ ...formData, overtime_multiplier: value }),
                {
                  min: 1,
                  max: 3,
                  decimalPlaces: 1,
                  defaultValue: 1.5,
                  showZero: true,
                  placeholder: '1.5'
                }
              )}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Overtime rate: {formatCurrency(calculateOvertimeRate())}/hour
            </p>
          </div>

          {/* Effective Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
              Effective Date *
            </label>
            <input
              type="date"
              required
              value={formData.effective_date}
              onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Rate Summary */}
          <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
            <h4 className="font-medium text-primary-900 mb-2">Rate Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-primary-700">Regular Rate:</span>
                <span className="font-medium text-primary-900">{formatCurrency(formData.base_rate)}/hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-700">Overtime Rate:</span>
                <span className="font-medium text-primary-900">{formatCurrency(calculateOvertimeRate())}/hour</span>
              </div>
              <div className="flex justify-between border-t border-primary-200 pt-1">
                <span className="text-primary-700">Annual Equivalent:</span>
                <span className="font-medium text-primary-900">{formatCurrency(calculateAnnualSalary())}</span>
              </div>
            </div>
          </div>

          {/* Warning about historical rates */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium">Important Note</p>
                <p className="text-yellow-700 mt-1">
                  This will create a new pay rate record. Historical rates are preserved for payroll accuracy.
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <BanknotesIcon className="w-4 h-4" />
                  Update Pay Rate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayRateModal;
