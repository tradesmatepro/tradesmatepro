import React from 'react';
import {
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * QuoteStatusCard - Displays modal data for quote statuses
 * Shows details from Presented, Changes Requested, Follow Up, Rejection, Approval, Expired modals
 *
 * ✅ INDUSTRY STANDARD: Only shows for statuses that capture rich modal data
 * Statuses WITHOUT modals (draft, sent, viewed) will not display this card
 */
const QuoteStatusCard = ({ quote }) => {
  if (!quote) return null;

  const status = quote.status?.toLowerCase();

  // ✅ ONLY show for statuses that have modal data
  // These are the statuses where we capture rich information via modals
  const statusesWithModals = [
    'presented',           // PresentedModal: presented_by, customer_reaction, next_steps, presented_notes
    'changes_requested',   // ChangesRequestedModal: change_types, change_details, change_urgency
    'follow_up',          // FollowUpModal: follow_up_date, follow_up_time, follow_up_method, follow_up_reason
    'rejected',           // RejectionModal: rejection_reason, rejection_competitor_name, rejection_notes
    'approved',           // ApprovalModal: deposit_amount, deposit_method, approval_notes
    'expired'             // ExpiredModal: expired_notes, expiration handling
  ];

  // ✅ Early return for statuses without modals (draft, sent, viewed, etc.)
  if (!statusesWithModals.includes(status)) {
    return null;
  }

  // Check if there's any modal data to display
  const hasModalData =
    quote.presented_by ||
    quote.customer_reaction ||
    quote.change_types ||
    quote.change_details ||
    quote.follow_up_date ||
    quote.rejection_reason ||
    quote.deposit_amount ||
    quote.expired_notes;

  // ✅ Don't show card if status has modal but no data was captured yet
  if (!hasModalData) {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'presented':
        return {
          title: '📋 Quote Presented',
          color: 'blue',
          icon: ChatBubbleLeftRightIcon,
        };
      case 'changes_requested':
        return {
          title: '🔄 Changes Requested',
          color: 'yellow',
          icon: ExclamationTriangleIcon,
        };
      case 'follow_up':
        return {
          title: '📞 Follow Up Scheduled',
          color: 'purple',
          icon: CalendarIcon,
        };
      case 'rejected':
        return {
          title: '❌ Quote Rejected',
          color: 'red',
          icon: XCircleIcon,
        };
      case 'approved':
        return {
          title: '✅ Quote Approved',
          color: 'green',
          icon: CheckCircleIcon,
        };
      case 'expired':
        return {
          title: '⏰ Quote Expired',
          color: 'gray',
          icon: ClockIcon,
        };
      default:
        return {
          title: '📋 Quote Status',
          color: 'gray',
          icon: ChatBubbleLeftRightIcon,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900',
  };

  const urgencyColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className={`rounded-lg border-2 p-4 mb-4 ${colorClasses[config.color]}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5" />
        <h3 className="font-semibold text-lg">{config.title}</h3>
      </div>

      {/* Presented Data */}
      {status === 'presented' && (
        <div className="space-y-2">
          {quote.presented_date && (
            <div className="flex items-start gap-2">
              <CalendarIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Presented:</span>{' '}
                {formatDate(quote.presented_date)}
                {quote.presented_time && ` at ${formatTime(quote.presented_time)}`}
              </div>
            </div>
          )}
          {quote.presented_by && (
            <div className="flex items-start gap-2">
              <UserIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Presented By:</span> {quote.presented_by}
              </div>
            </div>
          )}
          {quote.customer_reaction && (
            <div className="flex items-start gap-2">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Customer Reaction:</span> {quote.customer_reaction}
              </div>
            </div>
          )}
          {quote.next_steps && (
            <div className="flex items-start gap-2">
              <CheckCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Next Steps:</span> {quote.next_steps}
              </div>
            </div>
          )}
          {quote.presented_notes && (
            <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
              <span className="font-medium">Notes:</span>
              <p className="mt-1 text-sm">{quote.presented_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Changes Requested Data */}
      {status === 'changes_requested' && (
        <div className="space-y-2">
          {quote.change_types && Array.isArray(quote.change_types) && quote.change_types.length > 0 && (
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Change Types:</span>
                <ul className="list-disc list-inside mt-1">
                  {quote.change_types.map((type, idx) => (
                    <li key={idx} className="text-sm capitalize">{type}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {quote.change_details && (
            <div className="flex items-start gap-2">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Details:</span>
                <p className="mt-1 text-sm">{quote.change_details}</p>
              </div>
            </div>
          )}
          {quote.change_urgency && (
            <div className="flex items-start gap-2">
              <ClockIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex items-center gap-2">
                <span className="font-medium">Urgency:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${urgencyColors[quote.change_urgency.toLowerCase()] || urgencyColors.medium}`}>
                  {quote.change_urgency}
                </span>
              </div>
            </div>
          )}
          {quote.change_follow_up_date && (
            <div className="flex items-start gap-2">
              <CalendarIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Follow-up Date:</span> {formatDate(quote.change_follow_up_date)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Follow Up Data */}
      {status === 'follow_up' && (
        <div className="space-y-2">
          {quote.follow_up_date && (
            <div className="flex items-start gap-2">
              <CalendarIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Follow Up:</span>{' '}
                {formatDate(quote.follow_up_date)}
                {quote.follow_up_time && ` at ${formatTime(quote.follow_up_time)}`}
              </div>
            </div>
          )}
          {quote.follow_up_method && (
            <div className="flex items-start gap-2">
              {quote.follow_up_method.toLowerCase() === 'phone' ? (
                <PhoneIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              ) : quote.follow_up_method.toLowerCase() === 'email' ? (
                <EnvelopeIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              ) : (
                <ChatBubbleLeftRightIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <span className="font-medium">Method:</span> {quote.follow_up_method}
              </div>
            </div>
          )}
          {quote.follow_up_reason && (
            <div className="flex items-start gap-2">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Reason:</span> {quote.follow_up_reason}
              </div>
            </div>
          )}
          {quote.follow_up_reminder_time && (
            <div className="flex items-start gap-2">
              <ClockIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Reminder:</span> {quote.follow_up_reminder_time}
              </div>
            </div>
          )}
          {quote.follow_up_notes && (
            <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
              <span className="font-medium">Notes:</span>
              <p className="mt-1 text-sm">{quote.follow_up_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Rejection Data */}
      {status === 'rejected' && (
        <div className="space-y-2">
          {quote.rejection_reason && (
            <div className="flex items-start gap-2">
              <XCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Reason:</span> {quote.rejection_reason}
              </div>
            </div>
          )}
          {quote.rejection_competitor_name && (
            <div className="flex items-start gap-2">
              <UserIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Went with:</span> {quote.rejection_competitor_name}
              </div>
            </div>
          )}
          {quote.rejection_notes && (
            <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
              <span className="font-medium">Notes:</span>
              <p className="mt-1 text-sm">{quote.rejection_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Approval Data */}
      {status === 'approved' && (
        <div className="space-y-2">
          {quote.approved_at && (
            <div className="flex items-start gap-2">
              <CalendarIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Approved:</span> {formatDate(quote.approved_at)}
              </div>
            </div>
          )}
          {quote.approved_by && (
            <div className="flex items-start gap-2">
              <UserIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Approved By:</span> {quote.approved_by}
              </div>
            </div>
          )}
          {quote.deposit_amount && (
            <div className="flex items-start gap-2">
              <CheckCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Deposit:</span> ${parseFloat(quote.deposit_amount).toFixed(2)}
                {quote.deposit_method && ` (${quote.deposit_method})`}
              </div>
            </div>
          )}
          {quote.approval_notes && (
            <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
              <span className="font-medium">Notes:</span>
              <p className="mt-1 text-sm">{quote.approval_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Expired Data */}
      {status === 'expired' && (
        <div className="space-y-2">
          {quote.expiration_date && (
            <div className="flex items-start gap-2">
              <CalendarIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Expired On:</span> {formatDate(quote.expiration_date)}
              </div>
            </div>
          )}
          {quote.expired_notes && (
            <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
              <span className="font-medium">Notes:</span>
              <p className="mt-1 text-sm">{quote.expired_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Last Updated */}
      {quote.updated_at && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20 text-xs opacity-75">
          Last updated: {formatDate(quote.updated_at)}
        </div>
      )}
    </div>
  );
};

export default QuoteStatusCard;

