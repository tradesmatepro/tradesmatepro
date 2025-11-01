/**
 * Standardized Messaging Enums
 * Single source of truth for all messaging-related constants
 * Ensures consistency across frontend and backend
 */

// =====================================================
// MESSAGE TYPES (for message_type column)
// =====================================================
export const MESSAGE_TYPES = {
  IN_APP: 'in_app',           // Messages sent through the app/portal
  EMAIL: 'email',             // Email notifications
  SMS: 'sms',                 // SMS notifications
  SYSTEM: 'system'            // Auto-generated system messages
};

// =====================================================
// SENDER/RECIPIENT TYPES (for sender_type and recipient_type)
// =====================================================
export const SENDER_TYPES = {
  CUSTOMER: 'customer',       // End customer
  EMPLOYEE: 'employee',       // Company employee/contractor
  SYSTEM: 'system'            // Auto-generated
};

export const RECIPIENT_TYPES = {
  CUSTOMER: 'customer',       // End customer
  EMPLOYEE: 'employee',       // Company employee/contractor
  SYSTEM: 'system'            // Auto-generated
};

// =====================================================
// DELIVERY METHODS (for delivery_method column)
// =====================================================
export const DELIVERY_METHODS = {
  APP: 'app',                 // Delivered via app
  EMAIL: 'email',             // Delivered via email
  SMS: 'sms',                 // Delivered via SMS
  PUSH: 'push'                // Push notification
};

// =====================================================
// MESSAGE STATUS
// =====================================================
export const MESSAGE_STATUS = {
  SENT: 'sent',               // Message sent
  DELIVERED: 'delivered',     // Message delivered
  READ: 'read',               // Message read
  FAILED: 'failed'            // Message failed to send
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get all valid values for a messaging enum
 */
export const getEnumValues = (enumObj) => Object.values(enumObj);

/**
 * Validate if a value is a valid message type
 */
export const isValidMessageType = (value) => 
  getEnumValues(MESSAGE_TYPES).includes(value);

/**
 * Validate if a value is a valid sender type
 */
export const isValidSenderType = (value) => 
  getEnumValues(SENDER_TYPES).includes(value);

/**
 * Validate if a value is a valid delivery method
 */
export const isValidDeliveryMethod = (value) => 
  getEnumValues(DELIVERY_METHODS).includes(value);

/**
 * Validate if a value is a valid message status
 */
export const isValidMessageStatus = (value) => 
  getEnumValues(MESSAGE_STATUS).includes(value);

// =====================================================
// UI LABELS (for display)
// =====================================================

export const MESSAGE_TYPE_LABELS = {
  [MESSAGE_TYPES.IN_APP]: 'In-App Message',
  [MESSAGE_TYPES.EMAIL]: 'Email',
  [MESSAGE_TYPES.SMS]: 'SMS',
  [MESSAGE_TYPES.SYSTEM]: 'System'
};

export const SENDER_TYPE_LABELS = {
  [SENDER_TYPES.CUSTOMER]: 'Customer',
  [SENDER_TYPES.EMPLOYEE]: 'Employee',
  [SENDER_TYPES.SYSTEM]: 'System'
};

export const DELIVERY_METHOD_LABELS = {
  [DELIVERY_METHODS.APP]: 'App',
  [DELIVERY_METHODS.EMAIL]: 'Email',
  [DELIVERY_METHODS.SMS]: 'SMS',
  [DELIVERY_METHODS.PUSH]: 'Push Notification'
};

export const MESSAGE_STATUS_LABELS = {
  [MESSAGE_STATUS.SENT]: 'Sent',
  [MESSAGE_STATUS.DELIVERED]: 'Delivered',
  [MESSAGE_STATUS.READ]: 'Read',
  [MESSAGE_STATUS.FAILED]: 'Failed'
};

// =====================================================
// COLORS FOR UI (for status badges, etc.)
// =====================================================

export const MESSAGE_STATUS_COLORS = {
  [MESSAGE_STATUS.SENT]: 'bg-blue-100 text-blue-800',
  [MESSAGE_STATUS.DELIVERED]: 'bg-green-100 text-green-800',
  [MESSAGE_STATUS.READ]: 'bg-gray-100 text-gray-800',
  [MESSAGE_STATUS.FAILED]: 'bg-red-100 text-red-800'
};

export const SENDER_TYPE_COLORS = {
  [SENDER_TYPES.CUSTOMER]: 'bg-purple-100 text-purple-800',
  [SENDER_TYPES.EMPLOYEE]: 'bg-blue-100 text-blue-800',
  [SENDER_TYPES.SYSTEM]: 'bg-gray-100 text-gray-800'
};

