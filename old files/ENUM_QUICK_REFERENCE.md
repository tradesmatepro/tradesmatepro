# Enum Quick Reference - TradeMate Pro

## ✅ WORK ORDER STATUS (100% Fixed - Use Lowercase Only!)

### Database Enum: `work_order_status_enum`
**Always use lowercase with underscores:**

```javascript
// ✅ CORRECT - Use these values:
'draft'              // Initial draft
'quote'              // Quote created
'sent'               // Quote sent to customer
'approved'           // Customer approved quote
'rejected'           // Customer rejected quote
'scheduled'          // Job scheduled
'parts_ordered'      // Parts ordered
'on_hold'            // On hold
'in_progress'        // Job in progress
'requires_approval'  // Requires approval
'rework_needed'      // Rework needed
'completed'          // Job completed
'invoiced'           // Invoice created
'cancelled'          // Cancelled
'paid'               // Paid
'closed'             // Closed

// ❌ NEVER use UPPERCASE:
'DRAFT', 'QUOTE', 'SENT', 'ACCEPTED', 'REJECTED' // WRONG!
```

### Frontend Constants
```javascript
// Import from:
import { WORK_ORDER_STATUS } from '../constants/statusEnums';
// or
import { WORK_ORDER_STATUS } from '../utils/workOrderStatus';

// Usage:
WORK_ORDER_STATUS.QUOTE      // Returns: 'quote' (lowercase)
WORK_ORDER_STATUS.SENT       // Returns: 'sent' (lowercase)
WORK_ORDER_STATUS.ACCEPTED   // Returns: 'approved' (lowercase)
```

### Status Comparisons
```javascript
// ✅ CORRECT:
if (quote.status === 'sent') { ... }
if (quote.status === 'approved') { ... }

// ❌ WRONG:
if (quote.status === 'SENT') { ... }
if (quote.status === 'ACCEPTED') { ... }
```

### Dropdown Options
```javascript
// ✅ CORRECT:
<option value="draft">Draft</option>
<option value="sent">Sent</option>
<option value="approved">Approved</option>

// ❌ WRONG:
<option value="DRAFT">Draft</option>
<option value="SENT">Sent</option>
```

---

## ⚠️ OTHER ENUMS (Verify Case Before Using)

### Marketplace Enums
**Status:** ⚠️ VERIFY - May be UPPERCASE in database

```javascript
// marketplace_response_status_enum
// Check database before using!
'INTERESTED' or 'interested'?
'DECLINED' or 'declined'?
'ACCEPTED' or 'accepted'?
```

### Communication Enums
**Status:** ⚠️ VERIFY - May be UPPERCASE in database

```javascript
// customer_communication_type_enum
// Check database before using!
'EMAIL' or 'email'?
'PHONE' or 'phone'?
'SMS' or 'sms'?
```

### Notification Enums
**Status:** ✅ CONFIRMED lowercase (from DEPLOY_MASTER_SCHEMA.sql)

```javascript
// notification_status_enum
'pending'
'sent'
'delivered'
'read'
'clicked'
'failed'
'bounced'
'unsubscribed'
```

---

## 🔍 How to Verify Enum Case

### Method 1: Check Locked Schema
```bash
# Look in:
APP Schemas/Locked/MASTER_DATABASE_SCHEMA_LOCKED.md
APP Schemas/Locked/Tradesmate_enums_locked.md
```

### Method 2: Query Database
```sql
-- Check enum values:
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'your_enum_name') 
ORDER BY enumsortorder;
```

### Method 3: Check Deploy Schema
```bash
# Look in:
DEPLOY_MASTER_SCHEMA.sql
```

---

## 🚨 Common Mistakes to Avoid

### 1. Mixed Case in Same File
```javascript
// ❌ WRONG - Mixing cases:
if (status === 'SENT') { ... }
if (status === 'approved') { ... }

// ✅ CORRECT - Consistent lowercase:
if (status === 'sent') { ... }
if (status === 'approved') { ... }
```

### 2. Using Wrong Column Name
```javascript
// ❌ WRONG - quote_status doesn't exist:
quote.quote_status

// ✅ CORRECT - Use unified status column:
quote.status
```

### 3. Hardcoding Status Values
```javascript
// ❌ WRONG - Hardcoded strings:
if (quote.status === 'sent') { ... }

// ✅ BETTER - Use constants:
import { WORK_ORDER_STATUS } from '../constants/statusEnums';
if (quote.status === WORK_ORDER_STATUS.SENT) { ... }
```

### 4. Forgetting to Update Dropdowns
```javascript
// ❌ WRONG - Dropdown doesn't match database:
<select value={formData.status}>
  <option value="DRAFT">Draft</option>  // UPPERCASE
</select>

// ✅ CORRECT - Dropdown matches database:
<select value={formData.status}>
  <option value="draft">Draft</option>  // lowercase
</select>
```

---

## 📝 Checklist for New Features

When adding new status-related code:

- [ ] Check locked schema for correct enum case
- [ ] Use constants from statusEnums.js or workOrderStatus.js
- [ ] Use lowercase for work_order_status_enum
- [ ] Verify other enum types before using
- [ ] Test status comparisons work correctly
- [ ] Test dropdowns show correct selected value
- [ ] Test status badges display correctly
- [ ] Check console for enum mismatch errors

---

## 🎯 Quick Fixes

### If Status Dropdown Shows Wrong Value:
1. Check dropdown options use lowercase
2. Check formData.status is lowercase
3. Check database column has lowercase value

### If Status Badge Shows Wrong Label:
1. Check badge config uses lowercase keys
2. Check reading from correct column (quote.status, not quote.quote_status)
3. Check status value is lowercase

### If Status Comparison Fails:
1. Check both sides of comparison use same case
2. Check using correct column name
3. Check database value is lowercase

---

## 📚 Reference Files

**Constants:**
- `src/constants/statusEnums.js` - Main status constants
- `src/utils/workOrderStatus.js` - Work order status helpers
- `src/constants/enums.ts` - TypeScript enum definitions

**Types:**
- `src/types/supabase.types.ts` - TypeScript types for database

**Schema:**
- `APP Schemas/Locked/MASTER_DATABASE_SCHEMA_LOCKED.md` - Official schema
- `DEPLOY_MASTER_SCHEMA.sql` - Deployment schema

**Documentation:**
- `ENUM_STANDARDIZATION_COMPLETE.md` - Standardization summary
- `FULL_ENUM_AUDIT.md` - Complete audit results
- `QUOTE_STATUS_AND_PDF_FIXES.md` - Recent fixes

---

## ✅ Current Status

**Work Order Status:** 100% Fixed - All lowercase ✅
**Other Enums:** Needs verification ⚠️
**Database Cleanup:** Deferred to post-beta ⏳

**Last Updated:** 2025-10-01

