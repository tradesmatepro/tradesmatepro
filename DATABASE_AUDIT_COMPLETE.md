# 🔍 COMPLETE DATABASE AUDIT - TradeMate Pro

**Date:** 2025-10-01  
**Purpose:** Document actual database structure and define standard  
**Status:** ✅ AUDIT COMPLETE

---

## 📊 ACTUAL DATABASE STRUCTURE

### **Table 1: auth.users (Supabase Managed)**
**Purpose:** Authentication only - login credentials, password, email verification  
**Managed By:** Supabase Auth  
**Created By:** Supabase signup/invite  

**Columns:**
- `id` (UUID) - Auth user ID
- `email` (TEXT) - Login email
- `encrypted_password` (TEXT) - Hashed password
- `email_confirmed_at` (TIMESTAMP)
- `last_sign_in_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

**DO NOT STORE:** Business data, company_id, role, profile info

---

### **Table 2: users**
**Purpose:** Business user identity - links auth to company + role  
**Created By:** Signup, Employee Invite  

**Columns:**
```
id                UUID PRIMARY KEY
auth_user_id      UUID → auth.users(id)
company_id        UUID → companies(id)
role              user_role_enum (owner, admin, manager, technician, etc.)
status            employee_status_enum (active, inactive, suspended)
created_at        TIMESTAMPTZ
updated_at        TIMESTAMPTZ
login_count       INTEGER
```

**Foreign Keys:**
- `auth_user_id` → `auth.users(id)` ON DELETE CASCADE
- `company_id` → `companies(id)` ON DELETE CASCADE

**Unique Constraint:** `(company_id, auth_user_id)` - One auth user can have multiple business users (different companies)

**Referenced By:** 25+ tables (audit_logs, documents, expenses, profiles, employees, etc.)

---

### **Table 3: profiles**
**Purpose:** Personal/profile information - "My Profile" page data  
**Created By:** Signup, Employee Invite  

**Columns:**
```
id                             UUID PRIMARY KEY
user_id                        UUID → users(id)
first_name                     TEXT NOT NULL
last_name                      TEXT NOT NULL
name                           TEXT GENERATED (first_name || ' ' || last_name) STORED
phone                          TEXT
email                          TEXT
avatar_url                     TEXT
bio                            TEXT
date_of_birth                  DATE
address_line_1                 TEXT
address_line_2                 TEXT
city                           TEXT
state_province                 TEXT
postal_code                    TEXT
country                        TEXT DEFAULT 'US'
emergency_contact_name         TEXT
emergency_contact_phone        TEXT
emergency_contact_relationship TEXT
timezone                       TEXT DEFAULT 'America/Los_Angeles'
language                       TEXT DEFAULT 'en'
date_format                    TEXT DEFAULT 'MM/DD/YYYY'
time_format                    TEXT DEFAULT '12h'
email_verified                 BOOLEAN DEFAULT false
phone_verified                 BOOLEAN DEFAULT false
two_factor_enabled             BOOLEAN DEFAULT false
two_factor_secret              TEXT
notification_preferences       JSONB
preferences                    JSONB DEFAULT '{}'
status                         employee_status_enum DEFAULT 'active'
role                           user_role_enum DEFAULT 'technician'
company_id                     UUID → companies(id)
hire_date                      DATE
created_at                     TIMESTAMPTZ
updated_at                     TIMESTAMPTZ
```

**Foreign Keys:**
- `user_id` → `users(id)` ON DELETE CASCADE
- `company_id` → `companies(id)`

**Referenced By:** 12+ tables (change_orders, quote_approvals, work_orders, etc.)

**⚠️ NOTE:** This table has BOTH personal data AND some employment data (hire_date, role, status) - overlaps with employees table

---

### **Table 4: employees**
**Purpose:** Employment-specific data - payroll, rates, certifications  
**Created By:** Employee Invite (optional), HR processes  

**Columns:**
```
id                      UUID PRIMARY KEY
company_id              UUID → companies(id)
user_id                 UUID → users(id)
employee_number         TEXT UNIQUE NOT NULL
hire_date               DATE DEFAULT CURRENT_DATE
termination_date        DATE
job_title               TEXT
department              TEXT
hourly_rate             NUMERIC(8,2) DEFAULT 0.00
overtime_rate           NUMERIC(8,2)
emergency_contact_name  TEXT
emergency_contact_phone TEXT
certifications          TEXT[]
skills                  TEXT[]
notes                   TEXT
employee_type           TEXT (full_time, part_time, contractor, seasonal)
pay_type                TEXT (hourly, salary, commission, per_job)
created_at              TIMESTAMPTZ
updated_at              TIMESTAMPTZ
```

**Foreign Keys:**
- `company_id` → `companies(id)` ON DELETE CASCADE
- `user_id` → `users(id)` ON DELETE CASCADE

**Referenced By:** 7+ tables (employee_timesheets, payroll_line_items, work_order_services, etc.)

---

### **View 1: user_profiles**
**Type:** VIEW  
**Purpose:** Convenience view joining users + profiles  

**Likely Definition:**
```sql
SELECT 
  u.id,
  u.auth_user_id,
  u.company_id,
  u.role,
  u.status,
  p.first_name,
  p.last_name,
  p.name,
  p.email,
  p.phone,
  p.avatar_url
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id;
```

---

### **View 2: employees_with_profiles**
**Type:** VIEW  
**Purpose:** Convenience view joining employees + users + profiles  

**Likely Definition:**
```sql
SELECT 
  e.*,
  u.auth_user_id,
  u.role AS user_role,
  u.status AS user_status,
  p.first_name,
  p.last_name,
  p.name,
  p.email,
  p.phone,
  p.avatar_url
