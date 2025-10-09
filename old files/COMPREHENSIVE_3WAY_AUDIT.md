# 🔍 Comprehensive 3-Way Schema Audit

**Goal:** Compare Locked Schemas vs Actual Database vs Frontend Code vs Competitor Standards

**Date:** 2025-09-30

---

## 📊 Dashboard Structure Analysis

### **Your Dashboard (4 Main Sections + Marketplace):**

```
🏠 Marketplace (Angi/Thumbtack style)

📋 Work
├── Active Jobs
├── Closed Jobs
├── Calendar
└── Documents

💰 Sales
├── Customer Dashboard
├── Customers
├── Quotes
├── Invoices
└── Incoming Requests (Marketplace)

💵 Finance
├── Expenses
├── Purchase Orders
├── Vendors
├── Reports
└── Payroll

👥 Team
├── Employees
└── Timesheets

⚙️ Operations
├── Tools
├── Inventory
├── Messages
└── Beta

🔧 Account
├── Settings
└── 🛠️ Developer
```

---

## 🎯 Page-by-Page Analysis

### **1. MARKETPLACE (Unique Feature)**

#### **What It Should Be (Angi/Thumbtack Model):**
```
Customer Posts Request → Contractors See Request → Contractors Submit Quotes → Customer Picks Winner
```

#### **Expected Tables:**
```sql
marketplace_requests (customer posts)
├── id
├── customer_id
├── service_type
├── description
├── location
├── budget_range
├── urgency
├── photos
├── status (open, quoted, awarded, completed)
└── created_at

marketplace_responses (contractor quotes)
├── id
├── request_id
├── company_id (contractor)
├── quote_amount
├── message
├── estimated_duration
├── status (pending, accepted, rejected)
└── created_at

marketplace_messages
├── id
├── request_id
├── sender_id
├── message
└── created_at
```

#### **Actual Database (from schema_dump.json):**
- ❓ Need to check if these tables exist
- ❓ Need to check column names match

#### **Frontend Code Expects:**
```javascript
// From Customer Portal Jobs.js
marketplace_request_id
marketplace_response_id

// From supaFetch.js
'marketplace_requests'
'marketplace_responses'
'marketplace_messages'
'request_tags'
```

#### **Status:** ⚠️ NEEDS VERIFICATION

---

### **2. ACTIVE JOBS**

#### **What Competitors Do:**

**Jobber:**
- Shows jobs with status: scheduled, in_progress, on_hold
- Displays: customer, technician, date, value, status

**ServiceTitan:**
- Shows jobs with status: scheduled, dispatched, in_progress, on_hold
- Displays: customer, technician, date, value, job type, priority

**Housecall Pro:**
- Shows jobs with status: scheduled, in_progress
- Displays: customer, pro, date, value, job details

#### **Expected Query:**
```sql
SELECT * FROM work_orders
WHERE status IN ('scheduled', 'in_progress', 'on_hold')
AND company_id = ?
ORDER BY scheduled_start ASC
```

#### **Frontend Code Expects:**
```javascript
// From WorkOrders.js
work_orders?status=in.(SCHEDULED,IN_PROGRESS,COMPLETED,INVOICED)

// From JobsDatabasePanel.js
work_orders?status=in.(SCHEDULED,IN_PROGRESS)

// Expects columns:
- id
- status
- title
- description
- total_amount
- scheduled_start
- scheduled_end
- customer_id
- assigned_to
- created_at
```

#### **Actual Database Has:**
```sql
work_orders (0 rows)
├── status: work_order_status_enum
    ('draft', 'quote', 'approved', 'scheduled', 'parts_ordered', 
     'on_hold', 'in_progress', 'requires_approval', 'rework_needed', 
     'completed', 'invoiced', 'cancelled')
```

#### **Status:** ⚠️ ENUM MISMATCH
- Frontend uses: `SCHEDULED`, `IN_PROGRESS` (uppercase)
- Database has: `scheduled`, `in_progress` (lowercase)
- **This will cause 0 results!**

