import React, { useState, useEffect } from 'react';
import { XMarkIcon, DocumentTextIcon, CurrencyDollarIcon, CalendarIcon, PaperAirplaneIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

/**
 * InvoiceCreationModal - Create invoice from completed job
 * 
 * COMPETITIVE ADVANTAGE over ServiceTitan/Jobber/Housecall Pro:
 * - Auto-populates from job data (competitors require manual re-entry)
 * - Smart payment terms with company defaults (ServiceTitan lacks this)
 * - "Send Now?" option (Jobber requires separate screen)
 * - Line items review in same modal (Housecall Pro requires navigation)
 * - Due date auto-calculated from terms (competitors require manual calculation)
 * 
 * Addresses Pain Points:
 * - ServiceTitan: Too many clicks to create and send invoice
 * - Jobber: No auto-population from job data
 * - Housecall Pro: Can't review line items before creating invoice
 */

const InvoiceCreationModal = ({
  isOpen,
  onClose,
  onConfirm,
  jobTitle,
  customerName,
  jobTotal,
  workPerformed,
  materialsUsed,
  defaultPaymentTerms = 'Net 30'
}) => {
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState(defaultPaymentTerms);
  const [dueDate, setDueDate] = useState('');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [sendNow, setSendNow] = useState(true);
  const [errors, setErrors] = useState({});

  // Payment recording
  const [recordPaymentNow, setRecordPaymentNow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  // Auto-calculate due date when invoice date or payment terms change
  useEffect(() => {
    if (!invoiceDate) return;
    
    const date = new Date(invoiceDate);
    let daysToAdd = 0;

    switch (paymentTerms) {
      case 'Due on Receipt':
        daysToAdd = 0;
        break;
      case 'Net 15':
        daysToAdd = 15;
        break;
      case 'Net 30':
        daysToAdd = 30;
        break;
      case 'Net 60':
        daysToAdd = 60;
        break;
      case 'Net 90':
        daysToAdd = 90;
        break;
      default:
        daysToAdd = 30;
    }

    date.setDate(date.getDate() + daysToAdd);
    setDueDate(date.toISOString().split('T')[0]);
  }, [invoiceDate, paymentTerms]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    
    if (!invoiceDate) newErrors.invoiceDate = 'Invoice date is required';
    if (!dueDate) newErrors.dueDate = 'Due date is required';
    if (!paymentTerms) newErrors.paymentTerms = 'Payment terms are required';

    // Validate due date is not before invoice date
    if (invoiceDate && dueDate && new Date(dueDate) < new Date(invoiceDate)) {
      newErrors.dueDate = 'Due date cannot be before invoice date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onConfirm({
      invoiceDate,
      dueDate,
      paymentTerms,
      invoiceNotes: invoiceNotes.trim(),
      sendNow,
      // Payment recording
      recordPaymentNow,
      paymentMethod,
      paymentAmount: recordPaymentNow ? parseFloat(paymentAmount) : 0,
      paymentReference
    });
  };

  const paymentTermsOptions = [
    'Due on Receipt',
    'Net 15',
    'Net 30',
    'Net 60',
    'Net 90'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Create Invoice</h2>
              <p className="text-sm text-teal-100">{jobTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-teal-100 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer & Job Info */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-semibold text-gray-900">{customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-semibold text-teal-600 text-lg">
                  ${typeof jobTotal === 'number' ? jobTotal.toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Date & Payment Terms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Invoice Date *
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.invoiceDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.invoiceDate && (
                <p className="mt-1 text-sm text-red-600">{errors.invoiceDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms *
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.paymentTerms ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {paymentTermsOptions.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
              {errors.paymentTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentTerms}</p>
              )}
            </div>
          </div>

          {/* Due Date (Auto-calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date * <span className="text-xs text-gray-500">(auto-calculated from payment terms)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                errors.dueDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              💡 TIP: You can manually adjust the due date if needed
            </p>
          </div>

          {/* Line Items Review */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-600" />
              Invoice Line Items (from job)
            </h3>
            
            {workPerformed && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Work Performed:</p>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{workPerformed}</p>
              </div>
            )}

            {materialsUsed && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Materials Used:</p>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{materialsUsed}</p>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-300">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-teal-600 text-lg">
                  ${typeof jobTotal === 'number' ? jobTotal.toFixed(2) : '0.00'}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              ℹ️ Line items are populated from the completed job. To edit, go back and update the job details.
            </p>
          </div>

          {/* Invoice Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Notes (Optional)
            </label>
            <textarea
              value={invoiceNotes}
              onChange={(e) => setInvoiceNotes(e.target.value)}
              placeholder="Add any notes for the customer (e.g., 'Thank you for your business!', 'Payment can be made via check or credit card')"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              These notes will appear on the invoice sent to the customer
            </p>
          </div>

          {/* Payment Recording Option */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={recordPaymentNow}
                onChange={(e) => setRecordPaymentNow(e.target.checked)}
                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">Record Payment Now</span>
                </div>
                <p className="text-sm text-gray-900 mt-1">
                  {recordPaymentNow
                    ? "✅ Record a payment received (cash, check, card, etc.)"
                    : "⏸️ Skip payment recording - customer will pay later"}
                </p>
              </div>
            </label>

            {/* Payment Details (shown when checkbox is checked) */}
            {recordPaymentNow && (
              <div className="mt-4 space-y-3 pt-4 border-t border-green-200">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="check">🏦 Check</option>
                    <option value="card">💳 Credit/Debit Card</option>
                    <option value="ach">🏛️ ACH/Bank Transfer</option>
                    <option value="other">📝 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Amount Paid <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={jobTotal}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">Max: ${typeof jobTotal === 'number' ? jobTotal.toFixed(2) : '0.00'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g., Check #12345, Transaction ID, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Send Now Option */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sendNow}
                onChange={(e) => setSendNow(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <PaperAirplaneIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Send Invoice to Customer Now</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Recommended</span>
                </div>
                <p className="text-sm text-gray-900 mt-1">
                  {sendNow
                    ? "✅ Invoice will be emailed to customer immediately after creation"
                    : "⏸️ Invoice will be saved as draft - you can send it later from the Invoices page"}
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <CheckCircleIcon className="h-5 w-5" />
              <span>Create Invoice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceCreationModal;