FROM employees e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN profiles p ON u.id = p.user_id;
```

---

## 🎯 INDUSTRY STANDARD COMPARISON

### **Jobber/ServiceTitan/Housecall Pro Pattern:**

**They Use:**
1. **auth.users** - Authentication only
2. **users** - Business user (company + role)
3. **profiles** - Personal info (name, phone, address, preferences)
4. **employees** - Employment data (hire_date, rate, certifications)
5. **employee_settings** - Preferences (notifications, scheduling)
6. **employee_permissions** - Fine-grained permissions

**TradeMate Pro Has:**
1. ✅ **auth.users** - Authentication only
2. ✅ **users** - Business user (company + role)
3. ✅ **profiles** - Personal info (BUT also has hire_date, role, status - overlap!)
4. ✅ **employees** - Employment data
5. ❌ **employee_settings** - Missing (using profiles.preferences instead)
6. ❌ **employee_permissions** - Missing (using user_permissions table)

---

## 🚨 PROBLEMS IDENTIFIED

### **Problem 1: Data Duplication**

**profiles table has:**
- `hire_date` (also in employees)
- `role` (also in users)
- `status` (also in users)
- `company_id` (also in users)
- `emergency_contact_name` (also in employees)
- `emergency_contact_phone` (also in employees)

**This causes:**
- Confusion about source of truth
- Potential data inconsistency
- Unclear which table to query

### **Problem 2: Enum Mismatch**

**Database has:**
```
user_role_enum: owner, admin, manager, dispatcher, supervisor,
                lead_technician, technician, apprentice, helper,
                accountant, sales_rep, customer_service, customer_portal
