import React, { useState } from 'react';
import { 
  XMarkIcon, 
  XCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

/**
 * RejectionModal
 * 
 * Purpose: Capture details when customer rejects a quote
 * Industry Standard: ALL competitors (ServiceTitan, Jobber, Housecall Pro) track rejection reasons
 * 
 * What it does:
 * 1. Asks WHY quote was rejected (15 common reasons)
 * 2. Tracks if they went with a competitor
 * 3. Captures competitor name (if applicable)
 * 4. Optional notes
 * 5. Changes status from 'sent/presented' → 'rejected'
 * 6. Records rejected_at timestamp
 * 
 * Part of: Phase 2C - Critical Gaps
 * Competitive Advantage: Better tracking than competitors for improvement insights
 */

const RejectionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  quoteTitle 
}) => {
  const [formData, setFormData] = useState({
    reason: '',
    competitorName: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  // Industry-standard rejection reasons (researched from ServiceTitan, Jobber, Housecall Pro)
  const rejectionReasons = [
    // Price-Related
    { value: 'price_too_high', label: '💰 Price Too High', category: 'Price' },
    { value: 'went_with_cheaper_competitor', label: '💰 Went with Cheaper Competitor', category: 'Price' },
    { value: 'budget_constraints', label: '💰 Budget Constraints', category: 'Price' },
    
    // Timing
    { value: 'timeline_too_long', label: '⏰ Timeline Too Long', category: 'Timing' },
    { value: 'not_ready_to_proceed', label: '⏰ Not Ready to Proceed', category: 'Timing' },
    { value: 'decided_to_wait', label: '⏰ Decided to Wait', category: 'Timing' },
    
    // Scope/Service
    { value: 'scope_not_right', label: '📋 Scope Not Right', category: 'Scope' },
    { value: 'looking_for_different_solution', label: '📋 Looking for Different Solution', category: 'Scope' },
    { value: 'decided_not_to_do_work', label: '📋 Decided Not to Do Work', category: 'Scope' },
    
    // Competitor
    { value: 'went_with_competitor', label: '🏢 Went with Competitor', category: 'Competitor' },
    { value: 'using_existing_vendor', label: '🏢 Using Existing Vendor', category: 'Competitor' },
    
    // Company/Trust
    { value: 'lack_of_reviews', label: '⭐ Lack of Reviews/References', category: 'Trust' },
    { value: 'communication_issues', label: '💬 Communication Issues', category: 'Trust' },
    
    // Other
    { value: 'doing_it_themselves', label: '🔧 Doing It Themselves (DIY)', category: 'Other' },
    { value: 'no_response', label: '📵 No Response / Ghosted', category: 'Other' },
    { value: 'other', label: '📝 Other (Specify in Notes)', category: 'Other' }
  ];

  // Group reasons by category
  const groupedReasons = rejectionReasons.reduce((acc, reason) => {
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
      newErrors.reason = 'Please select a rejection reason';
    }
    
    if (formData.reason === 'other' && !formData.notes.trim()) {
      newErrors.notes = 'Please provide details when selecting "Other"';
    }
    
    if ((formData.reason === 'went_with_cheaper_competitor' || formData.reason === 'went_with_competitor') && !formData.competitorName.trim()) {
      newErrors.competitorName = 'Please enter competitor name';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    
    onConfirm({
      reason: formData.reason,
      competitorName: formData.competitorName.trim(),
      notes: formData.notes.trim()
    });
    
    // Reset form
    setFormData({
      reason: '',
      competitorName: '',
      notes: ''
    });
    setErrors({});
  };

  const showCompetitorField = formData.reason === 'went_with_cheaper_competitor' || 
                              formData.reason === 'went_with_competitor' ||
                              formData.reason === 'using_existing_vendor';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quote Rejected</h2>
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
          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900 mb-1">
                  This will mark the quote as rejected
                </p>
                <p className="text-xs text-red-700">
                  Understanding why helps us improve our quotes and win more business
                </p>
              </div>
            </div>
          </div>

          {/* Rejection Reason Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Why was this quote rejected? <span className="text-red-500">*</span>
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
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="rejection-reason"
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

          {/* Competitor Name (conditional) */}
          {showCompetitorField && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competitor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.competitorName}
                onChange={(e) => handleChange('competitorName', e.target.value)}
                placeholder="Enter competitor or vendor name..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.competitorName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.competitorName && (
                <p className="mt-2 text-sm text-red-600">{errors.competitorName}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Knowing who we're competing against helps us improve our offerings
              </p>
            </div>
          )}

          {/* Additional Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes {formData.reason === 'other' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Provide any additional details about why this quote was rejected..."
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none ${
                errors.notes ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.notes && (
              <p className="mt-2 text-sm text-red-600">{errors.notes}</p>
            )}
          </div>

          {/* Learning Insight */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-medium text-blue-900 mb-1">💡 Why This Matters</p>
            <p className="text-xs text-blue-700">
              Tracking rejection reasons helps identify patterns and improve win rates. This data can be used to:
            </p>
            <ul className="text-xs text-blue-700 mt-2 ml-4 space-y-1">
              <li>• Adjust pricing strategies</li>
              <li>• Improve quote presentation</li>
              <li>• Identify competitive threats</li>
              <li>• Refine service offerings</li>
            </ul>
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
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            Mark as Rejected
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectionModal;

