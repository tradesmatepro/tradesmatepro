import React, { useState, useEffect } from 'react';
import { InvoicesService } from '../services/InvoicesService';
import { XMarkIcon, PrinterIcon } from '@heroicons/react/24/outline';

const InvoiceDetailModal = ({ isOpen, onClose, invoice, onStatusChange, onPrint }) => {
  const [fullInvoice, setFullInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && invoice) {
      loadFullInvoice();
    }
  }, [isOpen, invoice]);

  const loadFullInvoice = async () => {
    try {
      setLoading(true);
      const data = await InvoicesService.getInvoiceById(invoice.id, invoice.company_id);
      setFullInvoice(data);
    } catch (error) {
      console.error('Error loading invoice details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      UNPAID: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      PARTIALLY_PAID: { bg: 'bg-orange-100', text: 'text-orange-800' },
      PAID: { bg: 'bg-green-100', text: 'text-green-800' },
      OVERDUE: { bg: 'bg-red-100', text: 'text-red-800' },
      VOID: { bg: 'bg-gray-100', text: 'text-gray-500' }
    };

    const config = statusConfig[status] || statusConfig.UNPAID;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  const getStatusActions = (invoice) => {
    const actions = [];
    const currentStatus = invoice.status;

    if (currentStatus === 'DRAFT') {
      actions.push(
        <button key="send" onClick={() => onStatusChange(invoice, 'SENT')} className="btn-secondary text-sm">
          Mark as Sent
        </button>
      );
    }

    if (['SENT', 'UNPAID', 'PARTIALLY_PAID', 'OVERDUE'].includes(currentStatus)) {
      actions.push(
        <button key="paid" onClick={() => onStatusChange(invoice, 'PAID')} className="btn-primary text-sm">
          Mark as Paid
        </button>
      );
    }

    if (!['PAID', 'VOID'].includes(currentStatus)) {
      actions.push(
        <button key="void" onClick={() => onStatusChange(invoice, 'VOID')} className="btn-danger text-sm">
          Void Invoice
        </button>
      );
    }

    return actions;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Invoice Details</h2>
          <div className="flex items-center space-x-3">
            {/* Send (placeholder) */}
            <button
              onClick={() => alert('Email delivery coming soon. Configure in Settings → Invoicing.')}
              className="text-gray-400 hover:text-gray-500"
              title="Send (Coming soon)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.612 3.21a.75.75 0 0 1 .82-.09l15 7.5a.75.75 0 0 1 0 1.36l-15 7.5a.75.75 0 0 1-1.06-.84l1.84-6.08a.75.75 0 0 1 .48-.5l8.67-3.1-8.67-3.1a.75.75 0 0 1-.48-.5L3.37 4.05a.75.75 0 0 1 .24-.84z" />
              </svg>
            </button>

            {/* Pay Now (placeholder) */}
            <button
              onClick={() => alert('Online payments coming soon. Connect in Settings → Invoicing.')}
              className="text-gray-400 hover:text-gray-500"
              title="Pay Now (Coming soon)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.5 5.25A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 19.5 5.25h-15zm0 1.5h15a.75.75 0 0 1 .75.75v1.5H3.75v-1.5a.75.75 0 0 1 .75-.75zm16.5 4.5H3.75v5.25a.75.75 0 0 0 .75.75h15a.75.75 0 0 0 .75-.75V11.25z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Export/Print */}
            <button
              onClick={() => onPrint(fullInvoice || invoice)}
              className="text-blue-600 hover:text-blue-800"
              title="Export PDF"
            >
              <PrinterIcon className="w-5 h-5" />
            </button>

            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" title="Close">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading invoice details...</div>
        ) : fullInvoice ? (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Invoice Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Invoice #:</strong> {fullInvoice.invoice_number}</div>
                  <div><strong>Status:</strong> {getStatusBadge(fullInvoice.status)}</div>
                  <div><strong>Issued:</strong> {new Date(fullInvoice.issued_at).toLocaleDateString()}</div>
                  <div><strong>Due:</strong> {new Date(fullInvoice.due_date || fullInvoice.due_at).toLocaleDateString()}</div>
                  <div><strong>Currency:</strong> {fullInvoice.currency || 'USD'}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {fullInvoice.customers?.name || 'No Customer'}</div>
                  <div><strong>Email:</strong> {fullInvoice.customers?.email || 'N/A'}</div>
                  <div><strong>Phone:</strong> {fullInvoice.customers?.phone || 'N/A'}</div>
                  <div><strong>Address:</strong> {fullInvoice.customers?.address || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <h3 className="text-lg font-medium mb-3">Line Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(fullInvoice.items || []).map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.item_name || (item.description?.split(':')[0] || 'Labor')}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{item.description}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">{Number(item.quantity).toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">${Number(item.unit_price || 0).toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">${Number(item.discount_value || item.discount || 0).toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">${Number(item.line_total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-right space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${Number(fullInvoice.subtotal || 0).toFixed(2)}</span>
                </div>
                {fullInvoice.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-${Number(fullInvoice.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({Number(fullInvoice.tax_rate || 0).toFixed(2)}%):</span>
                  <span>${Number(fullInvoice.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${Number(fullInvoice.total_amount || fullInvoice.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {fullInvoice.notes && (
              <div>
                <h3 className="text-lg font-medium mb-3">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{fullInvoice.notes}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="flex space-x-2">
                {getStatusActions(fullInvoice)}
              </div>
              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Failed to load invoice details</div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
