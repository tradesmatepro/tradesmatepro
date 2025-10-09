import React from 'react';
import {
  UserIcon,
  ExclamationTriangleIcon,
  BellIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const ConversationList = ({ 
  conversations, 
  users, 
  currentUser, 
  selectedConversation, 
  onSelectConversation, 
  loading 
}) => {
  
  // Get user info by ID
  const getUserById = (userId) => {
    return users.find(user => user.id === userId);
  };

  // Get conversation partner (the other person in the conversation)
  const getConversationPartner = (conversation) => {
    const partnerId = conversation.participants.find(id => id !== currentUser.id);
    return getUserById(partnerId);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get message type icon
  const getMessageTypeIcon = (messageType) => {
    switch (messageType) {
      case 'system':
        return <BellIcon className="w-4 h-4 text-blue-500" />;
      case 'client':
        return <UsersIcon className="w-4 h-4 text-green-500" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  // Truncate message preview
  const truncateMessage = (message, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
          <p className="text-gray-600">Start a conversation by sending a message to a team member</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {conversations.map((conversation) => {
          const partner = getConversationPartner(conversation);
          const lastMessage = conversation.lastMessage;
          const isSelected = selectedConversation?.id === conversation.id;
          const isSystemMessage = lastMessage.message_type === 'system';
          
          return (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-primary-50 border-r-2 border-primary-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {isSystemMessage ? (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BellIcon className="w-5 h-5 text-blue-600" />
                    </div>
                  ) : partner ? (
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {partner.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <UsersIcon className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {isSystemMessage 
                          ? 'System Notifications'
                          : partner?.full_name || 'Client (Coming Soon)'
                        }
                      </h3>
                      {getMessageTypeIcon(lastMessage.message_type)}
                    </div>
                    <div className="flex items-center space-x-2">
                      {conversation.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(lastMessage.sent_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-1">
                    <p className={`text-sm ${
                      conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                    }`}>
                      {isSystemMessage && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mr-2">
                          System
                        </span>
                      )}
                      {truncateMessage(lastMessage.message)}
                    </p>
                  </div>

                  {/* Role indicator for partner */}
                  {partner && !isSystemMessage && (
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        partner.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                        partner.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {partner.role?.charAt(0).toUpperCase() + partner.role?.slice(1) || 'Employee'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationList;
