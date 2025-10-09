// Employee PTO Dashboard - FINAL SCHEMA COMPLIANT
// Works with: pto_current_balances, pto_ledger, employee_time_off, pto_policies
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import PTOServiceFinal from '../../services/PTOServiceFinal';
import {
  CalendarDaysIcon,
  ClockIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const EmployeePTODashboardFinal = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    loadPTOData();
  }, [user]);

  const loadPTOData = async () => {
    try {
      setLoading(true);
      
      // Load balance and history in parallel
      const [balanceData, historyData] = await Promise.all([
        PTOServiceFinal.getEmployeeBalance(user.id),
        PTOServiceFinal.getEmployeeHistory(user.id)
      ]);

      setBalance(balanceData);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading PTO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (requestData) => {
    try {
      await PTOServiceFinal.createRequest(requestData);
      setShowRequestForm(false);
      loadPTOData(); // Refresh data
    } catch (error) {
      console.error('Error submitting PTO request:', error);
      throw error;
    }
  };

  const getRecentRequests = () => {
    return history
      .filter(entry => entry.entry_type === 'deduction' && entry.related_request_id)
      .slice(0, 5);
  };

  const getUpcomingPTO = () => {
    // This would need to be fetched from employee_time_off table
    // For now, return empty array
    return [];
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vacation Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {PTOServiceFinal.formatBalance(balance?.vacation_balance || 0)} hrs
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sick Leave Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {PTOServiceFinal.formatBalance(balance?.sick_balance || 0)} hrs
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Personal Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {PTOServiceFinal.formatBalance(balance?.personal_balance || 0)} hrs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {getRecentRequests().length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No recent activity
                </div>
              ) : (
                getRecentRequests().map((entry) => (
                  <div key={entry.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {entry.description || `${entry.category_code} ${entry.entry_type}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(entry.effective_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {entry.hours > 0 ? '+' : ''}{PTOServiceFinal.formatBalance(entry.hours)} hrs
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">PTO History</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {history.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No PTO history available
              </div>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {entry.description || `${entry.category_code} ${entry.entry_type}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(entry.effective_date).toLocaleDateString()}
                        {entry.notes && ` • ${entry.notes}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${
                        entry.hours > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {entry.hours > 0 ? '+' : ''}{PTOServiceFinal.formatBalance(entry.hours)} hrs
                      </span>
                      <p className="text-xs text-gray-500">
                        Balance: {PTOServiceFinal.formatBalance(entry.balance_after)} hrs
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
        <PTORequestFormFinal
          onSubmit={handleRequestSubmit}
          onCancel={() => setShowRequestForm(false)}
          balance={balance}
        />
      )}
    </div>
  );
};

// Simple request form component
const PTORequestFormFinal = ({ onSubmit, onCancel, balance }) => {
  const [formData, setFormData] = useState({
    accrual_type: 'vacation',
    starts_at: '',
    ends_at: '',
    hours_requested: '',
    note: ''
  });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = PTOServiceFinal.validateRequestData(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        ...formData,
        hours_requested: parseFloat(formData.hours_requested)
      });
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Request Time Off</h3>
          
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <ul className="text-sm text-red-600 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Time Off
              </label>
              <select
                value={formData.accrual_type}
                onChange={(e) => setFormData(prev => ({ ...prev, accrual_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="vacation">Vacation</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.starts_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, starts_at: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.ends_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, ends_at: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hours Requested</label>
              <input
                type="number"
                value={formData.hours_requested}
                onChange={(e) => setFormData(prev => ({ ...prev, hours_requested: e.target.value }))}
                min="0.5"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeePTODashboardFinal;
