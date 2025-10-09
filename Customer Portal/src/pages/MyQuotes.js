import React, { useState, useEffect, useContext } from 'react';
import { CustomerContext } from '../contexts/CustomerContext';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const MyQuotes = () => {
  const { customer, supabase } = useContext(CustomerContext);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customer?.customer_id) {
      loadQuotes();
    }
  }, [customer]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      
      // Load marketplace responses (quotes) for customer's requests
      const { data, error } = await supabase
        .from('marketplace_responses')
        .select(`
          *,
          marketplace_requests!inner (
            id,
            title,
            description,
            customer_id,
            status,
            created_at,
            marketplace_request_tags (
              service_tags (
                name
              )
            )
          ),
          companies (
            name,
            phone,
            email,
            street_address,
            city,
            state,
            zip_code
          )
        `)
        .eq('marketplace_requests.customer_id', customer.customer_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include request info
      const transformedQuotes = data?.map(response => ({
        ...response,
        request: response.marketplace_requests,
        company: response.companies,
        service_tags: response.marketplace_requests?.marketplace_request_tags?.map(rt => rt.service_tags?.name) || []
      })) || [];

      setQuotes(transformedQuotes);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResponseStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'counter':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResponseStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'declined':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'counter':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your quotes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Quotes</h1>
          <p className="text-gray-600 mt-2">
            View quotes and responses from contractors for your service requests
          </p>
        </div>

        {quotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CurrencyDollarIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Quotes Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't received any quotes from contractors yet. Submit a service request to get started!
            </p>
            <button
              onClick={() => window.location.href = '/request-service'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Request Service
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {quotes.map((quote) => (
              <div key={quote.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  {/* Quote Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Quote for: {quote.request?.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResponseStatusColor(quote.response_status)}`}>
                          {quote.response_status.charAt(0).toUpperCase() + quote.response_status.slice(1)}
                        </span>
                      </div>
                      
                      {/* Service Tags */}
                      {quote.service_tags && quote.service_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {quote.service_tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {getResponseStatusIcon(quote.response_status)}
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
                          <h4 className="font-medium text-gray-900">{quote.company?.name}</h4>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          {quote.company?.phone && (
                            <div className="flex items-center gap-2">
                              <PhoneIcon className="w-4 h-4" />
                              <span>{quote.company.phone}</span>
                            </div>
                          )}
                          {quote.company?.email && (
                            <div className="flex items-center gap-2">
                              <EnvelopeIcon className="w-4 h-4" />
                              <span>{quote.company.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Quote Amount */}
                      {quote.counter_offer && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            ${quote.counter_offer}
                          </div>
                          <div className="text-sm text-gray-500">Quote Amount</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quote Message */}
                  {quote.message && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Contractor Message:</h5>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{quote.message}</p>
                    </div>
                  )}

                  {/* Availability */}
                  {(quote.available_start || quote.available_end) && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Availability:</h5>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>
                          {quote.available_start && formatDateTime(quote.available_start)}
                          {quote.available_start && quote.available_end && ' - '}
                          {quote.available_end && !quote.available_start && 'Until '}
                          {quote.available_end && formatDateTime(quote.available_end)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Quote received {formatDate(quote.created_at)}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.location.href = `/my-requests`}
                        className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        View Request
                      </button>
                      {quote.response_status === 'counter' && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Accept Quote
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
  );
};

export default MyQuotes;
