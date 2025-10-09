import React from 'react';
import {
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  DocumentDuplicateIcon // ✅ NEW: For duplicate quote button
} from '@heroicons/react/24/outline';
import { getQuoteStatuses, getStatusLabel, getStatusBadgeProps } from '../utils/statusHelpers';

export const QuotesStats = ({ quotes }) => {
  const totalQuotes = quotes.length;
  // ✅ FIXED: 'quote' status removed, use 'draft' instead (industry standard)
  const draftQuotes = quotes.filter(q => q.status === 'draft').length;
  const sentQuotes = quotes.filter(q => q.status === 'sent').length;
  const acceptedQuotes = quotes.filter(q => q.status === 'approved').length;
  const totalValue = quotes.reduce((sum, q) => sum + (parseFloat(q.grand_total || q.total_amount) || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <DocumentTextIcon className="w-8 h-8 text-blue-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">{totalQuotes}</div>
            <div className="text-sm text-gray-500">Total Quotes</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <ClockIcon className="w-8 h-8 text-gray-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">{draftQuotes}</div>
            <div className="text-sm text-gray-500">Draft</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <ArrowRightIcon className="w-8 h-8 text-blue-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">{sentQuotes}</div>
            <div className="text-sm text-gray-500">Sent</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <DocumentTextIcon className="w-8 h-8 text-green-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">{acceptedQuotes}</div>
            <div className="text-sm text-gray-500">Accepted</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <CurrencyDollarIcon className="w-8 h-8 text-purple-500" />
          <div className="ml-3">
            <div className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Value</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const QuotesSearchFilter = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => (
  <div className="card mb-6">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <FunnelIcon className="w-4 h-4 text-gray-500" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          {/* ✅ SMART STATUS FILTERING: Only show quote-relevant statuses */}
          {getQuoteStatuses().map(status => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

export const QuotesTable = ({ quotes, customers, loading, openEditForm, deleteQuote, duplicateQuote, convertToJob, openContext, handleExportPDF }) => {
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  // ✅ REPLACED: Use centralized status badge helper
  const getStatusBadge = (quoteStatus) => {
    const props = getStatusBadgeProps(quoteStatus);
    return <span className={props.className}>{props.label}</span>;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-gray-500">Loading quotes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="overflow-auto max-h-[calc(100vh-300px)]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quote Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotes.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-500 mb-2">No quotes found</div>
                  <div className="text-sm text-gray-400">Create your first quote to get started</div>
                </td>
              </tr>
            ) : (
              quotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => openEditForm(quote)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {quote.title || 'Untitled Quote'}
                      </div>
                      <div className="text-sm text-gray-500">
                        #{quote.quote_number}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getCustomerName(quote.customer_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(quote.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {quote.created_at ? new Date(quote.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${(quote.grand_total || quote.total_amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openContext && openContext(quote)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Open context"
                      >
                        <EllipsisHorizontalIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditForm(quote)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit quote"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => duplicateQuote && duplicateQuote(quote)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Duplicate quote as template"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExportPDF ? handleExportPDF(quote) : alert('PDF download temporarily unavailable')}
                        className="text-blue-600 hover:text-blue-900"
                        title="Download PDF"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                      {quote.quote_status === 'ACCEPTED' && (
                        <button
                          onClick={() => convertToJob(quote)}
                          className="text-green-600 hover:text-green-900"
                          title="Convert to Job"
                        >
                          <ArrowRightIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteQuote(quote.id, quote.title)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete quote"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
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

export const Alert = ({ alert }) => {
  if (!alert.show) return null;

  return (
    <div className={`alert mb-6 ${alert.type === 'error' ? 'alert-error' : 'alert-success'}`}>
      {alert.message}
    </div>
  );
};
