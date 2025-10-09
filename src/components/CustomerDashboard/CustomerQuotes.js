// Customer Quotes - View and manage quotes from customer perspective
import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import {
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const CustomerQuotes = ({ quotes, onRefresh }) => {
  const { user } = useUser();
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'QUOTE': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleQuoteAction = async (quoteId, action) => {
    try {
      setLoading(true);
      
      const updateData = {
        status: action.toUpperCase(),
        updated_at: new Date().toISOString()
      };

      if (action === 'accepted') {
        updateData.accepted_at = new Date().toISOString();
        updateData.accepted_by = user.full_name;
      }

      const response = await supaFetch(`work_orders?id=eq.${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      }, user.company_id);

      if (response.ok) {
        onRefresh();
        setSelectedQuote(null);
      } else {
        throw new Error(`Failed to ${action} quote`);
      }
    } catch (error) {
      console.error(`Error ${action} quote:`, error);
      alert(`Failed to ${action} quote. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const QuoteCard = ({ quote }) => (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-medium text-gray-900">
              {quote.title || `Quote #${quote.quote_number || quote.id?.slice(-8)}`}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
              {quote.status || 'QUOTE'}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4" />
              <span>{quote.customers?.name || 'Unknown Customer'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span className="font-medium text-gray-900">
                ${(quote.total_amount || 0).toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4" />
              <span>
                Created: {new Date(quote.created_at).toLocaleDateString()}
              </span>
            </div>

            {quote.quote_expires_date && (
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4" />
                <span>
                  Expires: {new Date(quote.quote_expires_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {quote.description && (
            <p className="mt-3 text-sm text-gray-700 line-clamp-2">{quote.description}</p>
          )}
        </div>

        <div className="ml-4 flex flex-col items-end space-y-2">
          <button
            onClick={() => setSelectedQuote(quote)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Action buttons for sent quotes */}
      {quote.quote_status === 'SENT' && (
        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => handleQuoteAction(quote.work_order_id, 'accepted')}
            disabled={loading}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            Accept Quote
          </button>
          <button
            onClick={() => handleQuoteAction(quote.work_order_id, 'rejected')}
            disabled={loading}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            Reject Quote
          </button>
        </div>
      )}
    </div>
  );

  const QuoteDetailModal = ({ quote, onClose }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Quote Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Quote Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                {quote.title || `Quote #${quote.quote_number || quote.work_order_id?.slice(-8)}`}
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Customer: {quote.customers?.name || 'Unknown'}</p>
                <p>Created: {new Date(quote.created_at).toLocaleDateString()}</p>
                {quote.quote_expires_date && (
                  <p>Expires: {new Date(quote.quote_expires_date).toLocaleDateString()}</p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.quote_status)}`}>
                {quote.quote_status || 'DRAFT'}
              </span>
              <div className="mt-2">
                <p className="text-2xl font-bold text-gray-900">
                  ${(quote.total_amount || 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Amount</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {quote.description && (
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Description</h5>
              <p className="text-gray-600">{quote.description}</p>
            </div>
          )}

          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quote.service_address_line_1 && (
              <div>
                <h5 className="font-medium text-gray-700 mb-1">Service Address</h5>
                <div className="text-gray-600 text-sm">
                  <p>{quote.service_address_line_1}</p>
                  {quote.service_address_line_2 && <p>{quote.service_address_line_2}</p>}
                  <p>{quote.service_city}, {quote.service_state} {quote.service_zip_code}</p>
                </div>
              </div>
            )}

            {quote.pricing_model && (
              <div>
                <h5 className="font-medium text-gray-700 mb-1">Pricing Model</h5>
                <p className="text-gray-600 text-sm">{quote.pricing_model.replace('_', ' ')}</p>
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Financial Breakdown</h5>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${(quote.subtotal || 0).toLocaleString()}</span>
                </div>
                {quote.labor_subtotal > 0 && (
                  <div className="flex justify-between">
                    <span>Labor:</span>
                    <span>${(quote.labor_subtotal || 0).toLocaleString()}</span>
                  </div>
                )}
                {quote.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({(quote.tax_rate || 0)}%):</span>
                    <span>${(quote.tax_amount || 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${(quote.total_amount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Notes</h5>
              <p className="text-gray-600 text-sm">{quote.notes}</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {quote.quote_status === 'SENT' && (
          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => handleQuoteAction(quote.work_order_id, 'accepted')}
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              Accept Quote
            </button>
            <button
              onClick={() => handleQuoteAction(quote.work_order_id, 'rejected')}
              disabled={loading}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              Reject Quote
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Customer Quotes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage quotes from your customer's perspective
          </p>
        </div>
      </div>

      {/* Quotes grid */}
      {quotes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {quotes.map((quote) => (
            <QuoteCard key={quote.work_order_id} quote={quote} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
          <p className="text-gray-600">No customer quotes available at the moment.</p>
        </div>
      )}

      {/* Quote detail modal */}
      {selectedQuote && (
        <QuoteDetailModal
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
        />
      )}
    </div>
  );
};

export default CustomerQuotes;
