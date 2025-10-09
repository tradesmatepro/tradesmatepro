import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useCustomer } from '../contexts/CustomerContext';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';
import ReviewModal from '../components/Reviews/ReviewModal';

// Create authenticated supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const Jobs = () => {
  const { customer } = useCustomer();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    if (customer?.customer_id) {
      loadJobs();
    }
  }, [customer]);

  const loadJobs = async () => {
    try {
      setLoading(true);

      // ✅ FIXED: Use lowercase status values to match database enum
      // Use supabase client to query work_orders with unified status - show scheduled, in_progress, completed, cancelled
      // Note: work_orders table uses 'id' as primary key, not 'work_order_id'
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          id,
          created_at,
          status,
          title,
          description,
          total_amount,
          company_id,
          marketplace_request_id,
          marketplace_response_id
        `)
        .eq('customer_id', customer.customer_id)
        .in('status', ['scheduled', 'in_progress', 'completed', 'cancelled', 'invoiced', 'on_hold'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading jobs:', error);
        throw error;
      }

      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'text-blue-600 bg-blue-100';
      case 'IN_PROGRESS': return 'text-yellow-600 bg-yellow-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircleIcon className="h-5 w-5" />;
      case 'CANCELLED': return <ExclamationTriangleIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const openReviewModal = (job) => {
    setSelectedJob(job);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedJob(null);
  };

  const handleReviewSubmitted = (reviewData) => {
    // Refresh jobs to update review status
    loadJobs();
    console.log('Review submitted:', reviewData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <p className="text-gray-600">View your service appointments and job history</p>
      </div>

      {/* Jobs List */}
      <div className="card-modern">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Jobs</h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading services...</p>
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {job.title || `Job #${job.job_number || job.id.slice(-8)}`}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)}
                          <span className="ml-1">{job.status}</span>
                        </span>
                      </div>
                      {job.description && (
                        <p className="text-gray-600 mb-3">{job.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {job.start_time ? new Date(job.start_time).toLocaleDateString() : 'Date TBD'}
                        </div>
                        {job.start_time && (
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {new Date(job.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {job.total_amount && (
                        <p className="text-lg font-semibold text-gray-900 mb-2">
                          ${parseFloat(job.total_amount).toFixed(2)}
                        </p>
                      )}
                      {job.status === 'COMPLETED' && !job.review_completed && (
                        <button
                          onClick={() => openReviewModal(job)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          <StarIcon className="h-4 w-4 mr-1" />
                          Leave Review
                        </button>
                      )}
                      {job.status === 'COMPLETED' && job.review_completed && (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-md">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Review Submitted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs scheduled</h3>
              <p className="text-gray-500 mb-4">
                Your scheduled jobs will appear here
              </p>
              <a href="/requests" className="btn-primary">
                Request Service
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Service Reminders */}
      <div className="card-modern p-6">
        <div className="flex items-start space-x-3">
          <ClockIcon className="h-6 w-6 text-blue-500 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Service Reminders</h3>
            <p className="text-gray-600">
              We'll send you reminders before your scheduled appointments via email and text message.
            </p>
          </div>
        </div>
      </div>

      {/* Service Location */}
      <div className="card-modern p-6">
        <div className="flex items-start space-x-3">
          <MapPinIcon className="h-6 w-6 text-green-500 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Service Location</h3>
            <p className="text-gray-600">
              Please ensure someone is available at the service location during scheduled appointment times.
            </p>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedJob && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={closeReviewModal}
          workOrder={selectedJob}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default Jobs;
