// Portal Messages Component - Customer-contractor communication
import React, { useState, useRef, useEffect } from 'react';
import { useCustomerPortal } from '../../contexts/CustomerPortalContext';
import CustomerPortalService from '../../services/CustomerPortalService';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const PortalMessages = ({ messages, onRefresh }) => {
  const { customer, sessionToken } = useCustomerPortal();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  // Group messages by conversation (work_order_id or service_request_id)
  const conversations = messages.reduce((acc, message) => {
    const key = message.work_order_id || message.service_request_id || 'general';
    if (!acc[key]) {
      acc[key] = {
        id: key,
        type: message.work_order_id ? 'work_order' : message.service_request_id ? 'service_request' : 'general',
        title: message.work_order_id ? `Job #${message.work_order_id.slice(-8)}` : 
               message.service_request_id ? `Service Request #${message.service_request_id.slice(-8)}` : 
               'General Messages',
        messages: [],
        lastMessage: null,
        unreadCount: 0
      };
    }
    acc[key].messages.push(message);
    if (!message.read_at) {
      acc[key].unreadCount++;
    }
    return acc;
  }, {});

  // Sort conversations by last message date
  const sortedConversations = Object.values(conversations).map(conv => {
    conv.lastMessage = conv.messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return conv;
  }).sort((a, b) => new Date(b.lastMessage?.created_at || 0) - new Date(a.lastMessage?.created_at || 0));

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const messageData = {
        content: newMessage.trim(),
        customer_id: customer.customer_id,
        message_type: 'customer_to_company'
      };

      if (selectedConversation.type === 'work_order') {
        messageData.work_order_id = selectedConversation.id;
      } else if (selectedConversation.type === 'service_request') {
        messageData.service_request_id = selectedConversation.id;
      }

      await CustomerPortalService.sendMessage(messageData, sessionToken);
      setNewMessage('');
      onRefresh();

      // Refresh the selected conversation
      const updatedMessages = await CustomerPortalService.getCustomerMessages(
        sessionToken,
        selectedConversation.id,
        selectedConversation.type
      );
      // Update local state would go here
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const ConversationList = () => (
    <div className="w-full md:w-1/3 border-r border-gray-200 bg-white">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Conversations</h3>
      </div>
      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 300px)' }}>
        {sortedConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <ChatBubbleLeftRightIcon className="mx-auto h-8 w-8 mb-2" />
            <p className="text-sm">No messages yet</p>
          </div>
        ) : (
          sortedConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {conversation.type === 'work_order' ? (
                      <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />
                    ) : (
                      <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-600" />
                    )}
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title}
                    </p>
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conversation.lastMessage.content}
                    </p>
                  )}
                  {conversation.lastMessage && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conversation.lastMessage.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  const MessageThread = ({ conversation }) => {
    const sortedMessages = conversation.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            {conversation.type === 'work_order' ? (
              <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
            ) : (
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600" />
            )}
            <h3 className="text-lg font-medium text-gray-900">{conversation.title}</h3>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100vh - 400px)' }}>
          {sortedMessages.map((message) => {
            const isFromCustomer = message.message_type === 'customer_to_company' || message.portal_customer_id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isFromCustomer ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isFromCustomer 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center justify-between mt-1 text-xs ${
                    isFromCustomer ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <span className="flex items-center">
                      {isFromCustomer ? (
                        <UserIcon className="h-3 w-3 mr-1" />
                      ) : (
                        <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                      )}
                      {isFromCustomer ? 'You' : 'Support'}
                    </span>
                    <span className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <PaperAirplaneIcon className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        <p className="text-sm text-gray-600">
          {messages.filter(m => !m.read_at).length} unread messages
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex h-96 md:h-[600px]">
          <ConversationList />
          
          {selectedConversation ? (
            <MessageThread conversation={selectedConversation} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select a conversation</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a conversation from the list to view messages.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortalMessages;
