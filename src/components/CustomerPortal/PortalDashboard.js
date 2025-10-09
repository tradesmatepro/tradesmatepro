// Customer Portal Dashboard - Main hub for customer portal functionality
import React, { useState, useEffect } from 'react';
import { useCustomerPortal } from '../../contexts/CustomerPortalContext';
import CustomerPortalService from '../../services/CustomerPortalService';
import PortalQuotes from './PortalQuotes';
import PortalInvoices from './PortalInvoices';
import PortalJobs from './PortalJobs';
import PortalServiceRequests from './PortalServiceRequests';
import PortalMessages from './PortalMessages';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  PlusCircleIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const PortalDashboard = () => {
  const { customer, sessionToken, logout } = useCustomerPortal();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    quotes: [],
    invoices: [],
    jobs: [],
    serviceRequests: [],
    messages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customer?.customer_id) {
      loadDashboardData();
    }
  }, [customer]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [quotes, invoices, jobs, serviceRequests, messages] = await Promise.all([
        CustomerPortalService.getCustomerQuotes(customer.customer_id, sessionToken),
        CustomerPortalService.getCustomerInvoices(customer.customer_id, sessionToken),
        CustomerPortalService.getCustomerJobs(customer.customer_id, sessionToken),
        CustomerPortalService.getServiceRequests(sessionToken),
        CustomerPortalService.getCustomerMessages(sessionToken)
      ]);

      setDashboardData({
        quotes,
        invoices,
        jobs,
        serviceRequests,
        messages
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserCircleIcon },
    { id: 'quotes', name: 'My Quotes', icon: DocumentTextIcon, count: dashboardData.quotes.length },
    { id: 'jobs', name: 'My Jobs', icon: WrenchScrewdriverIcon, count: dashboardData.jobs.length },
    { id: 'invoices', name: 'My Invoices', icon: CurrencyDollarIcon, count: dashboardData.invoices.length },
    { id: 'service-requests', name: 'Service Requests', icon: PlusCircleIcon },
    { id: 'messages', name: 'Messages', icon: ChatBubbleLeftRightIcon, count: dashboardData.messages.length }
  ];

  const OverviewTab = () => {
    const pendingQuotes = dashboardData.quotes.filter(q => q.status === 'PENDING').length;
    const activeJobs = dashboardData.jobs.filter(j => j.status === 'IN_PROGRESS').length;
    const unpaidInvoices = dashboardData.invoices.filter(i => i.status !== 'PAID').length;
    const unreadMessages = dashboardData.messages.filter(m => !m.read_at).length;

    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
          <p className="text-blue-100">Here's what's happening with your account</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Quotes</p>
                <p className="text-2xl font-bold text-gray-900">{pendingQuotes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <WrenchScrewdriverIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{activeJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unpaid Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{unpaidInvoices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{unreadMessages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.quotes.slice(0, 3).map((quote) => (
                <div key={quote.id} className="flex items-center space-x-3">
                  <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Quote #{quote.quote_number} - {quote.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    quote.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    quote.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {quote.status}
                  </span>
                </div>
              ))}
              
              {dashboardData.jobs.slice(0, 2).map((job) => (
                <div key={job.id} className="flex items-center space-x-3">
                  <WrenchScrewdriverIcon className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Job: {job.title || 'Service Call'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Customer Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{customer?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-gray-500"
                  title="Sign out"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'quotes' && <PortalQuotes quotes={dashboardData.quotes} onRefresh={loadDashboardData} />}
        {activeTab === 'jobs' && <PortalJobs jobs={dashboardData.jobs} onRefresh={loadDashboardData} />}
        {activeTab === 'invoices' && <PortalInvoices invoices={dashboardData.invoices} onRefresh={loadDashboardData} />}
        {activeTab === 'service-requests' && <PortalServiceRequests onRefresh={loadDashboardData} />}
        {activeTab === 'messages' && <PortalMessages messages={dashboardData.messages} onRefresh={loadDashboardData} />}
      </main>
    </div>
  );
};

export default PortalDashboard;
