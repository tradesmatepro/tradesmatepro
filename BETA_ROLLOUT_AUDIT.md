# TradeMate Pro Beta Rollout Audit
**Date:** 2025-10-13  
**Purpose:** Identify core features needed for quote-to-paid pipeline vs. features to defer for post-beta updates

---

## 🎯 BETA GOAL
Enable contractors to:
1. Create and send quotes to customers
2. Customer approves quote (via public portal)
3. Schedule the job
4. Complete the work
5. Invoice the customer
6. Receive payment
7. Close the job

---

## ✅ CORE FEATURES REQUIRED FOR BETA

### **1. CUSTOMERS** ✓ (REQUIRED)
**Why:** Can't create quotes without customers  
**Status:** Fully implemented  
**Tables:** `customers`, `customer_addresses`  
**Pages:** `/customers` (Customers.js)  
**Dependencies:** None  
**Action:** Keep enabled

---

### **2. QUOTES** ✓ (REQUIRED)
**Why:** Starting point of the pipeline  
**Status:** Fully implemented with QuoteBuilder  
**Tables:** `work_orders` (status='quote'), `line_items`  
**Pages:** `/quotes` (QuotesPro.js)  
**Features Needed:**
- ✅ Create quote with line items (labor, materials, equipment)
- ✅ Calculate totals, tax, labor summary
- ✅ Send quote to customer (email/SMS/link)
- ✅ Quote templates
- ✅ Public quote acceptance portal (`quote.html`)
- ✅ Customer signature capture
- ✅ Smart scheduling integration

**Features to DEFER:**
- ❌ Quote analytics dashboard (nice-to-have)
- ❌ Follow-up automation (post-beta)
- ❌ Approval workflows for large quotes (enterprise feature)
- ❌ Quote versioning/revisions (v2 feature)

**Action:** Keep core quote creation + sending + acceptance. Hide analytics/follow-ups/approvals for beta.

---

### **3. JOBS** ✓ (REQUIRED)
**Why:** Approved quotes become jobs  
**Status:** Fully implemented  
**Tables:** `work_orders` (status='approved'/'scheduled'/'in_progress'/'completed')  
**Pages:** `/jobs` (Jobs.js), `/jobs/history` (JobsHistory.js)  
**Features Needed:**
- ✅ View active jobs (approved, scheduled, in progress)
- ✅ Job details with line items
- ✅ Schedule jobs (via Calendar or Smart Scheduler)
- ✅ Update job status (start, complete, on hold, cancel)
- ✅ Job closeout (mark complete, add notes)
- ✅ Create invoice from completed job

**Features to DEFER:**
- ❌ Job costing/profitability analysis (post-beta)
- ❌ Time tracking per job (use Timesheets instead)
- ❌ Photo uploads (Documents can handle this)
- ❌ Job utilization metrics (analytics feature)

**Action:** Keep core job management. Hide advanced analytics.

---

### **4. CALENDAR/SCHEDULING** ✓ (REQUIRED)
**Why:** Need to schedule jobs and track technician availability  
**Status:** Fully implemented with FullCalendar + Smart Scheduling Assistant  
**Tables:** `schedule_events`, `employees`, `employee_availability`  
**Pages:** `/calendar` (Calendar.js)  
**Features Needed:**
- ✅ View schedule by day/week/month
- ✅ Drag-and-drop scheduling
- ✅ Assign technicians to jobs
- ✅ Smart Scheduling Assistant (auto-suggest times)
- ✅ Customer-facing scheduling (quote.html integration)
- ✅ Business hours and buffer settings

**Features to DEFER:**
- ❌ GPS tracking integration (coming soon feature)
- ❌ Route optimization (coming soon)
- ❌ Automated dispatch (v2)

**Action:** Keep all current scheduling features - they're core to the pipeline.

---

