// Purchase Order Approval Widget - Mobile-First Approval Interface
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import ApprovalWorkflowService from '../services/ApprovalWorkflowService';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const POApprovalWidget = () => {
  const { user } = useUser();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (user?.id && user?.company_id) {
      loadPendingApprovals();
    }
  }, [user]);

  const loadPendingApprovals = async () => {
    try {
      setLoading(true);
      const approvals = await ApprovalWorkflowService.getPendingApprovals(user.id, user.company_id);
      setPendingApprovals(approvals);
    } catch (error) {
      console.error('Error loading pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (workflowId, comments = '') => {
    try {
      setActionLoading(workflowId);
      await ApprovalWorkflowService.approvePO(workflowId, user.id, comments);
      await loadPendingApprovals(); // Refresh list
    } catch (error) {
      console.error('Error approving PO:', error);
      alert('Failed to approve PO. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (workflowId, comments = '') => {
    try {
      setActionLoading(workflowId);
      await ApprovalWorkflowService.rejectPO(workflowId, user.id, comments);
      await loadPendingApprovals(); // Refresh list
    } catch (error) {
      console.error('Error rejecting PO:', error);
      alert('Failed to reject PO. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const ApprovalCard = ({ workflow }) => {
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState('');
    const po = workflow.purchase_orders;

    return (
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="font-semibold text-gray-900">PO #{po?.po_number}</h3>
              <p className="text-sm text-gray-600">{po?.vendor_name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-lg font-bold text-gray-900">
              <CurrencyDollarIcon className="w-5 h-5" />
              {po?.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className={`text-xs px-2 py-1 rounded-full ${
              workflow.approval_level === 'manager' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
              {workflow.approval_level === 'manager' ? 'Manager Approval' : 'Owner Approval'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            {new Date(workflow.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <UserIcon className="w-4 h-4" />
            Requested by {workflow.created_by}
          </div>
        </div>

        {!showComments ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleApprove(workflow.id)}
              disabled={actionLoading === workflow.id}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" />
              {actionLoading === workflow.id ? 'Approving...' : 'Approve'}
            </button>
            <button
              onClick={() => setShowComments(true)}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <XCircleIcon className="w-4 h-4" />
              Reject
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              className="w-full p-3 border rounded-lg resize-none"
              rows="3"
              placeholder="Add comments (optional for approval, required for rejection)..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(workflow.id, comments)}
                disabled={actionLoading === workflow.id}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading === workflow.id ? 'Approving...' : 'Approve with Comments'}
              </button>
              <button
                onClick={() => handleReject(workflow.id, comments)}
                disabled={actionLoading === workflow.id || !comments.trim()}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === workflow.id ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
            <button
              onClick={() => {setShowComments(false); setComments('');}}
              className="w-full text-gray-600 text-sm hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (pendingApprovals.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm text-center">
        <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
        <p className="text-gray-600">No purchase orders pending your approval.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Pending Approvals ({pendingApprovals.length})
        </h2>
        <button
          onClick={loadPendingApprovals}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-3">
        {pendingApprovals.map((workflow) => (
          <ApprovalCard key={workflow.id} workflow={workflow} />
        ))}
      </div>
    </div>
  );
};

export default POApprovalWidget;
