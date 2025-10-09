import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const CustomerMessages = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      // Load messages for this customer
      // Note: Using messages table since marketplace_messages may not exist
      const messagesResponse = await supaFetch(
        `messages?company_id=eq.${user.company_id}&order=created_at.desc`,
        { method: 'GET' }
      );
      const responseMessages = messagesResponse.ok ? await messagesResponse.json() : [];

      // For now, just use the main messages table
      // TODO: Implement proper marketplace messaging when marketplace_messages table is available
      const workOrderMessages = [];

      // Combine and sort messages
      const allMessages = [
        ...responseMessages.map(msg => ({ ...msg, type: 'marketplace' })),
        ...workOrderMessages.map(msg => ({ ...msg, type: 'work_order' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setMessages(allMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        <p className="text-gray-600 mt-1">Communication related to your quotes and jobs</p>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-600">
            Messages related to your quotes and jobs will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {message.type === 'marketplace' ? (
                    <BuildingOfficeIcon className="h-8 w-8 text-primary-500" />
                  ) : (
                    <UserIcon className="h-8 w-8 text-green-500" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {message.type === 'marketplace'
                        ? message.marketplace_request?.title || 'Marketplace Request'
                        : message.work_order?.description || 'Work Order'
                      }
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {new Date(message.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{message.message}</p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      From: {message.sender_name || 'Customer'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      message.type === 'marketplace'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {message.type === 'marketplace' ? 'Quote Discussion' : 'Job Communication'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerMessages;
