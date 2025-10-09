// Industry Standard Status Enums - Single Source of Truth
// Based on PHASE1_INDUSTRY_CORRECTED.sql schema

// ========================================
// WORK ORDER STATUS (Unified Pipeline)
// ✅ COMPETITIVE ADVANTAGE: Best features from Jobber, Housecall Pro, AND ServiceTitan
// ========================================
export const WORK_ORDER_STATUS = {
  // QUOTE STAGE
  DRAFT: 'draft',                     // Quote not sent yet
  SENT: 'sent',                       // Quote sent to customer
  PRESENTED: 'presented',             // Quote shown in person (ServiceTitan)
  CHANGES_REQUESTED: 'changes_requested', // Customer wants modifications (Jobber)
  FOLLOW_UP: 'follow_up',             // Needs follow-up (ServiceTitan)
  ACCEPTED: 'approved',               // Customer accepted (mapped to 'approved')
  REJECTED: 'rejected',               // Customer rejected
  EXPIRED: 'expired',                 // Quote expired (Housecall Pro)
  CANCELLED: 'cancelled',             // Quote cancelled

  // JOB STAGE
  SCHEDULED: 'scheduled',             // Job scheduled
  IN_PROGRESS: 'in_progress',         // Job in progress
  ON_HOLD: 'on_hold',                 // Job on hold (paused)
  NEEDS_RESCHEDULING: 'needs_rescheduling', // Job needs rescheduling
  COMPLETED: 'completed',             // Job completed

  // INVOICE STAGE
  INVOICED: 'invoiced',               // Invoice created
  PAID: 'paid',                       // Invoice paid
  CLOSED: 'closed'                    // Work order closed
};

export const WORK_ORDER_STATUS_LABELS = {
  [WORK_ORDER_STATUS.DRAFT]: 'Draft',
  [WORK_ORDER_STATUS.SENT]: 'Sent',
  [WORK_ORDER_STATUS.PRESENTED]: 'Presented',
  [WORK_ORDER_STATUS.CHANGES_REQUESTED]: 'Changes Requested',
  [WORK_ORDER_STATUS.FOLLOW_UP]: 'Follow-up Needed',
  [WORK_ORDER_STATUS.ACCEPTED]: 'Approved',
  [WORK_ORDER_STATUS.REJECTED]: 'Rejected',
  [WORK_ORDER_STATUS.EXPIRED]: 'Expired',
  [WORK_ORDER_STATUS.CANCELLED]: 'Cancelled',
  [WORK_ORDER_STATUS.SCHEDULED]: 'Scheduled',
  [WORK_ORDER_STATUS.IN_PROGRESS]: 'In Progress',
  [WORK_ORDER_STATUS.ON_HOLD]: 'On Hold',
  [WORK_ORDER_STATUS.NEEDS_RESCHEDULING]: 'Needs Rescheduling',
  [WORK_ORDER_STATUS.COMPLETED]: 'Completed',
  [WORK_ORDER_STATUS.INVOICED]: 'Invoiced',
  [WORK_ORDER_STATUS.PAID]: 'Paid',
  [WORK_ORDER_STATUS.CLOSED]: 'Closed'
};

export const WORK_ORDER_STATUS_COLORS = {
  [WORK_ORDER_STATUS.DRAFT]: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  [WORK_ORDER_STATUS.SENT]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  [WORK_ORDER_STATUS.PRESENTED]: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  [WORK_ORDER_STATUS.CHANGES_REQUESTED]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  [WORK_ORDER_STATUS.FOLLOW_UP]: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  [WORK_ORDER_STATUS.ACCEPTED]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  [WORK_ORDER_STATUS.REJECTED]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  [WORK_ORDER_STATUS.EXPIRED]: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
  [WORK_ORDER_STATUS.CANCELLED]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  [WORK_ORDER_STATUS.SCHEDULED]: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  [WORK_ORDER_STATUS.IN_PROGRESS]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  [WORK_ORDER_STATUS.ON_HOLD]: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  [WORK_ORDER_STATUS.NEEDS_RESCHEDULING]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  [WORK_ORDER_STATUS.COMPLETED]: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  [WORK_ORDER_STATUS.INVOICED]: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  [WORK_ORDER_STATUS.PAID]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  [WORK_ORDER_STATUS.CLOSED]: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
};

// ========================================
// INVOICE STATUS (Industry Standard)
// ========================================
export const INVOICE_STATUS = {
  UNPAID: 'UNPAID',                 // Not paid
  PARTIALLY_PAID: 'PARTIALLY_PAID', // Partially paid
  PAID: 'PAID',                     // Fully paid
  OVERDUE: 'OVERDUE',               // Past due date
  VOID: 'VOID'                      // Voided invoice
};

export const INVOICE_STATUS_LABELS = {
  [INVOICE_STATUS.UNPAID]: 'Unpaid',
  [INVOICE_STATUS.PARTIALLY_PAID]: 'Partially Paid',
  [INVOICE_STATUS.PAID]: 'Paid',
  [INVOICE_STATUS.OVERDUE]: 'Overdue',
  [INVOICE_STATUS.VOID]: 'Void'
};

