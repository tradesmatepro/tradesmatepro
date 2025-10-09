import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EntityTimeline from './EntityTimeline';
import { useUser } from '../contexts/UserContext';
import supaFetch from '../utils/supaFetch';

const QuotesContextDrawer = ({ isOpen, onClose, quote, onConvertToJob, onSend, onAccept, onReject, onPrint, customers = [] }) => {
  const customer = customers.find(c => c.id === quote?.customer_id);
  const { user } = useUser();
  const [events, setEvents] = useState([]);

  // Load real activity events from database
  useEffect(() => {
    if (isOpen && quote?.id && user?.company_id) {
      loadActivityEvents();
    }
  }, [isOpen, quote?.id, user?.company_id]);

  const loadActivityEvents = async () => {
    try {
      const activityEvents = [];

      // Get quote status changes from work_orders audit/history if available
      // For now, add creation event
      if (quote.created_at) {
        activityEvents.push({
          id: 'created',
          type: 'status',
          title: 'Quote created',
          description: 'Initial creation',
          timestamp: quote.created_at,
          user: quote.created_by_name || 'System'
        });
      }

      // Get quote sent events (if sent_at exists)
      if (quote.sent_at) {
        activityEvents.push({
          id: 'sent',
          type: 'status',
          title: 'Quote sent',
          description: 'Quote sent to customer for review',
          timestamp: quote.sent_at,
          user: quote.sent_by_name || 'System'
        });
      }

      // Get status updates
      if (quote.updated_at && quote.updated_at !== quote.created_at) {
        activityEvents.push({
          id: 'updated',
          type: 'status',
          title: 'Quote updated',
          description: `Status: ${quote.status}`,
          timestamp: quote.updated_at,
          user: quote.updated_by_name || 'System'
        });
      }

      // TODO: Add real events from:
      // - quote_communications table (emails, messages)
      // - quote_documents table (file uploads)
      // - quote_versions table (revisions)
      // - audit_logs table (all changes)

      // Sort by timestamp descending (newest first)
      activityEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setEvents(activityEvents);
    } catch (error) {
      console.error('Error loading activity events:', error);
      setEvents([]);
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const getStatusBadge = (status) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || colors.DRAFT}`}>
        {status || 'DRAFT'}
      </span>
    );
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white border-l border-gray-200 shadow-xl transform transition-transform duration-200 z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-sm text-gray-500">Quote</div>
            {getStatusBadge(quote?.status)}
          </div>
          <div className="text-lg font-semibold">{quote?.title || 'Untitled Quote'}</div>
          <div className="text-sm text-gray-500">#{quote?.quote_number || 'No number'}</div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">✕</button>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onConvertToJob}
            disabled={!quote || (quote?.quote_status !== 'ACCEPTED' && quote?.status !== 'ACCEPTED')}
            title={!quote || (quote?.quote_status !== 'ACCEPTED' && quote?.status !== 'ACCEPTED') ? 'Accept the quote first' : ''}
            className={`btn-primary text-sm ${(!quote || (quote?.quote_status !== 'ACCEPTED' && quote?.status !== 'ACCEPTED')) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Convert to Job
          </button>
          <button onClick={onSend} className="btn-secondary text-sm">Send</button>
          <button onClick={onAccept} className="btn-secondary text-sm">Accept</button>
          <button onClick={onReject} className="btn-secondary text-sm">Reject</button>
          <button onClick={onPrint} className="btn-secondary text-sm col-span-2">Print / PDF</button>
        </div>
        <div className="border-t pt-4">
          <div className="text-sm font-medium text-gray-900 mb-2">Quote Details</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer:</span>
              {customer ? (
                <Link to={`/customers?customerId=${customer.id}`} className="text-primary-600 hover:text-primary-800">
                  {customer.name}
                </Link>
              ) : (
                <span className="text-gray-700">N/A</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total:</span>
              <span className="font-medium">${quote?.total_amount?.toLocaleString?.() || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Created:</span>
              <span>{quote?.created_at ? new Date(quote?.created_at).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className="border-t pt-4">
          <div className="text-sm font-medium text-gray-900 mb-3">Recent Activity</div>
          <div className="max-h-64 overflow-y-auto">
            {events.length > 0 ? (
              <EntityTimeline
                entityType="quote"
                entityId={quote?.id}
                events={events}
              />
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No activity yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotesContextDrawer;

