# 🎯 ACTION PLAN: Fix Users/Employees Structure

## ✅ CURRENT STATUS

**Database Structure:** ✅ CORRECT (Already follows industry standard)
**Frontend Code:** ❌ WRONG (Querying wrong tables)

---

## 📋 FILES THAT NEED TO BE FIXED

### **1. src/pages/Employees.js** ⚠️ PARTIALLY FIXED
**Current Status:** Queries `users` table (CORRECT) but doesn't create `employees` records
**What's Wrong:**
- `handleInvite()` creates users + profiles but NOT employees records
- Missing employee-specific fields in invite form
- No employee record creation for staff members

**What Needs to be Fixed:**
```javascript
// ❌ CURRENT (Missing employees record)
const userData = {
  auth_user_id: authUserId,
  company_id: user.company_id,
  role: inviteData.role.toLowerCase(),
  status: 'pending_invite',
  first_name: firstName,
  last_name: lastName,
  email: inviteData.email,
  phone: inviteData.phone || null,
  hire_date: new Date().toISOString().split('T')[0],
};

// ✅ CORRECT (Add employees record creation)
// Step 4: Create employees record for staff members
if (inviteData.role !== 'customer_portal') {
  const employeeData = {
    company_id: user.company_id,
    user_id: businessUserId,
    employee_number: `EMP-${Date.now()}`,
    hire_date: new Date().toISOString().split('T')[0],
    position: inviteData.position || inviteData.role,
    pay_type: inviteData.pay_type || 'hourly',
    hourly_rate: inviteData.hourly_rate || 0,
    status: 'active'
  };
  
  const { error: employeeError } = await supabase
    .from('employees')
    .insert([employeeData]);
    
  if (employeeError) throw employeeError;
}
```

---

### **2. src/pages/Payroll.js** ❌ WRONG
**Current Status:** Queries `profiles` table (WRONG!)
**What's Wrong:**
- Line 104: Queries `profiles` table instead of `employees`
- Payroll should ONLY work with employees, not all users
- Missing employee-specific data (employee_number, hire_date, pay_type)

**What Needs to be Fixed:**
```javascript
// ❌ CURRENT (Line 104-110)
const employeesResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?company_id=eq.${user.company_id}&select=id,full_name,role&order=full_name`, {
  headers: {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Accept': 'application/json'
  }
});

// ✅ CORRECT (Query employees table)
const { data: employees, error } = await supabase
  .from('employees')
  .select(`
    id,
    employee_number,
    hire_date,
    position,
    pay_type,
    hourly_rate,
    salary,
    overtime_rate,
    status,
    users (
      id,
      first_name,
      last_name,
      email,
      role
    )
  `)
  .eq('company_id', user.company_id)
  .eq('status', 'active')
  .order('users(last_name)');
```

---

### **3. src/pages/Timesheets.js** ⚠️ NEEDS VERIFICATION
**Current Status:** Unknown (need to check what table it queries)
**What Needs to be Checked:**
- Does it query `employee_timesheets` table? (CORRECT)
- Does it reference `employees.id` or `users.id`? (Should be employees.id)
- Does it join to `users` for employee names?

**Expected Correct Structure:**
```javascript
const { data, error } = await supabase
  .from('employee_timesheets')
  .select(`
    *,
    employees (
      id,
      employee_number,
      users (
        first_name,
        last_name,
        email
      )
    ),
    work_orders (
      work_order_number,
      customer_id
    )
  `)
  .eq('employees.company_id', user.company_id)
  .order('clock_in', { ascending: false });
```

---

### **4. src/pages/Calendar.js** ⚠️ NEEDS VERIFICATION
**Current Status:** Unknown (need to check scheduling queries)
**What Needs to be Checked:**
- Does it query `schedule_events` table?
- Does it reference `employees` or `users` for field workers?
- Does it filter by employee status (active only)?

**Expected Correct Structure:**
```javascript
const { data, error } = await supabase
  .from('schedule_events')
  .select(`
    *,
    users (
      id,
      first_name,
      last_name,
      role,
      employees (
        employee_number,
        position,
        status
      )
    ),
    work_orders (
      work_order_number,
      customer_id,
      customers (
        name,
        phone
      )
    )
  `)
  .eq('company_id', user.company_id)
  .gte('start_time', startDate)
  .lte('end_time', endDate);
