// ========================================
// SMART STATUS FILTERING SYSTEM
// Shows only relevant statuses per page/context
// ========================================

import { WORK_ORDER_STATUS, WORK_ORDER_STATUS_LABELS, WORK_ORDER_STATUS_COLORS } from '../constants/statusEnums';

// ========================================
// PAGE-SPECIFIC STATUS FILTERS
// ========================================

/**
 * Get statuses relevant to Quotes page
 * Includes competitive advantage statuses (presented, changes_requested, follow_up)
 */
export const getQuoteStatuses = () => [
  WORK_ORDER_STATUS.DRAFT,
  WORK_ORDER_STATUS.SENT,
  WORK_ORDER_STATUS.PRESENTED,           // ✅ ServiceTitan feature
  WORK_ORDER_STATUS.CHANGES_REQUESTED,   // ✅ Jobber pain point fix
  WORK_ORDER_STATUS.FOLLOW_UP,           // ✅ ServiceTitan feature
  WORK_ORDER_STATUS.ACCEPTED,
  WORK_ORDER_STATUS.REJECTED,
  WORK_ORDER_STATUS.EXPIRED,             // ✅ Housecall Pro feature
  WORK_ORDER_STATUS.CANCELLED
];

/**
 * Get statuses relevant to Jobs page
 * Simplified view focusing on job execution
 */
export const getJobStatuses = () => [
  WORK_ORDER_STATUS.ACCEPTED,    // Unscheduled jobs
  WORK_ORDER_STATUS.SCHEDULED,
  WORK_ORDER_STATUS.IN_PROGRESS,
  WORK_ORDER_STATUS.ON_HOLD,     // ✅ Pain point fix - pause jobs
  WORK_ORDER_STATUS.NEEDS_RESCHEDULING, // ✅ Needs rescheduling
  WORK_ORDER_STATUS.COMPLETED,
  WORK_ORDER_STATUS.CANCELLED
];

/**
 * Get statuses relevant to Invoices page
 */
export const getInvoiceStatuses = () => [
  WORK_ORDER_STATUS.INVOICED,
  WORK_ORDER_STATUS.PAID,
  WORK_ORDER_STATUS.CLOSED,
  WORK_ORDER_STATUS.CANCELLED
];

// ========================================
// SMART STATUS TRANSITIONS
// Returns allowed next statuses based on current status
// ========================================

/**
 * Get allowed status transitions for a work order
 * @param {string} currentStatus - Current work order status
 * @returns {Array} - Array of allowed next statuses
 */
export const getAllowedStatusTransitions = (currentStatus) => {
  const transitions = {
    // Quote stage transitions
    [WORK_ORDER_STATUS.DRAFT]: [
      WORK_ORDER_STATUS.SENT,
      WORK_ORDER_STATUS.PRESENTED,
      WORK_ORDER_STATUS.CANCELLED
    ],
    [WORK_ORDER_STATUS.SENT]: [
      WORK_ORDER_STATUS.DRAFT,        // ✅ Allow going back to draft to make changes
      WORK_ORDER_STATUS.PRESENTED,
      WORK_ORDER_STATUS.CHANGES_REQUESTED,
      WORK_ORDER_STATUS.FOLLOW_UP,
      WORK_ORDER_STATUS.ACCEPTED,
      WORK_ORDER_STATUS.REJECTED,
      WORK_ORDER_STATUS.EXPIRED,
      WORK_ORDER_STATUS.CANCELLED
    ],
    [WORK_ORDER_STATUS.PRESENTED]: [
      WORK_ORDER_STATUS.DRAFT,        // ✅ Allow going back to draft to make changes
      WORK_ORDER_STATUS.CHANGES_REQUESTED,
      WORK_ORDER_STATUS.FOLLOW_UP,
      WORK_ORDER_STATUS.ACCEPTED,
      WORK_ORDER_STATUS.REJECTED,
      WORK_ORDER_STATUS.CANCELLED
    ],
    [WORK_ORDER_STATUS.CHANGES_REQUESTED]: [
      WORK_ORDER_STATUS.DRAFT,        // ✅ Allow going back to draft to make changes
      WORK_ORDER_STATUS.SENT,
      WORK_ORDER_STATUS.PRESENTED,
      WORK_ORDER_STATUS.ACCEPTED,
      WORK_ORDER_STATUS.REJECTED,
      WORK_ORDER_STATUS.CANCELLED
    ],
    [WORK_ORDER_STATUS.FOLLOW_UP]: [
      WORK_ORDER_STATUS.DRAFT,        // ✅ Allow going back to draft to make changes
      WORK_ORDER_STATUS.SENT,
      WORK_ORDER_STATUS.PRESENTED,
      WORK_ORDER_STATUS.ACCEPTED,
      WORK_ORDER_STATUS.REJECTED,
      WORK_ORDER_STATUS.EXPIRED,
      WORK_ORDER_STATUS.CANCELLED
    ],
    
    // Job stage transitions
    [WORK_ORDER_STATUS.ACCEPTED]: [
      WORK_ORDER_STATUS.SCHEDULED,
      WORK_ORDER_STATUS.ON_HOLD,
      WORK_ORDER_STATUS.CANCELLED
    ],
    [WORK_ORDER_STATUS.SCHEDULED]: [
      WORK_ORDER_STATUS.IN_PROGRESS,
      WORK_ORDER_STATUS.ON_HOLD,
      WORK_ORDER_STATUS.NEEDS_RESCHEDULING,
      WORK_ORDER_STATUS.CANCELLED
    ],
    [WORK_ORDER_STATUS.IN_PROGRESS]: [
      WORK_ORDER_STATUS.COMPLETED,
      WORK_ORDER_STATUS.ON_HOLD,
      WORK_ORDER_STATUS.NEEDS_RESCHEDULING,
      WORK_ORDER_STATUS.CANCELLED
    ],
    [WORK_ORDER_STATUS.ON_HOLD]: [
      WORK_ORDER_STATUS.SCHEDULED,
      WORK_ORDER_STATUS.IN_PROGRESS,
      WORK_ORDER_STATUS.NEEDS_RESCHEDULING,
      WORK_ORDER_STATUS.CANCELLED
    ],
    [WORK_ORDER_STATUS.NEEDS_RESCHEDULING]: [
      WORK_ORDER_STATUS.SCHEDULED,
      WORK_ORDER_STATUS.CANCELLED
    ],
    [WORK_ORDER_STATUS.COMPLETED]: [
      WORK_ORDER_STATUS.INVOICED,
      WORK_ORDER_STATUS.CANCELLED  // Allow cancellation if invoice not created yet
    ],
    
    // Invoice stage transitions
    [WORK_ORDER_STATUS.INVOICED]: [
      WORK_ORDER_STATUS.PAID,
      WORK_ORDER_STATUS.CANCELLED
    ],
    [WORK_ORDER_STATUS.PAID]: [
      WORK_ORDER_STATUS.CLOSED
    ],
    
    // Terminal states
    [WORK_ORDER_STATUS.REJECTED]: [],
    [WORK_ORDER_STATUS.EXPIRED]: [],
    [WORK_ORDER_STATUS.CANCELLED]: [],
    [WORK_ORDER_STATUS.CLOSED]: []
  };

  return transitions[currentStatus] || [];
};

