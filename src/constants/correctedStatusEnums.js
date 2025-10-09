// ========================================
// CORRECTED STATUS ENUMS - MATCHES ACTUAL DATABASE
// Based on schema_dump.json from deploy-enhanced.js --dump
// Date: 2025-09-29
// ========================================

// ========================================
// WORK ORDER STATUS (Actual Database Values)
// ✅ COMPETITIVE ADVANTAGE: Best features from Jobber, Housecall Pro, AND ServiceTitan
// ========================================
export const WORK_ORDER_STATUS = {
  // QUOTE STAGE
  DRAFT: 'draft',
  SENT: 'sent',
  PRESENTED: 'presented',             // NEW - ServiceTitan (in-person quotes)
  CHANGES_REQUESTED: 'changes_requested', // NEW - Jobber (customer wants changes)
  FOLLOW_UP: 'follow_up',             // NEW - ServiceTitan (needs follow-up)
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',                 // NEW - Housecall Pro (auto-expire)
  CANCELLED: 'cancelled',

  // JOB STAGE
  SCHEDULED: 'scheduled',
  PARTS_ORDERED: 'parts_ordered',
  ON_HOLD: 'on_hold',
  IN_PROGRESS: 'in_progress',
  REQUIRES_APPROVAL: 'requires_approval',
  REWORK_NEEDED: 'rework_needed',
  COMPLETED: 'completed',

  // INVOICE STAGE
  INVOICED: 'invoiced',
  PAID: 'paid',
  CLOSED: 'closed'
};

export const WORK_ORDER_STATUS_LABELS = {
  [WORK_ORDER_STATUS.DRAFT]: 'Draft',
  [WORK_ORDER_STATUS.SENT]: 'Sent',
  [WORK_ORDER_STATUS.PRESENTED]: 'Presented',
  [WORK_ORDER_STATUS.CHANGES_REQUESTED]: 'Changes Requested',
  [WORK_ORDER_STATUS.FOLLOW_UP]: 'Follow-up Needed',
  [WORK_ORDER_STATUS.APPROVED]: 'Approved',
  [WORK_ORDER_STATUS.REJECTED]: 'Rejected',
  [WORK_ORDER_STATUS.EXPIRED]: 'Expired',
  [WORK_ORDER_STATUS.CANCELLED]: 'Cancelled',
  [WORK_ORDER_STATUS.SCHEDULED]: 'Scheduled',
  [WORK_ORDER_STATUS.PARTS_ORDERED]: 'Parts Ordered',
  [WORK_ORDER_STATUS.ON_HOLD]: 'On Hold',
  [WORK_ORDER_STATUS.IN_PROGRESS]: 'In Progress',
  [WORK_ORDER_STATUS.REQUIRES_APPROVAL]: 'Requires Approval',
  [WORK_ORDER_STATUS.REWORK_NEEDED]: 'Rework Needed',
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
  [WORK_ORDER_STATUS.APPROVED]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  [WORK_ORDER_STATUS.REJECTED]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  [WORK_ORDER_STATUS.EXPIRED]: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
  [WORK_ORDER_STATUS.CANCELLED]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  [WORK_ORDER_STATUS.SCHEDULED]: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  [WORK_ORDER_STATUS.PARTS_ORDERED]: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  [WORK_ORDER_STATUS.ON_HOLD]: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' },
  [WORK_ORDER_STATUS.IN_PROGRESS]: { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },
  [WORK_ORDER_STATUS.REQUIRES_APPROVAL]: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  [WORK_ORDER_STATUS.REWORK_NEEDED]: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
  [WORK_ORDER_STATUS.COMPLETED]: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  [WORK_ORDER_STATUS.INVOICED]: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  [WORK_ORDER_STATUS.PAID]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  [WORK_ORDER_STATUS.CLOSED]: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
};

// ========================================
// NOTIFICATION STATUS (Actual Database Values)
// ========================================
export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  CLICKED: 'clicked',
  FAILED: 'failed',
  BOUNCED: 'bounced',
  UNSUBSCRIBED: 'unsubscribed'
};

export const NOTIFICATION_STATUS_LABELS = {
  [NOTIFICATION_STATUS.PENDING]: 'Pending',
  [NOTIFICATION_STATUS.SENT]: 'Sent',
  [NOTIFICATION_STATUS.DELIVERED]: 'Delivered',
  [NOTIFICATION_STATUS.READ]: 'Read',
  [NOTIFICATION_STATUS.CLICKED]: 'Clicked',
  [NOTIFICATION_STATUS.FAILED]: 'Failed',
  [NOTIFICATION_STATUS.BOUNCED]: 'Bounced',
  [NOTIFICATION_STATUS.UNSUBSCRIBED]: 'Unsubscribed'
};

