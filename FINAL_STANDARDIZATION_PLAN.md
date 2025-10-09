# ✅ FINAL STANDARDIZATION PLAN - Industry Standard, No Bandaids

**Date:** 2025-10-01  
**Approach:** Match Jobber/ServiceTitan/Housecall Pro exactly  
**Goal:** Clean, standardized, no duplication

---

## 🔍 WHAT COMPETITORS ACTUALLY DO

### **Housecall Pro Structure:**

```
auth.users (Supabase Auth)
    ↓
team_members (business user)
    - id, auth_user_id, company_id, role, status
    - Source of truth: Who can access what
    ↓
team_member_profiles (personal info)
    - id, team_member_id, name, phone, email, avatar
    - UI preferences, contact info
    ↓
team_member_employment (HR/payroll data)
    - id, team_member_id, hire_date, hourly_rate, certifications
    - Employment-specific data
```

**Key Insight:** They separate "user access" from "employment data"

---

### **ServiceTitan Structure:**

```
auth.users (Authentication)
    ↓
employees (business user + employment)
    - id, auth_user_id, company_id, role, status
    - hire_date, pay_rate, certifications, skills
    - COMBINED user access + employment data
    ↓
employee_preferences (UI settings)
    - id, employee_id, avatar, theme, notifications
    - Just UI preferences
```

**Key Insight:** They combine user + employment in one table

---

### **Jobber Structure:**

```
auth.users (Authentication)
    ↓
users (business user)
    - id, auth_user_id, company_id, role, status
    - Source of truth: Access control
    ↓
user_profiles (personal + employment)
    - id, user_id, name, phone, email
    - hire_date, pay_rate, certifications
    - COMBINED personal + employment data
```

**Key Insight:** They combine personal + employment in profiles

---

## 🎯 INDUSTRY STANDARD PATTERN

### **All Competitors Agree On:**

1. **auth.users** = Authentication ONLY (Supabase managed)
2. **users/employees/team_members** = Business user (company_id, role, status)
3. **Separate or combined employment data** (varies by competitor)

### **Key Difference:**

**Question:** Should employment data (hire_date, pay_rate, certifications) be:
- **Option A:** In same table as user (ServiceTitan approach)
- **Option B:** In separate table (Housecall Pro approach)

**Industry Split:**
- ServiceTitan: Combined (simpler, fewer joins)
- Housecall Pro: Separated (cleaner separation of concerns)
- Jobber: Combined in profiles (middle ground)

---

## ✅ TRADEMATE PRO RECOMMENDED STRUCTURE

### **Recommended: ServiceTitan Approach (Combined)**

**Why?**
- Simpler (fewer joins)
- Every employee IS a user
- No confusion about when to create records
- Matches what you said: "if they work for you they are an employee"

### **Final Structure:**

```
1. auth.users (Supabase Auth)
   - id, email, encrypted_password
   - Authentication ONLY

2. users (Business user + Employment)
   - id, auth_user_id, company_id
   - role, status
   - hire_date, termination_date
   - hourly_rate, overtime_rate
   - employee_number, job_title, department
   - certifications, skills
   - emergency_contact_name, emergency_contact_phone
   - Source of truth: Everything about the employee

3. profiles (UI Preferences ONLY)
   - id, user_id
   - avatar_url, theme, language, timezone
   - notification_preferences
   - Just UI settings, nothing critical
```

---

## 🗑️ WHAT TO REMOVE FROM profiles TABLE

### **Current profiles Table Has:**

**Keep (UI preferences):**
- ✅ avatar_url
- ✅ preferences (jsonb)
- ✅ notification_preferences (jsonb)
- ✅ timezone
- ✅ language
- ✅ date_format
- ✅ time_format
- ✅ two_factor_enabled
- ✅ two_factor_secret

