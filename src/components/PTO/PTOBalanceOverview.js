// PTO Balance Overview - Admin view of all employee PTO balances
import React, { useState } from 'react';
import PTOServiceProduction from '../../services/PTOServiceProduction';
import {
  MagnifyingGlassIcon,
  PencilIcon,
  ChartBarIcon,
  UsersIcon,
  CalendarDaysIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const PTOBalanceOverview = ({ balances, onBalanceUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [processing, setProcessing] = useState(false);

  const filteredBalances = balances.filter(balance =>
    balance.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    balance.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBalanceUpdate = async (employeeId, updateData) => {
    try {
      setProcessing(true);
      await PTOServiceProduction.updateBalance(employeeId, updateData);
      setEditModal(null);
      onBalanceUpdate();
    } catch (error) {
      console.error('Error updating balance:', error);
      alert('Failed to update balance: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const BalanceEditModal = ({ balance, onClose, onUpdate }) => {
    const [vacationBalance, setVacationBalance] = useState(balance.vacation_balance || 0);
    const [sickBalance, setSickBalance] = useState(balance.sick_balance || 0);
    const [reason, setReason] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit Balance - {balance.employee_name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vacation Balance (hours)
                </label>
                <input
                  type="number"
                  value={vacationBalance}
                  onChange={(e) => setVacationBalance(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sick Leave Balance (hours)
                </label>
                <input
                  type="number"
                  value={sickBalance}
                  onChange={(e) => setSickBalance(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Adjustment *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Explain why you're adjusting this balance..."
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onUpdate(balance.employee_id, {
                  vacation_balance: vacationBalance,
                  sick_balance: sickBalance,
                  reason
                })}
                disabled={processing || !reason.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {processing ? 'Updating...' : 'Update Balance'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EmployeeDetailModal = ({ balance, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{balance.employee_name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">Vacation Balance</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {PTOServiceProduction.formatBalance(balance.vacation_balance)} hrs
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center">
                <HeartIcon className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">Sick Leave Balance</p>
                  <p className="text-2xl font-bold text-red-900">
                    {PTOServiceProduction.formatBalance(balance.sick_balance)} hrs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Information */}
          {balance.policy_name && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Policy: {balance.policy_name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Vacation Accrual:</span>
                  <p className="text-gray-600">
                    {PTOServiceProduction.formatBalance(balance.vacation_hours_per_period)} hrs per {balance.accrual_period}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Sick Accrual:</span>
                  <p className="text-gray-600">
                    {PTOServiceProduction.formatBalance(balance.sick_hours_per_period)} hrs per {balance.accrual_period}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Max Vacation:</span>
                  <p className="text-gray-600">
                    {PTOServiceProduction.formatBalance(balance.max_vacation_hours)} hrs
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Max Sick:</span>
                  <p className="text-gray-600">
                    {PTOServiceProduction.formatBalance(balance.max_sick_hours)} hrs
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Last Accrual */}
          {balance.last_accrual && (
            <div className="text-sm text-gray-500 border-t pt-4">
              Last accrual: {new Date(balance.last_accrual).toLocaleDateString()}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => setEditModal(balance)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Edit Balance
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const getSummaryStats = () => {
    return {
      totalEmployees: balances.length,
      totalVacationHours: balances.reduce((sum, b) => sum + (b.vacation_balance || 0), 0),
      totalSickHours: balances.reduce((sum, b) => sum + (b.sick_balance || 0), 0),
      avgVacationBalance: balances.length > 0 
        ? balances.reduce((sum, b) => sum + (b.vacation_balance || 0), 0) / balances.length 
        : 0
    };
  };

  const stats = getSummaryStats();

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Employee Balances</h2>
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <UsersIcon className="h-6 w-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Vacation</p>
              <p className="text-xl font-bold text-gray-900">
                {PTOServiceProduction.formatBalance(stats.totalVacationHours)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <HeartIcon className="h-6 w-6 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Sick</p>
              <p className="text-xl font-bold text-gray-900">
                {PTOServiceProduction.formatBalance(stats.totalSickHours)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg Vacation</p>
              <p className="text-xl font-bold text-gray-900">
                {PTOServiceProduction.formatBalance(stats.avgVacationBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Employee Balances ({filteredBalances.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredBalances.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {searchTerm ? 'No employees found matching your search.' : 'No employee balances available.'}
            </div>
          ) : (
            filteredBalances.map((balance) => (
              <div key={balance.employee_id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {balance.employee_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{balance.employee_name}</h4>
                      <p className="text-sm text-gray-500">{balance.email}</p>
                      {balance.policy_name && (
                        <p className="text-xs text-gray-400">{balance.policy_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-blue-600">
                        {PTOServiceProduction.formatBalance(balance.vacation_balance || 0)}
                      </p>
                      <p className="text-xs text-gray-500">Vacation</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm font-medium text-red-600">
                        {PTOServiceProduction.formatBalance(balance.sick_balance || 0)}
                      </p>
                      <p className="text-xs text-gray-500">Sick</p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedEmployee(balance)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setEditModal(balance)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedEmployee && (
        <EmployeeDetailModal
          balance={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

      {editModal && (
        <BalanceEditModal
          balance={editModal}
          onClose={() => setEditModal(null)}
          onUpdate={handleBalanceUpdate}
        />
      )}
    </div>
  );
};

export default PTOBalanceOverview;
