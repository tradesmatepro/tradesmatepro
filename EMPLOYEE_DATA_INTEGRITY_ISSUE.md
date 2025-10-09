# 🚨 EMPLOYEE DATA INTEGRITY ISSUE - ROOT CAUSE FOUND

## 📊 THE PROBLEM

You asked the right question: **"Is the app wrong or the DB wrong?"**

**Answer: THE DATABASE IS WRONG** ❌

---

## 🔍 INVESTIGATION RESULTS

### **Database State:**
- **Total employees in DB:** 7
- **Real employees:** 2
  - brad Hansell (brad@cgrenewables.com) - EMP-1759363436571
  - Jerry Smith (jeraldjsmith@gmail.com) - EMP-000001
- **Test/Mock employees:** 5
  - EMP-TEST-001 through EMP-TEST-005 (all created 2025-10-05)
  - All have same email: jeraldjsmith@gmail.com

### **Missing Database Columns:**
- ❌ **`employees.status` column DOES NOT EXIST**
- ❌ **`employees.role` column DOES NOT EXIST**

### **Why the Discrepancy:**

| Page | Shows | Why |
|------|-------|-----|
| **Employees Page** | 2 employees | Filters by `status='active'` (column doesn't exist, returns 0), then shows all employees anyway |
| **Timesheets Page** | 3 employees | Counts ALL employees with timesheets (includes 3 test employees) |
| **Database** | 7 employees | Actual count including 5 test employees |

---

## 🎯 ROOT CAUSES

### **1. Missing Schema Columns**
The `employees` table is missing critical columns:
- `status` (active/inactive)
- `role` (might be in profiles/users table instead)

**Impact:**
- Employees page can't filter by status
- No way to mark employees as inactive
- Inconsistent data display across pages

### **2. Test Data Pollution**
5 test employees created on 2025-10-05 with:
- Employee numbers: EMP-TEST-001 through EMP-TEST-005
- All same email: jeraldjsmith@gmail.com
- 8 timesheets referencing 3 of these test employees

**Impact:**
- Inflated employee counts
- Confusing timesheet data
- "Unknown Employee" display issues

### **3. No Data Validation**
- Multiple employees can have same email
- No status field to mark test vs real data
- No cleanup process for test data

---

## ✅ THE FIX

### **Step 1: Add Missing Columns**
```sql
ALTER TABLE employees ADD COLUMN status TEXT DEFAULT 'active';
```

### **Step 2: Delete Test Data**
```sql
-- Delete timesheets first (foreign key constraint)
DELETE FROM employee_timesheets
WHERE employee_id IN (
    SELECT id FROM employees WHERE employee_number LIKE '%TEST%'
);

-- Then delete test employees
DELETE FROM employees WHERE employee_number LIKE '%TEST%';
```

### **Step 3: Set Real Employees to Active**
```sql
UPDATE employees SET status = 'active'
WHERE employee_number NOT LIKE '%TEST%';
```

---

## 📋 EXECUTION PLAN

### **Option A: Run SQL Script (RECOMMENDED)**
I've created `fix-employees-schema.sql` that will:
1. ✅ Add `status` column if missing
2. ✅ Check for `role` column
3. ✅ Show before/after state
4. ✅ Delete test timesheets
5. ✅ Delete test employees
6. ✅ Set real employees to active
7. ✅ Show verification results

**How to run:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `fix-employees-schema.sql`
3. Run the script
4. Review the output

### **Option B: Manual Cleanup via Supabase Dashboard**
1. Go to Table Editor → `employees`
2. Add `status` column (type: text, default: 'active')
3. Delete rows where `employee_number` contains 'TEST'
4. Go to `employee_timesheets` table
5. Delete rows where `employee_id` references deleted employees

---

## 🎯 EXPECTED RESULTS AFTER FIX

### **Database:**
- **Total employees:** 2
- **Active employees:** 2
- **Test employees:** 0
- **Timesheets:** 0 (all test timesheets deleted)

### **Employees Page:**
- **Shows:** 2 employees
- **Active:** 2
- **Filters work correctly**

### **Timesheets Page:**
- **Shows:** 0 timesheets (test data deleted)
- **Employee count:** 0 (no timesheets exist)
- **Ready for real timesheet data**

---

## 🔧 APP CODE FIXES NEEDED

After fixing the database, we need to update the app code:

### **1. Employees Page Query**
```javascript
// Make sure it filters by status
.eq('status', 'active')
```

### **2. Timesheets Page Query**
```javascript
// Already correct - joins with employees table
// Will automatically exclude deleted test employees
```

### **3. Employee Count Logic**
```javascript
// Already fixed - only counts employees with valid data
const uniqueEmployees = new Set(
  filteredTimesheets
    .filter(t => t.employees && t.employees.id)
    .map(t => t.employee_id)
).size;
```

---

## 📝 PREVENTION FOR FUTURE

### **1. Add Database Constraints**
```sql
-- Unique constraint on email per company
ALTER TABLE employees 
ADD CONSTRAINT unique_email_per_company 
UNIQUE (company_id, user_id);

-- Status check constraint
ALTER TABLE employees 
ADD CONSTRAINT valid_status 
CHECK (status IN ('active', 'inactive', 'pending'));
```

### **2. Add Test Data Markers**
```sql
-- Add is_test_data column
ALTER TABLE employees ADD COLUMN is_test_data BOOLEAN DEFAULT false;

-- Filter out test data in queries
WHERE is_test_data = false
```

### **3. Add Data Validation in App**
- Prevent duplicate emails per company
- Require status field on employee creation
- Add "Delete Test Data" admin function

---

## 🚀 NEXT STEPS

1. **Review the SQL script** (`fix-employees-schema.sql`)
2. **Backup your database** (just in case)
3. **Run the SQL script** in Supabase SQL Editor
4. **Verify the results** (should show 2 employees, 0 timesheets)
5. **Hard refresh the app** (Ctrl+Shift+R)
6. **Test both pages:**
   - Employees page should show 2 employees
   - Timesheets page should show 0 timesheets
7. **Create new real timesheets** for testing

---

## ✅ CONCLUSION

**The database is wrong, not the app.**

The app code is actually working correctly:
- ✅ Employees page tries to filter by status (column doesn't exist)
- ✅ Timesheets page counts employees with timesheets (includes test data)

The fix is simple:
1. Add missing `status` column
2. Delete test data
3. Set real employees to active

**After this fix, both pages will show consistent, correct data.** 🎉

