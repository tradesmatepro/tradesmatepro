// PTO Policy Manager - Admin interface for managing PTO policies
import React, { useState } from 'react';
import PTOServiceProduction, { ACCRUAL_PERIODS } from '../../services/PTOServiceProduction';
import {
  PlusIcon,
  PencilIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const PTOPolicyManager = ({ policies, onPolicyUpdate }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleCreatePolicy = async (policyData) => {
    try {
      setProcessing(true);
      await PTOServiceProduction.createPolicy(policyData);
      setShowCreateForm(false);
      onPolicyUpdate();
    } catch (error) {
      console.error('Error creating policy:', error);
      alert('Failed to create policy: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdatePolicy = async (policyId, policyData) => {
    try {
      setProcessing(true);
      await PTOServiceProduction.updatePolicy(policyId, policyData);
      setEditingPolicy(null);
      onPolicyUpdate();
    } catch (error) {
      console.error('Error updating policy:', error);
      alert('Failed to update policy: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const PolicyForm = ({ policy = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: policy?.name || '',
      vacation_hours_per_period: policy?.vacation_hours_per_period || 3.08,
      sick_hours_per_period: policy?.sick_hours_per_period || 1.54,
      accrual_period: policy?.accrual_period || 'biweekly',
      max_vacation_hours: policy?.max_vacation_hours || 120,
      max_sick_hours: policy?.max_sick_hours || 80,
      carryover_limit: policy?.carryover_limit || 40
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const calculateAnnualHours = (hoursPerPeriod, period) => {
      const periodsPerYear = {
        'weekly': 52,
        'biweekly': 26,
        'monthly': 12
      };
      return (hoursPerPeriod * periodsPerYear[period]).toFixed(1);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {policy ? 'Edit Policy' : 'Create New Policy'}
            </h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">×</button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Policy Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Standard Policy, Senior Employee Policy"
                required
              />
            </div>

            {/* Accrual Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accrual Period *
              </label>
              <select
                value={formData.accrual_period}
                onChange={(e) => setFormData(prev => ({ ...prev, accrual_period: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {Object.entries(ACCRUAL_PERIODS).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Accrual Rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vacation Hours per {formData.accrual_period} *
                </label>
                <input
                  type="number"
                  value={formData.vacation_hours_per_period}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    vacation_hours_per_period: parseFloat(e.target.value) || 0 
                  }))}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Annual: ~{calculateAnnualHours(formData.vacation_hours_per_period, formData.accrual_period)} hours
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sick Hours per {formData.accrual_period} *
                </label>
                <input
                  type="number"
                  value={formData.sick_hours_per_period}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    sick_hours_per_period: parseFloat(e.target.value) || 0 
                  }))}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Annual: ~{calculateAnnualHours(formData.sick_hours_per_period, formData.accrual_period)} hours
                </p>
              </div>
            </div>

            {/* Maximum Balances */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Vacation Hours
                </label>
                <input
                  type="number"
                  value={formData.max_vacation_hours}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    max_vacation_hours: parseFloat(e.target.value) || 0 
                  }))}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank for no limit
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Sick Hours
                </label>
                <input
                  type="number"
                  value={formData.max_sick_hours}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    max_sick_hours: parseFloat(e.target.value) || 0 
                  }))}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank for no limit
                </p>
              </div>
            </div>

            {/* Carryover Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year-end Carryover Limit (Vacation Hours)
              </label>
              <input
                type="number"
                value={formData.carryover_limit}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  carryover_limit: parseFloat(e.target.value) || 0 
                }))}
                min="0"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum vacation hours that can be carried over to next year
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {processing ? 'Saving...' : (policy ? 'Update Policy' : 'Create Policy')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">PTO Policies</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Policy
        </button>
      </div>

      {/* Policies List */}
      {policies.length === 0 ? (
        <div className="text-center py-12">
          <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No policies configured</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first PTO policy to get started.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Policy
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <div key={policy.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{policy.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{policy.accrual_period} accrual</p>
                </div>
                <button
                  onClick={() => setEditingPolicy(policy)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Vacation</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {PTOServiceProduction.formatBalance(policy.vacation_hours_per_period)} hrs/{policy.accrual_period}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm text-gray-600">Sick Leave</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {PTOServiceProduction.formatBalance(policy.sick_hours_per_period)} hrs/{policy.accrual_period}
                  </span>
                </div>

                {policy.max_vacation_hours && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Max Vacation</span>
                    <span className="text-sm font-medium text-gray-900">
                      {PTOServiceProduction.formatBalance(policy.max_vacation_hours)} hrs
                    </span>
                  </div>
                )}

                {policy.max_sick_hours && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Max Sick</span>
                    <span className="text-sm font-medium text-gray-900">
                      {PTOServiceProduction.formatBalance(policy.max_sick_hours)} hrs
                    </span>
                  </div>
                )}

                {policy.carryover_limit && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Carryover Limit</span>
                    <span className="text-sm font-medium text-gray-900">
                      {PTOServiceProduction.formatBalance(policy.carryover_limit)} hrs
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Created {new Date(policy.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateForm && (
        <PolicyForm
          onSubmit={handleCreatePolicy}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingPolicy && (
        <PolicyForm
          policy={editingPolicy}
          onSubmit={(data) => handleUpdatePolicy(editingPolicy.id, data)}
          onCancel={() => setEditingPolicy(null)}
        />
      )}
    </div>
  );
};

export default PTOPolicyManager;
