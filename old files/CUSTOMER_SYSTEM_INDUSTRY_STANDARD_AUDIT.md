# 🔍 CUSTOMER SYSTEM - COMPLETE INDUSTRY STANDARD AUDIT

## 📋 ISSUES IDENTIFIED

### **1. Form Missing Business Name Field**
**Problem**: When selecting "Commercial" or "Property Management", form doesn't ask for business name
**Database Has**: `company_name` column in customers table
**Industry Standard**: Commercial customers should have company_name, residential should have first_name + last_name

### **2. Duplicate/Confusing Customer Tables**
**Your Database Has**:
- `customers` (main table)
- `customer_addresses`
- `customer_communications`
- `customer_contacts`
- `customer_history`
- `customer_notes`
- `customer_preferences`
- `customer_tag_assignments`
- `customer_tags`
- `customer_financial_summary` ❓
- `customer_summary` ❓

**Questions**:
- Are `customer_financial_summary` and `customer_summary` VIEWS or TABLES?
- Are they being used by the application?
- Do they duplicate data from other tables?

---

## 🏭 INDUSTRY STANDARD (Salesforce/ServiceTitan/Jobber)

### **Core Customer Data Model**

```
┌─────────────────────────────────────────────────────────────┐
│                         CUSTOMERS                            │
│  (Main entity - one record per customer)                    │
│  - id, company_id, customer_number                          │
│  - type (residential/commercial/industrial/government)       │
│  - first_name, last_name (for residential)                  │
│  - company_name (for commercial)                            │
│  - email, phone, mobile_phone                               │
│  - status, is_active, credit_limit, payment_terms           │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ CUSTOMER_        │  │ CUSTOMER_        │  │ CUSTOMER_TAGS    │
│ ADDRESSES        │  │ CONTACTS         │  │ (Many-to-Many)   │
│ (One-to-Many)    │  │ (One-to-Many)    │  │                  │
│                  │  │                  │  │ customer_tags    │
│ - Service addr   │  │ - Decision maker │  │ - id, name       │
│ - Billing addr   │  │ - Site contact   │  │ - color, desc    │
│ - Mailing addr   │  │ - Accounting     │  │                  │
│ - is_primary     │  │ - is_primary     │  │ tag_assignments  │
│ - lat/long       │  │ - role           │  │ - customer_id    │
│ - access_notes   │  │ - email, phone   │  │ - tag_id         │
└──────────────────┘  └──────────────────┘  └──────────────────┘
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ CUSTOMER_        │  │ CUSTOMER_        │  │ CUSTOMER_        │
│ COMMUNICATIONS   │  │ NOTES            │  │ PREFERENCES      │
│ (Activity Log)   │  │ (Simple Notes)   │  │ (Settings)       │
│                  │  │                  │  │                  │
│ - type (email,   │  │ - note text      │  │ - preferred_     │
│   phone, sms,    │  │ - created_by     │  │   technician     │
│   meeting)       │  │ - created_at     │  │ - preferred_     │
│ - direction      │  │ - is_pinned      │  │   times          │
│ - subject        │  │                  │  │ - notifications  │
│ - content        │  │                  │  │ - special_       │
│ - created_at     │  │                  │  │   instructions   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### **What Each Table Does (Industry Standard)**

| Table | Purpose | Used By | Example |
|-------|---------|---------|---------|
| **customers** | Main customer record | All features | John Smith, ABC Plumbing Inc |
| **customer_addresses** | Multiple addresses per customer | Scheduling, Invoicing | Service address ≠ billing address |
| **customer_contacts** | Multiple contacts per customer | Commercial customers | Decision maker, site manager, accountant |
| **customer_tags** | Categorization/segmentation | Marketing, Filtering | VIP, High-Value, Problem Customer |
| **customer_communications** | Activity/interaction log | CRM, History | Called on 1/15, emailed quote |
| **customer_notes** | Simple text notes | Technicians, CSRs | "Gate code is 1234", "Dog in backyard" |
| **customer_preferences** | Customer-specific settings | Scheduling, Notifications | Prefers morning appointments |
| **customer_history** | Audit trail of changes | Compliance, Debugging | Status changed from active to inactive |

### **❌ NOT Industry Standard (Likely Duplicates)**

| Table | Issue | Should Be |
|-------|-------|-----------|
| **customer_financial_summary** | Likely a VIEW or computed data | Should be a VIEW that aggregates from invoices/payments |
| **customer_summary** | Likely a VIEW or computed data | Should be a VIEW that aggregates from work_orders/jobs |

---

## 🔧 WHAT NEEDS TO BE FIXED

### **1. Form - Add Business Name Field**

**Current**: Form only has "Name" field for all customer types
**Should Be**: 
- **Residential**: First Name + Last Name fields
- **Commercial/Property Management**: Company Name field + Primary Contact Name

**Fix Location**: `src/pages/Customers.js` lines 417-450

```javascript
// CURRENT (WRONG):
<input
  type="text"
  name="name"
  value={formData.name}
  placeholder="Customer Name"