/**
 * Get statuses for Job Edit Form dropdown based on current status
 * Only shows relevant next steps + current status
 */
export const getJobFormStatuses = (currentStatus) => {
  // Always include current status and allowed transitions
  const allowed = getAllowedStatusTransitions(currentStatus);
  const statuses = [currentStatus, ...allowed];
  
  // Remove duplicates and filter to job-relevant statuses only
  const jobRelevant = [
    WORK_ORDER_STATUS.ACCEPTED,
    WORK_ORDER_STATUS.SCHEDULED,
    WORK_ORDER_STATUS.IN_PROGRESS,
    WORK_ORDER_STATUS.ON_HOLD,
    WORK_ORDER_STATUS.NEEDS_RESCHEDULING,
    WORK_ORDER_STATUS.COMPLETED,
    WORK_ORDER_STATUS.CANCELLED
  ];

  return [...new Set(statuses)].filter(s => jobRelevant.includes(s));
};

// ========================================
// STATUS DISPLAY HELPERS
// ========================================

/**
 * Get display label for a status
 * @param {string} status - Status value
 * @returns {string} - Human-readable label
 */
export const getStatusLabel = (status) => {
  return WORK_ORDER_STATUS_LABELS[status] || status;
};

/**
 * Get color classes for a status badge
 * @param {string} status - Status value
 * @returns {object} - Object with bg, text, border classes
 */
export const getStatusColors = (status) => {
  return WORK_ORDER_STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
};

/**
 * Get status badge component props
 * @param {string} status - Status value
 * @returns {object} - Props for badge component
 */
export const getStatusBadgeProps = (status) => {
  const colors = getStatusColors(status);
  const label = getStatusLabel(status);
  
  return {
    label,
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`
  };
};

// ========================================
// STATUS VALIDATION
// ========================================

/**
 * Check if a status transition is allowed
 * @param {string} fromStatus - Current status
 * @param {string} toStatus - Desired status
 * @returns {boolean} - True if transition is allowed
 */
export const isStatusTransitionAllowed = (fromStatus, toStatus) => {
  const allowed = getAllowedStatusTransitions(fromStatus);
  return allowed.includes(toStatus);
};

/**
 * Get the pipeline stage for a status
 * @param {string} status - Status value
 * @returns {string} - 'quote', 'job', 'invoice', or 'closed'
 */
export const getStatusStage = (status) => {
  const quoteStatuses = getQuoteStatuses();
  const jobStatuses = getJobStatuses();
  const invoiceStatuses = getInvoiceStatuses();
  
  if (quoteStatuses.includes(status)) return 'quote';
  if (jobStatuses.includes(status)) return 'job';
  if (invoiceStatuses.includes(status)) return 'invoice';
  if (status === WORK_ORDER_STATUS.CLOSED) return 'closed';
  
  return 'unknown';
};

/**
 * Check if a work order should appear on a specific page
 * @param {string} status - Work order status
 * @param {string} page - Page name ('quotes', 'jobs', 'invoices')
 * @returns {boolean} - True if work order should appear on page
 */
export const shouldShowOnPage = (status, page) => {
  switch (page) {
    case 'quotes':
      return getQuoteStatuses().includes(status);
    case 'jobs':
      return getJobStatuses().includes(status);
    case 'invoices':
      return getInvoiceStatuses().includes(status);
    default:
      return false;
  }
};

export default {
  getQuoteStatuses,
  getJobStatuses,
  getInvoiceStatuses,
  getAllowedStatusTransitions,
  getJobFormStatuses,
  getStatusLabel,
  getStatusColors,
  getStatusBadgeProps,
  isStatusTransitionAllowed,
  getStatusStage,
  shouldShowOnPage
};

