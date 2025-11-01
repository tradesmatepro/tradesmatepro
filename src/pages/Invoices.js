import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import ModernPageHeader, { ModernStatCard } from '../components/Common/ModernPageHeader';
import ModernCard from '../components/Common/ModernCard';
import CompletionAndInvoiceModal from '../components/CompletionAndInvoiceModal';
import PaymentModal from '../components/PaymentModal';
import '../styles/modern-enhancements.css';

import {
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
	import { TrashIcon } from '@heroicons/react/24/outline';


import { supaFetch } from '../utils/supaFetch';
import settingsService from '../services/SettingsService';
import invoiceSendingService from '../services/InvoiceSendingService';
import twilioService from '../services/TwilioService';
	import ConfirmationModal from '../components/ConfirmationModal';
	import { useConfirmation } from '../hooks/useConfirmation';
	import { InvoicesService } from '../services/InvoicesService';


const Invoices = () => {
  const { user } = useUser();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [companySettings, setCompanySettings] = useState(null);

  // Modal states
  const [showCompletionAndInvoiceModal, setShowCompletionAndInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
	  const { modal, confirm } = useConfirmation();


  useEffect(() => {
    if (user?.company_id) {
      loadCompanySettings();
      loadInvoices();
    }
  }, [user?.company_id]);

  const loadCompanySettings = async () => {
    try {
      const settings = await settingsService.getCompanyProfile(user.company_id);
      setCompanySettings(settings);
    } catch (e) {
      console.error('Failed to load company settings:', e);
    }
  };

  const loadInvoices = async () => {
    setLoading(true);
    try {
      // Query work_orders with status='invoiced' (unified pipeline)
      const response = await supaFetch(
        `work_orders?select=*,customers(name,email,phone)&status=eq.invoiced&order=updated_at.desc`,
        { method: 'GET' },
        user.company_id
      );

      if (!response.ok) {
        throw new Error('Failed to load invoices');
      }

      const data = await response.json();
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowCompletionAndInvoiceModal(true);
  };

  const handleRecordPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handleReopenJob = async (invoice) => {
    try {
      // Revert status from 'invoiced' back to 'completed'
      await supaFetch(
        `work_orders?id=eq.${invoice.id}`,
        {
          method: 'PATCH',
          body: { status: 'completed', updated_at: new Date().toISOString() }
        },
        user.company_id
      );

      // Reload invoices
      await loadInvoices();
      window?.toast?.success?.('Job reopened and moved back to Active Jobs');
    } catch (error) {
      console.error('Failed to reopen job:', error);
      window?.toast?.error?.('Failed to reopen job');
    }
  };

	  const handleDeleteInvoice = async (invoice) => {
	    try {
	      const action = await confirm({
	        title: 'Delete Invoice?',
	        message: 'This will remove the invoice and move the job back to Active Jobs. You can re-invoice later.',
	        confirmText: 'Delete Invoice',
	        cancelText: 'Cancel',
	        isDangerous: true
	      });
	      if (action !== 'confirm') return;

	      // Find invoice record linked to this work order (if exists)
	      let invoiceId = null;
	      try {
	        const invRes = await supaFetch(
	          `invoices?work_order_id=eq.${invoice.id}&select=id&order=created_at.desc&limit=1`,
	          { method: 'GET' },
	          user.company_id
	        );
	        if (invRes.ok) {
	          const arr = await invRes.json();
	          invoiceId = arr?.[0]?.id || null;
	        }
	      } catch (e) { /* ignore */ }

      // Fallback: if not found by work_order_id, try job_id
      if (!invoiceId && invoice?.job_id) {
        try {
          const invRes2 = await supaFetch(
            `invoices?job_id=eq.${invoice.job_id}&select=id&order=created_at.desc&limit=1`,
            { method: 'GET' },
            user.company_id
          );
          if (invRes2.ok) {
            const arr2 = await invRes2.json();
            invoiceId = arr2?.[0]?.id || null;
          }
        } catch (e) { /* ignore */ }
      }

      // If we located an invoice row, guard against deleting PAID and clean up invoice_items first
      if (invoiceId) {
        try {
          const invDetailRes = await supaFetch(
            `invoices?id=eq.${invoiceId}&select=status,amount_paid,balance_due`,
            { method: 'GET' },
            user.company_id
          );
          if (invDetailRes.ok) {
            const [invRow] = await invDetailRes.json();
            if (invRow && (invRow.status === 'paid' || Number(invRow?.amount_paid || 0) > 0 || Number(invRow?.balance_due || 0) === 0)) {
              window?.toast?.error?.('Cannot delete a paid invoice');
              return;
            }
          }
        } catch (e) { /* non-blocking */ }

        // Delete invoice_items first to avoid FK constraints
        try { await supaFetch(`invoice_items?invoice_id=eq.${invoiceId}`, { method: 'DELETE' }); } catch (e) { /* ignore */ }
      }

	      if (invoiceId) {
	        await InvoicesService.deleteInvoice(invoiceId, user.company_id);
	      }

	      // Revert work order back to Active Jobs
	      await supaFetch(
	        `work_orders?id=eq.${invoice.id}`,
	        {
	          method: 'PATCH',
	          body: { status: 'completed', updated_at: new Date().toISOString() }
	        },
	        user.company_id
	      );

	      await loadInvoices();
	      window?.toast?.success?.('Invoice deleted and job moved back to Active Jobs');
	    } catch (error) {
	      console.error('Failed to delete invoice:', error);
	      window?.toast?.error?.('Failed to delete invoice');
	    }
	  };


  const handlePaymentRecorded = async (paymentData) => {
    try {
      // Update work order status to 'paid' when payment is recorded
      await supaFetch(
        `work_orders?id=eq.${selectedInvoice.id}`,
        {
          method: 'PATCH',
          body: {
            status: 'paid',
            payment_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        },
        user.company_id
      );

      setShowPaymentModal(false);
      setSelectedInvoice(null);
      await loadInvoices();
      window?.toast?.success?.('Payment recorded successfully');
    } catch (error) {
      console.error('Failed to record payment:', error);
      window?.toast?.error?.('Failed to record payment');
    }
  };

  const handleInvoiceSent = async () => {
    setShowCompletionAndInvoiceModal(false);
    setSelectedInvoice(null);
    await loadInvoices();
  };

  const handleCompletionAndInvoiceConfirm = async (completionData) => {
    try {
      // For invoices page, we skip the completion step and go straight to sending
      // The invoice is already created, so we just need to send it

      // Store employee signature if provided
      if (completionData.employeeSignature || completionData.employeeSignatureImage) {
        console.log('💾 Storing employee signature...');
        await supaFetch(
          `work_orders?id=eq.${selectedInvoice.id}`,
          {
            method: 'PATCH',
            body: {
              technician_signature_url: completionData.employeeSignatureImage,
              updated_at: new Date().toISOString()
            }
          },
          user.company_id
        );
        console.log('✅ Employee signature stored');
      }

      let emailSent = false;
      let smsSent = false;

      // Send invoice via selected delivery method
      if (completionData.deliveryMethod === 'email' || completionData.deliveryMethod === 'both') {
        try {
          console.log('📧 Sending invoice via email using InvoiceSendingService');
          await invoiceSendingService.sendInvoiceEmail(user.company_id, selectedInvoice.id, {
            customMessage: completionData.customMessage,
            includePDF: completionData.includeAttachment
          });
          console.log('✅ Invoice sent via email');
          emailSent = true;
          window?.toast?.success?.(`Invoice sent via email to ${selectedInvoice.customers?.email}!`);
        } catch (e) {
          console.error('❌ Invoice email failed:', e);
          window?.toast?.error?.(`Email failed: ${e.message}`);
        }
      }

      if (completionData.deliveryMethod === 'sms' || completionData.deliveryMethod === 'both') {
        try {
          console.log('📱 Sending invoice via SMS');
          await twilioService.sendInvoiceReminder(selectedInvoice, user.company_id);
          console.log('✅ SMS sent');
          smsSent = true;
          window?.toast?.success?.('Invoice sent via SMS!');
        } catch (e) {
          console.warn('Invoice SMS failed:', e);
        }
      }

      // Record payment if selected
      if (completionData.recordPaymentNow && parseFloat(completionData.paymentAmount) > 0) {
        console.log('💳 Recording payment...');
        await supaFetch(
          `work_orders?id=eq.${selectedInvoice.id}`,
          {
            method: 'PATCH',
            body: {
              status: 'paid',
              payment_date: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          },
          user.company_id
        );
        console.log('✅ Payment recorded');
      }

      setShowCompletionAndInvoiceModal(false);
      setSelectedInvoice(null);
      await loadInvoices();

      if (emailSent || smsSent) {
        window?.toast?.success?.('Invoice sent successfully!');
      }
    } catch (error) {
      console.error('Failed to send invoice:', error);
      window?.toast?.error?.('Failed to send invoice');
    }
  };

  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const avgDaysOutstanding = invoices.length > 0
    ? Math.round(invoices.reduce((sum, inv) => {
        const daysAgo = Math.floor((new Date() - new Date(inv.updated_at)) / (1000 * 60 * 60 * 24));
        return sum + daysAgo;
      }, 0) / invoices.length)
    : 0;

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="Invoices"
        subtitle="Manage invoices awaiting payment"
        icon={CurrencyDollarIcon}
        gradient="green"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModernStatCard
          title="Outstanding Invoices"
          value={invoices.length}
          icon={CurrencyDollarIcon}
          gradient="green"
        />
        <ModernStatCard
          title="Total Outstanding"
          value={`$${totalOutstanding.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          icon={CreditCardIcon}
          gradient="blue"
        />
        <ModernStatCard
          title="Avg Days Outstanding"
          value={avgDaysOutstanding}
          icon={ClockIcon}
          gradient="orange"
        />
      </div>

      {/* Invoices Table */}
      <ModernCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Invoices Awaiting Payment</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No outstanding invoices</h3>
              <p className="mt-1 text-sm text-gray-500">All invoices have been paid!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Days Outstanding</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => {
                    const daysOutstanding = Math.floor((new Date() - new Date(invoice.updated_at)) / (1000 * 60 * 60 * 24));
                    const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date();

                    return (
                      <tr key={invoice.id} onClick={() => handleSendInvoice(invoice)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{invoice.work_order_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {invoice.customers?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${(invoice.total_amount || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            isOverdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {daysOutstanding} days
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSendInvoice(invoice); }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Send invoice to customer"
                          >
                            <PaperAirplaneIcon className="w-4 h-4" />
                            Send
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRecordPayment(invoice); }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            title="Record payment received"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Record Payment
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReopenJob(invoice); }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            title="Revert to active jobs"
                          >
                            <ArrowPathIcon className="w-4 h-4" />
                            Reopen
                          </button>
	                          <button
	                            onClick={(e) => { e.stopPropagation(); handleDeleteInvoice(invoice); }}
	                            className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
	                            title="Delete invoice"
	                          >
	                            <TrashIcon className="w-4 h-4" />
	                            Delete
	                          </button>

                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ModernCard>

      {/* Modals */}
      {selectedInvoice && (
        <>
          <CompletionAndInvoiceModal
            isOpen={showCompletionAndInvoiceModal}
            onClose={() => setShowCompletionAndInvoiceModal(false)}
            job={selectedInvoice}
            onConfirm={handleCompletionAndInvoiceConfirm}
            companySettings={companySettings}
          />
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onConfirm={handlePaymentRecorded}
            invoiceTitle={`Invoice #${selectedInvoice?.work_order_number}`}
            invoiceAmount={selectedInvoice?.total_amount || 0}
            invoiceId={selectedInvoice?.id}
            customerId={selectedInvoice?.customer_id}
            companyId={user?.company_id}
          />
        </>
      )}

	      {/* Global confirmation modal (modern) */}
	      <ConfirmationModal isOpen={!!modal?.isOpen} {...(modal || {})} />

    </div>
  );
};

export default Invoices;

