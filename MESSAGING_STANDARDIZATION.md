# Messaging System Standardization

## Overview
This document outlines the standardized messaging enums and constants used across TradeMate Pro to ensure consistency between frontend and backend.

## Standardized Enums

### 1. Message Types (for `message_type` column)
```javascript
MESSAGE_TYPES = {
  IN_APP: 'in_app',      // Messages sent through the app/portal
  EMAIL: 'email',        // Email notifications
  SMS: 'sms',            // SMS notifications
  SYSTEM: 'system'       // Auto-generated system messages
}
```

### 2. Sender/Recipient Types (for `sender_type` and `recipient_type`)
```javascript
SENDER_TYPES = {
  CUSTOMER: 'customer',  // End customer
  EMPLOYEE: 'employee',  // Company employee/contractor
  SYSTEM: 'system'       // Auto-generated
}

RECIPIENT_TYPES = {
  CUSTOMER: 'customer',  // End customer
  EMPLOYEE: 'employee',  // Company employee/contractor
  SYSTEM: 'system'       // Auto-generated
}
```

### 3. Delivery Methods (for `delivery_method` column)
```javascript
DELIVERY_METHODS = {
  APP: 'app',            // Delivered via app
  EMAIL: 'email',        // Delivered via email
  SMS: 'sms',            // Delivered via SMS
  PUSH: 'push'           // Push notification
}
```

### 4. Message Status
```javascript
MESSAGE_STATUS = {
  SENT: 'sent',          // Message sent
  DELIVERED: 'delivered',// Message delivered
  READ: 'read',          // Message read
  FAILED: 'failed'       // Message failed to send
}
```

## Frontend Implementation

### Location
`src/constants/messagingEnums.js` - Single source of truth for all messaging constants

### Usage in React Components
```javascript
import {
  MESSAGE_TYPES,
  SENDER_TYPES,
  DELIVERY_METHODS,
  MESSAGE_STATUS,
  SENDER_TYPE_LABELS,
  MESSAGE_STATUS_COLORS
} from '../constants/messagingEnums';

// Example: Sending a message
const params = {
  p_company_id: user.company_id,
  p_sender_id: user.id,
  p_sender_type: SENDER_TYPES.EMPLOYEE,
  p_customer_id: selectedWorkOrder.customer_id,
  p_content: messageText,
  p_work_order_id: selectedWorkOrder.id,
  p_delivery_method: DELIVERY_METHODS.APP
};

const { data, error } = await supabase.rpc('send_customer_message', params);
```

### Usage in HTML/Vanilla JS
```javascript
// Constants defined in customer-portal-new.html
const MESSAGE_TYPES = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  SMS: 'sms',
  SYSTEM: 'system'
};

const SENDER_TYPES = {
  CUSTOMER: 'customer',
  EMPLOYEE: 'employee',
  SYSTEM: 'system'
};

// Example: Sending a message from portal
const { data, error } = await supabase.rpc('send_portal_message', {
  p_customer_id: workOrder.customer_id,
  p_portal_token: customerToken,
  p_work_order_id: workOrder.id,
  p_content: messageText,
  p_message_type: MESSAGE_TYPES.IN_APP,
  p_sender_type: SENDER_TYPES.CUSTOMER,
  p_delivery_method: DELIVERY_METHODS.APP
});
```

## Updated Components

### React Components
- ✅ `src/pages/Messages.js` - Uses standardized constants for sending/displaying messages
- ✅ `src/services/MarketplaceMessagingService.js` - Uses standardized constants for marketplace messages

### HTML/Vanilla JS
- ✅ `customer-portal-new.html` - Uses standardized constants for portal messaging

## Helper Functions

The `messagingEnums.js` file includes validation helpers:

```javascript
isValidMessageType(value)      // Validates message type
isValidSenderType(value)       // Validates sender type
isValidDeliveryMethod(value)   // Validates delivery method
isValidMessageStatus(value)    // Validates message status
```

## UI Labels and Colors

For consistent UI display:

```javascript
MESSAGE_TYPE_LABELS = {
  'in_app': 'In-App Message',
  'email': 'Email',
  'sms': 'SMS',
  'system': 'System'
};

MESSAGE_STATUS_COLORS = {
  'sent': 'bg-blue-100 text-blue-800',
  'delivered': 'bg-green-100 text-green-800',
  'read': 'bg-gray-100 text-gray-800',
  'failed': 'bg-red-100 text-red-800'
};
```

## Backend RPC Functions

All RPC functions should use these standardized values:

### send_portal_message
- `p_message_type`: MESSAGE_TYPES.IN_APP
- `p_sender_type`: SENDER_TYPES.CUSTOMER
- `p_delivery_method`: DELIVERY_METHODS.APP

### send_customer_message
- `p_sender_type`: SENDER_TYPES.EMPLOYEE
- `p_delivery_method`: DELIVERY_METHODS.APP (or EMAIL, SMS, PUSH)

### send_internal_message
- `p_sender_type`: SENDER_TYPES.EMPLOYEE
- `p_delivery_method`: DELIVERY_METHODS.APP

## Database Constraints

The messages table enforces these constraints:

```sql
CHECK (message_type IN ('in_app', 'email', 'sms', 'system'))
CHECK (sender_type IN ('customer', 'employee', 'system'))
CHECK (delivery_method IN ('app', 'email', 'sms', 'push'))
CHECK (status IN ('sent', 'delivered', 'read', 'failed'))
```

## Migration Checklist

- [x] Create standardized constants file
- [x] Update Messages.js page
- [x] Update MarketplaceMessagingService
- [x] Update customer-portal-new.html
- [ ] Update MessagingService (internal messages)
- [ ] Update CustomerMessagesService
- [ ] Update any other messaging-related services
- [ ] Update all RPC functions to use standardized values
- [ ] Add validation to RPC functions

## Notes

- All enum values are **lowercase** with **no mixed case**
- Use the constants file as the single source of truth
- Never hardcode enum values in components
- Always validate enum values before sending to backend
- Update this document when adding new message types or statuses

