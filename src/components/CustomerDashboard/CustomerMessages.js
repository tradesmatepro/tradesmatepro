// Customer Messages - Customer ↔ Contractor communication (separate from internal messages)
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  ClockIcon,
  CheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const CustomerMessages = ({ messages, customers, onRefresh }) => {
  const { user } = useUser();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [customerWorkOrders, setCustomerWorkOrders] = useState([]);
  const messagesEndRef = useRef(null);

  // Group messages by customer
  const messagesByCustomer = messages.reduce((acc, message) => {
    const customerId = message.customer_id;
    if (!acc[customerId]) {
      acc[customerId] = [];
    }
    acc[customerId].push(message);
    return acc;
  }, {});

  // Get customer conversations with unread counts
  const customerConversations = customers.map(customer => {
    const customerMessages = messagesByCustomer[customer.id] || [];
    const unreadCount = customerMessages.filter(m =>
      !m.read_at && m.sender_type === 'customer'
    ).length;
    const lastMessage = customerMessages.sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    )[0];

    return {
      ...customer,
      messages: customerMessages,
      unreadCount,
      lastMessage,
      lastActivity: lastMessage ? new Date(lastMessage.created_at) : new Date(customer.updated_at)
    };
  }).filter(customer => customer.messages.length > 0)
    .sort((a, b) => b.lastActivity - a.lastActivity);

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerWorkOrders(selectedCustomer.id);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedCustomer, messagesByCustomer]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadCustomerWorkOrders = async (customerId) => {
    try {
      const response = await supaFetch(
        `work_orders?select=work_order_id,title,stage,quote_status,job_status,work_status&customer_id=eq.${customerId}&order=created_at.desc`,
        { method: 'GET' },
        user.company_id
      );

      if (response.ok) {
        const workOrders = await response.json();
        setCustomerWorkOrders(workOrders);

        // Auto-select the most recent work order if none selected
        if (!selectedWorkOrder && workOrders.length > 0) {
          setSelectedWorkOrder(workOrders[0]);
        }
      }
    } catch (error) {
      console.error('Error loading customer work orders:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedCustomer || sending) return;

    try {
      setSending(true);

      const messageData = {
        company_id: user.company_id,
        customer_id: selectedCustomer.id,
        work_order_id: selectedWorkOrder?.work_order_id || null,
        sender_type: 'contractor',
        sender_id: user.id,
        message_text: messageText.trim()
      };

      const response = await supaFetch('customer_messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      }, user.company_id);

      if (response.ok) {
        setMessageText('');
        onRefresh();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await supaFetch(`customer_messages?id=eq.${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read_at: new Date().toISOString() })
      }, user.company_id);

      onRefresh();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const formatTime = (dateString) => {
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

  const CustomerList = () => (
    <div className="w-1/3 border-r border-gray-200 bg-gray-50">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Customer Conversations</h3>
      </div>
      <div className="overflow-y-auto h-96">
        {customerConversations.length > 0 ? (
          customerConversations.map((customer) => (
            <div
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
                selectedCustomer?.id === customer.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    {customer.lastMessage && (
                      <p className="text-sm text-gray-500 truncate max-w-32">
                        {customer.lastMessage.sender_type === 'customer' ? 'Customer: ' : 'You: '}
                        {customer.lastMessage.message_text}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {customer.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {customer.unreadCount}
                    </span>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTime(customer.lastActivity)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No customer conversations yet</p>
          </div>
        )}
      </div>
    </div>
  );

  const MessageThread = () => {
    if (!selectedCustomer) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Select a customer to view messages</p>
          </div>
        </div>
      );
    }

    const customerMessages = selectedCustomer.messages.sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );

    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{selectedCustomer.name}</h3>
              <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
            </div>
            
            {/* Work Order Selector */}
            {customerWorkOrders.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Related to:
                </label>
                <select
                  value={selectedWorkOrder?.work_order_id || ''}
                  onChange={(e) => {
                    const workOrder = customerWorkOrders.find(wo => wo.work_order_id === e.target.value);
                    setSelectedWorkOrder(workOrder);
                  }}
                  className="text-sm border-gray-300 rounded-md"
                >
                  <option value="">General conversation</option>
                  {customerWorkOrders.map((wo) => (
                    <option key={wo.work_order_id} value={wo.work_order_id}>
                      {wo.title || `${wo.stage} #${wo.work_order_id.slice(-8)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {customerMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_type === 'contractor' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_type === 'contractor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.message_text}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs ${
                    message.sender_type === 'contractor' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.created_at)}
                  </span>
                  {message.sender_type === 'contractor' && (
                    <CheckIcon className={`h-3 w-3 ${
                      message.read_at ? 'text-blue-200' : 'text-blue-300'
                    }`} />
                  )}
                  {message.sender_type === 'customer' && !message.read_at && (
                    <button
                      onClick={() => markAsRead(message.id)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex space-x-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!messageText.trim() || sending}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow h-96 flex">
      <CustomerList />
      <MessageThread />
    </div>
  );
};

export default CustomerMessages;
