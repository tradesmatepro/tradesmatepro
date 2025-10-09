// Contractor Dashboard - Incoming Requests Page
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import PageHeader from '../components/Common/PageHeader';
import {
  InboxIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const IncomingRequests = () => {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    loadRequests();
    // Set up polling for new requests every 30 seconds
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);

      // Build query based on filter
      let query = 'service_requests?select=*,customers(name,phone,email)';

      if (filter === 'open') {
        query += '&status=eq.open';
      } else if (filter === 'claimed') {
        query += '&status=eq.claimed';
      } else if (filter === 'scheduled') {
        query += '&status=eq.scheduled';
      } else if (filter === 'completed') {
        query += '&status=eq.completed';
      }
      // 'all' filter shows everything

      const response = await supaFetch(query, { method: 'GET' }, user.company_id);

      if (response.ok) {
        const data = await response.json();
        setRequests(data || []);
      }
    } catch (error) {
      console.error('Error loading service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to accept this service request? This will assign the job to your company.')) {
      return;
    }

    try {
      setResponding(requestId);

      // Update the service request status and assign to company
      const updateResponse = await supaFetch(
        `service_requests?id=eq.${requestId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'claimed',
            company_id: user.company_id
          })
        },
        user.company_id
      );

      if (updateResponse.ok) {
        // Create a response record
        await supaFetch(
          'service_request_responses',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_request_id: requestId,
              contractor_company_id: user.company_id,
              user_id: user.id,
              status: 'accepted',
              message: 'Request accepted. We will contact you shortly to schedule the service.'
            })
          },
          user.company_id
        );

        await loadRequests(); // Refresh the list
      } else {
        alert('Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. Please try again.');
    } finally {
      setResponding(null);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    const notes = window.prompt('Optional: Why are you declining this request?');

    try {
      setResponding(requestId);

      // Create a decline response record
      const response = await supaFetch(
        'service_request_responses',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_request_id: requestId,
            contractor_company_id: user.company_id,
            user_id: user.id,
            status: 'declined',
            message: notes || 'Request declined.'
          })
        },
        user.company_id
      );

      if (response.ok) {
        await loadRequests(); // Refresh the list
      } else {
        alert('Failed to decline request');
      }
    } catch (error) {
      console.error('Error declining request:', error);
      alert('Failed to decline request. Please try again.');
    } finally {
      setResponding(null);
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incoming Requests"
        subtitle="Service requests from customers in your area"
      />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Show:</span>
          <div className="flex space-x-2">
            {[
              { value: 'available', label: 'Available', count: requests.filter(r => r.status === 'open').length },
              { value: 'accepted', label: 'My Jobs', count: requests.filter(r => r.status === 'accepted').length },
              { value: 'all', label: 'All', count: requests.length }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === option.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-12">
          <InboxIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {filter === 'available' ? 'No available requests' : `No ${filter} requests`}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'available' 
              ? "There are no service requests available for your company's services right now."
              : `You don't have any ${filter} requests at the moment.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {request.service_tags?.name || 'Service Request'}
                    </h3>
                    {request.emergency && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                        EMERGENCY
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {getTimeAgo(request.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    {request.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    {request.customers && (
                      <div className="flex items-center text-gray-600">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span>{request.customers.name}</span>
                      </div>
                    )}
                    
                    {(request.customer_phone || request.customers?.phone) && (
                      <div className="flex items-center text-gray-600">
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        <span>{request.customer_phone || request.customers.phone}</span>
                      </div>
                    )}
                    
                    {(request.customer_email || request.customers?.email) && (
                      <div className="flex items-center text-gray-600">
                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                        <span>{request.customer_email || request.customers.email}</span>
                      </div>
                    )}
                    
                    {request.customer_location && (
                      <div className="flex items-center text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span>{request.customer_location}</span>
                      </div>
                    )}
                    
                    {request.customer_budget && (
                      <div className="flex items-center text-gray-600">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                        <span>Budget: ${request.customer_budget}</span>
                      </div>
                    )}
                    
                    {request.preferred_time && (
                      <div className="flex items-center text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>Preferred: {request.preferred_time}</span>
                      </div>
                    )}
                  </div>
                  
                  {request.emergency && request.emergency_fee && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Emergency Fee:</strong> ${request.emergency_fee} for immediate response
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              {request.status === 'open' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleDeclineRequest(request.id)}
                      disabled={responding === request.id}
                      className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                    >
                      {responding === request.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                      ) : (
                        <XMarkIcon className="h-4 w-4 mr-2" />
                      )}
                      Decline
                    </button>
                    
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={responding === request.id}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {responding === request.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckIcon className="h-4 w-4 mr-2" />
                      )}
                      Accept Job
                    </button>
                  </div>
                </div>
              )}
              
              {request.status === 'accepted' && request.company_id === user.company_id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckIcon className="h-3 w-3 mr-1" />
                      Assigned to your company
                    </span>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => window.location.href = `/service-requests/${request.id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {/* Coming soon - mark complete functionality */}}
                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Mark Complete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncomingRequests;
