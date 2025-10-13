-- COMPREHENSIVE FIX: Remove all anon policies and recreate them properly

-- 1. Drop ALL existing anon policies on work_orders
DROP POLICY IF EXISTS "anon_view_sent_quotes" ON work_orders;
DROP POLICY IF EXISTS "anon_update_sent_quotes" ON work_orders;
DROP POLICY IF EXISTS "anon_insert_quotes" ON work_orders;
DROP POLICY IF EXISTS "anon_delete_quotes" ON work_orders;

-- 2. Create SELECT policy (view sent quotes)
CREATE POLICY "anon_view_sent_quotes"
ON work_orders
FOR SELECT
TO anon
USING (
  status = 'sent'
);

-- 3. Create UPDATE policy (approve/reject sent quotes)
CREATE POLICY "anon_update_sent_quotes"
ON work_orders
FOR UPDATE
TO anon
USING (
  -- Can only update quotes that are currently 'sent'
  status = 'sent'
)
WITH CHECK (
  -- Allow the update (no restrictions on new values)
  true
);

-- 4. Verify policies were created
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies 
WHERE tablename = 'work_orders'
AND roles @> ARRAY['anon']::name[]
ORDER BY policyname;

-- 5. Test the update as anon
SET ROLE anon;
SELECT current_user;

UPDATE work_orders 
SET 
  status = 'approved',
  approved_at = NOW(),
  customer_approved_at = NOW()
WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a'
RETURNING id, status, approved_at IS NOT NULL as has_approved_at;

RESET ROLE;

-- 6. Verify the update worked
SELECT id, status, approved_at, customer_approved_at 
FROM work_orders 
WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';

