# How to Use DevTools and Deploy Tools - AI Quick Reference

## 🔍 CHECKING LOGS AND ERRORS

### 1. **Check logs.md for Application Errors**
```bash
# View the entire logs.md file
view logs.md

# View last 100 lines (most recent errors)
view logs.md with view_range [-100, -1]

# Search for specific errors
view logs.md with search_query_regex "400|500|ERROR|PATCH|POST"
```

**What to look for in logs.md:**
- `PATCH https://... 400 (Bad Request)` - API errors
- `📝 UPDATE QUOTE - ERROR DETAILS:` - Detailed error messages
- `console.error` - JavaScript errors
- Network request failures

### 2. **Check Browser Console Errors**
The app has automatic error capture that writes to `logs.md`. Look for:
- `console-error-capture.js:236` - Captured console errors
- `📝 UPDATE QUOTE - workOrderData full:` - Actual data being sent
- `ERROR DETAILS:` - Supabase error responses

### 3. **Check Deployment Logs**
```bash
# View recent deployment logs
ls logs/

# View specific deployment log
view logs/deploy-2025-09-30T03-21-04-345Z.json
```

---

## 🚀 DEPLOYING SQL FIXES

### **Tool: execute-sql.js**
Use this for deploying individual SQL files with automatic error handling.

**Command:**
```bash
node execute-sql.js <path-to-sql-file>
```

**Example:**
```bash
node execute-sql.js sql_fixes/FIX_QUOTE_STATUS_VALIDATION.sql
```

**What it does:**
1. Connects to Supabase database using .env credentials
2. Reads the SQL file
3. Executes the SQL
4. Shows success/error messages
5. Displays query results if any

**Common Errors and Fixes:**

#### Error: "invalid input value for enum"
**Problem:** SQL references enum values that don't exist in database
**Fix:** Check actual enum values first:
```bash
# Check what enum values actually exist
Get-Content "schemapull.txt" | Select-String -Pattern '"enum_name": "work_order_status_enum"' -Context 0,1
```

#### Error: "cannot change name of input parameter"
**Problem:** Function already exists with different parameter names
**Fix:** Add `DROP FUNCTION IF EXISTS` before `CREATE OR REPLACE FUNCTION`:
```sql
DROP FUNCTION IF EXISTS function_name(param_type1, param_type2);
CREATE OR REPLACE FUNCTION function_name(new_param_name1 param_type1, ...) ...
```

#### Error: "function does not exist"
**Problem:** Function signature doesn't match (wrong parameter types)
**Fix:** Check exact function signature in database and match it exactly

---

## 🔧 USING ENHANCED DEPLOYER (deploy-enhanced.js)

### **For Full Phase Deployments**
```bash
# Deploy Phase 1 (Core FSM)
node deploy-enhanced.js --phase=1

# Deploy all phases
node deploy-enhanced.js --phase=all

# Verify only (don't deploy)
node deploy-enhanced.js --phase=1 --verify-only

# Pull current schema
node deploy-enhanced.js --pull-schema

# Full database introspection
node deploy-enhanced.js --introspect
```

**What it does:**
- Deploys SQL in correct order: enums → tables → columns → constraints → indexes → functions → triggers → views → seeds
- Automatic retry on failures
- Comprehensive JSON logging to `logs/` directory
- Error capture to `error_logs/` directory

**When to use:**
- Deploying complete schema phases
- Major database structure changes
- Need automatic retry and logging

**When NOT to use:**
- Single SQL file fixes (use `execute-sql.js` instead)
- Quick function updates
- Testing SQL snippets

---

## 📊 CHECKING DATABASE SCHEMA

### **Check Actual Database Schema**
```bash
# View current schema pull
view schemapull.txt

# Check specific table columns
Get-Content "schemapull.txt" | Select-String -Pattern '"table_name":"work_orders"' -Context 0,50

# Check enum values
Get-Content "schemapull.txt" | Select-String -Pattern '"enum_name": "work_order_status_enum"' -Context 0,1
```

### **Common Schema Checks**

