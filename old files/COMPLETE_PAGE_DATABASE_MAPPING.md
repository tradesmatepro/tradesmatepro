# 🗺️ Complete Page-to-Database Mapping

**All 20+ Pages Analyzed**

---

## 📊 DASHBOARD SECTION

### **1. Dashboard (Main)**
**File:** `src/pages/Dashboard.js`
**Tables Queried:**
- `employees` → Active count
- `work_orders` → Jobs this week (status: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, INVOICED)
- `payments` → Monthly revenue
- `invoices` → Outstanding invoices
- `work_orders` → Unscheduled jobs
- `work_orders` → Quote conversion (status: QUOTE, SENT, ACCEPTED, REJECTED)
- `work_orders` → Overdue jobs
- `employee_timesheets` → Utilization
- `marketplace_requests` → Marketplace KPIs (MISSING TABLE!)
- `marketplace_responses` → Marketplace KPIs (MISSING TABLE!)

**Status:** ❌ BROKEN (enum mismatch + missing marketplace tables)

---

### **2. My Dashboard**
**File:** `src/pages/MyDashboard.js`
**Tables Queried:**
- `work_orders` → Today's jobs (status: SCHEDULED, IN_PROGRESS)
- `expenses` → Recent expenses
- `work_orders` → Upcoming jobs

**Status:** ❌ BROKEN (enum mismatch)

---

### **3. Customer Dashboard**
**File:** `src/pages/CustomerDashboard.js`
**Tables Queried:**
- `customers` → Customer list
- `work_orders` → Quotes (status: QUOTE, SENT, ACCEPTED, REJECTED)
- `work_orders` → Jobs (status: SCHEDULED, IN_PROGRESS, COMPLETED)
- `invoices` → Recent invoices

**Status:** ❌ BROKEN (enum mismatch)

---

## 🏠 MARKETPLACE

### **4. Marketplace**
**File:** `src/pages/Marketplace.js`
**Tables Queried:**
- `marketplace_requests` (MISSING!)
- `marketplace_responses` (MISSING!)
- `marketplace_messages` (MISSING!)
- `work_orders` → Convert accepted responses to jobs

