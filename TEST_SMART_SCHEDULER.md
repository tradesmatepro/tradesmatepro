# Smart Scheduler Test Plan

## 🧪 **TEST PROCEDURE**

### **Step 1: Hard Refresh**
```
Ctrl + Shift + R
```

### **Step 2: Navigate to Quotes**
- Go to http://localhost:3004/quotes
- Wait for quotes to load

### **Step 3: Open Quote for Edit**
- Click on the "hvac install test" quote
- Quote should open in edit mode

### **Step 4: Change Status to Approved**
- Change status dropdown to "Approved"
- Click "Save" or "Update Quote"

### **Step 5: Verify Prompt**
- Should see: "Quote accepted! Would you like to schedule this job now?"
- Click "OK" (Yes)

### **Step 6: Check Console Logs**
Look for these logs in order:
```
✅ Work order updated successfully!
✅ Line items saved successfully: 2 items
📋 Loaded work_order_line_items for scheduling: (2) [{…}, {…}]
🔍 User clicked schedule? true
🔄 Loading work_order_line_items for quote: 92333880-d0fe-4b21-9310-c1af14ecd4c7
📋 Loaded work_order_line_items for scheduling: (2) [{…}, {…}]
🚀 Navigating to /jobs with state: {openScheduler: true, jobData: {...}}
✅ Navigation complete
🚀 Opening scheduler from React Router state: {...}
```

### **Step 7: Verify Smart Scheduler Opens**
- Should see Smart Scheduling Assistant modal
- Modal should have job title: "hvac install test"
- Should show job duration calculated from labor hours
- Should show employee dropdown

---

## ✅ **EXPECTED BEHAVIOR**

1. ✅ Quote saves successfully
2. ✅ Line items save successfully
3. ✅ work_order_line_items load without 404 error
4. ✅ User confirms scheduling
5. ✅ Navigation to /jobs with React Router state
6. ✅ Jobs page receives state and opens Smart Scheduler
7. ✅ Smart Scheduler displays with job data pre-filled

---

## ❌ **FAILURE SCENARIOS**

### **Scenario A: 404 Error Loading Items**
**Symptom:** `GET .../work_order_line_items... 404`
**Cause:** Table doesn't exist or RLS blocking
**Fix:** Check table exists and RLS policies allow read

### **Scenario B: Navigation Happens But Scheduler Doesn't Open**
**Symptom:** Redirects to /jobs but no modal
**Cause:** Jobs page not handling location.state
**Fix:** Check useEffect in Jobs.js handles location.state

### **Scenario C: Scheduler Opens But No Job Data**
**Symptom:** Modal opens but fields are empty
**Cause:** jobData not passed correctly
**Fix:** Check jobData structure matches SmartSchedulingAssistant expectations

### **Scenario D: Items Load But Wrong Format**
**Symptom:** Scheduler opens but duration is wrong
**Cause:** work_order_line_items structure doesn't match expected format
**Fix:** Check item mapping in SmartSchedulingAssistant

---

## 🔍 **DEBUGGING CHECKLIST**

- [ ] Hard refresh performed (Ctrl + Shift + R)
- [ ] Console shows "Loaded work_order_line_items" (not 404)
- [ ] Console shows "User clicked schedule? true"
- [ ] Console shows "Navigating to /jobs with state"
- [ ] Console shows "Opening scheduler from React Router state"
- [ ] URL changes to http://localhost:3004/jobs
- [ ] Smart Scheduling Assistant modal is visible
- [ ] Job title is pre-filled
- [ ] Job duration is calculated from labor hours
- [ ] Employee dropdown is populated

---

## 🚀 **AUTO-FIX LOOP**

If test fails, check logs and apply fixes:

### **Fix 1: Table Name Wrong**
```javascript
// ❌ WRONG: work_order_items
// ✅ RIGHT: work_order_line_items
```

### **Fix 2: Missing State Handler**
```javascript
// Add to Jobs.js:
useEffect(() => {
  if (location.state?.openScheduler && location.state?.jobData) {
    setSelectedJobForScheduling(location.state.jobData);
    setShowSmartAssistant(true);
    navigate(location.pathname, { replace: true, state: {} });
  }
}, [location.state]);
```

### **Fix 3: Wrong Column Names**
```javascript
// ❌ WRONG: assigned_technician_id, job_status
// ✅ RIGHT: employee_id, status
```

### **Fix 4: Property Name Mismatch**
```javascript
// Query from: work_order_line_items (table)
// Store as: work_order_items (property for compatibility)
jobData.work_order_items = items;
```

---

## 📊 **SUCCESS CRITERIA**

✅ All console logs appear in correct order
✅ No 404 errors
✅ No React errors
✅ Smart Scheduler modal opens
✅ Job data is pre-filled correctly
✅ Can select employee and time slot
✅ Can click "Schedule" and save

---

## 🎯 **NEXT STEPS AFTER SUCCESS**

1. Test scheduling with different employees
2. Test scheduling with different time slots
3. Verify schedule_events record is created
4. Verify work_orders.employee_id is updated
5. Verify work_orders.status changes to 'scheduled'
6. Verify calendar shows the scheduled job

---

**Run this test after every code change until all steps pass!** 🚀