### **5. INVOICES** ✓ (REQUIRED)
**Why:** Final step before payment  
**Status:** Fully implemented  
**Tables:** `work_orders` (status='invoiced'), `invoices`, `invoice_line_items`  
**Pages:** `/invoices` (Invoices.js)  
**Features Needed:**
- ✅ Create invoice from completed job
- ✅ Invoice line items (auto-populated from job)
- ✅ Send invoice to customer (email/PDF)
- ✅ Track invoice status (draft, sent, paid, overdue)
- ✅ Record payments
- ✅ Invoice settings (terms, logo, footer)

**Features to DEFER:**
- ❌ Payment plans (installments) - enterprise feature
- ❌ Payment reminders automation - nice-to-have
- ❌ Aging reports - analytics feature
- ❌ Stripe integration - can add post-beta
- ❌ Recurring invoices - not needed for service jobs

**Action:** Keep core invoicing. Hide payment plans, reminders, analytics.

---

### **6. PAYMENTS** ✓ (REQUIRED - BASIC)
**Why:** Need to record when customer pays  
**Status:** Basic implementation exists  
**Tables:** `payments`  
**Features Needed:**
- ✅ Record manual payment (cash, check, card)
- ✅ Link payment to invoice
- ✅ Update invoice status to 'paid'
- ✅ Payment history per customer

**Features to DEFER:**
- ❌ Stripe/online payment processing (can add later)
- ❌ Refund processing (edge case)
- ❌ Payment analytics (post-beta)

**Action:** Keep manual payment recording. Defer online payment gateway.

---

### **7. SETTINGS** ✓ (REQUIRED - SUBSET)
**Why:** Need company info, tax rates, business hours, invoice settings  
**Status:** Fully implemented  
**Tables:** `companies`, `settings`  
**Pages:** `/settings` (Settings.js)  
**Tabs Needed for Beta:**
- ✅ Company Info (name, logo, address, phone)
- ✅ Business Settings (hours, timezone, tax rate)
- ✅ Invoicing Settings (terms, payment methods, logo)
- ✅ Scheduling Settings (buffers, intervals, working days)
- ✅ Quote Settings (default terms, deposit requirements)

**Tabs to DEFER:**
- ❌ Integrations (QuickBooks, Zapier, etc.) - post-beta
- ❌ Advanced permissions - keep simple role-based for beta
- ❌ API keys management - not needed yet
- ❌ Marketplace settings - not in beta scope

**Action:** Keep essential settings tabs. Hide integrations and advanced features.

---

### **8. EMPLOYEES** ✓ (REQUIRED - BASIC)
**Why:** Need to assign technicians to jobs and schedule them  
**Status:** Fully implemented  
**Tables:** `employees`, `users`, `profiles`  
**Pages:** `/employees` (Employees.js)  
**Features Needed:**
- ✅ Add/edit employees
- ✅ Set employee role (owner, admin, employee)
- ✅ Mark employees as schedulable
- ✅ Employee availability (for smart scheduling)

**Features to DEFER:**
- ❌ Employee permissions (granular) - keep simple roles
- ❌ Employee performance metrics - analytics
- ❌ Certifications/licenses tracking - v2

**Action:** Keep basic employee management. Hide advanced features.

---

### **9. DASHBOARD** ✓ (REQUIRED - SIMPLIFIED)
**Why:** Landing page, quick overview  
**Status:** Implemented (My Dashboard, Admin Dashboard)  
**Features Needed:**
- ✅ Quick stats (jobs today, revenue this month, pending quotes)
- ✅ Recent activity
- ✅ Quick actions (create quote, view calendar)

**Features to DEFER:**
- ❌ Advanced analytics charts - post-beta
- ❌ Business intelligence - coming soon feature

**Action:** Keep simple dashboard with key metrics.

---

## ❌ FEATURES TO HIDE/DEFER FOR BETA

### **MARKETPLACE** ❌ (POST-BETA)
**Why:** Not part of core quote-to-paid pipeline  
**Tables:** `marketplace_requests`, `marketplace_responses`, `marketplace_reviews`  
**Action:** Hide from navigation for beta users

---