#### Check if table exists:
```bash
Get-Content "schemapull.txt" | Select-String -Pattern '"table_name":"customers"'
```

#### Check table columns:
```bash
Get-Content "schemapull.txt" | Select-String -Pattern '"table_name":"work_orders"' -Context 0,100 | Select-String -Pattern '"column_name"'
```

#### Check if column exists:
```bash
Get-Content "schemapull.txt" | Select-String -Pattern '"column_name":"labor_summary"'
```

---

## 🐛 DEBUGGING WORKFLOW

### **Step 1: Reproduce the Error**
1. User reports issue (e.g., "quote won't save")
2. Ask user to try again and check `logs.md`
3. View the last 100 lines of logs.md

### **Step 2: Identify Root Cause**
Look for:
- **400 errors** → Bad request (invalid data or missing fields)
- **404 errors** → Table/endpoint doesn't exist
- **500 errors** → Server/database error
- **Trigger errors** → Database trigger rejecting the operation

### **Step 3: Check What Data is Being Sent**
Look for log entries like:
```
📝 UPDATE QUOTE - workOrderData full: {
  "title": "hvac install test",
  "customer_id": "...",
  "labor_summary": null  ← This field might not exist!
}
```

### **Step 4: Verify Database Schema**
```bash
# Check if the field exists in the actual database
Get-Content "schemapull.txt" | Select-String -Pattern '"column_name":"labor_summary"'
```

### **Step 5: Fix the Issue**
- **If field doesn't exist:** Remove it from the code OR add it to database
- **If trigger is blocking:** Fix the trigger logic
- **If enum value is wrong:** Use correct enum value from schema

### **Step 6: Deploy the Fix**
```bash
# For SQL fixes
node execute-sql.js sql_fixes/YOUR_FIX.sql

# For code fixes
# Just save the file - React will hot reload
```

### **Step 7: Test**
1. Hard refresh browser (Ctrl+Shift+R)
2. Try the operation again
3. Check logs.md for success

---

## 🎯 COMMON ISSUES AND SOLUTIONS

### Issue: "Invalid status transition from X to X"
**Root Cause:** Database trigger validation function doesn't handle the status
**Fix:** Update `validate_work_order_status_transition()` function to:
1. Allow same-status updates (X → X should return TRUE)
2. Add the status to the CASE statement

### Issue: "Column does not exist"
**Root Cause:** Code references a column that's not in the database
**Fix:** Either:
1. Remove the field from the code, OR
2. Add the column to the database with ALTER TABLE

### Issue: "Cannot read property 'name' of undefined"
**Root Cause:** Frontend expects data that's not being loaded
**Fix:** Check the data loading query and ensure proper joins

### Issue: "RLS policy violation"
**Root Cause:** Row Level Security blocking the operation
**Fix:** Check RLS policies on the table and ensure user has proper permissions

---

## 📝 BEST PRACTICES

1. **Always check logs.md first** - It has the actual error messages
2. **Verify schema before coding** - Check schemapull.txt for actual columns/tables
3. **Use execute-sql.js for single files** - Faster than full deployer
4. **Test in browser after changes** - Hard refresh to clear cache
5. **Check enum values** - Don't assume, verify actual values in database
6. **Read error messages carefully** - They usually tell you exactly what's wrong
7. **Use the fix loop** - Deploy → Test → Check logs → Fix → Repeat

---

## 🔗 RELATED FILES

- `logs.md` - Application runtime logs and errors
- `schemapull.txt` - Current database schema (JSON)
- `execute-sql.js` - Single SQL file executor
- `deploy-enhanced.js` - Full phase deployer
- `sql_fixes/` - Directory for SQL fix files
- `logs/` - Deployment logs
- `error_logs/` - Error capture logs

---

## 💡 TIPS FOR AI

- **Don't guess** - Always check schemapull.txt for actual schema
- **Read logs first** - The error message tells you what's wrong
- **Use the tools** - execute-sql.js has built-in error handling
- **Test incrementally** - Deploy small fixes, test, then continue
- **Check enum values** - They're case-sensitive and specific
- **Hard refresh matters** - React cache can hide fixes