---

### **3. CLOSED JOBS**

#### **What Competitors Do:**

**Jobber:**
- Shows completed jobs with paid invoices
- Displays: customer, date completed, total, payment status

**ServiceTitan:**
- Shows completed/cancelled jobs
- Displays: customer, completion date, total, invoice status

#### **Expected Query:**
```sql
SELECT * FROM work_orders
WHERE status IN ('completed', 'cancelled')
AND company_id = ?
ORDER BY updated_at DESC
```

#### **Frontend Code Expects:**
```javascript
// From JobsHistory.js
work_orders?status=eq.COMPLETED&invoices.status=eq.PAID

// Expects:
- work_orders with status='COMPLETED' (uppercase)
- Join to invoices table
- Filter invoices.status='PAID'
```

#### **Status:** ⚠️ ENUM MISMATCH (same as Active Jobs)

---

### **4. CALENDAR**

#### **What Competitors Do:**

**Jobber:**
- Calendar view with scheduled jobs
- Drag-and-drop scheduling
- Technician resources
- Color coding by status

**ServiceTitan:**
- Calendar with appointments
- Technician dispatch board
- Drag-and-drop
- Real-time updates

#### **Expected Tables:**
```sql
schedule_events
├── id
├── work_order_id
├── user_id (technician)
├── start_time
├── end_time
├── event_type
└── status

work_orders (for job details)
```

#### **Frontend Code Expects:**
```javascript
// From Calendar.js
work_orders?status=in.(SCHEDULED,IN_PROGRESS)

// Uses calendarService.getCalendarEvents()
// Expects:
- schedule_events table
- work_orders join
- users (employees) join
- customers join
```

#### **Actual Database Has:**
```sql
schedule_events (0 rows)
├── company_id
├── work_order_id
├── user_id
├── event_type
├── start_time
└── end_time
```

#### **Status:** ⚠️ ENUM MISMATCH + EMPTY TABLE

---

### **5. DOCUMENTS**

#### **What Competitors Do:**

**Jobber:**
- Attachments per job
- Photos, PDFs, documents
- Customer-facing vs internal

**ServiceTitan:**
- Documents library
- Job attachments
- Customer documents
- Templates

#### **Expected Tables:**
```sql
documents
├── id
├── company_id
├── work_order_id
├── customer_id
├── file_name
├── file_url
├── file_type
├── uploaded_by
└── created_at

work_order_attachments
├── id
├── work_order_id
├── file_url
├── uploaded_by
└── created_at
```

#### **Actual Database Has:**
```sql
documents (0 rows)
work_order_attachments (0 rows)
```

#### **Status:** ✅ TABLES EXIST (but empty)

---

### **6. CUSTOMER DASHBOARD**

#### **What Competitors Do:**

**Jobber:**
- Recent customers
- Active jobs per customer
- Outstanding invoices
- Customer lifetime value

**ServiceTitan:**
- Customer list with stats
- Revenue per customer
- Job history
- Communication history

#### **Frontend Code Expects:**
```javascript
// From CustomerDashboard.js
customers?select=*&order=created_at.desc&limit=50
work_orders?status=in.(QUOTE,SENT,ACCEPTED,REJECTED) // Quotes
work_orders?status=in.(SCHEDULED,IN_PROGRESS,COMPLETED) // Jobs
invoices?select=*
```

#### **Status:** ⚠️ ENUM MISMATCH (QUOTE vs quote, SENT vs sent)

---

### **7. CUSTOMERS** ✅ ALREADY TESTED

#### **Status:** ✅ WORKING (we fixed this)

---

### **8. QUOTES** ✅ ALREADY TESTED

#### **Status:** ⚠️ PARTIALLY WORKING (rates fixed, but enum mismatch)

---

### **9. INVOICES**

#### **What Competitors Do:**

**Jobber:**
- Create invoice from job
- Line items
- Payment tracking
- Send to customer

