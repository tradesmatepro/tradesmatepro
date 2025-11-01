import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { supaFetch } from '../../utils/supaFetch';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * Job Status Alerts Widget
 * Shows jobs that need status updates based on scheduled times
 * - Jobs scheduled to start but not marked in_progress
 * - Jobs past scheduled end time but not marked completed
 */
const JobStatusAlertsWidget = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState({
    shouldHaveStarted: [],
    shouldBeCompleted: [],
    loading: true
  });
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (user?.company_id) {
      loadAlerts();
    }
  }, [user?.company_id]);

  const loadAlerts = async () => {
    try {
      setAlerts(prev => ({ ...prev, loading: true }));
      const now = new Date().toISOString();

      // Jobs scheduled to start but not marked in_progress
      // Status = 'scheduled' AND scheduled_start <= NOW
      const shouldStartResponse = await supaFetch(
        `work_orders?status=eq.scheduled&scheduled_start=lte.${now}&select=id,title,work_order_number,scheduled_start,scheduled_end,assigned_to,customer_id,customers(name)`,
        { method: 'GET' },
        user.company_id
      );

      // Jobs in_progress past scheduled end time but not marked completed
      // Status = 'in_progress' AND scheduled_end <= NOW
      const shouldCompleteResponse = await supaFetch(
        `work_orders?status=eq.in_progress&scheduled_end=lte.${now}&select=id,title,work_order_number,scheduled_start,scheduled_end,assigned_to,customer_id,customers(name)`,
        { method: 'GET' },
        user.company_id
      );

      const shouldHaveStarted = shouldStartResponse.ok ? await shouldStartResponse.json() : [];
      const shouldBeCompleted = shouldCompleteResponse.ok ? await shouldCompleteResponse.json() : [];

      setAlerts({
        shouldHaveStarted,
        shouldBeCompleted,
        loading: false
      });
    } catch (error) {
      console.error('Error loading job status alerts:', error);
      setAlerts({ shouldHaveStarted: [], shouldBeCompleted: [], loading: false });
    }
  };

  const handleStartJob = async (job) => {
    try {
      setUpdating(job.id);

      // Use RPC function for validated status transition
      const response = await supaFetch(
        `rpc/start_job`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            p_work_order_id: job.id,
            p_company_id: user.company_id
          })
        },
        user.company_id
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Reload alerts
          await loadAlerts();
          if (window.toast?.success) {
            window.toast.success(`Job "${job.title}" started!`);
          }
        } else {
          throw new Error(result.error || 'Failed to start job');
        }
      } else {
        throw new Error('Failed to start job');
      }
    } catch (error) {
      console.error('Error starting job:', error);
      if (window.toast?.error) {
        window.toast.error(error.message || 'Failed to start job');
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleCompleteJob = async (job) => {
    try {
      setUpdating(job.id);

      // Use RPC function for validated status transition
      const response = await supaFetch(
        `rpc/complete_job`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            p_work_order_id: job.id,
            p_company_id: user.company_id
          })
        },
        user.company_id
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Reload alerts
          await loadAlerts();
          if (window.toast?.success) {
            window.toast.success(`Job "${job.title}" completed!`);
          }
        } else {
          throw new Error(result.error || 'Failed to complete job');
        }
      } else {
        throw new Error('Failed to complete job');
      }
    } catch (error) {
      console.error('Error completing job:', error);
      if (window.toast?.error) {
        window.toast.error(error.message || 'Failed to complete job');
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleDismiss = async (jobId, type) => {
    // Just remove from UI - don't change status
    setAlerts(prev => ({
      ...prev,
      [type]: prev[type].filter(j => j.id !== jobId)
    }));
  };

  const totalAlerts = alerts.shouldHaveStarted.length + alerts.shouldBeCompleted.length;

  if (alerts.loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">Job Status Alerts</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-100 rounded"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (totalAlerts === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircleIcon className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Job Status Alerts</h3>
        </div>
        <div className="text-center py-8">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600">All jobs are on track!</p>
          <p className="text-sm text-gray-500 mt-1">No overdue status changes needed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Job Status Alerts</h3>
              <p className="text-sm text-gray-600">
                {totalAlerts} {totalAlerts === 1 ? 'job needs' : 'jobs need'} attention
              </p>
            </div>
          </div>
          <button
            onClick={loadAlerts}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Jobs that should have started */}
        {alerts.shouldHaveStarted.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <ClockIcon className="w-5 h-5 text-amber-600" />
              <h4 className="text-sm font-semibold text-gray-900">
                Should Have Started ({alerts.shouldHaveStarted.length})
              </h4>
            </div>
            <div className="space-y-2">
              {alerts.shouldHaveStarted.map(job => (
                <div
                  key={job.id}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h5 className="text-sm font-semibold text-gray-900">{job.title}</h5>
                        <span className="text-xs text-gray-500">#{job.work_order_number}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Customer: {job.customers?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Scheduled: {new Date(job.scheduled_start).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleStartJob(job)}
                        disabled={updating === job.id}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlayIcon className="w-3 h-3" />
                        <span>{updating === job.id ? 'Starting...' : 'Start Job'}</span>
                      </button>
                      <button
                        onClick={() => navigate(`/jobs?edit=${job.id}`)}
                        className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDismiss(job.id, 'shouldHaveStarted')}
                        className="p-1.5 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jobs that should be completed */}
        {alerts.shouldBeCompleted.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircleIcon className="w-5 h-5 text-blue-600" />
              <h4 className="text-sm font-semibold text-gray-900">
                Should Be Completed ({alerts.shouldBeCompleted.length})
              </h4>
            </div>
            <div className="space-y-2">
              {alerts.shouldBeCompleted.map(job => (
                <div
                  key={job.id}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h5 className="text-sm font-semibold text-gray-900">{job.title}</h5>
                        <span className="text-xs text-gray-500">#{job.work_order_number}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Customer: {job.customers?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Scheduled End: {new Date(job.scheduled_end).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleCompleteJob(job)}
                        disabled={updating === job.id}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircleIcon className="w-3 h-3" />
                        <span>{updating === job.id ? 'Completing...' : 'Complete Job'}</span>
                      </button>
                      <button
                        onClick={() => navigate(`/jobs?edit=${job.id}`)}
                        className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDismiss(job.id, 'shouldBeCompleted')}
                        className="p-1.5 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobStatusAlertsWidget;

