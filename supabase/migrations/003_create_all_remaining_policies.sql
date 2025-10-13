-- ============================================
-- TradeMate Pro - RLS Policies for All Remaining Tables
-- ============================================
-- This creates company-scoped policies for all tables
-- that don't have policies yet
-- ============================================

-- ============================================
-- VENDORS
-- ============================================
CREATE POLICY "company_vendors_select" ON vendors FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_vendors_insert" ON vendors FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_vendors_update" ON vendors FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_vendors_delete" ON vendors FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- DOCUMENTS
-- ============================================
CREATE POLICY "company_documents_select" ON documents FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_documents_insert" ON documents FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_documents_update" ON documents FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_documents_delete" ON documents FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- MESSAGES
-- ============================================
CREATE POLICY "company_messages_select" ON messages FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_messages_insert" ON messages FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_messages_update" ON messages FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_messages_delete" ON messages FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE POLICY "company_notifications_select" ON notifications FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_notifications_insert" ON notifications FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_notifications_update" ON notifications FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_notifications_delete" ON notifications FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- PURCHASE ORDERS
-- ============================================
CREATE POLICY "company_purchase_orders_select" ON purchase_orders FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_purchase_orders_insert" ON purchase_orders FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_purchase_orders_update" ON purchase_orders FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_purchase_orders_delete" ON purchase_orders FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- PURCHASE ORDER LINE ITEMS
-- ============================================
CREATE POLICY "company_po_line_items_select" ON purchase_order_line_items FOR SELECT
USING (
  purchase_order_id IN (
    SELECT id FROM purchase_orders WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_po_line_items_insert" ON purchase_order_line_items FOR INSERT
WITH CHECK (
  purchase_order_id IN (
    SELECT id FROM purchase_orders WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_po_line_items_update" ON purchase_order_line_items FOR UPDATE
USING (
  purchase_order_id IN (
    SELECT id FROM purchase_orders WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_po_line_items_delete" ON purchase_order_line_items FOR DELETE
USING (
  purchase_order_id IN (
    SELECT id FROM purchase_orders WHERE company_id = public.user_company_id()
  )
);

-- ============================================
-- WORK ORDER LINE ITEMS
-- ============================================
CREATE POLICY "company_wo_line_items_select" ON work_order_line_items FOR SELECT
USING (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_wo_line_items_insert" ON work_order_line_items FOR INSERT
WITH CHECK (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_wo_line_items_update" ON work_order_line_items FOR UPDATE
USING (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_wo_line_items_delete" ON work_order_line_items FOR DELETE
USING (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = public.user_company_id()
  )
);

-- ============================================
-- WORK ORDER NOTES
-- ============================================
CREATE POLICY "company_wo_notes_select" ON work_order_notes FOR SELECT
USING (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_wo_notes_insert" ON work_order_notes FOR INSERT
WITH CHECK (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_wo_notes_update" ON work_order_notes FOR UPDATE
USING (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_wo_notes_delete" ON work_order_notes FOR DELETE
USING (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = public.user_company_id()
  )
);

-- ============================================
-- WORK ORDER ATTACHMENTS
-- ============================================
CREATE POLICY "company_wo_attachments_select" ON work_order_attachments FOR SELECT
USING (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_wo_attachments_insert" ON work_order_attachments FOR INSERT
WITH CHECK (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_wo_attachments_update" ON work_order_attachments FOR UPDATE
USING (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_wo_attachments_delete" ON work_order_attachments FOR DELETE
USING (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = public.user_company_id()
  )
);

-- ============================================
-- WORK ORDER TASKS
-- ============================================
CREATE POLICY "company_wo_tasks_select" ON work_order_tasks FOR SELECT
USING (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_wo_tasks_insert" ON work_order_tasks FOR INSERT
WITH CHECK (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_wo_tasks_update" ON work_order_tasks FOR UPDATE
USING (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_wo_tasks_delete" ON work_order_tasks FOR DELETE
USING (
  work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = public.user_company_id()
  )
);

-- ============================================
-- INVOICE LINE ITEMS
-- ============================================
CREATE POLICY "company_invoice_line_items_select" ON invoice_line_items FOR SELECT
USING (
  invoice_id IN (
    SELECT id FROM invoices WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_invoice_line_items_insert" ON invoice_line_items FOR INSERT
WITH CHECK (
  invoice_id IN (
    SELECT id FROM invoices WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_invoice_line_items_update" ON invoice_line_items FOR UPDATE
USING (
  invoice_id IN (
    SELECT id FROM invoices WHERE company_id = public.user_company_id()
  )
);

CREATE POLICY "company_invoice_line_items_delete" ON invoice_line_items FOR DELETE
USING (
  invoice_id IN (
    SELECT id FROM invoices WHERE company_id = public.user_company_id()
  )
);

