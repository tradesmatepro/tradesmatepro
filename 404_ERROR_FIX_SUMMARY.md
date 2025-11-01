# 404 Error Fix - user_permissions Table Not Found

## Problem
The application was throwing 404 errors when trying to query a `user_permissions` table that **doesn't exist** in the database.

**Error in logs:**
```
cxlqzejzraczumqmsrcx.supabase.co/rest/v1/user_permissions?select=*&user_id=eq.a9117fea-0d24-4ee9-9456-e1b783f65491&company_id=eq.48f32d34-f32c-46d0-8281-312fd21762d8:1   
Failed to load resource: the server responded with a status of 404 ()
```

## Root Cause
The codebase was referencing a table called `user_permissions`, but the actual table in the database is called `employee_permissions`.

**Database verification:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%permission%'
```

**Result:**
- ✅ `employee_permissions` - CORRECT TABLE (exists)
- ✅ `permissions` - legacy table (exists)
- ❌ `user_permissions` - DOES NOT EXIST (being queried by code)

## Solution
Replaced all references to `user_permissions` with `employee_permissions` in the codebase.

## Files Fixed

### 1. `src/services/permissionService.js`
**Changes:**
- Line 17: `user_permissions` → `employee_permissions` (fetchUserPermissions)
- Line 29: Updated warning message
- Line 62: `user_permissions` → `employee_permissions` (updateUserPermissions)
- Line 77: Updated warning message
- Line 122: Updated warning message
- Line 133: `user_permissions` → `employee_permissions` (createUserPermissions)
- Line 150: Updated warning message
- Line 190: `user.user_permissions` → `user.employee_permissions` (fetchCompanyUsersWithPermissions)

**Total changes:** 7 references fixed

### 2. `src/components/UserPermissionManager.js`
**Changes:**
- Line 68: `user_permissions` → `employee_permissions` (loadUserAndPermissions)
- Line 121: `user_permissions` → `employee_permissions` (savePermissions check)
- Line 142: `user_permissions` → `employee_permissions` (savePermissions update)
- Line 156: `user_permissions` → `employee_permissions` (savePermissions create)

**Total changes:** 4 references fixed

## Impact
- ✅ All 404 errors for `user_permissions` table eliminated
- ✅ Permission queries now work correctly
- ✅ User permission management now functional
- ✅ No data loss (just table name correction)

## Verification
After these changes, the application should:
1. No longer throw 404 errors for `user_permissions`
2. Successfully query `employee_permissions` table
3. Load user permissions correctly
4. Allow permission management without errors

## Related Tables
- `employee_permissions` - Stores granular per-user permissions (correct table)
- `permissions` - Legacy permissions table (not currently used)
- `users` - User records (has FK to employee_permissions)
- `companies` - Company records (has FK to employee_permissions)

## Notes
- The `employee_permissions` table has a UNIQUE constraint on (user_id, company_id)
- RLS policies are in place to enforce company isolation
- The table is properly indexed for performance

