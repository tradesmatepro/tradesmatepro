import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import MarketplaceMessageModal from './MarketplaceMessageModal';
import { acceptMarketplaceResponse } from '../../services/MarketplaceService';
import MessagingService from '../../services/MarketplaceMessagingService';
import { getStatusDisplay, getStatusColor, DB_RESPONSE_STATUS } from '../../constants/marketplaceEnums';
import {
  XMarkIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const ResponseManagementModal = ({ request, onClose, onRefresh }) => {
  const { user } = useUser();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messagingContractor, setMessagingContractor] = useState(null);

  useEffect(() => {
    if (request) {
      loadResponses();
    }
  }, [request]);

  // Test Supabase connection
  const testConnection = async () => {
    try {
      console.log('🔍 Testing Supabase connection...');
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL || 'https://amgtktrwpdsigcomavlg.supabase.co'}/rest/v1/`, {
        headers: {
          'apikey': process.env.REACT_APP_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64'
        }
      });
      console.log('🔍 Connection test status:', response.status);
      if (response.status === 300) {
        console.error('❌ Supabase project appears to be paused (HTTP 300). Please check your Supabase dashboard.');
      }
    } catch (error) {
      console.error('❌ Connection test failed:', error);
    }
  };

  const loadResponses = async () => {
    try {
      setLoading(true);

      // First, try to load responses without the companies join to see if that's the issue
      const simpleQuery = `marketplace_responses?request_id=eq.${request.id}&order=created_at.desc`;
      console.log('🔍 Loading responses for request:', request.id);
      console.log('🔍 Simple query:', simpleQuery);
      console.log('🔍 Expected response statuses: INTERESTED, OFFER_SUBMITTED, INFO_REQUESTED, SITE_VISIT_PROPOSED, ACCEPTED, DECLINED');

      const simpleResponse = await supaFetch(simpleQuery, { method: 'GET' }, null); // unscoped: requester should see all contractor responses
      console.log('🔍 Simple response status:', simpleResponse.status);
      console.log('🔍 Simple response ok:', simpleResponse.ok);

      if (simpleResponse.ok) {
        const responseData = await simpleResponse.json();
        console.log('📨 Simple response data:', responseData);

        if (responseData && responseData.length > 0) {
          console.log('📨 Found responses, now trying with company join...');

          // Debug: Log all status values found
          const statusValues = responseData.map(r => r.response_status);
          console.log('📊 Response status values found:', statusValues);
          const uniqueStatuses = [...new Set(statusValues)];
          console.log('📊 Unique status values:', uniqueStatuses);

          // Check for non-standard enum values
          const expectedStatuses = ['INTERESTED', 'OFFER_SUBMITTED', 'INFO_REQUESTED', 'SITE_VISIT_PROPOSED', 'ACCEPTED', 'DECLINED'];
          const unexpectedStatuses = uniqueStatuses.filter(s => !expectedStatuses.includes(s));
          if (unexpectedStatuses.length > 0) {
            console.warn('⚠️ Found unexpected status values:', unexpectedStatuses);
          }

          // Try the corrected join syntax
          const joinQuery = `marketplace_responses?select=*,companies(id,name,email,phone,avg_rating,rating_count)&request_id=eq.${request.id}&order=created_at.desc`;
          console.log('🔍 Trying join query:', joinQuery);

          const joinResponse = await supaFetch(joinQuery, { method: 'GET' }, null); // unscoped

          if (joinResponse.ok) {
            const joinData = await joinResponse.json();
            console.log('📨 Join query successful:', joinData);
            setResponses(joinData);
          } else {
            console.log('⚠️ Join query failed, using responses without company data');
            setResponses(responseData);
          }
        } else {
          console.log('📨 No responses found');
          setResponses([]);
        }
      } else if (simpleResponse.status === 300) {
        console.error('❌ HTTP 300 - Supabase project may be paused or redirecting');
        console.error('❌ Check your Supabase dashboard to ensure the project is active');
        setResponses([]);
      } else {
        console.error('❌ Response not ok:', simpleResponse.status, simpleResponse.statusText);
        try {
          const errorText = await simpleResponse.text();
          console.error('❌ Error response:', errorText);
        } catch (e) {
          console.error('❌ Could not read error response');
        }
        setResponses([]);
      }
    } catch (error) {
      console.error('❌ Network error loading responses:', error);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptResponse = async (responseId) => {
    try {
      setActionLoading(responseId);

      // Phase 2: Use service layer RPC only
      const { workOrderId } = await acceptMarketplaceResponse(responseId, user.company_id);

      // Best-effort system message to contractor
      try {
        const response = responses.find(r => r.id === responseId);
        const contractorCompanyId = response?.company_id;
        if (contractorCompanyId) {
          await MessagingService.sendSystemMessage(
            response.request_id,
            contractorCompanyId,
            `Your offer has been accepted for: ${request.title}`,
            user.company_id,
            {
              requester_company_id: user.company_id,
              contractor_company_id: contractorCompanyId
            }
          );
        }
      } catch (e) {
        console.warn('Non-blocking: failed to send system message:', e);
      }

      alert(`Response accepted successfully! Work order ${workOrderId} has been created and the contractor has been notified.`);

      await loadResponses();
      onRefresh();
    } catch (error) {
      console.error('Error accepting response:', error);
      alert('Failed to accept response. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineResponse = async (responseId) => {
    try {
      setActionLoading(responseId);
      
      const response = await supaFetch(`marketplace_responses?id=eq.${responseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_status: DB_RESPONSE_STATUS.DECLINED })
      }, user.company_id);

      if (response.ok) {
        alert('Response declined successfully.');
        await loadResponses();
        onRefresh();
      } else {
        throw new Error('Failed to decline response');
      }
    } catch (error) {
      console.error('Error declining response:', error);
      alert('Failed to decline response. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getStatusColorClass = (status) => {
    const color = getStatusColor(status);
    const colorClasses = {
      'blue': 'bg-blue-100 text-blue-800',
      'green': 'bg-green-100 text-green-800',
      'yellow': 'bg-yellow-100 text-yellow-800',
      'purple': 'bg-purple-100 text-purple-800',
      'emerald': 'bg-emerald-100 text-emerald-800',
      'red': 'bg-red-100 text-red-800',
      'gray': 'bg-gray-100 text-gray-800'
    };
    return colorClasses[color] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Responses to "{request.title}"
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {responses.length} contractor{responses.length !== 1 ? 's' : ''} responded to your request
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading responses...</p>
          </div>
        ) : responses.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
            <p className="text-gray-600 mb-4">
              Contractors will see your request and can respond with their availability and pricing.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-yellow-800 mb-3">
                <strong>Debug Info:</strong> If the card shows "1 response" but this modal shows "0 responses",
                there may be a database connection issue (HTTP 300 errors). Check the browser console for details.
              </p>
              <button
                onClick={testConnection}
                className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
              >
                Test Connection
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {responses.map((response) => (
              <div key={response.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {response.companies?.name || 'Contractor'}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(response.response_status)}`}>
                        {getStatusDisplay(response.response_status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                      <span className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Responded {getTimeAgo(response.created_at)}
                      </span>
                      
                      {response.companies?.avg_rating && (
                        <div className="flex items-center gap-1">
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                          <span>{response.companies.avg_rating.toFixed(1)}</span>
                          <span className="text-gray-500">({response.companies.rating_count})</span>
                        </div>
                      )}
                    </div>

                    {response.message && (
                      <p className="text-gray-700 mb-3 text-sm bg-gray-50 p-3 rounded-md">
                        "{response.message}"
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {response.counter_offer && (
                        <span className="flex items-center font-medium text-green-600">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          Offer: {formatCurrency(response.counter_offer)}
                        </span>
                      )}
                      
                      {response.available_start && (
                        <span className="flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          Available: {new Date(response.available_start).toLocaleDateString()}
                          {response.available_end && ` - ${new Date(response.available_end).toLocaleDateString()}`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    {/* Contact Info */}
                    <div className="flex gap-2">
                      {response.companies?.phone && (
                        <a
                          href={`tel:${response.companies.phone}`}
                          className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                          title="Call contractor"
                        >
                          <PhoneIcon className="h-4 w-4" />
                        </a>
                      )}
                      
                      {response.companies?.email && (
                        <a
                          href={`mailto:${response.companies.email}`}
                          className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                          title="Email contractor"
                        >
                          <EnvelopeIcon className="h-4 w-4" />
                        </a>
                      )}
                      
                      <button
                        onClick={() => {
                          setMessagingContractor({
                            ...response.companies,
                            company_id: response.companies.id
                          });
                          setShowMessageModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        title="Send message"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Action Buttons */}
                    {(response.response_status === DB_RESPONSE_STATUS.INTERESTED ||
                      response.response_status === DB_RESPONSE_STATUS.OFFER_SUBMITTED ||
                      response.response_status === DB_RESPONSE_STATUS.INFO_REQUESTED ||
                      response.response_status === DB_RESPONSE_STATUS.SITE_VISIT_PROPOSED) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptResponse(response.id)}
                          disabled={actionLoading === response.id}
                          className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          {actionLoading === response.id ? 'Accepting...' : 'Accept'}
                        </button>
                        
                        <button
                          onClick={() => handleDeclineResponse(response.id)}
                          disabled={actionLoading === response.id}
                          className="flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>

      {/* Marketplace Message Modal */}
      {showMessageModal && messagingContractor && (
        <MarketplaceMessageModal
          request={request}
          contractor={messagingContractor}
          onClose={() => {
            setShowMessageModal(false);
            setMessagingContractor(null);
          }}
        />
      )}
    </div>
  );
};

export default ResponseManagementModal;
