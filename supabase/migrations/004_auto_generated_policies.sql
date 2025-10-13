-- ============================================
-- Auto-Generated RLS Policies for All Tables
-- Generated: 2025-10-10T03:11:43.992Z
-- ============================================

-- ============================================
-- APPROVAL_SETTINGS
-- ============================================
DROP POLICY IF EXISTS "company_approval_settings_select" ON approval_settings;
DROP POLICY IF EXISTS "company_approval_settings_insert" ON approval_settings;
DROP POLICY IF EXISTS "company_approval_settings_update" ON approval_settings;
DROP POLICY IF EXISTS "company_approval_settings_delete" ON approval_settings;

CREATE POLICY "company_approval_settings_select"
ON approval_settings FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_approval_settings_insert"
ON approval_settings FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_approval_settings_update"
ON approval_settings FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_approval_settings_delete"
ON approval_settings FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- AUDIT_LOGS
-- ============================================
DROP POLICY IF EXISTS "company_audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "company_audit_logs_insert" ON audit_logs;
DROP POLICY IF EXISTS "company_audit_logs_update" ON audit_logs;
DROP POLICY IF EXISTS "company_audit_logs_delete" ON audit_logs;

CREATE POLICY "company_audit_logs_select"
ON audit_logs FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_audit_logs_insert"
ON audit_logs FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_audit_logs_update"
ON audit_logs FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_audit_logs_delete"
ON audit_logs FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- CHANGE_ORDER_ITEMS
-- ============================================
DROP POLICY IF EXISTS "company_change_order_items_select" ON change_order_items;
DROP POLICY IF EXISTS "company_change_order_items_insert" ON change_order_items;
DROP POLICY IF EXISTS "company_change_order_items_update" ON change_order_items;
DROP POLICY IF EXISTS "company_change_order_items_delete" ON change_order_items;

CREATE POLICY "company_change_order_items_select"
ON change_order_items FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_change_order_items_insert"
ON change_order_items FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_change_order_items_update"
ON change_order_items FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_change_order_items_delete"
ON change_order_items FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- CHANGE_ORDERS
-- ============================================
DROP POLICY IF EXISTS "company_change_orders_select" ON change_orders;
DROP POLICY IF EXISTS "company_change_orders_insert" ON change_orders;
DROP POLICY IF EXISTS "company_change_orders_update" ON change_orders;
DROP POLICY IF EXISTS "company_change_orders_delete" ON change_orders;

CREATE POLICY "company_change_orders_select"
ON change_orders FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_change_orders_insert"
ON change_orders FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_change_orders_update"
ON change_orders FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_change_orders_delete"
ON change_orders FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- COMPANY_SETTINGS
-- ============================================
DROP POLICY IF EXISTS "company_company_settings_select" ON company_settings;
DROP POLICY IF EXISTS "company_company_settings_insert" ON company_settings;
DROP POLICY IF EXISTS "company_company_settings_update" ON company_settings;
DROP POLICY IF EXISTS "company_company_settings_delete" ON company_settings;

CREATE POLICY "company_company_settings_select"
ON company_settings FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_company_settings_insert"
ON company_settings FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_company_settings_update"
ON company_settings FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_company_settings_delete"
ON company_settings FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- COMPANY_TAGS
-- ============================================
DROP POLICY IF EXISTS "company_company_tags_select" ON company_tags;
DROP POLICY IF EXISTS "company_company_tags_insert" ON company_tags;
DROP POLICY IF EXISTS "company_company_tags_update" ON company_tags;
DROP POLICY IF EXISTS "company_company_tags_delete" ON company_tags;

CREATE POLICY "company_company_tags_select"
ON company_tags FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_company_tags_insert"
ON company_tags FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_company_tags_update"
ON company_tags FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_company_tags_delete"
ON company_tags FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- CUSTOMER_ADDRESSES
-- ============================================
DROP POLICY IF EXISTS "company_customer_addresses_select" ON customer_addresses;
DROP POLICY IF EXISTS "company_customer_addresses_insert" ON customer_addresses;
DROP POLICY IF EXISTS "company_customer_addresses_update" ON customer_addresses;
DROP POLICY IF EXISTS "company_customer_addresses_delete" ON customer_addresses;

CREATE POLICY "company_customer_addresses_select"
ON customer_addresses FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_customer_addresses_insert"
ON customer_addresses FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_customer_addresses_update"
ON customer_addresses FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_customer_addresses_delete"
ON customer_addresses FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- CUSTOMER_EQUIPMENT
-- ============================================
DROP POLICY IF EXISTS "company_customer_equipment_select" ON customer_equipment;
DROP POLICY IF EXISTS "company_customer_equipment_insert" ON customer_equipment;
DROP POLICY IF EXISTS "company_customer_equipment_update" ON customer_equipment;
DROP POLICY IF EXISTS "company_customer_equipment_delete" ON customer_equipment;

