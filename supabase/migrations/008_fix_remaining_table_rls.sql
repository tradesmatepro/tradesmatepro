-- ============================================
-- FIX: Remaining Tables RLS Policies
-- ============================================
-- Problem: inventory_stock, employee_timesheets, employee_time_off have no RLS policies
-- Solution: Add company-scoped policies

-- ============================================
-- inventory_stock Table
-- ============================================
DROP POLICY IF EXISTS "company_inventory_stock_select" ON inventory_stock;
DROP POLICY IF EXISTS "company_inventory_stock_insert" ON inventory_stock;
DROP POLICY IF EXISTS "company_inventory_stock_update" ON inventory_stock;
DROP POLICY IF EXISTS "company_inventory_stock_delete" ON inventory_stock;

-- Note: inventory_stock doesn't have company_id, so we join through inventory_items
CREATE POLICY "company_inventory_stock_select"
ON inventory_stock FOR SELECT
USING (
  item_id IN (
    SELECT id FROM inventory_items WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_inventory_stock_insert"
ON inventory_stock FOR INSERT
WITH CHECK (
  item_id IN (
    SELECT id FROM inventory_items WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_inventory_stock_update"
ON inventory_stock FOR UPDATE
USING (
  item_id IN (
    SELECT id FROM inventory_items WHERE company_id = public.user_company_id()
  )
)
WITH CHECK (
  item_id IN (
    SELECT id FROM inventory_items WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_inventory_stock_delete"
ON inventory_stock FOR DELETE
USING (
  item_id IN (
    SELECT id FROM inventory_items WHERE company_id = public.user_company_id()
  )
);

-- ============================================
-- employee_timesheets Table
-- ============================================
DROP POLICY IF EXISTS "company_employee_timesheets_select" ON employee_timesheets;
DROP POLICY IF EXISTS "company_employee_timesheets_insert" ON employee_timesheets;
DROP POLICY IF EXISTS "company_employee_timesheets_update" ON employee_timesheets;
DROP POLICY IF EXISTS "company_employee_timesheets_delete" ON employee_timesheets;

-- Note: employee_timesheets doesn't have company_id, so we join through employees
CREATE POLICY "company_employee_timesheets_select"
ON employee_timesheets FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM employees WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_employee_timesheets_insert"
ON employee_timesheets FOR INSERT
WITH CHECK (
  employee_id IN (
    SELECT id FROM employees WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_employee_timesheets_update"
ON employee_timesheets FOR UPDATE
USING (
  employee_id IN (
    SELECT id FROM employees WHERE company_id = public.user_company_id()
  )
)
WITH CHECK (
  employee_id IN (
    SELECT id FROM employees WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_employee_timesheets_delete"
ON employee_timesheets FOR DELETE
USING (
  employee_id IN (
    SELECT id FROM employees WHERE company_id = public.user_company_id()
  )
);

-- ============================================
-- employee_time_off Table
-- ============================================
DROP POLICY IF EXISTS "company_employee_time_off_select" ON employee_time_off;
DROP POLICY IF EXISTS "company_employee_time_off_insert" ON employee_time_off;
DROP POLICY IF EXISTS "company_employee_time_off_update" ON employee_time_off;
DROP POLICY IF EXISTS "company_employee_time_off_delete" ON employee_time_off;

-- employee_time_off has company_id, so we can use it directly
CREATE POLICY "company_employee_time_off_select"
ON employee_time_off FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_employee_time_off_insert"
ON employee_time_off FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_employee_time_off_update"
ON employee_time_off FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_employee_time_off_delete"
ON employee_time_off FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- VERIFICATION
-- ============================================
-- This should now work:
-- 1. Query inventory_stock - only see items from your company
-- 2. Query employee_timesheets - only see timesheets from your company's employees
-- 3. Query employee_time_off - only see time off from your company
-- 4. No more 401/406 errors!

