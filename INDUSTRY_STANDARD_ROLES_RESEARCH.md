# 🔍 INDUSTRY STANDARD ROLES RESEARCH

**Date:** 2025-10-01  
**Purpose:** Research actual competitor role structures to standardize TradeMate Pro  
**Sources:** ServiceTitan, Housecall Pro, Jobber documentation

---

## 📊 COMPETITOR ROLE STRUCTURES

### **Housecall Pro (Verified from Help Docs)**

**3 Main Role Categories:**

1. **Admin/Owner**
   - Full account access
   - Add/delete employees
   - See all reporting
   - View all jobs and schedules
   - Edit company information
   - **Recommendation:** Limit to owner(s) or main admin only

2. **Office Staff**
   - View/edit employee pay details (optional permission)
   - Update company account info
   - Access Marketing Center campaigns
   - Access reporting
   - Dispatch/Messaging POC
   - Chat with customers
   - See job costing margins
   - Access Pipeline
   - Online booking availability

3. **Field Tech** (Mobile app only)
   - Add/edit jobs
   - Delete/cancel jobs
   - Take payments & see prices
   - Mobile check deposit
   - See customer phone/email
   - Chat with customers
   - See & edit customer database
   - Update company account info (default: OFF)
   - Online booking availability
   - Show techs next job OR full schedule
   - Edit message on invoice
   - Show home data
   - See job costing margins

---

### **ServiceTitan (Verified from Help Docs)**

**Default Role Templates:**

1. **Admins** - Full permissions
2. **Dispatchers** - Scheduling, job booking, dispatching
3. **Accounting** - Financial management, payroll
4. **Field Managers** - Team oversight, field operations
5. **Technicians** - Field work, job execution
6. **Sales Managers** - Lead generation, sales
7. **CSRs (Customer Service Reps)** - Customer communication
8. **General Office** - Basic office tasks

**Permission Categories:**
- General
- Accounting
- Customer Communications
- Job Booking & Dispatching
- Lead Generation
- Payroll & Admin
- Pricebook

---

### **Jobber (From Research)**

**Role-Based Access Controls:**
- Office staff vs field technicians
- Separate permissions for different functions
- Mobile capabilities for field teams
- Built-in quality controls

---

## 🎯 INDUSTRY STANDARD PATTERN

### **Core Insight:**

**ALL competitors use 3-tier structure:**

**Tier 1: Admin/Owner**
- Full access
- Billing/financial
- Company settings
- Employee management

**Tier 2: Office/Dispatcher/Manager**
- Operational access
- Scheduling/dispatching
- Customer management
- Reporting (limited)
- NO billing/financial

**Tier 3: Field Tech/Technician**
- Mobile-only (Housecall Pro)
- Job execution
- Customer interaction
- Payment collection
- Limited visibility

---

## ✅ TRADEMATE PRO SHOULD USE

### **Recommended Role Structure:**

**1. Owner**
- Full system access
- Billing & financial
- Company settings
- Employee management
- All reports

**2. Admin**
- Full operational access
- NO billing/financial
- Employee management
- All reports
- Company settings (limited)

**3. Manager**
- Team oversight
- Scheduling/dispatching
- Customer management
- Reports (limited)
- NO employee pay details

**4. Dispatcher**
- Scheduling/dispatching
- Customer communication
- Job assignment
- NO financial access

**5. Supervisor**
- Team oversight
- Field operations
- Job approval
- Limited reporting

**6. Lead Technician**
- Senior field worker
- Mentor other techs
- Complex jobs
- Quality control

**7. Technician** (Default field employee)
- Field work
- Job execution
- Customer interaction
- Payment collection

**8. Apprentice**
- Learning role
- Supervised work
- Limited permissions

**9. Helper**
- Assistant role
- Basic tasks
- Very limited permissions

**10. Accountant**
- Financial management
- Payroll
- Reporting
- NO operational access

**11. Sales Rep**
- Lead generation
- Quotes/estimates
- Customer acquisition
- NO job execution

**12. Customer Service**
- Customer communication
- Scheduling
- Basic support
- NO financial access

---

## 🔧 CURRENT TRADEMATE PRO ISSUES

### **Problem 1: Only 3 Roles in UI**

**Current UI shows:**
- Owner
- Admin
- Employee

**Database has:**
- owner
- admin
- manager
- dispatcher
- supervisor
- lead_technician
- technician
- apprentice
- helper
- accountant
- sales_rep
- customer_service
- customer_portal

**Issue:** UI doesn't match database enum!

---

### **Problem 2: Duplicate Tables**

**Current structure:**
- `auth.users` - Authentication
- `users` - Business user (company_id, role, status)
- `profiles` - Personal info (BUT also has role, status, hire_date - duplicates!)
- `employees` - Employment data (hire_date, rates, certifications)

**Issues:**
- `profiles` has duplicate columns from `users` and `employees`
- Unclear which table is source of truth
- Data can get out of sync

---

## ✅ RECOMMENDED FIXES

### **Fix 1: Update UI to Show All Roles**

**Replace simple dropdown with categorized roles:**

