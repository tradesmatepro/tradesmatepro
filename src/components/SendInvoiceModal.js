import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

import invoiceSendingService from '../services/InvoiceSendingService';
import twilioService from '../services/TwilioService';
import { InvoicesService, computeInvoiceTotals } from '../services/InvoicesService';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';

/**
 * Generate a simulated signature image from typed name
 * Creates a canvas with elegant cursive-style text and returns as data URL
 * Uses better font sizing and positioning to avoid cutoff
 */
const generateSignatureImage = (name) => {
  if (!name || name.trim() === '') return null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw signature line (elegant underline)
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, 100);
    ctx.lineTo(480, 100);
    ctx.stroke();

    // Draw signature text in elegant cursive style
    // Start with larger font and scale down if needed
    let fontSize = 60;
    ctx.fillStyle = '#1f2937';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    // Try different fonts in order of preference
    const fonts = [
      'italic 60px "Brush Script MT"',
      'italic 60px "Lucida Handwriting"',
      'italic 60px cursive',
      'italic 60px serif'
    ];

    let textWidth = 0;
    for (let font of fonts) {
      ctx.font = font;
      const metrics = ctx.measureText(name);
      textWidth = metrics.width;
      console.log(`📝 Font: ${font}, width: ${textWidth}, name: ${name}`);

      // If text fits, use this font
      if (textWidth < 450) {
        console.log(`✅ Using font: ${font}`);
        break;
      }

      // Otherwise try smaller size
      fontSize = 48;
      ctx.font = font.replace('60px', '48px');
      const metrics2 = ctx.measureText(name);
      textWidth = metrics2.width;
      console.log(`📝 Trying smaller: ${font.replace('60px', '48px')}, width: ${textWidth}`);

      if (textWidth < 450) {
        console.log(`✅ Using smaller font: ${font.replace('60px', '48px')}`);
        break;
      }
    }

    ctx.fillText(name, 25, 60);
    console.log(`🖊️ Drew signature: "${name}" at position (25, 60), textWidth: ${textWidth}`);

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');
    console.log(`✅ Generated signature image, size: ${dataUrl.length} bytes`);
    return dataUrl;
  } catch (e) {
    console.error('❌ Failed to generate signature image:', e);
    return null;
  }
};

/**
 * SendInvoiceModal - Industry Standard Invoice Sending
 *
 * Matches SendQuoteModal functionality but for invoices:
 * 1. Choose delivery method (Email, SMS, Both)
 * 2. Add custom message
 * 3. Record payment now (cash/check/card/ACH) OR send payment link
 * 4. Copy portal link
 * 5. Changes status from 'draft' → 'sent'
 * 6. Records sent_at timestamp
 */

