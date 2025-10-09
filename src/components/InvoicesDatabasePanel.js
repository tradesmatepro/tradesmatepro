import { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import { InvoicesService } from '../services/InvoicesService';

// ✅ PHASE 3C: Import new invoice modals
import PaymentModal from './PaymentModal';
import CloseWorkOrderModal from './CloseWorkOrderModal';

const InvoicesDatabasePanel = () => {
  const { user } = useUser();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);

  // ✅ PHASE 3C: New modal states
  const [showPaymentModalNew, setShowPaymentModalNew] = useState(false);
  const [invoiceToPayment, setInvoiceToPayment] = useState(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [invoiceToClose, setInvoiceToClose] = useState(null);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadInvoices(),
        loadCustomers(),
        loadJobs()
      ]);
    } catch (e) {
      console.error('Error loading invoices page:', e);
      showAlert('error', 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    // ✅ UNIFIED PIPELINE: Load from work_orders with invoice statuses
    const res = await supaFetch('work_orders?status=in.(invoiced,paid,closed)&select=*,customers(name,email,phone)&order=created_at.desc', { method: 'GET' }, user.company_id);
    if (res.ok) setInvoices(await res.json());
  };

  const loadCustomers = async () => {
    const res = await supaFetch('customers?select=id,name&order=name.asc', { method: 'GET' }, user.company_id);
    if (res.ok) setCustomers(await res.json());
  };

  const loadJobs = async () => {
    const res = await supaFetch('jobs?select=id,job_title', { method: 'GET' }, user.company_id);
    if (res.ok) setJobs(await res.json());
  };

  const openPaymentModal = (invoice) => {
    setActiveInvoice(invoice);
    setShowPaymentModal(true);
  };

  const recordPayment = async ({ amount, method }) => {
    if (!activeInvoice) return;
    try {
      await InvoicesService.addPayment(activeInvoice.id, amount, method, user.company_id);
      showAlert('success', 'Payment recorded');
      setShowPaymentModal(false);
      setActiveInvoice(null);
      await loadInvoices();
    } catch (e) {
      console.error('Record payment failed', e);
      showAlert('error', 'Failed to record payment');
    }
  };

  const getCustomerName = (customerId) => {
    const c = customers.find((x) => x.id === customerId);
    return c ? (c.full_name || c.name || 'Customer') : 'Customer';
  };

  const getJobTitle = (jobId) => {
    const j = jobs.find((x) => x.id === jobId);
    return j ? (j.job_title || 'Job') : '—';
  };

  // ✅ PHASE 3C: Handler - Record Payment
  const handlePaymentConfirm = async (paymentData) => {
    if (!invoiceToPayment) return;

    try {
      const invoiceData = {
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_amount: paymentData.paymentAmount,
        payment_method: paymentData.paymentMethod,
        payment_reference: paymentData.referenceNumber,
        payment_notes: paymentData.notes
      };

      const response = await supaFetch(`work_orders?id=eq.${invoiceToPayment.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: invoiceData
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Payment recorded successfully!');
        setShowPaymentModalNew(false);
        setInvoiceToPayment(null);
        await loadInvoices();
      } else {
        throw new Error('Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      showAlert('error', 'Failed to record payment');
    }
  };

  // ✅ PHASE 3C: Handler - Close Work Order
  const handleCloseConfirm = async (closeData) => {
    if (!invoiceToClose) return;

    try {
      const invoiceData = {
        status: 'closed',
        closed_at: new Date().toISOString(),
        customer_satisfaction_rating: closeData.satisfactionRating,
        final_notes: closeData.finalNotes,
        lessons_learned: closeData.lessonsLearned,
        request_review: closeData.requestReview || false
      };

      const response = await supaFetch(`work_orders?id=eq.${invoiceToClose.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: invoiceData
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Work order closed successfully!');
        setShowCloseModal(false);
        setInvoiceToClose(null);
        await loadInvoices();
      } else {
        throw new Error('Failed to close work order');
      }
    } catch (error) {
      console.error('Error closing work order:', error);
      showAlert('error', 'Failed to close work order');
    }
  };

  // ✅ PHASE 3C: Open new payment modal
  const openPaymentModalNew = (invoice) => {
    setInvoiceToPayment(invoice);
    setShowPaymentModalNew(true);
  };

  // ✅ PHASE 3C: Open close modal
  const openCloseModal = (invoice) => {
    setInvoiceToClose(invoice);
    setShowCloseModal(true);
  };

  return {
    invoices,
    customers,
    jobs,
    loading,
    alert,
    showPaymentModal,
    activeInvoice,
    openPaymentModal,
    setShowPaymentModal,
    recordPayment,
    getCustomerName,
    getJobTitle,
    // ✅ PHASE 3C: New modal states and handlers
    showPaymentModalNew,
    setShowPaymentModalNew,
    invoiceToPayment,
    handlePaymentConfirm,
    openPaymentModalNew,
    showCloseModal,
    setShowCloseModal,
    invoiceToClose,
    handleCloseConfirm,
    openCloseModal
  };
};

export default InvoicesDatabasePanel;