```javascript
<select name="role">
  <optgroup label="Management">
    <option value="owner">Owner</option>
    <option value="admin">Administrator</option>
    <option value="manager">Manager</option>
    <option value="supervisor">Supervisor</option>
    <option value="dispatcher">Dispatcher</option>
  </optgroup>
  
  <optgroup label="Field Workers">
    <option value="lead_technician">Lead Technician</option>
    <option value="technician">Technician</option>
    <option value="apprentice">Apprentice</option>
    <option value="helper">Helper</option>
  </optgroup>
  
  <optgroup label="Office Staff">
    <option value="accountant">Accountant</option>
    <option value="sales_rep">Sales Representative</option>
    <option value="customer_service">Customer Service</option>
  </optgroup>
</select>
```

---

### **Fix 2: Clean Up Table Structure**

**Option A: Remove Duplicates from profiles**

```sql
-- Remove duplicate columns from profiles
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS role,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS hire_date,
  DROP COLUMN IF EXISTS company_id,
  DROP COLUMN IF EXISTS emergency_contact_name,
  DROP COLUMN IF EXISTS emergency_contact_phone;
```

**Then:**
- `users` = Source of truth for role, status, company_id
- `profiles` = Source of truth for personal info only
- `employees` = Source of truth for employment data

**Option B: Keep Duplicates, Document Purpose**

- `users.role` = Permission role (what they can do)
- `profiles.role` = Display role (what they're called)
- `users.status` = Account status (active/inactive)
- `profiles.status` = Profile status (different?)

---

### **Fix 3: Standardize Data Flow**

**Signup Flow:**
1. Create `auth.users` (Supabase)
2. Create `users` (company_id, role='owner', status='active')
3. Create `profiles` (name, email, phone)
4. Create `employees` (OPTIONAL - only if they want payroll tracking)

**Invite Flow:**
1. Create `auth.users` (Supabase with email_confirm: false)
2. Create `users` (company_id, role='technician', status='pending_invite')
3. Create `profiles` (name, email, phone)
4. Create `employees` (OPTIONAL - only if they need payroll/HR tracking)

**When to create employees record:**
- ✅ W2 employees who need payroll tracking
- ✅ Employees who need HR data (certifications, skills)
- ✅ Employees who need employee_number
- ❌ Customer portal users
- ❌ External contractors (unless they want tracking)

---

## 📋 MIGRATION PLAN

### **Phase 1: Update UI (Non-Breaking)**

1. Update EmployeeInviteModal.js to show all roles
2. Update Employees.js "Add Employee" form to show all roles
3. Update role filter dropdown to show all roles
4. Update role display functions to handle all roles
5. Test invite/create flows with all roles

### **Phase 2: Clean Up profiles Table (Breaking Change)**

**Option A: Remove duplicates**
1. Audit which columns are actually used
2. Migrate data if needed
3. Drop duplicate columns
4. Update all queries to use correct tables
5. Test thoroughly

**Option B: Document duplicates**
1. Document purpose of each duplicate column
2. Update code to use correct source of truth
3. Add comments explaining why duplicates exist

### **Phase 3: Standardize employees Table Usage**

1. Document when to create employees record
2. Update signup flow to optionally create employees
3. Update invite flow to optionally create employees
4. Add UI toggle: "Track payroll for this employee?"

---

## 🎯 IMMEDIATE ACTION ITEMS

### **Priority 1: Fix UI to Match Database** ✅ DO THIS NOW

**Files to update:**
1. `src/components/EmployeeInviteModal.js` - ✅ Already has correct roles!
2. `src/pages/Employees.js` - Add Employee form (needs all roles)
3. `src/utils/roleUtils.js` - Add display names for all roles
4. Role filter dropdowns - Show all roles

### **Priority 2: Decide on profiles Table** ⚠️ NEEDS DECISION

**Question:** Remove duplicates or document them?

**Recommendation:** Remove duplicates (Option A) because:
- Cleaner data model
- No sync issues
- Easier to maintain
- Matches industry standard

### **Priority 3: Document employees Table Usage** ⚠️ NEEDS DECISION

**Question:** When should we create employees record?

**Recommendation:** Make it optional with UI toggle:
- "Track payroll/HR data for this employee?"
- If YES: Create employees record
- If NO: Just create users + profiles

---

## ✅ SUMMARY

### **What Competitors Do:**

**Housecall Pro:**
- 3 main roles: Admin/Owner, Office Staff, Field Tech
- Field Tech is mobile-only
- Granular permissions within each role

**ServiceTitan:**
- 8+ default role templates
- Highly customizable permissions
- Separate roles for different functions

**Jobber:**
- Role-based access controls
- Office vs field separation
- Mobile capabilities for field teams

### **What TradeMate Pro Should Do:**

1. ✅ **Show all 13 roles in UI** (not just 3)
2. ✅ **Clean up profiles table** (remove duplicates)
3. ✅ **Make employees table optional** (with UI toggle)
4. ✅ **Document clear data flow** (which table for what)
5. ✅ **Test all flows thoroughly** (signup, invite, edit)

### **Next Steps:**

1. Update UI to show all roles (non-breaking)
2. Get user approval on profiles table cleanup
3. Get user approval on employees table usage
4. Implement changes
5. Test thoroughly
6. Document everything

---

**Ready to implement?** Let me know which approach you want for profiles table and employees table!

