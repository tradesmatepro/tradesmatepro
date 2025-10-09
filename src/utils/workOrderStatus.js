// Work Order Status System - Single Document Workflow

export const WORK_ORDER_STATUS = {
  QUOTE: 'quote',
  SENT: 'sent',
  ACCEPTED: 'approved',
  REJECTED: 'rejected',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  INVOICED: 'invoiced',
  CANCELLED: 'cancelled'
};

export const WORK_ORDER_STATUS_LABELS = {
  [WORK_ORDER_STATUS.QUOTE]: 'Quote',
  [WORK_ORDER_STATUS.SENT]: 'Sent',
  [WORK_ORDER_STATUS.ACCEPTED]: 'Accepted',
  [WORK_ORDER_STATUS.REJECTED]: 'Rejected',
  [WORK_ORDER_STATUS.SCHEDULED]: 'Scheduled',
  [WORK_ORDER_STATUS.IN_PROGRESS]: 'In Progress',
  [WORK_ORDER_STATUS.COMPLETED]: 'Completed',
  [WORK_ORDER_STATUS.INVOICED]: 'Invoiced',
  [WORK_ORDER_STATUS.CANCELLED]: 'Cancelled'
};

export const WORK_ORDER_STATUS_COLORS = {
  [WORK_ORDER_STATUS.QUOTE]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  [WORK_ORDER_STATUS.SENT]: { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },
  [WORK_ORDER_STATUS.ACCEPTED]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  [WORK_ORDER_STATUS.REJECTED]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  [WORK_ORDER_STATUS.SCHEDULED]: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  [WORK_ORDER_STATUS.IN_PROGRESS]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  [WORK_ORDER_STATUS.COMPLETED]: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  [WORK_ORDER_STATUS.INVOICED]: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  [WORK_ORDER_STATUS.CANCELLED]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
};

// Status progression rules
export const STATUS_TRANSITIONS = {
  [WORK_ORDER_STATUS.QUOTE]: [WORK_ORDER_STATUS.SENT, WORK_ORDER_STATUS.ACCEPTED, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.SENT]: [WORK_ORDER_STATUS.ACCEPTED, WORK_ORDER_STATUS.REJECTED, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.ACCEPTED]: [WORK_ORDER_STATUS.SCHEDULED, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.SCHEDULED]: [WORK_ORDER_STATUS.IN_PROGRESS, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.IN_PROGRESS]: [WORK_ORDER_STATUS.COMPLETED, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.COMPLETED]: [WORK_ORDER_STATUS.INVOICED],
  [WORK_ORDER_STATUS.INVOICED]: [],
  [WORK_ORDER_STATUS.CANCELLED]: []
};

// Get allowed next statuses
export const getAllowedNextStatuses = (currentStatus) => {
  return STATUS_TRANSITIONS[currentStatus] || [];
};

// Check if status transition is allowed
export const isStatusTransitionAllowed = (fromStatus, toStatus) => {
  const allowedStatuses = STATUS_TRANSITIONS[fromStatus] || [];
  return allowedStatuses.includes(toStatus);
};

