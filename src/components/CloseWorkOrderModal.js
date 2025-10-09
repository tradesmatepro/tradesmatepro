import React, { useState } from 'react';
import { 
  XMarkIcon, 
  CheckCircleIcon,
  StarIcon 
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

/**
 * CloseWorkOrderModal
 * 
 * Purpose: Final closure of work order after payment
 * Industry Standard: ALL competitors have final closure step
 * 
 * What it does:
 * 1. Confirms all work complete and paid
 * 2. Optional: Request customer review
 * 3. Optional: Add to portfolio/case studies
 * 4. Final notes/lessons learned
 * 5. Changes status from 'paid' → 'closed'
 * 6. Records closed_at timestamp
 * 
 * Part of: Phase 2F - Low Priority (Polish)
 * Competitive Advantage: Match competitors
 * 
 * TODO Phase 5:
 * - Automated review request emails
 * - Portfolio integration
 * - Customer satisfaction survey
 */

const CloseWorkOrderModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  workOrderTitle,
  customerName 
}) => {
  const [formData, setFormData] = useState({
    allWorkComplete: false,
    allPaymentsReceived: false,
    requestReview: true,
    addToPortfolio: false,
    customerSatisfaction: 0, // 0-5 stars
    closureNotes: '',
    lessonsLearned: ''
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
    
    if (!formData.allWorkComplete) {
      newErrors.allWorkComplete = 'Please confirm all work is complete';
    }
    
    if (!formData.allPaymentsReceived) {
      newErrors.allPaymentsReceived = 'Please confirm all payments have been received';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    
    onConfirm({
      allWorkComplete: formData.allWorkComplete,
      allPaymentsReceived: formData.allPaymentsReceived,
      requestReview: formData.requestReview,
      addToPortfolio: formData.addToPortfolio,
      customerSatisfaction: formData.customerSatisfaction,
      closureNotes: formData.closureNotes.trim(),
      lessonsLearned: formData.lessonsLearned.trim()
    });
    
    // Reset form
    setFormData({
      allWorkComplete: false,
      allPaymentsReceived: false,
      requestReview: true,
      addToPortfolio: false,
      customerSatisfaction: 0,
      closureNotes: '',
      lessonsLearned: ''
    });
    setErrors({});
  };

  const renderStars = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleChange('customerSatisfaction', star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            {star <= formData.customerSatisfaction ? (
              <StarIconSolid className="w-8 h-8 text-yellow-400" />
            ) : (
              <StarIcon className="w-8 h-8 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Close Work Order</h2>
              <p className="text-sm text-gray-500 mt-0.5">{workOrderTitle}</p>
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
                  Ready to close this work order
                </p>
                <p className="text-xs text-green-700">
                  This is the final step. Make sure everything is complete before closing.
                </p>
              </div>
            </div>
          </div>

          {/* Completion Confirmations */}
          <div className="mb-6 space-y-3">
            <label className={`flex items-start gap-3 cursor-pointer p-4 border-2 rounded-lg transition-all ${
              formData.allWorkComplete 
                ? 'border-green-500 bg-green-50' 
                : errors.allWorkComplete 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="checkbox"
                checked={formData.allWorkComplete}
                onChange={(e) => handleChange('allWorkComplete', e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  ✅ All work is complete <span className="text-red-500">*</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Confirm that all work has been completed to customer satisfaction
                </p>
              </div>
            </label>
            {errors.allWorkComplete && (
              <p className="text-sm text-red-600 ml-4">{errors.allWorkComplete}</p>
            )}

            <label className={`flex items-start gap-3 cursor-pointer p-4 border-2 rounded-lg transition-all ${
              formData.allPaymentsReceived 
                ? 'border-green-500 bg-green-50' 
                : errors.allPaymentsReceived 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="checkbox"
                checked={formData.allPaymentsReceived}
                onChange={(e) => handleChange('allPaymentsReceived', e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  💰 All payments received <span className="text-red-500">*</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Confirm that full payment has been received (no outstanding balance)
                </p>
              </div>
            </label>
            {errors.allPaymentsReceived && (
              <p className="text-sm text-red-600 ml-4">{errors.allPaymentsReceived}</p>
            )}
          </div>

          {/* Customer Satisfaction Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Customer Satisfaction (Optional)
            </label>
            <div className="flex items-center gap-4">
              {renderStars()}
              {formData.customerSatisfaction > 0 && (
                <span className="text-sm text-gray-600">
                  {formData.customerSatisfaction === 5 && '🎉 Excellent!'}
                  {formData.customerSatisfaction === 4 && '😊 Very Good'}
                  {formData.customerSatisfaction === 3 && '🙂 Good'}
                  {formData.customerSatisfaction === 2 && '😐 Fair'}
                  {formData.customerSatisfaction === 1 && '😕 Needs Improvement'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Rate your perception of customer satisfaction with this job
            </p>
          </div>

          {/* Request Review */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all">
              <input
                type="checkbox"
                checked={formData.requestReview}
                onChange={(e) => handleChange('requestReview', e.target.checked)}
                className="mt-1"
              />
              <div>
                <div className="flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">
                    Request customer review
                  </span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Phase 5
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Send an automated email to {customerName} requesting a review (Phase 5 feature)
                </p>
              </div>
            </label>
          </div>

          {/* Add to Portfolio */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all">
              <input
                type="checkbox"
                checked={formData.addToPortfolio}
                onChange={(e) => handleChange('addToPortfolio', e.target.checked)}
                className="mt-1"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    📸 Add to portfolio / case studies
                  </span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Phase 5
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Feature this job in your portfolio for marketing purposes (Phase 5 feature)
                </p>
              </div>
            </label>
          </div>

          {/* Closure Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Closure Notes (Optional)
            </label>
            <textarea
              value={formData.closureNotes}
              onChange={(e) => handleChange('closureNotes', e.target.value)}
              placeholder="Any final notes about this work order (customer feedback, final details, etc.)..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
          </div>

          {/* Lessons Learned */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lessons Learned (Optional)
            </label>
            <textarea
              value={formData.lessonsLearned}
              onChange={(e) => handleChange('lessonsLearned', e.target.value)}
              placeholder="What went well? What could be improved for next time? Any insights for the team..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Help improve future jobs by documenting what you learned
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
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            Close Work Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloseWorkOrderModal;

