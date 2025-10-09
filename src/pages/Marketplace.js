import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import RequestCard from '../components/Marketplace/RequestCard';
// Removed CreateRequestModal - now using unified booking system
import EditRequestModal from '../components/Marketplace/EditRequestModal';
import AutoAcceptService from '../services/AutoAcceptService';
import {
  getAvailableRequests,
  getBrowseRequests,
  getCompanyMarketplaceRequests,
  getCompanyMarketplaceResponses,
  submitMarketplaceResponse,
  acceptMarketplaceResponse,
  getCompanyResponsesForRequests
} from '../services/MarketplaceService';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  CheckIcon,
  CalendarDaysIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  UserIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  UserCircleIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// Import Customer Portal components for Hiring mode
import CustomerDashboard from '../components/Marketplace/CustomerDashboard';
import CustomerRequests from '../components/Marketplace/CustomerRequests';
import CustomerQuotes from '../components/Marketplace/CustomerQuotes';
import CustomerJobs from '../components/Marketplace/CustomerJobs';
import CustomerInvoices from '../components/Marketplace/CustomerInvoices';
import CustomerMessages from '../components/Marketplace/CustomerMessages';
import CustomerProfile from '../components/Marketplace/CustomerProfile';

// Import Providing mode components
import ProvidingMarketplace from '../components/Marketplace/ProvidingMarketplace';

// Import new multi-role components
import ExpandableRequestCard from '../components/Marketplace/ExpandableRequestCard';
import MultiRoleRequestForm from '../components/Marketplace/MultiRoleRequestForm';