CREATE POLICY "company_customer_equipment_select"
ON customer_equipment FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_customer_equipment_insert"
ON customer_equipment FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_customer_equipment_update"
ON customer_equipment FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_customer_equipment_delete"
ON customer_equipment FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- CUSTOMER_FEEDBACK
-- ============================================
DROP POLICY IF EXISTS "company_customer_feedback_select" ON customer_feedback;
DROP POLICY IF EXISTS "company_customer_feedback_insert" ON customer_feedback;
DROP POLICY IF EXISTS "company_customer_feedback_update" ON customer_feedback;
DROP POLICY IF EXISTS "company_customer_feedback_delete" ON customer_feedback;

CREATE POLICY "company_customer_feedback_select"
ON customer_feedback FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_customer_feedback_insert"
ON customer_feedback FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_customer_feedback_update"
ON customer_feedback FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_customer_feedback_delete"
ON customer_feedback FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- CUSTOMER_TAGS
-- ============================================
DROP POLICY IF EXISTS "company_customer_tags_select" ON customer_tags;
DROP POLICY IF EXISTS "company_customer_tags_insert" ON customer_tags;
DROP POLICY IF EXISTS "company_customer_tags_update" ON customer_tags;
DROP POLICY IF EXISTS "company_customer_tags_delete" ON customer_tags;

CREATE POLICY "company_customer_tags_select"
ON customer_tags FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_customer_tags_insert"
ON customer_tags FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_customer_tags_update"
ON customer_tags FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_customer_tags_delete"
ON customer_tags FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- CUSTOMERS
-- ============================================
DROP POLICY IF EXISTS "company_customers_select" ON customers;
DROP POLICY IF EXISTS "company_customers_insert" ON customers;
DROP POLICY IF EXISTS "company_customers_update" ON customers;
DROP POLICY IF EXISTS "company_customers_delete" ON customers;

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
USING (company_id = public.user_company_id());

-- ============================================
-- DOCUMENT_TEMPLATES
-- ============================================
DROP POLICY IF EXISTS "company_document_templates_select" ON document_templates;
DROP POLICY IF EXISTS "company_document_templates_insert" ON document_templates;
DROP POLICY IF EXISTS "company_document_templates_update" ON document_templates;
DROP POLICY IF EXISTS "company_document_templates_delete" ON document_templates;

CREATE POLICY "company_document_templates_select"
ON document_templates FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_document_templates_insert"
ON document_templates FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_document_templates_update"
ON document_templates FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_document_templates_delete"
ON document_templates FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- EMPLOYEE_DELEGATES
-- ============================================
DROP POLICY IF EXISTS "company_employee_delegates_select" ON employee_delegates;
DROP POLICY IF EXISTS "company_employee_delegates_insert" ON employee_delegates;
DROP POLICY IF EXISTS "company_employee_delegates_update" ON employee_delegates;
DROP POLICY IF EXISTS "company_employee_delegates_delete" ON employee_delegates;

CREATE POLICY "company_employee_delegates_select"
ON employee_delegates FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_employee_delegates_insert"
ON employee_delegates FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_employee_delegates_update"
ON employee_delegates FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_employee_delegates_delete"
ON employee_delegates FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- EMPLOYEES
-- ============================================
DROP POLICY IF EXISTS "company_employees_select" ON employees;
DROP POLICY IF EXISTS "company_employees_insert" ON employees;
DROP POLICY IF EXISTS "company_employees_update" ON employees;
DROP POLICY IF EXISTS "company_employees_delete" ON employees;

CREATE POLICY "company_employees_select"
ON employees FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_employees_insert"
ON employees FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_employees_update"
ON employees FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_employees_delete"
ON employees FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- EXPENSE_CATEGORIES
-- ============================================
DROP POLICY IF EXISTS "company_expense_categories_select" ON expense_categories;
DROP POLICY IF EXISTS "company_expense_categories_insert" ON expense_categories;
DROP POLICY IF EXISTS "company_expense_categories_update" ON expense_categories;
DROP POLICY IF EXISTS "company_expense_categories_delete" ON expense_categories;

CREATE POLICY "company_expense_categories_select"
ON expense_categories FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_expense_categories_insert"
ON expense_categories FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_expense_categories_update"
ON expense_categories FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_expense_categories_delete"
ON expense_categories FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- EXPENSES
-- ============================================
DROP POLICY IF EXISTS "company_expenses_select" ON expenses;
DROP POLICY IF EXISTS "company_expenses_insert" ON expenses;
DROP POLICY IF EXISTS "company_expenses_update" ON expenses;
DROP POLICY IF EXISTS "company_expenses_delete" ON expenses;

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
USING (company_id = public.user_company_id());

-- ============================================
-- INTEGRATION_TOKENS
-- ============================================
DROP POLICY IF EXISTS "company_integration_tokens_select" ON integration_tokens;
DROP POLICY IF EXISTS "company_integration_tokens_insert" ON integration_tokens;
DROP POLICY IF EXISTS "company_integration_tokens_update" ON integration_tokens;
DROP POLICY IF EXISTS "company_integration_tokens_delete" ON integration_tokens;

