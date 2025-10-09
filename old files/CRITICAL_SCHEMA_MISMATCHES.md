# 🚨 CRITICAL SCHEMA MISMATCHES - Beta Blocker Issues

**Focus**: Table/column mismatches breaking functionality (not security)  
**Priority**: Fix fake tables/columns that don't match industry standards

---

## 🎯 **BETA-BLOCKING ISSUES IDENTIFIED**

### **1. ❌ CRITICAL: `user_profiles` View Missing**

**Location**: `src/pages/Employees.js:255`
```javascript
// BROKEN: Frontend expects this view but it doesn't exist
const response = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?company_id=eq.${user.company_id}&select=*&order=created_at.desc`
```

**Impact**: **Employee management completely broken** - can't load employee list

**Industry Standard**: Jobber/ServiceTitan query `users` + `profiles` tables separately

**Fix Options**:
```sql
-- Option A: Create the missing view (QUICK FIX)
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    u.id as user_id,
    u.auth_user_id,
    u.company_id,
    u.role,
    u.status,
    u.created_at,
    u.updated_at,
    p.first_name,
    p.last_name,
    p.first_name || ' ' || p.last_name as full_name,
    p.phone,
    p.avatar_url,
    p.preferences,
    COALESCE(
        (SELECT email FROM auth.users WHERE id = u.auth_user_id),
        p.first_name || '.' || p.last_name || '@company.local'
    ) as email
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id;
```

```javascript
// Option B: Fix frontend to use industry standard (BETTER)
// Replace single user_profiles query with proper pattern
const { data: businessUsers } = await supabase
  .from('users')
  .select('id,company_id,role,status,created_at,updated_at')
  .eq('company_id', user.company_id);

const { data: profiles } = await supabase
  .from('profiles')
  .select('user_id,first_name,last_name,phone,avatar_url')
  .in('user_id', businessUsers.map(u => u.id));

// Combine data client-side
const employees = businessUsers.map(user => {
  const profile = profiles.find(p => p.user_id === user.id);
  return {
    ...user,
    ...profile,
    full_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : ''
  };
});
```

---

### **2. ❌ CRITICAL: Legacy Table References**

**Location**: `src/utils/supaFetch.js:23-25`
```javascript
// BROKEN: These tables don't exist anymore
'quotes_v',           // Legacy view
'jobs_v',             // Legacy view  
'quotes_compat_v',    // Compatibility view
'quote_items_compat_v' // Compatibility view
```

**Impact**: **Quotes/Jobs pages may fail** if they try to use legacy tables

**Industry Standard**: ServiceTitan uses unified `work_orders` table for all job types

**Fix**: Remove legacy references, keep only current tables:
```javascript
const SCOPE_TABLES = new Set([
  'users',
  'customers',
  'work_orders',        // ✅ Current unified table
  'work_order_items',   // ✅ Current items table
  'work_order_milestones',
  'work_order_labor',
  // Remove all legacy references
]);
```

---

### **3. ❌ CRITICAL: Column Name Mismatches**

**Problem**: Frontend assumes columns that don't exist in industry-standard schema

#### **3.1 `full_name` Column Assumption**
```javascript
// BROKEN: Assumes full_name column exists
.select('id, email, full_name, role, company_id')
```

**Fix**: Compute full_name client-side or in view:
```javascript
// Industry standard approach
.select('id, email, first_name, last_name, role, company_id')
// Then compute: full_name = `${first_name} ${last_name}`.trim()
```

#### **3.2 Status Enum Mismatches**
```javascript
// POTENTIALLY BROKEN: May not match actual enum values
.eq('status', 'active')  // Database might use 'ACTIVE' or different values
```

**Fix**: Check actual enum values in database schema

---

### **4. ❌ MEDIUM: Mixed Authentication Patterns**

**Location**: `src/contexts/UserContext.js` (recently fixed, but verify)

**Issue**: Frontend was using bandaid `user_profiles` view instead of industry standard

**Status**: ✅ **RECENTLY FIXED** - Now uses proper auth.users → users → profiles pattern

---

## 🔧 **IMMEDIATE FIXES NEEDED**

### **Fix 1: Create Missing `user_profiles` View (5 minutes)**

```sql
-- Run this in Supabase SQL Editor
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    u.id as user_id,
    u.auth_user_id,
    u.company_id,
    u.role,
    u.status,
    u.created_at,
    u.updated_at,
    p.first_name,
    p.last_name,
    p.first_name || ' ' || p.last_name as full_name,
    p.phone,
    p.avatar_url,
    p.preferences,
    COALESCE(
        (SELECT email FROM auth.users WHERE id = u.auth_user_id),
        p.first_name || '.' || p.last_name || '@company.local'
    ) as email
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id;
```

### **Fix 2: Clean Up Legacy Table References (2 minutes)**

Update `src/utils/supaFetch.js`:
```javascript
// Remove these lines:
'quotes_v', 'jobs_v', 'quotes_compat_v', 'quote_items_compat_v',

// Keep only current industry-standard tables
```

### **Fix 3: Validate Column Names (10 minutes)**

Check these files for column assumptions:
- `src/pages/Employees.js` - Check `full_name`, `status` values
- `src/components/QuotesDatabasePanel.js` - Check work_orders columns
- `src/components/JobsDatabasePanel.js` - Check work_orders columns

---

## 🎯 **BETA SUCCESS CRITERIA**

After fixes:
- [ ] Employee page loads without errors
- [ ] Can view employee list
- [ ] Quotes page works
- [ ] Jobs page works  
- [ ] No 400/404 errors from missing tables
- [ ] All CRUD operations work

---

## 📋 **QUICK FIX SCRIPT**

I'll create an automated script to fix these issues:

1. **Create missing `user_profiles` view**
2. **Clean up legacy table references**
3. **Validate column names against schema**
4. **Test critical pages work**

**Estimated Time**: 15 minutes to fix all beta-blocking issues

---

**Ready to run the automated fixes?** This will get your beta working with proper industry-standard database patterns like Jobber/ServiceTitan.
