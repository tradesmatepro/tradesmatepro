# 🚨 FULL DATABASE AUDIT REQUIRED

**Date:** 2025-10-01  
**Issue:** Multiple user/profile/employee tables, enum mismatches, unclear schema  
**Status:** ⚠️ CRITICAL - Needs immediate audit before continuing

---

## 🔍 WHAT WE FOUND

### **Problem 1: Enum Mismatch**
**Error:** `invalid input value for enum user_role_enum: "employee"`

**Database Has:**
```sql
user_role_enum values:
- owner
- admin
- manager
- dispatcher
- supervisor
- lead_technician
- technician          ← This exists!
- apprentice
- helper
- accountant
- sales_rep
- customer_service
- customer_portal
```

**Code Tries to Use:**
```javascript
role: 'employee'  // ❌ Doesn't exist in enum!
```

### **Problem 2: Multiple User/Profile Tables**

**Tables Found:**
1. `users` - Business users table
2. `profiles` - User profile data
3. `user_profiles` - View or table?
4. `employees` - Employee-specific data
5. `employees_with_profiles` - View or table?

**Plus:**
- `employee_performance`
- `employee_performance_metrics`
- `employee_timesheets`
- `user_activity_log`
- `user_dashboard_settings`
- `user_sessions`

### **Problem 3: Unclear Relationships**

**Questions:**
1. What's the difference between `users` and `employees`?
2. What's the difference between `profiles` and `user_profiles`?
3. Which table should signup create records in?
4. Which tables should employee invite create records in?
5. Are `user_profiles` and `employees_with_profiles` views or tables?

---

## 🏗️ WHAT NEEDS TO BE AUDITED

### **1. Table Structure Audit**

For each table, document:
- **Purpose:** What is this table for?
- **Columns:** What columns does it have?
- **Primary Key:** What's the PK?
- **Foreign Keys:** What does it reference?
- **Created By:** Signup? Invite? Manual?
- **Used By:** Which pages/features use it?

### **2. Enum Audit**

For each enum, document:
- **Name:** enum name
- **Values:** all possible values
- **Used By:** which tables use it
- **Code Expectations:** what values does code try to insert

### **3. Relationship Audit**

Document the flow:
```
auth.users (Supabase Auth)
    ↓
users table (business user)
    ↓
profiles table (personal data)
    ↓
employees table (employment data)
    ↓
???
```

### **4. Signup/Invite Flow Audit**

Document what gets created where:

**Signup (New Company Owner):**
- [ ] auth.users record?
- [ ] users record?
- [ ] profiles record?
- [ ] user_profiles record?
- [ ] employees record?
- [ ] Other?

**Invite Employee:**
- [ ] auth.users record?
- [ ] users record?
- [ ] profiles record?
- [ ] user_profiles record?
- [ ] employees record?
- [ ] Other?

---

## 🎯 IMMEDIATE FIXES NEEDED

### **Fix 1: Enum Value Mapping**

**Problem:** Code uses "employee" but enum has "technician"

**Solution Options:**

**Option A: Add "employee" to enum**
```sql
ALTER TYPE user_role_enum ADD VALUE 'employee';
```

**Option B: Map "employee" → "technician" in code**
```javascript
const roleMapping = {
  'employee': 'technician',
  'admin': 'admin',
  'owner': 'owner',
  // ...
};

role: roleMapping[inviteData.role] || inviteData.role
```

**Option C: Update UI to use correct enum values**
```javascript
// In EmployeeInviteModal.js
<option value="technician">Employee</option>  // Display "Employee", value "technician"
<option value="admin">Admin</option>
<option value="owner">Owner</option>
```

**Recommendation:** Option C (update UI) - Most correct

### **Fix 2: Clarify Table Usage**

**Need to document:**
```
users table:
  Purpose: ???
  Created by: ???
  Columns: ???

profiles table:
  Purpose: ???
  Created by: ???
  Columns: ???

user_profiles table:
  Purpose: ???
  Created by: ???
  Columns: ???

employees table:
  Purpose: ???
  Created by: ???
  Columns: ???
```

---

## 📊 AUDIT QUERIES TO RUN

### **Query 1: Check users table structure**
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

### **Query 2: Check profiles table structure**
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

### **Query 3: Check if user_profiles is a view**
```sql
SELECT table_type
FROM information_schema.tables
WHERE table_name = 'user_profiles';
```

