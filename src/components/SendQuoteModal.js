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
  portalLink,
  companySettings // NEW: Pass company settings for defaults
}) => {
  const [formData, setFormData] = useState({
    deliveryMethod: 'email', // 'email', 'sms', 'both'
    customMessage: '',
    includeAttachment: true,
    sendCopyToSelf: false,

    // NEW: Scheduling overrides
    schedulingMode: 'customer_choice', // 'customer_choice', 'company_schedules', 'auto_schedule'
    customAvailabilityDays: [], // e.g., ['saturday', 'sunday'] for emergency/weekend work
    customAvailabilityHoursStart: '', // e.g., '07:00'
    customAvailabilityHoursEnd: '', // e.g., '20:00'

    // NEW: Deposit overrides
    depositRequired: companySettings?.require_deposit_on_approval || false,
    depositRequiredBeforeScheduling: false,
    allowedPaymentMethods: ['online', 'cash', 'check'] // Default: all methods
  });

  const [errors, setErrors] = useState({});
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

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
      sentAt: new Date().toISOString(),

      // NEW: Include scheduling and deposit overrides
      schedulingMode: formData.schedulingMode,
      customAvailabilityDays: formData.customAvailabilityDays.length > 0 ? formData.customAvailabilityDays : null,
      customAvailabilityHoursStart: formData.customAvailabilityHoursStart || null,
      customAvailabilityHoursEnd: formData.customAvailabilityHoursEnd || null,
      depositRequired: formData.depositRequired,
      depositRequiredBeforeScheduling: formData.depositRequiredBeforeScheduling,
      allowedPaymentMethods: formData.allowedPaymentMethods
    };

    onConfirm(sendData);

    // Reset form
    setFormData({
      deliveryMethod: 'email',
      customMessage: '',
      includeAttachment: true,
      sendCopyToSelf: false,
      schedulingMode: 'customer_choice',
      customAvailabilityDays: [],
      customAvailabilityHoursStart: '',
      customAvailabilityHoursEnd: '',
      depositRequired: companySettings?.require_deposit_on_approval || false,
      depositRequiredBeforeScheduling: false,
      allowedPaymentMethods: ['online', 'cash', 'check']
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

  const defaultSMSMessage = `Hi ${customerName}, your quote for ${quoteTitle} is ready! Amount: $${parseFloat(quoteAmount || 0).toFixed(2)}. View online: ${portalLink} Reply STOP to opt out.`;

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

          {/* SMS Preview - Active via Twilio */}
          {(formData.deliveryMethod === 'sms' || formData.deliveryMethod === 'both') && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  SMS Preview
                </label>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Active via Twilio
                </span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">{defaultSMSMessage}</p>
                <p className="text-xs text-gray-500 mt-2">Character count: {defaultSMSMessage.length}/160</p>
              </div>
              <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                SMS will be sent via Twilio with portal link
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

          {/* Advanced Options Toggle */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <svg className={`w-4 h-4 transition-transform ${showAdvancedOptions ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Advanced Options (Scheduling & Deposit Overrides)
            </button>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Customize scheduling and deposit requirements for this quote only
            </p>
          </div>

          {/* Advanced Options Panel */}
          {showAdvancedOptions && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-6">
              {/* Scheduling Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  📅 Scheduling Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="scheduling-mode"
                      value="customer_choice"
                      checked={formData.schedulingMode === 'customer_choice'}
                      onChange={(e) => handleChange('schedulingMode', e.target.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Use Default Settings</div>
                      <div className="text-xs text-gray-600">Customer picks from your normal business hours</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="scheduling-mode"
                      value="custom_schedule"
                      checked={formData.schedulingMode === 'custom_schedule'}
                      onChange={(e) => handleChange('schedulingMode', e.target.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Custom Schedule for This Quote</div>
                      <div className="text-xs text-gray-600">Override days/hours for emergency or weekend work</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="scheduling-mode"
                      value="company_schedules"
                      checked={formData.schedulingMode === 'company_schedules'}
                      onChange={(e) => handleChange('schedulingMode', e.target.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Company Will Schedule</div>
                      <div className="text-xs text-gray-600">Customer can't pick time - you'll call them</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="scheduling-mode"
                      value="auto_schedule"
                      checked={formData.schedulingMode === 'auto_schedule'}
                      onChange={(e) => handleChange('schedulingMode', e.target.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Auto-Schedule ASAP</div>
                      <div className="text-xs text-gray-600">Automatically book earliest available slot</div>
                    </div>
                  </label>
                </div>

                {/* Custom Schedule Options */}
                {formData.schedulingMode === 'custom_schedule' && (
                  <div className="mt-4 p-3 bg-white border border-blue-300 rounded space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Available Days</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                          <label key={day} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.customAvailabilityDays.includes(day)}
                              onChange={(e) => {
                                const newDays = e.target.checked
                                  ? [...formData.customAvailabilityDays, day]
                                  : formData.customAvailabilityDays.filter(d => d !== day);
                                handleChange('customAvailabilityDays', newDays);
                              }}
                              className="rounded"
                            />
                            <span className="text-xs capitalize">{day.slice(0, 3)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={formData.customAvailabilityHoursStart}
                          onChange={(e) => handleChange('customAvailabilityHoursStart', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="time"
                          value={formData.customAvailabilityHoursEnd}
                          onChange={(e) => handleChange('customAvailabilityHoursEnd', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Deposit Options */}
              <div className="pt-4 border-t border-blue-300">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  💳 Deposit Options
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.depositRequired}
                      onChange={(e) => handleChange('depositRequired', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-900">Require Deposit for This Quote</span>
                  </label>

                  {formData.depositRequired && (
                    <div className="ml-6 space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.depositRequiredBeforeScheduling}
                          onChange={(e) => handleChange('depositRequiredBeforeScheduling', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-900">Deposit Required BEFORE Scheduling</span>
                      </label>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Allowed Payment Methods</label>
                        <div className="space-y-2">
                          {[
                            { value: 'online', label: '💳 Pay Online' },
                            { value: 'cash', label: '💵 Cash' },
                            { value: 'check', label: '🏦 Check' }
                          ].map(method => (
                            <label key={method.value} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.allowedPaymentMethods.includes(method.value)}
                                onChange={(e) => {
                                  const newMethods = e.target.checked
                                    ? [...formData.allowedPaymentMethods, method.value]
                                    : formData.allowedPaymentMethods.filter(m => m !== method.value);
                                  handleChange('allowedPaymentMethods', newMethods);
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{method.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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

