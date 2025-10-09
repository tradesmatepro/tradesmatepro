/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from 'react';
import { CustomerContext } from '../contexts/CustomerContext';
import {
  getCustomerMarketplaceRequests,
  getMarketplaceResponses,
  acceptMarketplaceResponse
} from '../services/MarketplaceService';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import RequestServiceModal from '../components/Common/RequestServiceModal';

const MyRequests = () => {
  const { customer, supabase } = useContext(CustomerContext);
  const [requests, setRequests] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [responseLoadErrors, setResponseLoadErrors] = useState([]);

  useEffect(() => {
    if (customer?.customer_id) {
      loadRequestsData();
    }
  }, [customer]);

  const loadRequestsData = async () => {
    try {
      setLoading(true);

      // Load marketplace requests using the service
      const requestsData = await getCustomerMarketplaceRequests(customer?.customer_id);

      // Transform the data to include tag names for backward compatibility
      const transformedRequests = requestsData.map(request => ({
        ...request,
        service_tags: request.request_tags?.map(rt => rt.tags) || [],
        category: request.request_tags?.[0]?.tags?.name || 'General'
      }));

      setRequests(transformedRequests);

      // Load responses for each request
      const responsesData = {};
      const loadErrors = [];

      for (const request of transformedRequests) {
        try {
          const responseData = await getMarketplaceResponses(request.id);
          responsesData[request.id] = responseData.map(response => ({
            ...response,
            company_name: response.companies?.name,
            average_rating: response.companies?.rating || 0,
            total_reviews: response.companies?.total_reviews || 0
          }));
        } catch (responseError) {
          console.error(`Failed to load responses for request ${request.id}:`, responseError);
          responsesData[request.id] = [];
          loadErrors.push(`Failed to load responses for "${request.title}"`);
        }
      }
      setResponses(responsesData);
      setResponseLoadErrors(loadErrors);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'negotiation':
        return <ExclamationTriangleIcon className="w-5 h-5 text-blue-500" />;
      case 'auto_hold':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      case 'booked':
        return <CalendarDaysIcon className="w-5 h-5 text-purple-500" />;
      case 'in_progress':
        return <ExclamationTriangleIcon className="w-5 h-5 text-blue-600" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'canceled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-yellow-100 text-yellow-800';
      case 'negotiation':
        return 'bg-blue-100 text-blue-800';
      case 'auto_hold':
        return 'bg-orange-100 text-orange-800';
      case 'booked':
        return 'bg-purple-100 text-purple-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRequestTypeColor = (requestType) => {
    switch (requestType) {
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const viewResponses = (request) => {
    setSelectedRequest(request);
    setShowResponseModal(true);
  };

  const acceptResponse = async (responseId) => {
    try {
      setLoading(true);

      console.log('Customer Portal - Accepting response:', responseId);

      // Use the MarketplaceService to accept the response and create work order
      const { response, workOrder } = await acceptMarketplaceResponse(responseId, customer.customer_id);

      console.log('Customer Portal - Response accepted successfully:', { response, workOrder });

      // Show success message
      // TODO: Replace with proper toast when available
      alert('Response accepted successfully! The contractor has been notified.');

      // Refresh the data to show updated statuses
      await loadRequestsData();

      // Close the modal
      setShowResponseModal(false);

    } catch (error) {
      console.error('Customer Portal - Failed to accept response:', error);

      // Log error to error_logs/latest.json
      try {
        await fetch('/error-server/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            message: `Failed to accept marketplace response: ${error.message}`,
            error: error.message,
            stack: error.stack,
            context: 'Customer Portal - Accept Response',
            responseId
          })
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }

      // Show user-friendly error message
      alert('Failed to accept response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const declineResponse = async (responseId) => {
    try {
      setLoading(true);

      console.log('Customer Portal - Declining response:', responseId);

      // Update the response status to 'declined'
      const { error: updateResponseError } = await supabase
        .from('marketplace_responses')
        .update({ response_status: 'declined' })
        .eq('id', responseId);

      if (updateResponseError) {
        throw updateResponseError;
      }

      console.log('Customer Portal - Response declined successfully');

      // Show success message
      alert('Response declined successfully.');

      // Refresh the data to show updated statuses
      await loadRequestsData();

      // Close the modal
      setShowResponseModal(false);
    } catch (error) {
      console.error('Customer Portal - Failed to decline response:', error);

      // Log error to error_logs/latest.json
      try {
        await fetch('/error-server/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            message: `Failed to decline marketplace response: ${error.message}`,
            error: error.message,
            stack: error.stack,
            context: 'Customer Portal - Decline Response',
            responseId
          })
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }

      alert('Failed to decline response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Requests</h1>
              <p className="text-gray-600 mt-2">
                Track your service requests and view contractor responses
              </p>
            </div>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              New Request
            </button>
          </div>
        </div>

        {responseLoadErrors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Failed to load some responses</h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {responseLoadErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Requests Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't submitted any service requests yet. Get started by requesting a service!
            </p>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Request Service
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRequestTypeColor(request.request_type)}`}>
                          {request.request_type.charAt(0).toUpperCase() + request.request_type.slice(1)}
                        </span>
                      </div>

                      {/* Service Tags */}
                      {request.service_tags && request.service_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {request.service_tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-gray-600 mb-3">{request.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        {/* Location - only show if not remote */}
                        {request.service_mode !== 'remote' && request.location_city && (
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4" />
                            <span>{request.location_city}, {request.location_state} {request.location_postal_code}</span>
                          </div>
                        )}

                        {/* Service Mode */}
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{request.service_mode?.replace('_', ' ')} Service</span>
                        </div>

                        {/* Pricing */}
                        {request.pricing_type && (
                          <div className="flex items-center gap-2">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            <span>
                              {request.pricing_type === 'flat_rate' && request.budget && `$${request.budget} budget`}
                              {request.pricing_type === 'hourly_rate' && request.hourly_rate_limit && `Max $${request.hourly_rate_limit}/hr`}
                              {request.pricing_type === 'negotiable' && 'Negotiable pricing'}
                            </span>
                          </div>
                        )}

                        {/* Schedule */}
                        {(request.start_time || request.end_time) && (
                          <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-4 h-4" />
                            <span>
                              {request.start_time && formatDate(request.start_time)}
                              {request.start_time && request.end_time && ' - '}
                              {request.end_time && !request.start_time && formatDate(request.end_time)}
                            </span>
                          </div>
                        )}

                        {/* Response Limit */}
                        {request.max_responses && (
                          <div className="flex items-center gap-2">
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            <span>Max {request.max_responses} responses</span>
                          </div>
                        )}

                        {/* Special Options */}
                        {request.requires_inspection && (
                          <div className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                            <span className="text-orange-600">Inspection required</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {getStatusIcon(request.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Submitted {formatDate(request.created_at)}
                      {responses[request.id] && responses[request.id].length > 0 && (
                        <span className="ml-4 text-blue-600 font-medium">
                          {responses[request.id].length} contractor response{responses[request.id].length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {responses[request.id] && responses[request.id].length > 0 && (
                        <button
                          onClick={() => viewResponses(request)}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          View Responses
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Response Modal */}
        {showResponseModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Contractor Responses - {selectedRequest.title}
                  </h2>
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {responses[selectedRequest.id] && responses[selectedRequest.id].length > 0 ? (
                  <div className="space-y-4">
                    {responses[selectedRequest.id].map((response) => (
                      <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">
                                {response.company_name || 'Contractor'}
                              </h4>
                              {response.average_rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <StarIcon
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < Math.floor(response.average_rating)
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {response.average_rating.toFixed(1)} ({response.total_reviews} reviews)
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              Responded {formatDate(response.created_at)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            response.response_status === 'INTERESTED' ? 'bg-blue-100 text-blue-800' :
                            response.response_status === 'OFFERED' ? 'bg-yellow-100 text-yellow-800' :
                            response.response_status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                            response.response_status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {response.response_status === 'INTERESTED' ? 'Interested' :
                             response.response_status === 'OFFERED' ? 'Offered' :
                             response.response_status === 'ACCEPTED' ? 'Accepted ✅' :
                             response.response_status === 'REJECTED' ? 'Rejected ❌' :
                             response.response_status}
                          </span>
                        </div>
                        
                        {response.message && (
                          <p className="text-gray-700 mb-3">{response.message}</p>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          {response.proposed_rate && (
                            <div className="flex items-center gap-2">
                              <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                              <span className="font-medium">Proposed Rate: <span className="text-green-600">${response.proposed_rate}</span></span>
                            </div>
                          )}

                          {response.counter_offer && (
                            <div className="flex items-center gap-2">
                              <CurrencyDollarIcon className="w-4 h-4 text-orange-600" />
                              <span className="font-medium">Counter Offer: <span className="text-orange-600">${response.counter_offer}</span></span>
                            </div>
                          )}

                          {(response.available_start || response.available_end) && (
                            <div className="flex items-center gap-2">
                              <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
                              <span>Available: {response.available_start && formatDate(response.available_start)}{response.available_start && response.available_end && ' - '}{response.available_end && formatDate(response.available_end)}</span>
                            </div>
                          )}
                        </div>
                        
                        {(response.response_status === 'INTERESTED' || response.response_status === 'OFFERED') && (
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => acceptResponse(response.id)}
                              disabled={loading}
                              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading ? 'Accepting...' : 'Accept'}
                            </button>
                            <button
                              onClick={() => declineResponse(response.id)}
                              disabled={loading}
                              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading ? 'Declining...' : 'Decline'}
                            </button>
                          </div>
                        )}

                        {response.response_status === 'ACCEPTED' && (
                          <div className="mt-4">
                            <button
                              onClick={() => window.location.href = '/jobs'}
                              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                            >
                              View Work Order
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No responses yet. Contractors will be notified of your request.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* New Request Modal */}
        <RequestServiceModal
          isOpen={showNewRequestModal}
          onClose={() => setShowNewRequestModal(false)}
          onSuccess={() => {
            loadRequestsData(); // Refresh the requests list
          }}
        />
      </div>
    </div>
  );
};

export default MyRequests;
