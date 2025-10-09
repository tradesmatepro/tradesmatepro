-- Fix RLS policies for employee_compensation table
-- Users should be able to view their own compensation data (read-only)

-- Enable RLS on employee_compensation table
ALTER TABLE employee_compensation ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own compensation" ON employee_compensation;

-- Policy: Users can view their own compensation data (read-only)
CREATE POLICY "Users can view own compensation"
ON employee_compensation
FOR SELECT
USING (
  auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = employee_compensation.user_id
  )
);

-- Note: No INSERT/UPDATE/DELETE policies - only admins can modify compensation
-- Admins use service role key which bypasses RLS

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'employee_compensation';

