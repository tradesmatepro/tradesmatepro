import React, { useState, useEffect } from 'react';
import { supaFetch } from '../../utils/supaFetch';
import { 
  EnvelopeIcon, 
  DevicePhoneMobileIcon, 
  GlobeAltIcon, 
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function QuoteDeliveryHistory({ workOrderId, companyId }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workOrderId && companyId) {
      loadDeliveries();
    }
  }, [workOrderId, companyId]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const response = await supaFetch(
        `quote_deliveries?work_order_id=eq.${workOrderId}&order=sent_at.desc`,
        { method: 'GET' },
        companyId
      );
      
      if (response.ok) {
        const data = await response.json();
        setDeliveries(data);
      }
    } catch (error) {
      console.error('Failed to load delivery history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'email':
        return <EnvelopeIcon className="w-5 h-5" />;
      case 'sms':
        return <DevicePhoneMobileIcon className="w-5 h-5" />;
      case 'portal':
        return <GlobeAltIcon className="w-5 h-5" />;
      case 'download':
        return <ArrowDownTrayIcon className="w-5 h-5" />;
      default:
        return <EnvelopeIcon className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      viewed: { bg: 'bg-green-100', text: 'text-green-800', icon: <EyeIcon className="w-4 h-4" />, label: 'Viewed' },
      delivered: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <CheckCircleIcon className="w-4 h-4" />, label: 'Delivered' },
      sent: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <ClockIcon className="w-4 h-4" />, label: 'Sent' },
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <ClockIcon className="w-4 h-4" />, label: 'Pending' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircleIcon className="w-4 h-4" />, label: 'Failed' }
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Delivery History</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Delivery History</h3>
      
      {deliveries.length === 0 ? (
        <div className="text-center py-8">
          <EnvelopeIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No deliveries yet</p>
          <p className="text-sm text-gray-400 mt-1">Quote hasn't been sent to customer</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery, index) => (
            <div 
              key={delivery.id} 
              className={`border-l-4 ${
                delivery.delivery_status === 'viewed' ? 'border-green-500' :
                delivery.delivery_status === 'delivered' ? 'border-blue-500' :
                delivery.delivery_status === 'sent' ? 'border-yellow-500' :
                delivery.delivery_status === 'failed' ? 'border-red-500' :
                'border-gray-300'
              } pl-4 pb-4 ${index !== deliveries.length - 1 ? 'border-b' : ''}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-gray-600">
                    {getMethodIcon(delivery.delivery_method)}
                  </div>
                  <div>
                    <span className="font-medium capitalize">{delivery.delivery_method}</span>
                    <div className="text-sm text-gray-600">
                      {delivery.recipient_email || delivery.recipient_phone || 'Unknown recipient'}
                    </div>
                  </div>
                </div>
                {getStatusBadge(delivery.delivery_status)}
              </div>

              {/* Timestamps */}
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <ClockIcon className="w-4 h-4" />
                  <span>Sent: {formatDate(delivery.sent_at)}</span>
                </div>
                
                {delivery.delivered_at && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Delivered: {formatDate(delivery.delivered_at)}</span>
                  </div>
                )}
                
                {delivery.viewed_at && (
                  <div className="flex items-center gap-2 text-green-600">
                    <EyeIcon className="w-4 h-4" />
                    <span>Viewed: {formatDate(delivery.viewed_at)}</span>
                  </div>
                )}

                {delivery.delivery_status === 'failed' && delivery.error_message && (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircleIcon className="w-4 h-4" />
                    <span>Error: {delivery.error_message}</span>
                  </div>
                )}
              </div>

              {/* Email Subject (if email) */}
              {delivery.delivery_method === 'email' && delivery.email_subject && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-500">Subject:</span>
                  <span className="ml-2 text-gray-700">{delivery.email_subject}</span>
                </div>
              )}

              {/* Portal Link (if portal) */}
              {delivery.delivery_method === 'portal' && delivery.portal_link && (
                <div className="mt-2">
                  <a 
                    href={delivery.portal_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    View in Customer Portal →
                  </a>
                </div>
              )}

              {/* PDF Link (if available) */}
              {delivery.pdf_url && (
                <div className="mt-2">
                  <a 
                    href={delivery.pdf_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download PDF
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {deliveries.length > 0 && (
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{deliveries.length}</div>
            <div className="text-xs text-gray-500">Total Sent</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {deliveries.filter(d => d.delivered_at).length}
            </div>
            <div className="text-xs text-gray-500">Delivered</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {deliveries.filter(d => d.viewed_at).length}
            </div>
            <div className="text-xs text-gray-500">Viewed</div>
          </div>
        </div>
      )}
    </div>
  );
}

