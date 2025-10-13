-- Fix ALL company policies to use 'authenticated' instead of 'public'
-- This prevents them from applying to 'anon' users

-- Drop all company policies
DROP POLICY IF EXISTS "company_work_orders_select" ON work_orders;
DROP POLICY IF EXISTS "company_work_orders_insert" ON work_orders;
DROP POLICY IF EXISTS "company_work_orders_update" ON work_orders;
DROP POLICY IF EXISTS "company_work_orders_delete" ON work_orders;

-- Recreate with 'authenticated' role
CREATE POLICY "company_work_orders_select"
ON work_orders
FOR SELECT
TO authenticated
USING (company_id = user_company_id());

CREATE POLICY "company_work_orders_insert"
ON work_orders
FOR INSERT
TO authenticated
WITH CHECK (company_id = user_company_id());

CREATE POLICY "company_work_orders_update"
ON work_orders
FOR UPDATE
TO authenticated
USING (company_id = user_company_id())
WITH CHECK (company_id = user_company_id());

CREATE POLICY "company_work_orders_delete"
ON work_orders
FOR DELETE
TO authenticated
USING (company_id = user_company_id());

-- Verify all policies
SELECT policyname, roles::text[], cmd 
FROM pg_policies 
WHERE tablename = 'work_orders'
ORDER BY policyname;

-- Test as anon
SET ROLE anon;
UPDATE work_orders 
SET status = 'approved', approved_at = NOW(), customer_approved_at = NOW()
WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a'
RETURNING id, status;
RESET ROLE;

