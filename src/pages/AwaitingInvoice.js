import React, { useState, useEffect } from 'react';
import ModernPageHeader, { ModernStatCard } from '../components/Common/ModernPageHeader';
import ModernCard from '../components/Common/ModernCard';
import { JobsTable } from '../components/JobsUI';
import { supaFetch } from '../utils/supaFetch';
import { useUser } from '../contexts/UserContext';
import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline';

const AwaitingInvoice = () => {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAwaitingInvoiceJobs();
  }, []);

  const loadAwaitingInvoiceJobs = async () => {
    setLoading(true);
    try {
      const res = await supaFetch('jobs_with_payment_status?unified_status=eq.awaiting_invoice&order=updated_at.desc', { method: 'GET' }, user.company_id);
      if (res.ok) {
        const data = await res.json();
        setJobs(data || []);
      } else {
        console.error('Failed to load awaiting invoice jobs:', await res.text());
      }
    } catch (e) {
      console.error('Error loading awaiting invoice jobs', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = (job) => {
    // Navigate to create invoice with job pre-selected
    window.location.href = `/invoices?create=true&job_id=${job.work_order_id}`;
  };

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="Awaiting Invoice"
        subtitle="Completed jobs that need invoices created"
        icon={DocumentTextIcon}
        gradient="purple"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernStatCard
          title="Jobs Ready"
          value={jobs.length}
          icon={DocumentTextIcon}
          gradient="purple"
        />
        <ModernStatCard
          title="Total Value"
          value={`$${jobs.reduce((sum, job) => sum + (job.total_amount || 0), 0).toLocaleString()}`}
          icon={DocumentTextIcon}
          gradient="green"
        />
        <ModernStatCard
          title="Avg Days Since Completion"
          value={jobs.length > 0 ? Math.round(jobs.reduce((sum, job) => {
            const daysAgo = Math.floor((new Date() - new Date(job.updated_at)) / (1000 * 60 * 60 * 24));
            return sum + daysAgo;
          }, 0) / jobs.length) : 0}
          icon={DocumentTextIcon}
          gradient="orange"
        />
      </div>

      <ModernCard>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Jobs Ready for Invoicing</h2>
            <div className="text-sm text-gray-500">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} ready
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs awaiting invoice</h3>
              <p className="mt-1 text-sm text-gray-500">All completed jobs have been invoiced.</p>
            </div>
          ) : (
            <JobsTable
              jobs={jobs}
              onEdit={() => {}}
              onDelete={() => {}}
              showActions={true}
              customActions={(job) => (
                <button
                  onClick={() => handleCreateInvoice(job)}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-4 w-4" />
                  Create Invoice
                </button>
              )}
            />
          )}
        </div>
      </ModernCard>
    </div>
  );
};

export default AwaitingInvoice;
