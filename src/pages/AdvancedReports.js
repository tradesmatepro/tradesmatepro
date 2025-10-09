import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { VendorsService } from '../services/VendorsService';
import { PurchaseOrdersService } from '../services/PurchaseOrdersService';
import PageHeader from '../components/Common/PageHeader';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const AdvancedReports = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [analytics, setAnalytics] = useState(null);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    if (user?.company_id) {
      loadAnalytics();
    }
  }, [user?.company_id, dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsData, vendorsData] = await Promise.all([
        PurchaseOrdersService.getSpendAnalytics(user.company_id, dateRange),
        VendorsService.list(user.company_id)
      ]);
      
      setAnalytics(analyticsData);
      setVendors(vendorsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopVendors = () => {
    if (!analytics?.byVendor || !vendors.length) return [];
    
    return Object.entries(analytics.byVendor)
      .map(([vendorId, spend]) => {
        const vendor = vendors.find(v => v.id === vendorId);
        return vendor ? { ...vendor, spend: Number(spend) } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);
  };

  const getSpendByCategory = () => {
    // Placeholder data - in full implementation would categorize by vendor types
    return [
      { category: 'Materials', amount: analytics?.totalSpend * 0.4 || 0, color: 'bg-blue-500' },
      { category: 'Equipment', amount: analytics?.totalSpend * 0.3 || 0, color: 'bg-green-500' },
      { category: 'Services', amount: analytics?.totalSpend * 0.2 || 0, color: 'bg-yellow-500' },
      { category: 'Other', amount: analytics?.totalSpend * 0.1 || 0, color: 'bg-gray-500' }
    ];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Advanced Reports & Analytics" 
        subtitle="Vendor performance, spend analysis, and procurement insights"
      />

      {/* Date Range Selector */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Report Period</h3>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Spend</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(analytics?.totalSpend)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentChartBarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Purchase Orders</dt>
                      <dd className="text-lg font-medium text-gray-900">{analytics?.orderCount || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg Order Value</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(analytics?.avgOrderValue)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Vendors</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {vendors.filter(v => v.status === 'ACTIVE').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Vendors */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Vendors by Spend</h3>
              <div className="space-y-4">
                {getTopVendors().map((vendor, index) => (
                  <div key={vendor.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                          {vendor.name?.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                        <div className="text-sm text-gray-500">{vendor.total_orders || 0} orders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(vendor.spend)}
                      </div>
                      <div className="text-sm text-gray-500">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spend by Category */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Spend by Category</h3>
              <div className="space-y-4">
                {getSpendByCategory().map((category) => (
                  <div key={category.category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{category.category}</span>
                      <span className="text-sm text-gray-500">{formatCurrency(category.amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${category.color} h-2 rounded-full`}
                        style={{ 
                          width: `${analytics?.totalSpend ? (category.amount / analytics.totalSpend) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Orders by Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics?.byStatus || {}).map(([status, amount]) => (
                  <div key={status} className="text-center">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(amount)}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {status.toLowerCase().replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coming Soon Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-2" />
                <h3 className="text-lg font-medium text-yellow-800">Advanced Analytics</h3>
              </div>
              <div className="space-y-2 text-sm text-yellow-700">
                <p>• Trend analysis and forecasting</p>
                <p>• Vendor performance benchmarking</p>
                <p>• Cost savings opportunities</p>
                <p>• Budget variance analysis</p>
                <p>• Seasonal spending patterns</p>
              </div>
              <p className="text-xs text-yellow-600 mt-4">Coming Soon</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-blue-800">Accounting Integration</h3>
              </div>
              <div className="space-y-2 text-sm text-blue-700">
                <p>• QuickBooks sync</p>
                <p>• Automated GL coding</p>
                <p>• AP/AR reconciliation</p>
                <p>• Tax reporting</p>
                <p>• Financial statement integration</p>
              </div>
              <p className="text-xs text-blue-600 mt-4">Coming Soon</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedReports;