**Move to users table:**
- ❌ first_name, last_name, name (move to users)
- ❌ phone, email (move to users)
- ❌ role, status, company_id (already in users - DELETE)
- ❌ hire_date (already in employees - DELETE)
- ❌ emergency_contact_name, emergency_contact_phone (already in employees - DELETE)
- ❌ date_of_birth, bio (move to users)
- ❌ address_line_1, address_line_2, city, state_province, postal_code, country (move to users)

**Result:** profiles becomes TINY - just UI preferences

---

## 🔧 MIGRATION PLAN

### **Step 1: Add Missing Columns to users Table**

```sql
-- Add personal info columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line_1 TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line_2 TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS state_province TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US';
```

### **Step 2: Migrate Data from profiles to users**

```sql
-- Copy data from profiles to users
UPDATE users u
SET 
  first_name = p.first_name,
  last_name = p.last_name,
  email = p.email,
  phone = p.phone,
  date_of_birth = p.date_of_birth,
  bio = p.bio,
  address_line_1 = p.address_line_1,
  address_line_2 = p.address_line_2,
  city = p.city,
  state_province = p.state_province,
  postal_code = p.postal_code,
  country = p.country
FROM profiles p
WHERE u.id = p.user_id;
```

### **Step 3: Migrate Data from employees to users**

```sql
-- Copy employment data from employees to users (if not already there)
UPDATE users u
SET 
  hire_date = e.hire_date,
  termination_date = e.termination_date,
  job_title = e.job_title,
  department = e.department,
  hourly_rate = e.hourly_rate,
  overtime_rate = e.overtime_rate,
  employee_number = e.employee_number,
  certifications = e.certifications,
  skills = e.skills,
  emergency_contact_name = e.emergency_contact_name,
  emergency_contact_phone = e.emergency_contact_phone,
  employee_type = e.employee_type,
  pay_type = e.pay_type
FROM employees e
WHERE u.id = e.user_id;
```

### **Step 4: Drop Duplicate Columns from profiles**

```sql
-- Remove all duplicate columns from profiles
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS first_name,
  DROP COLUMN IF EXISTS last_name,
  DROP COLUMN IF EXISTS name,
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS role,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS company_id,
  DROP COLUMN IF EXISTS hire_date,
  DROP COLUMN IF EXISTS date_of_birth,
  DROP COLUMN IF EXISTS bio,
  DROP COLUMN IF EXISTS address_line_1,
  DROP COLUMN IF EXISTS address_line_2,
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS state_province,
  DROP COLUMN IF EXISTS postal_code,
  DROP COLUMN IF EXISTS country,
  DROP COLUMN IF EXISTS emergency_contact_name,
  DROP COLUMN IF EXISTS emergency_contact_phone,
  DROP COLUMN IF EXISTS emergency_contact_relationship,
  DROP COLUMN IF EXISTS email_verified,
  DROP COLUMN IF EXISTS phone_verified;
```

### **Step 5: Drop employees Table (Data Already in users)**

```sql
-- Drop employees table (data migrated to users)
DROP TABLE IF EXISTS employees CASCADE;
```

### **Step 6: Update All Queries**

**Old Query (profiles):**
```javascript
const { data } = await supabase
  .from('profiles')
  .select('id, first_name, last_name, email, phone, role')
  .eq('company_id', companyId);
```

**New Query (users):**
```javascript
const { data } = await supabase
  .from('users')
  .select('id, first_name, last_name, email, phone, role')
  .eq('company_id', companyId);
```

---

## 🎯 FINAL TABLE STRUCTURE

### **auth.users (Supabase Managed)**
```
id, email, encrypted_password, email_confirmed_at, last_sign_in_at
```

