-- Fix: Allow anonymous users to view customers for sent, approved, or rejected quotes

DROP POLICY IF EXISTS "anon_view_customers_for_quotes" ON customers;

CREATE POLICY "anon_view_customers_for_quotes"
ON customers
FOR SELECT
TO anon
USING (
  -- Allow viewing customers who have quotes that are sent, approved, or rejected
  EXISTS (
    SELECT 1 
    FROM work_orders 
    WHERE work_orders.customer_id = customers.id
    AND work_orders.status IN ('sent', 'approved', 'rejected')
  )
);

-- Verify the policy
SELECT policyname, roles::text[], cmd 
FROM pg_policies 
WHERE tablename = 'customers' 
AND policyname = 'anon_view_customers_for_quotes';

