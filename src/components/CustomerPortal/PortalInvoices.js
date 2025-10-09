// Portal Invoices Component - Customer invoice viewing and payment
import React, { useState } from 'react';
import {
  CurrencyDollarIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CreditCardIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { useCustomerPortal } from '../../contexts/CustomerPortalContext';
import CustomerPortalService from '../../services/CustomerPortalService';


const PortalInvoices = ({ invoices, onRefresh }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { sessionToken } = useCustomerPortal();
  const [showPayModal, setShowPayModal] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('card');
  const [payRef, setPayRef] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [paymentsHistory, setPaymentsHistory] = useState([]);
  const remainingFor = (inv, history) => {
    const paid = (history||[]).reduce((s,p)=> s + Math.max(0, Number(p.amount||0)), 0);
    const total = Number(inv.total_amount||0);
    return Math.max(0, total - paid);
  };
  const [payFullBalance, setPayFullBalance] = useState(false);
  const [isDepositCase, setIsDepositCase] = useState(false);
  const [depositRemaining, setDepositRemaining] = useState(0);



  const getStatusBadge = (status, dueDate) => {
    const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'PAID';

    if (isOverdue) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
          Overdue
        </span>
      );
    }

    const badges = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      SENT: { color: 'bg-blue-100 text-blue-800', label: 'Sent' },
      VIEWED: { color: 'bg-yellow-100 text-yellow-800', label: 'Viewed' },
      PAID: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      PARTIAL: { color: 'bg-orange-100 text-orange-800', label: 'Partial' },
      OVERDUE: { color: 'bg-red-100 text-red-800', label: 'Overdue' },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };

    const badge = badges[status] || badges.SENT;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {status === 'PAID' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
        {status === 'SENT' && <ClockIcon className="w-3 h-3 mr-1" />}
        {badge.label}
      </span>
    );
  };

  const InvoiceCard = ({ invoice }) => {
    const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status !== 'PAID';

    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${
        isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className={`h-8 w-8 ${
                isOverdue ? 'text-red-600' : 'text-green-600'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Invoice #{invoice.invoice_number}
              </h3>
              <p className="text-sm text-gray-600">
                {invoice.company_name}
              </p>
            </div>
          </div>
          {getStatusBadge(invoice.status, invoice.due_date)}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="text-lg font-bold text-gray-900">
              ${invoice.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {invoice.due_date && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Due Date:</span>
              <span className={`text-sm font-medium ${
                isOverdue ? 'text-red-600' : 'text-gray-900'
              }`}>
                {new Date(invoice.due_date).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Created:</span>
            <span className="text-sm text-gray-900">
              {new Date(invoice.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {isOverdue && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
              This invoice is overdue. Please pay as soon as possible.
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={() => setSelectedInvoice(invoice)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            View Details
          </button>

          {invoice.status !== 'PAID' && (
            <button
              onClick={() => handlePayInvoice(invoice)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <CreditCardIcon className="h-4 w-4 mr-2" />
              {(String(invoice.kind||'').toLowerCase()==='deposit' || Number(invoice.deposit_amount||0)>0) ? 'Pay Deposit' : 'Pay Now' }
            </button>
          )}
        </div>
      </div>
    );
  };

  const handlePayInvoice = async (invoice) => {
    try {
      setPayingInvoice(invoice);
      setShowPayModal(true);
      // Load existing payments to compute remaining
      const list = await CustomerPortalService.getInvoicePayments(invoice.id, sessionToken);
      setPaymentsHistory(list || []);
      const rem = remainingFor(invoice, list || []);
      const depositAmt = Number(invoice.deposit_amount || 0);
      const depositKind = String(invoice.kind || '').toLowerCase() === 'deposit';
      const depositCase = depositKind || depositAmt > 0;
      const depRem = depositCase ? Math.min(rem, depositAmt || rem) : 0;
      setIsDepositCase(depositCase);
      setDepositRemaining(depRem);
      setPayFullBalance(false);
      setPayAmount((depositCase ? depRem : rem).toFixed(2));
      setPayMethod('card');
      setPayRef('');
    } catch (e) {
      console.error('Failed to open pay modal', e);
      alert('Unable to load payment info. Please try again.');
    }
  };


  const InvoiceDetailModal = ({ invoice, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Invoice #{invoice.invoice_number}</h2>
            <p className="text-sm text-gray-600">{invoice.company_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="space-y-6">
            {/* Invoice Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Invoice Status</h3>
                <p className="text-sm text-gray-600">
                  Created: {new Date(invoice.created_at).toLocaleDateString()}
                </p>
              </div>
              {getStatusBadge(invoice.status, invoice.due_date)}
            </div>

            {/* Amount Breakdown */}
            <div>
              <h3 className="text-lg font-medium mb-3">Amount Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium">
                    ${(invoice.total_amount * 0.9).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax:</span>
                  <span className="text-sm font-medium">
                    ${(invoice.total_amount * 0.1).toFixed(2)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-medium text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${invoice.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Due Date */}
            {invoice.due_date && (
              <div>
                <h3 className="text-lg font-medium mb-3">Payment Due</h3>
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-700">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </span>
                  {new Date(invoice.due_date) < new Date() && invoice.status !== 'PAID' && (
                    <span className="ml-2 text-red-600 font-medium">(Overdue)</span>
                  )}
                </div>
              </div>
            )}

            {/* Company Details */}
            <div>
              <h3 className="text-lg font-medium mb-3">From</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{invoice.company_name}</p>
                {invoice.company_phone && (
                  <p className="text-sm text-gray-600">{invoice.company_phone}</p>
                )}
                {invoice.company_email && (
                  <p className="text-sm text-gray-600">{invoice.company_email}</p>
                )}
              </div>
            </div>

            {/* Payment History */}
            {invoice.status === 'PAID' && invoice.signed_at && (
              <div>
                <h3 className="text-lg font-medium mb-3">Payment Information</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-green-800 font-medium">Payment Received</p>
                      <p className="text-sm text-green-700">
                        Paid on {new Date(invoice.signed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Download PDF
            </button>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
              {invoice.status !== 'PAID' && (
                <button
                  onClick={() => {
                    onClose();

                    handlePayInvoice(invoice);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Pay Now
                </button>
              )}
            </div>
      {/* Pay Now Modal */}
      {showPayModal && payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e)=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold">Pay Invoice #{payingInvoice.invoice_number}</h3>
            <div className="text-sm text-gray-500 mb-4">Remaining balance: ${remainingFor(payingInvoice, paymentsHistory).toFixed(2)}</div>
            {isDepositCase && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 mb-2 text-amber-800 text-sm">
                <div className="font-medium">Deposit requested</div>
                <div>
                  Requested: ${Number(payingInvoice?.deposit_amount || 0).toFixed(2)} · Remaining deposit: ${depositRemaining.toFixed(2)}
                </div>
                <label className="mt-2 flex items-center gap-2 text-amber-900">
                  <input
                    type="checkbox"
                    checked={payFullBalance}
                    onChange={(e)=>{
                      const full = e.target.checked;
                      setPayFullBalance(full);
                      const rem = remainingFor(payingInvoice, paymentsHistory);
                      const dep = depositRemaining;
                      setPayAmount(((full ? rem : dep) || 0).toFixed(2));
                    }}
                  />
                  Pay full balance instead
                </label>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input type="number" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={payAmount} onChange={(e)=>setPayAmount(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Method</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={payMethod} onChange={(e)=>setPayMethod(e.target.value)}>
                  <option value="card">Card</option>
                  <option value="ach">Bank Transfer (ACH)</option>
                  <option value="check">Check</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reference (optional)</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={payRef} onChange={(e)=>setPayRef(e.target.value)} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-secondary" onClick={()=>{ setShowPayModal(false); setPayingInvoice(null); }}>Cancel</button>
              <button
                className={`btn-primary ${payLoading?'opacity-50 cursor-not-allowed':''}`}

                onClick={async ()=>{
                  try {
                    setPayLoading(true);
                    const amt = parseFloat(payAmount||'0');
                    if (!amt || amt <= 0) { alert('Enter a valid amount'); setPayLoading(false); return; }
                    await CustomerPortalService.recordInvoicePayment(payingInvoice.id, { amount: amt, method: payMethod, reference: payRef }, sessionToken);
                    setShowPayModal(false);
                    setPayingInvoice(null);
                    if (typeof onRefresh === 'function') onRefresh();
                    window?.toast?.success?.('Payment recorded');
                  } catch (e) {
                    console.error('Payment failed', e);
                    alert('Payment failed');
                  } finally {
                    setPayLoading(false);
                  }
                }}
              >
                {(isDepositCase && !payFullBalance) ? 'Pay Deposit' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      )}

          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Invoices</h2>
        <p className="text-sm text-gray-600">{invoices.length} total invoices</p>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your invoices will appear here once they're created.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

export default PortalInvoices;
