import React, { useState } from 'react';
import { 
  XMarkIcon, 
  PencilSquareIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';

/**
 * ChangesRequestedModal
 * 
 * Purpose: Track what changes customer requested to quote
 * Industry Standard: Jobber tracks this, ServiceTitan has notes, Housecall Pro basic
 * 
 * What it does:
 * 1. Tracks what changes customer wants (12 common types)
 * 2. Captures specific change details
 * 3. Optional: Set follow-up date to send revised quote
 * 4. Changes status from 'sent/presented' → 'changes_requested'
 * 5. Records changes_requested_at timestamp
 * 
 * Part of: Phase 2D - High Priority
 * Competitive Advantage: Better tracking than competitors
 */

const ChangesRequestedModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  quoteTitle 
}) => {
  const [formData, setFormData] = useState({
    changeTypes: [], // Multiple selections allowed
    changeDetails: '',
    followUpDate: '',
    urgency: 'normal'
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  // Common change request types (researched from Jobber, ServiceTitan user feedback)
  const changeTypes = [
    // Pricing
    { value: 'reduce_price', label: '💰 Reduce Price', category: 'Pricing' },
    { value: 'add_discount', label: '💰 Add Discount', category: 'Pricing' },
    { value: 'payment_terms', label: '💰 Change Payment Terms', category: 'Pricing' },
    
    // Scope
    { value: 'add_items', label: '➕ Add Items/Services', category: 'Scope' },
    { value: 'remove_items', label: '➖ Remove Items/Services', category: 'Scope' },
    { value: 'change_materials', label: '🔧 Change Materials/Products', category: 'Scope' },
    { value: 'change_scope', label: '📋 Change Scope of Work', category: 'Scope' },
    
    // Timeline
    { value: 'change_timeline', label: '📅 Change Timeline/Schedule', category: 'Timeline' },
    { value: 'expedite_work', label: '⚡ Expedite Work', category: 'Timeline' },
    
    // Details
    { value: 'more_details', label: '📝 Need More Details', category: 'Details' },
    { value: 'clarification', label: '❓ Need Clarification', category: 'Details' },
    
    // Other
    { value: 'other', label: '📋 Other Changes', category: 'Other' }
  ];

  // Group by category
  const groupedTypes = changeTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {});

  const urgencyLevels = [
    { value: 'low', label: 'Low - No rush', color: 'text-gray-600' },
    { value: 'normal', label: 'Normal - Standard timeline', color: 'text-blue-600' },
    { value: 'high', label: 'High - Customer waiting', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent - Need ASAP', color: 'text-red-600' }
  ];

  const handleChangeTypeToggle = (value) => {
    setFormData(prev => ({
      ...prev,
      changeTypes: prev.changeTypes.includes(value)
        ? prev.changeTypes.filter(t => t !== value)
        : [...prev.changeTypes, value]
    }));
    // Clear error
    if (errors.changeTypes) {
      setErrors(prev => ({ ...prev, changeTypes: null }));
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (formData.changeTypes.length === 0) {
      newErrors.changeTypes = 'Please select at least one change type';
    }
    
    if (!formData.changeDetails.trim()) {
      newErrors.changeDetails = 'Please describe what changes are needed';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    
    onConfirm({
      changeTypes: formData.changeTypes,
      changeDetails: formData.changeDetails.trim(),
      followUpDate: formData.followUpDate || null,
      urgency: formData.urgency
    });
    
    // Reset form
    setFormData({
      changeTypes: [],
      changeDetails: '',
      followUpDate: '',
      urgency: 'normal'
    });
    setErrors({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <PencilSquareIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Changes Requested</h2>
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
          {/* Info Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-900 mb-1">
                  Customer wants changes to this quote
                </p>
                <p className="text-xs text-yellow-700">
                  Track what needs to be changed so you can send a revised quote
                </p>
              </div>
            </div>
          </div>

          {/* Change Types (Multiple Selection) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What changes are needed? <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 font-normal ml-2">(Select all that apply)</span>
            </label>
            
            <div className="space-y-4">
              {Object.entries(groupedTypes).map(([category, types]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {category}
                  </p>
                  <div className="space-y-2">
                    {types.map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.changeTypes.includes(type.value)
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.changeTypes.includes(type.value)}
                          onChange={() => handleChangeTypeToggle(type.value)}
                          className="mr-3"
                        />
                        <span className="text-sm text-gray-900">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {errors.changeTypes && (
              <p className="mt-2 text-sm text-red-600">{errors.changeTypes}</p>
            )}
          </div>

          {/* Change Details */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe the changes needed <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.changeDetails}
              onChange={(e) => handleChange('changeDetails', e.target.value)}
              placeholder="Be specific about what the customer wants changed..."
              rows={5}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none ${
                errors.changeDetails ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.changeDetails && (
              <p className="mt-2 text-sm text-red-600">{errors.changeDetails}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Include specific details: quantities, materials, pricing, timeline, etc.
            </p>
          </div>

          {/* Urgency Level */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Urgency Level
            </label>
            <div className="space-y-2">
              {urgencyLevels.map((level) => (
                <label
                  key={level.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.urgency === level.value
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value={level.value}
                    checked={formData.urgency === level.value}
                    onChange={(e) => handleChange('urgency', e.target.value)}
                    className="mr-3"
                  />
                  <span className={`text-sm font-medium ${level.color}`}>{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Follow-Up Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Follow-Up Date (Optional)
            </label>
            <input
              type="date"
              value={formData.followUpDate}
              onChange={(e) => handleChange('followUpDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              When should you follow up with the revised quote?
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
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition-colors"
          >
            Save Changes Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangesRequestedModal;

