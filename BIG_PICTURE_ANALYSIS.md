# 🔍 BIG PICTURE ANALYSIS - TradeMate Pro Database Architecture

## ✅ CURRENT DATABASE STATE (VERIFIED)

### **GOOD NEWS: Database Already Follows Industry Standard!**

The Supabase database **ALREADY HAS** the correct structure:

```
✅ auth.users (Supabase managed) → Authentication only
✅ users → Core identity + access control (role, status, company_id)
✅ employees → Employment data (0 records currently)
✅ profiles → UI preferences only (slim table)
✅ employee_timesheets → Time tracking
✅ payroll_runs → Payroll processing
✅ payroll_line_items → Payroll details
✅ rate_cards → Pricing
```

---

## 🏗️ INDUSTRY STANDARD PATTERN (What Competitors Do)

### **Jobber / ServiceTitan / Housecall Pro Approach:**

```
auth.users (Supabase)
    ↓
users (Core Identity + Access)
    ├─→ employees (Employment Data)
    ├─→ profiles (UI Preferences)
    ├─→ employee_timesheets (Time Tracking)
    ├─→ payroll_runs (Payroll)
    └─→ permissions (Access Control)
```

### **Key Principle:**
- **Every person who logs in = a user** (auth + permissions)
- **Every worker = an employee** (for payroll, scheduling, time tracking)
- **All employees are users, but not all users are employees** (customers with portal logins are users too)

---

## 📊 ACTUAL TABLE STRUCTURE (Verified from Database)

### **1. auth.users (Supabase Managed - Don't Touch)**
```sql
- id (UUID)
- email
- password (hashed)
- email_confirmed_at
```

### **2. users (Core Identity + Access Control)**
```sql
- id (UUID PK)
- auth_user_id (FK → auth.users.id)
- company_id (FK → companies.id)
- role (user_role_enum: owner, admin, manager, dispatcher, supervisor, 
        lead_technician, technician, apprentice, helper, accountant, 
        sales_rep, customer_service, customer_portal)
- status (employee_status_enum: active, inactive, pending_invite, suspended)
- first_name
- last_name
- email
- phone
- created_at
- updated_at
- login_count
```

**Purpose:** Authentication, authorization, basic identity
**Used by:** Login, permissions, access control, user management

### **3. employees (Employment Data - SEPARATE TABLE)**
```sql
- id (UUID PK)
- company_id (FK → companies.id)
- user_id (FK → users.id, NOT NULL)
- employee_number
- hire_date
- termination_date
- position
- department
- pay_type (hourly/salary)
- hourly_rate
- salary
- overtime_rate
- status (active, inactive, on_leave, terminated)
- emergency_contact_name
- emergency_contact_phone
- notes
- created_at
- updated_at
```

**Purpose:** HR, payroll, scheduling, employment records
**Used by:** Payroll, timesheets, scheduling, HR management
**Current Records:** 0 (empty table)

### **4. profiles (UI Preferences ONLY - Slim Table)**
```sql
- id (UUID PK)
- user_id (FK → users.id)
- avatar_url
- preferences (jsonb)
- created_at
- updated_at
```

**Purpose:** UI customization, user preferences
**Used by:** Theme, avatar, notification settings, UI state

### **5. employee_timesheets (Time Tracking)**
```sql
- id (UUID PK)
- employee_id (FK → employees.id)  ← References employees, NOT users!
- company_id
- work_order_id
- clock_in
- clock_out
- break_duration
- total_hours
- status (pending, approved, rejected)
- approved_by (FK → users.id)
- notes
```

**Purpose:** Time tracking, labor costs
**Used by:** Payroll, job costing, scheduling

### **6. payroll_runs (Payroll Processing)**
```sql
- id (UUID PK)
- company_id
- pay_period_start
- pay_period_end
- status (draft, processing, completed, paid)
- total_amount
- processed_by (FK → users.id)
- processed_at
```

**Purpose:** Payroll batch processing
**Used by:** Payroll management

