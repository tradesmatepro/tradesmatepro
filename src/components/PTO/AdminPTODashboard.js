// Admin PTO Dashboard - Complete PTO management interface for administrators
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import PTOServiceProduction from '../../services/PTOServiceProduction';
import PTOAccrualEngine from '../../services/PTOAccrualEngine';
import PTOPolicyManager from './PTOPolicyManager';
import PTORequestApproval from './PTORequestApproval';
import PTOBalanceOverview from './PTOBalanceOverview';
import PTOReports from './PTOReports';
import {
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UsersIcon,
  PlayIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

const AdminPTODashboard = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    pendingRequests: [],
    allBalances: [],
    policies: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [accrualRunning, setAccrualRunning] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [requests, balances, policies] = await Promise.all([
        PTOServiceProduction.getRequests({ status: 'PENDING' }),
        PTOServiceProduction.getAllBalances(),
        PTOServiceProduction.getPolicies()
      ]);

      setDashboardData({
        pendingRequests: requests,
        allBalances: balances,
        policies,
        recentActivity: requests.slice(0, 10)
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAccrual = async () => {
    try {
      setAccrualRunning(true);
      const result = await PTOAccrualEngine.processAllAccruals();
      
      if (result.success) {
        alert(`Accrual processing completed! Processed ${result.processed_employees} employees.`);
        loadDashboardData(); // Refresh data
      } else {
        alert(`Accrual processing failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error running accrual:', error);
      alert('Failed to run accrual process');
    } finally {
      setAccrualRunning(false);
    }
  };

  const getQuickStats = () => {
    const { pendingRequests, allBalances } = dashboardData;
    
    return {
      pendingRequests: pendingRequests.length,
      totalEmployees: allBalances.length,
      totalVacationHours: allBalances.reduce((sum, b) => sum + (b.vacation_balance || 0), 0),
      totalSickHours: allBalances.reduce((sum, b) => sum + (b.sick_balance || 0), 0)
    };
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'requests', name: 'Requests', icon: ClipboardDocumentListIcon },
    { id: 'balances', name: 'Balances', icon: UsersIcon },
    { id: 'policies', name: 'Policies', icon: Cog6ToothIcon },
    { id: 'reports', name: 'Reports', icon: DocumentChartBarIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = getQuickStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PTO Administration</h1>
          <p className="text-gray-600">Manage employee time off policies, requests, and balances</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRunAccrual}
            disabled={accrualRunning}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            {accrualRunning ? 'Running...' : 'Run Accrual'}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardDocumentListIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Vacation Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {PTOServiceProduction.formatBalance(stats.totalVacationHours)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sick Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {PTOServiceProduction.formatBalance(stats.totalSickHours)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
              {tab.id === 'requests' && stats.pendingRequests > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {stats.pendingRequests}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {dashboardData.recentActivity.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No recent activity
                  </div>
                ) : (
                  dashboardData.recentActivity.map((request) => (
                    <div key={request.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {request.employee_name} requested {PTOServiceProduction.getAccrualTypeLabel(request.accrual_type)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(request.starts_at).toLocaleDateString()} - {new Date(request.ends_at).toLocaleDateString()}
                            <span className="mx-2">•</span>
                            {PTOServiceProduction.formatBalance(request.hours_requested)} hours
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {PTOServiceProduction.getStatusLabel(request.status)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Policy Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Active Policies</h3>
              </div>
              <div className="p-6">
                {dashboardData.policies.length === 0 ? (
                  <p className="text-gray-500">No policies configured</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardData.policies.map((policy) => (
                      <div key={policy.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">{policy.name}</h4>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>Vacation: {PTOServiceProduction.formatBalance(policy.vacation_hours_per_period)} hrs/{policy.accrual_period}</p>
                          <p>Sick: {PTOServiceProduction.formatBalance(policy.sick_hours_per_period)} hrs/{policy.accrual_period}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <PTORequestApproval 
            requests={dashboardData.pendingRequests}
            onRequestUpdate={loadDashboardData}
          />
        )}

        {activeTab === 'balances' && (
          <PTOBalanceOverview 
            balances={dashboardData.allBalances}
            onBalanceUpdate={loadDashboardData}
          />
        )}

        {activeTab === 'policies' && (
          <PTOPolicyManager 
            policies={dashboardData.policies}
            onPolicyUpdate={loadDashboardData}
          />
        )}

        {activeTab === 'reports' && (
          <PTOReports />
        )}
      </div>
    </div>
  );
};

export default AdminPTODashboard;
