import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import {
  XMarkIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PrinterIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

/**
 * ClosedJobDetailModal
 * 
 * Industry Standard: Read-only view of closed jobs with reopen capability
 * Matches: ServiceTitan, Jobber, Housecall Pro
 * 
 * Features:
 * - Read-only display of all job details
 * - Customer information
 * - Line items and pricing
 * - Timeline/history
 * - Reopen button (for warranty work, corrections)
 * - Link to invoice if exists
 * - Print capability
 */

const ClosedJobDetailModal = ({ isOpen, onClose, jobId, onReopen }) => {
  const { user } = useUser();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lineItems, setLineItems] = useState([]);

  useEffect(() => {
    if (isOpen && jobId && user?.company_id) {
      console.log('🔍 Modal opened with jobId:', jobId);
      setJob(null); // Reset job state
      setLineItems([]); // Reset line items
      setLoading(true); // Set loading
      loadJobDetails();
    } else if (!isOpen) {
      // Reset state when modal closes
      setJob(null);
      setLineItems([]);
      setLoading(true);
    }
  }, [isOpen, jobId, user?.company_id]);

  const loadJobDetails = async () => {
    if (!jobId || !user?.company_id) {
      console.log('❌ Missing jobId or company_id:', { jobId, company_id: user?.company_id });
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Loading job details for:', jobId);

      // Load work order with customer details
      // Note: Address comes from work_orders.service_address_* fields, not customers table
      const woRes = await supaFetch(
        `work_orders?id=eq.${jobId}&select=*,customers(name,email,phone)`,
        { method: 'GET' },
        user.company_id
      );

      console.log('📦 Work order response:', woRes.ok, woRes.status);

      if (woRes.ok) {
        const data = await woRes.json();
        console.log('📊 Work order data:', data);
        console.log('📊 Number of jobs returned:', data?.length);

        if (data && data.length > 0) {
          console.log('✅ Job found! Loading details...');
          const jobData = data[0];

          // If job has invoice_id, load invoice separately
          let invoiceData = null;
          if (jobData.invoice_id) {
            console.log('🧾 Loading invoice:', jobData.invoice_id);
            const invRes = await supaFetch(
              `invoices?id=eq.${jobData.invoice_id}&select=id,invoice_number,status,total_amount`,
              { method: 'GET' },
              user.company_id
            );
            if (invRes.ok) {
              const invJson = await invRes.json();
              invoiceData = invJson[0] || null;
              console.log('🧾 Invoice data:', invoiceData);
            }
          }

          // Format service address from work_order fields (not customer fields)
          const addressParts = [
            jobData.service_address_line_1,
            jobData.service_address_line_2,
            jobData.service_city,
            jobData.service_state,
            jobData.service_zip_code
          ].filter(Boolean);
          const formattedAddress = addressParts.length > 0 ? addressParts.join(', ') : '—';

          setJob({
            ...jobData,
            customer_name: jobData.customers?.name || '',
            customer_email: jobData.customers?.email || '',
            customer_phone: jobData.customers?.phone || '',
            customer_address: formattedAddress, // Service address from work_order
            invoice_number: invoiceData?.invoice_number || null,
            invoice_status: invoiceData?.status || null
          });

          // Load line items
          console.log('📋 Loading line items for work order:', jobId);
          const itemsRes = await supaFetch(
            `work_order_items?work_order_id=eq.${jobId}&select=*&order=sort_order.asc`,
            { method: 'GET' },
            user.company_id
          );
          if (itemsRes.ok) {
            const items = await itemsRes.json();
            console.log('📋 Line items:', items.length);
            setLineItems(items || []);
          }
        } else {
          console.error('❌ Job not found in database:', jobId);
        }
      } else {
        console.error('❌ Failed to load job:', await woRes.text());
      }
    } catch (e) {
      console.error('❌ Error loading job details:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReopen = () => {
    if (onReopen && job) {
      onReopen(job);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    // ✅ INDUSTRY STANDARD: Closed Jobs = paid, closed, cancelled only
    const statusMap = {
      paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-800' },
      closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
    };
    const s = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
        {s.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full my-8">
        {/* Header - Bold gradient with white text for visibility */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 dark:bg-white/10 rounded-lg shadow-sm backdrop-blur-sm">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {loading ? 'Loading...' : job?.title || 'Job Details'}
              </h2>
              <p className="text-sm text-blue-100 dark:text-blue-200 mt-1">
                Read-only view • {loading ? '' : getStatusBadge(job?.status)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 dark:hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : job ? (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{job.customer_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <PhoneIcon className="w-3 h-3" /> Phone
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{job.customer_phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <EnvelopeIcon className="w-3 h-3" /> Email
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{job.customer_email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" /> Service Address
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{job.work_location || job.customer_address || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Job Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Scheduled Start</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(job.scheduled_start)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed At</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(job.completed_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <p className="text-sm font-medium">{getStatusBadge(job.status)}</p>
                  </div>
                </div>
                {job.description && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{job.description}</p>
                  </div>
                )}
              </div>

              {/* Line Items */}
              {lineItems.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Line Items
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                          <th className="pb-2">Description</th>
                          <th className="pb-2 text-right">Qty</th>
                          <th className="pb-2 text-right">Rate</th>
                          <th className="pb-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {lineItems.map((item, idx) => (
                          <tr key={idx} className="text-sm text-gray-900 dark:text-gray-100">
                            <td className="py-2">{item.description || '—'}</td>
                            <td className="py-2 text-right">{item.quantity || 0}</td>
                            <td className="py-2 text-right">{formatCurrency(item.unit_price)}</td>
                            <td className="py-2 text-right font-medium">{formatCurrency(item.total_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 rounded-lg p-4 border border-blue-500 dark:border-blue-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-white" />
                    <span className="text-sm font-semibold text-white">Total Amount</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{formatCurrency(job.total_amount)}</span>
                </div>
              </div>

              {/* Invoice Link */}
              {job.invoice_id && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Invoice Created</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Invoice #{job.invoice_number} • Status: {job.invoice_status}
                      </p>
                    </div>
                    <a
                      href={`/invoices?view=${job.invoice_id}`}
                      className="btn-secondary text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Invoice
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Job not found</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="btn-secondary text-sm flex items-center gap-2"
              disabled={loading || !job}
            >
              <PrinterIcon className="w-4 h-4" />
              Print
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
            <button
              onClick={handleReopen}
              className="btn-primary flex items-center gap-2"
              disabled={loading || !job}
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reopen Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosedJobDetailModal;

