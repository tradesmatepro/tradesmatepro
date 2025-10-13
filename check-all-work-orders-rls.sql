-- Check ALL RLS policies on work_orders table

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies 
WHERE tablename = 'work_orders'
ORDER BY policyname;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'work_orders';

-- Try to see what's blocking the update
-- Test as anon user
SET ROLE anon;

-- Show current user
SELECT current_user, session_user;

-- Try the update with verbose error
\set ON_ERROR_STOP off
UPDATE work_orders 
SET 
  status = 'approved',
  approved_at = NOW(),
  customer_approved_at = NOW()
WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a'
RETURNING id, status, approved_at;

RESET ROLE;