### **PURCHASE ORDERS** ❌ (POST-BETA)
**Why:** Nice-to-have for material ordering, not critical  
**Tables:** `purchase_orders`, `purchase_order_items`  
**Action:** Hide from navigation for beta users

---

### **VENDORS** ❌ (POST-BETA)
**Why:** Tied to purchase orders, not critical  
**Tables:** `vendors`  
**Action:** Hide from navigation for beta users

---

### **REPORTS** ❌ (POST-BETA)
**Why:** Analytics feature, not needed for basic operations  
**Pages:** `/reports`, `/advanced-reports`  
**Action:** Hide from navigation for beta users

---

### **PAYROLL** ❌ (POST-BETA)
**Why:** Complex feature, not needed for basic job completion  
**Tables:** `payroll_runs`, `payroll_items`  
**Action:** Hide from navigation for beta users

---

### **TIMESHEETS** ⚠️ (OPTIONAL FOR BETA)
**Why:** Useful for tracking labor hours, but not critical for pipeline  
**Tables:** `timesheets`, `timesheet_entries`  
**Decision:** Keep visible but mark as "optional" - some contractors may want it  
**Action:** Keep in navigation but don't require it for job completion

---

### **EXPENSES** ⚠️ (OPTIONAL FOR BETA)
**Why:** Useful for tracking job costs, but not critical  
**Tables:** `expenses`  
**Decision:** Keep visible but mark as "optional"  
**Action:** Keep in navigation but don't require it

---

### **DOCUMENTS** ⚠️ (OPTIONAL FOR BETA)
**Why:** Useful for storing contracts, photos, but not critical  
**Tables:** `documents`  
**Decision:** Keep visible - contractors may want to attach docs to jobs  
**Action:** Keep in navigation

---

### **COMING SOON FEATURES** ❌ (HIDE FOR BETA)
- Mobile App
- GPS Tracking
- Marketing Automation
- AI Estimating
- Enhanced Customer Portal
- Business Intelligence
- Payment Processing (Stripe - can add later)
- Advanced Scheduling (already implemented, remove from "coming soon")

**Action:** Hide entire "Coming Soon" section for beta users

---

## 📊 PIPELINE DEPENDENCY MAP

```
CUSTOMER (required)
    ↓
QUOTE (required)
    ↓ (customer approves via quote.html)
APPROVED QUOTE → JOB (required)
    ↓
CALENDAR/SCHEDULING (required - assign technician, set date)
    ↓
JOB IN PROGRESS (required - update status)
    ↓
JOB COMPLETED (required - closeout)
    ↓
INVOICE (required - create from job)
    ↓
PAYMENT (required - record payment)
    ↓
INVOICE PAID → JOB CLOSED (required)
```

### Supporting Features (Required):
- **EMPLOYEES** - needed for scheduling and assignment
- **SETTINGS** - needed for company info, tax rates, business hours
- **DASHBOARD** - landing page and quick actions

### Optional Features (Keep but not required):
- **TIMESHEETS** - track labor hours per job
- **EXPENSES** - track job costs
- **DOCUMENTS** - attach files to jobs/quotes

### Features to Hide:
- **MARKETPLACE**
- **PURCHASE ORDERS**
- **VENDORS**
- **REPORTS**
- **PAYROLL**
- **COMING SOON SECTION**

---

## 🔧 IMPLEMENTATION STRATEGY

### Option 1: Role-Based Filtering (RECOMMENDED)
Add a `beta_user` flag to user profiles or companies table.  
Filter navigation based on this flag in `simplePermissions.js`.

**Pros:**
- No code deletion
- Easy to toggle features on/off
- Can gradually roll out features to beta users

**Cons:**
- Requires database migration to add flag

---

### Option 2: Feature Flags
Use existing feature flag system to hide/show modules.

**Pros:**
- Already have infrastructure
- Can toggle per company

**Cons:**
- Need to add flags for each deferred feature

---

### Option 3: Separate Beta Navigation
Create a `getBetaNavigation()` function that returns only core features.

