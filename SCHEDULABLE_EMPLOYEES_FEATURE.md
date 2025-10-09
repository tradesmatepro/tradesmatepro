# Schedulable Employees Feature

## 🎯 **INDUSTRY STANDARD IMPLEMENTATION**

### **Problem Solved:**
Not all employees should appear in scheduling dropdowns. Office staff, admins, and bookkeepers shouldn't be scheduled for field work, but owner-operators and technicians should be.

---

## 🏆 **INDUSTRY STANDARD APPROACH**

### **ServiceTitan, Jobber, Housecall Pro Pattern:**

**All use a "Schedulable" / "Can be Scheduled" / "Available for Dispatch" toggle:**

| Employee Type | Schedulable? | Reason |
|--------------|--------------|--------|
| Field Technician | ✅ YES | Works in the field |
| Owner-Operator | ✅ YES | Works in field when needed |
| Office Manager | ❌ NO | Office-only, not dispatched |
| Bookkeeper | ❌ NO | Administrative only |
| Dispatcher | ❌ NO | Coordinates but doesn't work jobs |

---

## 📊 **DATABASE SCHEMA**

### **New Column Added:**
```sql
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS is_schedulable BOOLEAN DEFAULT true;

COMMENT ON COLUMN employees.is_schedulable IS 
'Whether this employee can be scheduled for field work (industry standard: excludes office staff, includes owner-operators)';
```

### **Default Behavior:**
- **New employees:** `is_schedulable = true` (assume field worker)
- **Can be toggled** in Employee settings/profile

---

## 🔧 **CODE CHANGES**

### **1. SmartSchedulingAssistant.js**
**Line 119:** Added `is_schedulable` filter
```javascript
// ✅ BEFORE:
employees?select=id,user_id,job_title,users(...)&users.status.eq.active

// ✅ AFTER:
employees?select=id,user_id,job_title,is_schedulable,users(...)&users.status.eq.active&is_schedulable.eq.true
```

### **2. Scheduling.js**
**Line 177:** Added `is_schedulable` filter
```javascript
// Same pattern as above
```

### **3. JobsDatabasePanel.js**
**Line 203:** Added `is_schedulable` filter
```javascript
// Same pattern as above
```

---

## 🎨 **UI IMPLEMENTATION**

### **Where to Add Toggle:**

#### **Option A: Employees Page (Recommended)** ⭐
Add toggle in employee edit form:
```javascript
<div className="form-group">
  <label>
    <input 
      type="checkbox" 
      checked={formData.is_schedulable}
      onChange={(e) => setFormData({...formData, is_schedulable: e.target.checked})}
    />
    Available for Scheduling
  </label>
  <p className="text-sm text-gray-500">
    Enable this for field technicians and owner-operators. 
    Disable for office staff, admins, and bookkeepers.
  </p>
</div>
```

#### **Option B: Settings > Scheduling Tab**
Add section for "Schedulable Employees" with list of all employees and toggles

#### **Option C: Employee Profile Page**
Add toggle in employee profile settings

---

## 📝 **CURRENT STATUS**

### **Database:**
✅ Column added: `employees.is_schedulable`
✅ Default value: `true`
✅ Jerry Smith (Owner): `is_schedulable = true`
✅ Brad Hansell (Technician): `is_schedulable = true`

### **Code:**
✅ SmartSchedulingAssistant filters by `is_schedulable`
✅ Scheduling page filters by `is_schedulable`
✅ JobsDatabasePanel filters by `is_schedulable`

### **UI:**
⏳ **TODO:** Add toggle to Employees page edit form
⏳ **TODO:** Add visual indicator (badge) on Employees list
⏳ **TODO:** Add bulk toggle action

---

## 🧪 **TESTING**

### **Test Scenario 1: Field Technician**
1. Create employee with role "Technician"
2. Set `is_schedulable = true`
3. ✅ Should appear in Smart Scheduler dropdown
4. ✅ Should appear in Scheduling page
5. ✅ Should appear in Jobs assignment dropdown

