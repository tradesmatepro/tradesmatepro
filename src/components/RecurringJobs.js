import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  XMarkIcon,
  ArrowPathIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../contexts/UserContext';
import supaFetch from '../utils/supaFetch';

const RecurringJobs = ({ onClose }) => {
  const { user } = useUser();
  const [recurringJobs, setRecurringJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (user?.company_id) {
      loadRecurringJobs();
    }
  }, [user?.company_id]);

  const loadRecurringJobs = async () => {
    try {
      setLoading(true);
      // For now, we'll create a placeholder since recurring jobs table doesn't exist yet
      // This will be implemented when the SQL schema is run
      setRecurringJobs([]);
    } catch (error) {
      console.error('Error loading recurring jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFrequencyText = (frequency) => {
    const frequencies = {
      'weekly': 'Weekly',
      'biweekly': 'Every 2 weeks',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'semiannual': 'Every 6 months',
      'annual': 'Annually'
    };
    return frequencies[frequency] || frequency;
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'paused': 'bg-yellow-100 text-yellow-800',
      'inactive': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.inactive;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recurring Jobs</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage maintenance contracts and recurring services
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              New Recurring Job
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : recurringJobs.length === 0 ? (
            <div className="text-center py-12">
              <ArrowPathIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recurring jobs yet</h3>
              <p className="text-gray-600 mb-4">
                Set up maintenance contracts and recurring services to automate your workflow
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Coming Soon!</h4>
                <p className="text-sm text-blue-800">
                  Recurring jobs functionality will be available after running the database schema updates. 
                  This feature will include:
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Automatic job creation based on schedules</li>
                  <li>• Maintenance contract management</li>
                  <li>• Customer subscription billing</li>
                  <li>• Service history tracking</li>
                </ul>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                Create Recurring Job
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recurringJobs.map(job => (
                <div
                  key={job.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  {/* Job Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.customer_name}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <ArrowPathIcon className="w-4 h-4" />
                      <span>{getFrequencyText(job.frequency)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Next: {new Date(job.next_due_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      <span>${job.default_price}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      {job.jobs_created || 0} jobs created
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1 hover:bg-gray-100 rounded"
                        title={job.status === 'active' ? 'Pause' : 'Resume'}
                      >
                        {job.status === 'active' ? (
                          <PauseIcon className="w-4 h-4 text-gray-400" />
                        ) : (
                          <PlayIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Recurring jobs automatically create new work orders based on your schedule
            </p>
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Create Recurring Job Modal */}
      {showCreateForm && (
        <CreateRecurringJobModal
          onClose={() => setShowCreateForm(false)}
          onCreated={() => {
            setShowCreateForm(false);
            loadRecurringJobs();
          }}
        />
      )}
    </div>
  );
};

// Placeholder for Create Recurring Job Modal
const CreateRecurringJobModal = ({ onClose, onCreated }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create Recurring Job</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            Recurring job creation will be available after running the database schema updates.
            This will include setup for maintenance contracts, scheduling intervals, and automatic job generation.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecurringJobs;
