// Customer Invoices - View and manage invoices from customer perspective
import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import {
  CurrencyDollarIcon,
  EyeIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const CustomerInvoices = ({ invoices, onRefresh }) => {
  const { user } = useUser();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'PARTIALLY_PAID': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    try {
      setLoading(true);
      
      const response = await supaFetch(`invoices?id=eq.${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PAID',
          updated_at: new Date().toISOString()
        })
      }, user.company_id);

      if (response.ok) {
        onRefresh();
        setSelectedInvoice(null);
      } else {
        throw new Error('Failed to mark invoice as paid');
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Failed to mark invoice as paid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (invoice) => {
    if (invoice.status === 'PAID' || !invoice.due_at) return false;
    return new Date(invoice.due_at) < new Date();
  };

  const InvoiceCard = ({ invoice }) => {
    const overdue = isOverdue(invoice);
    
    return (
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-medium text-gray-900">
                Invoice #{invoice.invoice_number || invoice.id?.slice(-8)}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(overdue ? 'OVERDUE' : invoice.status)}`}>
                {overdue ? 'OVERDUE' : invoice.status}
              </span>
              {overdue && (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              )}
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4" />
                <span>{invoice.customers?.name || 'Unknown Customer'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  Issued: {invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString() : new Date(invoice.created_at).toLocaleDateString()}
                </span>
              </div>

              {invoice.due_at && (
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4" />
                  <span className={overdue ? 'text-red-600 font-medium' : ''}>
                    Due: {new Date(invoice.due_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {invoice.notes && (
              <p className="mt-3 text-sm text-gray-700 line-clamp-2">{invoice.notes}</p>
            )}
          </div>

          <div className="ml-4 flex flex-col items-end space-y-2">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ${(invoice.total_amount || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedInvoice(invoice)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="View Details"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Download PDF"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons for unpaid invoices */}
        {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => handleMarkPaid(invoice.id)}
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              Mark as Paid
            </button>
            <button
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Pay Online (Coming Soon)
            </button>
          </div>
        )}
      </div>
    );
  };

  const InvoiceDetailModal = ({ invoice, onClose }) => {
    const overdue = isOverdue(invoice);
    
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Invoice Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Invoice #{invoice.invoice_number || invoice.id?.slice(-8)}
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Customer: {invoice.customers?.name || 'Unknown'}</p>
                  <p>Issued: {invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString() : new Date(invoice.created_at).toLocaleDateString()}</p>
                  {invoice.due_at && (
                    <p className={overdue ? 'text-red-600 font-medium' : ''}>
                      Due: {new Date(invoice.due_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(overdue ? 'OVERDUE' : invoice.status)}`}>
                  {overdue ? 'OVERDUE' : invoice.status}
                </span>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-gray-900">
                    ${(invoice.total_amount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Total Amount</p>
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Financial Breakdown</h5>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${(invoice.subtotal || 0).toLocaleString()}</span>
                  </div>
                  {invoice.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({(invoice.tax_rate || 0)}%):</span>
                      <span>${(invoice.tax_amount || 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-medium text-lg">
                    <span>Total:</span>
                    <span>${(invoice.total_amount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            {invoice.status === 'PARTIALLY_PAID' && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Payment Status</h5>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span>Amount Paid:</span>
                    <span className="font-medium">${(invoice.amount_paid || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Remaining Balance:</span>
                    <span className="font-medium text-yellow-800">
                      ${((invoice.total_amount || 0) - (invoice.amount_paid || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {invoice.notes && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Notes</h5>
                <p className="text-gray-600 text-sm">{invoice.notes}</p>
              </div>
            )}

            {/* Related Work Order */}
            {invoice.work_order_id && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Related Work Order</h5>
                <p className="text-gray-600 text-sm">Work Order ID: {invoice.work_order_id}</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex space-x-3">
            {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
              <button
                onClick={() => handleMarkPaid(invoice.id)}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Mark as Paid
              </button>
            )}
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              Download PDF
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
              Pay Online (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Customer Invoices</h2>
          <p className="text-sm text-gray-600 mt-1">
            View and manage customer invoices and payments
          </p>
        </div>
      </div>

      {/* Invoices grid */}
      {invoices.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {invoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-600">No customer invoices available at the moment.</p>
        </div>
      )}

      {/* Invoice detail modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

export default CustomerInvoices;