CREATE POLICY "company_integration_tokens_select"
ON integration_tokens FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_integration_tokens_insert"
ON integration_tokens FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_integration_tokens_update"
ON integration_tokens FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_integration_tokens_delete"
ON integration_tokens FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- INVENTORY_ITEMS
-- ============================================
DROP POLICY IF EXISTS "company_inventory_items_select" ON inventory_items;
DROP POLICY IF EXISTS "company_inventory_items_insert" ON inventory_items;
DROP POLICY IF EXISTS "company_inventory_items_update" ON inventory_items;
DROP POLICY IF EXISTS "company_inventory_items_delete" ON inventory_items;

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
USING (company_id = public.user_company_id());

-- ============================================
-- INVENTORY_LOCATIONS
-- ============================================
DROP POLICY IF EXISTS "company_inventory_locations_select" ON inventory_locations;
DROP POLICY IF EXISTS "company_inventory_locations_insert" ON inventory_locations;
DROP POLICY IF EXISTS "company_inventory_locations_update" ON inventory_locations;
DROP POLICY IF EXISTS "company_inventory_locations_delete" ON inventory_locations;

CREATE POLICY "company_inventory_locations_select"
ON inventory_locations FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_inventory_locations_insert"
ON inventory_locations FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_inventory_locations_update"
ON inventory_locations FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_inventory_locations_delete"
ON inventory_locations FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- INVENTORY_MOVEMENTS
-- ============================================
DROP POLICY IF EXISTS "company_inventory_movements_select" ON inventory_movements;
DROP POLICY IF EXISTS "company_inventory_movements_insert" ON inventory_movements;
DROP POLICY IF EXISTS "company_inventory_movements_update" ON inventory_movements;
DROP POLICY IF EXISTS "company_inventory_movements_delete" ON inventory_movements;

CREATE POLICY "company_inventory_movements_select"
ON inventory_movements FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_inventory_movements_insert"
ON inventory_movements FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_inventory_movements_update"
ON inventory_movements FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_inventory_movements_delete"
ON inventory_movements FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- INVOICE_DELIVERIES
-- ============================================
DROP POLICY IF EXISTS "company_invoice_deliveries_select" ON invoice_deliveries;
DROP POLICY IF EXISTS "company_invoice_deliveries_insert" ON invoice_deliveries;
DROP POLICY IF EXISTS "company_invoice_deliveries_update" ON invoice_deliveries;
DROP POLICY IF EXISTS "company_invoice_deliveries_delete" ON invoice_deliveries;

CREATE POLICY "company_invoice_deliveries_select"
ON invoice_deliveries FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_invoice_deliveries_insert"
ON invoice_deliveries FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_invoice_deliveries_update"
ON invoice_deliveries FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_invoice_deliveries_delete"
ON invoice_deliveries FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- INVOICE_PROGRESS_LEDGER
-- ============================================
DROP POLICY IF EXISTS "company_invoice_progress_ledger_select" ON invoice_progress_ledger;
DROP POLICY IF EXISTS "company_invoice_progress_ledger_insert" ON invoice_progress_ledger;
DROP POLICY IF EXISTS "company_invoice_progress_ledger_update" ON invoice_progress_ledger;
DROP POLICY IF EXISTS "company_invoice_progress_ledger_delete" ON invoice_progress_ledger;

CREATE POLICY "company_invoice_progress_ledger_select"
ON invoice_progress_ledger FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_invoice_progress_ledger_insert"
ON invoice_progress_ledger FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_invoice_progress_ledger_update"
ON invoice_progress_ledger FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_invoice_progress_ledger_delete"
ON invoice_progress_ledger FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- INVOICES
-- ============================================
DROP POLICY IF EXISTS "company_invoices_select" ON invoices;
DROP POLICY IF EXISTS "company_invoices_insert" ON invoices;
DROP POLICY IF EXISTS "company_invoices_update" ON invoices;
DROP POLICY IF EXISTS "company_invoices_delete" ON invoices;

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
USING (company_id = public.user_company_id());

-- ============================================
-- JOB_COMPLETION_CHECKLIST
-- ============================================
DROP POLICY IF EXISTS "company_job_completion_checklist_select" ON job_completion_checklist;
DROP POLICY IF EXISTS "company_job_completion_checklist_insert" ON job_completion_checklist;
DROP POLICY IF EXISTS "company_job_completion_checklist_update" ON job_completion_checklist;
DROP POLICY IF EXISTS "company_job_completion_checklist_delete" ON job_completion_checklist;

CREATE POLICY "company_job_completion_checklist_select"
ON job_completion_checklist FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_job_completion_checklist_insert"
ON job_completion_checklist FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_job_completion_checklist_update"
ON job_completion_checklist FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_job_completion_checklist_delete"
ON job_completion_checklist FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- MARKETPLACE_REQUESTS
-- ============================================
DROP POLICY IF EXISTS "company_marketplace_requests_select" ON marketplace_requests;
DROP POLICY IF EXISTS "company_marketplace_requests_insert" ON marketplace_requests;
DROP POLICY IF EXISTS "company_marketplace_requests_update" ON marketplace_requests;
DROP POLICY IF EXISTS "company_marketplace_requests_delete" ON marketplace_requests;

