import React, { useState } from 'react';

export const Alert = ({ alert }) => {
  if (!alert.show) return null;
  return (
    <div className={`alert mb-6 ${alert.type === 'error' ? 'alert-error' : 'alert-success'}`}>
      {alert.message}
    </div>
  );
};

export const InvoicesTable = ({ invoices, loading, getCustomerName, getJobTitle, onRecordPayment }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8 text-gray-500">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{inv.invoice_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getCustomerName(inv.customer_id)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getJobTitle(inv.job_id)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${(inv.total_amount || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{inv.status || 'UNPAID'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{inv.issued_at ? new Date(inv.issued_at).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onRecordPayment(inv)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Record Payment
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const RecordPaymentModal = ({ isOpen, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Record Payment</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Method</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="check">Check</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={() => onSubmit({ amount: parseFloat(amount || '0'), method })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

