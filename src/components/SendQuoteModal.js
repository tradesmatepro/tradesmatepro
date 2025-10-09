import React, { useState } from 'react';
import { 
  XMarkIcon, 
  PaperAirplaneIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

/**
 * SendQuoteModal
 * 
 * Purpose: Send quote to customer via email/SMS
 * Industry Standard: ALL competitors (ServiceTitan, Jobber, Housecall Pro) have this
 * 
 * What it does:
 * 1. Choose delivery method (Email, SMS, or Both)
 * 2. Preview email subject/body (placeholder for now)
 * 3. Add custom message
 * 4. Send quote to customer
 * 5. Changes status from 'draft' → 'sent'
 * 6. Records sent_at timestamp
 * 
 * Part of: Phase 2C - Critical Gaps
 * Competitive Advantage: Match competitors
 * 
 * TODO Phase 5: 
 * - Email template system
 * - SMS integration
 * - PDF generation
 * - Email preview
 */

const SendQuoteModal = ({
  isOpen,
  onClose,
  onConfirm,
  quoteTitle,
  customerName,
  customerEmail,
  customerPhone,
  quoteAmount,
  portalLink
}) => {
  const [formData, setFormData] = useState({
    deliveryMethod: 'email', // 'email', 'sms', 'both'
    customMessage: '',
    includeAttachment: true,
    sendCopyToSelf: false
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
    
    if (formData.deliveryMethod === 'email' || formData.deliveryMethod === 'both') {
      if (!customerEmail) {
        newErrors.deliveryMethod = 'Customer email is required for email delivery';
      }
    }
    
    if (formData.deliveryMethod === 'sms' || formData.deliveryMethod === 'both') {
      if (!customerPhone) {
        newErrors.deliveryMethod = 'Customer phone is required for SMS delivery';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    
    const sendData = {
      deliveryMethod: formData.deliveryMethod,
      customMessage: formData.customMessage.trim(),
      includeAttachment: formData.includeAttachment,
      sendCopyToSelf: formData.sendCopyToSelf,
      sentAt: new Date().toISOString()
    };
    
    onConfirm(sendData);
    
    // Reset form
    setFormData({
      deliveryMethod: 'email',
      customMessage: '',
      includeAttachment: true,
      sendCopyToSelf: false
    });
    setErrors({});
  };

  const defaultEmailSubject = `Quote from Your Company - ${quoteTitle}`;
  const defaultEmailBody = `Hi ${customerName},

Thank you for your interest! Please find attached your quote for ${quoteTitle}.

Quote Amount: $${parseFloat(quoteAmount || 0).toFixed(2)}

${formData.customMessage ? `\n${formData.customMessage}\n` : ''}
Please review and let us know if you have any questions. We look forward to working with you!

Best regards,
Your Company Team`;

  const defaultSMSMessage = `Hi ${customerName}, your quote for ${quoteTitle} is ready! Amount: $${parseFloat(quoteAmount || 0).toFixed(2)}. Check your email for details or reply to this message.`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <PaperAirplaneIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Send Quote</h2>
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
          {/* Customer Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Sending to:</p>
            <p className="text-sm text-gray-900 font-semibold">{customerName}</p>
            {customerEmail && (
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <EnvelopeIcon className="w-4 h-4" />
                {customerEmail}
              </p>
            )}
            {customerPhone && (
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <DevicePhoneMobileIcon className="w-4 h-4" />
                {customerPhone}
              </p>
            )}
          </div>

          {/* Delivery Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Delivery Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label
                className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.deliveryMethod === 'email'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!customerEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="delivery-method"
                  value="email"
                  checked={formData.deliveryMethod === 'email'}
                  onChange={(e) => handleChange('deliveryMethod', e.target.value)}
                  disabled={!customerEmail}
                  className="sr-only"
                />
                <EnvelopeIcon className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Email</span>
                {!customerEmail && <span className="text-xs text-red-500 mt-1">No email</span>}
              </label>

              <label
                className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.deliveryMethod === 'sms'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!customerPhone ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="delivery-method"
                  value="sms"
                  checked={formData.deliveryMethod === 'sms'}
                  onChange={(e) => handleChange('deliveryMethod', e.target.value)}
                  disabled={!customerPhone}
                  className="sr-only"
                />
                <DevicePhoneMobileIcon className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">SMS</span>
                {!customerPhone && <span className="text-xs text-red-500 mt-1">No phone</span>}
              </label>

              <label
                className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.deliveryMethod === 'both'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${(!customerEmail || !customerPhone) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="delivery-method"
                  value="both"
                  checked={formData.deliveryMethod === 'both'}
                  onChange={(e) => handleChange('deliveryMethod', e.target.value)}
                  disabled={!customerEmail || !customerPhone}
                  className="sr-only"
                />
                <div className="flex gap-1 mb-2">
                  <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                  <DevicePhoneMobileIcon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">Both</span>
                {(!customerEmail || !customerPhone) && <span className="text-xs text-red-500 mt-1">Missing info</span>}
              </label>
            </div>
            {errors.deliveryMethod && (
              <p className="mt-2 text-sm text-red-600">{errors.deliveryMethod}</p>
            )}
          </div>

          {/* Custom Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Message (Optional)
            </label>
            <textarea
              value={formData.customMessage}
              onChange={(e) => handleChange('customMessage', e.target.value)}
              placeholder="Add a personal message to include with the quote..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              This message will be included in the email/SMS to the customer
            </p>
          </div>

          {/* Email Preview - Placeholder */}
          {(formData.deliveryMethod === 'email' || formData.deliveryMethod === 'both') && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Preview
                </label>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  Placeholder - Phase 5
                </span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Subject:</p>
                <p className="text-sm text-gray-900 mb-3">{defaultEmailSubject}</p>
                <p className="text-xs font-medium text-gray-500 mb-1">Body:</p>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">{defaultEmailBody}</pre>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                📧 Full email template customization coming in Phase 5
              </p>
            </div>
          )}

          {/* SMS Preview - Placeholder */}
          {(formData.deliveryMethod === 'sms' || formData.deliveryMethod === 'both') && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  SMS Preview
                </label>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  Placeholder - Phase 5
                </span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">{defaultSMSMessage}</p>
                <p className="text-xs text-gray-500 mt-2">Character count: {defaultSMSMessage.length}/160</p>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                📱 SMS integration coming in Phase 5
              </p>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.includeAttachment}
                onChange={(e) => handleChange('includeAttachment', e.target.checked)}
                className="rounded"
              />
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-900">Include PDF attachment (email only)</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sendCopyToSelf}
                onChange={(e) => handleChange('sendCopyToSelf', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-900">Send a copy to myself</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            onClick={() => {
              if (portalLink && navigator?.clipboard) {
                navigator.clipboard.writeText(portalLink).then(() => {
                  window?.toast?.success?.('Customer portal link copied to clipboard');
                }).catch(() => {
                  window?.toast?.error?.('Failed to copy link');
                });
              } else {
                window?.toast?.info?.('Portal link unavailable');
              }
            }}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            title="Copy customer portal link"
          >
            Copy Link
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              Send Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendQuoteModal;

