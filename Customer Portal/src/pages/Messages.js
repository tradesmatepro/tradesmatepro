import React, { useState, useEffect, useContext } from 'react';
import { CustomerContext } from '../contexts/CustomerContext';
import MessagingService from '../services/MessagingService';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Messages = () => {
  const { customer } = useContext(CustomerContext);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (customer?.customer_id) {
      loadMessageThreads();
    }
  }, [customer]);

  const loadMessageThreads = async () => {
    try {
      setLoading(true);
      const threadData = await MessagingService.getMessageThreads(customer.customer_id);
      setThreads(threadData);
    } catch (error) {
      console.error('Error loading message threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread || sending) return;

    try {
      setSending(true);

      let recipientInfo;
      if (selectedThread.type === 'request') {
        recipientInfo = await MessagingService.getContractorForRequest(selectedThread.context_id);
        await MessagingService.sendMessageInRequest(
          selectedThread.context_id,
          recipientInfo.response_id,
          customer.customer_id,
          recipientInfo.contractor_id,
          newMessage.trim()
        );
      } else if (selectedThread.type === 'job') {
        recipientInfo = await MessagingService.getContractorForJob(selectedThread.context_id);
        await MessagingService.sendMessageInJob(
          selectedThread.context_id,
          customer.customer_id,
          recipientInfo.contractor_id,
          newMessage.trim()
        );
      }

      setNewMessage('');
      await loadMessageThreads(); // Refresh threads to show new message

      // Update selected thread with new messages
      const updatedMessages = await MessagingService.getMessagesForContext(
        selectedThread.type,
        selectedThread.context_id,
        customer.customer_id
      );
      setSelectedThread(prev => ({
        ...prev,
        messages: updatedMessages
      }));
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">
            Communicate with contractors about your requests and jobs
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex h-96 md:h-[600px]">
            {/* Thread List */}
            <div className="w-full md:w-1/3 border-r border-gray-200 bg-white">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Conversations</h3>
              </div>
              <div className="overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
                {threads.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <ChatBubbleLeftRightIcon className="mx-auto h-8 w-8 mb-2" />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs mt-1">Messages will appear when you communicate with contractors</p>
                  </div>
                ) : (
                  threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 ${
                        selectedThread?.id === thread.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            {thread.type === 'job' ? (
                              <WrenchScrewdriverIcon className="h-4 w-4 text-blue-600" />
                            ) : (
                              <ClipboardDocumentListIcon className="h-4 w-4 text-green-600" />
                            )}
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {thread.title}
                            </p>
                          </div>
                          {thread.lastMessage && (
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {thread.lastMessage.message_text}
                            </p>
                          )}
                          {thread.lastMessage && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(thread.lastMessage.created_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Message Thread */}
            {selectedThread ? (
              <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center space-x-2">
                    {selectedThread.type === 'job' ? (
                      <WrenchScrewdriverIcon className="h-5 w-5 text-blue-600" />
                    ) : (
                      <ClipboardDocumentListIcon className="h-5 w-5 text-green-600" />
                    )}
                    <h3 className="text-lg font-medium text-gray-900">{selectedThread.title}</h3>
                  </div>
                  {selectedThread.description && (
                    <p className="text-sm text-gray-600 mt-1">{selectedThread.description}</p>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 140px)' }}>
                  {selectedThread.messages.map((message) => {
                    const isFromCustomer = message.sender_id === customer.customer_id;

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
                          <p className="text-sm">{message.message_text}</p>
                          <div className={`flex items-center justify-between mt-1 text-xs ${
                            isFromCustomer ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span className="flex items-center">
                              {isFromCustomer ? (
                                <UserCircleIcon className="h-3 w-3 mr-1" />
                              ) : (
                                <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                              )}
                              {isFromCustomer ? 'You' : 'Contractor'}
                            </span>
                            <span className="flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Send Message Form */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
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
                  </form>
                </div>
              </div>
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

        {/* Info Banner */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Context-Based Messaging</h4>
              <p className="text-sm text-blue-700 mt-1">
                Messages are organized by your service requests and jobs. You can only message contractors
                who have responded to your requests or are assigned to your jobs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
