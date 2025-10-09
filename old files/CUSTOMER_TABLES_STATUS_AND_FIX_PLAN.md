# 🔍 CUSTOMER TABLES - CURRENT STATUS & FIX PLAN

## 📊 CURRENT STATUS

### **✅ TABLES THAT EXIST AND ARE BEING USED**

| Table | Status | Used By | Purpose |
|-------|--------|---------|---------|
| **customers** | ✅ Active | Customers.js, CustomerDatabasePanel.js | Main customer records |
| **customer_tags** | ✅ Active | Customers.js | Tag definitions |
| **customer_tag_assignments** | ✅ Active | Customers.js | Customer-to-tag relationships |
| **customer_addresses** | ✅ Active | AddressManager.js | Multiple addresses per customer |

### **⚠️ TABLES THAT EXIST BUT NOT WIRED TO UI**

| Table | Defined In Schema | Used In App | Industry Standard |
|-------|-------------------|-------------|-------------------|
| **customer_contacts** | ✅ Yes (DEPLOY_MASTER_SCHEMA.sql) | ❌ No | ✅ Yes - for commercial customers |
| **customer_communications** | ✅ Yes (sql files) | ❌ No | ✅ Yes - activity log |
| **customer_notes** | ❓ Unknown | ❌ No | ✅ Yes - simple notes |
| **customer_preferences** | ❓ Unknown | ❌ No | ✅ Yes - customer settings |
| **customer_history** | ❓ Unknown | ❌ No | ✅ Yes - audit trail |
| **customer_financial_summary** | ❓ Unknown | ❌ No | ⚠️ Should be VIEW |
| **customer_summary** | ❓ Unknown | ❌ No | ⚠️ Should be VIEW |

---

## 🎯 INDUSTRY STANDARD REQUIREMENTS

### **Salesforce / ServiceTitan / Jobber Pattern**

```
CUSTOMERS (Main Table)
├── customer_addresses (One-to-Many) ✅ DONE
├── customer_contacts (One-to-Many) ⚠️ EXISTS BUT NOT WIRED
├── customer_tags (Many-to-Many) ✅ DONE
├── customer_communications (One-to-Many) ⚠️ EXISTS BUT NOT WIRED
├── customer_notes (One-to-Many) ❌ MISSING
├── customer_preferences (One-to-One) ❌ MISSING
└── customer_history (One-to-Many) ❌ MISSING
```

### **What Each Table Should Do**

1. **customer_contacts** (For Commercial Customers)
   - Store multiple contacts per customer
   - Fields: name, title, email, phone, is_primary, is_billing_contact, is_service_contact
   - Example: "John Smith - Site Manager", "Jane Doe - Accounting"

2. **customer_communications** (Activity Log)
   - Track all interactions with customer
   - Fields: type (call/email/meeting), direction (inbound/outbound), subject, content, created_at
   - Example: "Called customer on 1/15 to discuss quote"

3. **customer_notes** (Simple Notes)
   - Quick notes about customer
   - Fields: note_text, created_by, created_at, is_pinned
   - Example: "Gate code is 1234", "Dog in backyard"

4. **customer_preferences** (Settings)
   - Customer-specific preferences
   - Fields: preferred_technician, preferred_times, notification_preferences, special_instructions
   - Example: "Prefers morning appointments", "Call before arriving"

5. **customer_history** (Audit Trail)
   - Track changes to customer record
   - Fields: event_type, event_description, changed_by, created_at
   - Example: "Status changed from active to inactive by John Doe"

---

## 🔧 FIX PLAN

### **PHASE 1: FIX IMMEDIATE ISSUES (Today)**

#### **1.1 Fix Customer Form - Add Business Name Field**
**File**: `src/pages/Customers.js`
**Issue**: Form doesn't show company_name field for commercial customers
**Fix**: Add conditional fields based on customer type

