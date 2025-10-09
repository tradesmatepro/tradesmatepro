// PTO Request History - Display list of PTO requests with status and actions
import React, { useState } from 'react';
import PTOServiceProduction from '../../services/PTOServiceProduction';
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const PTORequestHistory = ({ requests, showActions = false, title = "Request History" }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('all');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'DENIED':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'PENDING':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'APPROVED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'DENIED':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'CANCELLED':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const sortedRequests = filteredRequests.sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  const RequestDetailModal = ({ request, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon(request.status)}
              <span className="ml-2 text-lg font-medium text-gray-900">
                {PTOServiceProduction.getStatusLabel(request.status)}
              </span>
            </div>
            <span className={getStatusBadge(request.status)}>
              {PTOServiceProduction.getStatusLabel(request.status)}
            </span>
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Type</h3>
              <p className="text-gray-900">
                {PTOServiceProduction.getAccrualTypeLabel(request.accrual_type)}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Hours</h3>
              <p className="text-gray-900">
                {request.status === 'APPROVED' && request.hours_approved 
                  ? PTOServiceProduction.formatBalance(request.hours_approved)
                  : PTOServiceProduction.formatBalance(request.hours_requested)
                } hours
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Start Date</h3>
              <p className="text-gray-900">
                {new Date(request.starts_at).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">End Date</h3>
              <p className="text-gray-900">
                {new Date(request.ends_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Reason */}
          {request.note && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Reason</h3>
              <p className="text-gray-900 bg-gray-50 rounded-lg p-3">
                {request.note}
              </p>
            </div>
          )}

          {/* Approval/Denial Info */}
          {request.status === 'APPROVED' && request.approved_by_name && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-1">Approved</h3>
              <p className="text-sm text-green-700">
                Approved by {request.approved_by_name} on {new Date(request.approved_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {request.status === 'DENIED' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-1">Denied</h3>
              {request.denial_reason && (
                <p className="text-sm text-red-700 mb-2">
                  Reason: {request.denial_reason}
                </p>
              )}
              {request.approved_by_name && (
                <p className="text-sm text-red-700">
                  Denied by {request.approved_by_name} on {new Date(request.denied_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Submitted Info */}
          <div className="text-sm text-gray-500 border-t pt-4">
            Submitted on {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Requests</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="DENIED">Denied</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {sortedRequests.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? "You haven't submitted any time off requests yet."
              : `No ${filter.toLowerCase()} requests found.`
            }
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {sortedRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(request.status)}
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {PTOServiceProduction.getAccrualTypeLabel(request.accrual_type)}
                        </h3>
                        <span className={getStatusBadge(request.status)}>
                          {PTOServiceProduction.getStatusLabel(request.status)}
                        </span>
                      </div>
                      
                      <div className="mt-1 text-sm text-gray-600">
                        {new Date(request.starts_at).toLocaleDateString()} - {new Date(request.ends_at).toLocaleDateString()}
                        <span className="mx-2">•</span>
                        {request.status === 'APPROVED' && request.hours_approved 
                          ? PTOServiceProduction.formatBalance(request.hours_approved)
                          : PTOServiceProduction.formatBalance(request.hours_requested)
                        } hours
                      </div>
                      
                      {request.note && (
                        <div className="mt-1 text-sm text-gray-500 truncate max-w-md">
                          {request.note}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </button>
                    
                    {showActions && request.status === 'PENDING' && (
                      <button
                        onClick={() => {
                          // Handle cancel request
                          console.log('Cancel request:', request.id);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};

export default PTORequestHistory;