CREATE POLICY "company_marketplace_requests_select"
ON marketplace_requests FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_marketplace_requests_insert"
ON marketplace_requests FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_marketplace_requests_update"
ON marketplace_requests FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_marketplace_requests_delete"
ON marketplace_requests FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- MARKETPLACE_SETTINGS
-- ============================================
DROP POLICY IF EXISTS "company_marketplace_settings_select" ON marketplace_settings;
DROP POLICY IF EXISTS "company_marketplace_settings_insert" ON marketplace_settings;
DROP POLICY IF EXISTS "company_marketplace_settings_update" ON marketplace_settings;
DROP POLICY IF EXISTS "company_marketplace_settings_delete" ON marketplace_settings;

CREATE POLICY "company_marketplace_settings_select"
ON marketplace_settings FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_marketplace_settings_insert"
ON marketplace_settings FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_marketplace_settings_update"
ON marketplace_settings FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_marketplace_settings_delete"
ON marketplace_settings FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- MESSAGES
-- ============================================
DROP POLICY IF EXISTS "company_messages_select" ON messages;
DROP POLICY IF EXISTS "company_messages_insert" ON messages;
DROP POLICY IF EXISTS "company_messages_update" ON messages;
DROP POLICY IF EXISTS "company_messages_delete" ON messages;

CREATE POLICY "company_messages_select"
ON messages FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_messages_insert"
ON messages FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_messages_update"
ON messages FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_messages_delete"
ON messages FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- NOTIFICATIONS
-- ============================================
DROP POLICY IF EXISTS "company_notifications_select" ON notifications;
DROP POLICY IF EXISTS "company_notifications_insert" ON notifications;
DROP POLICY IF EXISTS "company_notifications_update" ON notifications;
DROP POLICY IF EXISTS "company_notifications_delete" ON notifications;

CREATE POLICY "company_notifications_select"
ON notifications FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_notifications_insert"
ON notifications FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_notifications_update"
ON notifications FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_notifications_delete"
ON notifications FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- ONBOARDING_PROGRESS
-- ============================================
DROP POLICY IF EXISTS "company_onboarding_progress_select" ON onboarding_progress;
DROP POLICY IF EXISTS "company_onboarding_progress_insert" ON onboarding_progress;
DROP POLICY IF EXISTS "company_onboarding_progress_update" ON onboarding_progress;
DROP POLICY IF EXISTS "company_onboarding_progress_delete" ON onboarding_progress;

CREATE POLICY "company_onboarding_progress_select"
ON onboarding_progress FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_onboarding_progress_insert"
ON onboarding_progress FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_onboarding_progress_update"
ON onboarding_progress FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_onboarding_progress_delete"
ON onboarding_progress FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- PAYMENT_DELIVERIES
-- ============================================
DROP POLICY IF EXISTS "company_payment_deliveries_select" ON payment_deliveries;
DROP POLICY IF EXISTS "company_payment_deliveries_insert" ON payment_deliveries;
DROP POLICY IF EXISTS "company_payment_deliveries_update" ON payment_deliveries;
DROP POLICY IF EXISTS "company_payment_deliveries_delete" ON payment_deliveries;

CREATE POLICY "company_payment_deliveries_select"
ON payment_deliveries FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_payment_deliveries_insert"
ON payment_deliveries FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_payment_deliveries_update"
ON payment_deliveries FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_payment_deliveries_delete"
ON payment_deliveries FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- PAYMENT_SETTINGS
-- ============================================
DROP POLICY IF EXISTS "company_payment_settings_select" ON payment_settings;
DROP POLICY IF EXISTS "company_payment_settings_insert" ON payment_settings;
DROP POLICY IF EXISTS "company_payment_settings_update" ON payment_settings;
DROP POLICY IF EXISTS "company_payment_settings_delete" ON payment_settings;

CREATE POLICY "company_payment_settings_select"
ON payment_settings FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_payment_settings_insert"
ON payment_settings FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_payment_settings_update"
ON payment_settings FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_payment_settings_delete"
ON payment_settings FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- PAYMENTS
-- ============================================
DROP POLICY IF EXISTS "company_payments_select" ON payments;
DROP POLICY IF EXISTS "company_payments_insert" ON payments;
DROP POLICY IF EXISTS "company_payments_update" ON payments;
DROP POLICY IF EXISTS "company_payments_delete" ON payments;

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
USING (company_id = public.user_company_id());

-- ============================================
-- PAYROLL_RUNS
-- ============================================
DROP POLICY IF EXISTS "company_payroll_runs_select" ON payroll_runs;
DROP POLICY IF EXISTS "company_payroll_runs_insert" ON payroll_runs;
DROP POLICY IF EXISTS "company_payroll_runs_update" ON payroll_runs;
DROP POLICY IF EXISTS "company_payroll_runs_delete" ON payroll_runs;

