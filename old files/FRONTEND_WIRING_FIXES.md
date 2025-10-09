# 🔧 Frontend Wiring Fixes - Backend Schema Alignment

**Issue:** Frontend code still using old field names that don't exist in current database  
**Root Cause:** Database was updated but frontend code wasn't aligned  
**Solution:** Update frontend field references to match actual database schema

---

## 🚨 Critical Field Mismatches Found

### work_orders Table Issues
```javascript
// ❌ BROKEN - These fields don't exist in your database:
'quote_status=in.(DRAFT,SENT,ACCEPTED)'  // No quote_status field
'job_status=in.(SCHEDULED,IN_PROGRESS)'  // No job_status field  
'stage=eq.QUOTE'                         // No stage field

// ✅ CORRECT - Use the actual field:
'status=in.(DRAFT,SENT,ACCEPTED)'        // Single status field exists
```

### Other Field Issues
```javascript
// ❌ BROKEN:
'start_time=gte.2025-01-01'             // No start_time field
'active=eq.true'                        // No active field in users

// ✅ CORRECT:
'created_at=gte.2025-01-01'             // Use created_at
'status=eq.ACTIVE'                      // Use status field
```

---

## 📋 Files That Need Fixing

### 1. src/pages/Quotes_clean.js
**Lines 186, 211, 494:**
```javascript
// ❌ BROKEN:
'work_orders?...&quote_status=in.(DRAFT,SENT,ACCEPTED)'
'work_orders?...&job_status=in.(DRAFT,SCHEDULED)'
body: JSON.stringify({ quote_status: 'ACCEPTED' })

// ✅ FIX TO:
'work_orders?...&status=in.(DRAFT,SENT,ACCEPTED)'
'work_orders?...&status=in.(DRAFT,SCHEDULED)'
body: JSON.stringify({ status: 'ACCEPTED' })
```

### 2. src/pages/Customers.js  
**Line 1756:**
```javascript
// ❌ BROKEN:
'work_orders?...&job_status=in.(DRAFT,SCHEDULED,IN_PROGRESS,COMPLETED,CANCELLED)'

// ✅ FIX TO:
'work_orders?...&status=in.(DRAFT,SCHEDULED,IN_PROGRESS,COMPLETED,CANCELLED)'
```

### 3. src/pages/AwaitingInvoice.js
**Line 22:**
```javascript
// ❌ BROKEN:
'work_orders?job_status=eq.COMPLETED&invoice_id=is.null'

// ✅ FIX TO:
'work_orders?status=eq.COMPLETED&invoice_id=is.null'
```

### 4. src/utils/supaFetch.js
**Lines 81-82:** Update the error message
```javascript
// ❌ BROKEN error message:
- For quotes: work_orders?quote_status=in.(DRAFT,SENT,ACCEPTED,REJECTED,EXPIRED,DECLINED)
- For jobs: work_orders?job_status=in.(DRAFT,SCHEDULED,IN_PROGRESS,COMPLETED,CANCELLED)

// ✅ FIX TO:
- For quotes: work_orders?status=in.(DRAFT,SENT,ACCEPTED,REJECTED,EXPIRED,DECLINED)
- For jobs: work_orders?status=in.(DRAFT,SCHEDULED,IN_PROGRESS,COMPLETED,CANCELLED)
```

---

## 🎯 Quick Fix Strategy

### Option 1: Manual Updates (Recommended)
Update each file individually to ensure accuracy:

1. **Quotes_clean.js** - Replace `quote_status` and `job_status` with `status`
2. **Customers.js** - Replace `job_status` with `status`  
3. **AwaitingInvoice.js** - Replace `job_status` with `status`
4. **supaFetch.js** - Update error messages

### Option 2: Global Find/Replace (Faster but riskier)
```bash
# In src/ directory:
find . -name "*.js" -exec sed -i 's/quote_status=/status=/g' {} \;
find . -name "*.js" -exec sed -i 's/job_status=/status=/g' {} \;
find . -name "*.js" -exec sed -i 's/stage=eq\./status=eq./g' {} \;
```

---

## 🔍 How to Verify Fixes

### 1. Check Database Schema
Your database actually has:
```sql
-- work_orders table has:
status work_order_status_enum  -- Single status field
created_at timestamptz         -- Not start_time
updated_at timestamptz

-- users table has:  
status user_status_enum        -- Not active boolean
```

### 2. Test Queries
After fixes, these should work:
```javascript
// Quotes:
supaFetch('work_orders?status=in.(DRAFT,SENT,ACCEPTED)&order=created_at.desc')

// Jobs:  
supaFetch('work_orders?status=in.(SCHEDULED,IN_PROGRESS,COMPLETED)&order=created_at.desc')

// Users:
supaFetch('users?status=eq.ACTIVE&order=created_at.desc')
```

---

## 🚀 Expected Results After Fixes

### ✅ What Should Work:
- **Quotes page** loads without 403/400 errors
- **Jobs/Work Orders** display properly  
- **Customer page** shows related jobs
- **Dashboard** KPIs calculate correctly
- **Invoicing** flows work end-to-end

### ✅ Performance Improvements:
- Faster page loads (no failed queries)
- Cleaner error logs
- Proper data filtering and sorting

---

## 📋 Implementation Checklist

- [ ] Fix Quotes_clean.js field references
- [ ] Fix Customers.js job queries  
- [ ] Fix AwaitingInvoice.js status field
- [ ] Update supaFetch.js error messages
- [ ] Test quotes page functionality
- [ ] Test jobs/work orders page
- [ ] Test customer relationships
- [ ] Verify dashboard loads cleanly
- [ ] Check browser console for remaining errors

---

## 🎯 Priority Order

1. **CRITICAL:** Fix Quotes_clean.js (most field mismatches)
2. **HIGH:** Fix Customers.js (affects customer workflows)  
3. **MEDIUM:** Fix AwaitingInvoice.js (affects invoicing)
4. **LOW:** Update supaFetch.js error messages (cosmetic)

Once these 4 files are fixed, your frontend should be properly wired to your backend! 🎉
