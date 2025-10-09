// Marketplace Enums - Single Source of Truth
// Based on database schema: marketplace_response_status_enum

export const RESPONSE_STATUSES = {
  INTERESTED: "👋 Interested",
  DECLINED: "❌ Declined",
  ACCEPTED: "✅ Accepted",
  PENDING: "⏳ Pending"
};

// Database enum values (exact match required - matches marketplace_response_status_enum)
export const DB_RESPONSE_STATUS = {
  INTERESTED: "INTERESTED",
  DECLINED: "DECLINED",
  ACCEPTED: "ACCEPTED",
  PENDING: "PENDING"
};

// Frontend form values mapped to database enums
export const FORM_TO_DB_STATUS = {
  'interested': DB_RESPONSE_STATUS.INTERESTED,
  'declined': DB_RESPONSE_STATUS.DECLINED,
  'accepted': DB_RESPONSE_STATUS.ACCEPTED,
  'pending': DB_RESPONSE_STATUS.PENDING
};

// Response type options for forms
export const RESPONSE_TYPE_OPTIONS = [
  {
    value: 'interested',
    label: RESPONSE_STATUSES.INTERESTED,
    desc: 'Show interest in this request',
    dbValue: DB_RESPONSE_STATUS.INTERESTED
  },
  {
    value: 'pending',
    label: RESPONSE_STATUSES.PENDING,
    desc: 'Need time to consider',
    dbValue: DB_RESPONSE_STATUS.PENDING
  },
  {
    value: 'accepted',
    label: RESPONSE_STATUSES.ACCEPTED,
    desc: 'Accept this request',
    dbValue: DB_RESPONSE_STATUS.ACCEPTED
  },
  {
    value: 'declined',
    label: RESPONSE_STATUSES.DECLINED,
    desc: 'Decline this request',
    dbValue: DB_RESPONSE_STATUS.DECLINED
  }
];

// Status display helpers
export const getStatusDisplay = (dbStatus) => {
  switch(dbStatus) {
    case DB_RESPONSE_STATUS.INTERESTED:
      return RESPONSE_STATUSES.INTERESTED;
    case DB_RESPONSE_STATUS.PENDING:
      return RESPONSE_STATUSES.PENDING;
    case DB_RESPONSE_STATUS.ACCEPTED:
      return RESPONSE_STATUSES.ACCEPTED;
    case DB_RESPONSE_STATUS.DECLINED:
      return RESPONSE_STATUSES.DECLINED;
    default:
      return dbStatus;
  }
};

// Status color helpers
export const getStatusColor = (dbStatus) => {
  switch(dbStatus) {
    case DB_RESPONSE_STATUS.INTERESTED:
      return 'blue';
    case DB_RESPONSE_STATUS.PENDING:
      return 'yellow';
    case DB_RESPONSE_STATUS.ACCEPTED:
      return 'emerald';
    case DB_RESPONSE_STATUS.DECLINED:
      return 'red';
    default:
      return 'gray';
  }
};
