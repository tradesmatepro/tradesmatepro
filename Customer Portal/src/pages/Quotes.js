import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useCustomer } from '../contexts/CustomerContext';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

// Create authenticated supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const Quotes = () => {
  const { customer } = useCustomer();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showQuoteDetail, setShowQuoteDetail] = useState(false);

  // Load quotes from work_orders table
  useEffect(() => {
    if (customer?.customer_id) {
      loadQuotes();
    }
  }, [customer]);

  const loadQuotes = async () => {
    try {
      setLoading(true);

      // ✅ FIXED: Use lowercase status values to match database enum
      // Use supabase client to query work_orders with quote_status - customers only see sent, accepted, rejected, expired (not draft)
      // Note: work_orders table uses 'id' as primary key, not 'work_order_id'
      const { data, error } = await supabase
        .from('work_orders')
        .select('id,created_at,total_amount,status,title,description')
        .eq('customer_id', customer.customer_id)
        .in('status', ['sent', 'presented', 'approved', 'rejected', 'expired'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading quotes:', error);
        throw error;
      }

      setQuotes(data || []);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Accept quote
  const handleAcceptQuote = async (quoteId) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({
          status: 'ACCEPTED',
          accepted_at: new Date().toISOString()
        })
        .eq('id', quoteId);

      if (error) {
        console.error('Error accepting quote:', error);
        alert('Failed to accept quote');
        return;
      }

      alert('Quote accepted successfully!');
      loadQuotes(); // Refresh quotes
      setShowQuoteDetail(false);
    } catch (error) {
      console.error('Error accepting quote:', error);
      alert('Failed to accept quote');
    }
  };

  // Decline quote
  const handleDeclineQuote = async (quoteId) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/work_orders?id=eq.${quoteId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'REJECTED'
        })
      });

      if (response.ok) {
        alert('Quote declined');
        loadQuotes(); // Refresh quotes
        setShowQuoteDetail(false);
      } else {
        alert('Failed to decline quote');
      }
    } catch (error) {
      console.error('Error declining quote:', error);
      alert('Failed to decline quote');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'DECLINED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600">Review and approve service quotes</p>
        </div>
        <div className="card-modern p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading quotes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
        <p className="text-gray-600">Review and approve service quotes</p>
      </div>

      {/* Quotes List */}
      <div className="card-modern">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {quotes.length > 0 ? `${quotes.length} Quote${quotes.length !== 1 ? 's' : ''}` : 'Quotes'}
          </h3>
        </div>

        <div className="p-6">
          {quotes.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes yet</h3>
              <p className="text-gray-500 mb-4">
                Service quotes will appear here for your review
              </p>
              <a href="/requests" className="btn-primary">
                Request a Quote
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div key={quote.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          Quote #{quote.quote_number || quote.work_order_id}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.quote_status)}`}>
                          {quote.quote_status || 'PENDING'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{quote.title}</p>
                      <p className="text-sm text-gray-500">Date: {formatDate(quote.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(quote.total_amount)}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setSelectedQuote(quote);
                            setShowQuoteDetail(true);
                          }}
                          className="btn-secondary-sm flex items-center gap-1"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View
                        </button>
                        {quote.attachments && quote.attachments.length > 0 && (
                          <button
                            onClick={() => {
                              const pdfAttachment = quote.attachments.find(att => att.type === 'pdf');
                              if (pdfAttachment) {
                                window.open(pdfAttachment.url, '_blank');
                              }
                            }}
                            className="btn-secondary-sm flex items-center gap-1"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            PDF
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="card-modern p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">How Quotes Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">1. Review</h4>
            <p className="text-sm text-gray-600">Check quote details and pricing</p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">2. Approve</h4>
            <p className="text-sm text-gray-600">Accept to schedule your service</p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <XMarkIcon className="h-6 w-6 text-red-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">3. Decline</h4>
            <p className="text-sm text-gray-600">Decline if it doesn't work for you</p>
          </div>
        </div>
      </div>

      {/* Quote Detail Modal */}
      {showQuoteDetail && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Quote #{selectedQuote.quote_number || selectedQuote.work_order_id}
                </h2>
                <button
                  onClick={() => setShowQuoteDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Quote Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Project Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{selectedQuote.title}</p>
                  {selectedQuote.description && (
                    <p className="text-gray-600 mt-1">{selectedQuote.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Date: {formatDate(selectedQuote.created_at)}
                  </p>
                </div>
              </div>

              {/* Total */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Quote Total</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(selectedQuote.total_amount)}
                  </div>
                </div>
              </div>

              {/* PDF Download */}
              {selectedQuote.attachments && selectedQuote.attachments.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Documents</h3>
                  <div className="space-y-2">
                    {selectedQuote.attachments.map((attachment, index) => (
                      <button
                        key={index}
                        onClick={() => window.open(attachment.url, '_blank')}
                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-gray-300 w-full text-left"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{attachment.name || 'Quote PDF'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedQuote.quote_status === 'PENDING' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleDeclineQuote(selectedQuote.work_order_id)}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Decline Quote
                  </button>
                  <button
                    onClick={() => handleAcceptQuote(selectedQuote.work_order_id)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Accept Quote
                  </button>
                </div>
              )}

              {selectedQuote.quote_status === 'ACCEPTED' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Quote Accepted</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Your service will be scheduled soon. You'll receive updates in the Jobs section.
                  </p>
                </div>
              )}

              {selectedQuote.quote_status === 'DECLINED' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XMarkIcon className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-900">Quote Declined</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quotes;
