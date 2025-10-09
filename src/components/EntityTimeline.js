import React, { useState } from 'react';
import { 
  ChatBubbleLeftIcon,
  DocumentIcon,
  CheckCircleIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const EntityTimeline = ({ 
  entityType = 'customer', // 'customer', 'quote', 'job'
  entityId,
  events = []
}) => {
  const [filter, setFilter] = useState('all');

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.type === filter;
  });

  const getEventIcon = (type) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'message':
        return <ChatBubbleLeftIcon className={`${iconClass} text-blue-500`} />;
      case 'file':
        return <DocumentIcon className={`${iconClass} text-green-500`} />;
      case 'status':
        return <CheckCircleIcon className={`${iconClass} text-purple-500`} />;
      case 'schedule':
        return <CalendarIcon className={`${iconClass} text-orange-500`} />;
      default:
        return <UserIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'message': return 'border-blue-200 bg-blue-50';
      case 'file': return 'border-green-200 bg-green-50';
      case 'status': return 'border-purple-200 bg-purple-50';
      case 'schedule': return 'border-orange-200 bg-orange-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const eventCounts = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-2 text-sm font-medium border-b-2 ${
            filter === 'all' 
              ? 'border-primary-500 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All ({events.length})
        </button>
        {Object.entries(eventCounts).map(([type, count]) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-2 text-sm font-medium border-b-2 capitalize ${
              filter === type 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {type}s ({count})
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <div key={event.id || index} className="flex gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${getEventColor(event.type)}`}>
                {getEventIcon(event.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{formatTimestamp(event.timestamp)}</span>
                      {event.user && (
                        <span>by {event.user}</span>
                      )}
                    </div>
                  </div>
                  {event.metadata && (
                    <div className="text-xs text-gray-500 ml-4">
                      {JSON.stringify(event.metadata)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-sm">
              {filter === 'all' 
                ? 'No activity yet' 
                : `No ${filter} events found`
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data generator for testing
export const generateMockEvents = (entityType, entityId) => {
  const baseEvents = [
    {
      id: '1',
      type: 'status',
      title: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} created`,
      description: 'Initial creation',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      user: 'John Doe'
    },
    {
      id: '2',
      type: 'message',
      title: 'Message sent',
      description: 'Follow-up message regarding requirements',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      user: 'Jane Smith'
    },
    {
      id: '3',
      type: 'file',
      title: 'Document uploaded',
      description: 'Contract_v2.pdf',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      user: 'John Doe'
    }
  ];

  if (entityType === 'quote') {
    baseEvents.push({
      id: '4',
      type: 'status',
      title: 'Quote sent',
      description: 'Quote sent to customer for review',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      user: 'System'
    });
  }

  if (entityType === 'job') {
    baseEvents.push({
      id: '5',
      type: 'schedule',
      title: 'Job scheduled',
      description: 'Scheduled for tomorrow at 2:00 PM',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      user: 'Dispatcher'
    });
  }

  return baseEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export default EntityTimeline;
