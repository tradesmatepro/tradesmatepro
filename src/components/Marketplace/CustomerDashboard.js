import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import {
  PlusIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const CustomerDashboard = ({ onPostRequest, onPostMultiRoleRequest, onTabChange }) => {
  // Debug: Log props to verify onTabChange is passed correctly
  console.log('CustomerDashboard props:', { onPostRequest: !!onPostRequest, onPostMultiRoleRequest: !!onPostMultiRoleRequest, onTabChange: !!onTabChange, onTabChangeType: typeof onTabChange });
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState({
    upcomingJobs: [],
    pendingQuotes: [],
    outstandingInvoices: [],
    recentMessages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load upcoming jobs (work orders for this customer)
      // Note: work_orders table uses customer_id, not customer_company_id
      const jobsResponse = await supaFetch(
        `work_orders?customer_id=eq.${user.company_id}&status=in.(scheduled,in_progress)&order=created_at.desc&limit=5`,
        { method: 'GET' }
      );
      const jobs = jobsResponse.ok ? await jobsResponse.json() : [];

      // Load pending quotes (marketplace responses to customer's requests)
      // Fixed: Using correct PostgREST join syntax based on foreign key constraints
      // marketplace_responses.request_id -> marketplace_requests.id (marketplace_responses_request_id_fkey)
      const quotesResponse = await supaFetch(
        `marketplace_responses?select=*,marketplace_requests!marketplace_responses_request_id_fkey(*)&marketplace_requests.company_id=eq.${user.company_id}&response_status=in.(INTERESTED,PENDING_QUOTE,OFFERED)&order=created_at.desc&limit=5`,
        { method: 'GET' }
      );
      const quotes = quotesResponse.ok ? await quotesResponse.json() : [];

      // Load outstanding invoices
      // Note: invoices table uses customer_id, not customer_company_id
      const invoicesResponse = await supaFetch(
        `invoices?customer_id=eq.${user.company_id}&status=in.(sent,overdue)&order=created_at.desc&limit=5`,
        { method: 'GET' }
      );
      const invoices = invoicesResponse.ok ? await invoicesResponse.json() : [];

      // Load recent messages - using messages table since marketplace_messages may not exist
      const messagesResponse = await supaFetch(
        `messages?company_id=eq.${user.company_id}&order=created_at.desc&limit=5`,
        { method: 'GET' }
      );
      const messages = messagesResponse.ok ? await messagesResponse.json() : [];

      setDashboardData({
        upcomingJobs: jobs,
        pendingQuotes: quotes,
        outstandingInvoices: invoices,
        recentMessages: messages
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Primary CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Overview of your service requests and projects</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onPostRequest}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            ✨ Simple Request
          </button>

          {onPostMultiRoleRequest && (
            <button
              onClick={onPostMultiRoleRequest}
              className="inline-flex items-center px-6 py-3 border border-emerald-600 rounded-xl shadow-lg text-sm font-bold text-emerald-600 bg-white hover:bg-emerald-50 transform hover:scale-105 transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              🎯 Multi-Role Request
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Upcoming Jobs */}
        <div
          className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={(e) => {
            e.preventDefault();
            console.log('Dashboard card clicked: jobs');
            if (typeof onTabChange === 'function') {
              onTabChange('jobs');
            } else {
              console.error('onTabChange is not a function:', onTabChange);
            }
          }}
        >
          <div className="flex items-center">
            <CalendarDaysIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.upcomingJobs.length}</p>
            </div>
          </div>
        </div>

        {/* Pending Quotes */}
        <div
          className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={(e) => {
            e.preventDefault();
            console.log('Dashboard card clicked: quotes');
            if (typeof onTabChange === 'function') {
              onTabChange('quotes');
            } else {
              console.error('onTabChange is not a function:', onTabChange);
            }
          }}
        >
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Quotes</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.pendingQuotes.length}</p>
            </div>
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div
          className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={(e) => {
            e.preventDefault();
            console.log('Dashboard card clicked: invoices');
            if (typeof onTabChange === 'function') {
              onTabChange('invoices');
            } else {
              console.error('onTabChange is not a function:', onTabChange);
            }
          }}
        >
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Outstanding Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.outstandingInvoices.length}</p>
            </div>
          </div>
        </div>

        {/* Recent Messages */}
        <div
          className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={(e) => {
            e.preventDefault();
            console.log('Dashboard card clicked: messages');
            if (typeof onTabChange === 'function') {
              onTabChange('messages');
            } else {
              console.error('onTabChange is not a function:', onTabChange);
            }
          }}
        >
          <div className="flex items-center">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Messages</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.recentMessages.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Jobs List */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Jobs</h3>
          {dashboardData.upcomingJobs.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming jobs scheduled</p>
          ) : (
            <div className="space-y-3">
              {dashboardData.upcomingJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-gray-900">{job.description}</p>
                    <p className="text-sm text-gray-500">
                      {job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Quotes List */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Quotes</h3>
          {dashboardData.pendingQuotes.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending quotes</p>
          ) : (
            <div className="space-y-3">
              {dashboardData.pendingQuotes.map((quote) => (
                <div key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-gray-900">{quote.marketplace_request?.title}</p>
                    <p className="text-sm text-gray-500">
                      ${quote.quoted_price?.toLocaleString()} - {quote.contractor_name}
                    </p>
                  </div>
                  <ClockIcon className="h-5 w-5 text-yellow-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
