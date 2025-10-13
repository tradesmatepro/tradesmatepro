-- Fix RLS policy for anonymous quote approval/rejection

-- Drop existing policy
DROP POLICY IF EXISTS "anon_update_sent_quotes" ON work_orders;

-- Create new policy that allows anonymous users to approve/reject sent quotes
-- and update related timestamp columns
CREATE POLICY "anon_update_sent_quotes"
ON work_orders
FOR UPDATE
TO anon
USING (
  -- Can only update quotes that are currently 'sent'
  status = 'sent'
)
WITH CHECK (
  -- Can only change status to 'approved' or 'rejected'
  status IN ('approved', 'rejected')
);

-- Verify the policy
SELECT 
  policyname, 
  cmd, 
  qual as using_clause,
  with_check 
FROM pg_policies 
WHERE tablename = 'work_orders' 
AND policyname = 'anon_update_sent_quotes';

