import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import EditRequestModal from './EditRequestModal';
import ResponseManagementModal from './ResponseManagementModal';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CalendarDaysIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const CustomerRequests = ({ onPostRequest }) => {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await supaFetch(
        `marketplace_requests?company_id=eq.${user.company_id}&order=created_at.desc`,
        { method: 'GET' }
      );
      const data = response.ok ? await response.json() : [];
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setShowEditModal(true);
  };

  const handleEditRequestSubmit = async () => {
    await loadRequests();
    setShowEditModal(false);
    setEditingRequest(null);
  };

  const handleViewResponses = (request) => {
    setSelectedRequest(request);
    setShowResponseModal(true);
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || request.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'in_progress':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Requests</h2>
          <p className="text-gray-600 mt-1">Manage your service requests and track their progress</p>
        </div>
        <button
          onClick={onPostRequest}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Request
        </button>
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
                placeholder="Search requests..."
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
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Categories</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="hvac">HVAC</option>
              <option value="carpentry">Carpentry</option>
              <option value="painting">Painting</option>
              <option value="landscaping">Landscaping</option>
              <option value="cleaning">Cleaning</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredRequests.length} of {requests.length} requests
        </p>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-600 mb-6">
            {requests.length === 0
              ? "You haven't posted any service requests yet."
              : "No requests match your current filters."
            }
          </p>
          {requests.length === 0 && (
            <button
              onClick={onPostRequest}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Post Your First Request
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewResponses(request)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(request.status)}
                    <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status?.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{request.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {request.category && (
                      <span className="inline-flex items-center">
                        <FunnelIcon className="h-4 w-4 mr-1" />
                        {request.category}
                      </span>
                    )}
                    {request.location && (
                      <span className="inline-flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {request.location}
                      </span>
                    )}
                    {request.budget && (
                      <span className="inline-flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                        ${request.budget.toLocaleString()}
                      </span>
                    )}
                    <span className="inline-flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-1" />
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="ml-4 flex flex-col items-end gap-2">
                  <div className="text-right mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        (request.response_count || 0) > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {request.response_count || 0} response{(request.response_count || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {request.deadline && (
                      <p className="text-xs text-gray-500">
                        Due: {new Date(request.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {/* View Responses Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewResponses(request);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-primary-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                      View Responses
                    </button>

                    {/* Edit Button - Only show for available requests */}
                    {(request.status === 'available' || request.status === 'open') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditRequest(request);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
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

      {/* Response Management Modal */}
      {showResponseModal && selectedRequest && (
        <ResponseManagementModal
          request={selectedRequest}
          onClose={() => {
            setShowResponseModal(false);
            setSelectedRequest(null);
          }}
          onRefresh={loadRequests}
        />
      )}
    </div>
  );
};

export default CustomerRequests;
