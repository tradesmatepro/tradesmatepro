// Customer Overview - Dashboard summary with key metrics and recent activity
import React from 'react';
import {
  UserGroupIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  InboxIcon,
  ChatBubbleLeftRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const CustomerOverview = ({ data, onRefresh, onTabChange }) => {
  const { stats, quotes, jobs, invoices, messages } = data;

  // Calculate trends (mock data for now - would come from historical data)
  const trends = {
    customers: { value: 12, direction: 'up' },
    quotes: { value: 8, direction: 'up' },
    jobs: { value: 3, direction: 'down' },
    revenue: { value: 15, direction: 'up' }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue', onClick }) => (
    <div 
      className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow ${onClick ? 'hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <div className={`ml-2 flex items-center text-sm ${
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.direction === 'up' ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
                <span className="ml-1">{trend.value}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const RecentActivityItem = ({ type, title, subtitle, time, status, onClick }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'urgent': return 'text-red-600 bg-red-100';
        case 'pending': return 'text-yellow-600 bg-yellow-100';
        case 'completed': return 'text-green-600 bg-green-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    const getTypeIcon = (type) => {
      switch (type) {
        case 'quote': return DocumentTextIcon;
        case 'job': return WrenchScrewdriverIcon;
        case 'invoice': return CurrencyDollarIcon;
        case 'lead': return InboxIcon;
        case 'message': return ChatBubbleLeftRightIcon;
        default: return ClockIcon;
      }
    };

    const Icon = getTypeIcon(type);

    return (
      <div 
        className="flex items-center p-4 hover:bg-gray-50 cursor-pointer rounded-lg"
        onClick={onClick}
      >
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          <p className="text-sm text-gray-500 truncate">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-2">
          {status && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
              {status}
            </span>
          )}
          <span className="text-xs text-gray-400">{time}</span>
        </div>
      </div>
    );
  };

  // Format recent activity from all data sources
  const recentActivity = [
    ...(quotes || []).slice(0, 3).map(quote => ({
      type: 'quote',
      title: `Quote #${quote.quote_number || quote.work_order_id?.slice(-8)}`,
      subtitle: quote.customers?.name || 'Unknown Customer',
      time: new Date(quote.created_at).toLocaleDateString(),
      status: quote.quote_status === 'SENT' ? 'pending' : quote.quote_status?.toLowerCase(),
      onClick: () => onTabChange('quotes')
    })),
    ...(jobs || []).slice(0, 3).map(job => ({
      type: 'job',
      title: job.title || `Job #${job.job_number || job.work_order_id?.slice(-8)}`,
      subtitle: job.customers?.name || 'Unknown Customer',
      time: new Date(job.created_at).toLocaleDateString(),
      status: job.job_status === 'IN_PROGRESS' ? 'urgent' : job.job_status?.toLowerCase(),
      onClick: () => onTabChange('jobs')
    }))
    // Note: Service requests moved to Marketplace - no longer shown in Customer Dashboard
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers || 0}
            icon={UserGroupIcon}
            trend={trends.customers}
            color="blue"
          />
          <StatCard
            title="Active Quotes"
            value={stats.activeQuotes || 0}
            icon={DocumentTextIcon}
            trend={trends.quotes}
            color="green"
            onClick={() => onTabChange('quotes')}
          />
          <StatCard
            title="Active Jobs"
            value={stats.activeJobs || 0}
            icon={WrenchScrewdriverIcon}
            trend={trends.jobs}
            color="purple"
            onClick={() => onTabChange('jobs')}
          />
          <StatCard
            title="Unpaid Invoices"
            value={stats.unpaidInvoices || 0}
            icon={CurrencyDollarIcon}
            color="red"
            onClick={() => onTabChange('invoices')}
          />
        </div>
      </div>

      {/* Action Items */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Action Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Open Leads */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <InboxIcon className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Open Leads</h3>
                <p className="text-3xl font-bold text-orange-600">{stats.openLeads || 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => onTabChange('leads')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Review leads →
              </button>
            </div>
          </div>

          {/* Unread Messages */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Unread Messages</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.unreadMessages || 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => onTabChange('messages')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View messages →
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => onTabChange('quotes')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                Create New Quote
              </button>
              <button
                onClick={() => onTabChange('jobs')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                Schedule Job
              </button>
              <button
                onClick={() => onTabChange('invoices')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                Send Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <button
            onClick={onRefresh}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
        <div className="bg-white rounded-lg shadow">
          {recentActivity.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentActivity.map((item, index) => (
                <RecentActivityItem key={index} {...item} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerOverview;
