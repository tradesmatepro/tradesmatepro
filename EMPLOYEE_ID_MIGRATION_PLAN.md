# 🏆 EMPLOYEE_ID MIGRATION - INDUSTRY STANDARD

## ✅ DATABASE MIGRATION COMPLETE!

### **What Was Done:**
1. ✅ Added `employee_id` column to `work_orders` table
2. ✅ Added `employee_id` column to `schedule_events` table
3. ✅ Both columns reference `employees.id` (correct FK)
4. ✅ Indexes created for performance

---

## 📊 CURRENT SCHEMA STATE:

### **work_orders table:**
```sql
assigned_to UUID → users.id (OLD, will deprecate)
assigned_technician_id UUID → profiles.id (OLD, WRONG FK!, will deprecate)
employee_id UUID → employees.id (NEW, CORRECT!) ✅
```

### **schedule_events table:**
```sql
user_id UUID → users.id (OLD, will deprecate)
employee_id UUID → employees.id (NEW, CORRECT!) ✅
```

---

## 🎯 FRONTEND MIGRATION STRATEGY:

### **Phase 1: Update Code to Use employee_id** (DO THIS NOW)

We need to update all places that currently save `assigned_to`, `assigned_technician_id`, or `user_id` to instead save `employee_id`.

**Key Principle:**
- When user selects an employee from dropdown, we get the employee record
- Save `employee.id` (employee record ID) to `employee_id` field
- NOT `employee.user_id` (user ID)

---

## 📝 FILES TO UPDATE:

### **1. src/components/JobsDatabasePanel.js** (line 250)

**Current:**
```javascript
const woData = {
  assigned_technician_id: formData.assigned_technician_id || null,
  // ...
};
```

**Change to:**
```javascript
const woData = {
  employee_id: formData.employee_id || null,  // ✅ Use employee_id
  // ...
};
```

---

### **2. src/components/SmartSchedulingAssistant.js** (line 342)

**Current:**
```javascript
const workOrderUpdateData = {
  assigned_technician_id: assignedEmployees[0],  // This is user_id
  // ...
};
```

**Change to:**
```javascript
// assignedEmployees contains user_ids, need to convert to employee_ids
const employeeRecords = await supaFetch(
  `employees?select=id,user_id&user_id.in.(${assignedEmployees.join(',')})`,
  { method: 'GET' },
  user.company_id
);
const employeeIds = employeeRecords.map(e => e.id);

const workOrderUpdateData = {
  employee_id: employeeIds[0],  // ✅ Use employee_id (employee record ID)
  // ...
};
```

---

### **3. src/pages/Calendar.js** (line 344)

**Current:**
```javascript
const res = await supaFetch(`schedule_events`, { 
  method:'POST', 
  body: JSON.stringify({ 
    work_order_id: wo.id, 
    employee_id: choice.empId,  // This is user_id, not employee_id!
    // ...
  }) 
}, user.company_id);
```

**Change to:**
```javascript
// choice.empId is user_id, need to convert to employee_id
const employeeRecord = await supaFetch(
  `employees?select=id&user_id=eq.${choice.empId}`,
  { method: 'GET' },
  user.company_id
);
const employeeId = employeeRecord[0]?.id;

const res = await supaFetch(`schedule_events`, { 
  method:'POST', 
  body: JSON.stringify({ 
    work_order_id: wo.id, 
    employee_id: employeeId,  // ✅ Use employee_id (employee record ID)
    // ...
  }) 
}, user.company_id);
```

---

### **4. src/services/WorkOrderService.js** (line 76)

**Current:**
```javascript
async setSchedule(id, { start_time, end_time, assigned_technician_id }, companyId) {
  const body = {};
  if (start_time) body.start_time = start_time;
  if (end_time) body.end_time = end_time;
  if (assigned_technician_id) body.assigned_technician_id = assigned_technician_id;
  // ...
}
```

**Change to:**
```javascript
async setSchedule(id, { start_time, end_time, employee_id }, companyId) {
  const body = {};
  if (start_time) body.start_time = start_time;
  if (end_time) body.end_time = end_time;
  if (employee_id) body.employee_id = employee_id;  // ✅ Use employee_id
  // ...
}
```

---

### **5. src/utils/smartScheduling.js** (line 131-132)

**Current:**
```javascript
// Get schedule_events by user_id and employee_id for robustness
const scheduleEventsUrlUser = `${SUPABASE_URL}/rest/v1/schedule_events?user_id=eq.${employeeId}&...`;
const scheduleEventsUrlEmp  = `${SUPABASE_URL}/rest/v1/schedule_events?employee_id=eq.${employeeId}&...`;
```

**Problem:** The `employeeId` parameter is actually a `user_id`, not an `employee_id`!

**Change to:**
```javascript
// Convert user_id to employee_id first
const employeeRecord = await fetch(`${SUPABASE_URL}/rest/v1/employees?select=id&user_id=eq.${userId}`, {
  headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` }
});
const employeeData = await employeeRecord.json();
const employeeId = employeeData[0]?.id;

// Query schedule_events by employee_id only
const scheduleEventsUrl = `${SUPABASE_URL}/rest/v1/schedule_events?employee_id=eq.${employeeId}&...`;
```

---

## 🔑 KEY CONCEPT:

### **employee.id vs employee.user_id**

```javascript
// When you query employees table:
const employees = await supabase
  .from('employees')
  .select(`
    id,           // ← This is employee record ID (save to employee_id)
    user_id,      // ← This is user record ID (DON'T save to employee_id)
    users (
      first_name,
      last_name
    )
  `);

// When saving to work_orders or schedule_events:
workOrder.employee_id = employee.id;  // ✅ CORRECT
workOrder.employee_id = employee.user_id;  // ❌ WRONG
```

---

## 🧪 TESTING CHECKLIST:

After updating frontend code:

1. ✅ Create a new work order and assign an employee
   - Check database: `employee_id` should be populated
   - Check database: `employee_id` should match `employees.id`

2. ✅ Schedule a work order
   - Check database: `schedule_events.employee_id` should be populated
   - Check database: `employee_id` should match `employees.id`

3. ✅ Use Smart Scheduling Assistant
   - Should assign employees correctly
   - Check database: `employee_id` populated

4. ✅ View Calendar
   - Should show scheduled events
   - Should query by `employee_id` correctly

---

## 🚀 PHASE 2: CLEANUP (AFTER TESTING)

Once everything works with `employee_id`:

```sql
-- Drop old columns
ALTER TABLE work_orders DROP COLUMN assigned_to;
ALTER TABLE work_orders DROP COLUMN assigned_technician_id;
ALTER TABLE schedule_events DROP COLUMN user_id;
```

---

## 📋 SUMMARY:

| Status | Task |
|--------|------|
| ✅ | Database migration complete |
| ✅ | employee_id columns added |
| ✅ | Indexes created |
| ⏳ | Update frontend code (IN PROGRESS) |
| ⏳ | Test thoroughly |
| ⏳ | Drop old columns |

---

## 🎯 NEXT STEP:

Update the frontend files listed above to use `employee_id` instead of `assigned_to` / `assigned_technician_id` / `user_id`.

**Remember:** Save `employee.id` (employee record ID), NOT `employee.user_id` (user ID)!


