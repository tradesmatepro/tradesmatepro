import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import {
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const CustomerInvoices = () => {
  const { user } = useUser();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      // Load invoices where this company is the customer
      // Note: invoices table uses customer_id, not customer_company_id
      const response = await supaFetch(
        `invoices?customer_id=eq.${user.company_id}&order=created_at.desc`,
        { method: 'GET' }
      );
      const data = response.ok ? await response.json() : [];
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'UNPAID':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'PARTIALLY_PAID':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'OVERDUE':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'VOID':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'UNPAID':
        return 'bg-blue-100 text-blue-800';
      case 'PARTIALLY_PAID':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'VOID':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'PAID' || status === 'VOID') return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Invoices</h2>
          <p className="text-gray-600 mt-1">Track and manage your service invoices</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="VOID">Void</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </p>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600">
            Paid: {invoices.filter(inv => inv.status === 'PAID').length}
          </span>
          <span className="text-blue-600">
            Unpaid: {invoices.filter(inv => inv.status === 'UNPAID').length}
          </span>
          <span className="text-yellow-600">
            Partial: {invoices.filter(inv => inv.status === 'PARTIALLY_PAID').length}
          </span>
          <span className="text-red-600">
            Overdue: {invoices.filter(inv => inv.status === 'OVERDUE').length}
          </span>
        </div>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-600">
            {invoices.length === 0
              ? "You don't have any invoices yet."
              : "No invoices match your current filters."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(invoice.status)}
                    <h3 className="text-lg font-medium text-gray-900">
                      Invoice #{invoice.invoice_number}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.replace('_', ' ')}
                    </span>
                  </div>

                  {invoice.description && (
                    <p className="text-gray-600 mb-4">{invoice.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="inline-flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      ${invoice.total_amount?.toLocaleString() || '0'}
                    </span>
                    <span className="inline-flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-1" />
                      Issued: {new Date(invoice.created_at).toLocaleDateString()}
                    </span>
                    {invoice.due_date && (
                      <span className={`inline-flex items-center ${
                        isOverdue(invoice.due_date, invoice.status) ? 'text-red-600' : ''
                      }`}>
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {invoice.status === 'PAID' && invoice.paid_date && (
                    <div className="mb-2">
                      <p className="text-sm text-green-600">
                        <strong>Paid:</strong> {new Date(invoice.paid_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col items-end gap-2">
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </button>

                  {!['PAID', 'VOID'].includes(invoice.status) && (
                    <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700">
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerInvoices;
