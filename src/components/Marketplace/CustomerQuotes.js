import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const CustomerQuotes = () => {
  const { user } = useUser();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      // Load marketplace responses to customer's requests (Hiring Mode)
      const response = await supaFetch(
        `marketplace_responses?select=*,marketplace_requests!marketplace_responses_request_id_fkey(*),companies(id,name,email,phone,avg_rating,rating_count)&marketplace_requests.company_id=eq.${user.company_id}&order=created_at.desc`,
        { method: 'GET' },
        null // unscoped: we want all contractor responses to our requests
      );
      const data = response.ok ? await response.json() : [];
      setQuotes(data);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.marketplace_request?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.contractor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAcceptQuote = async (quoteId) => {
    try {
      // Note: marketplace_responses uses response_status, not status
      await supaFetch(`marketplace_responses?id=eq.${quoteId}`, {
        method: 'PATCH',
        body: JSON.stringify({ response_status: 'accepted' })
      });
      loadQuotes(); // Reload quotes
    } catch (error) {
      console.error('Error accepting quote:', error);
    }
  };

  const handleRejectQuote = async (quoteId) => {
    try {
      // Note: marketplace_responses uses response_status, not status
      await supaFetch(`marketplace_responses?id=eq.${quoteId}`, {
        method: 'PATCH',
        body: JSON.stringify({ response_status: 'declined' })
      });
      loadQuotes(); // Reload quotes
    } catch (error) {
      console.error('Error rejecting quote:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading quotes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Received Quotes</h2>
          <p className="text-gray-600 mt-1">Review and manage quotes received for your service requests</p>
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
                placeholder="Search quotes..."
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
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredQuotes.length} of {quotes.length} quotes
        </p>
      </div>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
          <p className="text-gray-600">
            {quotes.length === 0
              ? "You haven't received any quotes yet. Post a service request to get started."
              : "No quotes match your current filters."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote) => (
            <div key={quote.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(quote.status)}
                    <h3 className="text-lg font-medium text-gray-900">
                      {quote.marketplace_request?.title || 'Untitled Request'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                      {quote.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{quote.message}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="inline-flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      ${quote.quoted_price?.toLocaleString() || 'N/A'}
                    </span>
                    {quote.estimated_timeline && (
                      <span className="inline-flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        {quote.estimated_timeline}
                      </span>
                    )}
                    <span className="inline-flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                      {quote.contractor_name}
                    </span>
                    <span>
                      Received: {new Date(quote.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Action Buttons for Pending Quotes */}
                  {quote.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptQuote(quote.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectQuote(quote.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col items-end gap-2">
                  <div className="text-right">
                    {quote.marketplace_request?.budget && (
                      <p className="text-sm text-gray-500">
                        Your Budget: ${quote.marketplace_request.budget.toLocaleString()}
                      </p>
                    )}
                    {quote.quoted_price && quote.marketplace_request?.budget && (
                      <p className={`text-sm font-medium ${
                        quote.quoted_price <= quote.marketplace_request.budget
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {quote.quoted_price <= quote.marketplace_request.budget ? 'Within Budget' : 'Over Budget'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerQuotes;
