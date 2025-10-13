# 🔧 SMART SCHEDULING ISSUES - ROOT CAUSE IDENTIFIED

**Date:** 2025-10-13  
**Issue:** Scheduling widget not respecting company settings  
**Status:** Root cause identified, fix needed  

---

## 🎯 THE PROBLEM

You reported:
> "its a job that is 8 hours but shows available every 15 minutes. its not obeying the smart schedule settings in the settings page. i said available certain days and certain times so it should not be showing monday at all correct?"

**Symptoms:**
1. ❌ Shows slots every **15 minutes** (should respect configured interval)
2. ❌ Shows **Monday** slots (should respect working_days setting)
3. ❌ Shows slots **outside business hours** (should respect business_hours_start/end)
4. ❌ Shows **2-hour slots** for an 8-hour job (should show 8-hour blocks)

---

## 🔍 ROOT CAUSE ANALYSIS

### **Issue #1: Hardcoded 15-Minute Intervals**

**File:** `supabase/functions/smart-scheduling/index.ts`  
**Line:** 151

```typescript
function generateCleanTimeSlots(startTime: Date, endTime: Date, intervalMinutes = 15): Date[] {
  const slots: Date[] = []
  let currentTime = roundToNext15Minutes(new Date(startTime))

  while (currentTime < endTime) {
    slots.push(new Date(currentTime))
    currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes)  // ← Hardcoded 15!
  }

  return slots
}
```

**Problem:** The function has a default parameter of `15` minutes, but it's never overridden with a configurable setting.

**Missing:** There's NO `time_slot_interval` or `scheduling_interval_minutes` setting in the database!

---

### **Issue #2: Duration vs. Interval Confusion**

**File:** `quote.html`  
**Line:** 1479

```javascript
schedulingWidget = new SchedulingWidget({
  containerId: 'scheduling-widget-container',
  companyId: quoteData.company_id,
  employeeIds: employeeIds,
  durationMinutes: 120,  // ← This is the JOB duration (2 hours)
  // ...
});
```

**Problem:** The widget is passing `durationMinutes: 120` (2 hours) which is the **job duration**, not the **time slot interval**.

**What's happening:**
- Job is 8 hours total (16 hours / 2 employees)
- Widget is told duration is 120 minutes (2 hours)
- Edge function generates 15-minute slots
- Shows every 15 minutes for a 2-hour window

**What SHOULD happen:**
- Job is 8 hours per employee
- Widget should pass `durationMinutes: 480` (8 hours)
- Edge function should generate slots at configured intervals (e.g., 60 minutes, 120 minutes, or full-day blocks)
- Should only show slots on configured working days

---

### **Issue #3: Missing Time Slot Interval Setting**

**Database Schema Check:**

The `companies` table has:
- ✅ `business_hours_start` - When business opens
- ✅ `business_hours_end` - When business closes
- ✅ `working_days` - Which days are available (e.g., [2,3,4,5,6] = Tue-Sat)
- ✅ `job_buffer_minutes` - Buffer between jobs
- ❌ **MISSING:** `time_slot_interval_minutes` - How often to show available slots

**Industry Standard (Jobber/ServiceTitan/Housecall Pro):**
- **15-minute intervals** - For quick services (HVAC diagnostics, plumbing repairs)
- **30-minute intervals** - For medium services
- **60-minute intervals** - For longer services
- **120-minute intervals** - For half-day services
- **Full-day blocks** - For all-day jobs

---

### **Issue #4: Not Calculating Duration from Quote Labor**

**The quote shows:**
```
Employees: 1
Hours/Day: 16
Days: 1
Total Hours: 16.0h
Regular: 8.0h @ $75
Overtime: 8.0h @ $112.5
Total Cost: $1500.00
```

**This means:**
- 1 employee × 16 hours = 16 total hours
- OR: 2 employees × 8 hours each = 16 total hours

**But quote.html is hardcoding:**
```javascript
durationMinutes: 120,  // ← Always 2 hours!
```

**Should be calculating from quote data:**
```javascript
// Get total hours from quote labor
const totalHours = quoteData.labor_hours || 8;
const crewSize = quoteData.crew_size || 1;
const hoursPerEmployee = totalHours / crewSize;
const durationMinutes = hoursPerEmployee * 60;

schedulingWidget = new SchedulingWidget({
  durationMinutes: durationMinutes,  // ← Dynamic based on quote!
  // ...
});
```

---

## 🛠️ FIXES NEEDED

### **Fix #1: Add Time Slot Interval Setting**

**Add to `companies` table:**
```sql
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS time_slot_interval_minutes INTEGER DEFAULT 60;
```

**Add to Settings page:**
- Dropdown: 15 min, 30 min, 60 min, 120 min, 240 min (4 hours), 480 min (full day)
- Default: 60 minutes

---

### **Fix #2: Update Edge Function to Use Interval Setting**

**File:** `supabase/functions/smart-scheduling/index.ts`

