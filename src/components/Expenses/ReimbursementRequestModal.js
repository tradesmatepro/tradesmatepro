import React from 'react';
import { supaFetch } from '../../utils/supaFetch';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ReimbursementRequestModal = ({ onClose, onSaved, companyId, employeeId }) => {
  const [form, setForm] = React.useState({
    title: '',
    description: '',
    employee_notes: ''
  });
  const [selectedExpenses, setSelectedExpenses] = React.useState([]);
  const [availableExpenses, setAvailableExpenses] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadAvailableExpenses();
  }, []);

  const loadAvailableExpenses = async () => {
    try {
      // Load expenses that are reimbursable but not yet in a request
      const res = await supaFetch(
        'expenses?reimbursable=eq.true&reimbursement_request_id=is.null&order=date.desc',
        { method: 'GET' },
        companyId
      );
      if (res.ok) {
        const expenses = await res.json();
        setAvailableExpenses(expenses);
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
    }
  };

  const handleExpenseToggle = (expense) => {
    setSelectedExpenses(prev => {
      const isSelected = prev.find(e => e.id === expense.id);
      if (isSelected) {
        return prev.filter(e => e.id !== expense.id);
      } else {
        return [...prev, expense];
      }
    });
  };

  const totalAmount = selectedExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedExpenses.length === 0) {
      alert('Please select at least one expense');
      return;
    }

    setLoading(true);
    try {
      // Create reimbursement request
      const requestPayload = {
        company_id: companyId,
        employee_id: employeeId,
        title: form.title,
        description: form.description,
        total_amount: totalAmount,
        employee_notes: form.employee_notes,
        status: 'SUBMITTED',
        submitted_at: new Date().toISOString()
      };

      const requestRes = await supaFetch('reimbursement_requests', {
        method: 'POST',
        body: requestPayload
      }, companyId);

      if (!requestRes.ok) throw new Error('Failed to create request');
      const request = await requestRes.json();
      const requestId = Array.isArray(request) ? request[0].id : request.id;

      // Link selected expenses to the request
      for (const expense of selectedExpenses) {
        await supaFetch(`expenses?id=eq.${expense.id}`, {
          method: 'PATCH',
          body: { 
            reimbursement_request_id: requestId,
            reimbursement_status: 'PENDING'
          }
        }, companyId);
      }

      alert('Reimbursement request submitted successfully!');
      onSaved();
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('Failed to submit request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create Reimbursement Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Request Details */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Business Travel Expenses - Client Meeting"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Provide details about the business purpose and expenses"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="employee_notes"
                  value={form.employee_notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Any additional information for the approver"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Expense Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Select Expenses to Include
              </h3>
              
              {availableExpenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No reimbursable expenses available</p>
                  <p className="text-sm">Create expenses marked as reimbursable first</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg">
                  {availableExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                        selectedExpenses.find(e => e.id === expense.id) ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => handleExpenseToggle(expense)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={!!selectedExpenses.find(e => e.id === expense.id)}
                              onChange={() => handleExpenseToggle(expense)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {expense.description || 'No description'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {expense.category} • {expense.vendor} • {new Date(expense.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${(parseFloat(expense.amount) || 0).toFixed(2)}
                          </p>
                          {expense.receipt_url && (
                            <p className="text-xs text-green-600">Has receipt</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Expenses Summary */}
            {selectedExpenses.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Selected Expenses ({selectedExpenses.length})
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Total Amount:</span>
                  <span className="text-xl font-bold text-blue-900">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedExpenses.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <ClockIcon className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CurrencyDollarIcon className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReimbursementRequestModal;