**Pros:**
- Clean separation
- Easy to maintain

**Cons:**
- Duplicate navigation logic

---

## ✅ RECOMMENDED APPROACH

1. **Add `beta_mode` flag to companies table**
2. **Update `getPermittedNavigation()` in `simplePermissions.js`:**
   - If `company.beta_mode === true`, hide:
     - Marketplace
     - Purchase Orders
     - Vendors
     - Reports
     - Payroll
     - Coming Soon section
   - Keep visible:
     - Dashboard
     - Customers
     - Quotes
     - Jobs
     - Calendar
     - Invoices
     - Employees
     - Settings (core tabs only)
     - Timesheets (optional)
     - Expenses (optional)
     - Documents (optional)

3. **Simplify feature-specific UIs for beta:**
   - Quotes: Hide analytics, follow-ups, approvals
   - Jobs: Hide utilization metrics
   - Invoices: Hide payment plans, reminders
   - Settings: Hide integrations tab

4. **Add "Beta" badge to optional features** (Timesheets, Expenses, Documents)

---

## 📋 NEXT STEPS

1. ✅ Review this audit with user
2. Add `beta_mode` boolean to `companies` table
3. Update `simplePermissions.js` to filter navigation
4. Test beta navigation with sample company
5. Deploy to production
6. Invite beta testers
7. Collect feedback
8. Gradually enable deferred features based on feedback

---

## 🎯 SUCCESS METRICS FOR BETA

- [ ] User can create customer
- [ ] User can create and send quote
- [ ] Customer can approve quote via public link
- [ ] Approved quote auto-converts to job
- [ ] User can schedule job on calendar
- [ ] User can mark job complete
- [ ] User can create invoice from job
- [ ] User can record payment
- [ ] Invoice shows as paid
- [ ] Job shows as closed

**Target:** Complete full pipeline in < 10 minutes for simple job.

---

## 🚨 CRITICAL ISSUES FOUND (MUST FIX BEFORE BETA)

### **1. QUOTE ACCEPTANCE** ✅ FIXED
**File:** `quote.html`
**Previous Error:** `ReferenceError: formatSlotDateTime is not defined` (line 1465)
**Impact:** Customers could not approve quotes - entire pipeline was blocked
**Status:** ✅ FIXED - JavaScript error resolved
**Fixes Applied:**
- ✅ Added standalone `formatSlotDateTime()` helper function
- ✅ Added deposit payment method selection (online/cash/check/prepaid)
- ✅ Added "Skip scheduling" option for customers who want company to call them
- ✅ Improved confirmation messages based on customer choices
**Needs Testing:** End-to-end approval flow, RPC functionality, email notifications

---

### **2. INCOMPLETE FEATURES WITH "COMING SOON" PLACEHOLDERS** ⚠️

#### **Quotes Page (QuotesPro.js):**
- Line 1072: "COMING SOON: Schedule follow-up" - Follow-up scheduling not implemented
- Line 1214: "COMING SOON: Create version" - Quote versioning not implemented
- **Impact:** Medium - These are nice-to-have features, not critical for beta
- **Action:** Hide these buttons for beta OR implement basic functionality

#### **Invoices Page (Invoices.js):**
- Line 2772: "COMING SOON: Send reminder now" - Payment reminders not functional
- Line 2778: "COMING SOON: Edit reminder" - Reminder editing not implemented
- Line 2794: "COMING SOON: Setup payment reminders" - Reminder setup not implemented
- **Impact:** Medium - Manual follow-up still works, automation is missing
- **Action:** Hide payment reminder features for beta

#### **Jobs Page (Jobs.js):**
- Line 729: "TODO: implement row expand state in Jobs page"
- **Impact:** Low - Row expansion is a UX enhancement
- **Action:** Can defer for beta

---

