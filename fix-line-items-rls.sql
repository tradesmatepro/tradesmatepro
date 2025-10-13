-- Fix RLS policies for work_order_line_items table
-- Use the same pattern as work_orders table (user_company_id() function)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert line items for their company" ON work_order_line_items;
DROP POLICY IF EXISTS "Users can update line items for their company" ON work_order_line_items;
DROP POLICY IF EXISTS "Users can delete line items for their company" ON work_order_line_items;
DROP POLICY IF EXISTS "Users can view line items for their company" ON work_order_line_items;
DROP POLICY IF EXISTS "company_line_items_insert" ON work_order_line_items;
DROP POLICY IF EXISTS "company_line_items_update" ON work_order_line_items;
DROP POLICY IF EXISTS "company_line_items_delete" ON work_order_line_items;
DROP POLICY IF EXISTS "company_line_items_select" ON work_order_line_items;

-- Allow users to INSERT line items for work orders in their company
CREATE POLICY "company_line_items_insert"
ON work_order_line_items
FOR INSERT
WITH CHECK (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = user_company_id()
  )
);

-- Allow users to UPDATE line items for work orders in their company
CREATE POLICY "company_line_items_update"
ON work_order_line_items
FOR UPDATE
USING (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = user_company_id()
  )
)
WITH CHECK (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = user_company_id()
  )
);

-- Allow users to DELETE line items for work orders in their company
CREATE POLICY "company_line_items_delete"
ON work_order_line_items
FOR DELETE
USING (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = user_company_id()
  )
);

-- Allow users to SELECT line items for work orders in their company
CREATE POLICY "company_line_items_select"
ON work_order_line_items
FOR SELECT
USING (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = user_company_id()
  )
);

-- Verify policies were created
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
WHERE tablename = 'work_order_line_items'
ORDER BY policyname;

