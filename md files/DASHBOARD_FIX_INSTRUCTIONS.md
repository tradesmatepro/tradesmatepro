# Dashboard Schema Fix Instructions

## Problem
The dashboard is showing 400 errors because:
1. The `expenses` table doesn't have a `status` column that the frontend is trying to query
2. There might be missing data in the `employee_timesheets` table

## Quick Fix (Run in Supabase SQL Editor)

```sql
-- 1. Add missing status column to expenses table
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed'));

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date);

-- 3. Update existing expenses to have a status
UPDATE public.expenses 
SET status = 'pending' 
WHERE status IS NULL;
```

## Complete Fix
Run the full SQL script: `fix_dashboard_schema_issues.sql`

This will:
- Add the missing `status` column to expenses
- Ensure all required columns exist in employee_timesheets
- Create proper indexes for performance
- Set up RLS policies
- Optionally create sample data for testing

## After Running the SQL

1. Refresh your browser
2. The dashboard should load without 400 errors
3. You should see sample data if your tables were empty

## Verification

Check that these queries work in Supabase SQL editor:

```sql
-- Should return expenses with status
SELECT id, amount, date, description, status 
FROM expenses 
LIMIT 5;

-- Should return timesheets
SELECT id, work_date, status, total_hours, updated_at 
FROM employee_timesheets 
LIMIT 5;
```

## Frontend Changes Made

- Updated MyDashboard.js to remove the status filter from expenses query (line 58)
- The query now gets all recent expenses instead of just pending ones
- Added better error handling for empty arrays

## Next Steps

1. Run the SQL fix
2. Test the dashboard
3. If you want to customize the expense statuses, you can modify the CHECK constraint
4. Consider adding more sample data if needed for testing

The dashboard should now load properly without 400 errors!