```

---

### **5. src/contexts/UserContext.js** ✅ CORRECT
**Current Status:** Queries `users` table (CORRECT)
**No Changes Needed:** Already using correct structure

---

### **6. src/pages/MyProfile.js** ⚠️ NEEDS VERIFICATION
**Current Status:** Unknown (need to check if it shows employee data)
**What Needs to be Checked:**
- Does it show employee-specific fields (employee_number, hire_date, position)?
- Does it query `employees` table for staff members?

**Expected Correct Structure:**
```javascript
const { data: userData, error } = await supabase
  .from('users')
  .select(`
    *,
    profiles (
      avatar_url,
      preferences
    ),
    employees (
      employee_number,
      hire_date,
      position,
      pay_type,
      hourly_rate,
      emergency_contact_name,
      emergency_contact_phone
    )
  `)
  .eq('id', user.user_id)
  .single();
```

---

### **7. admin-dashboard/src/pages/UserList.js** ✅ CORRECT
**Current Status:** Queries `users` table (CORRECT)
**No Changes Needed:** Already using correct structure

---

## 🔧 IMPLEMENTATION STEPS

### **Phase 1: Fix Employees Page (HIGH PRIORITY)**
1. ✅ Update `loadEmployees()` - ALREADY DONE
2. ❌ Update `handleInvite()` to create employees records
3. ❌ Add employee fields to invite form (position, pay_type, hourly_rate)
4. ❌ Add validation for employee-specific fields

### **Phase 2: Fix Payroll (HIGH PRIORITY)**
1. ❌ Change query from `profiles` to `employees`
2. ❌ Update data mapping to use employees structure
3. ❌ Add employee_number to payroll display
4. ❌ Update payroll_line_items to reference employees.id

### **Phase 3: Verify & Fix Timesheets (MEDIUM PRIORITY)**
1. ❌ Check current query structure
2. ❌ Ensure employee_timesheets references employees.id
3. ❌ Add proper joins to get employee names
4. ❌ Filter by active employees only

### **Phase 4: Verify & Fix Calendar/Scheduling (MEDIUM PRIORITY)**
1. ❌ Check current query structure
2. ❌ Ensure schedule_events uses correct employee references
3. ❌ Add employee status filtering
4. ❌ Update scheduling UI to show employee info

### **Phase 5: Verify & Fix MyProfile (LOW PRIORITY)**
1. ❌ Check if it shows employee data
2. ❌ Add employees join if missing
3. ❌ Display employee-specific fields

### **Phase 6: Data Migration (IF NEEDED)**
1. ❌ Check if existing users need employees records
2. ❌ Create migration script to populate employees table
3. ❌ Run migration for existing staff members

---

## 🎯 PRIORITY ORDER

1. **CRITICAL:** Fix Employees.js invite flow (create employees records)
2. **CRITICAL:** Fix Payroll.js (query employees table)
3. **HIGH:** Verify Timesheets.js (ensure correct table references)
4. **MEDIUM:** Verify Calendar.js (ensure correct employee references)
5. **LOW:** Verify MyProfile.js (add employee data if missing)
6. **LOW:** Data migration (if needed)

---

## ✅ SUCCESS CRITERIA

- [ ] Invite Employee creates records in: auth.users, users, profiles, employees
- [ ] Payroll queries employees table (not profiles)
- [ ] Timesheets references employees.id (not users.id)
- [ ] Calendar shows employee status and position
- [ ] MyProfile displays employee-specific data for staff
- [ ] All queries use proper joins (employees → users → profiles)
- [ ] No console errors related to missing columns
- [ ] All existing functionality still works

---

## 🚨 TESTING CHECKLIST

After each fix, test:
1. **Invite Employee:** Does it create all 4 records?
2. **Employees List:** Does it show all employee data?
3. **Payroll:** Does it load employees correctly?
4. **Timesheets:** Does it show employee names?
5. **Calendar:** Does it show scheduled employees?
6. **My Profile:** Does it show employee data for staff?

---

## 📝 NOTES

- Database structure is ALREADY CORRECT
- Only frontend code needs to be fixed
- Follow industry standard: users (identity) + employees (employment data)
- All employees are users, but not all users are employees
- Customer portal users should NOT have employees records