```javascript
// CURRENT (Line 417-450):
<input type="text" name="name" placeholder="Customer Name" />

// SHOULD BE:
{formData.type === 'residential' ? (
  <div className="grid grid-cols-2 gap-4">
    <input name="first_name" placeholder="First Name *" required />
    <input name="last_name" placeholder="Last Name *" required />
  </div>
) : (
  <>
    <input name="company_name" placeholder="Business Name *" required />
    <input name="contact_name" placeholder="Primary Contact" />
  </>
)}
```

#### **1.2 Fix Customer Payload**
**File**: `src/pages/Customers.js` (Line 2356-2374)
**Issue**: Payload sends wrong fields
**Fix**: Send first_name/last_name for residential, company_name for commercial

```javascript
const payload = {
  company_id: user.company_id,
  type: (formData.type || 'residential').toLowerCase(),
  // Conditional name fields
  ...(formData.type === 'residential' ? {
    first_name: formData.first_name,
    last_name: formData.last_name,
    company_name: null
  } : {
    first_name: null,
    last_name: null,
    company_name: formData.company_name
  }),
  email: formData.email || null,
  phone: formData.phone || null,
  status: (formData.status || 'active').toLowerCase()
};
```

### **PHASE 2: CREATE MISSING TABLES (Today)**

#### **2.1 Verify Which Tables Exist**
Run audit query to check:
- Which tables exist in database
- Which are TABLES vs VIEWS
- Which have data vs empty

#### **2.2 Create Missing Tables**
Create SQL script to add missing industry-standard tables:
- `customer_notes` (if missing)
- `customer_preferences` (if missing)
- `customer_history` (if missing)

#### **2.3 Convert Summary Tables to Views**
If `customer_financial_summary` and `customer_summary` are TABLES:
- Drop them
- Recreate as VIEWS that compute from source data

### **PHASE 3: WIRE UP EXISTING TABLES (This Week)**

#### **3.1 Add Contacts Tab (For Commercial Customers)**
**Component**: New `CustomerContacts.js`
**Shows**: List of contacts for commercial customers
**Actions**: Add/Edit/Delete contacts

#### **3.2 Add Communications Tab (Activity Log)**
**Component**: New `CustomerCommunications.js`
**Shows**: Timeline of all interactions
**Actions**: Log new communication (call/email/meeting)

#### **3.3 Add Notes Tab**
**Component**: New `CustomerNotes.js`
**Shows**: List of notes about customer
**Actions**: Add/Edit/Delete notes, pin important notes

#### **3.4 Add Preferences Section**
**Component**: Add to customer detail view
**Shows**: Preferred technician, preferred times, special instructions
**Actions**: Edit preferences

### **PHASE 4: CLEAN UP (After Verification)**

#### **4.1 Remove Duplicate/Unused Tables**
- Drop tables that are duplicates
- Drop tables that aren't being used
- Update master schema documentation

#### **4.2 Add Indexes**
- Add indexes on foreign keys
- Add indexes on frequently queried fields

#### **4.3 Update Documentation**
- Update MASTER_DATABASE_SCHEMA_LOCKED.md
- Document which tables are used where
- Document data flow

---

## 🚀 IMMEDIATE ACTION ITEMS

### **RIGHT NOW:**

1. **Fix the form** - Add business name field for commercial customers
2. **Run audit query** - See what tables actually exist
3. **Create missing tables** - Add industry-standard tables that are missing

### **QUESTIONS TO ANSWER:**

1. Do `customer_financial_summary` and `customer_summary` exist as TABLES or VIEWS?
2. Do `customer_notes`, `customer_preferences`, `customer_history` exist?
3. Are there any other customer-related tables we haven't found?

---

## ✅ WHAT I'LL DO NOW

1. **Fix the customer form** to add business name field
2. **Create SQL script** to add missing industry-standard tables
3. **Create SQL script** to convert summary tables to views (if needed)

**Ready to proceed?**
