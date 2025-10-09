import React, { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon,
  UserIcon,
  BellIcon,
  CheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ChatView = ({ 
  conversation, 
  messages, 
  users, 
  currentUser, 
  onSendMessage, 
  loading 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get user info by ID
  const getUserById = (userId) => {
    return users.find(user => user.id === userId);
  };

  // Get conversation partner
  const getConversationPartner = () => {
    const partnerId = conversation.participants.find(id => id !== currentUser.id);
    return getUserById(partnerId);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'read':
        return <CheckCircleIcon className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <CheckIcon className="w-4 h-4 text-gray-500" />;
      case 'sent':
      default:
        return <CheckIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const partner = getConversationPartner();
    if (!partner) return;

    setSending(true);
    
    try {
      await onSendMessage(partner.id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Handle key press in textarea
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const partner = getConversationPartner();

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          {/* Partner Avatar */}
          <div className="flex-shrink-0">
            {partner ? (
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {partner.full_name?.charAt(0) || 'U'}
                </span>
              </div>
            ) : (
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BellIcon className="w-5 h-5 text-blue-600" />
              </div>
            )}
          </div>

          {/* Partner Info */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {partner?.full_name || 'System Notifications'}
            </h2>
            {partner && (
              <p className="text-sm text-gray-600">
                {partner.role?.charAt(0).toUpperCase() + partner.role?.slice(1) || 'Employee'} • {partner.email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600">Start the conversation by sending a message</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUser.id;
            const sender = getUserById(message.sender_id);
            const isSystemMessage = message.message_type === 'system';

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                  {/* System Message */}
                  {isSystemMessage ? (
                    <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mx-auto">
                      <div className="flex items-center space-x-2 mb-2">
                        <BellIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">System Notification</span>
                      </div>
                      <p className="text-sm text-blue-800">{message.message}</p>
                      <p className="text-xs text-blue-600 mt-2">
                        {formatTimestamp(message.sent_at)}
                      </p>
                    </div>
                  ) : (
                    /* Regular Message */
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      {/* Sender name for received messages */}
                      {!isOwnMessage && (
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {sender?.full_name || 'Unknown User'}
                        </p>
                      )}
                      
                      {/* Message content */}
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      
                      {/* Timestamp and status */}
                      <div className={`flex items-center justify-between mt-2 ${
                        isOwnMessage ? 'text-primary-200' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">
                          {formatTimestamp(message.sent_at)}
                        </span>
                        {isOwnMessage && (
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(message.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar for received messages */}
                {!isOwnMessage && !isSystemMessage && (
                  <div className={`flex-shrink-0 ${isOwnMessage ? 'order-2 ml-2' : 'order-1 mr-2'}`}>
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {sender?.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {partner && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${partner.full_name}...`}
                rows={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                disabled={sending}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <PaperAirplaneIcon className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatView;