const SendInvoiceModal = ({
  isOpen,
  onClose,
  invoice,
  onSent,
  companySettings = {} // ✅ NEW: Accept company settings as prop
}) => {
  const { user } = useUser();

  // Extract invoice data
  const quoteTitle = invoice?.invoice_number || 'Invoice';
  const customerName = invoice?.customers?.name || invoice?.customer_name || 'Customer';
  const customerEmail = invoice?.customers?.email || invoice?.customer_email || '';
  const customerPhone = invoice?.customers?.phone || invoice?.customer_phone || '';
  const quoteAmount = invoice?.total_amount || 0;
  const portalLink = `${window.location.origin}/invoice/${invoice?.id}`;

  // Handle invoice sending with payment recording
  const onConfirm = async (sendData) => {
    console.log('📧 SendInvoiceModal.onConfirm CALLED with sendData:', sendData);
    console.log('📧 Invoice object:', {
      id: invoice?.id,
      work_order_id: invoice?.work_order_id,
      customer_id: invoice?.customer_id,
      total_amount: invoice?.total_amount,
      invoiceKeys: invoice ? Object.keys(invoice) : 'invoice is null'
    });
    if (!validate()) {
      console.log('❌ Validation failed');
      return;
    }

    try {
      console.log('📧 Starting invoice send process...');
      let emailSent = false;
      let smsSent = false;




      // 1) Record payment now if selected
      if (formData.recordPaymentNow && parseFloat(formData.paymentAmount) > 0) {
        console.log('💳 Recording payment...');
        await InvoicesService.addPayment(
          invoice.id,
          parseFloat(formData.paymentAmount),
          formData.paymentMethod.toUpperCase(),
          user.company_id,
          invoice.customer_id,
          user.id,
          formData.paymentReference || null
        );
        console.log('✅ Payment recorded');
      }

      // 2) Send invoice via selected channels
      console.log('📨 Delivery method:', formData.deliveryMethod);
      if (formData.deliveryMethod === 'email' || formData.deliveryMethod === 'both') {
        try {
          console.log('📧 Calling invoiceSendingService.sendInvoiceEmail...');
          const result = await invoiceSendingService.sendInvoiceEmail(user.company_id, invoice.id, {
            customMessage: formData.customMessage,
            includePDF: formData.includeAttachment
          });
          console.log('✅ Invoice sent via email:', result);
          window?.toast?.success?.(`Invoice sent via email to ${result.sentTo}!`);
          emailSent = true;
        } catch (e) {
          console.error('❌ Invoice email failed:', e);
          window?.toast?.error?.(`Email failed: ${e.message}`);
        }
      }

      if (formData.deliveryMethod === 'sms' || formData.deliveryMethod === 'both') {
        try {
          console.log('📱 Sending SMS...');
          await twilioService.sendInvoiceReminder(invoice, user.company_id);
          console.log('✅ SMS sent');
          smsSent = true;
        } catch (e) {
          console.warn('Invoice SMS failed:', e);
        }
      }

      // 3) Update invoice status to 'sent' only if at least one channel succeeded
      const sentAny = emailSent || smsSent;
      if (sentAny) {
        console.log('📝 Updating invoice status to sent...');
        await InvoicesService.updateInvoice(invoice.id, {
          status: 'sent',
          sent_at: new Date().toISOString()
        }, [], user.company_id);
        console.log('✅ Invoice status updated');
      } else {
        console.warn('⚠️ Not marking invoice as sent because no channel succeeded');
        window?.toast?.error?.('Invoice was not sent. Please try again.');
        return;
      }

      onSent && onSent();
      onClose && onClose();
    } catch (e) {
      console.error('Failed to send invoice:', e);
    }
  };
  const [formData, setFormData] = useState({
    deliveryMethod: 'email', // 'email', 'sms', 'both'
    customMessage: '',
    includeAttachment: false, // Default OFF: send invoice as rich HTML body; attach PDF only if checked
    sendCopyToSelf: false,

    // Invoice-specific: Payment recording
    recordPaymentNow: false,
    paymentMethod: 'cash', // 'cash', 'check', 'card', 'ach', 'other'
    paymentAmount: '',
    paymentReference: '', // Check number, transaction ID, etc.
    includePaymentLink: true // Include Stripe/online payment link in email/SMS
  });

  // Derived totals for preview/email amount (avoid 0.00 when invoice row not updated)
  const [previewTotals, setPreviewTotals] = useState({ subtotal: 0, tax: 0, total: 0 });

  useEffect(() => {
    if (!isOpen || !invoice?.id) return;
    (async () => {
      try {
        let subtotal = Number(invoice?.subtotal || 0);
        let tax = Number(invoice?.tax_amount || 0);
        let total = Number(invoice?.total_amount || 0);

        // 1) Prefer invoice_items
        const itemsRes = await supaFetch(`invoice_items?invoice_id=eq.${invoice.id}&order=sort_order.asc.nullsfirst,created_at.asc`, { method: 'GET' });
        const items = itemsRes.ok ? await itemsRes.json() : [];
        if (items.length > 0) {
          const calc = computeInvoiceTotals(items, 0, 0);
          subtotal = Number(calc.subtotal || subtotal);
          tax = Number(calc.tax_amount || tax);
          total = Number(calc.total_amount || total);
        } else {
          // 2) Fallback to work order line items (invoice.job_id is the work_order id in our schema)
          const fallbackWoId = invoice?.work_order_id || invoice?.job_id;
          if (fallbackWoId) {
            const woRes = await supaFetch(`work_order_line_items?work_order_id=eq.${fallbackWoId}`, { method: 'GET' }, user.company_id);
            const woItems = woRes.ok ? await woRes.json() : [];
            if (woItems.length > 0) {
              const calc = computeInvoiceTotals(woItems, 0, 0);
              subtotal = Number(calc.subtotal || subtotal);
              tax = Number(calc.tax_amount || tax);
              total = Number(calc.total_amount || total);
            }
          }
        }

        setPreviewTotals({ subtotal, tax, total });
      } catch (e) {
        console.warn('⚠️ Failed to compute preview totals:', e);
        setPreviewTotals({
          subtotal: Number(invoice?.subtotal || 0),
          tax: Number(invoice?.tax_amount || 0),
          total: Number(invoice?.total_amount || 0)
        });
      }
    })();
  }, [isOpen, invoice?.id, invoice?.job_id, invoice?.work_order_id, user.company_id]);

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

    // Validate payment recording
    if (formData.recordPaymentNow) {
      const amt = parseFloat(formData.paymentAmount);
      if (!amt || amt <= 0) {
        newErrors.paymentAmount = 'Payment amount must be greater than 0';
      }
      if (amt > (previewTotals?.total || quoteAmount)) {
        newErrors.paymentAmount = 'Payment amount cannot exceed invoice total';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;

    const sendData = {
      deliveryMethod: formData.deliveryMethod,
      customMessage: formData.customMessage.trim(),
      includeAttachment: formData.includeAttachment,
      sendCopyToSelf: formData.sendCopyToSelf,
      sentAt: new Date().toISOString(),

      // Invoice-specific: Payment recording
      recordPaymentNow: formData.recordPaymentNow,
      paymentMethod: formData.paymentMethod,
      paymentAmount: formData.paymentAmount,
      paymentReference: formData.paymentReference,
      includePaymentLink: formData.includePaymentLink
    };

    await onConfirm(sendData);

    // Reset form
    setFormData({
      deliveryMethod: 'email',
      customMessage: '',
      includeAttachment: false,
      sendCopyToSelf: false,
      recordPaymentNow: false,
      paymentMethod: 'cash',
      paymentAmount: '',
      paymentReference: '',
      includePaymentLink: true
    });
    setErrors({});
  };

  // ✅ DYNAMIC: Use actual company name from companies table
  const companyName = companySettings?.name || 'Our Company';
  const companyTeamName = companySettings?.name || 'Our Team';

  const defaultEmailSubject = `Invoice ${quoteTitle} from ${companyName}`;
  const defaultEmailBody = `Hi ${customerName},

Thank you for your business! Please find your invoice details below.

Invoice Amount: $${parseFloat((previewTotals?.total ?? quoteAmount ?? 0)).toFixed(2)}
Due Date: ${invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Upon receipt'}

${formData.customMessage ? `\n${formData.customMessage}\n` : ''}
${formData.includePaymentLink ? `\nPay online: ${portalLink}\n` : ''}
Please remit payment at your earliest convenience. Thank you!

Best regards,
${companyTeamName} Team`;

  const defaultSMSMessage = `Hi ${customerName}, Invoice ${quoteTitle} is ready! Amount: $${parseFloat((previewTotals?.total ?? quoteAmount ?? 0)).toFixed(2)}. ${formData.includePaymentLink ? `Pay online: ${portalLink}` : ''} Reply STOP to opt out.`;

  // ✅ FIX: Only render modal when isOpen is true
  if (!isOpen) {
    console.log('🚫 SendInvoiceModal not rendering - isOpen is false');
    return null;
  }

  console.log('✅ SendInvoiceModal rendering - isOpen is true');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <PaperAirplaneIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Send Invoice</h2>
              <p className="text-sm text-gray-500 mt-0.5">Invoice {quoteTitle}</p>
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
                    ? 'border-green-500 bg-green-50'
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
                <EnvelopeIcon className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Email</span>
                {!customerEmail && <span className="text-xs text-red-500 mt-1">No email</span>}
              </label>

              <label
                className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.deliveryMethod === 'sms'
                    ? 'border-green-500 bg-green-50'
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
                <DevicePhoneMobileIcon className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">SMS</span>
                {!customerPhone && <span className="text-xs text-red-500 mt-1">No phone</span>}
              </label>

              <label
                className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.deliveryMethod === 'both'
                    ? 'border-green-500 bg-green-50'
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
                  <EnvelopeIcon className="w-6 h-6 text-green-600" />
                  <DevicePhoneMobileIcon className="w-6 h-6 text-green-600" />
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



          {/* Payment Recording Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.recordPaymentNow}
                onChange={(e) => handleChange('recordPaymentNow', e.target.checked)}
                className="rounded"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">💵 Record Payment Now</div>
                <div className="text-xs text-gray-500">Customer already paid with cash, check, or card</div>
              </div>
            </label>
          </div>

          {/* Payment Recording Panel */}
          {formData.recordPaymentNow && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="cash">💵 Cash</option>
                  <option value="check">🏦 Check</option>
                  <option value="card">💳 Credit/Debit Card</option>
                  <option value="ach">🏛️ ACH/Bank Transfer</option>
                  <option value="other">📝 Other</option>
                </select>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Payment Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={quoteAmount}
                    value={formData.paymentAmount}
                    onChange={(e) => handleChange('paymentAmount', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Invoice total: ${parseFloat(quoteAmount).toFixed(2)}
                </p>
                {errors.paymentAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentAmount}</p>
                )}
              </div>

              {/* Payment Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Reference/Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formData.paymentReference}
                  onChange={(e) => handleChange('paymentReference', e.target.value)}
                  placeholder="Check #, Transaction ID, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              Send Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendInvoiceModal;