**Status:** ❌ COMPLETELY BROKEN (tables don't exist)

---

## 📋 WORK SECTION

### **5. Active Jobs**
**File:** `src/pages/Jobs.js`
**Tables Queried:**
- `work_orders` → status: SCHEDULED, IN_PROGRESS
- `customers` → Join for customer info
- `employees` → Join for assigned technician
- `inventory_items` → Job allocations

**Status:** ❌ BROKEN (enum mismatch)

---

### **6. Closed Jobs**
**File:** `src/pages/JobsHistory.js`
**Tables Queried:**
- `work_orders` → status: COMPLETED
- `invoices` → status: PAID
- `customers` → Join

**Status:** ❌ BROKEN (enum mismatch)

---

### **7. Calendar**
**File:** `src/pages/Calendar.js`
**Tables Queried:**
- `schedule_events` → All scheduled events
- `work_orders` → status: SCHEDULED, IN_PROGRESS
- `employees` → Technician assignments
- `customers` → Customer info

**Status:** ❌ BROKEN (enum mismatch)

---

### **8. Documents**
**File:** `src/pages/Documents.js`
**Tables Queried:**
- `documents` → All company documents
- `work_order_attachments` → Job-specific docs
- `document_templates` → Templates

**Status:** ⚠️ TABLES EXIST (but empty)

---

## 💰 SALES SECTION

### **9. Customers** ✅
**File:** `src/pages/Customers.js`
**Tables Queried:**
- `customers`
- `customer_addresses`
- `customer_contacts`
- `customer_tags`
- `customer_tag_assignments`

**Status:** ✅ WORKING (already fixed)

---

### **10. Quotes**
**File:** `src/pages/Quotes.js`
**Tables Queried:**
- `work_orders` → status: QUOTE, SENT, ACCEPTED, REJECTED
- `work_order_line_items` → Quote line items
- `customers` → Customer info
- `company_settings` → Rates (FIXED!)
- `rate_cards` → Custom rates

**Status:** ⚠️ PARTIALLY WORKING (rates fixed, enum mismatch remains)

---

### **11. Invoices**
**File:** `src/pages/Invoices.js`
**Tables Queried:**
- `invoices` → All invoices
- `invoice_line_items` → Line items
- `payments` → Payment history
- `work_orders` → Link to jobs (status: SCHEDULED, IN_PROGRESS, COMPLETED)
- `customers` → Customer info

**Status:** ❌ BROKEN (enum mismatch)

---

### **12. Incoming Requests**
**File:** `src/pages/IncomingRequests.js`
**Tables Queried:**
- `marketplace_requests` (MISSING!)
- `marketplace_responses` (MISSING!)
- `customers` → Customer info

**Status:** ❌ COMPLETELY BROKEN (tables don't exist)

---

## 💵 FINANCE SECTION

### **13. Expenses**
**File:** `src/pages/Expenses.js`
**Tables Queried:**
- `expenses` → All expenses
- `expense_categories` → Categories (if exists)
- `work_orders` → Link to jobs
- `employees` → Who submitted
- `vendors` → Vendor expenses

**Status:** ⚠️ TABLES EXIST (but empty)

---

### **14. Purchase Orders**
**File:** `src/pages/PurchaseOrders.js`
**Tables Queried:**
- `purchase_orders` → All POs
- `po_items` (WRONG NAME! Should be purchase_order_line_items)
- `vendors` → Vendor info
- `work_orders` → Link to jobs
- `inventory_items` → Items ordered

**Status:** ❌ BROKEN (table name mismatch)

---

### **15. Vendors**
**File:** `src/pages/Vendors.js`
**Tables Queried:**
- `vendors` → All vendors
- `vendor_contacts` → Contacts
- `vendor_categories` → Categories
- `purchase_orders` → PO history

**Status:** ⚠️ TABLES EXIST (but empty)

---

### **16. Reports**
**File:** `src/pages/Reports.js`
**Tables Queried:**
- `work_orders` → Job reports
- `invoices` → Revenue reports
- `payments` → Payment reports
- `expenses` → Expense reports
- `employees` → Employee reports
- `customers` → Customer reports

**Status:** ❌ BROKEN (depends on other broken tables)

---

### **17. Payroll**
**File:** `src/pages/Payroll.js`
**Tables Queried:**
- `payroll_runs` → Payroll periods
- `payroll_line_items` → Employee pay
- `employee_timesheets` → Hours worked
- `employees` → Employee info
- `work_orders` → Job time tracking

**Status:** ⚠️ TABLES EXIST (but empty)

---

## 👥 TEAM SECTION

### **18. Employees**
**File:** `src/pages/Employees.js`
**Tables Queried:**
- `employees` → All employees
- `users` → Auth users
- `profiles` → User profiles
- `employee_timesheets` → Time tracking
- `work_orders` → Jobs assigned

**Status:** ⚠️ TABLES EXIST (but empty)

---

### **19. Timesheets**
**File:** `src/pages/Timesheets.js`
**Tables Queried:**
- `employee_timesheets` → All timesheets
- `employees` → Employee info
- `work_orders` → Jobs worked
- `payroll_runs` → Payroll integration

**Status:** ⚠️ TABLES EXIST (but empty)

---

## ⚙️ OPERATIONS SECTION

### **20. Tools**
**File:** `src/pages/Tools.js`
**Tables Queried:**
- `tools` → All tools
- `tool_assignments` → Who has what (if exists)
- `employees` → Assigned to

**Status:** ⚠️ TABLES EXIST (but empty)

---

### **21. Inventory**
**File:** `src/pages/Inventory.js`
**Tables Queried:**
- `inventory_items` → All items
- `inventory_locations` → Warehouse locations
- `inventory_stock` → Stock levels
- `inventory_movements` → Transactions
- `work_orders` → Job allocations

**Status:** ⚠️ TABLES EXIST (but empty)

---

### **22. Messages**
**File:** `src/pages/Messages.js`
**Tables Queried:**
- `messages` → All messages
- `customers` → Customer messages
- `work_orders` → Job-related messages
- `employees` → Internal messages

**Status:** ⚠️ TABLES EXIST (but empty)

---

### **23. Beta**
**File:** Various beta features
**Tables Queried:**
- Various experimental tables

**Status:** ⚠️ UNKNOWN

---

## 🔧 ACCOUNT SECTION

### **24. Settings**
**File:** `src/pages/Settings.js`
**Tables Queried:**
- `company_settings` → Company settings (FIXED!)
- `payment_settings` → Payment config
- `users` → User management
- `profiles` → User profiles
- `rate_cards` → Rate management

**Status:** ⚠️ PARTIALLY WORKING (company_settings fixed)

---

### **25. Developer Tools**
**File:** `src/pages/DeveloperTools.js`
**Tables Queried:**
- ALL TABLES → Schema inspection
- `audit_logs` → Error logs

**Status:** ✅ WORKING (reads schema)

---

## 📊 SUMMARY

### **By Status:**

| Status | Count | Pages |
|--------|-------|-------|
| ❌ COMPLETELY BROKEN | 4 | Marketplace, Incoming Requests, Purchase Orders, Reports |
| ❌ BROKEN (Enum Mismatch) | 8 | Dashboard, My Dashboard, Customer Dashboard, Active Jobs, Closed Jobs, Calendar, Quotes, Invoices |
| ⚠️ EMPTY (Tables exist but no data) | 11 | Documents, Expenses, Vendors, Payroll, Employees, Timesheets, Tools, Inventory, Messages, Beta, Settings |
| ✅ WORKING | 2 | Customers, Developer Tools |

### **Critical Issues:**

1. **ENUM CASE MISMATCH** → Breaks 8 pages
2. **MISSING MARKETPLACE TABLES** → Breaks 2 pages
3. **WRONG TABLE NAME (po_items)** → Breaks 1 page
4. **EMPTY TABLES** → 11 pages can't be tested

---

## 🎯 FIX PRIORITY

### **Phase 1: Fix Enum Mismatch (URGENT)**
**Fixes:** 8 pages
**Time:** 1 hour
**Impact:** Dashboard, My Dashboard, Customer Dashboard, Active Jobs, Closed Jobs, Calendar, Quotes, Invoices

### **Phase 2: Create Marketplace Tables (URGENT)**
**Fixes:** 2 pages
**Time:** 2 hours
**Impact:** Marketplace, Incoming Requests

### **Phase 3: Rename po_items Table (HIGH)**
**Fixes:** 1 page
**Time:** 30 minutes
**Impact:** Purchase Orders

### **Phase 4: Fix Reports (HIGH)**
**Fixes:** 1 page
**Time:** 1 hour
**Impact:** Reports (depends on other fixes)

### **Phase 5: Seed Test Data (MEDIUM)**
**Fixes:** 11 pages become testable
**Time:** 3 hours
**Impact:** All empty table pages

---

## 🚀 TOTAL IMPACT

**After Phase 1-4 (4.5 hours):**
- ✅ 14 pages working
- ⚠️ 11 pages testable (need data)
- ❌ 0 pages broken

**After Phase 5 (7.5 hours total):**
- ✅ 25 pages fully working
- ❌ 0 pages broken

---

**Ready to create the migration scripts?**