### **Test Scenario 2: Office Staff**
1. Create employee with role "Office Manager"
2. Set `is_schedulable = false`
3. ❌ Should NOT appear in Smart Scheduler dropdown
4. ❌ Should NOT appear in Scheduling page
5. ❌ Should NOT appear in Jobs assignment dropdown
6. ✅ Should still appear in Employees page
7. ✅ Should still appear in Timesheets

### **Test Scenario 3: Owner-Operator**
1. Owner has employee record
2. Set `is_schedulable = true` (when they work in field)
3. ✅ Should appear in all scheduling dropdowns
4. Can toggle to `false` when they stop doing field work

---

## 🔄 **MIGRATION GUIDE**

### **For Existing Companies:**

**Step 1: Audit Current Employees**
```sql
SELECT 
  e.id,
  u.name,
  u.role,
  e.job_title,
  e.is_schedulable
FROM employees e
JOIN users u ON e.user_id = u.id
WHERE e.company_id = 'YOUR_COMPANY_ID'
ORDER BY u.name;
```

**Step 2: Set Schedulable Based on Role**
```sql
-- Set office staff to NOT schedulable
UPDATE employees 
SET is_schedulable = false
WHERE job_title IN ('Office Manager', 'Bookkeeper', 'Admin', 'Dispatcher')
  AND company_id = 'YOUR_COMPANY_ID';

-- Set field workers to schedulable
UPDATE employees 
SET is_schedulable = true
WHERE job_title IN ('Technician', 'Installer', 'Service Tech', 'Owner')
  AND company_id = 'YOUR_COMPANY_ID';
```

**Step 3: Verify**
```sql
SELECT 
  u.name,
  e.job_title,
  e.is_schedulable,
  CASE 
    WHEN e.is_schedulable THEN '✅ Appears in scheduling'
    ELSE '❌ Hidden from scheduling'
  END as scheduling_status
FROM employees e
JOIN users u ON e.user_id = u.id
WHERE e.company_id = 'YOUR_COMPANY_ID'
ORDER BY e.is_schedulable DESC, u.name;
```

---

## 💡 **BEST PRACTICES**

### **When to Set is_schedulable = true:**
- ✅ Field technicians
- ✅ Service technicians
- ✅ Installers
- ✅ Owner-operators (when they work in field)
- ✅ Apprentices
- ✅ Subcontractors (if managed in system)

### **When to Set is_schedulable = false:**
- ❌ Office managers
- ❌ Bookkeepers
- ❌ Dispatchers
- ❌ Sales staff (unless they also do field work)
- ❌ Warehouse staff
- ❌ Retired owners (still in system but not working)

---

## 🚀 **NEXT STEPS**

### **Phase 1: UI Implementation** (Recommended)
1. Add toggle to Employees page edit form
2. Add visual badge on Employees list ("Schedulable" / "Office Only")
3. Add bulk action: "Mark as Schedulable" / "Mark as Office Only"

### **Phase 2: Advanced Features** (Optional)
1. **Scheduling Preferences:**
   - Preferred days/times
   - Max jobs per day
   - Service area restrictions
   
2. **Skills-Based Scheduling:**
   - Only show employees with required skills
   - Filter by certifications
   
3. **Availability Calendar:**
   - PTO integration
   - Sick leave
   - Training days

---

## 📚 **RELATED TABLES**

### **Current Schema:**
```
users (ALL users: employees, customers, contractors)
  ↓
employees (ONLY employees, subset of users)
  ↓ is_schedulable filter
schedulable_employees (Virtual - filtered by is_schedulable = true)
```

### **Related Features:**
- ✅ `employee_time_off` - PTO blocks
- ✅ `employee_availability` - Working hours
- ✅ `schedule_events` - Scheduled jobs
- ✅ `work_orders.employee_id` - Job assignments

---

## ✅ **SUCCESS CRITERIA**

- [x] Database column added
- [x] Smart Scheduler filters by is_schedulable
- [x] Scheduling page filters by is_schedulable
- [x] JobsDatabasePanel filters by is_schedulable
- [x] Both employees (Jerry & Brad) are schedulable
- [ ] UI toggle added to Employees page
- [ ] Visual indicator on Employees list
- [ ] Documentation updated

---

**Status: Database & Code Complete | UI Implementation Pending** 🎯