### **3. INVENTORY NOT FINISHED** ⚠️
**Status:** Partially implemented with "Coming Soon" tabs
**Files:** `src/pages/Inventory.js`
**Missing:**
- Barcode & QR Code Scanning (line 56 - ComingSoonTab)
- Cycle Count Management (line 63 - ComingSoonTab)

**Impact:** Medium - Basic inventory (items, locations, stock, movements) IS implemented
**Decision:**
- ✅ Keep basic inventory tabs (Items, Locations, Stock, Movements)
- ❌ Hide "Scanning" and "Cycle Counts" tabs for beta
- ⚠️ Inventory is OPTIONAL for beta - not required for quote-to-paid pipeline

---

### **4. SETTINGS COMPLETENESS** ⚠️
**Status:** Core settings exist, but need verification
**Required for Beta:**
- ✅ Company Info (name, logo, address)
- ✅ Business Settings (hours, timezone, tax rate)
- ✅ Invoicing Settings (terms, payment methods)
- ✅ Scheduling Settings (buffers, intervals)
- ✅ Quote Settings (deposit requirements)

**To Hide for Beta:**
- ❌ Integrations tab (QuickBooks, Zapier, etc.)
- ❌ Advanced permissions
- ❌ API keys management

**Action:** Verify all core settings tabs load and save correctly

---

### **5. CUSTOMERS COMPLETENESS** ⚠️
**Status:** Appears complete but needs testing
**Required Features:**
- ✅ Add/edit customer
- ✅ Customer addresses
- ✅ Contact info (phone, email)
- ⚠️ Customer portal invites (needs testing)

**Potential Issues:**
- Customer portal invite functionality (line in Customers.js references `handleInviteToPortal`)
- Need to verify customer creation → quote creation flow works end-to-end

**Action:** Test full customer CRUD + quote creation flow

---

### **6. RLS (ROW LEVEL SECURITY)** ❌ CRITICAL
**Status:** DISABLED per user's memory ("Disable RLS for now due to ownership issues")
**Impact:** CRITICAL SECURITY RISK - All data is accessible to anyone with API keys
**Current State:**
- Supabase anon key is exposed in frontend code
- No RLS policies = any user can read/write any company's data
- Public quote.html uses anon key with no RLS protection

**Beta Risk:**
- Beta testers could accidentally (or maliciously) access each other's data
- Customer data, quotes, invoices are all exposed
- Not production-ready

**Options:**
1. **Enable basic RLS before beta** (RECOMMENDED)
   - Add simple `company_id` policies to all tables
   - Test with multiple companies
   - Estimated time: 4-6 hours

2. **Single-tenant beta only** (WORKAROUND)
   - Only invite ONE company to beta
   - No risk of data leakage between companies
   - Faster to launch, but limits testing

3. **Delay beta until RLS is fixed** (SAFEST)
   - Implement proper RLS policies
   - Test thoroughly
   - Launch with confidence

**Recommendation:** Option 1 - Enable basic RLS with company_id policies before beta

---

### **7. PAYMENT PROCESSING** ⚠️
**Status:** Manual payment recording only
**Missing:** Stripe integration for online payments
**Impact:** Medium - Contractors can still record cash/check/card payments manually
**Action:** Acceptable for beta - add Stripe post-beta

---

### **8. EMAIL/SMS SENDING** ⚠️
**Status:** Unknown - need to verify
**Required for Beta:**
- Send quote to customer (email/SMS)
- Send invoice to customer (email/PDF)

**Files to Check:**
- `SendQuoteModal.js` - Does it actually send emails?
- Resend API integration (mentioned in memories)

**Action:** Test quote sending and invoice sending end-to-end

---

## 🔧 PRIORITY FIX LIST (BEFORE BETA)

### **P0 - MUST FIX (Beta Blockers):**
1. ✅ **Fix quote.html JavaScript error** (formatSlotDateTime undefined) - FIXED
2. ❌ **Enable basic RLS policies** (company_id on all tables) OR limit to single-tenant beta
3. ⚠️ **Test quote sending** (email/SMS) - verify it actually works
4. ⚠️ **Test invoice sending** (email/PDF) - verify it actually works
5. ⚠️ **Test quote approval end-to-end** - verify RPC creates schedule events

