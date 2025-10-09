import React, { useState } from 'react';
import { 
  XMarkIcon, 
  PresentationChartLineIcon,
  UserIcon 
} from '@heroicons/react/24/outline';

/**
 * PresentedModal
 * 
 * Purpose: Record when quote was presented in person
 * Industry Standard: ServiceTitan tracks this, Jobber basic, Housecall Pro basic
 * 
 * What it does:
 * 1. Records presentation date/time
 * 2. Records who presented (technician/salesperson)
 * 3. Records customer reaction/feedback
 * 4. Optional: Next steps
 * 5. Changes status from 'draft/sent' → 'presented'
 * 6. Records presented_at timestamp
 * 
 * Part of: Phase 2E - Medium Priority
 * Competitive Advantage: Match ServiceTitan
 */

const PresentedModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  quoteTitle,
  customerName 
}) => {
  const [formData, setFormData] = useState({
    presentedDate: new Date().toISOString().split('T')[0],
    presentedTime: new Date().toTimeString().slice(0, 5),
    presentedBy: '',
    customerReaction: '',
    nextSteps: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Removed console.log to prevent render spam on every keystroke
  // console.log('🎭 PresentedModal render:', { isOpen, quoteTitle, customerName });

  if (!isOpen) return null;

  const customerReactions = [
    { value: 'very_interested', label: '😊 Very Interested', color: 'text-green-600' },
    { value: 'interested', label: '🙂 Interested', color: 'text-blue-600' },
    { value: 'neutral', label: '😐 Neutral / Thinking', color: 'text-gray-600' },
    { value: 'hesitant', label: '🤔 Hesitant / Concerns', color: 'text-yellow-600' },
    { value: 'not_interested', label: '😕 Not Interested', color: 'text-red-600' }
  ];

  const nextStepsOptions = [
    'Customer will review and get back to us',
    'Customer wants to think about it',
    'Customer will discuss with spouse/partner',
    'Customer requested changes to quote',
    'Customer ready to approve',
    'Schedule follow-up call',
    'Schedule follow-up visit',
    'Waiting on customer decision',
    'Other (specify in notes)'
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
    
    if (!formData.presentedDate) {
      newErrors.presentedDate = 'Presentation date is required';
    }
    
    if (!formData.presentedBy) {
      newErrors.presentedBy = 'Please enter who presented the quote';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    
    onConfirm({
      presentedDate: formData.presentedDate,
      presentedTime: formData.presentedTime,
      presentedBy: formData.presentedBy.trim(),
      customerReaction: formData.customerReaction,
      nextSteps: formData.nextSteps,
      notes: formData.notes.trim()
    });
    
    // Reset form
    setFormData({
      presentedDate: new Date().toISOString().split('T')[0],
      presentedTime: new Date().toTimeString().slice(0, 5),
      presentedBy: '',
      customerReaction: '',
      nextSteps: '',
      notes: ''
    });
    setErrors({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <PresentationChartLineIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quote Presented</h2>
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
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <PresentationChartLineIcon className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-purple-900 mb-1">
                  Quote presented in person to {customerName}
                </p>
                <p className="text-xs text-purple-700">
                  Record details about the presentation to track effectiveness
                </p>
              </div>
            </div>
          </div>

          {/* Presentation Date & Time */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presentation Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.presentedDate}
                onChange={(e) => handleChange('presentedDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.presentedDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.presentedDate && (
                <p className="mt-1 text-sm text-red-600">{errors.presentedDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presentation Time
              </label>
              <input
                type="time"
                value={formData.presentedTime}
                onChange={(e) => handleChange('presentedTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Presented By */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Presented By <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.presentedBy}
                onChange={(e) => handleChange('presentedBy', e.target.value)}
                placeholder="Technician or salesperson name..."
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.presentedBy ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.presentedBy && (
              <p className="mt-2 text-sm text-red-600">{errors.presentedBy}</p>
            )}
          </div>

          {/* Customer Reaction */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Customer Reaction (Optional)
            </label>
            <div className="space-y-2">
              {customerReactions.map((reaction) => (
                <label
                  key={reaction.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.customerReaction === reaction.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="customer-reaction"
                    value={reaction.value}
                    checked={formData.customerReaction === reaction.value}
                    onChange={(e) => handleChange('customerReaction', e.target.value)}
                    className="mr-3"
                  />
                  <span className={`text-sm font-medium ${reaction.color}`}>
                    {reaction.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Steps (Optional)
            </label>
            <select
              value={formData.nextSteps}
              onChange={(e) => handleChange('nextSteps', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select next steps...</option>
              {nextStepsOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional details about the presentation (customer questions, concerns, feedback, etc.)..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
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
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
          >
            Save Presentation
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresentedModal;

