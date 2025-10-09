// PTO Request Approval - Admin interface for approving/denying PTO requests
import React, { useState } from 'react';
import PTOServiceProduction from '../../services/PTOServiceProduction';
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const PTORequestApproval = ({ requests, onRequestUpdate }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalModal, setApprovalModal] = useState(null);
  const [denialModal, setDenialModal] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleApprove = async (request, approvalData = {}) => {
    try {
      setProcessing(true);
      await PTOServiceProduction.approveRequest(request.id, approvalData);
      setApprovalModal(null);
      onRequestUpdate();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeny = async (request, reason) => {
    try {
      setProcessing(true);
      await PTOServiceProduction.denyRequest(request.id, reason);
      setDenialModal(null);
      onRequestUpdate();
    } catch (error) {
      console.error('Error denying request:', error);
      alert('Failed to deny request: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const ApprovalModal = ({ request, onClose, onApprove }) => {
    const [hoursApproved, setHoursApproved] = useState(request.hours_requested);
    const [notes, setNotes] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Approve Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hours to Approve
                </label>
                <input
                  type="number"
                  value={hoursApproved}
                  onChange={(e) => setHoursApproved(parseFloat(e.target.value))}
                  min="0.5"
                  step="0.5"
                  max={request.hours_requested}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Requested: {PTOServiceProduction.formatBalance(request.hours_requested)} hours
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any notes about this approval..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onApprove(request, { hours_approved: hoursApproved, notes })}
                disabled={processing}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DenialModal = ({ request, onClose, onDeny }) => {
    const [reason, setReason] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Deny Request</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Denial *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please provide a reason for denying this request..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onDeny(request, reason)}
                disabled={processing || !reason.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Denying...' : 'Deny'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RequestDetailModal = ({ request, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Employee</h3>
              <p className="text-gray-900">{request.employee_name}</p>
              <p className="text-sm text-gray-500">{request.employee_email}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Type</h3>
              <p className="text-gray-900">
                {PTOServiceProduction.getAccrualTypeLabel(request.accrual_type)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Duration</h3>
              <p className="text-gray-900">
                {new Date(request.starts_at).toLocaleDateString()} - {new Date(request.ends_at).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Hours Requested</h3>
              <p className="text-gray-900">
                {PTOServiceProduction.formatBalance(request.hours_requested)} hours
              </p>
            </div>
          </div>

          {request.note && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Reason</h3>
              <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{request.note}</p>
            </div>
          )}

          <div className="text-sm text-gray-500 border-t pt-4">
            Submitted on {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => setDenialModal(request)}
              className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              Deny
            </button>
            <button
              onClick={() => setApprovalModal(request)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Pending Requests</h2>
        <div className="text-sm text-gray-500">
          {requests.length} request{requests.length !== 1 ? 's' : ''} pending approval
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
          <p className="mt-1 text-sm text-gray-500">All requests have been processed.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {requests.map((request) => (
              <div key={request.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <UserIcon className="h-10 w-10 text-gray-400" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {request.employee_name}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          {PTOServiceProduction.getAccrualTypeLabel(request.accrual_type)}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {PTOServiceProduction.formatBalance(request.hours_requested)} hours
                        </div>
                        <div>
                          {new Date(request.starts_at).toLocaleDateString()} - {new Date(request.ends_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {request.note && (
                        <div className="mt-2 text-sm text-gray-500 bg-gray-50 rounded p-2">
                          {request.note}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View
                    </button>
                    
                    <button
                      onClick={() => setDenialModal(request)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Deny
                    </button>
                    
                    <button
                      onClick={() => setApprovalModal(request)}
                      className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      {approvalModal && (
        <ApprovalModal
          request={approvalModal}
          onClose={() => setApprovalModal(null)}
          onApprove={handleApprove}
        />
      )}

      {denialModal && (
        <DenialModal
          request={denialModal}
          onClose={() => setDenialModal(null)}
          onDeny={handleDeny}
        />
      )}
    </div>
  );
};

export default PTORequestApproval;