### **Query 4: Check employees table structure**
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;
```

### **Query 5: Check foreign key relationships**
```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('users', 'profiles', 'user_profiles', 'employees')
ORDER BY tc.table_name, kcu.column_name;
```

### **Query 6: Check what's in each table**
```sql
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'employees', COUNT(*) FROM employees;
```

---

## 🚨 WHY THIS KEEPS HAPPENING

### **Root Cause:**

Every time we "standardize", we're making assumptions about what the database looks like based on:
1. ❌ Schema documentation files (may be outdated)
2. ❌ "Industry standard" patterns (may not match actual DB)
3. ❌ Code expectations (may be wrong)

**We're NOT checking:**
1. ✅ Actual database schema
2. ✅ Actual table structures
3. ✅ Actual enum values
4. ✅ Actual foreign key relationships

### **The Fix:**

**ALWAYS start with:**
1. Query actual database schema
2. Document what exists
3. Compare to what code expects
4. Fix mismatches
5. Update documentation

**NEVER assume:**
- Table names
- Column names
- Enum values
- Foreign key directions
- View vs table

---

## 📝 RECOMMENDED APPROACH

### **Step 1: Run Full Schema Dump**
```bash
node "Supabase Schema/db-dumper.js"
```

### **Step 2: Analyze Schema JSON**
```javascript
const schema = require('./supabase schema/latest.json');

// Check users table
const usersTable = schema.tables.find(t => t.table === 'users');
console.log('users columns:', usersTable.columns);

// Check profiles table
const profilesTable = schema.tables.find(t => t.table === 'profiles');
console.log('profiles columns:', profilesTable.columns);

// Check enums
const roleEnum = schema.enums.find(e => e.name === 'user_role_enum');
console.log('user_role_enum values:', roleEnum.values);
```

### **Step 3: Document Findings**
Create `DATABASE_SCHEMA_ACTUAL.md` with:
- All tables and their purposes
- All columns and their types
- All enums and their values
- All foreign keys and relationships
- All views and their definitions

### **Step 4: Compare to Code**
- What does code expect?
- What does database have?
- Where are the mismatches?

### **Step 5: Fix Mismatches**
- Update code to match database
- OR update database to match code
- OR create migration to standardize

---

## ✅ IMMEDIATE ACTION ITEMS

### **Priority 1: Fix Enum Error (Blocking)**
- [ ] Check what role values EmployeeInviteModal uses
- [ ] Map them to actual enum values
- [ ] Test invite flow

### **Priority 2: Document Actual Schema**
- [ ] Run schema dump
- [ ] Document users table
- [ ] Document profiles table
- [ ] Document user_profiles (view or table?)
- [ ] Document employees table
- [ ] Document relationships

### **Priority 3: Fix Signup Flow**
- [ ] Document what signup currently creates
- [ ] Verify it matches database schema
- [ ] Test signup flow

### **Priority 4: Fix Invite Flow**
- [ ] Document what invite currently creates
- [ ] Verify it matches database schema
- [ ] Test invite flow

### **Priority 5: Create Migration Plan**
- [ ] If schema is wrong, create migration
- [ ] If code is wrong, fix code
- [ ] If both are wrong, decide on standard

---

## 🎯 NEXT STEPS

**Option A: Quick Fix (Get Invite Working)**
1. Fix enum mapping in EmployeeInviteModal
2. Test invite flow
3. Schedule full audit for later

**Option B: Full Audit Now (Recommended)**
1. Stop all development
2. Run full schema audit
3. Document everything
4. Fix all mismatches
5. Create single source of truth
6. Resume development

**User's Choice:** Which approach do you want?

---

## 📊 QUESTIONS FOR USER

1. **Do you want quick fix or full audit?**
   - Quick: Fix enum, continue development
   - Full: Stop and audit everything

2. **What's the relationship between these tables?**
   - users vs employees
   - profiles vs user_profiles

3. **Which tables should signup create?**
   - Just users?
   - users + profiles?
   - users + profiles + employees?

4. **Which tables should invite create?**
   - Just users?
   - users + profiles?
   - users + profiles + employees?

5. **Do you have schema documentation?**
   - notes.md?
   - gptnotes.txt?
   - Other files?

---

## ⚠️ WARNING

**Every "standardization" without checking actual database will fail.**

**We need to:**
1. ✅ Check actual database FIRST
2. ✅ Document what exists
3. ✅ Compare to expectations
4. ✅ Fix mismatches
5. ✅ Test thoroughly

**Stop assuming. Start verifying.**