CREATE POLICY "company_payroll_runs_select"
ON payroll_runs FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_payroll_runs_insert"
ON payroll_runs FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_payroll_runs_update"
ON payroll_runs FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_payroll_runs_delete"
ON payroll_runs FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- PURCHASE_ORDERS
-- ============================================
DROP POLICY IF EXISTS "company_purchase_orders_select" ON purchase_orders;
DROP POLICY IF EXISTS "company_purchase_orders_insert" ON purchase_orders;
DROP POLICY IF EXISTS "company_purchase_orders_update" ON purchase_orders;
DROP POLICY IF EXISTS "company_purchase_orders_delete" ON purchase_orders;

CREATE POLICY "company_purchase_orders_select"
ON purchase_orders FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_purchase_orders_insert"
ON purchase_orders FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_purchase_orders_update"
ON purchase_orders FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_purchase_orders_delete"
ON purchase_orders FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- QUOTE_ANALYTICS
-- ============================================
DROP POLICY IF EXISTS "company_quote_analytics_select" ON quote_analytics;
DROP POLICY IF EXISTS "company_quote_analytics_insert" ON quote_analytics;
DROP POLICY IF EXISTS "company_quote_analytics_update" ON quote_analytics;
DROP POLICY IF EXISTS "company_quote_analytics_delete" ON quote_analytics;

CREATE POLICY "company_quote_analytics_select"
ON quote_analytics FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_quote_analytics_insert"
ON quote_analytics FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_quote_analytics_update"
ON quote_analytics FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_quote_analytics_delete"
ON quote_analytics FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- QUOTE_APPROVAL_WORKFLOWS
-- ============================================
DROP POLICY IF EXISTS "company_quote_approval_workflows_select" ON quote_approval_workflows;
DROP POLICY IF EXISTS "company_quote_approval_workflows_insert" ON quote_approval_workflows;
DROP POLICY IF EXISTS "company_quote_approval_workflows_update" ON quote_approval_workflows;
DROP POLICY IF EXISTS "company_quote_approval_workflows_delete" ON quote_approval_workflows;

CREATE POLICY "company_quote_approval_workflows_select"
ON quote_approval_workflows FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_quote_approval_workflows_insert"
ON quote_approval_workflows FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_quote_approval_workflows_update"
ON quote_approval_workflows FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_quote_approval_workflows_delete"
ON quote_approval_workflows FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- QUOTE_APPROVALS
-- ============================================
DROP POLICY IF EXISTS "company_quote_approvals_select" ON quote_approvals;
DROP POLICY IF EXISTS "company_quote_approvals_insert" ON quote_approvals;
DROP POLICY IF EXISTS "company_quote_approvals_update" ON quote_approvals;
DROP POLICY IF EXISTS "company_quote_approvals_delete" ON quote_approvals;

CREATE POLICY "company_quote_approvals_select"
ON quote_approvals FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_quote_approvals_insert"
ON quote_approvals FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_quote_approvals_update"
ON quote_approvals FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_quote_approvals_delete"
ON quote_approvals FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- QUOTE_DEFAULTS
-- ============================================
DROP POLICY IF EXISTS "company_quote_defaults_select" ON quote_defaults;
DROP POLICY IF EXISTS "company_quote_defaults_insert" ON quote_defaults;
DROP POLICY IF EXISTS "company_quote_defaults_update" ON quote_defaults;
DROP POLICY IF EXISTS "company_quote_defaults_delete" ON quote_defaults;

CREATE POLICY "company_quote_defaults_select"
ON quote_defaults FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_quote_defaults_insert"
ON quote_defaults FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_quote_defaults_update"
ON quote_defaults FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_quote_defaults_delete"
ON quote_defaults FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- QUOTE_DELIVERIES
-- ============================================
DROP POLICY IF EXISTS "company_quote_deliveries_select" ON quote_deliveries;
DROP POLICY IF EXISTS "company_quote_deliveries_insert" ON quote_deliveries;
DROP POLICY IF EXISTS "company_quote_deliveries_update" ON quote_deliveries;
DROP POLICY IF EXISTS "company_quote_deliveries_delete" ON quote_deliveries;

CREATE POLICY "company_quote_deliveries_select"
ON quote_deliveries FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_quote_deliveries_insert"
ON quote_deliveries FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_quote_deliveries_update"
ON quote_deliveries FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_quote_deliveries_delete"
ON quote_deliveries FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- QUOTE_FOLLOW_UPS
-- ============================================
DROP POLICY IF EXISTS "company_quote_follow_ups_select" ON quote_follow_ups;
DROP POLICY IF EXISTS "company_quote_follow_ups_insert" ON quote_follow_ups;
DROP POLICY IF EXISTS "company_quote_follow_ups_update" ON quote_follow_ups;
DROP POLICY IF EXISTS "company_quote_follow_ups_delete" ON quote_follow_ups;

CREATE POLICY "company_quote_follow_ups_select"
ON quote_follow_ups FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_quote_follow_ups_insert"
ON quote_follow_ups FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_quote_follow_ups_update"
ON quote_follow_ups FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_quote_follow_ups_delete"
ON quote_follow_ups FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- QUOTE_RESPONSES
-- ============================================
DROP POLICY IF EXISTS "company_quote_responses_select" ON quote_responses;
DROP POLICY IF EXISTS "company_quote_responses_insert" ON quote_responses;
DROP POLICY IF EXISTS "company_quote_responses_update" ON quote_responses;
DROP POLICY IF EXISTS "company_quote_responses_delete" ON quote_responses;

