import React, { useState } from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

/**
 * CompletionPromptModal
 * 
 * Purpose: Smart prompt when job is completed
 * Shows 3 options:
 * 1. Create Invoice Now - Immediately generates invoice
 * 2. Mark Complete (Invoice Later) - Job stays in "Requires Invoicing"
 * 3. Extend Job - Opens ExtendJobModal to add more time
 * 
 * Part of: Phase 2 - Smart Status Progression
 */

const CompletionPromptModal = ({ 
  isOpen, 
  onClose, 
  onCreateInvoice, 
  onMarkComplete, 
  onExtendJob,
  jobTitle 
}) => {
  const [selectedOption, setSelectedOption] = useState('invoice'); // 'invoice', 'complete', 'extend'

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedOption === 'invoice') {
      onCreateInvoice();
    } else if (selectedOption === 'complete') {
      onMarkComplete();
    } else if (selectedOption === 'extend') {
      onExtendJob();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Job Completed!</h2>
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
          <p className="text-gray-600 mb-6">
            <span className="font-medium text-gray-900">{jobTitle}</span> has been marked as complete. What would you like to do next?
          </p>

          {/* Options */}
          <div className="space-y-3">
            {/* Option 1: Create Invoice Now */}
            <label
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedOption === 'invoice'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="completion-option"
                value="invoice"
                checked={selectedOption === 'invoice'}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Create Invoice Now</span>
                </div>
                <p className="text-sm text-gray-600">
                  Immediately generate an invoice for this job. You'll be taken to the invoice creation page.
                </p>
              </div>
            </label>

            {/* Option 2: Mark Complete (Invoice Later) */}
            <label
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedOption === 'complete'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="completion-option"
                value="complete"
                checked={selectedOption === 'complete'}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Mark Complete (Invoice Later)</span>
                </div>
                <p className="text-sm text-gray-600">
                  Job will be marked complete and moved to "Requires Invoicing" status. You can invoice it later.
                </p>
              </div>
            </label>

            {/* Option 3: Extend Job */}
            <label
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedOption === 'extend'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="completion-option"
                value="extend"
                checked={selectedOption === 'extend'}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <ClockIcon className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-gray-900">Extend Job</span>
                </div>
                <p className="text-sm text-gray-600">
                  Job needs more time? Add additional hours to continue working on this job.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            {selectedOption === 'invoice' && 'Create Invoice'}
            {selectedOption === 'complete' && 'Mark Complete'}
            {selectedOption === 'extend' && 'Extend Job'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionPromptModal;

