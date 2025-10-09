# 🧪 Comprehensive Page-by-Page Test Plan

**Goal:** Test EVERY page to find ALL schema mismatches at once, not one-by-one.

---

## 🎯 The Problem

**Pattern So Far:**
- ✅ Customers page → Schema mismatch found & fixed
- ✅ Quotes page → Schema mismatch found & fixed
- ❌ Other 18+ pages → **NOT TESTED YET**

**Your Logic:** If 2/2 tested pages had issues, the other 18 probably do too.

**You're Right.** Let's find them all NOW.

---

## 📋 Test Matrix

### **Work Section (5 pages)**

| Page | URL | Expected Tables | Status | Issues Found |
|------|-----|----------------|--------|--------------|
| Active Jobs | `/jobs` | work_orders (status=in_progress) | ❌ Not Tested | ? |
| Closed Jobs | `/jobs/closed` | work_orders (status=completed/cancelled) | ❌ Not Tested | ? |
| Calendar | `/calendar` | schedule_events, work_orders | ❌ Not Tested | ? |
| Documents | `/documents` | documents, work_order_attachments | ❌ Not Tested | ? |

### **Sales Section (4 pages)**

| Page | URL | Expected Tables | Status | Issues Found |
|------|-----|----------------|--------|--------------|
| Customer Dashboard | `/customers/dashboard` | customers, work_orders, invoices | ❌ Not Tested | ? |
| Customers | `/customers` | customers, customer_addresses | ✅ TESTED | Fixed |
| Quotes | `/quotes` | work_orders (status=quote) | ✅ TESTED | Fixed |
| Invoices | `/invoices` | invoices, invoice_line_items, payments | ❌ Not Tested | ? |

### **Finance Section (3 pages)**

| Page | URL | Expected Tables | Status | Issues Found |
|------|-----|----------------|--------|--------------|
| Expenses | `/expenses` | expenses, expense_categories | ❌ Not Tested | ? |
| Reports | `/reports` | Multiple tables for analytics | ❌ Not Tested | ? |
| Payroll | `/payroll` | payroll_runs, payroll_line_items, employee_timesheets | ❌ Not Tested | ? |

### **Team Section (2 pages)**

| Page | URL | Expected Tables | Status | Issues Found |
|------|-----|----------------|--------|--------------|
| Employees | `/employees` | employees, users, profiles | ❌ Not Tested | ? |
| Timesheets | `/timesheets` | employee_timesheets, work_orders | ❌ Not Tested | ? |

### **Operations Section (3 pages)**

| Page | URL | Expected Tables | Status | Issues Found |
|------|-----|----------------|--------|--------------|
| Tools | `/tools` | tools, tool_assignments | ❌ Not Tested | ? |
| Messages | `/messages` | messages, customers, work_orders | ❌ Not Tested | ? |
| Beta Features | `/beta` | Various | ❌ Not Tested | ? |

### **Account Section (3 pages)**

| Page | URL | Expected Tables | Status | Issues Found |
|------|-----|----------------|--------|--------------|
| Settings | `/settings` | company_settings, payment_settings | ❌ Not Tested | ? |
| Billing | `/billing` | subscriptions, billing_plans | ❌ Not Tested | ? |
| Profile | `/profile` | profiles, users | ❌ Not Tested | ? |

---

## 🔧 Testing Methodology

### **For Each Page:**

