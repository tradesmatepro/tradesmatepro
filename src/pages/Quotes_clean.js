import React, { useState, useEffect } from 'react';
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { supaFetch } from '../utils/supaFetch';
import { createCurrencyInputProps, createPercentageInputProps } from '../utils/inputUtils';
import PageHeader from '../components/Common/PageHeader';
import WorkflowGuide from '../components/WorkflowGuide';
import {
  PlusIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  BriefcaseIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';

// Progress Stepper Component
const ProgressStepper = ({ currentStep }) => {
  const steps = [
    { id: 'draft', label: 'Draft', icon: DocumentTextIcon },
    { id: 'sent', label: 'Sent', icon: PaperAirplaneIcon },
    { id: 'accepted', label: 'Accepted', icon: CheckCircleIcon },
    { id: 'job', label: 'Job', icon: BriefcaseIcon },
    { id: 'work_order', label: 'Work Order', icon: ClipboardDocumentListIcon },
    { id: 'invoice', label: 'Invoice', icon: CurrencyDollarIcon }
  ];

  const getStepIndex = (step) => {
    const stepMap = {
      'DRAFT': 0,
      'SENT': 1,
      'ACCEPTED': 2,
      'REJECTED': 1, // Show as sent but failed
      'JOB': 3,
      'WORK_ORDER': 4,
      'INVOICE': 5
    };
    return stepMap[step] || 0;
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isFailed = currentStep === 'REJECTED' && index === 1;

          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isFailed ? 'border-red-500 bg-red-50' :
                isActive ? 'border-primary-500 bg-primary-50' :
                isCompleted ? 'border-green-500 bg-green-50' :
                'border-gray-300 bg-gray-50'
              }`}>
                <Icon className={`w-5 h-5 ${
                  isFailed ? 'text-red-500' :
                  isActive ? 'text-primary-500' :
                  isCompleted ? 'text-green-500' :
                  'text-gray-400'
                }`} />
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${
                  isFailed ? 'text-red-700' :
                  isActive ? 'text-primary-700' :
                  isCompleted ? 'text-green-700' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </div>
              </div>
              {index < steps.length - 1 && (
                <ChevronRightIcon className="w-5 h-5 text-gray-400 mx-4" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Quotes = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  // Core data
  const [quotes, setQuotes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, draft, sent, accepted, rejected
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Form data
  const [formData, setFormData] = useState({
    customer_id: '',
    title: '',
    description: '',
    line_items: [],
    subtotal: 0,
    tax_rate: 0,
    tax_amount: 0,
    total_amount: 0,
    status: 'DRAFT',
    expiration_date: '',
    notes: ''
  });

  useEffect(() => {
    if (user?.company_id) {
      loadAllData();
    }
  }, [user?.company_id]);

  useEffect(() => {
    // Handle URL parameters
    const params = new URLSearchParams(routerLocation.search);
    const q = params.get('q');
    const isNew = params.get('new') === 'quote';
    const customerId = params.get('customer');

    if (q && q !== searchTerm) setSearchTerm(q);
    if (isNew && !showCreateForm) setShowCreateForm(true);
    if (customerId && !formData.customer_id) {
      setFormData(prev => ({ ...prev, customer_id: customerId }));
    }
  }, [routerLocation.search]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadQuotes(),
        loadCustomers(),
        loadJobs()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showAlert('error', 'Failed to load quotes data');
    } finally {
      setLoading(false);
    }
  };

  const loadQuotes = async () => {
    try {
      // Use status field - show all quote statuses
      const response = await supaFetch('work_orders?select=*,customers(name,email,phone)&status=in.(QUOTE,SENT,ACCEPTED,REJECTED)&order=created_at.desc', { method: 'GET' }, user.company_id);
      if (response.ok) {
        const data = await response.json();
        setQuotes(data || []);
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await supaFetch('customers?select=*&order=name.asc', { method: 'GET' }, user.company_id);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data || []);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadJobs = async () => {
    try {
      // ✅ FIXED: Use lowercase status values (enum cleanup)
      const response = await supaFetch('work_orders?select=*&status=in.(draft,scheduled,in_progress,completed,cancelled)&order=created_at.desc', { method: 'GET' }, user.company_id);
      if (response.ok) {
        const data = await response.json();
        setJobs(data || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  // Calculate quote analytics
  const getQuoteAnalytics = () => {
    const totalQuotes = quotes.length;
    const draftQuotes = quotes.filter(q => q.quote_status === 'DRAFT').length;
    const sentQuotes = quotes.filter(q => q.quote_status === 'SENT').length;
    const acceptedQuotes = quotes.filter(q => q.quote_status === 'ACCEPTED').length;
    const rejectedQuotes = quotes.filter(q => q.quote_status === 'REJECTED').length;

    const totalValue = quotes.reduce((sum, q) => sum + (parseFloat(q.total_amount) || 0), 0);
    const outstandingValue = quotes
      .filter(q => q.quote_status === 'SENT')
      .reduce((sum, q) => sum + (parseFloat(q.total_amount) || 0), 0);

    const conversionRate = sentQuotes > 0 ? (acceptedQuotes / sentQuotes) * 100 : 0;

    // Check for expiring quotes
    const today = new Date();
    const expiringQuotes = quotes.filter(q => {
      if (q.quote_status !== 'SENT' || !q.expiration_date) return false;
      const expirationDate = new Date(q.expiration_date);
      const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiration <= 7 && daysUntilExpiration >= 0;
    });

    const expiredQuotes = quotes.filter(q => {
      if (q.quote_status !== 'SENT' || !q.expiration_date) return false;
      const expirationDate = new Date(q.expiration_date);
      return expirationDate < today;
    });

    return {
      totalQuotes,
      draftQuotes,
      sentQuotes,
      acceptedQuotes,
      rejectedQuotes,
      totalValue,
      outstandingValue,
      conversionRate,
      expiringQuotes,
      expiredQuotes
    };
  };

  const analytics = getQuoteAnalytics();

  // Filter quotes
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = !searchTerm ||
      quote.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.id?.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'draft' && quote.quote_status === 'DRAFT') ||
      (statusFilter === 'sent' && quote.quote_status === 'SENT') ||
      (statusFilter === 'accepted' && quote.quote_status === 'ACCEPTED') ||
      (statusFilter === 'rejected' && quote.quote_status === 'REJECTED');

    return matchesSearch && matchesStatus;
  });

  // Utility functions
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      title: '',
      description: '',
      line_items: [],
      subtotal: 0,
      tax_rate: 0,
      tax_amount: 0,
      total_amount: 0,
      quote_status: 'DRAFT',
      expiration_date: '',
      notes: ''
    });
  };

  // ✅ FIXED: Use lowercase status values (enum cleanup)
  const getStatusBadge = (status) => {
    const statusMap = {
      'draft': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      'sent': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sent' },
      'approved': { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' }
    };
    return statusMap[status] || statusMap['draft'];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const isExpiring = (quote) => {
    if (quote.quote_status !== 'SENT' || !quote.expiration_date) return false;
    const today = new Date();
    const expirationDate = new Date(quote.expiration_date);
    const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 7 && daysUntilExpiration >= 0;
  };

  const isExpired = (quote) => {
    if (quote.quote_status !== 'SENT' || !quote.expiration_date) return false;
    const today = new Date();
    const expirationDate = new Date(quote.expiration_date);
    return expirationDate < today;
  };

  // Form handlers
  const handleCreateQuote = async (e) => {
    e.preventDefault();
    try {
      const response = await supaFetch('work_orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // NO stage column - only status (work_order_status_enum)
          status: (formData.status || 'quote').toLowerCase(),
          company_id: user.company_id,
          created_by: user.id
        })
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Quote created successfully!');
        setShowCreateForm(false);
        resetForm();
        await loadQuotes();
      } else {
        showAlert('error', 'Failed to create quote');
      }
    } catch (error) {
      console.error('Error creating quote:', error);
      showAlert('error', 'Failed to create quote');
    }
  };

  const handleUpdateQuote = async (e) => {
    e.preventDefault();
    try {
      const response = await supaFetch(`work_orders?id=eq.${selectedQuote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Quote updated successfully!');
        setShowEditForm(false);
        resetForm();
        await loadQuotes();
      } else {
        showAlert('error', 'Failed to update quote');
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      showAlert('error', 'Failed to update quote');
    }
  };

  const handleDeleteQuote = async (quoteId) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;

    try {
      const response = await supaFetch(`work_orders?id=eq.${quoteId}`, {
        method: 'DELETE'
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Quote deleted successfully!');
        await loadQuotes();
      } else {
        showAlert('error', 'Failed to delete quote');
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      showAlert('error', 'Failed to delete quote');
    }
  };

  const handleSendQuote = async (quoteId) => {
    try {
      const response = await supaFetch(`work_orders?id=eq.${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_status: 'SENT' })
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Quote sent successfully!');
        await loadQuotes();
      } else {
        showAlert('error', 'Failed to send quote');
      }
    } catch (error) {
      console.error('Error sending quote:', error);
      showAlert('error', 'Failed to send quote');
    }
  };

  const handleAcceptQuote = async (quoteId) => {
    try {
      const response = await supaFetch(`work_orders?id=eq.${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_status: 'ACCEPTED' })
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Quote accepted successfully!');
        await loadQuotes();
      } else {
        showAlert('error', 'Failed to accept quote');
      }
    } catch (error) {
      console.error('Error accepting quote:', error);
      showAlert('error', 'Failed to accept quote');
    }
  };

  const handleRejectQuote = async (quoteId) => {
    try {
      const response = await supaFetch(`work_orders?id=eq.${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_status: 'REJECTED' })
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Quote rejected');
        await loadQuotes();
      } else {
        showAlert('error', 'Failed to reject quote');
      }
    } catch (error) {
      console.error('Error rejecting quote:', error);
      showAlert('error', 'Failed to reject quote');
    }
  };

  const handleConvertToJob = async (quoteId) => {
    try {
      const quote = quotes.find(q => q.id === quoteId);
      if (!quote) return;

      // ✅ UPDATE existing work order instead of creating duplicate
      const response = await supaFetch(`work_orders?id=eq.${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          quote_accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }, user.company_id);

      if (response.ok) {
        showAlert('success', 'Quote converted to job successfully!');
        await loadQuotes();
        navigate('/jobs');
      } else {
        showAlert('error', 'Failed to convert quote to job');
      }
    } catch (error) {
      console.error('Error converting quote to job:', error);
      showAlert('error', 'Failed to convert quote to job');
    }
  };

  const openEditForm = (quote) => {
    setSelectedQuote(quote);
    setFormData({
      customer_id: quote.customer_id || '',
      title: quote.title || '',
      description: quote.description || '',
      line_items: quote.line_items || [],
      subtotal: quote.subtotal || 0,
      tax_rate: quote.tax_rate || 0,
      tax_amount: quote.tax_amount || 0,
      total_amount: quote.total_amount || 0,
      quote_status: quote.quote_status || 'DRAFT',
      expiration_date: quote.expiration_date || '',
      notes: quote.notes || ''
    });
    setShowEditForm(true);
  };

  const openProfileModal = (quote) => {
    setSelectedQuote(quote);
    setShowProfileModal(true);
  };

  // Quotes Table Component
  const QuotesTable = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quote Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredQuotes.map((quote) => {
              const statusBadge = getStatusBadge(quote.quote_status);
              const customer = customers.find(c => c.id === quote.customer_id);

              return (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{quote.id} - {quote.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {quote.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer ? customer.name : 'Unknown Customer'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.className}`}>
                      {statusBadge.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${quote.total_amount?.toLocaleString() || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openProfileModal(quote)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openEditForm(quote)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      {quote.quote_status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleConvertToJob(quote.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Convert to Job
                        </button>
                      )}
                      <button
                        onClick={() => deleteQuote(quote.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Quote Form Component
  const QuoteForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create New Quote</h3>
          <button
            onClick={() => setShowCreateForm(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleCreateQuote}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer *
              </label>
              <select
                required
                value={formData.customer_id}
                onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quote Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="HVAC Installation, Electrical Repair, etc."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Detailed description of work to be performed..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.quote_status}
                onChange={(e) => setFormData({...formData, quote_status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {/* ✅ COMPETITIVE ADVANTAGE - Best of Jobber, Housecall Pro, ServiceTitan */}
                <optgroup label="Quote Stage">
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="presented">Presented (In-Person)</option>
                  <option value="changes_requested">Changes Requested</option>
                  <option value="follow_up">Follow-up Needed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </optgroup>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                <strong>New!</strong> Presented (ServiceTitan) | Changes Requested (Jobber) | Follow-up (ServiceTitan) | Expired (Housecall Pro)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData({...formData, expiration_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Internal notes..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
            >
              Create Quote
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Quote Edit Form Component
  const QuoteEditForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Edit Quote</h3>
          <button
            onClick={() => setShowEditForm(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleUpdateQuote}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer *
              </label>
              <select
                required
                value={formData.customer_id}
                onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quote Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="HVAC Installation, Electrical Repair, etc."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Detailed description of work to be performed..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.quote_status}
                onChange={(e) => setFormData({...formData, quote_status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {/* ✅ COMPETITIVE ADVANTAGE - Best of Jobber, Housecall Pro, ServiceTitan */}
                <optgroup label="Quote Stage">
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="presented">Presented (In-Person)</option>
                  <option value="changes_requested">Changes Requested</option>
                  <option value="follow_up">Follow-up Needed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </optgroup>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                <strong>New!</strong> Presented (ServiceTitan) | Changes Requested (Jobber) | Follow-up (ServiceTitan) | Expired (Housecall Pro)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData({...formData, expiration_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Internal notes..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowEditForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
            >
              Update Quote
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Quote Profile Modal Component
  const QuoteProfileModal = () => {
    if (!selectedQuote) return null;

    const customer = customers.find(c => c.id === selectedQuote.customer_id);

    // Status history timeline
    const statusHistory = [
      { status: 'QUOTE', date: selectedQuote.created_at, label: 'Quote Created' },
      selectedQuote.status !== 'QUOTE' && { status: 'SENT', date: selectedQuote.updated_at, label: 'Quote Sent' },
      (selectedQuote.status === 'ACCEPTED' || selectedQuote.status === 'REJECTED') && {
        status: selectedQuote.status,
        date: selectedQuote.updated_at,
        label: selectedQuote.status === 'ACCEPTED' ? 'Quote Accepted' : 'Quote Rejected'
      }
    ].filter(Boolean);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quote #{selectedQuote.id}</h2>
              <p className="text-gray-600">{selectedQuote.title}</p>
            </div>
            <button
              onClick={() => setShowProfileModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex h-[calc(90vh-120px)]">
            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quote Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quote ID:</span>
                        <span className="font-medium">#{selectedQuote.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Title:</span>
                        <span className="font-medium">{selectedQuote.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedQuote.quote_status).className}`}>
                          {getStatusBadge(selectedQuote.quote_status).text}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-medium text-lg">${selectedQuote.total_amount?.toLocaleString() || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span>{new Date(selectedQuote.created_at).toLocaleDateString()}</span>
                      </div>
                      {selectedQuote.expiration_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expires:</span>
                          <span>{new Date(selectedQuote.expiration_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Information */}
                  {customer && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{customer.name}</span>
                        </div>
                        {customer.email && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description and Notes */}
                <div className="space-y-6">
                  {selectedQuote.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedQuote.description}</p>
                      </div>
                    </div>
                  )}

                  {selectedQuote.notes && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedQuote.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
                    <div className="space-y-3">
                      {statusHistory.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            item.status === 'ACCEPTED' ? 'bg-green-500' :
                            item.status === 'REJECTED' ? 'bg-red-500' :
                            item.status === 'SENT' ? 'bg-blue-500' :
                            'bg-gray-400'
                          }`}></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{item.label}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  openEditForm(selectedQuote);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
              >
                Edit Quote
              </button>
              {selectedQuote.quote_status === 'ACCEPTED' && (
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleConvertToJob(selectedQuote.id);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                >
                  Convert to Job
                </button>
              )}
            </div>
            <button
              onClick={() => setShowProfileModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Quotes"
        subtitle="Create estimates for customers - accepted quotes automatically become jobs"
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Quotes' }]}
      >
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Create Quote
        </button>
      </PageHeader>

      {/* Alert */}
      {alert.show && (
        <div className={`p-4 rounded-md ${
          alert.type === 'success' ? 'bg-green-100 text-green-700' :
          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {alert.message}
        </div>
      )}

      {/* Workflow Guide */}
      <WorkflowGuide currentStep="quote" />

      {/* Progress Stepper */}
      <ProgressStepper currentStep="DRAFT" />

      {/* Expiration Alerts */}
      {analytics.expiringQuotes.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIconSolid className="w-5 h-5 text-yellow-400 mr-2" />
            <div className="text-sm text-yellow-800">
              <strong>{analytics.expiringQuotes.length}</strong> quotes expiring within 7 days
            </div>
          </div>
        </div>
      )}

      {analytics.expiredQuotes.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircleIcon className="w-5 h-5 text-red-400 mr-2" />
            <div className="text-sm text-red-800">
              <strong>{analytics.expiredQuotes.length}</strong> quotes have expired
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <DocumentTextIcon className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">{analytics.totalQuotes}</div>
              <div className="text-sm text-gray-500">Total Quotes</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-gray-500" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">{analytics.draftQuotes}</div>
              <div className="text-sm text-gray-500">Draft</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <PaperAirplaneIcon className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">{analytics.sentQuotes}</div>
              <div className="text-sm text-gray-500">Sent</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">{analytics.acceptedQuotes}</div>
              <div className="text-sm text-gray-500">Accepted</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <XCircleIcon className="w-8 h-8 text-red-500" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">{analytics.rejectedQuotes}</div>
              <div className="text-sm text-gray-500">Rejected</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalValue)}</div>
              <div className="text-sm text-gray-500">Total Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{analytics.conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-500">Conversion Rate</div>
            </div>
            <div className="text-xs text-gray-400">
              {analytics.acceptedQuotes} accepted Ã· {analytics.sentQuotes} sent
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.outstandingValue)}</div>
              <div className="text-sm text-gray-500">Outstanding Value</div>
            </div>
            <div className="text-xs text-gray-400">
              Sent but not accepted
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search quotes by title, customer, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Quotes</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            {filteredQuotes.length} quotes found
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <div className="mt-2 text-gray-600">Loading quotes...</div>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first quote</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Create Quote
          </button>
        </div>
      ) : (
        <QuotesTable />
      )}

      {/* Modals */}
      {showCreateForm && <QuoteForm />}
      {showEditForm && <QuoteEditForm />}
      {showProfileModal && <QuoteProfileModal />}
    </div>
  );
};

export default Quotes;
