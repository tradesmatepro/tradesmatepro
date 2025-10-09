// Portal Jobs Component - Customer view of their work orders/jobs
import React, { useState } from 'react';
import {
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useCustomerPortal } from '../../contexts/CustomerPortalContext';
import CustomerPortalService from '../../services/CustomerPortalService';


const PortalJobs = ({ jobs, onRefresh }) => {
  const [selectedJob, setSelectedJob] = useState(null);

  const { sessionToken } = useCustomerPortal();
  const [showResched, setShowResched] = useState(false);
  const [reschedJob, setReschedJob] = useState(null);
  const [prefDate, setPrefDate] = useState('');
  const [prefWindow, setPrefWindow] = useState('Anytime');
  const [reason, setReason] = useState('');
  const submitReschedule = async () => {
    try {
      await CustomerPortalService.createServiceRequest({
        request_type: 'reschedule_request',
        work_order_id: reschedJob?.id,
        preferred_date: prefDate || null,
        preferred_time_window: prefWindow,
        message: reason || 'Customer requested reschedule'
      }, sessionToken);
      window?.toast?.success?.('Reschedule request sent');
      setShowResched(false); setReschedJob(null); setPrefDate(''); setReason('');
      if (typeof onRefresh === 'function') onRefresh();
    } catch (e) {
      console.error('Reschedule request failed', e);
      alert('Failed to send reschedule request');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      SCHEDULED: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
      COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      ON_HOLD: { color: 'bg-purple-100 text-purple-800', label: 'On Hold' }
    };

    const badge = badges[status] || badges.DRAFT;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {status === 'COMPLETED' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
        {status === 'IN_PROGRESS' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
        {badge.label}
      </span>
    );
  };

  const JobCard = ({ job }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {job.title || `Work Order #${job.id?.slice(-8)}`}
            </h3>
            <p className="text-sm text-gray-600">{job.type || 'Service Call'}</p>
          </div>
        </div>
        {getStatusBadge(job.status)}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700 line-clamp-2">
          {job.description || 'Service work to be performed'}
        </p>
      </div>

      <div className="space-y-2 mb-4">
        {job.scheduled_date && (
          <div className="flex items-center text-sm text-gray-600">
            <CalendarDaysIcon className="h-4 w-4 mr-2" />
            Scheduled: {new Date(job.scheduled_date).toLocaleDateString()}
            {job.scheduled_time && ` at ${job.scheduled_time}`}
          </div>
        )}

        {job.location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2" />
            {job.location}
          </div>
        )}

        {job.estimated_duration && (
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 mr-2" />
            Estimated: {job.estimated_duration} hours
          </div>
        )}

        {job.total_amount && (
          <div className="flex items-center text-sm text-gray-600">
            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
            <span className="font-medium text-gray-900">
              ${job.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Created {new Date(job.created_at).toLocaleDateString()}
        </span>
        <button
          onClick={() => setSelectedJob(job)}
          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View Details
        </button>
      </div>
    </div>
  );

  const JobDetailModal = ({ job, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">
              {job.title || `Work Order #${job.id?.slice(-8)}`}
            </h2>
            <p className="text-sm text-gray-600">{job.type || 'Service Call'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="space-y-6">
            {/* Status and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Job Status</h3>
                <div className="space-y-2">
                  {getStatusBadge(job.status)}
                  <p className="text-sm text-gray-600 mt-2">
                    Created: {new Date(job.created_at).toLocaleDateString()}
                  </p>
                  {job.updated_at && job.updated_at !== job.created_at && (
                    <p className="text-sm text-gray-600">
                      Updated: {new Date(job.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Scheduling</h3>
                <div className="space-y-2">
                  {job.scheduled_date ? (
                    <>
                      <div className="flex items-center text-sm">
                        <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(job.scheduled_date).toLocaleDateString()}
                      </div>
                      {job.scheduled_time && (
                        <div className="flex items-center text-sm">
                          <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {job.scheduled_time}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Not yet scheduled</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium mb-3">Work Description</h3>
              <p className="text-gray-700">
                {job.description || 'Service work to be performed as discussed.'}
              </p>
            </div>

            {/* Location */}
            {job.location && (
              <div>
                <h3 className="text-lg font-medium mb-3">Service Location</h3>
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <p className="text-gray-700">{job.location}</p>
                </div>
              </div>
            )}

            {/* Pricing */}
            {job.total_amount && (
              <div>
                <h3 className="text-lg font-medium mb-3">Pricing</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${job.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {job.subtotal && job.subtotal !== job.total_amount && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm text-gray-900">
                        ${job.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Technician Info */}
            {job.assigned_technician && (
              <div>
                <h3 className="text-lg font-medium mb-3">Assigned Technician</h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-medium">
                      {job.assigned_technician.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{job.assigned_technician}</p>
                    <p className="text-sm text-gray-600">Service Technician</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {job.notes && (
              <div>
                <h3 className="text-lg font-medium mb-3">Notes</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">{job.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={() => { setShowResched(true); setReschedJob(job); }}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              disabled={!job.scheduled_date}
              title={!job.scheduled_date ? 'Reschedule available once scheduled' : 'Request a new time'}
            >
              Request Reschedule
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
      {/* Reschedule Modal */}
      {showResched && reschedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={()=>setShowResched(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e)=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-1">Request Reschedule</h3>
            <div className="text-sm text-gray-500 mb-4">{reschedJob.title || `Work Order #${reschedJob.id?.slice(-8)}`}</div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred date</label>
                <input type="date" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={prefDate} onChange={(e)=>setPrefDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time window</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={prefWindow} onChange={(e)=>setPrefWindow(e.target.value)}>
                  <option>Anytime</option>
                  <option>Morning (8am-12pm)</option>
                  <option>Afternoon (12pm-4pm)</option>
                  <option>Evening (4pm-7pm)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea rows={3} className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-secondary" onClick={()=>setShowResched(false)}>Cancel</button>
              <button className="btn-primary" onClick={submitReschedule}>Submit Request</button>
            </div>
          </div>
        </div>
      )}

          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Jobs</h2>
        <p className="text-sm text-gray-600">{jobs.length} total jobs</p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your scheduled work will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
};

export default PortalJobs;
