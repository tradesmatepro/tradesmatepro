-- Fix: Allow anonymous users to view quotes in sent, approved, or rejected status
-- This allows customers to see the quote after they approve/reject it

DROP POLICY IF EXISTS "anon_view_sent_quotes" ON work_orders;

CREATE POLICY "anon_view_sent_quotes"
ON work_orders
FOR SELECT
TO anon
USING (
  -- Allow viewing quotes that are sent, approved, or rejected
  status IN ('sent', 'approved', 'rejected')
);

-- Verify the policy
SELECT policyname, roles::text[], cmd, qual 
FROM pg_policies 
WHERE tablename = 'work_orders' 
AND policyname = 'anon_view_sent_quotes';

-- Test it
SET ROLE anon;
SELECT id, status FROM work_orders WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';
RESET ROLE;