// Get status badge component props
export const getStatusBadgeProps = (status) => {
  const colors = WORK_ORDER_STATUS_COLORS[status] || WORK_ORDER_STATUS_COLORS[WORK_ORDER_STATUS.QUOTE];
  const label = WORK_ORDER_STATUS_LABELS[status] || status;
  
  return {
    label,
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`
  };
};

// Status-based UI configurations
export const getStatusConfig = (status) => {
  const configs = {
    [WORK_ORDER_STATUS.QUOTE]: {
      pageTitle: 'Quote',
      actionLabel: 'Send Quote',
      primaryAction: 'SEND',
      showScheduling: false,
      showInvoicing: false,
      allowEdit: true,
      showCustomerAcceptance: true
    },
    [WORK_ORDER_STATUS.ACCEPTED]: {
      pageTitle: 'Accepted Quote',
      actionLabel: 'Schedule Job',
      primaryAction: 'SCHEDULE',
      showScheduling: true,
      showInvoicing: false,
      allowEdit: true,
      showCustomerAcceptance: false
    },
    [WORK_ORDER_STATUS.SCHEDULED]: {
      pageTitle: 'Scheduled Job',
      actionLabel: 'Start Job',
      primaryAction: 'START',
      showScheduling: true,
      showInvoicing: false,
      allowEdit: true,
      showCustomerAcceptance: false
    },
    [WORK_ORDER_STATUS.IN_PROGRESS]: {
      pageTitle: 'Job in Progress',
      actionLabel: 'Complete Job',
      primaryAction: 'COMPLETE',
      showScheduling: true,
      showInvoicing: false,
      allowEdit: true,
      showCustomerAcceptance: false
    },
    [WORK_ORDER_STATUS.COMPLETED]: {
      pageTitle: 'Completed Job',
      actionLabel: 'Create Invoice',
      primaryAction: 'INVOICE',
      showScheduling: true,
      showInvoicing: true,
      allowEdit: false,
      showCustomerAcceptance: false
    },
    [WORK_ORDER_STATUS.INVOICED]: {
      pageTitle: 'Invoice',
      actionLabel: 'Mark Paid',
      primaryAction: 'PAYMENT',
      showScheduling: true,
      showInvoicing: true,
      allowEdit: false,
      showCustomerAcceptance: false
    },
    [WORK_ORDER_STATUS.CANCELLED]: {
      pageTitle: 'Cancelled',
      actionLabel: null,
      primaryAction: null,
      showScheduling: false,
      showInvoicing: false,
      allowEdit: false,
      showCustomerAcceptance: false
    }
  };
  
  return configs[status] || configs[WORK_ORDER_STATUS.QUOTE];
};

// Get work order type based on status (for navigation/filtering)
export const getWorkOrderType = (status) => {
  if ([WORK_ORDER_STATUS.QUOTE, WORK_ORDER_STATUS.SENT].includes(status)) {
    return 'quote';
  }
  if ([WORK_ORDER_STATUS.ACCEPTED, WORK_ORDER_STATUS.SCHEDULED, WORK_ORDER_STATUS.IN_PROGRESS, WORK_ORDER_STATUS.COMPLETED].includes(status)) {
    return 'job';
  }
  if (status === WORK_ORDER_STATUS.INVOICED) {
    return 'invoice';
  }
  return 'quote';
};

// Status progression helpers
export const canSchedule = (status) => {
  return [WORK_ORDER_STATUS.ACCEPTED, WORK_ORDER_STATUS.SCHEDULED].includes(status);
};

export const canStart = (status) => {
  return status === WORK_ORDER_STATUS.SCHEDULED;
};

export const canComplete = (status) => {
  return status === WORK_ORDER_STATUS.IN_PROGRESS;
};

export const canInvoice = (status) => {
  return status === WORK_ORDER_STATUS.COMPLETED;
};

export const canEdit = (status) => {
  return ![WORK_ORDER_STATUS.INVOICED, WORK_ORDER_STATUS.CANCELLED].includes(status);
};

// Payment status for invoiced work orders
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL', 
  PAID: 'PAID',
  OVERDUE: 'OVERDUE'
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.PARTIAL]: 'Partially Paid',
  [PAYMENT_STATUS.PAID]: 'Paid',
  [PAYMENT_STATUS.OVERDUE]: 'Overdue'
};

export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.PENDING]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  [PAYMENT_STATUS.PARTIAL]: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200'
  },
  [PAYMENT_STATUS.PAID]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  [PAYMENT_STATUS.OVERDUE]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  }
};

// Get payment status badge props
export const getPaymentStatusBadgeProps = (paymentStatus) => {
  const colors = PAYMENT_STATUS_COLORS[paymentStatus] || PAYMENT_STATUS_COLORS[PAYMENT_STATUS.PENDING];
  const label = PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus;
  
  return {
    label,
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`
  };
};

// Default work order structure
export const createDefaultWorkOrder = (companyId, userId) => ({
  company_id: companyId,
  title: '',
  description: '',
  customer_id: '',
  status: WORK_ORDER_STATUS.QUOTE,
  assigned_technician_id: '',
  start_time: '',
  end_time: '',
  estimated_duration: 120,
  work_location: '',
  subtotal: 0,
  tax_rate: 8.25,
  tax_amount: 0,
  total_amount: 0,
  notes: '',
  internal_notes: '',
  created_by: userId,
  work_order_items: [{
    item_name: '',
    description: '',
    item_type: 'labor',
    quantity: 1,
    rate: 75.00,
    total: 75.00,
    is_overtime: false
  }]
});

export default {
  WORK_ORDER_STATUS,
  WORK_ORDER_STATUS_LABELS,
  WORK_ORDER_STATUS_COLORS,
  STATUS_TRANSITIONS,
  getAllowedNextStatuses,
  isStatusTransitionAllowed,
  getStatusBadgeProps,
  getStatusConfig,
  getWorkOrderType,
  canSchedule,
  canStart,
  canComplete,
  canInvoice,
  canEdit,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  getPaymentStatusBadgeProps,
  createDefaultWorkOrder
};