CREATE POLICY "company_quote_responses_select"
ON quote_responses FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_quote_responses_insert"
ON quote_responses FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_quote_responses_update"
ON quote_responses FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_quote_responses_delete"
ON quote_responses FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- QUOTE_TEMPLATES
-- ============================================
DROP POLICY IF EXISTS "company_quote_templates_select" ON quote_templates;
DROP POLICY IF EXISTS "company_quote_templates_insert" ON quote_templates;
DROP POLICY IF EXISTS "company_quote_templates_update" ON quote_templates;
DROP POLICY IF EXISTS "company_quote_templates_delete" ON quote_templates;

CREATE POLICY "company_quote_templates_select"
ON quote_templates FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_quote_templates_insert"
ON quote_templates FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_quote_templates_update"
ON quote_templates FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_quote_templates_delete"
ON quote_templates FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- RATE_CARDS
-- ============================================
DROP POLICY IF EXISTS "company_rate_cards_select" ON rate_cards;
DROP POLICY IF EXISTS "company_rate_cards_insert" ON rate_cards;
DROP POLICY IF EXISTS "company_rate_cards_update" ON rate_cards;
DROP POLICY IF EXISTS "company_rate_cards_delete" ON rate_cards;

CREATE POLICY "company_rate_cards_select"
ON rate_cards FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_rate_cards_insert"
ON rate_cards FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_rate_cards_update"
ON rate_cards FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_rate_cards_delete"
ON rate_cards FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- RECURRING_SCHEDULES
-- ============================================
DROP POLICY IF EXISTS "company_recurring_schedules_select" ON recurring_schedules;
DROP POLICY IF EXISTS "company_recurring_schedules_insert" ON recurring_schedules;
DROP POLICY IF EXISTS "company_recurring_schedules_update" ON recurring_schedules;
DROP POLICY IF EXISTS "company_recurring_schedules_delete" ON recurring_schedules;

CREATE POLICY "company_recurring_schedules_select"
ON recurring_schedules FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_recurring_schedules_insert"
ON recurring_schedules FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_recurring_schedules_update"
ON recurring_schedules FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_recurring_schedules_delete"
ON recurring_schedules FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- REIMBURSEMENT_REQUESTS
-- ============================================
DROP POLICY IF EXISTS "company_reimbursement_requests_select" ON reimbursement_requests;
DROP POLICY IF EXISTS "company_reimbursement_requests_insert" ON reimbursement_requests;
DROP POLICY IF EXISTS "company_reimbursement_requests_update" ON reimbursement_requests;
DROP POLICY IF EXISTS "company_reimbursement_requests_delete" ON reimbursement_requests;

CREATE POLICY "company_reimbursement_requests_select"
ON reimbursement_requests FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_reimbursement_requests_insert"
ON reimbursement_requests FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_reimbursement_requests_update"
ON reimbursement_requests FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_reimbursement_requests_delete"
ON reimbursement_requests FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- SCHEDULE_EVENTS
-- ============================================
DROP POLICY IF EXISTS "company_schedule_events_select" ON schedule_events;
DROP POLICY IF EXISTS "company_schedule_events_insert" ON schedule_events;
DROP POLICY IF EXISTS "company_schedule_events_update" ON schedule_events;
DROP POLICY IF EXISTS "company_schedule_events_delete" ON schedule_events;

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
-- SERVICE_ADDRESS_TAX_RATES
-- ============================================
DROP POLICY IF EXISTS "company_service_address_tax_rates_select" ON service_address_tax_rates;
DROP POLICY IF EXISTS "company_service_address_tax_rates_insert" ON service_address_tax_rates;
DROP POLICY IF EXISTS "company_service_address_tax_rates_update" ON service_address_tax_rates;
DROP POLICY IF EXISTS "company_service_address_tax_rates_delete" ON service_address_tax_rates;

CREATE POLICY "company_service_address_tax_rates_select"
ON service_address_tax_rates FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_service_address_tax_rates_insert"
ON service_address_tax_rates FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_service_address_tax_rates_update"
ON service_address_tax_rates FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_service_address_tax_rates_delete"
ON service_address_tax_rates FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- SERVICE_AGREEMENTS
-- ============================================
DROP POLICY IF EXISTS "company_service_agreements_select" ON service_agreements;
DROP POLICY IF EXISTS "company_service_agreements_insert" ON service_agreements;
DROP POLICY IF EXISTS "company_service_agreements_update" ON service_agreements;
DROP POLICY IF EXISTS "company_service_agreements_delete" ON service_agreements;

CREATE POLICY "company_service_agreements_select"
ON service_agreements FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_service_agreements_insert"
ON service_agreements FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_service_agreements_update"
ON service_agreements FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_service_agreements_delete"
ON service_agreements FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- SERVICE_CATEGORIES
-- ============================================
DROP POLICY IF EXISTS "company_service_categories_select" ON service_categories;
DROP POLICY IF EXISTS "company_service_categories_insert" ON service_categories;
DROP POLICY IF EXISTS "company_service_categories_update" ON service_categories;
DROP POLICY IF EXISTS "company_service_categories_delete" ON service_categories;

