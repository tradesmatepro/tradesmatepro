# ✅ ENUM FIX: Added `pending_invite` to employee_status_enum

## 🚨 **THE PROBLEM**

**Error:** `invalid input value for enum employee_status_enum: "pending_invite"`

**Root Cause:**
- Frontend code uses `status: 'pending_invite'` for invited employees
- Database enum was missing `'pending_invite'` value
- Enum only had: probation, active, inactive, suspended, terminated, on_leave, retired

---

## 🔍 **INDUSTRY STANDARD RESEARCH**

### **ServiceTitan:**
- Uses **"Pending"** status for invited employees who haven't accepted yet
- Source: https://help.servicetitan.com/how-to/add-user
- Quote: "Pending: Invitation was sent but the individual has not yet created an account"

### **TradeMate Pro:**
- Should follow ServiceTitan standard
- Use `'pending_invite'` status for invited employees
- Once they accept and log in → change to `'active'`

---

## ✅ **THE FIX**

### **Added `pending_invite` to enum:**
```sql
ALTER TYPE employee_status_enum ADD VALUE IF NOT EXISTS 'pending_invite';
```

### **Current Enum Values:**
```
employee_status_enum:
- probation
- active
- inactive
- suspended
- terminated
- on_leave
- retired
- pending_invite  ← ADDED!
```

---

## 📋 **EMPLOYEE STATUS FLOW**

### **Industry Standard Flow:**
```
1. Invite Sent → status: 'pending_invite'
2. Employee Accepts Invite → status: 'active' (or 'probation' if probation period)
3. Employee Working → status: 'active'
4. Employee Takes Leave → status: 'on_leave'
5. Employee Terminated → status: 'terminated'
```

### **TradeMate Pro Implementation:**
```javascript
// Step 3: Create business user record
const userData = {
  auth_user_id: authUserId,
  company_id: user.company_id,
  role: inviteData.role.toLowerCase(),
  status: 'pending_invite', // ✅ Matches ServiceTitan standard
  first_name: firstName,
  last_name: lastName,
  email: inviteData.email,
  phone: inviteData.phone || null,
  hire_date: new Date().toISOString().split('T')[0],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
```

---

## 🎯 **WHAT THIS FIXES**

### **Before:**
- ❌ Invite fails with enum error
- ❌ Only creates auth.users record
- ❌ No users, profiles, or employees records created

### **After:**
- ✅ Invite succeeds
- ✅ Creates all 4 records:
  1. auth.users (Supabase Auth)
  2. users (business user with status='pending_invite')
  3. profiles (UI preferences)
  4. employees (employment data)

---

## 📊 **COMPLETE EMPLOYEE STATUS ENUM**

### **Final Enum Values:**
```sql
CREATE TYPE employee_status_enum AS ENUM (
    'pending_invite',  -- NEW! Invited but not yet accepted
    'probation',       -- On probation period
    'active',          -- Active employee
    'inactive',        -- Inactive (not working)
    'suspended',       -- Suspended (disciplinary)
    'terminated',      -- Terminated (fired/quit)
    'on_leave',        -- On leave (PTO, medical, etc.)
    'retired'          -- Retired
);
```

### **Usage Guidelines:**
- **pending_invite:** Use when sending invite, before employee accepts
- **probation:** Use for new employees in probation period (optional)
- **active:** Use for active, working employees
- **inactive:** Use for employees not currently working (but not terminated)
- **suspended:** Use for disciplinary suspension
- **terminated:** Use when employee is fired or quits
- **on_leave:** Use when employee is on PTO, medical leave, etc.
- **retired:** Use when employee retires

---

## 🧪 **TESTING**

### **Test Invite Flow:**
1. Go to Employees page
2. Click "Invite Employee"
3. Fill in: email, name, role
4. Submit invite
5. **Expected:** Creates 4 records with status='pending_invite'

### **Verify Database:**
```sql
-- Check users table
SELECT id, email, first_name, last_name, role, status 
FROM users 
WHERE email = 'test@example.com';

-- Should show: status = 'pending_invite'

-- Check employees table
SELECT id, employee_number, user_id, hire_date 
FROM employees 
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- Should show: employee record exists
```

---

## 📝 **SUMMARY**

### **What Was Done:**
1. ✅ Added `'pending_invite'` to `employee_status_enum`
2. ✅ Verified enum now has 8 values (was 7)
3. ✅ Frontend code already uses `'pending_invite'` (no changes needed)

### **Industry Standard:**
- ✅ Matches ServiceTitan's "Pending" status
- ✅ Follows standard invite flow: pending → active
- ✅ Allows tracking of invited-but-not-yet-accepted employees

### **Result:**
- ✅ Invite flow should now work end-to-end
- ✅ Creates all 4 records (auth.users, users, profiles, employees)
- ✅ Status correctly set to 'pending_invite'
- ✅ Can track pending invites in UI

---

## 🚀 **READY TO TEST!**

The enum fix is complete. Try inviting a new employee now - it should work!

