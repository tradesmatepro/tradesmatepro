// ===============================================
// ENUM CONSTANTS FOR UI COMPONENTS
// Based on actual database schema from latest.json
// Date: 2025-09-22
// ===============================================

// Work Order Status Options (Updated to match database)
export const WORK_ORDER_STATUS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Quote', value: 'quote' },
  { label: 'Approved', value: 'approved' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Parts Ordered', value: 'parts_ordered' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Requires Approval', value: 'requires_approval' },
  { label: 'Rework Needed', value: 'rework_needed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Invoiced', value: 'invoiced' },
  { label: 'Cancelled', value: 'cancelled' }
];

// Quote-specific statuses (for quote management)
export const QUOTE_STATUS = [
  { label: 'Quote', value: 'quote' },
  { label: 'Sent', value: 'sent' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
];

// Job-specific statuses (for work order management)
export const JOB_STATUS = [
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Invoiced', value: 'invoiced' }
];

// Customer Communication Type Options
export const COMMUNICATION_TYPE = [
  { label: 'Email', value: 'EMAIL' },
  { label: 'Phone', value: 'PHONE' },
  { label: 'SMS', value: 'SMS' },
  { label: 'Meeting', value: 'MEETING' },
  { label: 'Note', value: 'NOTE' }
];

// Service Agreement Status Options
export const AGREEMENT_STATUS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Terminated', value: 'TERMINATED' },
  { label: 'Draft', value: 'DRAFT' }
];

// Notification Status Options (Updated to match database)
export const NOTIFICATION_STATUS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Sent', value: 'sent' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Read', value: 'read' },
  { label: 'Clicked', value: 'clicked' },
  { label: 'Failed', value: 'failed' },
  { label: 'Bounced', value: 'bounced' },
  { label: 'Unsubscribed', value: 'unsubscribed' }
];

// ===============================================
// HELPER FUNCTIONS
// ===============================================

// Get label for a status value
export const getStatusLabel = (value: string, statusArray: Array<{label: string, value: string}>): string => {
  const status = statusArray.find(s => s.value === value);
  return status ? status.label : value;
};

// Get all values from a status array
export const getStatusValues = (statusArray: Array<{label: string, value: string}>): string[] => {
  return statusArray.map(s => s.value);
};

// Build PostgREST filter string
export const buildStatusFilter = (values: string[]): string => {
  return `status=in.(${values.join(',')})`;
};

// ===============================================
// USAGE EXAMPLES:
// 
// In forms:
// <Select options={WORK_ORDER_STATUS} />
//
// In queries:
// const filter = buildStatusFilter(getStatusValues(QUOTE_STATUS));
// const query = `work_orders?${filter}&order=created_at.desc`;
//
// Display labels:
// const label = getStatusLabel('QUOTE', WORK_ORDER_STATUS); // "Quote"
// ===============================================
