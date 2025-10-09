// Customer Dashboard - Internal contractor view for managing customer relationships
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import CustomerOverview from '../components/CustomerDashboard/CustomerOverview';
import CustomerQuotes from '../components/CustomerDashboard/CustomerQuotes';
import CustomerJobs from '../components/CustomerDashboard/CustomerJobs';
import CustomerInvoices from '../components/CustomerDashboard/CustomerInvoices';
import CustomerMessages from '../components/CustomerDashboard/CustomerMessages';
import {
  UserGroupIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  InboxIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const CustomerDashboard = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    customers: [],
    quotes: [],
    jobs: [],
    invoices: [],
    serviceRequests: [],
    messages: [],
    stats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.company_id) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all customer-related data in parallel
      const [
        customersResponse,
        quotesResponse,
        jobsResponse,
        invoicesResponse,
        serviceRequestsResponse
      ] = await Promise.all([
        // Customers with recent activity (company_id filter handled by supaFetch)
        supaFetch('customers?select=*&order=created_at.desc&limit=50', { method: 'GET' }, user.company_id),

        // Recent quotes from work_orders - use status field for quotes
        supaFetch('work_orders?select=*,customers(name,email,phone)&status=in.(quote,sent,approved,rejected)&order=created_at.desc&limit=20', { method: 'GET' }, user.company_id),

        // Active jobs from work_orders - use status field for jobs
        supaFetch('work_orders?select=*,customers(name,email,phone)&status=in.(scheduled,in_progress,completed)&order=created_at.desc&limit=20', { method: 'GET' }, user.company_id),

        // Recent invoices
        supaFetch('invoices?select=*,customers(name,email,phone)&order=created_at.desc&limit=20', { method: 'GET' }, user.company_id)

        // Note: customer_messages table doesn't exist yet - using customer_communications instead
      ]);

      // Process responses
      const customers = customersResponse.ok ? await customersResponse.json() : [];
      const quotes = quotesResponse.ok ? await quotesResponse.json() : [];
      const jobs = jobsResponse.ok ? await jobsResponse.json() : [];
      const invoices = invoicesResponse.ok ? await invoicesResponse.json() : [];
      const messages = []; // customer_messages table doesn't exist yet

      // Calculate stats
      const stats = {
        totalCustomers: customers.length,
        activeQuotes: quotes.filter(q => q.quote_status === 'SENT' || q.quote_status === 'DRAFT').length,
        activeJobs: jobs.filter(j => j.job_status === 'IN_PROGRESS' || j.job_status === 'SCHEDULED').length,
        unpaidInvoices: invoices.filter(i => i.status !== 'PAID').length,
        unreadMessages: messages.filter(m => !m.read_at && m.sender_type === 'customer').length
      };

      setDashboardData({
        customers,
        quotes,
        jobs,
        invoices,
        messages,
        stats
      });

    } catch (error) {
      console.error('Error loading customer dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'quotes', name: 'Quotes', icon: DocumentTextIcon, count: dashboardData.stats.activeQuotes },
    { id: 'jobs', name: 'Jobs', icon: WrenchScrewdriverIcon, count: dashboardData.stats.activeJobs },
    { id: 'invoices', name: 'Invoices', icon: CurrencyDollarIcon, count: dashboardData.stats.unpaidInvoices },
    { id: 'messages', name: 'Messages', icon: ChatBubbleLeftRightIcon, count: dashboardData.stats.unreadMessages }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadDashboardData}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your customer relationships, quotes, jobs, and communications</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className="bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-medium">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <CustomerOverview 
            data={dashboardData} 
            onRefresh={loadDashboardData}
            onTabChange={setActiveTab}
          />
        )}
        {activeTab === 'quotes' && (
          <CustomerQuotes 
            quotes={dashboardData.quotes} 
            onRefresh={loadDashboardData}
          />
        )}
        {activeTab === 'jobs' && (
          <CustomerJobs 
            jobs={dashboardData.jobs} 
            onRefresh={loadDashboardData}
          />
        )}
        {activeTab === 'invoices' && (
          <CustomerInvoices 
            invoices={dashboardData.invoices} 
            onRefresh={loadDashboardData}
          />
        )}

        {activeTab === 'messages' && (
          <CustomerMessages 
            messages={dashboardData.messages} 
            customers={dashboardData.customers}
            onRefresh={loadDashboardData}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