// ========================================
// STATUS TRANSITIONS (Business Logic)
// ========================================
export const WORK_ORDER_STATUS_TRANSITIONS = {
  [WORK_ORDER_STATUS.DRAFT]: [WORK_ORDER_STATUS.QUOTE, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.QUOTE]: [WORK_ORDER_STATUS.APPROVED, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.APPROVED]: [WORK_ORDER_STATUS.SCHEDULED, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.SCHEDULED]: [WORK_ORDER_STATUS.IN_PROGRESS, WORK_ORDER_STATUS.CANCELLED, WORK_ORDER_STATUS.ON_HOLD],
  [WORK_ORDER_STATUS.IN_PROGRESS]: [WORK_ORDER_STATUS.COMPLETED, WORK_ORDER_STATUS.ON_HOLD, WORK_ORDER_STATUS.REQUIRES_APPROVAL],
  [WORK_ORDER_STATUS.ON_HOLD]: [WORK_ORDER_STATUS.SCHEDULED, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.REQUIRES_APPROVAL]: [WORK_ORDER_STATUS.COMPLETED, WORK_ORDER_STATUS.REWORK_NEEDED],
  [WORK_ORDER_STATUS.REWORK_NEEDED]: [WORK_ORDER_STATUS.IN_PROGRESS, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.COMPLETED]: [WORK_ORDER_STATUS.INVOICED],
  [WORK_ORDER_STATUS.INVOICED]: [],
  [WORK_ORDER_STATUS.CANCELLED]: []
};

// ========================================
// QUERY HELPERS
// ========================================

// Quote-specific statuses (for Quotes page)
export const QUOTE_STATUSES = [
  WORK_ORDER_STATUS.DRAFT,
  WORK_ORDER_STATUS.QUOTE,
  WORK_ORDER_STATUS.APPROVED
];

// Job-specific statuses (for Jobs page)
export const JOB_STATUSES = [
  WORK_ORDER_STATUS.SCHEDULED,
  WORK_ORDER_STATUS.PARTS_ORDERED,
  WORK_ORDER_STATUS.ON_HOLD,
  WORK_ORDER_STATUS.IN_PROGRESS,
  WORK_ORDER_STATUS.REQUIRES_APPROVAL,
  WORK_ORDER_STATUS.REWORK_NEEDED,
  WORK_ORDER_STATUS.COMPLETED
];

// Invoice-specific statuses (for Invoices page)
export const INVOICE_STATUSES = [
  WORK_ORDER_STATUS.INVOICED
];

// Active work statuses (for scheduling and tracking)
export const ACTIVE_WORK_STATUSES = [
  WORK_ORDER_STATUS.SCHEDULED,
  WORK_ORDER_STATUS.IN_PROGRESS,
  WORK_ORDER_STATUS.ON_HOLD,
  WORK_ORDER_STATUS.REQUIRES_APPROVAL,
  WORK_ORDER_STATUS.REWORK_NEEDED
];

// Helper function to build PostgREST status filters
export const buildStatusFilter = (statuses) => {
  return `status=in.(${statuses.join(',')})`;
};

// Helper function to check if status transition is valid
export const isValidStatusTransition = (fromStatus, toStatus) => {
  const allowedTransitions = WORK_ORDER_STATUS_TRANSITIONS[fromStatus] || [];
  return allowedTransitions.includes(toStatus);
};

// Helper function to get next possible statuses
export const getNextPossibleStatuses = (currentStatus) => {
  return WORK_ORDER_STATUS_TRANSITIONS[currentStatus] || [];
};

// Helper function to determine work order type based on status
export const getWorkOrderType = (status) => {
  if (QUOTE_STATUSES.includes(status)) {
    return 'quote';
  }
  if (JOB_STATUSES.includes(status)) {
    return 'job';
  }
  if (INVOICE_STATUSES.includes(status)) {
    return 'invoice';
  }
  return 'quote'; // Default fallback
};

// ========================================
// STATUS-BASED UI CONFIGURATIONS
// ========================================
export const getStatusConfig = (status) => {
  const configs = {
    [WORK_ORDER_STATUS.DRAFT]: {
      pageTitle: 'Draft',
      actionLabel: 'Create Quote',
      primaryAction: 'CREATE_QUOTE',
      showScheduling: false,
      showInvoicing: false,
      allowEdit: true,
      showCustomerAcceptance: false
    },
    [WORK_ORDER_STATUS.QUOTE]: {
      pageTitle: 'Quote',
      actionLabel: 'Send Quote',
      primaryAction: 'SEND_QUOTE',
      showScheduling: false,
      showInvoicing: false,
      allowEdit: true,
      showCustomerAcceptance: true
    },
    [WORK_ORDER_STATUS.APPROVED]: {
      pageTitle: 'Approved Quote',
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
  
  return configs[status] || configs[WORK_ORDER_STATUS.DRAFT];
};

// ========================================
// MIGRATION HELPERS
// ========================================

// Map old uppercase values to new lowercase values
export const STATUS_MIGRATION_MAP = {
  // Old uppercase -> New lowercase
  'QUOTE': 'quote',
  'ACCEPTED': 'approved',
  'SCHEDULED': 'scheduled',
  'IN_PROGRESS': 'in_progress',
  'COMPLETED': 'completed',
  'INVOICED': 'invoiced',
  'CANCELLED': 'cancelled',
  
  // Notification status migration
  'UNREAD': 'pending',
  'READ': 'read'
};

// Helper function to migrate old status values
export const migrateStatusValue = (oldStatus) => {
  return STATUS_MIGRATION_MAP[oldStatus] || oldStatus.toLowerCase();
};