### **P1 - SHOULD FIX (Quality Issues):**
5. ⚠️ Hide "Coming Soon" buttons in Quotes (follow-ups, versioning)
6. ⚠️ Hide "Coming Soon" buttons in Invoices (payment reminders)
7. ⚠️ Hide incomplete Inventory tabs (Scanning, Cycle Counts)
8. ⚠️ Test full customer → quote → job → invoice → payment flow

### **P2 - NICE TO FIX (Polish):**
9. ⚠️ Add better error handling to quote.html
10. ⚠️ Add loading states to all forms
11. ⚠️ Test with multiple companies (if RLS is enabled)

---

## 📋 TESTING CHECKLIST (BEFORE BETA)

### **End-to-End Pipeline Test:**
- [ ] Create new customer
- [ ] Create quote for customer with line items
- [ ] Calculate totals correctly (subtotal, tax, total)
- [ ] Send quote to customer (email/SMS/link)
- [ ] Customer receives quote link
- [ ] Customer opens quote.html
- [ ] Customer approves quote (NO ERRORS)
- [ ] Customer selects schedule time (if enabled)
- [ ] Quote converts to job automatically
- [ ] Job appears in Jobs page as "Approved" or "Scheduled"
- [ ] Schedule job on calendar (assign technician, set date/time)
- [ ] Mark job as "In Progress"
- [ ] Mark job as "Completed"
- [ ] Create invoice from completed job
- [ ] Invoice line items match job line items
- [ ] Send invoice to customer
- [ ] Record payment (cash/check/card)
- [ ] Invoice status updates to "Paid"
- [ ] Job status updates to "Closed" or "Invoiced"

### **Settings Test:**
- [ ] Company info saves correctly
- [ ] Tax rate applies to quotes/invoices
- [ ] Business hours apply to scheduling
- [ ] Invoice terms appear on invoices
- [ ] Logo appears on quotes/invoices (if uploaded)

### **Multi-User Test (if RLS enabled):**
- [ ] Create 2 test companies
- [ ] User A cannot see User B's customers
- [ ] User A cannot see User B's quotes
- [ ] User A cannot see User B's jobs
- [ ] User A cannot see User B's invoices

---

## 🎯 REVISED BETA ROLLOUT PLAN

### **Phase 0: Fix Critical Issues (1-2 days)**
1. Fix quote.html JavaScript error
2. Test quote sending (email/SMS)
3. Test invoice sending (email/PDF)
4. Decision: Enable RLS OR single-tenant beta only

### **Phase 1: Hide Incomplete Features (2-4 hours)**
1. Hide "Coming Soon" buttons in Quotes
2. Hide "Coming Soon" buttons in Invoices
3. Hide incomplete Inventory tabs
4. Add `beta_mode` flag to companies table
5. Update navigation to hide non-beta features

### **Phase 2: End-to-End Testing (1 day)**
1. Run full pipeline test (customer → quote → job → invoice → payment)
2. Test with 2 companies (if RLS enabled)
3. Fix any bugs found

### **Phase 3: Beta Launch (1 day)**
1. Deploy to production
2. Invite 1-3 beta testers
3. Monitor for errors
4. Collect feedback

### **Phase 4: Iterate (ongoing)**
1. Fix bugs reported by beta testers
2. Gradually enable deferred features
3. Add Stripe payment processing
4. Improve UX based on feedback

---

## 🚨 RECOMMENDATION

**DO NOT launch beta until:**
1. ✅ Quote acceptance works (fix JavaScript error)
2. ✅ RLS is enabled OR beta is limited to single company
3. ✅ Quote/invoice sending is tested and working
4. ✅ Full pipeline test passes (customer → paid)

**Estimated time to beta-ready:** 2-4 days of focused work

**Alternative:** Launch "alpha" with single trusted company first, then expand to beta with multiple companies once RLS is solid.