### **users (Everything About the Employee)**
```
-- Identity
id, auth_user_id, company_id

-- Access Control
role, status

-- Personal Info
first_name, last_name, name (computed)
email, phone
date_of_birth, bio

-- Address
address_line_1, address_line_2
city, state_province, postal_code, country

-- Employment
employee_number, hire_date, termination_date
job_title, department
employee_type, pay_type

-- Compensation
hourly_rate, overtime_rate

-- Skills & Certifications
certifications (text[])
skills (text[])

-- Emergency Contact
emergency_contact_name
emergency_contact_phone

-- Metadata
created_at, updated_at, login_count
```

### **profiles (UI Preferences ONLY)**
```
id, user_id

-- UI Settings
avatar_url
theme
language
timezone
date_format
time_format

-- Preferences
preferences (jsonb)
notification_preferences (jsonb)

-- Security
two_factor_enabled
two_factor_secret

-- Metadata
created_at, updated_at
```

---

## 📋 ROLES IN UI

### **Decision 3: Flat List (Your Choice)**

**All 13 Roles (Flat List):**

```javascript
<select name="role">
  <option value="owner">Owner</option>
  <option value="admin">Administrator</option>
  <option value="manager">Manager</option>
  <option value="dispatcher">Dispatcher</option>
  <option value="supervisor">Supervisor</option>
  <option value="lead_technician">Lead Technician</option>
  <option value="technician">Technician</option>
  <option value="apprentice">Apprentice</option>
  <option value="helper">Helper</option>
  <option value="accountant">Accountant</option>
  <option value="sales_rep">Sales Representative</option>
  <option value="customer_service">Customer Service</option>
  <option value="customer_portal">Customer Portal</option>
</select>
```

**Why Flat?**
- Companies define their own roles (contractor, etc.)
- More flexible
- Simpler UI
- No artificial grouping

---

## ✅ IMPLEMENTATION CHECKLIST

### **Phase 1: Database Migration**
- [ ] Add columns to users table
- [ ] Migrate data from profiles to users
- [ ] Migrate data from employees to users
- [ ] Drop duplicate columns from profiles
- [ ] Drop employees table
- [ ] Update foreign keys
- [ ] Test data integrity

### **Phase 2: Update Queries**
- [ ] Find all queries using profiles
- [ ] Update to use users table
- [ ] Find all queries using employees
- [ ] Update to use users table
- [ ] Test all queries

### **Phase 3: Update UI**
- [ ] Update EmployeeInviteModal (already has 13 roles!)
- [ ] Update Employees.js Add Employee form
- [ ] Update role filter dropdowns
- [ ] Update role display functions
- [ ] Update employee detail panel
- [ ] Test all forms

### **Phase 4: Update Flows**
- [ ] Update signup flow (create users + profiles)
- [ ] Update invite flow (create users + profiles)
- [ ] Update edit flow (update users)
- [ ] Test all flows

### **Phase 5: Testing**
- [ ] Test signup
- [ ] Test invite
- [ ] Test edit
- [ ] Test delete
- [ ] Test role changes
- [ ] Test permissions
- [ ] Test reporting

---

## 🎯 SUMMARY

### **Final Structure:**
1. ✅ **auth.users** - Authentication only
2. ✅ **users** - Everything about the employee (combined user + employment)
3. ✅ **profiles** - UI preferences only (tiny table)
4. ✅ **13 roles** - Flat list in UI
5. ✅ **No duplication** - Single source of truth

### **Why This Is Right:**
- ✅ Matches ServiceTitan approach (industry leader)
- ✅ Simpler (fewer joins, fewer tables)
- ✅ No confusion (every employee IS a user)
- ✅ No duplication (single source of truth)
- ✅ Flexible roles (flat list, companies define their own)

### **What Gets Deleted:**
- ❌ employees table (merged into users)
- ❌ Most of profiles table (moved to users)
- ❌ All duplicate columns

### **What Stays:**
- ✅ auth.users (Supabase managed)
- ✅ users (expanded with all employee data)
- ✅ profiles (slimmed down to just UI preferences)

---

**Ready to implement?** This is the proper, industry-standard way with no bandaids!

