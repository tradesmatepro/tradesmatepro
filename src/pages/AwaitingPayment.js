import React, { useState, useEffect } from 'react';
import ModernPageHeader, { ModernStatCard } from '../components/Common/ModernPageHeader';
import ModernCard from '../components/Common/ModernCard';
import { JobsTable } from '../components/JobsUI';
import { supaFetch } from '../utils/supaFetch';
import { useUser } from '../contexts/UserContext';
import { CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';

const AwaitingPayment = () => {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAwaitingPaymentJobs();
  }, []);

  const loadAwaitingPaymentJobs = async () => {
    setLoading(true);
    try {
      // Query work_orders with completed status and unpaid invoices - use status field
      const res = await supaFetch('work_orders?status=eq.completed&select=*,customers(name,email,phone),invoices!inner(id,invoice_number,status)&invoices.status=in.(unpaid,overdue,partially_paid)&order=updated_at.desc', { method: 'GET' }, user.company_id);
      if (res.ok) {
        const data = await res.json();
        setJobs(data || []);
      } else {
        console.error('Failed to load awaiting payment jobs:', await res.text());
      }
    } catch (e) {
      console.error('Error loading awaiting payment jobs', e);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (job) => {
    // Navigate to invoice details
    window.location.href = `/invoices?invoice_id=${job.invoice_id}`;
  };

  const handleMarkPaid = async (job) => {
    try {
      await supaFetch(`invoices?id=eq.${job.invoice_id}`, {
        method: 'PATCH',
        body: { status: 'PAID', updated_at: new Date().toISOString() }
      }, user.company_id);
      
      // Reload the list
      loadAwaitingPaymentJobs();
    } catch (e) {
      console.error('Failed to mark invoice as paid:', e);
    }
  };

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="Awaiting Payment"
        subtitle="Invoiced jobs waiting for customer payment"
        icon={CurrencyDollarIcon}
        gradient="green"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernStatCard
          title="Outstanding Invoices"
          value={jobs.length}
          icon={CurrencyDollarIcon}
          gradient="green"
        />
        <ModernStatCard
          title="Outstanding Amount"
          value={`$${jobs.reduce((sum, job) => sum + (job.total_amount || 0), 0).toLocaleString()}`}
          icon={CurrencyDollarIcon}
          gradient="blue"
        />
        <ModernStatCard
          title="Avg Days Outstanding"
          value={jobs.length > 0 ? Math.round(jobs.reduce((sum, job) => {
            const daysAgo = Math.floor((new Date() - new Date(job.updated_at)) / (1000 * 60 * 60 * 24));
            return sum + daysAgo;
          }, 0) / jobs.length) : 0}
          icon={ClockIcon}
          gradient="orange"
        />
      </div>

      <ModernCard>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Jobs Awaiting Payment</h2>
            <div className="text-sm text-gray-500">
              {jobs.length} invoice{jobs.length !== 1 ? 's' : ''} outstanding
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No outstanding invoices</h3>
              <p className="mt-1 text-sm text-gray-500">All invoices have been paid.</p>
            </div>
          ) : (
            <JobsTable
              jobs={jobs}
              onEdit={() => {}}
              onDelete={() => {}}
              showActions={true}
              customActions={(job) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewInvoice(job)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    View Invoice
                  </button>
                  <button
                    onClick={() => handleMarkPaid(job)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Mark Paid
                  </button>
                </div>
              )}
            />
          )}
        </div>
      </ModernCard>
    </div>
  );
};

export default AwaitingPayment;
