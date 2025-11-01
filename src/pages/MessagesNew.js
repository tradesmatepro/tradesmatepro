import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../utils/supabaseClient';
import PageHeader from '../components/Common/PageHeader';
import {
  ChatBubbleLeftRightIcon,
  UserIcon,
  ClockIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Messages = () => {
  const { user } = useUser();
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.id && user?.company_id) {
      loadWorkOrdersWithMessages();
    }
  }, [user]);

  const loadWorkOrdersWithMessages = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading work orders for company:', user.company_id);

      const { data: workOrdersData, error: woError } = await supabase
        .from('work_orders')
        .select('id, work_order_number, title, customer_id, status, created_at, customers(id, name, email, phone)')
        .eq('company_id', user.company_id)
        .order('created_at', { ascending: false });

      if (woError) throw woError;

      console.log('✅ Loaded work orders:', workOrdersData?.length);
      setWorkOrders(workOrdersData || []);

      if (workOrdersData && workOrdersData.length > 0) {
        await loadMessagesForWorkOrder(workOrdersData[0].id);
        setSelectedWorkOrder(workOrdersData[0]);
      }
    } catch (error) {
      console.error('❌ Error loading work orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessagesForWorkOrder = async (workOrderId) => {
    try {
      console.log('💬 Loading messages for work order:', workOrderId);

      const { data: messagesData, error: msgError } = await supabase.rpc(
        'get_work_order_messages',
        {
          p_work_order_id: workOrderId,
          p_company_id: user.company_id
        }
      );

      if (msgError) throw msgError;

      console.log('✅ Loaded messages:', messagesData?.length || 0);
      setMessages(messagesData || []);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setMessages([]);
    }
  };

  const handleSelectWorkOrder = async (workOrder) => {
    setSelectedWorkOrder(workOrder);
    await loadMessagesForWorkOrder(workOrder.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedWorkOrder) return;

    try {
      setSending(true);
      console.log('📤 Sending message...');

      const { data, error } = await supabase.rpc('send_customer_message', {
        p_company_id: user.company_id,
        p_sender_id: user.id,
        p_sender_type: 'contractor',
        p_customer_id: selectedWorkOrder.customer_id,
        p_content: newMessage.trim(),
        p_work_order_id: selectedWorkOrder.id,
        p_delivery_method: 'in_app'
      });

      if (error) throw error;

      console.log('✅ Message sent:', data);
      setNewMessage('');
      await loadMessagesForWorkOrder(selectedWorkOrder.id);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredWorkOrders = workOrders.filter(wo =>
    wo.work_order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        subtitle="Customer communications for your work orders"
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Work Orders List */}
          <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Work Orders</h3>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search work orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredWorkOrders.length === 0 ? (
                <div className="p-8 text-center">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No work orders found</p>
                </div>
              ) : (
                filteredWorkOrders.map((wo) => (
                  <div
                    key={wo.id}
                    onClick={() => handleSelectWorkOrder(wo)}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedWorkOrder?.id === wo.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{wo.work_order_number}</p>
                        <p className="text-sm text-gray-600 truncate">{wo.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{wo.customers?.name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        wo.status === 'completed' ? 'bg-green-100 text-green-800' :
                        wo.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {wo.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Thread */}
          <div className="w-2/3 bg-white flex flex-col">
            {selectedWorkOrder ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">{selectedWorkOrder.customers?.name}</h3>
                  <p className="text-sm text-gray-600">{selectedWorkOrder.work_order_number} - {selectedWorkOrder.title}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No messages yet</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_type === 'contractor' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender_type === 'contractor'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <div className={`flex items-center justify-between mt-1 text-xs ${
                            msg.sender_type === 'contractor' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span>{msg.sender_name}</span>
                            <span className="ml-2">{formatTime(msg.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <PaperAirplaneIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a work order to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;

