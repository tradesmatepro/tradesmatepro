// Customer Jobs - View and track jobs/work orders from customer perspective
import React, { useState } from 'react';
import {
  WrenchScrewdriverIcon,
  EyeIcon,
  XMarkIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const CustomerJobs = ({ jobs, onRefresh }) => {
  const [selectedJob, setSelectedJob] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'INVOICED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisplayStatus = (status) => status || 'SCHEDULED';



  const JobCard = ({ job }) => {
    const displayStatus = getDisplayStatus(job.status);

    return (
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-medium text-gray-900">
                {job.title || `Job #${job.job_number || job.work_order_id?.slice(-8)}`}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(displayStatus)}`}>
                {displayStatus}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4" />
                <span>{job.customers?.name || 'Unknown Customer'}</span>
              </div>
              
              {job.service_address_line_1 && (
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{job.service_address_line_1}, {job.service_city}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {job.start_time 
                    ? `Scheduled: ${new Date(job.start_time).toLocaleDateString()}`
                    : `Created: ${new Date(job.created_at).toLocaleDateString()}`
                  }
                </span>
              </div>

              {job.completed_at && (
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span>Completed: {new Date(job.completed_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {job.description && (
              <p className="mt-3 text-sm text-gray-700 line-clamp-2">{job.description}</p>
            )}
          </div>

          <div className="ml-4 flex flex-col items-end space-y-2">
            <button
              onClick={() => setSelectedJob(job)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              title="View Details"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            
            {job.total_amount > 0 && (
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  ${job.total_amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const JobDetailModal = ({ job, onClose }) => {
    const displayStatus = getDisplayStatus(job.status);

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Job Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Job Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {job.title || `Job #${job.job_number || job.work_order_id?.slice(-8)}`}
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Customer: {job.customers?.name || 'Unknown'}</p>
                  <p>Created: {new Date(job.created_at).toLocaleDateString()}</p>
                  {job.start_time && (
                    <p>Scheduled: {new Date(job.start_time).toLocaleDateString()} at {new Date(job.start_time).toLocaleTimeString()}</p>
                  )}
                  {job.completed_at && (
                    <p>Completed: {new Date(job.completed_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(displayStatus)}`}>
                  {displayStatus}
                </span>
                {job.total_amount > 0 && (
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-gray-900">
                      ${job.total_amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Total Amount</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {job.description && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Description</h5>
                <p className="text-gray-600">{job.description}</p>
              </div>
            )}

            {/* Service Address */}
            {job.service_address_line_1 && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Service Address</h5>
                <div className="text-gray-600">
                  <p>{job.service_address_line_1}</p>
                  {job.service_address_line_2 && <p>{job.service_address_line_2}</p>}
                  <p>{job.service_city}, {job.service_state} {job.service_zip_code}</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Timeline</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                {job.start_time && (
                  <div className="flex justify-between">
                    <span>Scheduled Start:</span>
                    <span>{new Date(job.start_time).toLocaleDateString()} at {new Date(job.start_time).toLocaleTimeString()}</span>
                  </div>
                )}
                {job.end_time && (
                  <div className="flex justify-between">
                    <span>Scheduled End:</span>
                    <span>{new Date(job.end_time).toLocaleDateString()} at {new Date(job.end_time).toLocaleTimeString()}</span>
                  </div>
                )}
                {job.actual_start_time && (
                  <div className="flex justify-between">
                    <span>Actual Start:</span>
                    <span>{new Date(job.actual_start_time).toLocaleDateString()} at {new Date(job.actual_start_time).toLocaleTimeString()}</span>
                  </div>
                )}
                {job.actual_end_time && (
                  <div className="flex justify-between">
                    <span>Actual End:</span>
                    <span>{new Date(job.actual_end_time).toLocaleDateString()} at {new Date(job.actual_end_time).toLocaleTimeString()}</span>
                  </div>
                )}
                {job.completed_at && (
                  <div className="flex justify-between font-medium">
                    <span>Completed:</span>
                    <span>{new Date(job.completed_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            {job.progress_percent > 0 && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Progress</h5>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${job.progress_percent}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{job.progress_percent}% Complete</p>
              </div>
            )}

            {/* Notes */}
            {job.notes && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Notes</h5>
                <p className="text-gray-600 text-sm">{job.notes}</p>
              </div>
            )}

            {/* Access Instructions */}
            {job.access_instructions && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Access Instructions</h5>
                <p className="text-gray-600 text-sm">{job.access_instructions}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Customer Jobs</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track job progress and work order status
          </p>
        </div>
      </div>

      {/* Jobs grid */}
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.work_order_id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <WrenchScrewdriverIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">No active jobs or work orders at the moment.</p>
        </div>
      )}

      {/* Job detail modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
};

export default CustomerJobs;
