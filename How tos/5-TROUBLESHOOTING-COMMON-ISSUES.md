# Troubleshooting Common Issues - How To Guide

## 🔍 Database Query Issues

### Issue: 400 Bad Request Errors
```javascript
// Symptoms: Browser console shows 400 errors from Supabase
// Example: "column customers.updated_at does not exist"

// ✅ Troubleshooting Steps:
// 1. Check what columns actually exist
const checkColumns = `
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customers' 5 – Troubleshooting Common Issues (Final Corrected Guide)

This guide ensures troubleshooting is done across the whole pipeline — not just the page where the error shows up. Claude must check forward and backward connections and always cross-reference with the baseline app.

🔑 Golden Rules

Whole Pipeline First

No page, table, or feature exists in isolation.

Always trace data flow from source → destination and back.

Baseline Reference Required

Before any changes, compare against the baseline app snapshot.

Verify what the schema, queries, and UI looked like originally.

Logs Before Fixes

Gather all console and /developer-tools logs before suggesting changes.

🔄 Forward and Backward Checks
Quotes → Jobs → Invoices

Forward check:

Quote created → must appear in work_orders as stage = "quote".

Converted to Job → same record stage changes to "job".

Job invoiced → record stage changes to "invoice".

Backward check:

Invoice must trace back to originating Job and Quote.

Workflows must not break if user starts at invoice view and looks back at quote history.

Messages (Contractor ↔ Customer)

Forward check:

Contractor sends → appears in customer_messages.

Customer portal fetch must display same message.

Backward check:

Customer replies → must sync back to contractor’s messages.

Threads must remain linked to customer_id and contractor_id.

Auth + User Roles

Forward check:

Login → session token → company filter → data limited by RLS.

Backward check:

Queries must not return rows from another company.

Confirm by running supaFetch with wrong company_id (should return 0 rows).

⚠️ Common Failure Patterns

Claude assumes wrong table

Example: creates new quotes table instead of using work_orders.

Fix: Check baseline schema → confirm expected table → repair query.

Partial Fixes Break Other Pages

Example: contractor side fixed but customer portal broken.

Fix: Always test both roles.

Skipped Schema Verification

Example: queries column that doesn’t exist (updated_at).

Fix: Run schema check first:

SELECT column_name FROM information_schema.columns WHERE table_name='work_orders';


RLS Mismatches

Example: query runs as service key but fails for anon.

Fix: Always test with sandbox anon key.

🧪 Troubleshooting Workflow

Gather logs (/developer-tools + console).

Map error into full pipeline (forward + backward).

Cross-check baseline schema/code.

Run schema verification queries in sandbox.

Apply fix in sandbox only.

Verify by:

Forward flow works (create → update → finish).

Backward flow works (lookup from end → start).

Both roles (contractor + customer) see expected results.

Only mark fixed when logs clean + forward/backward intact.

🚫 What Not to Do

❌ Don’t “fix” errors by making new tables without asking permission first. 

❌ Don’t patch only one side of communication example (contractor/customer).

❌ Don’t skip checking role-based flows.

❌ Don’t change schema/queries without comparing against baseline.

🎯 Key Principles

Troubleshooting = pipeline tracing, not isolated debugging.

Always run forward and backward tests.

Baseline app = source of truth — check before editing.


👉 With this, Claude (or I) can’t fall into bandaid mode. The process forces pipeline-first troubleshooting with baseline checks.
ORDER BY ordinal_position
`;

// 2. Test the failing query directly
const testQuery = 'customers?select=*&order=created_at.desc&limit=1';

// 3. Fix the query with correct column names
// 4. Update the component code
```

### Issue: Table/Relationship Not Found
```javascript
// Symptoms: "Could not find a relationship between 'table1' and 'table2'"
// Example: customer_messages table doesn't exist

// ✅ Troubleshooting Steps:
// 1. Check if table exists
const checkTable = `
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'customer_messages'
`;

// 2. If missing, create the table using SQL Editor
// 3. If exists, check foreign key relationships
```

## 🔧 Component Loading Issues

### Issue: Component Shows Errors/Placeholders
```javascript
// Symptoms: Component displays "Coming Soon" or error messages
// Cause: Usually missing database tables or incorrect queries

// ✅ Troubleshooting Steps:
// 1. Check browser console for specific errors
// 2. Verify all database queries work
// 3. Ensure component has proper error handling
// 4. Test with real data, not just empty tables
```

### Issue: Data Not Loading
```javascript
// Symptoms: Component loads but shows no data
// Cause: Usually RLS policies or company_id filtering

// ✅ Troubleshooting Steps:
// 1. Test query without company_id filter
const testWithoutFilter = 'customers?select=*&limit=5';

// 2. Check if data exists for the company
const testWithFilter = 'customers?select=*&company_id=eq.COMPANY_ID&limit=5';

// 3. Verify RLS policies allow access
// 4. Check supaFetch is adding company_id correctly
```

## 🚫 Authentication Issues

### Issue: Permission Denied Errors
```javascript
// Symptoms: "permission denied for schema public"
// Cause: Using wrong authentication method

// ✅ Solutions:
// 1. Use service_role key for admin operations
// 2. Use anon key for regular operations
// 3. Check RLS policies are correct
// 4. Use Supabase SQL Editor for DDL operations
```

### Issue: RLS Policy Blocks Access
```javascript
// Symptoms: Queries return empty results or permission errors
// Cause: Row Level Security policies too restrictive

// ✅ Troubleshooting:
// 1. Test with service_role key (bypasses RLS)
// 2. Check policy conditions
// 3. Verify user context (company_id, user_id)
// 4. Update policies if needed
```

## 🔄 Dev Tools Issues

### Issue: Dev Proxy Server Not Working
```javascript
// Symptoms: "Unable to connect to the remote server"
// Cause: Server not running or wrong port

// ✅ Solutions:
// 1. Start the server
node devSqlExec.js

// 2. Check it's running on correct port
// Should show: "Dev SQL Exec server running on http://127.0.0.1:4000"

// 3. Test with simple query
curl http://127.0.0.1:4000/dev/sql/exec -Method POST -Body '{"sql":"SELECT 1"}' -ContentType 'application/json'
```

### Issue: exec_sql Function Not Found
```javascript
// Symptoms: "Could not find the function public.exec_sql"
// Cause: Function doesn't exist in database

// ✅ Solutions:
// 1. Use dev proxy server instead
// 2. Or create the function in Supabase SQL Editor
// 3. Or use direct REST API calls
```

## 🎯 General Troubleshooting Workflow

### Step 1: Identify the Exact Problem
```javascript
// ✅ Get specific error messages
// ✅ Note which component/page is affected
// ✅ Check browser console for details
// ✅ Test in isolation
```

### Step 2: Understand the Architecture
```javascript
// ✅ Use codebase-retrieval to understand how it should work
// ✅ Use git-commit-retrieval to see how similar issues were fixed
// ✅ Check related components and dependencies
```

### Step 3: Test Current State
```javascript
// ✅ Create test scripts to verify current behavior
// ✅ Test database queries directly
// ✅ Check what data actually exists
// ✅ Verify authentication and permissions
```

### Step 4: Fix Root Causes
```javascript
// ✅ Fix the underlying issue, not just symptoms
// ✅ Update database schema if needed
// ✅ Fix component queries
// ✅ Update error handling
```

### Step 5: Verify Fix
```javascript
// ✅ Create comprehensive verification script
// ✅ Test all affected functionality
// ✅ Check for regressions
// ✅ Test in browser
```
