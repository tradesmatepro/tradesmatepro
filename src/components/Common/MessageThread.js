import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import MessagingService from '../../services/MessagingService';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const MessageThread = ({ contextType, contextId, title }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user?.id && contextId) {
      loadMessages();
    }
  }, [user, contextId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messageData = await MessagingService.getMessagesForContext(
        contextType,
        contextId,
        user.id
      );
      setMessages(messageData);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      
      let recipientInfo;
      if (contextType === 'request') {
        recipientInfo = await MessagingService.getCustomerForRequest(contextId);
        await MessagingService.sendMessageInRequest(
          contextId,
          null, // response_id can be null for contractor messages
          user.id,
          recipientInfo.customer_id,
          newMessage.trim()
        );
      } else if (contextType === 'job') {
        recipientInfo = await MessagingService.getCustomerForJob(contextId);
        await MessagingService.sendMessageInJob(
          contextId,
          user.id,
          recipientInfo.customer_id,
          newMessage.trim()
        );
      }

      setNewMessage('');
      await loadMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Messages</h3>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Messages</h3>
          </div>
          <span className="text-sm text-gray-500">{title}</span>
        </div>
      </div>

      <div className="p-4">
        {/* Messages */}
        <div className="space-y-4 mb-6" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No messages yet</p>
              <p className="text-sm text-gray-500 mt-1">Start a conversation with the customer</p>
            </div>
          ) : (
            messages.map((message) => {
              const isFromContractor = message.sender_id === user.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isFromContractor ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isFromContractor 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.message_text}</p>
                    <div className={`flex items-center justify-between mt-1 text-xs ${
                      isFromContractor ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span className="flex items-center">
                        {isFromContractor ? (
                          <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <UserCircleIcon className="h-3 w-3 mr-1" />
                        )}
                        {isFromContractor ? 'You' : 'Customer'}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Send Message Form */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 pt-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageThread;
