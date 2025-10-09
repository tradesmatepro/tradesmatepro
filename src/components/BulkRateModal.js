import React from 'react';
import { XMarkIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const BulkRateModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  bulkRateData, 
  setBulkRateData, 
  selectedCount 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBulkRateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-medium text-gray-900">Bulk Rate Adjustment</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Adjusting rates for <strong>{selectedCount}</strong> selected employee{selectedCount !== 1 ? 's' : ''}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adjustment Type
            </label>
            <select
              name="adjustmentType"
              value={bulkRateData.adjustmentType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="percentage">📈 Percentage Increase</option>
              <option value="fixed">💰 Fixed Amount Increase</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {bulkRateData.adjustmentType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
            </label>
            <input
              type="number"
              name="adjustmentValue"
              value={bulkRateData.adjustmentValue}
              onChange={handleChange}
              step={bulkRateData.adjustmentType === 'percentage' ? '0.1' : '0.01'}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={bulkRateData.adjustmentType === 'percentage' ? 'e.g., 5.0' : 'e.g., 2.50'}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {bulkRateData.adjustmentType === 'percentage' 
                ? 'Enter percentage increase (e.g., 5 for 5% raise)'
                : 'Enter dollar amount increase (e.g., 2.50 for $2.50/hour raise)'
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apply To
            </label>
            <select
              name="applyTo"
              value={bulkRateData.applyTo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="base_rate">⏰ Base Hourly Rate</option>
              <option value="overtime_multiplier">⚡ Overtime Multiplier</option>
            </select>
          </div>

          {bulkRateData.adjustmentValue && (
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">Preview:</h4>
              <p className="text-sm text-green-700">
                {bulkRateData.adjustmentType === 'percentage' 
                  ? `${bulkRateData.adjustmentValue}% increase to ${bulkRateData.applyTo.replace('_', ' ')}`
                  : `$${bulkRateData.adjustmentValue} increase to ${bulkRateData.applyTo.replace('_', ' ')}`
                }
              </p>
              <p className="text-xs text-green-600 mt-1">
                Example: $20/hour → ${bulkRateData.adjustmentType === 'percentage' 
                  ? (20 * (1 + parseFloat(bulkRateData.adjustmentValue || 0) / 100)).toFixed(2)
                  : (20 + parseFloat(bulkRateData.adjustmentValue || 0)).toFixed(2)
                }/hour
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Apply Rate Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkRateModal;
