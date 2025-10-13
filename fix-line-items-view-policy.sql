-- Fix: Allow anonymous users to view line items for sent, approved, or rejected quotes

DROP POLICY IF EXISTS "anon_view_line_items_for_quotes" ON work_order_line_items;

CREATE POLICY "anon_view_line_items_for_quotes"
ON work_order_line_items
FOR SELECT
TO anon
USING (
  -- Allow viewing line items for quotes that are sent, approved, or rejected
  EXISTS (
    SELECT 1 
    FROM work_orders 
    WHERE work_orders.id = work_order_line_items.work_order_id
    AND work_orders.status IN ('sent', 'approved', 'rejected')
  )
);

-- Verify the policy
SELECT policyname, roles::text[], cmd 
FROM pg_policies 
WHERE tablename = 'work_order_line_items' 
AND policyname = 'anon_view_line_items_for_quotes';

-- Test it
SET ROLE anon;
SELECT COUNT(*) as line_item_count
FROM work_order_line_items 
WHERE work_order_id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';
RESET ROLE;