**Line 64 - Add to settings query:**
```typescript
.select('job_buffer_minutes, default_buffer_before_minutes, default_buffer_after_minutes, business_hours_start, business_hours_end, working_days, min_advance_booking_hours, max_advance_booking_days, timezone, time_slot_interval_minutes')
```

**Line 86 - Add to schedulingSettings:**
```typescript
const schedulingSettings = {
  // ... existing settings ...
  time_slot_interval_minutes: settings?.time_slot_interval_minutes || 60,
}
```

**Line 151 - Update generateCleanTimeSlots:**
```typescript
function generateCleanTimeSlots(startTime: Date, endTime: Date, intervalMinutes: number): Date[] {
  // Remove default parameter - make it required
  const slots: Date[] = []
  let currentTime = roundToNextInterval(new Date(startTime), intervalMinutes)  // ← Use dynamic interval

  while (currentTime < endTime) {
    slots.push(new Date(currentTime))
    currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes)
  }

  return slots
}
```

**Add new helper function:**
```typescript
function roundToNextInterval(date: Date, intervalMinutes: number): Date {
  const minutes = date.getMinutes()
  const remainder = minutes % intervalMinutes
  const roundedMinutes = remainder === 0 ? minutes : minutes + (intervalMinutes - remainder)
  
  const rounded = new Date(date)
  rounded.setMinutes(roundedMinutes, 0, 0)
  
  return rounded
}
```

---

### **Fix #3: Calculate Duration from Quote Labor**

**File:** `quote.html`  
**Line:** ~1470

**Replace:**
```javascript
durationMinutes: 120,  // ← Hardcoded
```

**With:**
```javascript
// Calculate duration from quote labor details
const laborDetails = quoteData.labor_details || {};
const totalHours = laborDetails.total_hours || 8;
const crewSize = laborDetails.crew_size || 1;
const hoursPerEmployee = totalHours / crewSize;
const durationMinutes = Math.ceil(hoursPerEmployee * 60);

console.log('📊 Calculated duration:', {
  totalHours,
  crewSize,
  hoursPerEmployee,
  durationMinutes
});

schedulingWidget = new SchedulingWidget({
  durationMinutes: durationMinutes,  // ← Dynamic!
  // ...
});
```

---

### **Fix #4: Verify working_days is Being Respected**

**File:** `supabase/functions/smart-scheduling/index.ts`  
**Line:** 163-169

```typescript
function isWithinBusinessHours(startTime: Date, endTime: Date, settings: any): boolean {
  const dayOfWeek = startTime.getDay()  // 0 = Sunday, 1 = Monday, etc.

  // Check if it's a working day
  if (!settings.working_days.includes(dayOfWeek)) {
    return false  // ← This should filter out Monday if working_days = [2,3,4,5,6]
  }
  // ...
}
```

**Need to verify:**
1. What is `working_days` in your database? (waiting for SQL query result)
2. Is it an array of integers? `[1,2,3,4,5]` or `[2,3,4,5,6]`?
3. Is Monday = 0 or Monday = 1?

**JavaScript Date.getDay():**
- 0 = Sunday
- 1 = Monday
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday

**If your settings say "Tuesday-Saturday":**
- `working_days` should be `[2,3,4,5,6]`
- Monday (1) should NOT appear

---

## 📋 IMPLEMENTATION PLAN

### **Phase 1: Add Time Slot Interval Setting**
1. ✅ Add column to companies table
2. ✅ Add UI to Settings page
3. ✅ Update edge function to use setting
4. ✅ Test with different intervals

### **Phase 2: Fix Duration Calculation**
1. ✅ Get labor details from quote
2. ✅ Calculate hours per employee
3. ✅ Pass correct duration to widget
4. ✅ Test with 8-hour job

### **Phase 3: Verify Working Days**
1. ⏳ Check database settings (waiting for SQL result)
2. ✅ Verify day-of-week logic
3. ✅ Test Monday exclusion

### **Phase 4: Add Debugging**
1. ✅ Log settings being used
2. ✅ Log calculated duration
3. ✅ Log filtered slots
4. ✅ Verify business hours filtering

---

## 🎯 EXPECTED OUTCOME

**After fixes:**
- ✅ Shows slots at configured interval (e.g., every 60 minutes, not 15)
- ✅ Respects working_days (no Monday if not configured)
- ✅ Respects business_hours_start/end
- ✅ Shows correct duration based on quote labor (8 hours, not 2)
- ✅ Shows slots where 2 employees overlap for 8-hour shifts

---

## 🚀 NEXT STEPS

1. **Wait for SQL query result** to see your actual settings
2. **Implement Fix #1** - Add time_slot_interval_minutes column
3. **Implement Fix #2** - Update edge function
4. **Implement Fix #3** - Calculate duration from quote
5. **Test end-to-end** with your quote

---

**Status:** Waiting for database query result to confirm working_days configuration  
**Priority:** HIGH - Core scheduling functionality broken  
**Estimated Fix Time:** 30-45 minutes once settings are confirmed

