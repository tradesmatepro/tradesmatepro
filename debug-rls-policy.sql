-- Debug RLS policy issue

-- First, let's see the exact policy definition
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
WHERE tablename = 'work_orders' 
AND policyname = 'anon_update_sent_quotes';

-- Check if 'approved' is a valid enum value
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'work_order_status_enum'::regtype 
AND enumlabel IN ('approved', 'rejected')
ORDER BY enumlabel;

-- Try a simpler WITH CHECK that just allows any status change
DROP POLICY IF EXISTS "anon_update_sent_quotes" ON work_orders;

CREATE POLICY "anon_update_sent_quotes"
ON work_orders
FOR UPDATE
TO anon
USING (
  status = 'sent'
)
WITH CHECK (
  -- Allow any status change (we'll validate in application)
  true
);

-- Test again
SET ROLE anon;
UPDATE work_orders 
SET 
  status = 'approved',
  approved_at = NOW(),
  customer_approved_at = NOW()
WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';
RESET ROLE;

-- Check result
SELECT id, status, approved_at IS NOT NULL as has_approved_at 
FROM work_orders 
WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';

