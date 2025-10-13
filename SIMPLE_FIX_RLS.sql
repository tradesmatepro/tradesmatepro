-- Simple fix: Allow anonymous users to update sent quotes to any status
-- (We'll validate the status change in the application layer)

DROP POLICY IF EXISTS "anon_update_sent_quotes" ON work_orders;

CREATE POLICY "anon_update_sent_quotes"
ON work_orders
FOR UPDATE
TO anon
USING (
  -- Can only update quotes that are currently 'sent'
  status = 'sent'
)
WITH CHECK (
  -- Allow any update (validation happens in app)
  true
);

