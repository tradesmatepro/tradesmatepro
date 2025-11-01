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

  const StatCard = ({ icon: Icon, label, value, gradient }) => (
    <div className="rounded-2xl overflow-hidden border border-blue-200/50 dark:border-blue-900/50 backdrop-blur-sm shadow-lg bg-gradient-to-br from-white/70 dark:from-slate-800/70 to-blue-50/30 dark:to-blue-900/20 p-5 hover:shadow-xl hover:scale-105 transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <StatCard icon={DocumentTextIcon} label="Total Quotes" value={totalQuotes} gradient="from-blue-500 to-blue-600" />
      <StatCard icon={ClockIcon} label="Draft" value={draftQuotes} gradient="from-orange-500 to-orange-600" />
      <StatCard icon={ArrowRightIcon} label="Sent" value={sentQuotes} gradient="from-cyan-500 to-cyan-600" />
      <StatCard icon={DocumentTextIcon} label="Accepted" value={acceptedQuotes} gradient="from-green-500 to-green-600" />
      <StatCard icon={CurrencyDollarIcon} label="Total Value" value={`$${totalValue.toLocaleString()}`} gradient="from-purple-500 to-purple-600" />
    </div>
  );
};

export const QuotesSearchFilter = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => (
  <div className="rounded-3xl overflow-hidden border border-blue-200/50 dark:border-blue-900/50 backdrop-blur-xl shadow-2xl bg-gradient-to-br from-white/80 dark:from-slate-900/80 to-blue-50/40 dark:to-blue-900/20 p-6 mb-6">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-blue-200/50 dark:border-blue-900/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm shadow-lg shadow-blue-500/5 dark:shadow-blue-900/20"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <FunnelIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-blue-200/50 dark:border-blue-900/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm shadow-lg shadow-blue-500/5 dark:shadow-blue-900/20"
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
      <div className="rounded-3xl overflow-hidden border border-blue-200/50 dark:border-blue-900/50 backdrop-blur-xl shadow-2xl bg-gradient-to-br from-white/80 dark:from-slate-900/80 to-blue-50/40 dark:to-blue-900/20 p-8">
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-gray-600 dark:text-gray-400">Loading quotes...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden border border-blue-200/50 dark:border-blue-900/50 backdrop-blur-xl shadow-2xl bg-gradient-to-br from-white/80 dark:from-slate-900/80 to-blue-50/40 dark:to-blue-900/20">
      <div className="overflow-auto max-h-[calc(100vh-300px)]">
        <table className="min-w-full divide-y divide-blue-200/50 dark:divide-blue-900/50">
          <thead className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 backdrop-blur-sm sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Quote Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Created Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-200/50 dark:divide-blue-900/50">
            {quotes.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <DocumentTextIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <div className="text-gray-600 dark:text-gray-400 mb-2 font-medium">No quotes found</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">Create your first quote to get started</div>
                </td>
              </tr>
            ) : (
              quotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="hover:bg-white/60 dark:hover:bg-slate-800/60 cursor-pointer transition-all duration-200 backdrop-blur-sm"
                  onClick={() => openEditForm(quote)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {quote.title || 'Untitled Quote'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        #{quote.quote_number}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {getCustomerName(quote.customer_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(quote.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {quote.created_at ? new Date(quote.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                    ${(quote.grand_total || quote.total_amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openContext && openContext(quote); }}
                        className="p-2 rounded-lg bg-gray-100/50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200/70 dark:hover:bg-slate-600/70 transition-all"
                        title="Open context"
                      >
                        <EllipsisHorizontalIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditForm(quote); }}
                        className="p-2 rounded-lg bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200/70 dark:hover:bg-blue-800/50 transition-all"
                        title="Edit quote"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); duplicateQuote && duplicateQuote(quote); }}
                        className="p-2 rounded-lg bg-purple-100/50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200/70 dark:hover:bg-purple-800/50 transition-all"
                        title="Duplicate quote as template"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExportPDF ? handleExportPDF(quote) : alert('PDF download temporarily unavailable')}
                        className="p-2 rounded-lg bg-cyan-100/50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-200/70 dark:hover:bg-cyan-800/50 transition-all"
                        title="Download PDF"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                      {quote.quote_status === 'ACCEPTED' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); convertToJob(quote); }}
                          className="p-2 rounded-lg bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200/70 dark:hover:bg-green-800/50 transition-all"
                          title="Convert to Job"
                        >
                          <ArrowRightIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          deleteQuote(quote.id, quote.title);
                        }}
                        className="p-2 rounded-lg bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200/70 dark:hover:bg-red-800/50 transition-all"
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