CREATE POLICY "company_service_categories_select"
ON service_categories FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_service_categories_insert"
ON service_categories FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_service_categories_update"
ON service_categories FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_service_categories_delete"
ON service_categories FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- SETTINGS
-- ============================================
DROP POLICY IF EXISTS "company_settings_select" ON settings;
DROP POLICY IF EXISTS "company_settings_insert" ON settings;
DROP POLICY IF EXISTS "company_settings_update" ON settings;
DROP POLICY IF EXISTS "company_settings_delete" ON settings;

CREATE POLICY "company_settings_select"
ON settings FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_settings_insert"
ON settings FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_settings_update"
ON settings FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_settings_delete"
ON settings FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- SKILLS
-- ============================================
DROP POLICY IF EXISTS "company_skills_select" ON skills;
DROP POLICY IF EXISTS "company_skills_insert" ON skills;
DROP POLICY IF EXISTS "company_skills_update" ON skills;
DROP POLICY IF EXISTS "company_skills_delete" ON skills;

CREATE POLICY "company_skills_select"
ON skills FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_skills_insert"
ON skills FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_skills_update"
ON skills FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_skills_delete"
ON skills FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
DROP POLICY IF EXISTS "company_subscriptions_select" ON subscriptions;
DROP POLICY IF EXISTS "company_subscriptions_insert" ON subscriptions;
DROP POLICY IF EXISTS "company_subscriptions_update" ON subscriptions;
DROP POLICY IF EXISTS "company_subscriptions_delete" ON subscriptions;

CREATE POLICY "company_subscriptions_select"
ON subscriptions FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_subscriptions_insert"
ON subscriptions FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_subscriptions_update"
ON subscriptions FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_subscriptions_delete"
ON subscriptions FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- TAX_JURISDICTIONS
-- ============================================
DROP POLICY IF EXISTS "company_tax_jurisdictions_select" ON tax_jurisdictions;
DROP POLICY IF EXISTS "company_tax_jurisdictions_insert" ON tax_jurisdictions;
DROP POLICY IF EXISTS "company_tax_jurisdictions_update" ON tax_jurisdictions;
DROP POLICY IF EXISTS "company_tax_jurisdictions_delete" ON tax_jurisdictions;

CREATE POLICY "company_tax_jurisdictions_select"
ON tax_jurisdictions FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_tax_jurisdictions_insert"
ON tax_jurisdictions FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_tax_jurisdictions_update"
ON tax_jurisdictions FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_tax_jurisdictions_delete"
ON tax_jurisdictions FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- TAXES
-- ============================================
DROP POLICY IF EXISTS "company_taxes_select" ON taxes;
DROP POLICY IF EXISTS "company_taxes_insert" ON taxes;
DROP POLICY IF EXISTS "company_taxes_update" ON taxes;
DROP POLICY IF EXISTS "company_taxes_delete" ON taxes;

CREATE POLICY "company_taxes_select"
ON taxes FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_taxes_insert"
ON taxes FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_taxes_update"
ON taxes FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_taxes_delete"
ON taxes FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- TOOLS
-- ============================================
DROP POLICY IF EXISTS "company_tools_select" ON tools;
DROP POLICY IF EXISTS "company_tools_insert" ON tools;
DROP POLICY IF EXISTS "company_tools_update" ON tools;
DROP POLICY IF EXISTS "company_tools_delete" ON tools;

CREATE POLICY "company_tools_select"
ON tools FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_tools_insert"
ON tools FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_tools_update"
ON tools FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_tools_delete"
ON tools FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- USERS
-- ============================================
DROP POLICY IF EXISTS "company_users_select" ON users;
DROP POLICY IF EXISTS "company_users_insert" ON users;
DROP POLICY IF EXISTS "company_users_update" ON users;
DROP POLICY IF EXISTS "company_users_delete" ON users;

CREATE POLICY "company_users_select"
ON users FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_users_insert"
ON users FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_users_update"
ON users FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_users_delete"
ON users FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- VENDORS
-- ============================================
DROP POLICY IF EXISTS "company_vendors_select" ON vendors;
DROP POLICY IF EXISTS "company_vendors_insert" ON vendors;
DROP POLICY IF EXISTS "company_vendors_update" ON vendors;
DROP POLICY IF EXISTS "company_vendors_delete" ON vendors;

CREATE POLICY "company_vendors_select"
ON vendors FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_vendors_insert"
ON vendors FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_vendors_update"
ON vendors FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_vendors_delete"
ON vendors FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- WORK_ORDER_CHECKLISTS
-- ============================================
DROP POLICY IF EXISTS "company_work_order_checklists_select" ON work_order_checklists;
DROP POLICY IF EXISTS "company_work_order_checklists_insert" ON work_order_checklists;
DROP POLICY IF EXISTS "company_work_order_checklists_update" ON work_order_checklists;
DROP POLICY IF EXISTS "company_work_order_checklists_delete" ON work_order_checklists;