/>

// SHOULD BE (INDUSTRY STANDARD):
{formData.type === 'residential' ? (
  <>
    <input name="first_name" placeholder="First Name" />
    <input name="last_name" placeholder="Last Name" />
  </>
) : (
  <>
    <input name="company_name" placeholder="Business Name" />
    <input name="contact_name" placeholder="Primary Contact" />
  </>
)}
```

### **2. Database - Verify Table Usage**

**Need to Check**:
1. Is `customer_financial_summary` a TABLE or VIEW?
2. Is `customer_summary` a TABLE or VIEW?
3. Are they being used by the application?
4. Do they contain duplicate data?

**If they're TABLES with duplicate data**: Convert to VIEWS
**If they're unused**: Drop them

### **3. Database - Ensure Proper Relationships**

**Check**:
- ✅ `customer_addresses` → `customers` (FK: customer_id)
- ✅ `customer_contacts` → `customers` (FK: customer_id)
- ✅ `customer_communications` → `customers` (FK: customer_id)
- ✅ `customer_notes` → `customers` (FK: customer_id)
- ✅ `customer_preferences` → `customers` (FK: customer_id)
- ✅ `customer_history` → `customers` (FK: customer_id)
- ✅ `customer_tag_assignments` → `customers` + `customer_tags` (FKs)

### **4. Application - Wire Up All Tables**

**Currently Used**:
- ✅ `customers` - Main customer CRUD
- ✅ `customer_tags` + `customer_tag_assignments` - Tagging system
- ❓ `customer_addresses` - Not visible in form
- ❓ `customer_contacts` - Not visible in form
- ❓ `customer_communications` - Not visible in UI
- ❓ `customer_notes` - Not visible in UI
- ❓ `customer_preferences` - Not visible in UI
- ❓ `customer_history` - Not visible in UI

**Need to Add**:
1. **Addresses Tab** - Show/edit customer addresses
2. **Contacts Tab** - Show/edit customer contacts (for commercial)
3. **Communications Tab** - Show activity log
4. **Notes Tab** - Show/add notes
5. **Preferences Tab** - Show/edit preferences

---

## 📊 RECOMMENDED ACTIONS

### **Priority 1: Fix Form (Immediate)**
1. Add conditional fields based on customer type
2. Show "Company Name" for commercial
3. Show "First Name + Last Name" for residential
4. Update payload to send correct fields

### **Priority 2: Audit Database Tables (Today)**
1. Run audit query to check table types (TABLE vs VIEW)
2. Check row counts for each table
3. Identify unused tables
4. Check for duplicate data

### **Priority 3: Wire Up Existing Tables (This Week)**
1. Add "Addresses" section to customer detail view
2. Add "Contacts" section for commercial customers
3. Add "Notes" section for technician notes
4. Add "Activity" section showing communications

### **Priority 4: Clean Up Database (After Verification)**
1. Convert summary tables to VIEWs if they're duplicates
2. Drop unused tables
3. Add missing indexes
4. Update master schema documentation

---

## 🎯 INDUSTRY STANDARD CHECKLIST

### **Customer Form**
- [ ] Residential: First Name + Last Name fields
- [ ] Commercial: Company Name + Primary Contact fields
- [ ] Email validation
- [ ] Phone formatting (E.164)
- [ ] Address fields (or separate address form)
- [ ] Customer type selection
- [ ] Status selection (active/inactive)
- [ ] Tags/categories
- [ ] Notes field

### **Customer Detail View**
- [ ] Basic Info section (name, email, phone, type, status)
- [ ] Addresses section (service, billing, mailing)
- [ ] Contacts section (for commercial customers)
- [ ] Activity/Communications log
- [ ] Notes section
- [ ] Financial summary (total revenue, outstanding balance)
- [ ] Job history
- [ ] Documents/attachments

### **Database Tables**
- [ ] customers (main table)
- [ ] customer_addresses (one-to-many)
- [ ] customer_contacts (one-to-many, mainly for commercial)
- [ ] customer_tags + customer_tag_assignments (many-to-many)
- [ ] customer_communications (activity log)
- [ ] customer_notes (simple notes)
- [ ] customer_preferences (settings)
- [ ] customer_history (audit trail)
- [ ] customer_financial_summary (VIEW, not table)
- [ ] customer_summary (VIEW, not table)

---

## 🚨 NEXT STEPS

1. **Run the audit query** to see what tables actually exist
2. **Check the form** and add business name field
3. **Verify table usage** in the application
4. **Create a plan** to wire up unused tables
5. **Update master schema** to match reality

**Let me know what you find and we'll fix it properly - no bandaids!**
