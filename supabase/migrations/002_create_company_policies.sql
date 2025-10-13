-- ============================================
-- TradeMate Pro - Company-Scoped RLS Policies
-- ============================================
-- These policies ensure users can only access data
-- from their own company (company isolation)
-- ============================================

-- ============================================
-- WORK ORDERS - Core business data
-- ============================================

-- Users can view work orders from their company
CREATE POLICY "company_work_orders_select"
ON work_orders FOR SELECT
USING (company_id = public.user_company_id());

-- Users can insert work orders for their company
CREATE POLICY "company_work_orders_insert"
ON work_orders FOR INSERT
WITH CHECK (company_id = public.user_company_id());

-- Users can update work orders from their company
CREATE POLICY "company_work_orders_update"
ON work_orders FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

-- Only admins can delete work orders
CREATE POLICY "company_work_orders_delete"
ON work_orders FOR DELETE
USING (
  company_id = public.user_company_id()
  AND public.is_admin()
);

-- ============================================
-- PUBLIC PORTAL ACCESS - Token-based
-- ============================================

-- Public can view quotes with valid, non-expired tokens
CREATE POLICY "public_quote_view_with_token"
ON work_orders FOR SELECT
USING (
  portal_token IS NOT NULL
  AND portal_link_expires_at > NOW()
  AND status IN ('sent', 'approved', 'rejected', 'changes_requested')
);

-- Public can update quote status via token (approve/reject)
CREATE POLICY "public_quote_update_with_token"
ON work_orders FOR UPDATE
USING (
  portal_token IS NOT NULL
  AND portal_link_expires_at > NOW()
)
WITH CHECK (
  status IN ('approved', 'rejected', 'changes_requested')
  AND portal_token IS NOT NULL
);

-- ============================================
-- CUSTOMERS
-- ============================================

CREATE POLICY "company_customers_select"
ON customers FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_customers_insert"
ON customers FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_customers_update"
ON customers FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_customers_delete"
ON customers FOR DELETE
USING (
  company_id = public.user_company_id() 
  AND public.is_admin()
);

-- ============================================
-- EMPLOYEES
-- ============================================

CREATE POLICY "company_employees_select"
ON employees FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_employees_insert"
ON employees FOR INSERT
WITH CHECK (
  company_id = public.user_company_id()
  AND public.is_admin()
);

CREATE POLICY "company_employees_update"
ON employees FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (
  company_id = public.user_company_id()
  AND public.is_admin()
);

CREATE POLICY "company_employees_delete"
ON employees FOR DELETE
USING (
  company_id = public.user_company_id() 
  AND public.is_admin()
);

-- ============================================
-- INVOICES
-- ============================================

CREATE POLICY "company_invoices_select"
ON invoices FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_invoices_insert"
ON invoices FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_invoices_update"
ON invoices FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_invoices_delete"
ON invoices FOR DELETE
USING (
  company_id = public.user_company_id() 
  AND public.is_admin()
);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE POLICY "company_payments_select"
ON payments FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_payments_insert"
ON payments FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_payments_update"
ON payments FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_payments_delete"
ON payments FOR DELETE
USING (
  company_id = public.user_company_id() 
  AND public.is_admin()
);

-- ============================================
-- EXPENSES
-- ============================================

CREATE POLICY "company_expenses_select"
ON expenses FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_expenses_insert"
ON expenses FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_expenses_update"
ON expenses FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_expenses_delete"
ON expenses FOR DELETE
USING (
  company_id = public.user_company_id() 
  AND public.is_admin()
);

-- ============================================
-- TIMESHEETS
-- ============================================

CREATE POLICY "company_timesheets_select"
ON timesheets FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_timesheets_insert"
ON timesheets FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_timesheets_update"
ON timesheets FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_timesheets_delete"
ON timesheets FOR DELETE
USING (
  company_id = public.user_company_id() 
  AND public.is_admin()
);

-- ============================================
-- SCHEDULE EVENTS
-- ============================================

CREATE POLICY "company_schedule_events_select"
ON schedule_events FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_schedule_events_insert"
ON schedule_events FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_schedule_events_update"
ON schedule_events FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_schedule_events_delete"
ON schedule_events FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- INVENTORY ITEMS
-- ============================================

CREATE POLICY "company_inventory_items_select"
ON inventory_items FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_inventory_items_insert"
ON inventory_items FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_inventory_items_update"
ON inventory_items FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_inventory_items_delete"
ON inventory_items FOR DELETE
USING (
  company_id = public.user_company_id() 
  AND public.is_admin()
);

COMMIT;