CREATE POLICY "company_work_order_checklists_select"
ON work_order_checklists FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_work_order_checklists_insert"
ON work_order_checklists FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_work_order_checklists_update"
ON work_order_checklists FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_work_order_checklists_delete"
ON work_order_checklists FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- WORK_ORDER_PHOTOS
-- ============================================
DROP POLICY IF EXISTS "company_work_order_photos_select" ON work_order_photos;
DROP POLICY IF EXISTS "company_work_order_photos_insert" ON work_order_photos;
DROP POLICY IF EXISTS "company_work_order_photos_update" ON work_order_photos;
DROP POLICY IF EXISTS "company_work_order_photos_delete" ON work_order_photos;

CREATE POLICY "company_work_order_photos_select"
ON work_order_photos FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_work_order_photos_insert"
ON work_order_photos FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_work_order_photos_update"
ON work_order_photos FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_work_order_photos_delete"
ON work_order_photos FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- WORK_ORDER_PRODUCTS
-- ============================================
DROP POLICY IF EXISTS "company_work_order_products_select" ON work_order_products;
DROP POLICY IF EXISTS "company_work_order_products_insert" ON work_order_products;
DROP POLICY IF EXISTS "company_work_order_products_update" ON work_order_products;
DROP POLICY IF EXISTS "company_work_order_products_delete" ON work_order_products;

CREATE POLICY "company_work_order_products_select"
ON work_order_products FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_work_order_products_insert"
ON work_order_products FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_work_order_products_update"
ON work_order_products FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_work_order_products_delete"
ON work_order_products FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- WORK_ORDER_SERVICES
-- ============================================
DROP POLICY IF EXISTS "company_work_order_services_select" ON work_order_services;
DROP POLICY IF EXISTS "company_work_order_services_insert" ON work_order_services;
DROP POLICY IF EXISTS "company_work_order_services_update" ON work_order_services;
DROP POLICY IF EXISTS "company_work_order_services_delete" ON work_order_services;

CREATE POLICY "company_work_order_services_select"
ON work_order_services FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_work_order_services_insert"
ON work_order_services FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_work_order_services_update"
ON work_order_services FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_work_order_services_delete"
ON work_order_services FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- WORK_ORDER_SIGNATURES
-- ============================================
DROP POLICY IF EXISTS "company_work_order_signatures_select" ON work_order_signatures;
DROP POLICY IF EXISTS "company_work_order_signatures_insert" ON work_order_signatures;
DROP POLICY IF EXISTS "company_work_order_signatures_update" ON work_order_signatures;
DROP POLICY IF EXISTS "company_work_order_signatures_delete" ON work_order_signatures;

CREATE POLICY "company_work_order_signatures_select"
ON work_order_signatures FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_work_order_signatures_insert"
ON work_order_signatures FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_work_order_signatures_update"
ON work_order_signatures FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_work_order_signatures_delete"
ON work_order_signatures FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- WORK_ORDER_TASKS
-- ============================================
DROP POLICY IF EXISTS "company_work_order_tasks_select" ON work_order_tasks;
DROP POLICY IF EXISTS "company_work_order_tasks_insert" ON work_order_tasks;
DROP POLICY IF EXISTS "company_work_order_tasks_update" ON work_order_tasks;
DROP POLICY IF EXISTS "company_work_order_tasks_delete" ON work_order_tasks;

CREATE POLICY "company_work_order_tasks_select"
ON work_order_tasks FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_work_order_tasks_insert"
ON work_order_tasks FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_work_order_tasks_update"
ON work_order_tasks FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_work_order_tasks_delete"
ON work_order_tasks FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- WORK_ORDERS
-- ============================================
DROP POLICY IF EXISTS "company_work_orders_select" ON work_orders;
DROP POLICY IF EXISTS "company_work_orders_insert" ON work_orders;
DROP POLICY IF EXISTS "company_work_orders_update" ON work_orders;
DROP POLICY IF EXISTS "company_work_orders_delete" ON work_orders;

CREATE POLICY "company_work_orders_select"
ON work_orders FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_work_orders_insert"
ON work_orders FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_work_orders_update"
ON work_orders FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_work_orders_delete"
ON work_orders FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- WORK_SETTINGS
-- ============================================
DROP POLICY IF EXISTS "company_work_settings_select" ON work_settings;
DROP POLICY IF EXISTS "company_work_settings_insert" ON work_settings;
DROP POLICY IF EXISTS "company_work_settings_update" ON work_settings;
DROP POLICY IF EXISTS "company_work_settings_delete" ON work_settings;

CREATE POLICY "company_work_settings_select"
ON work_settings FOR SELECT
USING (company_id = public.user_company_id());

CREATE POLICY "company_work_settings_insert"
ON work_settings FOR INSERT
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_work_settings_update"
ON work_settings FOR UPDATE
USING (company_id = public.user_company_id())
WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "company_work_settings_delete"
ON work_settings FOR DELETE
USING (company_id = public.user_company_id());