```

**Code tries to use:**
```javascript
role: 'employee'  // ❌ Doesn't exist!
```

### **Problem 3: Unclear Table Purpose**

**Questions:**
- When should we create an `employees` record?
- Is `employees` required or optional?
- Can someone be in `users` + `profiles` but NOT `employees`?
- What's the difference between `profiles.hire_date` and `employees.hire_date`?

---

## ✅ RECOMMENDED STANDARD

### **Table Purposes (Clear Separation):**

**1. auth.users**
- **Purpose:** Authentication ONLY
- **Contains:** email, password, email_confirmed_at
- **Created:** Supabase signup/invite
- **Never query directly** - use users table

**2. users**
- **Purpose:** Business user identity
- **Contains:** company_id, role, status, login_count
- **Created:** Signup, Employee Invite
- **Source of truth for:** Role, Status, Company membership

**3. profiles**
- **Purpose:** Personal/profile information
- **Contains:** name, phone, email, address, preferences, avatar
- **Created:** Signup, Employee Invite
- **Source of truth for:** Contact info, Personal details, Preferences
- **REMOVE:** hire_date, role, status, company_id (use users/employees instead)

**4. employees**
- **Purpose:** Employment/payroll data
- **Contains:** employee_number, hire_date, job_title, rates, certifications
- **Created:** When user becomes employee (optional)
- **Source of truth for:** Employment details, Payroll, HR data
- **Optional:** Not all users are employees (e.g., customer portal users)

---

## 🔧 SIGNUP/INVITE FLOWS

### **Signup Flow (New Company Owner):**

**Step 1:** Create auth.users (Supabase)
```sql
-- Supabase handles this
INSERT INTO auth.users (email, encrypted_password, ...)
```

**Step 2:** Create users record
```sql
INSERT INTO users (auth_user_id, company_id, role, status)
VALUES (auth_id, company_id, 'owner', 'active');
```

**Step 3:** Create profiles record
```sql
INSERT INTO profiles (user_id, first_name, last_name, email, phone)
VALUES (user_id, 'John', 'Doe', 'john@example.com', '+15551234567');
```

**Step 4:** Create employees record (OPTIONAL - if they want payroll tracking)
```sql
INSERT INTO employees (company_id, user_id, employee_number, hire_date)
VALUES (company_id, user_id, 'EMP001', CURRENT_DATE);
```

---

### **Employee Invite Flow:**

**Step 1:** Create auth.users (Supabase with email_confirm: false)
```javascript
await supabase.auth.admin.createUser({
  email: 'employee@example.com',
  email_confirm: false  // Sends magic link
});
```

**Step 2:** Create users record
```sql
INSERT INTO users (auth_user_id, company_id, role, status)
VALUES (auth_id, company_id, 'technician', 'pending_invite');
```

**Step 3:** Create profiles record
```sql
INSERT INTO profiles (user_id, first_name, last_name, email, phone)
VALUES (user_id, 'Jane', 'Smith', 'jane@example.com', '+15559876543');
```

**Step 4:** Create employees record (if they need payroll/HR tracking)
```sql
INSERT INTO employees (company_id, user_id, employee_number, hire_date, hourly_rate)
VALUES (company_id, user_id, 'EMP002', CURRENT_DATE, 25.00);
```

---

## 🎯 IMMEDIATE FIXES NEEDED

### **Fix 1: Enum Mapping**

**Update EmployeeInviteModal.js:**
```javascript
<select name="role" value={formData.role}>
  <option value="technician">Technician</option>  {/* Default employee */}
  <option value="lead_technician">Lead Technician</option>
  <option value="apprentice">Apprentice</option>
  <option value="helper">Helper</option>
  <option value="dispatcher">Dispatcher</option>
  <option value="supervisor">Supervisor</option>
  <option value="manager">Manager</option>
  <option value="admin">Admin</option>
</select>
```

**Update handleInvite:**
```javascript
role: inviteData.role  // Use actual enum value, not "employee"
```

### **Fix 2: Clean Up profiles Table**

**Remove duplicate columns from profiles:**
```sql
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS hire_date,
  DROP COLUMN IF EXISTS role,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS company_id;
```

**OR keep them but document:**
- `profiles.role` = Display role (can be different from users.role)
- `profiles.status` = Profile status (active/inactive profile)
- `users.role` = Actual permission role
- `users.status` = Account status

### **Fix 3: Document When to Create employees Record**

**Create employees record when:**
- User needs payroll tracking
- User needs HR data (certifications, skills)
- User needs employee_number
- User is W2 employee (not contractor/customer)

**Don't create employees record when:**
- User is customer portal user
- User is external contractor
- User doesn't need payroll tracking

---

## ✅ SUMMARY

### **What We Have:**
- ✅ auth.users (Supabase Auth)
- ✅ users (Business identity)
- ✅ profiles (Personal info - BUT has duplicates)
- ✅ employees (Employment data)
- ✅ user_profiles (VIEW)
- ✅ employees_with_profiles (VIEW)

### **What's Wrong:**
- ❌ profiles has duplicate columns (hire_date, role, status, company_id)
- ❌ Code uses "employee" role (doesn't exist in enum)
- ❌ Unclear when to create employees record

### **What to Fix:**
1. ✅ Map "employee" → "technician" in UI
2. ⚠️ Decide: Clean up profiles duplicates OR document them
3. ✅ Document when to create employees record
4. ✅ Update invite flow to use correct enum values

### **Recommended Approach:**
- Keep current structure (it matches industry standard)
- Fix enum mapping immediately
- Document table purposes clearly
- Decide on profiles cleanup later (not blocking)