### **7. payroll_line_items (Payroll Details)**
```sql
- id (UUID PK)
- payroll_run_id (FK → payroll_runs.id)
- employee_id (FK → employees.id)  ← References employees, NOT users!
- regular_hours
- overtime_hours
- regular_pay
- overtime_pay
- deductions
- net_pay
```

**Purpose:** Individual employee payroll details
**Used by:** Payroll calculations, pay stubs

---

## 🚨 THE PROBLEM WE NEED TO FIX

### **Current Issue:**
The **frontend code** is querying the WRONG tables:

```javascript
// ❌ WRONG (Current Code)
const { data } = await supabase
  .from('profiles')  // ← Wrong! profiles doesn't have employee data
  .select('first_name, last_name, email, phone, hire_date')
  .eq('company_id', user.company_id);
```

```javascript
// ✅ CORRECT (What We Need)
const { data } = await supabase
  .from('users')  // ← Core identity
  .select(`
    id, first_name, last_name, email, phone, role, status,
    employees (
      employee_number, hire_date, position, hourly_rate
    ),
    profiles (
      avatar_url, preferences
    )
  `)
  .eq('company_id', user.company_id);
```

---

## 🎯 WHAT NEEDS TO BE FIXED

### **1. Employees Page (src/pages/Employees.js)**
- ❌ Currently queries `profiles` table
- ✅ Should query `users` table with optional `employees` join
- ✅ Should create `employees` record when inviting staff (not just users)

### **2. Invite Employee Flow**
- ❌ Currently creates: auth.users → users → profiles
- ✅ Should create: auth.users → users → profiles + employees

### **3. Payroll Page (src/pages/Payroll.js)**
- ❌ Currently queries `users` or `profiles`
- ✅ Should query `employees` table (payroll is for employees only!)

### **4. Timesheets**
- ❌ May be querying `users`
- ✅ Should query `employee_timesheets` with `employees` join

### **5. Scheduling**
- ❌ May be querying `users`
- ✅ Should query `employees` for field workers

---

## 📋 IMPLEMENTATION PLAN

### **Phase 1: Fix Employees Page**
1. Update `loadEmployees()` to query `users` with `employees` join
2. Update `handleInvite()` to create both `users` AND `employees` records
3. Add employee-specific fields (employee_number, hire_date, position, pay_type, hourly_rate)

### **Phase 2: Fix Payroll**
1. Update payroll queries to use `employees` table
2. Ensure payroll_line_items references `employees.id`
3. Add employee creation for existing users who don't have employee records

### **Phase 3: Fix Timesheets**
1. Ensure employee_timesheets references `employees.id`
2. Update timesheet queries to join employees → users for names

### **Phase 4: Fix Scheduling**
1. Update scheduling to use `employees` table for field workers
2. Add employee filters (only show active employees)

---

## 🔑 KEY DECISIONS

### **Q: When do we create an employees record?**
**A:** When inviting/creating a **staff member** (not customers with portal access)

### **Q: What's the difference between users and employees?**
**A:**
- **users** = Anyone who logs in (staff + customers with portal access)
- **employees** = Staff who work for the company (payroll, scheduling, timesheets)

### **Q: Can a user exist without an employee record?**
**A:** YES! Customers with portal access are users but NOT employees.

### **Q: Can an employee exist without a user record?**
**A:** NO! In TradeMate Pro, all employees must log in, so they must have a user record.

---

## ✅ NEXT STEPS

1. **Map all pages** that query user/employee data
2. **Update each page** to use correct table structure
3. **Test invite flow** to ensure employees record is created
4. **Migrate existing data** if needed (create employees records for existing staff)
5. **Update all queries** to use proper joins

---

## 📝 NOTES

- The database structure is ALREADY CORRECT
- The problem is the FRONTEND CODE is querying the wrong tables
- We need to update the code to match the database structure
- This follows industry standard (Jobber, ServiceTitan, Housecall Pro)