**ServiceTitan:**
- Invoice from job
- Multiple payment methods
- Payment plans
- Auto-reminders

#### **Expected Tables:**
```sql
invoices
├── id
├── company_id
├── work_order_id
├── customer_id
├── invoice_number
├── status (draft, sent, paid, overdue)
├── subtotal
├── tax_amount
├── total_amount
├── due_date
└── created_at

invoice_line_items
├── id
├── invoice_id
├── description
├── quantity
├── unit_price
└── total

payments
├── id
├── invoice_id
├── amount
├── payment_method
├── payment_date
└── status
```

#### **Frontend Code Expects:**
```javascript
// From Invoices.js
work_orders?status=in.(SCHEDULED,IN_PROGRESS,COMPLETED) // For creating invoices
invoices?select=*
invoice_line_items?invoice_id=eq.{id}
payments?invoice_id=eq.{id}
```

#### **Actual Database Has:**
```sql
invoices (0 rows)
invoice_line_items (0 rows)
payments (0 rows)
```

#### **Status:** ⚠️ TABLES EXIST + ENUM MISMATCH

---

### **10. INCOMING REQUESTS (Marketplace)**

#### **Expected:** Same as Marketplace section above

#### **Status:** ⚠️ NEEDS VERIFICATION

---

### **11. EXPENSES**

#### **What Competitors Do:**

**Jobber:**
- Track expenses per job
- Expense categories
- Receipt photos
- Expense reports

**ServiceTitan:**
- Job costing
- Expense tracking
- Purchase orders
- Vendor bills

#### **Expected Tables:**
```sql
expenses
├── id
├── company_id
├── work_order_id (optional)
├── employee_id
├── vendor_id (optional)
├── expense_type
├── amount
├── description
├── receipt_url
├── expense_date
└── approved_by
```

#### **Frontend Code Expects:**
```javascript
// Expected query
expenses?select=*,work_orders(title),employees(name)
```

#### **Actual Database Has:**
```sql
expenses (0 rows)
├── company_id
├── work_order_id
├── employee_id
├── expense_type (enum)
├── amount
├── description
└── approved_by
```

#### **Status:** ✅ TABLES EXIST (but empty)

---

### **12. PURCHASE ORDERS**

#### **What Competitors Do:**

**ServiceTitan:**
- Create PO for materials
- Link to jobs
- Vendor management
- Approval workflow

**Jobber:**
- Basic PO functionality
- Link to jobs
- Track costs

#### **Expected Tables:**
```sql
purchase_orders
├── id
├── company_id
├── vendor_id
├── work_order_id (optional)
├── po_number
├── status (draft, sent, received, cancelled)
├── total_amount
└── created_at

po_items
├── id
├── purchase_order_id
├── description
├── quantity
├── unit_price
└── total
```

#### **Actual Database Has:**
```sql
purchase_orders (0 rows)
(need to check for po_items or purchase_order_items)
```

#### **Status:** ⚠️ NEEDS VERIFICATION

---

### **13. VENDORS**

#### **Expected Tables:**
```sql
vendors
├── id
├── company_id
├── name
├── contact_name
├── email
├── phone
├── address
└── status
```

#### **Actual Database Has:**
```sql
vendors (0 rows)
```

#### **Status:** ✅ TABLE EXISTS (but empty)

---

### **14. REPORTS**

#### **What Competitors Do:**

**Jobber:**
- Revenue reports
- Job reports
- Customer reports
- Employee reports

**ServiceTitan:**
- Comprehensive analytics
- Custom reports
- Dashboards
- KPIs

#### **Expected:** Queries across multiple tables

#### **Status:** ⚠️ DEPENDS ON OTHER TABLES WORKING

---

### **15. PAYROLL**

#### **Expected Tables:**
```sql
payroll_runs
├── id
├── company_id
├── pay_period_start
├── pay_period_end
├── status
└── processed_by

payroll_line_items
├── id
├── payroll_run_id
├── employee_id
├── hours_worked
├── hourly_rate
├── gross_pay
└── deductions

employee_timesheets
├── id
├── employee_id
├── work_order_id
├── clock_in
├── clock_out
└── hours_worked
```

