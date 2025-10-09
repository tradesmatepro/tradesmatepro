// Employee PTO Dashboard - Self-service PTO interface for employees
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import PTOServiceProduction, { ACCRUAL_TYPES, PTO_STATUS } from '../../services/PTOServiceProduction';
import PTOBalanceCard from './PTOBalanceCard';
import PTORequestForm from './PTORequestForm';
import PTORequestHistory from './PTORequestHistory';
import {
  CalendarDaysIcon,
  ClockIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const EmployeePTODashboard = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [balance, setBalance] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    loadPTOData();
  }, [user]);

  const loadPTOData = async () => {
    try {
      setLoading(true);
      
      // Load balance and requests in parallel
      const [balanceData, requestsData] = await Promise.all([
        PTOServiceProduction.getEmployeeBalance(user.id),
        PTOServiceProduction.getRequests({ employee_id: user.id })
      ]);

      setBalance(balanceData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading PTO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (requestData) => {
    try {
      await PTOServiceProduction.createRequest(requestData);
      setShowRequestForm(false);
      loadPTOData(); // Refresh data
    } catch (error) {
      console.error('Error submitting PTO request:', error);
      throw error;
    }
  };

  const getUpcomingPTO = () => {
    const today = new Date();
    return requests.filter(request => 
      request.status === 'APPROVED' && 
      new Date(request.starts_at) >= today
    ).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  };

  const getPendingRequests = () => {
    return requests.filter(request => request.status === 'PENDING');
  };

  const getRecentActivity = () => {
    return requests
      .filter(request => {
        const requestDate = new Date(request.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return requestDate >= thirtyDaysAgo;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My PTO</h1>
          <p className="text-gray-600">Manage your time off requests and view balances</p>
        </div>
        <button
          onClick={() => setShowRequestForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Request Time Off
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'requests', name: 'My Requests', icon: CalendarDaysIcon },
            { id: 'history', name: 'History', icon: ClockIcon }
          ].map((tab) => (
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
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PTOBalanceCard
              title="Vacation"
              balance={balance?.vacation_balance || 0}
              maxBalance={balance?.max_vacation_hours}
              accrualRate={balance?.vacation_hours_per_period}
              accrualPeriod={balance?.accrual_period}
              type="vacation"
            />
            <PTOBalanceCard
              title="Sick Leave"
              balance={balance?.sick_balance || 0}
              maxBalance={balance?.max_sick_hours}
              accrualRate={balance?.sick_hours_per_period}
              accrualPeriod={balance?.accrual_period}
              type="sick"
            />
            <PTOBalanceCard
              title="Total Available"
              balance={(balance?.vacation_balance || 0) + (balance?.sick_balance || 0)}
              subtitle="Combined PTO"
              type="total"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Upcoming PTO */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Time Off</h3>
              {getUpcomingPTO().length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming time off scheduled</p>
              ) : (
                <div className="space-y-3">
                  {getUpcomingPTO().slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {PTOServiceProduction.getAccrualTypeLabel(request.accrual_type)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.starts_at).toLocaleDateString()} - {new Date(request.ends_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm text-gray-600">
                        {PTOServiceProduction.formatBalance(request.hours_approved)} hrs
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Requests */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Requests</h3>
              {getPendingRequests().length === 0 ? (
                <p className="text-gray-500 text-sm">No pending requests</p>
              ) : (
                <div className="space-y-3">
                  {getPendingRequests().slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {PTOServiceProduction.getAccrualTypeLabel(request.accrual_type)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.starts_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              {getRecentActivity().length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {getRecentActivity().map((request) => (
                    <div key={request.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {PTOServiceProduction.getStatusLabel(request.status)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        request.status === 'DENIED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {PTOServiceProduction.getStatusLabel(request.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Policy Information */}
          {balance && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Your PTO Policy</h3>
              <p className="text-blue-800 text-sm mb-4">{balance.policy_name}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-900">Vacation Accrual:</span>
                  <p className="text-blue-800">
                    {PTOServiceProduction.formatBalance(balance.vacation_hours_per_period)} hours per {balance.accrual_period}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-blue-900">Sick Leave Accrual:</span>
                  <p className="text-blue-800">
                    {PTOServiceProduction.formatBalance(balance.sick_hours_per_period)} hours per {balance.accrual_period}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-blue-900">Maximum Balances:</span>
                  <p className="text-blue-800">
                    Vacation: {PTOServiceProduction.formatBalance(balance.max_vacation_hours)} hrs, 
                    Sick: {PTOServiceProduction.formatBalance(balance.max_sick_hours)} hrs
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <PTORequestHistory 
          requests={requests.filter(r => ['PENDING', 'APPROVED'].includes(r.status))}
          showActions={true}
          title="Current Requests"
        />
      )}

      {activeTab === 'history' && (
        <PTORequestHistory 
          requests={requests}
          showActions={false}
          title="Request History"
        />
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
        <PTORequestForm
          onSubmit={handleRequestSubmit}
          onCancel={() => setShowRequestForm(false)}
          balance={balance}
        />
      )}
    </div>
  );
};

export default EmployeePTODashboard;
