import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useCustomer } from '../contexts/CustomerContext';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

// Create authenticated supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const Invoices = () => {
  const { customer } = useCustomer();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [outstandingBalance, setOutstandingBalance] = useState(0);

  useEffect(() => {
    if (customer?.customer_id) {
      loadInvoices();
    }
  }, [customer]);

  const loadInvoices = async () => {
    try {
      setLoading(true);

      // Use supabase client to query invoices table - show UNPAID, PARTIALLY_PAID, OVERDUE, PAID
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          created_at,
          total_amount,
          status,
          due_date,
          kind,
          deposit_amount,
          work_orders (
            title,
            description
          )
        `)
        .eq('customer_id', customer.customer_id)
        .in('status', ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE', 'PAID'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading invoices:', error);
        throw error;
      }

      setInvoices(data || []);

      // Calculate outstanding balance (unpaid + partially paid + overdue)
      const outstanding = (data || [])
        .filter(invoice => ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status))
        .reduce((sum, invoice) => sum + parseFloat(invoice.total_amount || 0), 0);
      setOutstandingBalance(outstanding);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'text-green-800 bg-green-100 border border-green-200';
      case 'UNPAID': return 'text-blue-800 bg-blue-100 border border-blue-200';
      case 'PARTIALLY_PAID': return 'text-yellow-800 bg-yellow-100 border border-yellow-200';
      case 'OVERDUE': return 'text-red-800 bg-red-100 border border-red-200';
      default: return 'text-gray-800 bg-gray-100 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID': return <CheckCircleIcon className="h-5 w-5" />;
      case 'OVERDUE': return <ExclamationTriangleIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoices & Payments</h1>
        <p className="text-gray-600">View and pay your service bills</p>
      </div>

      {/* Outstanding Balance */}
      <div className="card-modern p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Outstanding Balance</h3>
            <p className={`text-3xl font-bold mt-2 ${outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${outstandingBalance.toFixed(2)}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${outstandingBalance > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
            <CurrencyDollarIcon className={`h-8 w-8 ${outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`} />
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="card-modern">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Invoices</h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading invoices...</p>
            </div>
          ) : invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {invoice.work_orders?.title || `Invoice #${invoice.invoice_number || invoice.id.slice(-8)}`}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1">{invoice.status.replace('_', ' ')}</span>
                        </span>
                        {(invoice.kind === 'deposit' || Number(invoice.deposit_amount || 0) > 0) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-indigo-700 bg-indigo-100">
                            Deposit
                          </span>
                        )}
                      </div>
                      {invoice.work_orders?.description && (
                        <p className="text-gray-600 mb-3">{invoice.work_orders.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div>
                          Invoice Date: {new Date(invoice.created_at).toLocaleDateString()}
                        </div>
                        {invoice.due_date && (
                          <div>
                            Due: {new Date(invoice.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ${parseFloat(invoice.total_amount || 0).toFixed(2)}
                      </p>
                      {['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status) && (
                        <button className="mt-2 btn-primary text-sm">
                          {(invoice.kind === 'deposit' || Number(invoice.deposit_amount || 0) > 0) ? 'Pay Deposit' : 'Pay Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-500">
                Your service invoices will appear here after work is completed
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <CreditCardIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-3">No payment methods saved</p>
          <button className="btn-primary opacity-50 cursor-not-allowed" disabled>
            Add Payment Method (Coming Soon)
          </button>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <CurrencyDollarIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Payment Information</h4>
            <p className="text-sm text-blue-700 mt-1">
              Online payments are coming soon. For now, please follow the payment instructions
              on your invoice or contact your service provider.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
