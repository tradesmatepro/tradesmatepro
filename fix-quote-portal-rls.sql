-- Fix RLS policies for quote portal
-- Allow anonymous users to view and update quotes with status 'sent'

-- Drop existing anon policies if they exist
DROP POLICY IF EXISTS "anon_view_sent_quotes" ON work_orders;
DROP POLICY IF EXISTS "anon_update_sent_quotes" ON work_orders;

-- Allow anonymous users to SELECT quotes with status 'sent'
CREATE POLICY "anon_view_sent_quotes"
ON work_orders
FOR SELECT
TO anon
USING (status = 'sent');

-- Allow anonymous users to UPDATE quotes from 'sent' to 'approved' or 'rejected'
CREATE POLICY "anon_update_sent_quotes"
ON work_orders
FOR UPDATE
TO anon
USING (status = 'sent')
WITH CHECK (status IN ('approved', 'rejected'));

-- Also need to allow anon users to view customers and companies for the quote display
DROP POLICY IF EXISTS "anon_view_customers_for_quotes" ON customers;
DROP POLICY IF EXISTS "anon_view_companies_for_quotes" ON companies;

CREATE POLICY "anon_view_customers_for_quotes"
ON customers
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM work_orders 
    WHERE work_orders.customer_id = customers.id 
    AND work_orders.status = 'sent'
  )
);

CREATE POLICY "anon_view_companies_for_quotes"
ON companies
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM work_orders 
    WHERE work_orders.company_id = companies.id 
    AND work_orders.status = 'sent'
  )
);

-- Allow anon users to view line items for sent quotes
DROP POLICY IF EXISTS "anon_view_line_items_for_quotes" ON work_order_line_items;

CREATE POLICY "anon_view_line_items_for_quotes"
ON work_order_line_items
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM work_orders 
    WHERE work_orders.id = work_order_line_items.work_order_id 
    AND work_orders.status = 'sent'
  )
);

