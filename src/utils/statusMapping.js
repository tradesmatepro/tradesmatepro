// ========================================
// INDUSTRY STANDARD STATUS MAPPING SYSTEM
// Frontend (UPPERCASE) ↔ Database (lowercase)
// ========================================

// ========================================
// WORK ORDER STATUS MAPPING
// ========================================
export const WORK_ORDER_STATUS = {
  // Frontend constants (UPPERCASE for readability)
  DRAFT: 'DRAFT',
  QUOTE: 'QUOTE', 
  APPROVED: 'APPROVED',
  SCHEDULED: 'SCHEDULED',
  PARTS_ORDERED: 'PARTS_ORDERED',
  ON_HOLD: 'ON_HOLD',
  IN_PROGRESS: 'IN_PROGRESS',
  REQUIRES_APPROVAL: 'REQUIRES_APPROVAL',
  REWORK_NEEDED: 'REWORK_NEEDED',
  COMPLETED: 'COMPLETED',
  INVOICED: 'INVOICED',
  CANCELLED: 'CANCELLED'
};

// Database values (lowercase snake_case - PostgreSQL standard)
const DB_WORK_ORDER_STATUS = {
  [WORK_ORDER_STATUS.DRAFT]: 'draft',
  [WORK_ORDER_STATUS.QUOTE]: 'quote',
  [WORK_ORDER_STATUS.APPROVED]: 'approved',
  [WORK_ORDER_STATUS.SCHEDULED]: 'scheduled',
  [WORK_ORDER_STATUS.PARTS_ORDERED]: 'parts_ordered',
  [WORK_ORDER_STATUS.ON_HOLD]: 'on_hold',
  [WORK_ORDER_STATUS.IN_PROGRESS]: 'in_progress',
  [WORK_ORDER_STATUS.REQUIRES_APPROVAL]: 'requires_approval',
  [WORK_ORDER_STATUS.REWORK_NEEDED]: 'rework_needed',
  [WORK_ORDER_STATUS.COMPLETED]: 'completed',
  [WORK_ORDER_STATUS.INVOICED]: 'invoiced',
  [WORK_ORDER_STATUS.CANCELLED]: 'cancelled'
};

// Reverse mapping (database → frontend)
const FRONTEND_WORK_ORDER_STATUS = Object.fromEntries(
  Object.entries(DB_WORK_ORDER_STATUS).map(([k, v]) => [v, k])
);

// ========================================
// NOTIFICATION STATUS MAPPING
// ========================================
export const NOTIFICATION_STATUS = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
  CLICKED: 'CLICKED',
  FAILED: 'FAILED',
  BOUNCED: 'BOUNCED',
  UNSUBSCRIBED: 'UNSUBSCRIBED'
};

const DB_NOTIFICATION_STATUS = {
  [NOTIFICATION_STATUS.PENDING]: 'pending',
  [NOTIFICATION_STATUS.SENT]: 'sent',
  [NOTIFICATION_STATUS.DELIVERED]: 'delivered',
  [NOTIFICATION_STATUS.READ]: 'read',
  [NOTIFICATION_STATUS.CLICKED]: 'clicked',
  [NOTIFICATION_STATUS.FAILED]: 'failed',
  [NOTIFICATION_STATUS.BOUNCED]: 'bounced',
  [NOTIFICATION_STATUS.UNSUBSCRIBED]: 'unsubscribed'
};

const FRONTEND_NOTIFICATION_STATUS = Object.fromEntries(
  Object.entries(DB_NOTIFICATION_STATUS).map(([k, v]) => [v, k])
);

// ========================================
// CONVERSION FUNCTIONS
// ========================================

/**
 * Convert frontend status constant to database value
 * @param {string} frontendStatus - Frontend status constant (UPPERCASE)
 * @param {string} type - Status type ('work_order' | 'notification')
 * @returns {string} Database value (lowercase)
 */
export const toDbStatus = (frontendStatus, type = 'work_order') => {
  const mapping = type === 'notification' ? DB_NOTIFICATION_STATUS : DB_WORK_ORDER_STATUS;
  return mapping[frontendStatus] || frontendStatus.toLowerCase();
};

/**
 * Convert database value to frontend status constant
 * @param {string} dbStatus - Database status value (lowercase)
 * @param {string} type - Status type ('work_order' | 'notification')
 * @returns {string} Frontend constant (UPPERCASE)
 */
export const toFrontendStatus = (dbStatus, type = 'work_order') => {
  const mapping = type === 'notification' ? FRONTEND_NOTIFICATION_STATUS : FRONTEND_WORK_ORDER_STATUS;
  return mapping[dbStatus] || dbStatus.toUpperCase();
};

/**
 * Convert array of frontend statuses to database values
 * @param {string[]} frontendStatuses - Array of frontend status constants
 * @param {string} type - Status type ('work_order' | 'notification')
 * @returns {string[]} Array of database values
 */
export const toDbStatusArray = (frontendStatuses, type = 'work_order') => {
  return frontendStatuses.map(status => toDbStatus(status, type));
};

/**
 * Convert array of database values to frontend statuses
 * @param {string[]} dbStatuses - Array of database status values
 * @param {string} type - Status type ('work_order' | 'notification')
 * @returns {string[]} Array of frontend constants
 */
export const toFrontendStatusArray = (dbStatuses, type = 'work_order') => {
  return dbStatuses.map(status => toFrontendStatus(status, type));
};

// ========================================
// LEGACY SUPPORT (for migration)
// ========================================

// Handle old uppercase database values during migration
const LEGACY_STATUS_MAP = {
  'QUOTE': 'quote',
  'ACCEPTED': 'approved', // Map old ACCEPTED to new approved
  'SCHEDULED': 'scheduled',
  'IN_PROGRESS': 'in_progress',
  'COMPLETED': 'completed',
  'INVOICED': 'invoiced',
  'CANCELLED': 'cancelled',
  'UNREAD': 'pending', // Map old UNREAD to new pending
  'READ': 'read'
};

/**
 * Handle legacy status values during migration
 * @param {string} status - Status value (could be old uppercase or new lowercase)
 * @returns {string} Normalized database value (lowercase)
 */
export const normalizeLegacyStatus = (status) => {
  if (!status) return status;
  
  // If it's already lowercase, return as-is
  if (status === status.toLowerCase()) {
    return status;
  }
  
  // Handle legacy uppercase values
  return LEGACY_STATUS_MAP[status] || status.toLowerCase();
};

// ========================================
// QUERY HELPERS
// ========================================

/**
 * Build Supabase query filter for status values
 * @param {string[]} frontendStatuses - Array of frontend status constants
 * @param {string} type - Status type ('work_order' | 'notification')
 * @returns {string} Supabase filter string
 */
export const buildStatusFilter = (frontendStatuses, type = 'work_order') => {
  const dbStatuses = toDbStatusArray(frontendStatuses, type);
  return `status.in.(${dbStatuses.join(',')})`;
};

// ========================================
// EXPORTS FOR BACKWARD COMPATIBILITY
// ========================================
export { DB_WORK_ORDER_STATUS, DB_NOTIFICATION_STATUS };
export default {
  WORK_ORDER_STATUS,
  NOTIFICATION_STATUS,
  toDbStatus,
  toFrontendStatus,
  buildStatusFilter,
  normalizeLegacyStatus
};