#### **Actual Database Has:**
```sql
payroll_runs (0 rows)
payroll_line_items (0 rows)
employee_timesheets (0 rows)
```

#### **Status:** ✅ TABLES EXIST (but empty)

---

### **16. EMPLOYEES**

#### **Expected Tables:**
```sql
employees
├── id
├── company_id
├── user_id
├── employee_number
├── hire_date
├── status
├── hourly_rate
└── role

users (auth)
profiles (app data)
```

#### **Actual Database Has:**
```sql
employees (0 rows)
users (from auth.users)
profiles (application data)
```

#### **Status:** ✅ TABLES EXIST (but empty)

---

### **17. TIMESHEETS**

#### **Expected:** Same as payroll section

#### **Status:** ✅ TABLES EXIST (but empty)

---

### **18. TOOLS**

#### **Expected Tables:**
```sql
tools
├── id
├── company_id
├── name
├── serial_number
├── assigned_to
├── status
└── purchase_date
```

#### **Actual Database Has:**
```sql
tools (0 rows)
```

#### **Status:** ✅ TABLE EXISTS (but empty)

---

### **19. INVENTORY**

#### **Expected Tables:**
```sql
inventory_items
inventory_locations
inventory_stock
inventory_movements
```

#### **Actual Database Has:**
```sql
inventory_items (0 rows)
inventory_locations (0 rows)
inventory_stock (0 rows)
inventory_movements (0 rows)
```

#### **Status:** ✅ TABLES EXIST (but empty)

---

### **20. MESSAGES**

#### **Expected Tables:**
```sql
messages
├── id
├── company_id
├── customer_id
├── work_order_id
├── sender_id
├── message
└── created_at
```

#### **Actual Database Has:**
```sql
messages (0 rows)
```

#### **Status:** ✅ TABLE EXISTS (but empty)

---

## 🚨 CRITICAL ISSUES FOUND

### **Issue #1: ENUM CASE MISMATCH (BREAKING)**

**Problem:** Frontend uses UPPERCASE, database uses lowercase

**Frontend Code:**
```javascript
work_orders?status=in.(SCHEDULED,IN_PROGRESS,COMPLETED)
```

**Database Enum:**
```sql
work_order_status_enum: 'scheduled', 'in_progress', 'completed'
```

**Impact:** ALL work_orders queries return 0 results

**Pages Affected:**
- Active Jobs
- Closed Jobs
- Calendar
- Customer Dashboard
- Quotes
- Invoices
- All pages querying work_orders

**Fix:** Either:
1. Change frontend to lowercase
2. Change database enum to uppercase
3. Make queries case-insensitive

---

### **Issue #2: MISSING MARKETPLACE TABLES VERIFICATION**

**Need to verify:**
- marketplace_requests exists
- marketplace_responses exists
- marketplace_messages exists
- Column names match frontend expectations

---

### **Issue #3: PURCHASE ORDER ITEMS TABLE NAME**

**Frontend expects:** `po_items`
**Need to verify:** Does database have `po_items` or `purchase_order_items`?

---

## 📋 NEXT STEPS

### **Step 1: Fix Enum Case Mismatch (URGENT)**

This is breaking EVERYTHING. Need to decide:
- Change all frontend code to lowercase? (100+ files)
- Change database enum to uppercase? (1 migration)
- **Recommendation:** Change database to uppercase (less work)

### **Step 2: Verify Marketplace Tables**

Check schema_dump.json for:
- marketplace_requests
- marketplace_responses  
- marketplace_messages
- request_tags

### **Step 3: Verify Purchase Order Tables**

Check if database has `po_items` or needs renaming

### **Step 4: Seed Empty Tables**

Many tables exist but are empty (0 rows). Need seed data for testing.

---

**Want me to continue with detailed fixes?**