export const INVOICE_STATUS_COLORS = {
  [INVOICE_STATUS.UNPAID]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  [INVOICE_STATUS.PARTIALLY_PAID]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  [INVOICE_STATUS.PAID]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  [INVOICE_STATUS.OVERDUE]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  },
  [INVOICE_STATUS.VOID]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  }
};

// ========================================
// STATUS TRANSITIONS (Business Logic)
// ========================================
export const WORK_ORDER_STATUS_TRANSITIONS = {
  [WORK_ORDER_STATUS.QUOTE]: [WORK_ORDER_STATUS.SENT, WORK_ORDER_STATUS.ACCEPTED, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.SENT]: [WORK_ORDER_STATUS.ACCEPTED, WORK_ORDER_STATUS.REJECTED, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.ACCEPTED]: [WORK_ORDER_STATUS.SCHEDULED, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.SCHEDULED]: [WORK_ORDER_STATUS.IN_PROGRESS, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.IN_PROGRESS]: [WORK_ORDER_STATUS.COMPLETED, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.COMPLETED]: [WORK_ORDER_STATUS.INVOICED],
  [WORK_ORDER_STATUS.INVOICED]: [],
  [WORK_ORDER_STATUS.CANCELLED]: []
};

export const INVOICE_STATUS_TRANSITIONS = {
  [INVOICE_STATUS.UNPAID]: [INVOICE_STATUS.PARTIALLY_PAID, INVOICE_STATUS.PAID, INVOICE_STATUS.OVERDUE, INVOICE_STATUS.VOID],
  [INVOICE_STATUS.PARTIALLY_PAID]: [INVOICE_STATUS.PAID, INVOICE_STATUS.VOID],
  [INVOICE_STATUS.OVERDUE]: [INVOICE_STATUS.PAID, INVOICE_STATUS.VOID],
  [INVOICE_STATUS.PAID]: [INVOICE_STATUS.VOID],
  [INVOICE_STATUS.VOID]: []
};

// ========================================
// HELPER FUNCTIONS
// ========================================

// Get status badge props for work orders
export const getWorkOrderStatusBadgeProps = (status) => {
  const colors = WORK_ORDER_STATUS_COLORS[status] || WORK_ORDER_STATUS_COLORS[WORK_ORDER_STATUS.QUOTE];
  const label = WORK_ORDER_STATUS_LABELS[status] || status;
  
  return {
    label,
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`
  };
};

// Get status badge props for invoices
export const getInvoiceStatusBadgeProps = (status) => {
  const colors = INVOICE_STATUS_COLORS[status] || INVOICE_STATUS_COLORS[INVOICE_STATUS.UNPAID];
  const label = INVOICE_STATUS_LABELS[status] || status;
  
  return {
    label,
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`
  };
};

// Check if status transition is allowed
export const isWorkOrderStatusTransitionAllowed = (fromStatus, toStatus) => {
  const allowedStatuses = WORK_ORDER_STATUS_TRANSITIONS[fromStatus] || [];
  return allowedStatuses.includes(toStatus);
};

export const isInvoiceStatusTransitionAllowed = (fromStatus, toStatus) => {
  const allowedStatuses = INVOICE_STATUS_TRANSITIONS[fromStatus] || [];
  return allowedStatuses.includes(toStatus);
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

export const canAssign = (status) => {
  // Assignment is allowed while scheduled
  return status === WORK_ORDER_STATUS.SCHEDULED;
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

// Invoice helpers
export const isInvoiceOverdue = (dueDate, status) => {
  if ([INVOICE_STATUS.PAID, INVOICE_STATUS.VOID].includes(status)) return false;
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export const isInvoicePayable = (status) => {
  return [INVOICE_STATUS.UNPAID, INVOICE_STATUS.PARTIALLY_PAID, INVOICE_STATUS.OVERDUE].includes(status);
};

// ========================================
// ENTITY STATUS ENUMS
// ========================================
export const COMPANY_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

export const CUSTOMER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

export default {
  // Work Order
  WORK_ORDER_STATUS,
  WORK_ORDER_STATUS_LABELS,
  WORK_ORDER_STATUS_COLORS,
  WORK_ORDER_STATUS_TRANSITIONS,
  getWorkOrderStatusBadgeProps,
  isWorkOrderStatusTransitionAllowed,
  getWorkOrderType,
  canSchedule,
  canAssign,
  canStart,
  canComplete,
  canInvoice,
  canEdit,
  
  // Invoice
  INVOICE_STATUS,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_TRANSITIONS,
  getInvoiceStatusBadgeProps,
  isInvoiceStatusTransitionAllowed,
  isInvoiceOverdue,
  isInvoicePayable,
  
  // Entity Status
  COMPANY_STATUS,
  CUSTOMER_STATUS,
  USER_STATUS
};