1. **Navigate to page**
2. **Open Console (F12)**
3. **Look for errors:**
   - 400 errors (table/column doesn't exist)
   - 404 errors (endpoint not found)
   - JavaScript errors (undefined properties)
4. **Try to perform actions:**
   - Create new record
   - Edit existing record
   - Delete record
   - Filter/search
5. **Document ALL errors**

### **What to Capture:**

```
Page: [Page Name]
URL: [URL]
Errors Found:
  - [Error 1: Description]
  - [Error 2: Description]
  - [Error 3: Description]
Tables Queried:
  - [Table 1] → [Status: ✅ Works / ❌ Broken]
  - [Table 2] → [Status: ✅ Works / ❌ Broken]
Columns Missing:
  - [Table].[Column] → Expected but not found
Actions Tested:
  - Create: [✅ Works / ❌ Broken]
  - Edit: [✅ Works / ❌ Broken]
  - Delete: [✅ Works / ❌ Broken]
```

---

## 🚀 Execution Plan

### **Phase 1: Rapid Smoke Test (30 minutes)**

**Goal:** Click through EVERY page, capture console errors

**Process:**
1. Start server
2. Login
3. Visit each page in order
4. Capture console errors
5. Don't try to fix anything yet
6. Just document what's broken

**Output:** List of ALL broken pages

### **Phase 2: Detailed Error Analysis (1 hour)**

**Goal:** For each broken page, identify exact schema mismatches

**Process:**
1. For each page with errors:
   - Identify which table query failed
   - Identify which column is missing
   - Check schema_dump.json for actual structure
   - Document the mismatch

**Output:** Comprehensive list of ALL schema fixes needed

### **Phase 3: Batch Fix (2 hours)**

**Goal:** Fix ALL schema issues at once

**Process:**
1. Group fixes by type:
   - Missing columns
   - Wrong column names
   - Wrong data types
   - Missing tables
2. Create migration scripts
3. Deploy all fixes
4. Re-test all pages

**Output:** All pages working

---

## 📝 Test Results Template

```markdown
# Page Test Results

## Page: [Name]
**URL:** [URL]
**Date Tested:** [Date]
**Tester:** [Name]

### Console Errors:
```
[Paste console errors here]
```

### Network Errors:
- GET /api/[endpoint] → 400 Bad Request
  - Error: column "[column_name]" does not exist
  - Table: [table_name]

### Expected vs Actual Schema:

**Expected (from code):**
```sql
SELECT id, name, email, phone FROM customers
```

**Actual (from database):**
```sql
-- Missing columns: phone
-- Extra columns: phone_number
```

### Actions Tested:
- [ ] Page loads
- [ ] Data displays
- [ ] Create new record
- [ ] Edit record
- [ ] Delete record
- [ ] Search/filter
- [ ] Export

### Status: ❌ BROKEN / ✅ WORKING

### Fixes Needed:
1. [Fix 1]
2. [Fix 2]
3. [Fix 3]
```

---

## 🎯 Your Task

### **Option A: You Test (Faster)**

**I'll guide you:**
1. Start server
2. I'll give you a checklist
3. You click through pages
4. Paste console errors for each page
5. I'll analyze and create fix plan

**Time:** 30 minutes of clicking, 2 hours for me to fix

### **Option B: I Test (Automated)**

**I'll create a test script:**
1. Automated page crawler
2. Captures all console errors
3. Tests all API endpoints
4. Generates comprehensive report

**Time:** 1 hour to build script, 30 minutes to run, 2 hours to fix

### **Option C: Hybrid (Recommended)**

**You do rapid smoke test:**
1. Click through all 20 pages
2. Paste console errors in one big dump
3. Don't try to understand them

**I do analysis:**
1. Parse all errors
2. Identify all schema mismatches
3. Create comprehensive fix
4. Deploy all at once

**Time:** 15 minutes for you, 3 hours for me

---

## 🚨 Expected Findings

Based on pattern so far, I predict:

### **High Probability Issues:**

1. **Employees Page**
   - Querying `employees` table with wrong columns
   - Expecting `employee_status` but database has `status`
   - Expecting `hire_date` but database has `hired_at`

2. **Invoices Page**
   - Querying `invoices` with wrong status enum
   - Expecting `invoice_status` but database has `status`
   - Missing `invoice_number` generation

3. **Timesheets Page**
   - Querying `employee_timesheets` with wrong columns
   - Missing `work_order_id` join
   - Wrong date column names

4. **Expenses Page**
   - Querying `expenses` with wrong columns
   - Missing `expense_type` enum values
   - Wrong approval workflow columns

5. **Tools Page**
   - Querying `tools` with wrong columns
   - Missing `assigned_to` relationship
   - Wrong status enum

### **Medium Probability Issues:**

6. **Calendar Page**
   - Querying `schedule_events` with wrong structure
   - Missing `work_order_id` join
   - Wrong date/time columns

7. **Documents Page**
   - Querying `documents` with wrong columns
   - Missing `work_order_id` relationship
   - Wrong file storage paths

8. **Reports Page**
   - Complex queries across multiple tables
   - Likely many column name mismatches
   - Missing aggregation columns

### **Low Probability Issues:**

9. **Settings Page**
   - We already fixed `company_settings`
   - But might have issues with `payment_settings`

10. **Profile Page**
    - Should be simple
    - But might have `profiles` vs `users` confusion

---

## 🎯 Recommendation

**Let's do Option C (Hybrid):**

1. **You:** Spend 15 minutes clicking through all pages, paste ALL console errors in one message
2. **Me:** Analyze all errors, create comprehensive fix, deploy all at once
3. **You:** Re-test all pages to confirm fixes

**This finds ALL issues NOW instead of discovering them one-by-one over weeks.**

---

## 📋 Quick Test Checklist

```
[ ] Active Jobs
[ ] Closed Jobs
[ ] Calendar
[ ] Documents
[ ] Customer Dashboard
[ ] Customers (already tested)
[ ] Quotes (already tested)
[ ] Invoices
[ ] Expenses
[ ] Reports
[ ] Payroll
[ ] Employees
[ ] Timesheets
[ ] Tools
[ ] Messages
[ ] Beta
[ ] Settings
[ ] Billing
[ ] Profile
```

**Ready to start? Just click through and paste errors!** 🚀

