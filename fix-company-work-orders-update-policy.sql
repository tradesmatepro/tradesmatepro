-- Fix: The company_work_orders_update policy is blocking anon users
-- because user_company_id() returns NULL for anon users

-- Drop and recreate the company_work_orders_update policy to exclude anon role
DROP POLICY IF EXISTS "company_work_orders_update" ON work_orders;

CREATE POLICY "company_work_orders_update"
ON work_orders
FOR UPDATE
TO authenticated  -- Changed from 'public' to 'authenticated' to exclude anon
USING (
  company_id = user_company_id()
)
WITH CHECK (
  company_id = user_company_id()
);

-- Verify the policies
SELECT 
  policyname,
  roles,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies 
WHERE tablename = 'work_orders'
AND cmd = 'UPDATE'
ORDER BY policyname;

-- Test as anon user
SET ROLE anon;
UPDATE work_orders 
SET status = 'approved', approved_at = NOW(), customer_approved_at = NOW()
WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a'
RETURNING id, status, approved_at IS NOT NULL as has_approved_at;
RESET ROLE;

-- Verify it worked
SELECT id, status, approved_at IS NOT NULL as approved 
FROM work_orders 
WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';

