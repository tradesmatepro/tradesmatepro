# 🔍 SCHEMA ISSUES FOUND - Root Cause Analysis

**Date:** October 5, 2025

---

## 🎯 ROOT CAUSE: Case Mismatch Between Frontend and Database

### **Database Schema (CORRECT):**
- ✅ All status enums are **lowercase**: `draft`, `sent`, `scheduled`, `in_progress`, `completed`, `on_hold`, `invoiced`, `paid`, `closed`, `cancelled`
- ✅ employee_timesheets does NOT have `company_id` column (filters through employees relationship)
- ✅ employee_timesheets uses `work_order_id`, `date`, `break_duration` (not job_id, work_date, break_minutes)
- ❌ employee_time_off table DOES NOT EXIST (PTO feature not implemented)

### **Frontend Code (INCORRECT):**
- ❌ Many pages use **UPPERCASE** status values: `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `INVOICED`
- ❌ Timesheets.js tries to insert `company_id` into employee_timesheets
- ❌ Timesheets.js uses wrong column names: `job_id`, `work_date`, `break_minutes`
- ❌ Timesheets.js tries to use employee_time_off table that doesn't exist

---

## 🔴 CRITICAL ISSUES TO FIX

### **ISSUE #1: Work Orders Page - Case Mismatch** 🔴🔴🔴

**File:** `src/pages/WorkOrders.js`  
**Line:** 183

**Problem:**
```javascript
status=in.(SCHEDULED,IN_PROGRESS,COMPLETED,INVOICED)
```

**Should be:**
```javascript
status=in.(scheduled,in_progress,completed,invoiced,on_hold)
```

**Impact:** Work orders don't display because query filters them out!

---

### **ISSUE #2: Timesheets Page - Schema Mismatch** 🔴🔴🔴

**File:** `src/pages/Timesheets.js`  
**Lines:** 675-698

**Problems:**
1. Tries to insert `company_id` (column doesn't exist)
2. Uses `job_id` instead of `work_order_id`
3. Uses `work_date` instead of `date`
4. Uses `break_minutes` instead of `break_duration`

**Status:** ✅ FIXED (just now)

---

### **ISSUE #3: PTO Feature - Table Missing** 🔴🔴🔴

**File:** `src/pages/Timesheets.js`  
**Lines:** 594-630, 2520

**Problem:** Code tries to use `employee_time_off` table that doesn't exist!

**Impact:** PTO feature completely broken!

**Fix Required:** Create employee_time_off table

---

### **ISSUE #4: Multiple Pages - Case Mismatch** 🔴🔴

**Files with UPPERCASE status values:**
1. `src/pages/WorkOrders.js` - Line 183
2. `src/pages/AwaitingPayment.js` - Line 22
3. `Customer Portal/src/pages/Quotes.js` - Line 40
4. `Customer Portal/src/pages/Jobs.js` - Line 51

**Fix Required:** Change all UPPERCASE to lowercase

---

### **ISSUE #5: Inventory Page - Wrong Data** 🔴

**Problem:** Page shows 39 items but database has 0!

**Possible Causes:**
1. Querying wrong table
2. Not filtering by company_id
3. Showing demo data

**Fix Required:** Check inventory page query

---

### **ISSUE #6: Payroll Page - Wrong Data** 🔴

**Problem:** Page shows employees instead of payroll runs!

**Fix Required:** Fix payroll page query

---

## 🚀 FIX PRIORITY

### **Priority 1: Fix Status Case Mismatch (30 min)**
- Fix WorkOrders.js
- Fix AwaitingPayment.js
- Fix Customer Portal pages
- Fix any other pages with UPPERCASE status

### **Priority 2: Create PTO Table (30 min)**
- Create employee_time_off table
- Add proper columns and relationships
- Add RLS policies

### **Priority 3: Fix Inventory Query (15 min)**
- Check why showing wrong data
- Fix query to show correct data

### **Priority 4: Fix Payroll Query (15 min)**
- Fix to show payroll runs, not employees

### **Priority 5: Create Test Data (1-2 hours)**
- Create realistic test data for all tables
- Test all pages display correctly

---

## 📊 ESTIMATED TIME TO FIX

| Issue | Time | Priority |
|-------|------|----------|
| Status case mismatch | 30 min | 🔴 CRITICAL |
| PTO table creation | 30 min | 🔴 CRITICAL |
| Inventory query | 15 min | 🟡 HIGH |
| Payroll query | 15 min | 🟡 HIGH |
| Create test data | 1-2 hours | 🟡 HIGH |
| **TOTAL** | **2.5-3.5 hours** | |

---

## 🎯 NEXT STEPS

1. ✅ Fix Timesheets.js schema mismatch (DONE)
2. ⏳ Fix all status case mismatches
3. ⏳ Create employee_time_off table
4. ⏳ Fix inventory query
5. ⏳ Fix payroll query
6. ⏳ Create comprehensive test data
7. ⏳ Test all pages display correctly

---

**Ready to execute fixes!** 🔧