const Marketplace = () => {
  const { user } = useUser();
  const [marketplaceMode, setMarketplaceMode] = useState('providing'); // providing, booking

  // Debug: Log current marketplace mode
  console.log('Marketplace mode:', marketplaceMode);
  const [providingTab, setProvidingTab] = useState('dashboard'); // dashboard, marketplace, quotes, jobs, invoices, messages, profile
  const [customerTab, setCustomerTab] = useState('dashboard'); // dashboard, requests, quotes, jobs, invoices, messages, profile
  const [requests, setRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myResponses, setMyResponses] = useState([]);
  const [receivedResponses, setReceivedResponses] = useState([]);
  const [userResponses, setUserResponses] = useState({}); // Map of request_id -> response data
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('available'); // available, emergency, all
  const [searchTerm, setSearchTerm] = useState('');
  // Removed showCreateModal - now using unified booking system
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [showMultiRoleForm, setShowMultiRoleForm] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    if (providingTab === 'marketplace') {
      loadMarketplaceData();
    }
  }, [providingTab, filter, selectedTags]);

  const loadMarketplaceData = async () => {
    setLoading(true);
    try {
      // For Providing mode marketplace, load requests from OTHER companies
      await loadAvailableRequests();
    } catch (error) {
      console.error('Error loading marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load contractor dashboard metrics when on Providing > Dashboard
  useEffect(() => {
    if (marketplaceMode === 'providing' && providingTab === 'dashboard') {
      // Load my responses and current open requests for counts
      loadMyResponses();
      loadAvailableRequests();
    }
  }, [marketplaceMode, providingTab]);


  const loadAvailableRequests = async () => {
    try {
      // Prepare filters
      const tagNames = selectedTags.map(tag => tag.name);
      const pricingFilters = [];
      const requestTypeFilters = [];

      if (filter === 'emergency') {
        requestTypeFilters.push('EMERGENCY');
      }

      // For Providing mode: show requests posted by OTHER companies (not current user's company)
      // This ensures contractors only see requests they can respond to, not their own
      const data = await getBrowseRequests(
        user.company_id,
        tagNames,
        pricingFilters,
        requestTypeFilters
      );

      setRequests(data || []);

      // Load user's responses for these requests to show proper button states
      if (data && data.length > 0) {
        const requestIds = data.map(req => req.id);
        const responses = await getCompanyResponsesForRequests(user.company_id, requestIds);
        setUserResponses(responses);
      }
    } catch (error) {
      console.error('Error loading available requests:', error);
      setRequests([]);
      setUserResponses({});
    }
  };

  const loadMyRequests = async () => {
    try {
      // Load requests posted by this company using the MarketplaceService
      const data = await getCompanyMarketplaceRequests(user.company_id);
      setMyRequests(data || []);
    } catch (error) {
      console.error('Error loading my requests:', error);
      setMyRequests([]);
    }
  };

  const loadReceivedResponses = async () => {
    try {
      // Load responses received on requests posted by this company
      const query = `marketplace_responses?select=*,companies(name,email,phone,avg_rating,rating_count),marketplace_requests!marketplace_responses_request_id_fkey(title,description,budget,request_type,company_id)&marketplace_requests.company_id=eq.${user.company_id}&order=created_at.desc`;

      const response = await supaFetch(query, { method: 'GET' }, null); // unscoped: filter is on marketplace_requests.company_id
      if (response.ok) {
        const data = await response.json();
        setReceivedResponses(data || []);
      }
    } catch (error) {
      console.error('Error loading received responses:', error);
      setReceivedResponses([]);
    }
  };

  const loadMyResponses = async () => {
    try {
      // Load responses submitted by this company using the MarketplaceService
      const data = await getCompanyMarketplaceResponses(user.company_id);
      setMyResponses(data || []);
    } catch (error) {
      console.error('Error loading my responses:', error);
      setMyResponses([]);
    }
  };

  const submitResponse = async (requestId, responseData) => {
    try {
      // Map frontend response types to database enum values
      const mapResponseType = (frontendType) => {
        const mapping = {
          'accepted': 'ACCEPTED',
          'counter': 'OFFERED',
          'declined': 'REJECTED',
          'quote': 'PENDING_QUOTE',
          'pending': 'PENDING_QUOTE',
          'interested': 'INTERESTED',
          // Handle already-standardized values
          'INTERESTED': 'INTERESTED',
          'PENDING_QUOTE': 'PENDING_QUOTE',
          'OFFERED': 'OFFERED',
          'REJECTED': 'REJECTED',
          'ACCEPTED': 'ACCEPTED'
        };
        return mapping[frontendType] || 'INTERESTED';
      };

      const mappedStatus = mapResponseType(responseData.status);
      console.log('🔍 Response submission debug:', {
        originalStatus: responseData.status,
        mappedStatus: mappedStatus,
        requestId: requestId,
        companyId: user.company_id,
        responseData: responseData,
        validStatuses: ['INTERESTED', 'PENDING_QUOTE', 'OFFERED', 'REJECTED', 'ACCEPTED']
      });

      // Create the response using the MarketplaceService
      const newResponseData = {
        request_id: requestId,
        company_id: user.company_id,
        counter_offer: responseData.proposedRate || responseData.counterOffer,
        available_start: responseData.availableStart,
        available_end: responseData.availableEnd,
        message: responseData.message,
        response_status: mapResponseType(responseData.responseType || responseData.status)
      };

      const newResponse = await submitMarketplaceResponse(newResponseData);

      if (newResponse) {
        console.log('✅ Response submitted successfully!');

        // Get the original request to check for auto-accept
        const request = requests.find(r => r.id === requestId) ||
                        myRequests.find(r => r.id === requestId);

        if (request) {
          // Check for auto-accept
          const wasAutoAccepted = await AutoAcceptService.processNewResponse(
            request,
            newResponse,
            user.company_id
          );

          if (wasAutoAccepted) {
            console.log('🎉 Request was automatically booked!');
            // TODO: Show toast notification when available
          }
        }

        // Refresh data
        await loadMarketplaceData();
        return true;
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      return false;
    }
  };

  const acceptResponse = async (responseId) => {
    try {
      setLoading(true);

      console.log('Contractor App - Accepting response:', responseId);

      // Use the MarketplaceService to accept the response and create work order
      const { response, workOrder } = await acceptMarketplaceResponse(responseId, user.company_id);

      console.log('Contractor App - Response accepted successfully:', { response, workOrder });

      // Show success message
      // TODO: Replace with proper toast when available
      alert('Response accepted successfully! The contractor has been notified.');

      // Refresh the data to show updated statuses
      await loadMarketplaceData();
    } catch (error) {
      console.error('Contractor App - Error accepting response:', error);

      // Log error to error_logs/latest.json
      try {
        await fetch('/error-server/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            message: `Failed to accept marketplace response: ${error.message}`,
            context: 'Contractor App - Accept Response',
            responseId,
            error: error.stack || error.toString()
          })
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }

      // Show error message
      alert('Failed to accept response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateResponse = async (responseId, updateData) => {
    try {
      setLoading(true);

      console.log('Contractor App - Updating response:', responseId, updateData);

      const updateQuery = `marketplace_responses?id=eq.${responseId}`;
      const response = await supaFetch(updateQuery, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      }, user.company_id);

      if (response.ok) {
        console.log('Contractor App - Response updated successfully');
        alert('Response updated successfully!');
        await loadMarketplaceData();
        return true;
      } else {
        throw new Error('Failed to update response');
      }
    } catch (error) {
      console.error('Contractor App - Failed to update response:', error);

      // Log error to error_logs/latest.json
      try {
        await fetch('/error-server/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            message: `Failed to update marketplace response: ${error.message}`,
            error: error.message,
            stack: error.stack,
            context: 'Contractor App - Update Response',
            responseId
          })
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }

      alert('Failed to update response. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const withdrawResponse = async (responseId) => {
    try {
      setLoading(true);

      console.log('Contractor App - Withdrawing response:', responseId);

      const updateQuery = `marketplace_responses?id=eq.${responseId}`;
      const response = await supaFetch(updateQuery, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_status: 'REJECTED' })
      }, user.company_id);

      if (response.ok) {
        console.log('Contractor App - Response withdrawn successfully');
        alert('Response withdrawn successfully.');
        await loadMarketplaceData();
        return true;
      } else {
        throw new Error('Failed to withdraw response');
      }
    } catch (error) {
      console.error('Contractor App - Failed to withdraw response:', error);

      // Log error to error_logs/latest.json
      try {
        await fetch('/error-server/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            message: `Failed to withdraw marketplace response: ${error.message}`,
            error: error.message,
            stack: error.stack,
            context: 'Contractor App - Withdraw Response',
            responseId
          })
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }

      alert('Failed to withdraw response. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData) => {
    try {
      const response = await supaFetch('marketplace_requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...requestData,
          company_id: user.company_id
        })
      }, user.company_id);

      if (response.ok) {
        // Refresh data
        loadMarketplaceData();
        return true;
      }
    } catch (error) {
      console.error('Error creating request:', error);
    }
    return false;
  };

  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setShowEditModal(true);
  };

  const handleEditRequestSubmit = async () => {
    // Refresh the requests data
    await loadMyRequests();
    setShowEditModal(false);
    setEditingRequest(null);
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

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      negotiation: 'bg-yellow-100 text-yellow-800',
      booked: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-gray-100 text-gray-800',
      canceled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Marketplace</h1>
              <p className="text-blue-100 mt-2 text-lg">
                {marketplaceMode === 'providing'
                  ? '🚀 Discover service requests and grow your business'
                  : '🎯 Request services and manage your projects'
                }
              </p>
            </div>

            {/* Modern Mode Toggle with Enhanced Styling */}
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-xl p-1.5 shadow-lg border border-white/30">
              <button
                onClick={() => setMarketplaceMode('providing')}
                className={`flex items-center px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  marketplaceMode === 'providing'
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <UserIcon className="h-4 w-4 mr-2" />
                🔧 Providing
              </button>
              <button
                onClick={() => setMarketplaceMode('booking')}
                className={`flex items-center px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  marketplaceMode === 'booking'
                    ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                🏠 Booking
              </button>
            </div>

            {marketplaceMode === 'booking' && (
              <button
                onClick={() => window.location.href = '/booking'}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                ✨ Request Service
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area with Modern Styling */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Providing Mode - Modern Navigation */}
        {marketplaceMode === 'providing' && (
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
            <nav className="flex space-x-1 px-4 py-2">
              {[
                { id: 'dashboard', name: '📊 Dashboard', icon: '📊' },
                { id: 'marketplace', name: '🏪 Marketplace', icon: '🏪' },
                { id: 'quotes', name: '📋 Quotes', icon: '📋' },
                { id: 'jobs', name: '🔧 Jobs', icon: '🔧' },
                { id: 'invoices', name: '💰 Invoices', icon: '💰' },
                { id: 'messages', name: '💬 Messages', icon: '💬' },
                { id: 'profile', name: '👤 Profile', icon: '👤' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setProvidingTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    providingTab === tab.id
                      ? 'bg-blue-100 text-blue-700 shadow-md transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Booking Mode - Modern Customer Navigation */}
        {marketplaceMode === 'booking' && (
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
            <nav className="flex space-x-1 px-4 py-2">
              {[
                { id: 'dashboard', name: '🏠 Dashboard', icon: '🏠' },
                { id: 'requests', name: '📝 Requests', icon: '📝' },
                { id: 'quotes', name: '💼 Quotes', icon: '💼' },
                { id: 'jobs', name: '⚡ Jobs', icon: '⚡' },
                { id: 'invoices', name: '🧾 Invoices', icon: '🧾' },
                { id: 'messages', name: '💬 Messages', icon: '💬' },
                { id: 'profile', name: '👤 Profile', icon: '👤' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCustomerTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    customerTab === tab.id
                      ? 'bg-green-100 text-green-700 shadow-md transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        )}



      {/* Providing Mode Content - Contractor Portal */}
      {marketplaceMode === 'providing' && (
        <div className="space-y-4">
          {providingTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Dashboard card clicked: My Responses -> marketplace tab');
                  setProvidingTab('marketplace');
                }}
              >
                <div className="flex items-center">
                  <DocumentTextIcon className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">My Responses</p>
                    <p className="text-2xl font-bold text-gray-900">{myResponses.length}</p>
                  </div>
                </div>
              </div>
              <div
                className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Dashboard card clicked: Open Requests -> marketplace tab');
                  setProvidingTab('marketplace');
                }}
              >
                <div className="flex items-center">
                  <WrenchScrewdriverIcon className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Open Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
                  </div>
                </div>
              </div>
              <div
                className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Dashboard card clicked: Messages -> messages tab');
                  setProvidingTab('messages');
                }}
              >
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Messages</p>
                    <p className="text-2xl font-bold text-gray-900">—</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {providingTab === 'marketplace' && (
            <ProvidingMarketplace
              onSubmitResponse={submitResponse}
              userResponses={userResponses}
            />
          )}
          {providingTab === 'quotes' && <CustomerQuotes />}
          {providingTab === 'jobs' && <CustomerJobs />}
          {providingTab === 'invoices' && <CustomerInvoices />}
          {providingTab === 'messages' && <CustomerMessages />}
          {providingTab === 'profile' && <CustomerProfile />}
        </div>
      )}

      {/* Booking Mode Content - Customer Portal Copy */}
      {marketplaceMode === 'booking' && (
        <div className="space-y-4">
          {customerTab === 'dashboard' && (
            <CustomerDashboard
              onPostRequest={() => setCustomerTab('requests')}
              onPostMultiRoleRequest={() => setShowMultiRoleForm(true)}
              onTabChange={setCustomerTab}
            />
          )}
          {customerTab === 'requests' && <CustomerRequests onPostRequest={() => window.location.href = '/booking'} />}
          {customerTab === 'quotes' && <CustomerQuotes />}
          {customerTab === 'jobs' && <CustomerJobs />}
          {customerTab === 'invoices' && <CustomerInvoices />}
          {customerTab === 'messages' && <CustomerMessages />}
          {customerTab === 'profile' && <CustomerProfile />}
        </div>
      )}

      {/* Multi-Role Request Form Modal */}
      {showMultiRoleForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <MultiRoleRequestForm
              onRequestCreated={(requestId) => {
                setShowMultiRoleForm(false);
                // Refresh the requests list
                if (marketplaceMode === 'booking') {
                  // Refresh customer requests
                  window.location.reload(); // Simple refresh for now
                }
              }}
              onCancel={() => setShowMultiRoleForm(false)}
            />
          </div>
        </div>
      )}

        {/* Edit Request Modal */}
        {showEditModal && editingRequest && (
          <EditRequestModal
            request={editingRequest}
            onSubmit={handleEditRequestSubmit}
            onClose={() => {
              setShowEditModal(false);
              setEditingRequest(null);
            }}
          />
        )}
      </div>
    </div>
  );
};



// Component for my posted requests
const MyRequests = ({ requests, onAcceptResponse, onEditRequest, loading }) => {
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

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      negotiation: 'bg-yellow-100 text-yellow-800',
      booked: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-gray-100 text-gray-800',
      canceled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <PlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No requests posted</h3>
        <p className="text-gray-600">Post your first service request to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                {request.request_type === 'emergency' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                    EMERGENCY
                  </span>
                )}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {request.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 mb-3">{request.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Posted {getTimeAgo(request.created_at)}</span>
                <span>{(request.marketplace_responses?.length ?? request.response_count ?? 0)}/{request.max_responses} responses</span>
                {/* Show pricing based on preference */}
                {request.pricing_preference === 'FLAT' && (request.budget || request.flat_rate) && (
                  <span>Budget: {formatCurrency(request.budget || request.flat_rate)}</span>
                )}
                {request.pricing_preference === 'HOURLY' && (request.hourly_rate_limit || request.hourly_rate) && (
                  <span>Max Rate: {formatCurrency(request.hourly_rate_limit || request.hourly_rate)}/hr</span>
                )}
                {(request.pricing_preference === 'NEGOTIABLE' || !request.pricing_preference) && (
                  <span>Pricing: Negotiable</span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex items-center space-x-2">
              {request.status === 'available' && onEditRequest && (
                <button
                  onClick={() => onEditRequest(request)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
            </div>
          </div>

          {request.marketplace_responses && request.marketplace_responses.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Contractor Responses ({request.marketplace_responses.length})</h4>
              <div className="space-y-3">
                {request.marketplace_responses.map((response) => (
                  <div key={response.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {response.companies?.name || 'Contractor'}
                        </h5>
                        <p className="text-sm text-gray-600">
                          Responded {getTimeAgo(response.created_at)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        response.response_status === 'INTERESTED' ? 'bg-blue-100 text-blue-800' :
                        response.response_status === 'OFFERED' ? 'bg-yellow-100 text-yellow-800' :
                        response.response_status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        response.response_status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        response.response_status === 'PENDING_QUOTE' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {response.response_status === 'INTERESTED' ? 'Interested' :
                         response.response_status === 'OFFERED' ? 'Offered' :
                         response.response_status === 'ACCEPTED' ? 'Accepted ✅' :
                         response.response_status === 'REJECTED' ? 'Rejected ❌' :
                         response.response_status === 'PENDING_QUOTE' ? 'Pending Quote' :
                         response.response_status}
                      </span>
                    </div>

                    {response.message && (
                      <p className="text-gray-700 mb-3 text-sm">{response.message}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {response.counter_offer && (
                          <span className="font-medium text-green-600">
                            Offer: {formatCurrency(response.counter_offer)}
                          </span>
                        )}
                        {response.available_start && (
                          <span>Available: {new Date(response.available_start).toLocaleDateString()}</span>
                        )}
                      </div>

                      {(response.response_status === 'INTERESTED' || response.response_status === 'OFFERED') && onAcceptResponse && (
                        <button
                          onClick={() => onAcceptResponse(response.id)}
                          disabled={loading}
                          className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Accepting...' : 'Accept'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Component for my submitted responses
const MyResponses = ({ responses, onUpdateResponse, onWithdrawResponse, loading }) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (responses.length === 0) {
    return (
      <div className="text-center py-12">
        <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No responses submitted</h3>
        <p className="text-gray-600">Browse available requests and submit your first response.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <div key={response.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {response.marketplace_requests?.title || 'Request'}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  response.response_status === 'INTERESTED' ? 'bg-blue-100 text-blue-800' :
                  response.response_status === 'OFFERED' ? 'bg-yellow-100 text-yellow-800' :
                  response.response_status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                  response.response_status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  response.response_status === 'PENDING_QUOTE' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {response.response_status === 'INTERESTED' ? 'Interested' :
                   response.response_status === 'OFFERED' ? 'Offered' :
                   response.response_status === 'ACCEPTED' ? 'Accepted ✅' :
                   response.response_status === 'REJECTED' ? 'Rejected ❌' :
                   response.response_status === 'PENDING_QUOTE' ? 'Pending Quote' :
                   response.response_status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  response.marketplace_requests?.request_type === 'emergency' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {response.marketplace_requests?.request_type?.charAt(0).toUpperCase() + response.marketplace_requests?.request_type?.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 mb-3">
                {response.marketplace_requests?.description || 'No description available'}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Responded {getTimeAgo(response.created_at)}</span>
                <span>Customer: {response.marketplace_requests?.customers?.name || 'Unknown'}</span>
                <span>Status: {response.marketplace_requests?.status || 'Unknown'}</span>
              </div>
            </div>
            {response.counter_offer && (
              <div className="text-right">
                <div className="text-sm text-gray-500">Your Offer</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(response.counter_offer)}
                </div>
              </div>
            )}
          </div>

          {response.message && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">{response.message}</p>
            </div>
          )}

          {(response.available_start || response.available_end) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Availability:</span>
                <span>
                  {response.available_start && formatDate(response.available_start)}
                  {response.available_start && response.available_end && ' - '}
                  {response.available_end && formatDate(response.available_end)}
                </span>
              </div>
            </div>
          )}

          {(response.response_status === 'INTERESTED' || response.response_status === 'OFFERED') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={() => onWithdrawResponse(response.id)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Withdrawing...' : 'Withdraw Response'}
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement update response modal
                    alert('Update response functionality coming soon!');
                  }}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Response
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Component for posting new requests
const PostRequestForm = ({ onSubmit, onShowMultiRole }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center py-12">
        <PlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Post a Service Request</h3>
        <p className="text-gray-600 mb-6">Create a new service request to get quotes from contractors.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.href = '/booking'}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Simple Request
          </button>

          <button
            onClick={onShowMultiRole}
            className="inline-flex items-center px-6 py-3 border border-primary-600 rounded-md shadow-sm text-base font-medium text-primary-600 bg-white hover:bg-primary-50"
          >
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Multi-Role Request
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Simple: Single service request • Multi-Role: Complex projects requiring multiple trades
        </p>
      </div>
    </div>
  );
};

// Component for received responses (responses to requests posted by this company)
const ReceivedResponses = ({ responses, onAcceptResponse, loading }) => {
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

  if (responses.length === 0) {
    return (
      <div className="text-center py-12">
        <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No responses received</h3>
        <p className="text-gray-600">Responses to your posted requests will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <div key={response.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {response.marketplace_requests?.title || 'Request'}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  response.marketplace_requests?.request_type === 'EMERGENCY' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {response.marketplace_requests?.request_type?.charAt(0).toUpperCase() + response.marketplace_requests?.request_type?.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{response.companies?.name}</span>
                  {response.companies?.avg_rating && (
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-600">{response.companies.avg_rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">({response.companies.rating_count})</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Received {getTimeAgo(response.created_at)}</span>
                <span>Budget: {formatCurrency(response.marketplace_requests?.budget)}</span>
              </div>
            </div>
            <div className="text-right">
              {response.counter_offer && (
                <div className="mb-2">
                  <div className="text-sm text-gray-500">Counter Offer</div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(response.counter_offer)}
                  </div>
                </div>
              )}
              <button
                onClick={() => onAcceptResponse(response.id)}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Accepting...' : 'Accept Response'}
              </button>
            </div>
          </div>

          {response.message && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">{response.message}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Marketplace;
