-- FINAL FIX: The USING clause checks the OLD row, WITH CHECK checks the NEW row
-- The issue might be that we need BOTH to pass

-- Reset the quote to 'sent' status first
UPDATE work_orders SET status = 'sent' WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';

-- Drop and recreate the anon update policy with better logic
DROP POLICY IF EXISTS "anon_update_sent_quotes" ON work_orders;

CREATE POLICY "anon_update_sent_quotes"
ON work_orders
FOR UPDATE
TO anon
USING (
  -- OLD row must be 'sent'
  status = 'sent'
)
WITH CHECK (
  -- NEW row can be 'approved' or 'rejected' OR still 'sent' (for timestamp updates)
  status IN ('sent', 'approved', 'rejected')
);

-- Test it
SET ROLE anon;
SELECT current_user, current_role;

UPDATE work_orders 
SET status = 'approved'
WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a'
RETURNING id, status;

RESET ROLE;

-- Verify
SELECT id, status FROM work_orders WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';

