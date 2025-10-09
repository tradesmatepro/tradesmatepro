-- TradeMate Pro Database Schema Dump
-- Generated: 2025-09-20T22:40:05.632Z

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


-- SELECT 'CREATE EXTENSION IF NOT EXISTS "' || extname || '";' as sql
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- SELECT 'CREATE TYPE ' || n.nspname || '.' || t.typname || ' AS ENUM (' ||
CREATE TYPE public.invoice_status_enum AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE');
CREATE TYPE public.item_type_enum AS ENUM ('material', 'part', 'labor', 'service');
CREATE TYPE public.job_priority_enum AS ENUM ('low', 'normal', 'high', 'emergency');
CREATE TYPE public.job_status_enum AS ENUM ('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE public.marketplace_response_status_enum AS ENUM ('INTERESTED', 'OFFER_SUBMITTED', 'INFO_REQUESTED', 'SITE_VISIT_PROPOSED', 'ACCEPTED', 'DECLINED');
CREATE TYPE public.movement_type_enum AS ENUM ('PURCHASE', 'RETURN', 'USAGE', 'TRANSFER', 'ADJUSTMENT', 'ALLOCATION');
CREATE TYPE public.payment_status_enum AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');
CREATE TYPE public.pricing_enum AS ENUM ('FLAT', 'HOURLY', 'NEGOTIABLE');
CREATE TYPE public.pricing_model_enum AS ENUM ('FLAT', 'HOURLY', 'NEGOTIABLE');
CREATE TYPE public.pricing_preference_enum AS ENUM ('FLAT', 'HOURLY', 'NEGOTIABLE');
CREATE TYPE public.quote_status_enum AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'DECLINED');
CREATE TYPE public.request_type_enum AS ENUM ('STANDARD', 'EMERGENCY');
CREATE TYPE public.review_target_enum AS ENUM ('COMPANY', 'WORK_ORDER', 'MARKETPLACE');
CREATE TYPE public.service_mode_enum AS ENUM ('ONSITE', 'REMOTE', 'HYBRID');
CREATE TYPE public.stage_enum AS ENUM ('QUOTE', 'JOB', 'WORK_ORDER');
CREATE TYPE public.unified_job_status_enum AS ENUM ('DRAFT', 'OPEN', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ASSIGNED');
CREATE TYPE public.verification_status_enum AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED');
CREATE TYPE public.work_order_status_enum AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DECLINED', 'EXPIRED', 'INVOICED');
CREATE TYPE public.work_status_enum AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Query failed: column "schemaname" does not exist

-- SELECT indexdef || ';' as sql
CREATE INDEX auto_accept_rules_requester_company_id_trade_tag_idx ON public.auto_accept_rules USING btree (requester_company_id, trade_tag);
CREATE UNIQUE INDEX business_settings_company_id_key ON public.business_settings USING btree (company_id);
CREATE UNIQUE INDEX companies_email_unique ON public.companies USING btree (email);
CREATE UNIQUE INDEX company_approval_settings_company_id_key ON public.company_approval_settings USING btree (company_id);
CREATE UNIQUE INDEX company_customers_company_id_customer_id_key ON public.company_customers USING btree (company_id, customer_id);
CREATE UNIQUE INDEX company_customers_company_id_customer_id_unique ON public.company_customers USING btree (company_id, customer_id);
CREATE UNIQUE INDEX company_service_tags_company_id_service_tag_id_key ON public.company_service_tags USING btree (company_id, service_tag_id);
CREATE UNIQUE INDEX coupons_code_key ON public.coupons USING btree (code);
CREATE UNIQUE INDEX customer_portal_accounts_auth_user_id_key ON public.customer_portal_accounts USING btree (auth_user_id);
CREATE UNIQUE INDEX customer_portal_accounts_invitation_token_key ON public.customer_portal_accounts USING btree (invitation_token);
CREATE INDEX customers_status_history_changed_at_idx ON public.customers_status_history USING btree (changed_at);
CREATE INDEX customers_status_history_customer_idx ON public.customers_status_history USING btree (customer_id);
CREATE UNIQUE INDEX document_versions_document_id_version_key ON public.document_versions USING btree (document_id, version);
CREATE UNIQUE INDEX employee_skills_company_id_employee_id_skill_name_key ON public.employee_skills USING btree (company_id, employee_id, skill_name);
CREATE UNIQUE INDEX employee_time_summary_company_id_employee_id_summary_month_key ON public.employee_time_summary USING btree (company_id, employee_id, summary_month);
CREATE UNIQUE INDEX expense_categories_company_id_name_key ON public.expense_categories USING btree (company_id, name);
CREATE INDEX idx_attachments_company ON public.attachments USING btree (company_id);
CREATE INDEX idx_attachments_job_id ON public.attachments USING btree (job_id);
CREATE INDEX idx_business_settings_company_id ON public.business_settings USING btree (company_id);
CREATE INDEX idx_business_settings_company_po ON public.business_settings USING btree (company_id) WHERE (po_number_prefix IS NOT NULL);
CREATE INDEX idx_companies_industry_tags_gin ON public.companies USING gin (industry_tags);
CREATE INDEX idx_companies_licenses_gin ON public.companies USING gin (licenses);
CREATE INDEX idx_company_settings_company_id ON public.company_settings USING btree (company_id);
CREATE INDEX idx_company_tags_company_id ON public.company_tags USING btree (company_id);
CREATE INDEX idx_customer_addresses_company_id ON public.customer_addresses USING btree (company_id);
CREATE INDEX idx_customer_addresses_customer_id ON public.customer_addresses USING btree (customer_id);
CREATE INDEX idx_customer_communications_customer_id ON public.customer_communications USING btree (customer_id);
CREATE INDEX idx_customer_messages_company_id ON public.customer_messages USING btree (company_id);
CREATE INDEX idx_customer_messages_customer_id ON public.customer_messages USING btree (customer_id);
CREATE INDEX idx_customer_messages_sent_at ON public.customer_messages USING btree (sent_at);
CREATE INDEX idx_customer_portal_accounts_active ON public.customer_portal_accounts USING btree (is_active) WHERE (is_active = true);
CREATE INDEX idx_customer_portal_accounts_auth_user ON public.customer_portal_accounts USING btree (auth_user_id);
CREATE INDEX idx_customer_portal_accounts_email ON public.customer_portal_accounts USING btree (email);
CREATE INDEX idx_customer_reviews_job_id ON public.customer_reviews USING btree (job_id);
CREATE INDEX idx_customers_company_id ON public.customers USING btree (company_id);
CREATE INDEX idx_customers_created_via ON public.customers USING btree (created_via);
CREATE INDEX idx_customers_id ON public.customers USING btree (id);
CREATE INDEX idx_document_access_log_document ON public.document_access_log USING btree (document_id, created_at);
CREATE INDEX idx_document_versions_document ON public.document_versions USING btree (document_id, version);
CREATE INDEX idx_document_workflows_status ON public.document_workflows USING btree (company_id, status, due_date);
CREATE INDEX idx_documents_company_id ON public.documents USING btree (company_id);
CREATE INDEX idx_documents_company_type ON public.documents USING btree (company_id, type);
CREATE INDEX idx_documents_current ON public.documents USING btree (company_id, is_current_version) WHERE (is_current_version = true);
CREATE INDEX idx_documents_linked_to ON public.documents USING btree (linked_to);
CREATE INDEX idx_documents_type ON public.documents USING btree (type);
CREATE INDEX idx_documents_version ON public.documents USING btree (parent_document_id, version) WHERE (parent_document_id IS NOT NULL);
CREATE INDEX idx_employee_certifications_company_id ON public.employee_certifications USING btree (company_id);
CREATE INDEX idx_employee_certifications_employee_id ON public.employee_certifications USING btree (employee_id);
CREATE INDEX idx_employee_certifications_status ON public.employee_certifications USING btree (status);
CREATE INDEX idx_employee_compensation_user_id ON public.employee_compensation USING btree (user_id);
CREATE INDEX idx_employee_development_goals_employee_id ON public.employee_development_goals USING btree (employee_id);
CREATE INDEX idx_employee_performance_reviews_employee_id ON public.employee_performance_reviews USING btree (employee_id);
CREATE INDEX idx_employee_policies_current ON public.employee_pto_policies USING btree (employee_id, effective_date) WHERE (end_date IS NULL);
CREATE INDEX idx_employee_recognition_employee_id ON public.employee_recognition USING btree (employee_id);
CREATE INDEX idx_employee_skills_company_id ON public.employee_skills USING btree (company_id);
CREATE INDEX idx_employee_skills_employee_id ON public.employee_skills USING btree (employee_id);
CREATE INDEX idx_employee_time_summary_employee_month ON public.employee_time_summary USING btree (employee_id, summary_month);
CREATE INDEX idx_employee_timesheets_approved_by ON public.employee_timesheets USING btree (approved_by);
CREATE INDEX idx_employee_timesheets_denied_by ON public.employee_timesheets USING btree (denied_by);
CREATE INDEX idx_employee_timesheets_employee_date ON public.employee_timesheets USING btree (employee_id, work_date);
CREATE INDEX idx_employee_timesheets_status ON public.employee_timesheets USING btree (status);
CREATE INDEX idx_employee_timesheets_user_date ON public.employee_timesheets USING btree (user_id, work_date);
CREATE INDEX idx_employee_timesheets_work_date ON public.employee_timesheets USING btree (work_date);
CREATE INDEX idx_expenses_category ON public.expenses USING btree (category);
CREATE INDEX idx_expenses_company_date ON public.expenses USING btree (company_id, date);
CREATE INDEX idx_expenses_company_id ON public.expenses USING btree (company_id);
CREATE INDEX idx_expenses_date ON public.expenses USING btree (date);
CREATE INDEX idx_expenses_user_date ON public.expenses USING btree (user_id, date);
CREATE INDEX idx_expenses_user_id ON public.expenses USING btree (user_id);
CREATE INDEX idx_inventory_batches_item ON public.inventory_batches USING btree (inventory_item_id);
CREATE INDEX idx_inventory_items_abc ON public.inventory_items USING btree (abc_classification);
CREATE INDEX idx_inventory_items_barcode ON public.inventory_items USING btree (barcode);
CREATE INDEX idx_inventory_items_company_id ON public.inventory_items USING btree (company_id);
CREATE INDEX idx_inventory_items_qr ON public.inventory_items USING btree (qr_code);
CREATE INDEX idx_inventory_items_upc ON public.inventory_items USING btree (upc_code);
CREATE INDEX idx_inventory_locations_company_id ON public.inventory_locations USING btree (company_id);
CREATE INDEX idx_inventory_movements_company_id ON public.inventory_movements USING btree (company_id);
CREATE INDEX idx_inventory_scan_log_item ON public.inventory_scan_log USING btree (inventory_item_id);
CREATE UNIQUE INDEX idx_inventory_serial_unique ON public.inventory_serial_numbers USING btree (inventory_item_id, serial_number);
CREATE INDEX idx_inventory_stock_company_id ON public.inventory_stock USING btree (company_id);
CREATE INDEX idx_invoice_commissions_company_id ON public.invoice_commissions USING btree (company_id);
CREATE INDEX idx_invoice_commissions_invoice_id ON public.invoice_commissions USING btree (invoice_id);
CREATE INDEX idx_invoice_commissions_sales_rep_id ON public.invoice_commissions USING btree (sales_rep_id);
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items USING btree (invoice_id);
CREATE INDEX idx_invoice_items_sort_order ON public.invoice_items USING btree (sort_order);
CREATE INDEX idx_invoice_payments_invoice_id ON public.invoice_payments USING btree (invoice_id);
CREATE INDEX idx_invoices_company ON public.invoices USING btree (company_id);
CREATE INDEX idx_invoices_customer_id ON public.invoices USING btree (customer_id);
CREATE INDEX idx_invoices_id ON public.invoices USING btree (id);
CREATE INDEX idx_job_assignments_employee_id ON public.job_assignments USING btree (employee_id);
CREATE INDEX idx_job_assignments_work_order_id ON public.job_assignments USING btree (work_order_id);
CREATE INDEX idx_job_photos_company ON public.job_photos USING btree (company_id);
CREATE INDEX idx_job_photos_job_id ON public.job_photos USING btree (job_id);
CREATE INDEX idx_job_photos_work_order_id ON public.job_photos USING btree (work_order_id);
CREATE INDEX idx_job_triggers_company_id ON public.job_triggers USING btree (company_id);
CREATE INDEX idx_leads_source ON public.leads USING btree (source);
CREATE INDEX idx_leads_stage ON public.leads USING btree (stage);
CREATE INDEX idx_leads_status ON public.leads USING btree (status);
CREATE INDEX idx_marketplace_requests_created_at ON public.marketplace_requests USING btree (created_at DESC);
CREATE INDEX idx_marketplace_responses_request_id ON public.marketplace_responses USING btree (request_id);
CREATE INDEX idx_messages_company ON public.messages USING btree (company_id);
CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id);
CREATE INDEX idx_messages_job_id ON public.messages USING btree (work_order_id);
CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id, company_id);
CREATE INDEX idx_messages_work_order ON public.messages USING btree (work_order_id, message_type);
CREATE INDEX idx_notifications_company_id ON public.notifications USING btree (company_id);
CREATE INDEX idx_notifications_company_user_read ON public.notifications USING btree (company_id, user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);
CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);
CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, read_at) WHERE (read_at IS NULL);
CREATE INDEX idx_opportunities_stage ON public.opportunities USING btree (stage);
CREATE INDEX idx_opportunities_status ON public.opportunities USING btree (status);
CREATE INDEX idx_payments_company ON public.payments USING btree (company_id);
CREATE INDEX idx_payments_company_paidat ON public.payments USING btree (company_id, paid_at DESC);
CREATE INDEX idx_payments_invoice_id ON public.payments USING btree (invoice_id);
CREATE INDEX idx_payrates_company ON public.employee_pay_rates USING btree (company_id);
CREATE INDEX idx_po_approval_actions_workflow ON public.po_approval_actions USING btree (workflow_id);
CREATE INDEX idx_po_approval_workflows_company ON public.po_approval_workflows USING btree (company_id, status);
CREATE INDEX idx_po_company ON public.purchase_orders USING btree (company_id);
CREATE INDEX idx_po_company_status_created ON public.purchase_orders USING btree (company_id, status, created_at DESC);
CREATE INDEX idx_po_company_vendor ON public.purchase_orders USING btree (company_id, vendor_id);
CREATE INDEX idx_po_items_po ON public.po_items USING btree (company_id, purchase_order_id);
CREATE INDEX idx_po_items_supplier_part ON public.po_items USING btree (supplier_part_number) WHERE (supplier_part_number IS NOT NULL);
CREATE INDEX idx_po_number ON public.purchase_orders USING btree (company_id, po_number);
CREATE INDEX idx_po_status ON public.purchase_orders USING btree (company_id, status);
CREATE INDEX idx_po_vendor ON public.purchase_orders USING btree (company_id, vendor_id);
CREATE INDEX idx_pto_company ON public.employee_time_off USING btree (company_id);
CREATE INDEX idx_pto_emp_time ON public.employee_time_off USING btree (employee_id, starts_at, ends_at);
CREATE INDEX idx_pto_ledger_company_category ON public.pto_ledger USING btree (company_id, category_code);
CREATE INDEX idx_pto_ledger_employee_date ON public.pto_ledger USING btree (employee_id, effective_date);
CREATE INDEX idx_pto_policies_company ON public.pto_policies USING btree (company_id);
CREATE INDEX idx_purchase_orders_approval_status ON public.purchase_orders USING btree (company_id, approval_status);
CREATE INDEX idx_purchase_orders_work_order ON public.purchase_orders USING btree (related_work_order_id) WHERE (related_work_order_id IS NOT NULL);
CREATE INDEX idx_rates_pricing_settings_company_id ON public.rates_pricing_settings USING btree (company_id);
CREATE INDEX idx_recurring_jobs_active ON public.recurring_jobs USING btree (is_active, next_occurrence) WHERE (is_active = true);
CREATE INDEX idx_recurring_jobs_company ON public.recurring_jobs USING btree (company_id, is_active);
CREATE INDEX idx_request_tags_request_id ON public.request_tags USING btree (request_id);
CREATE INDEX idx_requests_customer_id ON public.marketplace_requests USING btree (customer_id);
CREATE INDEX idx_reviews_company ON public.customer_reviews USING btree (company_id);
CREATE INDEX idx_route_optimizations_date ON public.route_optimizations USING btree (company_id, optimization_date, technician_id);
CREATE INDEX idx_sales_activities_company ON public.sales_activities USING btree (company_id);
CREATE INDEX idx_sales_targets_company ON public.sales_targets USING btree (company_id);
CREATE INDEX idx_schedule_events_company ON public.schedule_events USING btree (company_id);
CREATE INDEX idx_service_contracts_company ON public.service_contracts USING btree (company_id);
CREATE INDEX idx_service_contracts_customer_id ON public.service_contracts USING btree (customer_id);
CREATE INDEX idx_service_requests_claimed_by_company ON public.service_requests USING btree (claimed_by_company_id);
CREATE INDEX idx_service_requests_zip_code ON public.service_requests USING btree (service_zip_code);
CREATE UNIQUE INDEX idx_service_tags_lower_name ON public.service_tags USING btree (lower(name));
CREATE INDEX idx_settings_company ON public.settings USING btree (company_id);
CREATE INDEX idx_settings_company_po ON public.settings USING btree (company_id) WHERE (po_number_prefix IS NOT NULL);
CREATE INDEX idx_signature_requests_status ON public.signature_requests USING btree (company_id, status, created_at);
CREATE UNIQUE INDEX idx_tags_name_lower ON public.tags USING btree (lower(name));
CREATE INDEX idx_techloc_company ON public.technician_locations USING btree (company_id);
CREATE INDEX idx_timeoff_company ON public.employee_time_off USING btree (company_id);
CREATE INDEX idx_timesheets_company ON public.employee_timesheets USING btree (company_id);
CREATE INDEX idx_timesheets_company_status_date ON public.employee_timesheets USING btree (company_id, status, work_date);
CREATE INDEX idx_user_permissions_company ON public.user_permissions USING btree (company_id);
CREATE INDEX idx_users_company ON public.users USING btree (company_id);
CREATE INDEX idx_users_company_status ON public.users USING btree (company_id, status);
CREATE INDEX idx_users_department ON public.users USING btree (department);
CREATE INDEX idx_users_hire_date ON public.users USING btree (hire_date);
CREATE INDEX idx_users_status ON public.users USING btree (status);
CREATE INDEX idx_vendor_items_company_vendor ON public.vendor_items USING btree (company_id, vendor_id);
CREATE INDEX idx_vendor_items_inventory ON public.vendor_items USING btree (inventory_item_id) WHERE (inventory_item_id IS NOT NULL);
CREATE INDEX idx_vendor_items_supplier_part ON public.vendor_items USING btree (supplier_part_number);
CREATE INDEX idx_vendor_pricing_history_vendor_item ON public.vendor_pricing_history USING btree (vendor_id, inventory_item_id);
CREATE INDEX idx_wol_company_workorder ON public.work_order_labor USING btree (company_id, work_order_id);
CREATE INDEX idx_wol_date ON public.work_order_labor USING btree (work_date);
CREATE INDEX idx_wol_employee_date ON public.work_order_labor USING btree (employee_id, work_date);
CREATE INDEX idx_wol_work_order ON public.work_order_labor USING btree (work_order_id);
CREATE INDEX idx_work_order_assignments_company ON public.work_order_assignments USING btree (company_id);
CREATE INDEX idx_work_order_audit_log_company_id ON public.work_order_audit_log USING btree (company_id);
CREATE INDEX idx_work_order_audit_log_created_at ON public.work_order_audit_log USING btree (created_at);
CREATE INDEX idx_work_order_audit_log_work_order_id ON public.work_order_audit_log USING btree (work_order_id);
CREATE INDEX idx_work_order_audit_wo ON public.work_order_audit USING btree (work_order_id, at DESC);
CREATE INDEX idx_work_order_items_company_id ON public.work_order_items USING btree (company_id);
CREATE INDEX idx_work_order_items_work_order_id ON public.work_order_items USING btree (work_order_id);
CREATE INDEX idx_work_order_labor_company ON public.work_order_labor USING btree (company_id);
CREATE INDEX idx_work_order_labor_company_work_order ON public.work_order_labor USING btree (company_id, work_order_id);
CREATE INDEX idx_work_order_versions_company_id ON public.work_order_versions USING btree (company_id);
CREATE INDEX idx_work_order_versions_version ON public.work_order_versions USING btree (work_order_id, version);
CREATE INDEX idx_work_order_versions_work_order_id ON public.work_order_versions USING btree (work_order_id);
CREATE INDEX idx_work_orders_assigned_technician ON public.work_orders USING btree (assigned_technician_id);
CREATE INDEX idx_work_orders_company_id ON public.work_orders USING btree (company_id);
CREATE INDEX idx_work_orders_created_at ON public.work_orders USING btree (created_at);
CREATE INDEX idx_work_orders_customer_id ON public.work_orders USING btree (customer_id);
CREATE INDEX idx_work_orders_invoice_id ON public.work_orders USING btree (invoice_id);
CREATE INDEX idx_work_orders_recurring ON public.work_orders USING btree (is_recurring, recurring_parent_id) WHERE (is_recurring = true);
CREATE INDEX idx_work_orders_reminders ON public.work_orders USING btree (reminder_sent_at, start_time) WHERE (reminder_sent_at IS NOT NULL);
CREATE INDEX idx_work_orders_service_address_id ON public.work_orders USING btree (service_address_id);
CREATE INDEX idx_work_orders_start_time ON public.work_orders USING btree (start_time);
CREATE INDEX idx_work_orders_status ON public.work_orders USING btree (status);
CREATE INDEX idx_workflow_approvals_pending ON public.workflow_approvals USING btree (workflow_id, status) WHERE (status = 'pending'::text);
CREATE UNIQUE INDEX inventory_stock_item_id_location_id_key ON public.inventory_stock USING btree (item_id, location_id);
CREATE INDEX items_catalog_company_idx ON public.items_catalog USING btree (company_id);
CREATE UNIQUE INDEX marketplace_request_decline_stats_request_id_reason_code_key ON public.marketplace_request_decline_stats USING btree (request_id, reason_code);
CREATE INDEX marketplace_requests_status_idx ON public.marketplace_requests USING btree (status);
CREATE INDEX marketplace_responses_company_id_idx ON public.marketplace_responses USING btree (company_id);
CREATE INDEX marketplace_responses_request_id_idx ON public.marketplace_responses USING btree (request_id);
CREATE UNIQUE INDEX one_setting_per_company ON public.notification_settings USING btree (company_id);
CREATE INDEX po_approval_rules_company_idx ON public.po_approval_rules USING btree (company_id);
CREATE UNIQUE INDEX po_approval_workflows_purchase_order_id_key ON public.po_approval_workflows USING btree (purchase_order_id);
CREATE INDEX po_approvals_approver_idx ON public.po_approvals USING btree (approver_user_id);
CREATE INDEX po_approvals_po_idx ON public.po_approvals USING btree (purchase_order_id);
CREATE UNIQUE INDEX preferred_relationships_requester_customer_id_requester_com_key ON public.preferred_relationships USING btree (requester_customer_id, requester_company_id, preferred_company_id);
CREATE UNIQUE INDEX purchase_orders_company_id_po_number_key ON public.purchase_orders USING btree (company_id, po_number);
CREATE INDEX quote_analytics_company_idx ON public.quote_analytics USING btree (company_id);
CREATE INDEX quote_analytics_conversion_stage_idx ON public.quote_analytics USING btree (conversion_stage);
CREATE INDEX quote_analytics_sent_date_idx ON public.quote_analytics USING btree (quote_sent_date);
CREATE INDEX quote_analytics_work_order_idx ON public.quote_analytics USING btree (work_order_id);
CREATE INDEX quote_approval_workflows_approver_idx ON public.quote_approval_workflows USING btree (approver_user_id);
CREATE INDEX quote_approval_workflows_company_idx ON public.quote_approval_workflows USING btree (company_id);
CREATE INDEX quote_approval_workflows_sequence_idx ON public.quote_approval_workflows USING btree (work_order_id, sequence_order);
CREATE INDEX quote_approval_workflows_status_idx ON public.quote_approval_workflows USING btree (status);
CREATE INDEX quote_approval_workflows_work_order_idx ON public.quote_approval_workflows USING btree (work_order_id);
CREATE INDEX quote_follow_ups_assigned_user_idx ON public.quote_follow_ups USING btree (assigned_user_id);
CREATE INDEX quote_follow_ups_company_idx ON public.quote_follow_ups USING btree (company_id);
CREATE INDEX quote_follow_ups_scheduled_date_idx ON public.quote_follow_ups USING btree (scheduled_date);
CREATE INDEX quote_follow_ups_status_idx ON public.quote_follow_ups USING btree (status);
CREATE INDEX quote_follow_ups_work_order_idx ON public.quote_follow_ups USING btree (work_order_id);
CREATE INDEX quote_templates_company_idx ON public.quote_templates USING btree (company_id);
CREATE UNIQUE INDEX reimbursement_requests_request_number_key ON public.reimbursement_requests USING btree (request_number);
CREATE UNIQUE INDEX service_categories_name_key ON public.service_categories USING btree (name);
CREATE UNIQUE INDEX service_tags_name_key ON public.service_tags USING btree (name);
CREATE UNIQUE INDEX subcontractors_email_key ON public.subcontractors USING btree (email);
CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);
CREATE UNIQUE INDEX tags_name_lower_unique ON public.tags USING btree (lower(name));
CREATE INDEX tags_name_trgm_idx ON public.tags USING gin (name gin_trgm_ops);
CREATE UNIQUE INDEX tool_preferences_user_id_tool_key_key ON public.tool_preferences USING btree (user_id, tool_key);
CREATE UNIQUE INDEX tool_usage_company_id_user_id_tool_name_key ON public.tool_usage USING btree (company_id, user_id, tool_name);
CREATE UNIQUE INDEX unique_item_location_company ON public.inventory_stock USING btree (item_id, location_id, company_id);
CREATE UNIQUE INDEX unique_request_response ON public.marketplace_responses USING btree (request_id, company_id);
CREATE UNIQUE INDEX unique_work_order_employee_date ON public.work_order_labor USING btree (work_order_id, employee_id, work_date);
CREATE UNIQUE INDEX uq_invoices_company_invoice_number ON public.invoices USING btree (company_id, invoice_number);
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);
CREATE UNIQUE INDEX ux_pto_emp_range ON public.employee_time_off USING btree (employee_id, starts_at, ends_at);
CREATE UNIQUE INDEX ux_wo_assign ON public.work_order_assignments USING btree (work_order_id, employee_id);
CREATE UNIQUE INDEX vendor_categories_company_id_name_key ON public.vendor_categories USING btree (company_id, name);
CREATE UNIQUE INDEX vendor_category_assignments_vendor_id_category_id_key ON public.vendor_category_assignments USING btree (vendor_id, category_id);
CREATE INDEX vendor_contacts_company_idx ON public.vendor_contacts USING btree (company_id);
CREATE INDEX vendor_contacts_vendor_idx ON public.vendor_contacts USING btree (vendor_id);
CREATE UNIQUE INDEX vendor_items_vendor_id_supplier_part_number_key ON public.vendor_items USING btree (vendor_id, supplier_part_number);
CREATE INDEX vendors_company_id_idx ON public.vendors USING btree (company_id);
CREATE INDEX vendors_email_idx ON public.vendors USING btree (company_id, email);
CREATE INDEX vendors_name_idx ON public.vendors USING btree (company_id, name);
CREATE INDEX vendors_status_history_changed_at_idx ON public.vendors_status_history USING btree (changed_at);
CREATE INDEX vendors_status_history_vendor_idx ON public.vendors_status_history USING btree (vendor_id);
CREATE INDEX vendors_status_idx ON public.vendors USING btree (company_id, status);
CREATE INDEX vendors_type_idx ON public.vendors USING btree (company_id, vendor_type);
CREATE INDEX wom_company_idx ON public.work_order_milestones USING btree (company_id);
CREATE INDEX wom_sort_idx ON public.work_order_milestones USING btree (work_order_id, sort_order);
CREATE INDEX wom_work_order_idx ON public.work_order_milestones USING btree (work_order_id);
CREATE UNIQUE INDEX work_orders_invoice_number_key ON public.work_orders USING btree (invoice_number);
CREATE UNIQUE INDEX work_orders_job_number_key ON public.work_orders USING btree (job_number);
CREATE UNIQUE INDEX work_orders_quote_number_key ON public.work_orders USING btree (quote_number);


-- SELECT 'ALTER TABLE ' || tc.table_name || 
ALTER TABLE attachments ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);
ALTER TABLE auto_accept_rules ADD CONSTRAINT auto_accept_rules_pkey PRIMARY KEY (id);
ALTER TABLE auto_patches ADD CONSTRAINT auto_patches_pkey PRIMARY KEY (id);
ALTER TABLE business_settings ADD CONSTRAINT business_settings_pkey PRIMARY KEY (id);
ALTER TABLE companies ADD CONSTRAINT companies_pkey PRIMARY KEY (id);
ALTER TABLE company_approval_settings ADD CONSTRAINT company_approval_settings_pkey PRIMARY KEY (id);
ALTER TABLE company_customers ADD CONSTRAINT company_customers_pkey PRIMARY KEY (id);
ALTER TABLE company_document_templates ADD CONSTRAINT company_document_templates_pkey PRIMARY KEY (id);
ALTER TABLE company_service_tags ADD CONSTRAINT company_service_tags_pkey PRIMARY KEY (id);
ALTER TABLE company_settings ADD CONSTRAINT company_settings_pkey PRIMARY KEY (id);
ALTER TABLE company_tags ADD CONSTRAINT company_tags_pkey PRIMARY KEY (tag_id, company_id);
ALTER TABLE contractor_ratings ADD CONSTRAINT contractor_ratings_pkey PRIMARY KEY (id);
ALTER TABLE coupons ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);
ALTER TABLE customer_addresses ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);
ALTER TABLE customer_communications ADD CONSTRAINT customer_communications_pkey PRIMARY KEY (id);
ALTER TABLE customer_messages ADD CONSTRAINT customer_messages_pkey PRIMARY KEY (id);
ALTER TABLE customer_portal_accounts ADD CONSTRAINT customer_portal_accounts_pkey PRIMARY KEY (id);
ALTER TABLE customer_reviews ADD CONSTRAINT customer_reviews_pkey PRIMARY KEY (id);
ALTER TABLE customer_service_agreements ADD CONSTRAINT customer_service_agreements_pkey PRIMARY KEY (id);
ALTER TABLE customer_signatures ADD CONSTRAINT customer_signatures_pkey PRIMARY KEY (id);
ALTER TABLE customer_tags ADD CONSTRAINT customer_tags_pkey PRIMARY KEY (id);
ALTER TABLE customers ADD CONSTRAINT customers_pkey PRIMARY KEY (id);
ALTER TABLE customers_status_history ADD CONSTRAINT customers_status_history_pkey PRIMARY KEY (id);
ALTER TABLE decline_reason_codes ADD CONSTRAINT decline_reason_codes_pkey PRIMARY KEY (code);
ALTER TABLE default_expense_categories ADD CONSTRAINT default_expense_categories_pkey PRIMARY KEY (id);
ALTER TABLE document_access_log ADD CONSTRAINT document_access_log_pkey PRIMARY KEY (id);
ALTER TABLE document_templates ADD CONSTRAINT document_templates_pkey PRIMARY KEY (id);
ALTER TABLE document_versions ADD CONSTRAINT document_versions_pkey PRIMARY KEY (id);
ALTER TABLE document_workflows ADD CONSTRAINT document_workflows_pkey PRIMARY KEY (id);
ALTER TABLE documents ADD CONSTRAINT documents_pkey PRIMARY KEY (id);
ALTER TABLE employee_certifications ADD CONSTRAINT employee_certifications_pkey PRIMARY KEY (id);
ALTER TABLE employee_compensation ADD CONSTRAINT employee_compensation_pkey PRIMARY KEY (id);
ALTER TABLE employee_development_goals ADD CONSTRAINT employee_development_goals_pkey PRIMARY KEY (id);
ALTER TABLE employee_pay_rates ADD CONSTRAINT employee_pay_rates_pkey PRIMARY KEY (id);
ALTER TABLE employee_performance_reviews ADD CONSTRAINT employee_performance_reviews_pkey PRIMARY KEY (id);
ALTER TABLE employee_pto_balances ADD CONSTRAINT employee_pto_balances_pkey PRIMARY KEY (id);
ALTER TABLE employee_pto_policies ADD CONSTRAINT employee_pto_policies_pkey PRIMARY KEY (id);
ALTER TABLE employee_recognition ADD CONSTRAINT employee_recognition_pkey PRIMARY KEY (id);
ALTER TABLE employee_skills ADD CONSTRAINT employee_skills_pkey PRIMARY KEY (id);
ALTER TABLE employee_time_off ADD CONSTRAINT employee_time_off_pkey PRIMARY KEY (id);
ALTER TABLE employee_time_summary ADD CONSTRAINT employee_time_summary_pkey PRIMARY KEY (id);
ALTER TABLE employee_timesheets ADD CONSTRAINT employee_timesheets_pkey PRIMARY KEY (id);
ALTER TABLE employees ADD CONSTRAINT employees_pkey PRIMARY KEY (id);
ALTER TABLE esignatures ADD CONSTRAINT esignatures_pkey PRIMARY KEY (id);
ALTER TABLE expense_categories ADD CONSTRAINT expense_categories_pkey PRIMARY KEY (id);
ALTER TABLE expense_reimbursements ADD CONSTRAINT expense_reimbursements_pkey PRIMARY KEY (id);
ALTER TABLE expenses ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);
ALTER TABLE integration_settings ADD CONSTRAINT integration_settings_pkey PRIMARY KEY (id);
ALTER TABLE integration_tokens ADD CONSTRAINT integration_tokens_pkey PRIMARY KEY (id);
ALTER TABLE inventory_batches ADD CONSTRAINT inventory_batches_pkey PRIMARY KEY (id);
ALTER TABLE inventory_cycle_count_items ADD CONSTRAINT inventory_cycle_count_items_pkey PRIMARY KEY (id);
ALTER TABLE inventory_cycle_counts ADD CONSTRAINT inventory_cycle_counts_pkey PRIMARY KEY (id);
ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);
ALTER TABLE inventory_locations ADD CONSTRAINT inventory_locations_pkey PRIMARY KEY (id);
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);
ALTER TABLE inventory_scan_log ADD CONSTRAINT inventory_scan_log_pkey PRIMARY KEY (id);
ALTER TABLE inventory_serial_numbers ADD CONSTRAINT inventory_serial_numbers_pkey PRIMARY KEY (id);
ALTER TABLE inventory_stock ADD CONSTRAINT inventory_stock_pkey PRIMARY KEY (id);
ALTER TABLE invoice_commissions ADD CONSTRAINT invoice_commissions_pkey PRIMARY KEY (id);
ALTER TABLE invoice_items ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);
ALTER TABLE invoice_payments ADD CONSTRAINT invoice_payments_pkey PRIMARY KEY (id);
ALTER TABLE invoices ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);
ALTER TABLE items_catalog ADD CONSTRAINT items_catalog_pkey PRIMARY KEY (id);
ALTER TABLE job_assignments ADD CONSTRAINT job_assignments_pkey PRIMARY KEY (id);
ALTER TABLE job_photos ADD CONSTRAINT job_photos_pkey PRIMARY KEY (id);
ALTER TABLE job_triggers ADD CONSTRAINT job_triggers_pkey PRIMARY KEY (id);
ALTER TABLE leads ADD CONSTRAINT leads_pkey PRIMARY KEY (id);
ALTER TABLE marketplace_cancellations ADD CONSTRAINT marketplace_cancellations_pkey PRIMARY KEY (id);
ALTER TABLE marketplace_notifications ADD CONSTRAINT marketplace_notifications_pkey PRIMARY KEY (id);
ALTER TABLE marketplace_request_decline_stats ADD CONSTRAINT marketplace_request_decline_stats_pkey PRIMARY KEY (id);
ALTER TABLE marketplace_request_roles ADD CONSTRAINT marketplace_request_roles_pkey PRIMARY KEY (id);
ALTER TABLE marketplace_request_tags ADD CONSTRAINT marketplace_request_tags_pkey PRIMARY KEY (tag_id, request_id);
ALTER TABLE marketplace_requests ADD CONSTRAINT marketplace_requests_pkey PRIMARY KEY (id);
ALTER TABLE marketplace_responses ADD CONSTRAINT marketplace_responses_pkey PRIMARY KEY (id);
ALTER TABLE marketplace_reviews ADD CONSTRAINT marketplace_reviews_pkey PRIMARY KEY (id);
ALTER TABLE messages ADD CONSTRAINT messages_pkey PRIMARY KEY (id, id, inserted_at);
ALTER TABLE notification_settings ADD CONSTRAINT notification_settings_pkey PRIMARY KEY (id);
ALTER TABLE notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE opportunities ADD CONSTRAINT opportunities_pkey PRIMARY KEY (id);
ALTER TABLE payments ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
ALTER TABLE po_approval_actions ADD CONSTRAINT po_approval_actions_pkey PRIMARY KEY (id);
ALTER TABLE po_approval_rules ADD CONSTRAINT po_approval_rules_pkey PRIMARY KEY (id);
ALTER TABLE po_approval_workflows ADD CONSTRAINT po_approval_workflows_pkey PRIMARY KEY (id);
ALTER TABLE po_approvals ADD CONSTRAINT po_approvals_pkey PRIMARY KEY (id);
ALTER TABLE po_items ADD CONSTRAINT po_items_pkey PRIMARY KEY (id);
ALTER TABLE po_status_history ADD CONSTRAINT po_status_history_pkey PRIMARY KEY (id);
ALTER TABLE preferred_relationships ADD CONSTRAINT preferred_relationships_pkey PRIMARY KEY (id);
ALTER TABLE pto_ledger ADD CONSTRAINT pto_ledger_pkey PRIMARY KEY (id);
ALTER TABLE pto_policies ADD CONSTRAINT pto_policies_pkey PRIMARY KEY (id);
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);
ALTER TABLE quote_analytics ADD CONSTRAINT quote_analytics_pkey PRIMARY KEY (id);
ALTER TABLE quote_approval_workflows ADD CONSTRAINT quote_approval_workflows_pkey PRIMARY KEY (id);
ALTER TABLE quote_follow_ups ADD CONSTRAINT quote_follow_ups_pkey PRIMARY KEY (id);
ALTER TABLE quote_templates ADD CONSTRAINT quote_templates_pkey PRIMARY KEY (id);
ALTER TABLE quote_tool_access ADD CONSTRAINT quote_tool_access_pkey PRIMARY KEY (id);
ALTER TABLE quote_tool_tiers ADD CONSTRAINT quote_tool_tiers_pkey PRIMARY KEY (id);
ALTER TABLE quote_tool_usage ADD CONSTRAINT quote_tool_usage_pkey PRIMARY KEY (id);
ALTER TABLE quote_tools ADD CONSTRAINT quote_tools_pkey PRIMARY KEY (id);
ALTER TABLE rates_pricing_settings ADD CONSTRAINT rates_pricing_settings_pkey PRIMARY KEY (id);
ALTER TABLE recurring_jobs ADD CONSTRAINT recurring_jobs_pkey PRIMARY KEY (id);
ALTER TABLE reimbursement_requests ADD CONSTRAINT reimbursement_requests_pkey PRIMARY KEY (id);
ALTER TABLE request_tags ADD CONSTRAINT request_tags_pkey PRIMARY KEY (tag_id, request_id);
ALTER TABLE route_optimizations ADD CONSTRAINT route_optimizations_pkey PRIMARY KEY (id);
ALTER TABLE sales_activities ADD CONSTRAINT sales_activities_pkey PRIMARY KEY (id);
ALTER TABLE sales_targets ADD CONSTRAINT sales_targets_pkey PRIMARY KEY (id);
ALTER TABLE schedule_events ADD CONSTRAINT schedule_events_pkey PRIMARY KEY (id);
ALTER TABLE service_categories ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);
ALTER TABLE service_contracts ADD CONSTRAINT service_contracts_pkey PRIMARY KEY (id);
ALTER TABLE service_request_responses ADD CONSTRAINT service_request_responses_pkey PRIMARY KEY (id);
ALTER TABLE service_requests ADD CONSTRAINT service_requests_pkey PRIMARY KEY (id);
ALTER TABLE service_tags ADD CONSTRAINT service_tags_pkey PRIMARY KEY (id);
ALTER TABLE settings ADD CONSTRAINT settings_pkey PRIMARY KEY (id);
ALTER TABLE shared_document_templates ADD CONSTRAINT shared_document_templates_pkey PRIMARY KEY (id);
ALTER TABLE signature_requests ADD CONSTRAINT signature_requests_pkey PRIMARY KEY (id);
ALTER TABLE subcontractor_documents ADD CONSTRAINT subcontractor_documents_pkey PRIMARY KEY (id);
ALTER TABLE subcontractor_timesheets ADD CONSTRAINT subcontractor_timesheets_pkey PRIMARY KEY (id);
ALTER TABLE subcontractor_work_orders ADD CONSTRAINT subcontractor_work_orders_pkey PRIMARY KEY (id);
ALTER TABLE subcontractors ADD CONSTRAINT subcontractors_pkey PRIMARY KEY (id);
ALTER TABLE tags ADD CONSTRAINT tags_pkey PRIMARY KEY (id);
ALTER TABLE technician_locations ADD CONSTRAINT technician_locations_pkey PRIMARY KEY (id);
ALTER TABLE tool_preferences ADD CONSTRAINT tool_preferences_pkey PRIMARY KEY (id);
ALTER TABLE tool_usage ADD CONSTRAINT tool_usage_pkey PRIMARY KEY (id);
ALTER TABLE ui_preferences ADD CONSTRAINT ui_preferences_pkey PRIMARY KEY (id);
ALTER TABLE user_dashboard_settings ADD CONSTRAINT user_dashboard_settings_pkey PRIMARY KEY (id);
ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (id);
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id, id);
ALTER TABLE vendor_categories ADD CONSTRAINT vendor_categories_pkey PRIMARY KEY (id);
ALTER TABLE vendor_category_assignments ADD CONSTRAINT vendor_category_assignments_pkey PRIMARY KEY (id);
ALTER TABLE vendor_contacts ADD CONSTRAINT vendor_contacts_pkey PRIMARY KEY (id);
ALTER TABLE vendor_items ADD CONSTRAINT vendor_items_pkey PRIMARY KEY (id);
ALTER TABLE vendor_pricing_history ADD CONSTRAINT vendor_pricing_history_pkey PRIMARY KEY (id);
ALTER TABLE vendors ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);
ALTER TABLE vendors_status_history ADD CONSTRAINT vendors_status_history_pkey PRIMARY KEY (id);
ALTER TABLE wo_audit ADD CONSTRAINT wo_audit_pkey PRIMARY KEY (id);
ALTER TABLE work_order_assignments ADD CONSTRAINT work_order_assignments_pkey PRIMARY KEY (id);
ALTER TABLE work_order_audit ADD CONSTRAINT work_order_audit_pkey PRIMARY KEY (id);
ALTER TABLE work_order_audit_log ADD CONSTRAINT work_order_audit_log_pkey PRIMARY KEY (id);
ALTER TABLE work_order_items ADD CONSTRAINT work_order_items_pkey PRIMARY KEY (id);
ALTER TABLE work_order_labor ADD CONSTRAINT work_order_labor_pkey PRIMARY KEY (id);
ALTER TABLE work_order_milestones ADD CONSTRAINT work_order_milestones_pkey PRIMARY KEY (id);
ALTER TABLE work_order_versions ADD CONSTRAINT work_order_versions_pkey PRIMARY KEY (id);
ALTER TABLE work_orders ADD CONSTRAINT work_orders_pkey PRIMARY KEY (id);
ALTER TABLE workflow_approvals ADD CONSTRAINT workflow_approvals_pkey PRIMARY KEY (id);


-- SELECT 'ALTER TABLE ' || tc.table_name || 
ALTER TABLE attachments ADD CONSTRAINT fk_attachments_company_id FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE attachments ADD CONSTRAINT attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES users(id);
ALTER TABLE auto_accept_rules ADD CONSTRAINT auto_accept_rules_requester_company_id_fkey FOREIGN KEY (requester_company_id) REFERENCES companies(id);
ALTER TABLE business_settings ADD CONSTRAINT business_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE company_approval_settings ADD CONSTRAINT company_approval_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE company_customers ADD CONSTRAINT company_customers_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE company_customers ADD CONSTRAINT company_customers_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE company_document_templates ADD CONSTRAINT company_document_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE company_service_tags ADD CONSTRAINT company_service_tags_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE company_service_tags ADD CONSTRAINT company_service_tags_service_tag_id_fkey FOREIGN KEY (service_tag_id) REFERENCES service_tags(id);
ALTER TABLE company_settings ADD CONSTRAINT company_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE company_tags ADD CONSTRAINT company_tags_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE company_tags ADD CONSTRAINT company_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES service_tags(id);
ALTER TABLE contractor_ratings ADD CONSTRAINT contractor_ratings_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE contractor_ratings ADD CONSTRAINT contractor_ratings_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE contractor_ratings ADD CONSTRAINT contractor_ratings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE coupons ADD CONSTRAINT coupons_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE customer_addresses ADD CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE customer_messages ADD CONSTRAINT customer_messages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE customer_messages ADD CONSTRAINT customer_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES users(id);
ALTER TABLE customer_messages ADD CONSTRAINT customer_messages_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE customer_portal_accounts ADD CONSTRAINT fk_customer_portal_customer FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE customer_portal_accounts ADD CONSTRAINT customer_portal_accounts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE customer_portal_accounts ADD CONSTRAINT customer_portal_accounts_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES companies(id);
ALTER TABLE customer_reviews ADD CONSTRAINT customer_reviews_company_fk FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE customer_reviews ADD CONSTRAINT customer_reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE customer_signatures ADD CONSTRAINT customer_signatures_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE customer_signatures ADD CONSTRAINT customer_signatures_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE customers ADD CONSTRAINT customers_portal_account_id_fkey FOREIGN KEY (portal_account_id) REFERENCES customer_portal_accounts(id);
ALTER TABLE customers ADD CONSTRAINT customers_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE customers ADD CONSTRAINT customers_portal_account_fk FOREIGN KEY (portal_account_id) REFERENCES customer_portal_accounts(id);
ALTER TABLE customers ADD CONSTRAINT customers_preferred_tech_id_fkey FOREIGN KEY (preferred_technician) REFERENCES users(id);
ALTER TABLE customers_status_history ADD CONSTRAINT customers_status_history_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE document_access_log ADD CONSTRAINT document_access_log_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE document_access_log ADD CONSTRAINT document_access_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE document_access_log ADD CONSTRAINT document_access_log_document_id_fkey FOREIGN KEY (document_id) REFERENCES documents(id);
ALTER TABLE document_templates ADD CONSTRAINT document_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE document_versions ADD CONSTRAINT document_versions_document_id_fkey FOREIGN KEY (document_id) REFERENCES documents(id);
ALTER TABLE document_versions ADD CONSTRAINT document_versions_previous_version_id_fkey FOREIGN KEY (previous_version_id) REFERENCES document_versions(id);
ALTER TABLE document_versions ADD CONSTRAINT document_versions_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE document_versions ADD CONSTRAINT document_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE document_workflows ADD CONSTRAINT document_workflows_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE document_workflows ADD CONSTRAINT document_workflows_document_id_fkey FOREIGN KEY (document_id) REFERENCES documents(id);
ALTER TABLE document_workflows ADD CONSTRAINT document_workflows_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE documents ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES users(id);
ALTER TABLE documents ADD CONSTRAINT documents_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE documents ADD CONSTRAINT documents_parent_document_id_fkey FOREIGN KEY (parent_document_id) REFERENCES documents(id);
ALTER TABLE employee_certifications ADD CONSTRAINT employee_certifications_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE employee_certifications ADD CONSTRAINT employee_certifications_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE employee_compensation ADD CONSTRAINT employee_compensation_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE employee_development_goals ADD CONSTRAINT employee_development_goals_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE employee_development_goals ADD CONSTRAINT employee_development_goals_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES users(id);
ALTER TABLE employee_development_goals ADD CONSTRAINT employee_development_goals_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE employee_pay_rates ADD CONSTRAINT employee_pay_rates_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE employee_pay_rates ADD CONSTRAINT employee_pay_rates_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE employee_performance_reviews ADD CONSTRAINT employee_performance_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES users(id);
ALTER TABLE employee_performance_reviews ADD CONSTRAINT employee_performance_reviews_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE employee_performance_reviews ADD CONSTRAINT employee_performance_reviews_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE employee_pto_balances ADD CONSTRAINT employee_pto_balances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE employee_pto_balances ADD CONSTRAINT employee_pto_balances_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE employee_pto_policies ADD CONSTRAINT employee_pto_policies_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES pto_policies(id);
ALTER TABLE employee_pto_policies ADD CONSTRAINT employee_pto_policies_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE employee_recognition ADD CONSTRAINT employee_recognition_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE employee_recognition ADD CONSTRAINT employee_recognition_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE employee_recognition ADD CONSTRAINT employee_recognition_given_by_fkey FOREIGN KEY (given_by) REFERENCES users(id);
ALTER TABLE employee_skills ADD CONSTRAINT employee_skills_assessed_by_fkey FOREIGN KEY (assessed_by) REFERENCES users(id);
ALTER TABLE employee_skills ADD CONSTRAINT employee_skills_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE employee_skills ADD CONSTRAINT employee_skills_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE employee_time_off ADD CONSTRAINT employee_time_off_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES users(id);
ALTER TABLE employee_time_off ADD CONSTRAINT employee_time_off_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES pto_policies(id);
ALTER TABLE employee_time_summary ADD CONSTRAINT employee_time_summary_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE employee_time_summary ADD CONSTRAINT employee_time_summary_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE employee_timesheets ADD CONSTRAINT employee_timesheets_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES users(id);
ALTER TABLE employee_timesheets ADD CONSTRAINT employee_timesheets_denied_by_fkey FOREIGN KEY (denied_by) REFERENCES users(id);
ALTER TABLE employee_timesheets ADD CONSTRAINT employee_timesheets_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE employee_timesheets ADD CONSTRAINT employee_timesheets_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE employee_timesheets ADD CONSTRAINT employee_timesheets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE esignatures ADD CONSTRAINT esignatures_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id);
ALTER TABLE esignatures ADD CONSTRAINT esignatures_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE esignatures ADD CONSTRAINT esignatures_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE expense_categories ADD CONSTRAINT expense_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE expense_reimbursements ADD CONSTRAINT expense_reimbursements_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE expense_reimbursements ADD CONSTRAINT expense_reimbursements_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES expenses(id);
ALTER TABLE expenses ADD CONSTRAINT expenses_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE integration_settings ADD CONSTRAINT integration_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE integration_tokens ADD CONSTRAINT integration_tokens_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE inventory_batches ADD CONSTRAINT inventory_batches_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id);
ALTER TABLE inventory_cycle_count_items ADD CONSTRAINT inventory_cycle_count_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id);
ALTER TABLE inventory_cycle_count_items ADD CONSTRAINT inventory_cycle_count_items_cycle_count_id_fkey FOREIGN KEY (cycle_count_id) REFERENCES inventory_cycle_counts(id);
ALTER TABLE inventory_cycle_counts ADD CONSTRAINT inventory_cycle_counts_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE inventory_locations ADD CONSTRAINT inventory_locations_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_location_id_fkey FOREIGN KEY (location_id) REFERENCES inventory_locations(id);
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory_items(id);
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_related_work_order_id_fkey FOREIGN KEY (related_work_order_id) REFERENCES work_orders(id);
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movements_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE inventory_scan_log ADD CONSTRAINT inventory_scan_log_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id);
ALTER TABLE inventory_scan_log ADD CONSTRAINT inventory_scan_log_scanned_by_fkey FOREIGN KEY (scanned_by) REFERENCES users(id);
ALTER TABLE inventory_serial_numbers ADD CONSTRAINT inventory_serial_numbers_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id);
ALTER TABLE inventory_stock ADD CONSTRAINT inventory_stock_location_id_fkey FOREIGN KEY (location_id) REFERENCES inventory_locations(id);
ALTER TABLE inventory_stock ADD CONSTRAINT inventory_stock_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory_items(id);
ALTER TABLE inventory_stock ADD CONSTRAINT inventory_stock_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE invoice_commissions ADD CONSTRAINT invoice_commissions_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE invoice_commissions ADD CONSTRAINT invoice_commissions_sales_rep_id_fkey FOREIGN KEY (sales_rep_id) REFERENCES users(id);
ALTER TABLE invoice_commissions ADD CONSTRAINT invoice_commissions_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id);
ALTER TABLE invoice_items ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id);
ALTER TABLE invoice_payments ADD CONSTRAINT invoice_payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id);
ALTER TABLE invoices ADD CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE invoices ADD CONSTRAINT invoices_company_fk FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE invoices ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE invoices ADD CONSTRAINT invoices_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES coupons(id);
ALTER TABLE job_assignments ADD CONSTRAINT job_assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE job_assignments ADD CONSTRAINT job_assignments_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE job_photos ADD CONSTRAINT fk_job_photos_company_id FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE job_photos ADD CONSTRAINT job_photos_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES users(id);
ALTER TABLE job_photos ADD CONSTRAINT job_photos_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE job_triggers ADD CONSTRAINT job_triggers_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE leads ADD CONSTRAINT leads_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE leads ADD CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES users(id);
ALTER TABLE marketplace_cancellations ADD CONSTRAINT marketplace_cancellations_canceled_by_customer_id_fkey FOREIGN KEY (canceled_by_customer_id) REFERENCES customers(id);
ALTER TABLE marketplace_cancellations ADD CONSTRAINT marketplace_cancellations_canceled_by_company_id_fkey FOREIGN KEY (canceled_by_company_id) REFERENCES companies(id);
ALTER TABLE marketplace_cancellations ADD CONSTRAINT marketplace_cancellations_request_id_fkey FOREIGN KEY (request_id) REFERENCES marketplace_requests(id);
ALTER TABLE marketplace_request_decline_stats ADD CONSTRAINT marketplace_request_decline_stats_reason_code_fkey FOREIGN KEY (reason_code) REFERENCES decline_reason_codes(code);
ALTER TABLE marketplace_request_decline_stats ADD CONSTRAINT marketplace_request_decline_stats_request_id_fkey FOREIGN KEY (request_id) REFERENCES marketplace_requests(id);
ALTER TABLE marketplace_request_roles ADD CONSTRAINT marketplace_request_roles_category_id_fkey FOREIGN KEY (category_id) REFERENCES service_categories(id);
ALTER TABLE marketplace_request_roles ADD CONSTRAINT marketplace_request_roles_request_id_fkey FOREIGN KEY (request_id) REFERENCES marketplace_requests(id);
ALTER TABLE marketplace_request_tags ADD CONSTRAINT marketplace_request_tags_request_id_fkey FOREIGN KEY (request_id) REFERENCES marketplace_requests(id);
ALTER TABLE marketplace_request_tags ADD CONSTRAINT marketplace_request_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES service_tags(id);
ALTER TABLE marketplace_requests ADD CONSTRAINT marketplace_requests_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE marketplace_requests ADD CONSTRAINT fk_marketplace_requests_booked_response FOREIGN KEY (booked_response_id) REFERENCES marketplace_responses(id);
ALTER TABLE marketplace_requests ADD CONSTRAINT marketplace_requests_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE marketplace_responses ADD CONSTRAINT marketplace_responses_role_id_fkey FOREIGN KEY (role_id) REFERENCES marketplace_request_roles(id);
ALTER TABLE marketplace_responses ADD CONSTRAINT marketplace_responses_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE marketplace_responses ADD CONSTRAINT marketplace_responses_request_id_fkey FOREIGN KEY (request_id) REFERENCES marketplace_requests(id);
ALTER TABLE marketplace_reviews ADD CONSTRAINT marketplace_reviews_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE marketplace_reviews ADD CONSTRAINT marketplace_reviews_request_id_fkey FOREIGN KEY (request_id) REFERENCES marketplace_requests(id);
ALTER TABLE marketplace_reviews ADD CONSTRAINT marketplace_reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE messages ADD CONSTRAINT messages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE messages ADD CONSTRAINT messages_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES service_requests(id);
ALTER TABLE messages ADD CONSTRAINT messages_recipient_fkey FOREIGN KEY (recipient_id) REFERENCES employees(id);
ALTER TABLE messages ADD CONSTRAINT messages_sender_fkey FOREIGN KEY (sender_id) REFERENCES employees(id);
ALTER TABLE messages ADD CONSTRAINT messages_company_fk FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE messages ADD CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES employees(id);
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES users(id);
ALTER TABLE messages ADD CONSTRAINT messages_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE notification_settings ADD CONSTRAINT notification_settings_company_fk FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE notifications ADD CONSTRAINT notifications_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE opportunities ADD CONSTRAINT opportunities_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id);
ALTER TABLE opportunities ADD CONSTRAINT opportunities_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE opportunities ADD CONSTRAINT opportunities_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES work_orders(id);
ALTER TABLE opportunities ADD CONSTRAINT opportunities_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE opportunities ADD CONSTRAINT opportunities_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES users(id);
ALTER TABLE payments ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id);
ALTER TABLE payments ADD CONSTRAINT payments_company_fk FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE po_approval_actions ADD CONSTRAINT po_approval_actions_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES po_approval_workflows(id);
ALTER TABLE po_approval_actions ADD CONSTRAINT po_approval_actions_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES users(id);
ALTER TABLE po_approval_rules ADD CONSTRAINT po_approval_rules_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE po_approval_rules ADD CONSTRAINT po_approval_rules_approver_user_id_fkey FOREIGN KEY (approver_user_id) REFERENCES users(id);
ALTER TABLE po_approval_rules ADD CONSTRAINT po_approval_rules_vendor_category_id_fkey FOREIGN KEY (vendor_category_id) REFERENCES vendor_categories(id);
ALTER TABLE po_approval_workflows ADD CONSTRAINT po_approval_workflows_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id);
ALTER TABLE po_approval_workflows ADD CONSTRAINT po_approval_workflows_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE po_approval_workflows ADD CONSTRAINT po_approval_workflows_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE po_approvals ADD CONSTRAINT po_approvals_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE po_approvals ADD CONSTRAINT po_approvals_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id);
ALTER TABLE po_approvals ADD CONSTRAINT po_approvals_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES po_approval_rules(id);
ALTER TABLE po_approvals ADD CONSTRAINT po_approvals_approver_user_id_fkey FOREIGN KEY (approver_user_id) REFERENCES users(id);
ALTER TABLE po_items ADD CONSTRAINT po_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id);
ALTER TABLE po_items ADD CONSTRAINT po_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id);
ALTER TABLE po_items ADD CONSTRAINT po_items_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE po_items ADD CONSTRAINT fk_po_items_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id);
ALTER TABLE po_status_history ADD CONSTRAINT po_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES users(id);
ALTER TABLE po_status_history ADD CONSTRAINT po_status_history_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE po_status_history ADD CONSTRAINT po_status_history_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id);
ALTER TABLE preferred_relationships ADD CONSTRAINT preferred_relationships_requester_company_id_fkey FOREIGN KEY (requester_company_id) REFERENCES companies(id);
ALTER TABLE preferred_relationships ADD CONSTRAINT preferred_relationships_preferred_company_id_fkey FOREIGN KEY (preferred_company_id) REFERENCES companies(id);
ALTER TABLE preferred_relationships ADD CONSTRAINT preferred_relationships_requester_customer_id_fkey FOREIGN KEY (requester_customer_id) REFERENCES customers(id);
ALTER TABLE pto_ledger ADD CONSTRAINT pto_ledger_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES pto_policies(id);
ALTER TABLE pto_ledger ADD CONSTRAINT pto_ledger_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE pto_policies ADD CONSTRAINT pto_policies_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id);
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_related_work_order_id_fkey FOREIGN KEY (related_work_order_id) REFERENCES work_orders(id);
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE purchase_orders ADD CONSTRAINT fk_po_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id);
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES users(id);
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES users(id);
ALTER TABLE quote_analytics ADD CONSTRAINT quote_analytics_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE quote_analytics ADD CONSTRAINT quote_analytics_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE quote_approval_workflows ADD CONSTRAINT quote_approval_workflows_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE quote_approval_workflows ADD CONSTRAINT quote_approval_workflows_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE quote_approval_workflows ADD CONSTRAINT quote_approval_workflows_approver_user_id_fkey FOREIGN KEY (approver_user_id) REFERENCES users(id);
ALTER TABLE quote_follow_ups ADD CONSTRAINT quote_follow_ups_assigned_user_id_fkey FOREIGN KEY (assigned_user_id) REFERENCES users(id);
ALTER TABLE quote_follow_ups ADD CONSTRAINT quote_follow_ups_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE quote_follow_ups ADD CONSTRAINT quote_follow_ups_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE quote_tool_access ADD CONSTRAINT quote_tool_access_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES quote_tools(id);
ALTER TABLE quote_tool_tiers ADD CONSTRAINT quote_tool_tiers_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES quote_tools(id);
ALTER TABLE quote_tool_usage ADD CONSTRAINT quote_tool_usage_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES quote_tool_tiers(id);
ALTER TABLE quote_tool_usage ADD CONSTRAINT quote_tool_usage_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE quote_tool_usage ADD CONSTRAINT quote_tool_usage_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES quote_tools(id);
ALTER TABLE quote_tools ADD CONSTRAINT quote_tools_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE rates_pricing_settings ADD CONSTRAINT rates_pricing_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE recurring_jobs ADD CONSTRAINT recurring_jobs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE recurring_jobs ADD CONSTRAINT recurring_jobs_company_fk FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE reimbursement_requests ADD CONSTRAINT reimbursement_requests_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES users(id);
ALTER TABLE reimbursement_requests ADD CONSTRAINT reimbursement_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE reimbursement_requests ADD CONSTRAINT reimbursement_requests_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE reimbursement_requests ADD CONSTRAINT reimbursement_requests_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES users(id);
ALTER TABLE request_tags ADD CONSTRAINT request_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES tags(id);
ALTER TABLE request_tags ADD CONSTRAINT request_tags_request_id_fkey FOREIGN KEY (request_id) REFERENCES marketplace_requests(id);
ALTER TABLE route_optimizations ADD CONSTRAINT route_optimizations_company_fk FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE sales_activities ADD CONSTRAINT sales_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE sales_activities ADD CONSTRAINT sales_activities_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE sales_targets ADD CONSTRAINT sales_targets_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE sales_targets ADD CONSTRAINT sales_targets_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE schedule_events ADD CONSTRAINT schedule_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE schedule_events ADD CONSTRAINT schedule_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE schedule_events ADD CONSTRAINT schedule_events_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE schedule_events ADD CONSTRAINT schedule_events_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE schedule_events ADD CONSTRAINT schedule_events_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE schedule_events ADD CONSTRAINT schedule_events_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE service_contracts ADD CONSTRAINT service_contracts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE service_contracts ADD CONSTRAINT service_contracts_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE service_request_responses ADD CONSTRAINT service_request_responses_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES service_requests(id);
ALTER TABLE service_request_responses ADD CONSTRAINT service_request_responses_contractor_company_id_fkey FOREIGN KEY (contractor_company_id) REFERENCES companies(id);
ALTER TABLE service_request_responses ADD CONSTRAINT service_request_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES employees(id);
ALTER TABLE service_requests ADD CONSTRAINT service_requests_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE service_requests ADD CONSTRAINT service_requests_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE service_requests ADD CONSTRAINT service_requests_claimed_by_company_id_fkey FOREIGN KEY (claimed_by_company_id) REFERENCES companies(id);
ALTER TABLE service_requests ADD CONSTRAINT service_requests_claimed_by_user_id_fkey FOREIGN KEY (claimed_by_user_id) REFERENCES users(id);
ALTER TABLE settings ADD CONSTRAINT settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE signature_requests ADD CONSTRAINT signature_requests_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE signature_requests ADD CONSTRAINT signature_requests_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE signature_requests ADD CONSTRAINT signature_requests_document_id_fkey FOREIGN KEY (document_id) REFERENCES documents(id);
ALTER TABLE subcontractor_documents ADD CONSTRAINT subcontractor_documents_subcontractor_id_fkey FOREIGN KEY (subcontractor_id) REFERENCES subcontractors(id);
ALTER TABLE subcontractor_timesheets ADD CONSTRAINT subcontractor_timesheets_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE subcontractor_timesheets ADD CONSTRAINT subcontractor_timesheets_subcontractor_id_fkey FOREIGN KEY (subcontractor_id) REFERENCES subcontractors(id);
ALTER TABLE subcontractor_work_orders ADD CONSTRAINT subcontractor_work_orders_subcontractor_id_fkey FOREIGN KEY (subcontractor_id) REFERENCES subcontractors(id);
ALTER TABLE subcontractor_work_orders ADD CONSTRAINT subcontractor_work_orders_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE subcontractors ADD CONSTRAINT subcontractors_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE technician_locations ADD CONSTRAINT technician_locations_company_fk FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE technician_locations ADD CONSTRAINT technician_locations_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE tool_preferences ADD CONSTRAINT tool_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE tool_usage ADD CONSTRAINT tool_usage_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE ui_preferences ADD CONSTRAINT ui_preferences_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE user_dashboard_settings ADD CONSTRAINT user_dashboard_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE users ADD CONSTRAINT users_invited_by_user_id_fkey FOREIGN KEY (invited_by_user_id) REFERENCES users(id);
ALTER TABLE users ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE vendor_categories ADD CONSTRAINT vendor_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE vendor_category_assignments ADD CONSTRAINT vendor_category_assignments_category_id_fkey FOREIGN KEY (category_id) REFERENCES vendor_categories(id);
ALTER TABLE vendor_category_assignments ADD CONSTRAINT vendor_category_assignments_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id);
ALTER TABLE vendor_contacts ADD CONSTRAINT vendor_contacts_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE vendor_contacts ADD CONSTRAINT vendor_contacts_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id);
ALTER TABLE vendor_items ADD CONSTRAINT vendor_items_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id);
ALTER TABLE vendor_items ADD CONSTRAINT vendor_items_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE vendor_items ADD CONSTRAINT vendor_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id);
ALTER TABLE vendor_pricing_history ADD CONSTRAINT vendor_pricing_history_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id);
ALTER TABLE vendor_pricing_history ADD CONSTRAINT vendor_pricing_history_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id);
ALTER TABLE vendor_pricing_history ADD CONSTRAINT vendor_pricing_history_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id);
ALTER TABLE vendor_pricing_history ADD CONSTRAINT vendor_pricing_history_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE vendors ADD CONSTRAINT vendors_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE vendors ADD CONSTRAINT vendors_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE vendors_status_history ADD CONSTRAINT vendors_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES users(id);
ALTER TABLE vendors_status_history ADD CONSTRAINT vendors_status_history_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id);
ALTER TABLE work_order_assignments ADD CONSTRAINT work_order_assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE work_order_assignments ADD CONSTRAINT work_order_assignments_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE work_order_assignments ADD CONSTRAINT work_order_assignments_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE work_order_audit ADD CONSTRAINT work_order_audit_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE work_order_audit_log ADD CONSTRAINT work_order_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE work_order_audit_log ADD CONSTRAINT work_order_audit_log_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE work_order_audit_log ADD CONSTRAINT work_order_audit_log_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE work_order_items ADD CONSTRAINT work_order_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id);
ALTER TABLE work_order_items ADD CONSTRAINT work_order_items_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE work_order_items ADD CONSTRAINT work_order_items_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE work_order_labor ADD CONSTRAINT work_order_labor_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE work_order_labor ADD CONSTRAINT work_order_labor_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id);
ALTER TABLE work_order_labor ADD CONSTRAINT work_order_labor_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE work_order_milestones ADD CONSTRAINT work_order_milestones_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE work_order_versions ADD CONSTRAINT work_order_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE work_order_versions ADD CONSTRAINT work_order_versions_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE work_order_versions ADD CONSTRAINT work_order_versions_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES work_orders(id);
ALTER TABLE work_orders ADD CONSTRAINT work_orders_parent_job_id_fkey FOREIGN KEY (parent_job_id) REFERENCES work_orders(id);
ALTER TABLE work_orders ADD CONSTRAINT work_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE work_orders ADD CONSTRAINT work_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE work_orders ADD CONSTRAINT work_orders_assigned_technician_id_fkey FOREIGN KEY (assigned_technician_id) REFERENCES users(id);
ALTER TABLE work_orders ADD CONSTRAINT work_orders_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE work_orders ADD CONSTRAINT work_orders_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id);
ALTER TABLE work_orders ADD CONSTRAINT fk_wo_marketplace_request FOREIGN KEY (marketplace_request_id) REFERENCES marketplace_requests(id);
ALTER TABLE work_orders ADD CONSTRAINT fk_wo_marketplace_response FOREIGN KEY (marketplace_response_id) REFERENCES marketplace_responses(id);
ALTER TABLE work_orders ADD CONSTRAINT work_orders_service_address_id_fkey FOREIGN KEY (service_address_id) REFERENCES customer_addresses(id);
ALTER TABLE workflow_approvals ADD CONSTRAINT workflow_approvals_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE workflow_approvals ADD CONSTRAINT workflow_approvals_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES document_workflows(id);
ALTER TABLE workflow_approvals ADD CONSTRAINT workflow_approvals_approver_user_id_fkey FOREIGN KEY (approver_user_id) REFERENCES users(id);


-- SELECT pg_get_functiondef(p.oid) || ';' as sql
CREATE OR REPLACE FUNCTION public._add_col_if_missing(p_schema text, p_table text, p_col text, p_type text, p_default text DEFAULT NULL::text, p_not_null boolean DEFAULT false)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = p_schema AND table_name = p_table AND column_name = p_col
  ) THEN
    EXECUTE format('ALTER TABLE %I.%I ADD COLUMN %I %s', p_schema, p_table, p_col, p_type);
    IF p_default IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN %I SET DEFAULT %s', p_schema, p_table, p_col, p_default);
    END IF;
    IF p_not_null THEN
      EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN %I SET NOT NULL', p_schema, p_table, p_col);
    END IF;
  END IF;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.accept_marketplace_response(_response_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
  _request_id uuid;
begin
  -- mark response as accepted
  update marketplace_responses
  set response_status = 'accepted'
  where id = _response_id;

  -- tie request to response
  update marketplace_requests
  set booked_response_id = _response_id,
      status = 'booked'
  where id = (select request_id from marketplace_responses where id = _response_id);

  -- mark all other responses as rejected
  update marketplace_responses
  set response_status = 'rejected'
  where request_id = (select request_id from marketplace_responses where id = _response_id)
    and id <> _response_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.accept_marketplace_response(_request_id uuid, _response_id uuid, _customer_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
  v_response marketplace_responses%rowtype;
  v_request marketplace_requests%rowtype;
  v_work_order_id uuid;
begin
  -- Load response
  select * into v_response
  from marketplace_responses
  where id = _response_id;

  if not found then
    raise exception 'Response not found';
  end if;

  -- Load request
  select * into v_request
  from marketplace_requests
  where id = _request_id;

  if not found then
    raise exception 'Request not found';
  end if;

  if v_request.booked_response_id is not null then
    raise exception 'Request already booked with another response';
  end if;

  -- Mark accepted
  update marketplace_responses
  set response_status = 'ACCEPTED'
  where id = _response_id;

  -- Reject all others
  update marketplace_responses
  set response_status = 'REJECTED'
  where request_id = _request_id
    and id <> _response_id;

  -- Link request
  update marketplace_requests
  set booked_response_id = _response_id,
      status = 'booked'
  where id = _request_id;

  -- Always create a work order in QUOTE
  insert into work_orders (
    company_id,
    customer_id,
    marketplace_request_id,
    marketplace_response_id,
    status,
    quote_amount,
    description,
    created_at
  )
  values (
    v_response.company_id,
    _customer_id,
    _request_id,
    _response_id,
    'QUOTE',  -- work_order_status_enum should already exist
    case
      when v_response.response_status = 'OFFERED' then v_response.proposed_rate
      else null
    end,
    v_request.description,
    now()
  )
  returning id into v_work_order_id;

  -- If OFFERED, mark quote as sent
  if v_response.response_status = 'OFFERED' then
    update work_orders
    set quote_sent_at = now()
    where id = v_work_order_id;
  end if;

end;
$function$
;
CREATE OR REPLACE FUNCTION public.accept_marketplace_response(_response_id uuid, _customer_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    _request_id uuid;
    new_work_order_id uuid;
BEGIN
    -- Find request
    SELECT request_id INTO _request_id
    FROM marketplace_responses
    WHERE id = _response_id;

    -- Mark chosen response as ACCEPTED
    UPDATE marketplace_responses
    SET response_status = 'ACCEPTED'
    WHERE id = _response_id;

    -- Decline all other responses for same request
    UPDATE marketplace_responses
    SET response_status = 'DECLINED'
    WHERE request_id = _request_id
      AND id <> _response_id;

    -- Create linked work order
    INSERT INTO work_orders (
        marketplace_request_id,
        marketplace_response_id,
        customer_id,
        status,
        created_at
    ) VALUES (
        _request_id,
        _response_id,
        _customer_id,
        'PENDING',
        now()
    )
    RETURNING id INTO new_work_order_id;

    RETURN new_work_order_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.accrue_pto()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Insert accrual entries for all employees with active policies
  INSERT INTO pto_ledger (id, employee_id, policy_id, entry_type, hours, created_at)
  SELECT
    gen_random_uuid(),
    e.id AS employee_id,
    p.id AS policy_id,
    'ACCRUAL' AS entry_type,
    p.vacation_hours_per_period AS hours,
    now()
  FROM employees e
  JOIN pto_policies p ON p.company_id = e.company_id
  WHERE p.vacation_hours_per_period > 0;

  -- Update balances for employees who just received accruals
  UPDATE pto_balances b
  SET balance = b.balance + sub.hours
  FROM (
    SELECT employee_id, SUM(hours) AS hours
    FROM pto_ledger
    WHERE entry_type = 'ACCRUAL'
      AND created_at::date = current_date
    GROUP BY employee_id
  ) sub
  WHERE b.employee_id = sub.employee_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.add_pto_ledger_entry(p_employee_id uuid, p_company_id uuid, p_category_code text DEFAULT 'VAC'::text, p_entry_type text DEFAULT 'ACCRUAL'::text, p_hours numeric DEFAULT 0, p_effective_date date DEFAULT CURRENT_DATE, p_description text DEFAULT NULL::text, p_related_request_id uuid DEFAULT NULL::uuid, p_processed_by uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  new_balance DECIMAL(8,2);
  entry_id UUID;
BEGIN
  -- Calculate new balance
  new_balance := get_pto_balance(p_employee_id, p_category_code, p_effective_date) + p_hours;

  -- Insert ledger entry
  INSERT INTO pto_ledger (
    employee_id, company_id, category_code, entry_type, hours,
    effective_date, balance_after, description, related_request_id, processed_by
  ) VALUES (
    p_employee_id, p_company_id, p_category_code, p_entry_type, p_hours,
    p_effective_date, new_balance, p_description, p_related_request_id, p_processed_by
  ) RETURNING id INTO entry_id;

  RETURN entry_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.add_tag_to_company(_company_id uuid, _tag_name text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
    _tag_id uuid;
begin
    -- normalize input
    _tag_name := lower(trim(_tag_name));

    -- ensure tag exists in tags table
    insert into public.tags (name, category, is_curated)
    values (_tag_name, 'CUSTOM', false)
    on conflict (name) do nothing;

    -- get tag id
    select id into _tag_id
    from public.tags
    where name = _tag_name
    limit 1;

    -- link company to tag
    insert into public.company_tags (company_id, tag_id)
    values (_company_id, _tag_id)
    on conflict do nothing;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.add_tag_to_request(_request_id uuid, _tag_name text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
    _tag_id uuid;
begin
    -- normalize input
    _tag_name := lower(trim(_tag_name));

    -- ensure tag exists in tags table
    insert into public.tags (name, category, is_curated)
    values (_tag_name, 'CUSTOM', false)
    on conflict (name) do nothing;

    -- get tag id
    select id into _tag_id
    from public.tags
    where name = _tag_name
    limit 1;

    -- link request to tag
    insert into public.request_tags (request_id, tag_id)
    values (_request_id, _tag_id)
    on conflict do nothing;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.apply_patch(patch_id uuid)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
  patch auto_patches%ROWTYPE;
BEGIN
  SELECT * INTO patch FROM auto_patches WHERE id = patch_id;

  IF patch.status != 'pending' THEN
    RETURN json_build_object('status','error','message','Already applied or failed');
  END IF;

  BEGIN
    EXECUTE patch.sql_command;
    UPDATE auto_patches SET status='applied', applied_at=now() WHERE id=patch_id;
    RETURN json_build_object('status','success','patch_id',patch_id);
  EXCEPTION WHEN OTHERS THEN
    UPDATE auto_patches SET status='failed', error_message=SQLERRM WHERE id=patch_id;
    RETURN json_build_object('status','error','patch_id',patch_id,'message',SQLERRM);
  END;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.auto_generate_po_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.po_number IS NULL OR NEW.po_number = '' THEN
        NEW.po_number := generate_po_number(NEW.company_id);
    END IF;
    RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.auto_generate_work_order_numbers()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Generate quote number when status is QUOTE and quote_number is null
    IF NEW.status = 'QUOTE' AND NEW.quote_number IS NULL THEN
        NEW.quote_number := generate_quote_number(NEW.company_id);
    END IF;
    
    -- Generate job number when status changes to ACCEPTED/SCHEDULED and job_number is null
    IF NEW.status IN ('ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED') AND NEW.job_number IS NULL THEN
        NEW.job_number := generate_job_number(NEW.company_id);
    END IF;
    
    -- Generate invoice number when status changes to INVOICED and invoice_number is null
    IF NEW.status = 'INVOICED' AND NEW.invoice_number IS NULL THEN
        NEW.invoice_number := generate_invoice_number(NEW.company_id);
        NEW.invoice_date := COALESCE(NEW.invoice_date, now());
        NEW.due_date := COALESCE(NEW.due_date, now() + INTERVAL '30 days');
    END IF;
    
    RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.backup_db(label text DEFAULT 'auto'::text)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
  ts text := to_char(now(), 'YYYYMMDD_HH24MISS');
  fname text := format('%s_backup_%s.dump', label, ts);
BEGIN
  PERFORM dblink_connect('host=db.amgtktrwpdsigcomavlg.supabase.co user=postgres password=YOURPASSWORD dbname=postgres');
  -- Note: native pg_dump via SQL isn’t possible, so this just logs metadata
  RETURN json_build_object(
    'status', 'scheduled',
    'filename', fname,
    'time', now()
  );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.calculate_next_due_date(p_start_date date, p_frequency_type character varying)
 RETURNS date
 LANGUAGE plpgsql
AS $function$
BEGIN
    CASE p_frequency_type
        WHEN 'weekly' THEN RETURN p_start_date + INTERVAL '1 week';
        WHEN 'biweekly' THEN RETURN p_start_date + INTERVAL '2 weeks';
        WHEN 'monthly' THEN RETURN p_start_date + INTERVAL '1 month';
        WHEN 'quarterly' THEN RETURN p_start_date + INTERVAL '3 months';
        WHEN 'semiannual' THEN RETURN p_start_date + INTERVAL '6 months';
        WHEN 'annual' THEN RETURN p_start_date + INTERVAL '1 year';
        ELSE RETURN p_start_date + INTERVAL '1 month';
    END CASE;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.cancel_job(p_id uuid)
 RETURNS work_orders
 LANGUAGE plpgsql
AS $function$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET status='CANCELLED',
      updated_at=now()
  WHERE id=p_id AND stage IN ('JOB','WORK_ORDER')
  RETURNING * INTO rec;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot cancel: record not in JOB/WORK_ORDER (id=%)', p_id;
  END IF;

  RETURN rec;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.carryover_pto()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE pto_balances b
  SET vacation_hours = LEAST(b.vacation_hours, p.max_vacation_hours)
  FROM pto_policies p
  WHERE b.policy_id = p.id;

  -- Log adjustments for transparency
  INSERT INTO pto_ledger (id, employee_id, policy_id, entry_type, hours, created_at)
  SELECT 
    gen_random_uuid(),
    b.employee_id,
    b.policy_id,
    'ADJUSTMENT',
    (b.vacation_hours - p.max_vacation_hours),
    now()
  FROM pto_balances b
  JOIN pto_policies p ON b.policy_id = p.id
  WHERE b.vacation_hours > p.max_vacation_hours;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.complete_follow_up(p_follow_up_id uuid, p_outcome text, p_customer_response text DEFAULT NULL::text, p_schedule_next boolean DEFAULT false)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_work_order_id UUID;
  v_company_id UUID;
  v_attempt_number INTEGER;
BEGIN
  -- Update the follow-up
  UPDATE public.quote_follow_ups
  SET
    status = 'COMPLETED',
    completed_date = NOW(),
    outcome = p_outcome,
    customer_response = p_customer_response,
    updated_at = NOW()
  WHERE id = p_follow_up_id
  RETURNING work_order_id, company_id, attempt_number
  INTO v_work_order_id, v_company_id, v_attempt_number;

  -- Schedule next follow-up if requested and not final attempt
  IF p_schedule_next AND v_attempt_number < 3 AND p_outcome NOT IN ('ACCEPTED', 'REJECTED') THEN
    INSERT INTO public.quote_follow_ups (
      company_id,
      work_order_id,
      follow_up_type,
      scheduled_date,
      subject,
      message,
      is_automated,
      attempt_number
    ) VALUES (
      v_company_id,
      v_work_order_id,
      CASE WHEN v_attempt_number = 1 THEN 'PHONE' ELSE 'EMAIL' END,
      NOW() + INTERVAL '5 days',
      'Additional follow-up on your quote',
      'Following up again on your quote. Please let us know if you have any questions.',
      TRUE,
      v_attempt_number + 1
    );
  END IF;

  RETURN TRUE;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.convert_lead_to_customer(p_lead_id uuid, p_company_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_lead RECORD;
    v_customer_id uuid;
BEGIN
    SELECT * INTO v_lead FROM public.leads WHERE id = p_lead_id;

    IF v_lead.customer_id IS NULL THEN
        INSERT INTO public.customers (id, company_id, name, email, phone, created_at, updated_at)
        VALUES (gen_random_uuid(), p_company_id, v_lead.name, v_lead.email, v_lead.phone, now(), now())
        RETURNING id INTO v_customer_id;
    ELSE
        v_customer_id := v_lead.customer_id;
    END IF;

    INSERT INTO public.opportunities (id, company_id, customer_id, lead_id, title, stage, created_at, updated_at)
    VALUES (gen_random_uuid(), p_company_id, v_customer_id, p_lead_id, 'New Opportunity from Lead', 'QUALIFICATION', now(), now());

    UPDATE public.leads SET status = 'QUALIFIED', updated_at = now() WHERE id = p_lead_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.count_closed_jobs(p_company_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.work_orders
  WHERE company_id = p_company_id
    AND stage = 'WORK_ORDER'
    AND status = 'COMPLETED';
  RETURN v_count;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.create_default_approval_workflow()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- If a Quote is sent, create a default approval workflow
  IF NEW.stage = 'QUOTE' AND NEW.status = 'SENT' THEN
    INSERT INTO public.quote_approval_workflows (
      company_id,
      work_order_id,
      workflow_name,
      approval_type,
      sequence_order,
      required,
      requires_customer_approval
    )
    VALUES (
      NEW.company_id,
      NEW.id,
      'Customer Approval',
      'CUSTOMER',
      1,
      TRUE,
      TRUE
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.create_document_version(p_document_id uuid, p_file_name text, p_file_url text, p_file_size integer, p_mime_type text, p_change_notes text, p_created_by uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_company_id UUID;
    v_next_version INTEGER;
    v_version_id UUID;
BEGIN
    -- Get company_id and next version number
    SELECT company_id INTO v_company_id FROM documents WHERE id = p_document_id;
    SELECT COALESCE(MAX(version), 0) + 1 INTO v_next_version FROM document_versions WHERE document_id = p_document_id;
    
    -- Create new version record
    INSERT INTO document_versions (
        company_id, document_id, version, file_name, file_url, 
        file_size, mime_type, change_notes, created_by
    ) VALUES (
        v_company_id, p_document_id, v_next_version, p_file_name, p_file_url,
        p_file_size, p_mime_type, p_change_notes, p_created_by
    ) RETURNING id INTO v_version_id;
    
    -- Update main document record
    UPDATE documents 
    SET 
        version = v_next_version,
        file_name = p_file_name,
        file_url = p_file_url,
        file_size = p_file_size,
        mime_type = p_mime_type,
        updated_at = NOW()
    WHERE id = p_document_id;
    
    RETURN v_version_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.create_marketplace_request(_customer_id uuid, _title text, _description text, _trade_tags text[], _budget numeric, _budget_type text DEFAULT 'negotiable'::text, _max_responses integer DEFAULT 5, _start_time timestamp with time zone DEFAULT NULL::timestamp with time zone, _end_time timestamp with time zone DEFAULT NULL::timestamp with time zone, _auto_booking boolean DEFAULT false, _service_mode text DEFAULT 'on_site'::text, _requires_inspection boolean DEFAULT false)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
declare
  _id uuid;
begin
  insert into marketplace_requests (
    customer_id,
    title,
    description,
    trade_tags,
    budget,
    budget_type,
    max_responses,
    start_time,
    end_time,
    auto_booking,
    service_mode,
    requires_inspection,
    status
  ) values (
    _customer_id,
    _title,
    _description,
    _trade_tags,
    _budget,
    _budget_type,
    _max_responses,
    _start_time,
    _end_time,
    _auto_booking,
    _service_mode,
    _requires_inspection,
    'available'
  )
  returning id into _id;

  return _id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.create_marketplace_request(_customer_id uuid, _title text, _description text, _trade_tags text[], _budget numeric, _budget_type text, _max_responses integer DEFAULT 5, _start_time timestamp with time zone DEFAULT NULL::timestamp with time zone, _end_time timestamp with time zone DEFAULT NULL::timestamp with time zone, _auto_booking boolean DEFAULT false)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
declare
  _id uuid;
begin
  insert into marketplace_requests (
    customer_id, title, description, trade_tags, budget, budget_type,
    max_responses, start_time, end_time, auto_booking, status
  ) values (
    _customer_id, _title, _description, _trade_tags, _budget, _budget_type,
    _max_responses, _start_time, _end_time, _auto_booking, 'available'
  )
  returning id into _id;
  return _id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.create_work_order_version(p_work_order_id uuid, p_user_id uuid DEFAULT NULL::uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_work_order work_orders%ROWTYPE;
  v_new_version INTEGER;
BEGIN
  -- Get current work order
  SELECT * INTO v_work_order FROM work_orders WHERE id = p_work_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Work order not found';
  END IF;

  -- Increment version
  v_new_version := v_work_order.version + 1;

  -- Create version record
  INSERT INTO work_order_versions (
    work_order_id,
    company_id,
    version,
    title,
    description,
    subtotal,
    total_amount,
    notes,
    created_by
  ) VALUES (
    v_work_order.id,
    v_work_order.company_id,
    v_new_version,
    v_work_order.title,
    v_work_order.description,
    v_work_order.subtotal,
    v_work_order.total_amount,
    v_work_order.notes,
    p_user_id
  );

  -- Update work order version
  UPDATE work_orders SET
    version = v_new_version,
    updated_at = now()
  WHERE id = p_work_order_id;

  -- Log the versioning
  INSERT INTO work_order_audit_log (
    work_order_id,
    company_id,
    action,
    user_id,
    details
  ) VALUES (
    p_work_order_id,
    v_work_order.company_id,
    'version_created',
    p_user_id,
    jsonb_build_object('version', v_new_version)
  );
  
  RETURN v_new_version;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.deduct_pto_on_approval()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status = 'APPROVED' AND OLD.status <> 'APPROVED' THEN
    -- Deduct from balances
    UPDATE pto_balances
    SET vacation_hours = vacation_hours - NEW.hours_requested
    WHERE employee_id = NEW.employee_id;

    -- Log the usage
    INSERT INTO pto_ledger (id, employee_id, policy_id, entry_type, hours, created_at)
    VALUES (
      gen_random_uuid(),
      NEW.employee_id,
      NEW.policy_id,
      'USAGE',
      NEW.hours_requested,
      now()
    );
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.demote_job_to_quote(p_id uuid, p_status text DEFAULT 'DRAFT'::text)
 RETURNS work_orders
 LANGUAGE plpgsql
AS $function$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET stage = 'QUOTE',
      status = p_status,
      updated_at = now()
  WHERE id = p_id AND stage = 'JOB'
  RETURNING * INTO rec;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot demote: record not in JOB (id=%)', p_id;
  END IF;
  RETURN rec;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.demote_job_to_quote(p_id uuid)
 RETURNS work_orders
 LANGUAGE plpgsql
AS $function$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET stage='QUOTE',
      status='DRAFT',
      updated_at=now()
  WHERE id=p_id AND stage='JOB'
  RETURNING * INTO rec;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot demote: record not in JOB (id=%)', p_id;
  END IF;

  RETURN rec;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.demote_work_order_to_job(p_id uuid, p_status text DEFAULT 'DRAFT'::text)
 RETURNS work_orders
 LANGUAGE plpgsql
AS $function$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET stage = 'JOB',
      status = p_status,
      start_time = NULL,
      end_time = NULL,
      assigned_technician_id = NULL,
      updated_at = now()
  WHERE id = p_id AND stage = 'WORK_ORDER'
  RETURNING * INTO rec;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot demote: record not in WORK_ORDER (id=%)', p_id;
  END IF;
  RETURN rec;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.demote_work_order_to_job(p_id uuid)
 RETURNS work_orders
 LANGUAGE plpgsql
AS $function$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET stage='JOB',
      status='SCHEDULED',
      start_time=NULL,
      end_time=NULL,
      assigned_technician_id=NULL,
      updated_at=now()
  WHERE id=p_id AND stage='WORK_ORDER'
  RETURNING * INTO rec;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot demote: record not in WORK_ORDER (id=%)', p_id;
  END IF;

  RETURN rec;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.devtools_get_schema()
 RETURNS TABLE(table_name text, column_name text, data_type text)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT 
    table_name, 
    column_name, 
    data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
  ORDER BY table_name, ordinal_position;
$function$
;
CREATE OR REPLACE FUNCTION public.enforce_attachments_company_match()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Ensure attachments always match the company of the linked work order
  IF NEW.work_order_id IS NOT NULL THEN
    SELECT wo.company_id
    INTO STRICT NEW.company_id
    FROM public.work_orders wo
    WHERE wo.id = NEW.work_order_id;
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.enforce_message_context()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if (new.request_id is null and new.work_order_id is null) then
    raise exception 'Message must be tied to either a request/response or a work order';
  end if;

  if (new.request_id is not null and new.work_order_id is not null) then
    raise exception 'Message cannot be tied to both a request and a work order';
  end if;

  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.enforce_response_cap()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  -- Check if request is already full
  if (select response_count from public.marketplace_requests where id = new.request_id) >=
     (select max_responses from public.marketplace_requests where id = new.request_id) then
    raise exception 'This request is no longer accepting responses';
  end if;

  -- Increment response_count
  update public.marketplace_requests
    set response_count = response_count + 1
    where id = new.request_id;

  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.exec_readonly_sql(sql text)
 RETURNS SETOF record
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY EXECUTE sql;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
  result json;
  query_type text;
BEGIN
  BEGIN
    -- Detect query type
    query_type := upper(trim(split_part(query, ' ', 1)));
    
    IF query_type IN ('SELECT', 'WITH') THEN
      -- For SELECT queries, return data as JSON (for troubleshooting/reading)
      EXECUTE format('SELECT json_agg(t) FROM (%s) t', query) INTO result;
      IF result IS NULL THEN
        RETURN json_build_object('status','success','result','null');
      END IF;
      RETURN result;
    ELSE
      -- For DDL/DML queries (CREATE, ALTER, INSERT, UPDATE, DELETE), just execute
      EXECUTE query;
      RETURN json_build_object('status','success','message','Command executed successfully');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
      'status','error',
      'message', SQLERRM,
      'sqlstate', SQLSTATE
    );
  END;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.fn_search_companies_by_tags(tag_list uuid[], max_results integer DEFAULT 20)
 RETURNS TABLE(company_id uuid, name text, avg_rating numeric, distance numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.avg_rating, 0::NUMERIC as distance
  FROM companies c
  JOIN company_tags ct ON ct.company_id = c.id
  WHERE ct.tag_id = ANY(tag_list)
  ORDER BY c.avg_rating DESC NULLS LAST, c.rating_count DESC
  LIMIT max_results;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.fn_search_requests_by_tags(tag_list uuid[], max_results integer DEFAULT 20)
 RETURNS TABLE(request_id uuid, title text, budget numeric, location text)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT r.id, r.title, r.budget, r.location
  FROM marketplace_requests r
  JOIN request_tags rt ON rt.request_id = r.id
  WHERE rt.tag_id = ANY(tag_list)
  ORDER BY r.created_at DESC
  LIMIT max_results;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.forbid_writes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  RAISE EXCEPTION 'Legacy table is read-only';
END;
$function$
;
CREATE OR REPLACE FUNCTION public.generate_invoice_number(company_uuid uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    next_num INTEGER;
    year_suffix TEXT;
BEGIN
    year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+') AS INTEGER)), 0) + 1
    INTO next_num
    FROM work_orders 
    WHERE company_id = company_uuid 
    AND invoice_number IS NOT NULL
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    RETURN 'INV' || year_suffix || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.generate_job_number(company_uuid uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    next_num INTEGER;
    year_suffix TEXT;
BEGIN
    year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM '[0-9]+') AS INTEGER)), 0) + 1
    INTO next_num
    FROM work_orders 
    WHERE company_id = company_uuid 
    AND job_number IS NOT NULL
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    RETURN 'J' || year_suffix || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.generate_po_number(company_id_param uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    settings_record RECORD;
    new_number INTEGER;
    po_number TEXT;
BEGIN
    -- Get current settings
    SELECT po_number_prefix, next_po_number, po_auto_numbering
    INTO settings_record
    FROM business_settings 
    WHERE company_id = company_id_param;
    
    -- Fallback to legacy settings table if business_settings not found
    IF NOT FOUND THEN
        SELECT po_number_prefix, next_po_number, true as po_auto_numbering
        INTO settings_record
        FROM settings 
        WHERE company_id = company_id_param;
    END IF;
    
    -- Use defaults if no settings found
    IF NOT FOUND THEN
        settings_record.po_number_prefix := 'PO-';
        settings_record.next_po_number := 1001;
        settings_record.po_auto_numbering := true;
    END IF;
    
    -- Generate PO number
    IF settings_record.po_auto_numbering THEN
        new_number := settings_record.next_po_number;
        po_number := settings_record.po_number_prefix || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(new_number::TEXT, 4, '0');
        
        -- Update next number in business_settings
        UPDATE business_settings 
        SET next_po_number = new_number + 1, updated_at = NOW()
        WHERE company_id = company_id_param;
        
        -- Also update legacy settings table
        UPDATE settings 
        SET next_po_number = new_number + 1, updated_at = NOW()
        WHERE company_id = company_id_param;
    ELSE
        -- Manual numbering - return template
        po_number := settings_record.po_number_prefix || 'MANUAL';
    END IF;
    
    RETURN po_number;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.generate_quote_number(company_uuid uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    next_num INTEGER;
    year_suffix TEXT;
BEGIN
    year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM '[0-9]+') AS INTEGER)), 0) + 1
    INTO next_num
    FROM work_orders 
    WHERE company_id = company_uuid 
    AND quote_number IS NOT NULL
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    RETURN 'Q' || year_suffix || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$function$
;
CREATE OR REPLACE FUNCTION public.generate_recurring_occurrences(recurring_job_id uuid, generate_until date DEFAULT NULL::date)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    rj recurring_jobs%ROWTYPE;
    next_date DATE;
    end_date DATE;
    count INTEGER := 0;
    work_order_data JSONB;
BEGIN
    -- Get recurring job details
    SELECT * INTO rj FROM recurring_jobs WHERE id = recurring_job_id AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Determine end date
    end_date := COALESCE(generate_until, rj.last_occurrence, CURRENT_DATE + INTERVAL '1 year');
    next_date := COALESCE(rj.next_occurrence, rj.first_occurrence);
    
    -- Generate work orders until end date or max occurrences
    WHILE next_date <= end_date AND (rj.max_occurrences IS NULL OR rj.occurrences_created < rj.max_occurrences) LOOP
        -- Create work order for this occurrence
        INSERT INTO work_orders (
            company_id,
            title,
            description,
            customer_id,
            start_time,
            end_time,
            assigned_to,
            pricing_model,
            estimated_cost,
            labor_summary,
            is_recurring,
            recurring_parent_id,
            recurring_sequence,
            unified_status,
            created_by
        ) VALUES (
            rj.company_id,
            rj.title,
            rj.description,
            rj.customer_id,
            next_date + rj.start_time,
            next_date + rj.start_time + (rj.duration_minutes || ' minutes')::INTERVAL,
            rj.assigned_to,
            rj.pricing_model,
            rj.estimated_cost,
            rj.labor_summary,
            TRUE,
            recurring_job_id,
            rj.occurrences_created + count + 1,
            'scheduled_job',
            rj.created_by
        );
        
        count := count + 1;
        
        -- Calculate next occurrence date
        IF rj.frequency = 'daily' THEN
            next_date := next_date + (rj.interval_value || ' days')::INTERVAL;
        ELSIF rj.frequency = 'weekly' THEN
            next_date := next_date + (rj.interval_value * 7 || ' days')::INTERVAL;
        ELSIF rj.frequency = 'monthly' THEN
            next_date := next_date + (rj.interval_value || ' months')::INTERVAL;
        ELSIF rj.frequency = 'yearly' THEN
            next_date := next_date + (rj.interval_value || ' years')::INTERVAL;
        END IF;
    END LOOP;
    
    -- Update recurring job with next occurrence and count
    UPDATE recurring_jobs 
    SET 
        next_occurrence = CASE WHEN next_date <= end_date THEN next_date ELSE NULL END,
        occurrences_created = occurrences_created + count,
        updated_at = NOW()
    WHERE id = recurring_job_id;
    
    RETURN count;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_available_requests(_company_id uuid, _tags text[] DEFAULT NULL::text[])
 RETURNS SETOF marketplace_requests
 LANGUAGE sql
 STABLE
AS $function$
  select distinct r.*
  from marketplace_requests r
  join companies c on c.id = _company_id
  left join request_tags rt on rt.request_id = r.id
  left join tags t on t.id = rt.tag_id
  where r.status = 'available'
    and (
      _tags is null
      or exists (
        select 1
        from request_tags rt2
        join tags t2 on t2.id = rt2.tag_id
        where rt2.request_id = r.id
          and lower(t2.name) = any (select lower(x) from unnest(_tags) x)
      )
    )
  order by r.created_at desc;
$function$
;
CREATE OR REPLACE FUNCTION public.get_browse_requests(_company_id uuid, _tags text[] DEFAULT NULL::text[], _distance_km numeric DEFAULT NULL::numeric, _pricing pricing_enum[] DEFAULT NULL::pricing_enum[], _request_type text[] DEFAULT NULL::text[])
 RETURNS SETOF marketplace_requests
 LANGUAGE sql
 STABLE
AS $function$
  select r.*
  from marketplace_requests r
  join companies c on r.company_id = c.id
  where r.company_id is distinct from _company_id
    and r.status = 'available'
    and (
      _tags is null 
      or exists (
        select 1 
        from unnest(r.trade_tags) t
        where lower(t) = any (select lower(x) from unnest(_tags) x)
      )
    )
    and (
      _request_type is null 
      or r.request_type = any(_request_type)
    )
    and (
      _pricing is null 
      or r.pricing_preference = any(_pricing)
    )
    -- TODO: distance filter if you have lat/long
  order by r.created_at desc;
$function$
;
CREATE OR REPLACE FUNCTION public.get_browse_requests(_company_id uuid, _tags text[] DEFAULT NULL::text[], _distance_km numeric DEFAULT NULL::numeric, _pricing pricing_preference_enum[] DEFAULT NULL::pricing_preference_enum[], _request_type request_type_enum[] DEFAULT NULL::request_type_enum[])
 RETURNS SETOF marketplace_requests
 LANGUAGE sql
 STABLE
AS $function$
  select distinct r.*
  from marketplace_requests r
  join companies c on r.company_id = c.id
  left join request_tags rt on rt.request_id = r.id
  left join tags t on t.id = rt.tag_id
  where r.company_id is distinct from _company_id
    and r.status = 'available'
    and (
      _tags is null
      or exists (
        select 1
        from request_tags rt2
        join tags t2 on t2.id = rt2.tag_id
        where rt2.request_id = r.id
          and lower(t2.name) = any (select lower(x) from unnest(_tags) x)
      )
    )
    and (
      _request_type is null
      or r.request_type = any(_request_type)
    )
    and (
      _pricing is null
      or r.pricing_preference = any(_pricing)
    )
    -- TODO: distance filter if/when lat/long added
  order by r.created_at desc;
$function$
;
CREATE OR REPLACE FUNCTION public.get_calendar_events_with_context(p_company_id uuid, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_employee_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, title text, description text, start_time timestamp with time zone, end_time timestamp with time zone, event_type text, status text, work_order_id uuid, work_order_stage text, work_order_status text, customer_id uuid, customer_name text, employee_id uuid, employee_name text, service_address text, estimated_duration integer, total_amount numeric, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
      se.id,
      se.title,
      se.description,
      se.start_time,
      se.end_time,
      COALESCE(se.event_type, 'appointment'),
      COALESCE(se.status, 'scheduled'),
      se.work_order_id,
      wo.stage::text,
      wo.status::text,
      se.customer_id,
      COALESCE(c.company_name, c.name),
      se.employee_id,
      COALESCE(u.first_name || ' ' || u.last_name, u.email),
      CASE 
        WHEN wo.service_address_line_1 IS NOT NULL THEN 
          wo.service_address_line_1 ||
          COALESCE(', ' || wo.service_city, '') ||
          COALESCE(', ' || wo.service_state, '')
        ELSE NULL
      END,
      wo.estimated_duration,
      wo.total_amount,
      se.created_at,
      se.updated_at
  FROM schedule_events se
  LEFT JOIN work_orders wo ON se.work_order_id = wo.id
  LEFT JOIN customers c ON se.customer_id = c.id
  LEFT JOIN users u ON se.employee_id = u.id
  WHERE se.company_id = p_company_id
    AND (p_start_date IS NULL OR se.start_time >= p_start_date)
    AND (p_end_date IS NULL OR se.end_time <= p_end_date)
    AND (p_employee_id IS NULL OR se.employee_id = p_employee_id)
  ORDER BY se.start_time ASC;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_calendar_events_with_context(p_company_id uuid)
 RETURNS TABLE(id uuid, title text, description text, start_time timestamp with time zone, end_time timestamp with time zone, event_type text, status text, work_order_id uuid, work_order_stage text, work_order_status text, customer_id uuid, customer_name text, employee_id uuid, employee_name text, service_address text, estimated_duration integer, total_amount numeric, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT * FROM get_calendar_events_with_context(p_company_id, NULL::timestamp with time zone, NULL::timestamp with time zone, NULL::uuid);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_calendar_events_with_context(p_company_id uuid, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(id uuid, title text, description text, start_time timestamp with time zone, end_time timestamp with time zone, event_type text, status text, work_order_id uuid, work_order_stage text, work_order_status text, customer_id uuid, customer_name text, employee_id uuid, employee_name text, service_address text, estimated_duration integer, total_amount numeric, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
      se.id,
      COALESCE(se.title, 'Untitled Event'),
      se.description,
      se.start_time,
      se.end_time,
      COALESCE(se.event_type, 'appointment'),
      COALESCE(se.status, 'scheduled'),
      se.work_order_id,
      wo.stage::text,
      wo.status::text,
      se.customer_id,
      COALESCE(c.company_name, c.name, 'Unknown Customer'),
      se.employee_id,
      COALESCE(u.first_name || ' ' || u.last_name, u.email, 'Unassigned'),
      CASE 
        WHEN wo.service_address_line_1 IS NOT NULL THEN 
          wo.service_address_line_1 ||
          COALESCE(', ' || wo.service_city, '') ||
          COALESCE(', ' || wo.service_state, '')
        ELSE NULL
      END,
      wo.estimated_duration,
      wo.total_amount,
      se.created_at,
      se.updated_at
  FROM schedule_events se
  LEFT JOIN work_orders wo ON se.work_order_id = wo.id
  LEFT JOIN customers c ON se.customer_id = c.id
  LEFT JOIN users u ON se.employee_id = u.id
  WHERE se.company_id = p_company_id
    AND (p_start_date IS NULL OR se.start_time >= p_start_date)
    AND (p_end_date IS NULL OR se.end_time <= p_end_date)
  ORDER BY se.start_time ASC;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_closed_jobs(p_company_id uuid, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
 RETURNS TABLE(work_order_id uuid, title text, description text, start_time timestamp with time zone, end_time timestamp with time zone, completed_at timestamp with time zone, total_amount numeric, customer_name text, customer_email text, customer_phone text)
 LANGUAGE sql
AS $function$
  SELECT
    w.id AS work_order_id,
    w.title,
    w.description,
    w.start_time,
    w.end_time,
    w.completed_at,
    w.total_amount,
    c.name AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone
  FROM public.work_orders w
  LEFT JOIN public.customers c ON c.id = w.customer_id
  WHERE w.company_id = p_company_id
    AND w.stage = 'WORK_ORDER'
    AND w.status = 'COMPLETED'
  ORDER BY w.completed_at DESC NULLS LAST
  LIMIT p_limit OFFSET p_offset;
$function$
;
CREATE OR REPLACE FUNCTION public.get_companies_by_tags(_tags text[] DEFAULT NULL::text[], _limit integer DEFAULT 20)
 RETURNS TABLE(company_id uuid, name text, avg_rating numeric, rating_count integer)
 LANGUAGE sql
 STABLE
AS $function$
  select c.id, c.name, c.avg_rating, c.rating_count
  from companies c
  left join company_tags ct on ct.company_id = c.id
  left join tags t on t.id = ct.tag_id
  where (
    _tags is null
    or exists (
      select 1
      from company_tags ct2
      join tags t2 on t2.id = ct2.tag_id
      where ct2.company_id = c.id
        and lower(t2.name) = any (select lower(x) from unnest(_tags) x)
    )
  )
  order by c.avg_rating desc nulls last, c.rating_count desc nulls last
  limit _limit;
$function$
;
CREATE OR REPLACE FUNCTION public.get_company_customers(company_uuid uuid)
 RETURNS TABLE(id uuid, name text, email text, phone text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.email, c.phone, c.created_at, c.updated_at
  FROM customers c
  WHERE c.company_id = company_uuid
  ORDER BY c.created_at DESC;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_customer_requests(_customer_id uuid)
 RETURNS SETOF marketplace_requests
 LANGUAGE sql
AS $function$
  select *
  from marketplace_requests
  where customer_id = _customer_id
  order by created_at desc;
$function$
;
CREATE OR REPLACE FUNCTION public.get_pending_follow_ups(p_company_id uuid, p_user_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(follow_up_id uuid, work_order_id uuid, quote_number text, customer_name text, follow_up_type text, scheduled_date timestamp with time zone, days_overdue integer, attempt_number integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    qf.id as follow_up_id,
    qf.work_order_id,
    wo.quote_number,
    c.name as customer_name,
    qf.follow_up_type,
    qf.scheduled_date,
    CASE
      WHEN qf.scheduled_date < NOW() THEN EXTRACT(DAY FROM NOW() - qf.scheduled_date)::INTEGER
      ELSE 0
    END as days_overdue,
    qf.attempt_number
  FROM public.quote_follow_ups qf
  JOIN public.work_orders wo ON qf.work_order_id = wo.id
  JOIN public.customers c ON wo.customer_id = c.id
  WHERE qf.company_id = p_company_id
    AND qf.status = 'SCHEDULED'
    AND (p_user_id IS NULL OR qf.assigned_user_id = p_user_id)
  ORDER BY qf.scheduled_date ASC;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_po_settings(company_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    settings_json JSONB;
BEGIN
    -- Try business_settings first
    SELECT jsonb_build_object(
        'po_number_prefix', COALESCE(po_number_prefix, 'PO-'),
        'next_po_number', COALESCE(next_po_number, 1001),
        'po_auto_numbering', COALESCE(po_auto_numbering, true),
        'po_require_approval', COALESCE(po_require_approval, false),
        'po_approval_threshold', COALESCE(po_approval_threshold, 1000.00),
        'po_default_terms', COALESCE(po_default_terms, 'NET_30'),
        'po_auto_send_to_vendor', COALESCE(po_auto_send_to_vendor, false),
        'po_require_receipt_confirmation', COALESCE(po_require_receipt_confirmation, true),
        'po_allow_partial_receiving', COALESCE(po_allow_partial_receiving, true),
        'po_default_shipping_method', COALESCE(po_default_shipping_method, 'STANDARD'),
        'po_tax_calculation_method', COALESCE(po_tax_calculation_method, 'AUTOMATIC'),
        'po_currency', COALESCE(po_currency, 'USD'),
        'po_payment_terms_options', COALESCE(po_payment_terms_options, '["NET_15", "NET_30", "NET_45", "NET_60", "DUE_ON_RECEIPT", "2_10_NET_30"]'::jsonb),
        'po_default_notes', COALESCE(po_default_notes, ''),
        'po_footer_text', COALESCE(po_footer_text, ''),
        'po_email_template', COALESCE(po_email_template, 'Please find attached Purchase Order #{po_number}. Please confirm receipt and expected delivery date.'),
        'po_reminder_days', COALESCE(po_reminder_days, 7),
        'po_overdue_notification_days', COALESCE(po_overdue_notification_days, 14)
    )
    INTO settings_json
    FROM business_settings 
    WHERE company_id = company_id_param;
    
    -- Fallback to legacy settings if business_settings not found
    IF settings_json IS NULL THEN
        SELECT jsonb_build_object(
            'po_number_prefix', COALESCE(po_number_prefix, 'PO-'),
            'next_po_number', COALESCE(next_po_number, 1001),
            'po_auto_numbering', true,
            'po_require_approval', COALESCE(po_require_approval, false),
            'po_approval_threshold', COALESCE(po_approval_threshold, 1000.00),
            'po_default_terms', COALESCE(po_default_terms, 'NET_30'),
            'po_auto_send_to_vendor', false,
            'po_require_receipt_confirmation', true,
            'po_allow_partial_receiving', true,
            'po_default_shipping_method', 'STANDARD',
            'po_tax_calculation_method', 'AUTOMATIC',
            'po_currency', 'USD',
            'po_payment_terms_options', '["NET_15", "NET_30", "NET_45", "NET_60", "DUE_ON_RECEIPT", "2_10_NET_30"]'::jsonb,
            'po_default_notes', '',
            'po_footer_text', '',
            'po_email_template', 'Please find attached Purchase Order #{po_number}. Please confirm receipt and expected delivery date.',
            'po_reminder_days', 7,
            'po_overdue_notification_days', 14
        )
        INTO settings_json
        FROM settings 
        WHERE company_id = company_id_param;
    END IF;
    
    -- Return defaults if no settings found
    IF settings_json IS NULL THEN
        settings_json := jsonb_build_object(
            'po_number_prefix', 'PO-',
            'next_po_number', 1001,
            'po_auto_numbering', true,
            'po_require_approval', false,
            'po_approval_threshold', 1000.00,
            'po_default_terms', 'NET_30',
            'po_auto_send_to_vendor', false,
            'po_require_receipt_confirmation', true,
            'po_allow_partial_receiving', true,
            'po_default_shipping_method', 'STANDARD',
            'po_tax_calculation_method', 'AUTOMATIC',
            'po_currency', 'USD',
            'po_payment_terms_options', '["NET_15", "NET_30", "NET_45", "NET_60", "DUE_ON_RECEIPT", "2_10_NET_30"]'::jsonb,
            'po_default_notes', '',
            'po_footer_text', '',
            'po_email_template', 'Please find attached Purchase Order #{po_number}. Please confirm receipt and expected delivery date.',
            'po_reminder_days', 7,
            'po_overdue_notification_days', 14
        );
    END IF;
    
    RETURN settings_json;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_pto_balance(p_employee_id uuid, p_category_code text DEFAULT 'VAC'::text, p_as_of_date date DEFAULT CURRENT_DATE)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE
  balance DECIMAL(8,2) := 0;
BEGIN
  SELECT COALESCE(SUM(hours), 0)
  INTO balance
  FROM pto_ledger
  WHERE employee_id = p_employee_id
    AND COALESCE(category_code, 'VAC') = p_category_code
    AND effective_date <= p_as_of_date;

  RETURN balance;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_quote_conversion_metrics(p_company_id uuid)
 RETURNS TABLE(total_quotes integer, accepted_quotes integer, conversion_rate numeric)
 LANGUAGE plpgsql
AS $function$
DECLARE v_total integer;
DECLARE v_accepted integer;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM public.work_orders
  WHERE company_id = p_company_id
    AND stage = 'QUOTE';

  SELECT COUNT(*) INTO v_accepted
  FROM public.work_orders
  WHERE company_id = p_company_id
    AND stage = 'QUOTE'
    AND status = 'ACCEPTED';

  RETURN QUERY
  SELECT
    v_total,
    v_accepted,
    CASE WHEN v_total > 0 THEN ROUND((v_accepted::numeric / v_total) * 100, 2)
         ELSE 0 END;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_quote_conversion_metrics(p_company_id uuid, p_date_from date DEFAULT NULL::date, p_date_to date DEFAULT NULL::date)
 RETURNS TABLE(total_quotes integer, sent_quotes integer, viewed_quotes integer, accepted_quotes integer, rejected_quotes integer, conversion_rate numeric, average_time_to_decision_hours numeric, average_quote_value numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_quotes,
    COUNT(CASE WHEN qa.conversion_stage != 'DRAFT' THEN 1 END)::INTEGER as sent_quotes,
    COUNT(CASE WHEN qa.first_viewed_date IS NOT NULL THEN 1 END)::INTEGER as viewed_quotes,
    COUNT(CASE WHEN qa.conversion_stage = 'ACCEPTED' THEN 1 END)::INTEGER as accepted_quotes,
    COUNT(CASE WHEN qa.conversion_stage = 'REJECTED' THEN 1 END)::INTEGER as rejected_quotes,
    CASE
      WHEN COUNT(CASE WHEN qa.conversion_stage != 'DRAFT' THEN 1 END) > 0
      THEN (COUNT(CASE WHEN qa.conversion_stage = 'ACCEPTED' THEN 1 END)::DECIMAL / COUNT(CASE WHEN qa.conversion_stage != 'DRAFT' THEN 1 END) * 100)
      ELSE 0
    END as conversion_rate,
    AVG(qa.time_to_decision_hours) as average_time_to_decision_hours,
    AVG(qa.quote_value) as average_quote_value
  FROM public.quote_analytics qa
  WHERE qa.company_id = p_company_id
    AND (p_date_from IS NULL OR qa.quote_sent_date >= p_date_from)
    AND (p_date_to IS NULL OR qa.quote_sent_date <= p_date_to);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_request_with_roles(p_request_id uuid)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    request_data JSON;
    roles_data JSON;
BEGIN
    -- Get the main request
    SELECT to_json(r.*) INTO request_data
    FROM marketplace_requests r
    WHERE r.id = p_request_id;
    
    -- If no request found, return null
    IF request_data IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get roles with their responses and progress
    SELECT json_agg(
        json_build_object(
            'id', mrr.id,
            'category_id', mrr.category_id,
            'quantity_required', mrr.quantity_required,
            'quantity_fulfilled', COALESCE(mrr.quantity_fulfilled, 0),
            'service_category', json_build_object(
                'name', sc.name,
                'description', sc.description
            ),
            'responses', COALESCE(responses.response_list, '[]'::json)
        )
    ) INTO roles_data
    FROM marketplace_request_roles mrr
    LEFT JOIN service_categories sc ON sc.id = mrr.category_id
    LEFT JOIN (
        SELECT 
            mr.role_id,
            json_agg(
                json_build_object(
                    'id', mr.id,
                    'company_id', mr.company_id,
                    'response_status', mr.response_status,
                    'counter_offer', mr.counter_offer,
                    'available_start', mr.available_start,
                    'available_end', mr.available_end,
                    'message', mr.message,
                    'created_at', mr.created_at
                )
            ) as response_list
        FROM marketplace_responses mr
        GROUP BY mr.role_id
    ) responses ON responses.role_id = mrr.id
    WHERE mrr.request_id = p_request_id;
    
    -- Return combined data
    RETURN json_build_object(
        'request', request_data,
        'roles', COALESCE(roles_data, '[]'::json)
    );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.get_responses_for_request(_request_id uuid)
 RETURNS SETOF marketplace_responses
 LANGUAGE sql
AS $function$
  select *
  from marketplace_responses
  where request_id = _request_id
  order by created_at;
$function$
;
CREATE OR REPLACE FUNCTION public.gin_extract_query_trgm(text, internal, smallint, internal, internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_extract_query_trgm$function$
;
CREATE OR REPLACE FUNCTION public.gin_extract_value_trgm(text, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_extract_value_trgm$function$
;
CREATE OR REPLACE FUNCTION public.gin_trgm_consistent(internal, smallint, text, integer, internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_trgm_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gin_trgm_triconsistent(internal, smallint, text, integer, internal, internal, internal)
 RETURNS "char"
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gin_trgm_triconsistent$function$
;
CREATE OR REPLACE FUNCTION public.gtrgm_compress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_compress$function$
;
CREATE OR REPLACE FUNCTION public.gtrgm_consistent(internal, text, smallint, oid, internal)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_consistent$function$
;
CREATE OR REPLACE FUNCTION public.gtrgm_decompress(internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_decompress$function$
;
CREATE OR REPLACE FUNCTION public.gtrgm_distance(internal, text, smallint, oid, internal)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_distance$function$
;
CREATE OR REPLACE FUNCTION public.gtrgm_in(cstring)
 RETURNS gtrgm
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_in$function$
;
CREATE OR REPLACE FUNCTION public.gtrgm_options(internal)
 RETURNS void
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/pg_trgm', $function$gtrgm_options$function$
;
CREATE OR REPLACE FUNCTION public.gtrgm_out(gtrgm)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_out$function$
;
CREATE OR REPLACE FUNCTION public.gtrgm_penalty(internal, internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_penalty$function$
;
CREATE OR REPLACE FUNCTION public.gtrgm_picksplit(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_picksplit$function$
;
CREATE OR REPLACE FUNCTION public.gtrgm_same(gtrgm, gtrgm, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_same$function$
;
CREATE OR REPLACE FUNCTION public.gtrgm_union(internal, internal)
 RETURNS gtrgm
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$gtrgm_union$function$
;
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.invoice_items_recalc()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Calculate tax
  NEW.tax_amount := round((NEW.quantity * NEW.unit_price) * (COALESCE(NEW.tax_rate,0)/100), 2);

  -- Apply discounts
  IF NEW.discount_type = 'PERCENT' THEN
    NEW.line_total := round(
      (NEW.quantity * NEW.unit_price) * (1 - COALESCE(NEW.discount_value,0)/100)
      + COALESCE(NEW.tax_amount,0),
      2
    );
  ELSIF NEW.discount_type = 'FLAT' THEN
    NEW.line_total := round(
      (NEW.quantity * NEW.unit_price) - COALESCE(NEW.discount_value,0)
      + COALESCE(NEW.tax_amount,0),
      2
    );
  ELSE
    NEW.line_total := round(
      (NEW.quantity * NEW.unit_price) + COALESCE(NEW.tax_amount,0),
      2
    );
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.invoices_auto_status(p_invoice_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_total    numeric;
  v_paid     numeric := 0;
  v_due_date timestamptz;
BEGIN
  -- Fetch invoice totals
  SELECT total_amount, due_date
  INTO v_total, v_due_date
  FROM public.invoices
  WHERE id = p_invoice_id;

  -- Fetch payments if table exists
  IF to_regclass('public.invoice_payments') IS NOT NULL THEN
    SELECT COALESCE(SUM(amount), 0)
    INTO v_paid
    FROM public.invoice_payments
    WHERE invoice_id = p_invoice_id;
  END IF;

  -- Update status based on totals
  IF v_total > 0 AND v_paid >= v_total THEN
    UPDATE public.invoices
    SET status = 'PAID'::invoice_status_enum,
        updated_at = now()
    WHERE id = p_invoice_id;

  ELSIF v_paid > 0 AND v_paid < v_total THEN
    UPDATE public.invoices
    SET status = 'PARTIALLY_PAID'::invoice_status_enum,
        updated_at = now()
    WHERE id = p_invoice_id;

  ELSIF v_total > 0 AND v_due_date IS NOT NULL AND now() > v_due_date THEN
    UPDATE public.invoices
    SET status = 'OVERDUE'::invoice_status_enum,
        updated_at = now()
    WHERE id = p_invoice_id;

  ELSE
    UPDATE public.invoices
    SET status = 'UNPAID'::invoice_status_enum,
        updated_at = now()
    WHERE id = p_invoice_id;
  END IF;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.invoices_auto_status()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_total    numeric;
  v_paid     numeric := 0;
  v_due_date timestamptz;
  v_invoice_id uuid;
BEGIN
  v_invoice_id := COALESCE(NEW.id, OLD.id);

  -- Get total and due date
  SELECT total_amount, due_date
  INTO v_total, v_due_date
  FROM public.invoices
  WHERE id = v_invoice_id;

  -- Sum payments if table exists
  IF to_regclass('public.invoice_payments') IS NOT NULL THEN
    SELECT COALESCE(SUM(amount),0)
    INTO v_paid
    FROM public.invoice_payments
    WHERE invoice_id = v_invoice_id;
  END IF;

  -- Update status based on totals
  IF v_total > 0 AND v_paid >= v_total THEN
    UPDATE public.invoices
    SET status = 'PAID', updated_at = now()
    WHERE id = v_invoice_id;
  ELSIF v_paid > 0 AND v_paid < v_total THEN
    UPDATE public.invoices
    SET status = 'PARTIALLY_PAID', updated_at = now()
    WHERE id = v_invoice_id;
  ELSIF v_total > 0 AND v_due_date IS NOT NULL AND now() > v_due_date THEN
    UPDATE public.invoices
    SET status = 'OVERDUE', updated_at = now()
    WHERE id = v_invoice_id;
  ELSE
    UPDATE public.invoices
    SET status = 'UNPAID', updated_at = now()
    WHERE id = v_invoice_id;
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.invoices_update_total()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_items_total numeric := 0;
  v_inv_disc    numeric := 0;
  v_invoice_id  uuid;
BEGIN
  -- Determine which invoice_id to use
  v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);

  -- Sum all line items for this invoice
  SELECT COALESCE(SUM(line_total), 0)
  INTO v_items_total
  FROM public.invoice_items
  WHERE invoice_id = v_invoice_id;

  -- Get any discount applied at invoice level
  SELECT COALESCE(discount_amount, 0)
  INTO v_inv_disc
  FROM public.invoices
  WHERE id = v_invoice_id;

  -- Update invoice total
  UPDATE public.invoices
  SET total_amount = round(GREATEST(v_items_total - v_inv_disc, 0), 2),
      updated_at   = now()
  WHERE id = v_invoice_id;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.invoices_update_total(p_invoice_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_items_total numeric := 0;
  v_inv_disc    numeric := 0;
BEGIN
  SELECT COALESCE(SUM(line_total),0) INTO v_items_total
  FROM public.invoice_items WHERE invoice_id = p_invoice_id;

  SELECT COALESCE(discount_amount,0) INTO v_inv_disc
  FROM public.invoices WHERE id = p_invoice_id;

  UPDATE public.invoices
  SET total_amount = round(GREATEST(v_items_total - v_inv_disc, 0), 2),
      updated_at   = now()
  WHERE id = p_invoice_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.invoices_update_total_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  PERFORM public.invoices_update_total(COALESCE(NEW.invoice_id, OLD.invoice_id));
  RETURN NULL;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.invoices_updated_at_fn()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.log_customer_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.customers_status_history (customer_id, from_status, to_status, reason, changed_by)
    VALUES (NEW.id, LOWER(OLD.status), LOWER(NEW.status), COALESCE(NEW.status_reason, OLD.status_reason), NEW.updated_by);
    NEW.status_changed_at := now();
  END IF;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.log_vendor_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.vendors_status_history (vendor_id, from_status, to_status, reason, changed_by)
    VALUES (NEW.id, LOWER(OLD.status), LOWER(NEW.status), COALESCE(NEW.status_reason, OLD.status_reason), NEW.updated_by);
    NEW.status_changed_at := now();
  END IF;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.log_work_order_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Log only when status changes
  IF TG_OP = 'UPDATE'
     AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.work_order_audit_log (
      work_order_id,
      company_id,
      action,
      old_status,
      new_status,
      details
    )
    VALUES (
      NEW.id,
      NEW.company_id,
      'status_changed',
      OLD.status::text,
      NEW.status::text,
      jsonb_build_object(
        'old_total', OLD.total_amount,
        'new_total', NEW.total_amount,
        'version', NEW.version,
        'stage', NEW.stage
      )
    );
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.lookup_item_by_code(p_code text)
 RETURNS TABLE(id uuid, name text, description text, barcode text, qr_code text, upc_code text)
 LANGUAGE sql
 STABLE
AS $function$
    SELECT id, name, description, barcode, qr_code, upc_code
    FROM public.inventory_items
    WHERE p_code IN (barcode, qr_code, upc_code);
$function$
;
CREATE OR REPLACE FUNCTION public.match_companies_to_request(_request_id uuid)
 RETURNS TABLE(company_id uuid, company_name text, tags text[], avg_rating numeric, rating_count integer)
 LANGUAGE sql
AS $function$
    select
        c.id as company_id,
        c.name as company_name,
        array_agg(distinct t.name) as tags,
        coalesce(c.avg_rating, 0) as avg_rating,
        coalesce(c.rating_count, 0) as rating_count
    from public.request_tags rt
    join public.tags t on rt.tag_id = t.id
    join public.company_tags ct on ct.tag_id = t.id
    join public.companies c on c.id = ct.company_id
    where rt.request_id = _request_id
    group by c.id, c.name, c.avg_rating, c.rating_count
    order by avg_rating desc nulls last, rating_count desc;
$function$
;
CREATE OR REPLACE FUNCTION public.match_companies_to_request(_request_id uuid, _limit integer DEFAULT 20)
 RETURNS TABLE(company_id uuid, company_name text, avg_rating numeric, rating_count integer, matched_tags text[], company_postal_code text, request_postal_code text)
 LANGUAGE sql
 STABLE
AS $function$
  with req as (
    select 
      r.id, 
      r.postal_code, 
      array_agg(lower(t.name)) as tags   -- normalize
    from public.marketplace_requests r
    join public.request_tags rt on r.id = rt.request_id
    join public.tags t on t.id = rt.tag_id
    where r.id = _request_id
    group by r.id, r.postal_code
  ),
  comp as (
    select
      c.id,
      c.name,
      c.avg_rating,
      c.rating_count,
      c.postal_code,
      array_agg(lower(t.name)) as tags   -- normalize
    from public.companies c
    join public.company_tags ct on ct.company_id = c.id
    join public.tags t on t.id = ct.tag_id
    group by c.id, c.name, c.avg_rating, c.rating_count, c.postal_code
  )
  select
    c.id as company_id,
    c.name as company_name,
    coalesce(c.avg_rating, 0) as avg_rating,
    coalesce(c.rating_count, 0) as rating_count,
    c.tags as matched_tags,
    c.postal_code as company_postal_code,
    r.postal_code as request_postal_code
  from req r
  join comp c on c.tags && r.tags  -- overlap on normalized tags
  limit _limit;
$function$
;
CREATE OR REPLACE FUNCTION public.match_contractors_to_request(_request_id uuid)
 RETURNS TABLE(company_id uuid, company_name text)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT c.id, c.name
    FROM companies c
    JOIN company_tags ct ON ct.company_id = c.id
    JOIN marketplace_request_tags rt ON rt.tag_id = ct.tag_id
    WHERE rt.request_id = _request_id
      AND c.verification_status != 'BANNED'
    ORDER BY c.avg_rating DESC NULLS LAST;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.match_requests_to_company(_company_id uuid)
 RETURNS TABLE(request_id uuid, title text, description text, tags text[], budget numeric, request_type text, status text, start_time timestamp with time zone, end_time timestamp with time zone, created_at timestamp with time zone)
 LANGUAGE sql
AS $function$
    select
        r.id as request_id,
        r.title,
        r.description,
        array_agg(distinct t.name) as tags,
        r.budget,
        r.request_type,
        r.status,
        r.start_time,
        r.end_time,
        r.created_at
    from public.company_tags ct
    join public.tags t on ct.tag_id = t.id
    join public.request_tags rt on rt.tag_id = t.id
    join public.marketplace_requests r on r.id = rt.request_id
    where ct.company_id = _company_id
      and r.status = 'available'
    group by r.id, r.title, r.description, r.budget, r.request_type, r.status,
             r.start_time, r.end_time, r.created_at
    order by r.created_at desc;
$function$
;
CREATE OR REPLACE FUNCTION public.migrate_existing_pto_data()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update any NULL company_id values in pto_ledger
  UPDATE pto_ledger
  SET company_id = u.company_id
  FROM users u
  WHERE pto_ledger.employee_id = u.id AND pto_ledger.company_id IS NULL;

  -- Update any NULL company_id values in pto_requests
  UPDATE pto_requests
  SET company_id = u.company_id
  FROM users u
  WHERE pto_requests.employee_id = u.id AND pto_requests.company_id IS NULL;

  -- Set default category_code for existing records
  UPDATE pto_ledger SET category_code = 'VAC' WHERE category_code IS NULL;
  UPDATE pto_requests SET category_code = 'VAC' WHERE category_code IS NULL;

  RAISE NOTICE 'PTO data migration completed successfully';
END;
$function$
;
CREATE OR REPLACE FUNCTION public.normalize_tag()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
    new.name := lower(trim(new.name));
    return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.normalize_tag_name()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
    new.name := lower(new.name);
    return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.notify_on_new_request()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO marketplace_notifications (company_id, request_id, message)
    SELECT ct.company_id, NEW.id, 'New request available'
    FROM marketplace_request_tags rt
    JOIN company_tags ct ON rt.tag_id = ct.tag_id;
    RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.notify_on_new_response()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    _customer_id uuid;
BEGIN
    SELECT customer_id INTO _customer_id
    FROM marketplace_requests
    WHERE id = NEW.request_id;

    INSERT INTO marketplace_notifications (company_id, request_id, message)
    VALUES (
        _customer_id, -- here company_id column acts as "recipient"; you may split into recipient_id later
        NEW.request_id,
        'A new response has been submitted to your request'
    );

    RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.notify_on_response_accept()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO marketplace_notifications (company_id, request_id, message)
    VALUES (
        NEW.company_id,
        NEW.request_id,
        'Your response has been accepted!'
    );
    RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.process_workflow_approval()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    workflow_record document_workflows%ROWTYPE;
    total_approvals INTEGER;
    required_approvals INTEGER;
BEGIN
    -- Get workflow details
    SELECT * INTO workflow_record FROM document_workflows WHERE id = NEW.workflow_id;
    
    -- Count current approvals
    SELECT COUNT(*) INTO total_approvals 
    FROM workflow_approvals 
    WHERE workflow_id = NEW.workflow_id AND status = 'approved';
    
    required_approvals := workflow_record.minimum_approvals;
    
    -- Check if workflow is complete
    IF total_approvals >= required_approvals THEN
        UPDATE document_workflows 
        SET status = 'approved', completed_at = NOW()
        WHERE id = NEW.workflow_id;
    END IF;
    
    -- Check if workflow is rejected
    IF NEW.status = 'rejected' THEN
        UPDATE document_workflows 
        SET status = 'rejected', completed_at = NOW()
        WHERE id = NEW.workflow_id;
    END IF;
    
    RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.promote_job_to_work_order(p_id uuid)
 RETURNS work_orders
 LANGUAGE plpgsql
AS $function$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET stage='WORK_ORDER',
      status='ASSIGNED',
      updated_at=now()
  WHERE id=p_id AND stage='JOB'
  RETURNING * INTO rec;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot promote: record not in JOB (id=%)', p_id;
  END IF;

  RETURN rec;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.promote_job_to_work_order(p_id uuid, p_status text DEFAULT 'ASSIGNED'::text, p_start timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end timestamp with time zone DEFAULT NULL::timestamp with time zone, p_tech uuid DEFAULT NULL::uuid)
 RETURNS work_orders
 LANGUAGE plpgsql
AS $function$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET stage = 'WORK_ORDER',
      status = p_status,
      start_time = COALESCE(p_start,start_time),
      end_time = COALESCE(p_end,end_time),
      assigned_technician_id = COALESCE(p_tech,assigned_technician_id),
      updated_at = now()
  WHERE id = p_id AND stage = 'JOB'
  RETURNING * INTO rec;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot promote: record not in JOB (id=%)', p_id;
  END IF;
  RETURN rec;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.promote_quote_to_job(p_id uuid, p_status text DEFAULT 'DRAFT'::text)
 RETURNS work_orders
 LANGUAGE plpgsql
AS $function$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET stage = 'JOB',
      status = p_status,
      updated_at = now()
  WHERE id = p_id AND stage = 'QUOTE'
  RETURNING * INTO rec;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot promote: record not in QUOTE (id=%)', p_id;
  END IF;
  RETURN rec;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.promote_quote_to_job(p_id uuid)
 RETURNS work_orders
 LANGUAGE plpgsql
AS $function$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET stage='JOB',
      status='SCHEDULED',
      updated_at=now()
  WHERE id=p_id AND stage='QUOTE'
  RETURNING * INTO rec;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot promote: record not in QUOTE (id=%)', p_id;
  END IF;

  RETURN rec;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.recalc_labor_totals(p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_labor numeric;
BEGIN
  -- recalc labor portion
  SELECT COALESCE(SUM(amount),0)
  INTO v_labor
  FROM work_order_labor
  WHERE work_order_id = p_id;

  -- update parent totals
  UPDATE work_orders
  SET labor_subtotal = v_labor,
      subtotal = COALESCE(subtotal,0) - COALESCE(labor_subtotal,0) + v_labor,
      total_amount = COALESCE(subtotal,0) + COALESCE(tax_amount,0)
  WHERE id = p_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.recalc_labor_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  PERFORM recalc_labor_totals(NEW.work_order_id);
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.recalculate_inventory_stock(target_company_id uuid DEFAULT NULL::uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    movement_record RECORD;
    stock_change NUMERIC;
    processed_count INTEGER := 0;
BEGIN
    IF target_company_id IS NOT NULL THEN
        DELETE FROM inventory_stock WHERE company_id = target_company_id;
    ELSE
        DELETE FROM inventory_stock;
    END IF;

    FOR movement_record IN
        SELECT * FROM inventory_movements
        WHERE (target_company_id IS NULL OR company_id = target_company_id)
        ORDER BY created_at ASC
    LOOP
        IF movement_record.movement_type IN ('PURCHASE', 'RETURN') THEN
            stock_change := movement_record.quantity;
        ELSIF movement_record.movement_type IN ('USAGE', 'TRANSFER') THEN
            stock_change := -movement_record.quantity;
        ELSIF movement_record.movement_type = 'ADJUSTMENT' THEN
            stock_change := movement_record.quantity;
        ELSE
            stock_change := 0;
        END IF;

        INSERT INTO inventory_stock (item_id, location_id, company_id, quantity, updated_at)
        VALUES (movement_record.item_id, movement_record.location_id, movement_record.company_id, stock_change, NOW())
        ON CONFLICT (item_id, location_id, company_id)
        DO UPDATE SET
            quantity = inventory_stock.quantity + stock_change,
            updated_at = NOW();

        processed_count := processed_count + 1;
    END LOOP;

    RETURN 'Recalculated stock levels from ' || processed_count || ' movements';
END;
$function$
;
CREATE OR REPLACE FUNCTION public.reopen_work_order(p_id uuid, p_new_status work_order_status_enum)
 RETURNS work_orders
 LANGUAGE plpgsql
AS $function$
DECLARE
  rec work_orders;
BEGIN
  UPDATE work_orders
  SET status = p_new_status,
      updated_at = now()
  WHERE id = p_id
    AND status IN ('COMPLETED','CANCELLED')
  RETURNING * INTO rec;

  RETURN rec;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.reopen_work_order(p_id uuid, p_new_status text)
 RETURNS work_orders
 LANGUAGE plpgsql
AS $function$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET status=p_new_status,
      updated_at=now()
  WHERE id=p_id
    AND status IN ('COMPLETED','CANCELLED','IN_PROGRESS')
  RETURNING * INTO rec;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cannot reopen: not in a closable state (id=%)', p_id;
  END IF;

  RETURN rec;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.search_companies_by_tags(_tags text[])
 RETURNS TABLE(company_id uuid, name text, matched_tags text[], avg_rating numeric, rating_count integer, accepts_emergency boolean, emergency_fee numeric, nights_weekends boolean)
 LANGUAGE sql
AS $function$
  select 
    c.id as company_id,
    c.name,
    array_agg(distinct t.name) as matched_tags,
    coalesce(c.avg_rating, 0) as avg_rating,
    coalesce(c.rating_count, 0) as rating_count,
    coalesce(c.accepts_emergency, false) as accepts_emergency,
    c.emergency_fee,
    coalesce(c.nights_weekends, false) as nights_weekends
  from public.companies c
  join public.company_tags ct on c.id = ct.company_id
  join public.service_tags t on ct.tag_id = t.id
  where lower(t.name) = any (select lower(unnest(_tags)))
  group by c.id, c.name, c.avg_rating, c.rating_count, 
           c.accepts_emergency, c.emergency_fee, c.nights_weekends;
$function$
;
CREATE OR REPLACE FUNCTION public.search_marketplace_requests(_tags text[])
 RETURNS TABLE(request_id uuid, title text, description text, matched_tags text[], budget numeric, request_type text, status text, start_time timestamp with time zone, end_time timestamp with time zone, created_at timestamp with time zone)
 LANGUAGE sql
AS $function$
  select 
    r.id as request_id,
    r.title,
    r.description,
    array_agg(distinct t.name) as matched_tags,
    r.budget,
    r.request_type,
    r.status,
    r.start_time,
    r.end_time,
    r.created_at
  from public.marketplace_requests r
  join public.marketplace_request_tags rt on r.id = rt.request_id
  join public.service_tags t on rt.tag_id = t.id
  where lower(t.name) = any (select lower(unnest(_tags)))
    and r.status = 'available'
  group by r.id, r.title, r.description, r.budget, r.request_type,
           r.status, r.start_time, r.end_time, r.created_at;
$function$
;
CREATE OR REPLACE FUNCTION public.send_appointment_reminder(work_order_id uuid, method character varying DEFAULT 'email'::character varying)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    wo work_orders%ROWTYPE;
    customer customers%ROWTYPE;
    settings notification_settings%ROWTYPE;
BEGIN
    -- Get work order and customer details
    SELECT * INTO wo FROM work_orders WHERE id = work_order_id;
    SELECT * INTO customer FROM customers WHERE id = wo.customer_id;
    SELECT * INTO settings FROM notification_settings WHERE company_id = wo.company_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update work order to track reminder sent
    UPDATE work_orders 
    SET 
        reminder_sent_at = NOW(),
        reminder_method = method
    WHERE id = work_order_id;
    
    -- TODO: Integrate with actual email/SMS service
    -- This is a placeholder that would integrate with SendGrid, Twilio, etc.
    
    RETURN TRUE;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.send_workflow_notification(p_workflow_id uuid, p_notification_type text DEFAULT 'reminder'::text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    workflow_record document_workflows%ROWTYPE;
    approver_email TEXT;
BEGIN
    -- Get workflow details
    SELECT * INTO workflow_record FROM document_workflows WHERE id = p_workflow_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Send notifications to pending approvers
    FOR approver_email IN 
        SELECT UNNEST(workflow_record.required_approvers)
        WHERE approver_email NOT IN (
            SELECT approver_email FROM workflow_approvals 
            WHERE workflow_id = p_workflow_id AND status IN ('approved', 'rejected')
        )
    LOOP
        -- TODO: Integrate with email service (SendGrid, Mailgun, etc.)
        -- For now, just log the notification
        RAISE NOTICE 'Sending % notification to % for workflow %', p_notification_type, approver_email, p_workflow_id;
    END LOOP;
    
    RETURN TRUE;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.set_joined_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.joined_at IS NULL THEN
    NEW.joined_at := NEW.created_at;
  END IF;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.set_limit(real)
 RETURNS real
 LANGUAGE c
 STRICT
AS '$libdir/pg_trgm', $function$set_limit$function$
;
CREATE OR REPLACE FUNCTION public.set_reimbursement_request_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.request_number IS NULL THEN
        NEW.request_number := 'REQ-' ||
            TO_CHAR(NEW.created_at, 'YYYY') || '-' ||
            LPAD(EXTRACT(DOY FROM NEW.created_at)::TEXT, 3, '0') || '-' ||
            LPAD((EXTRACT(EPOCH FROM NEW.created_at) % 86400)::INTEGER::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.set_service_request_responses_created_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.created_at IS NULL THEN
    NEW.created_at = now();
  END IF;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.set_service_requests_requested_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.requested_at IS NULL THEN
    NEW.requested_at = now();
  END IF;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $function$
;
CREATE OR REPLACE FUNCTION public.show_limit()
 RETURNS real
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$show_limit$function$
;
CREATE OR REPLACE FUNCTION public.show_trgm(text)
 RETURNS text[]
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$show_trgm$function$
;
CREATE OR REPLACE FUNCTION public.similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity$function$
;
CREATE OR REPLACE FUNCTION public.similarity_dist(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity_dist$function$
;
CREATE OR REPLACE FUNCTION public.similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$similarity_op$function$
;
CREATE OR REPLACE FUNCTION public.strict_word_similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity$function$
;
CREATE OR REPLACE FUNCTION public.strict_word_similarity_commutator_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_commutator_op$function$
;
CREATE OR REPLACE FUNCTION public.strict_word_similarity_dist_commutator_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_dist_commutator_op$function$
;
CREATE OR REPLACE FUNCTION public.strict_word_similarity_dist_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_dist_op$function$
;
CREATE OR REPLACE FUNCTION public.strict_word_similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$strict_word_similarity_op$function$
;
CREATE OR REPLACE FUNCTION public.submit_marketplace_response(_request_id uuid, _company_id uuid, _counter_offer numeric DEFAULT NULL::numeric, _available_start timestamp with time zone DEFAULT NULL::timestamp with time zone, _available_end timestamp with time zone DEFAULT NULL::timestamp with time zone, _message text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  _id uuid;
  _max int;
  _count int;
BEGIN
  SELECT max_responses, response_count INTO _max, _count
  FROM public.marketplace_requests
  WHERE id = _request_id AND status = 'available'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not available or does not exist';
  END IF;

  IF _max IS NOT NULL AND _count >= _max THEN
    RAISE EXCEPTION 'This request has reached its maximum number of responses';
  END IF;

  INSERT INTO public.marketplace_responses (
    request_id, company_id, response_status, counter_offer,
    available_start, available_end, message, created_at
  ) VALUES (
    _request_id, _company_id, 'INTERESTED', _counter_offer,
    _available_start, _available_end, _message, now()
  ) RETURNING id INTO _id;

  UPDATE public.marketplace_requests
  SET response_count = COALESCE(response_count, 0) + 1
  WHERE id = _request_id;

  RETURN _id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.submit_marketplace_response(_request_id uuid, _company_id uuid, _role_id uuid, _response_status marketplace_response_status_enum, _proposed_rate numeric DEFAULT NULL::numeric, _duration_hours integer DEFAULT NULL::integer, _proposed_start timestamp with time zone DEFAULT NULL::timestamp with time zone, _proposed_end timestamp with time zone DEFAULT NULL::timestamp with time zone, _message text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    new_response_id uuid;
BEGIN
    INSERT INTO marketplace_responses (
        request_id, company_id, role_id, response_status,
        proposed_rate, duration_hours, proposed_start, proposed_end, message
    ) VALUES (
        _request_id, _company_id, _role_id, _response_status,
        _proposed_rate, _duration_hours, _proposed_start, _proposed_end, _message
    )
    RETURNING id INTO new_response_id;

    -- Increment response counter in requests
    UPDATE marketplace_requests
    SET response_count = COALESCE(response_count, 0) + 1
    WHERE id = _request_id;

    RETURN new_response_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.submit_response(p_request_id uuid, p_role_id uuid, p_company_id uuid, p_response_type text, p_pricing_type text, p_quantity_fulfilled integer, p_proposed_start_time timestamp with time zone DEFAULT NULL::timestamp with time zone, p_proposed_end_time timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_response_id uuid;
    v_required int;
    v_current int;
    v_remaining int;
    v_final_qty int;
BEGIN
    -- Get required vs current fulfillment
    SELECT quantity_required, quantity_fulfilled
    INTO v_required, v_current
    FROM marketplace_request_roles
    WHERE id = p_role_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid role_id: %', p_role_id;
    END IF;

    -- Calculate how many spots remain
    v_remaining := GREATEST(v_required - v_current, 0);

    -- Clamp the contractor’s offered quantity to remaining capacity
    v_final_qty := LEAST(COALESCE(p_quantity_fulfilled, 1), v_remaining);

    IF v_final_qty <= 0 THEN
        RAISE EXCEPTION 'Role % is already fully staffed (required %, fulfilled %)',
            p_role_id, v_required, v_current;
    END IF;

    -- Insert contractor response
    INSERT INTO marketplace_responses
        (request_id, role_id, company_id, response_type,
         pricing_type, quantity_fulfilled,
         proposed_start_time, proposed_end_time)
    VALUES
        (p_request_id, p_role_id, p_company_id, p_response_type,
         p_pricing_type, v_final_qty,
         p_proposed_start_time, p_proposed_end_time)
    RETURNING id INTO v_response_id;

    -- Update role fulfillment tally
    UPDATE marketplace_request_roles
    SET quantity_fulfilled = quantity_fulfilled + v_final_qty
    WHERE id = p_role_id;

    RETURN v_response_id;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.sync_schedule_event()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update by work_order_id (primary method)
  UPDATE public.schedule_events
  SET start_time = NEW.start_time,
      end_time = NEW.end_time,
      updated_at = NOW(),
      title = COALESCE(NEW.title, 'Work Order: ' || COALESCE(NEW.job_number, NEW.quote_number, 'Untitled')),
      customer_id = NEW.customer_id,
      employee_id = NEW.assigned_technician_id
  WHERE work_order_id = NEW.id;

  -- If no existing schedule event, create one for scheduled work orders
  IF NOT FOUND AND NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    INSERT INTO public.schedule_events (
      company_id,
      work_order_id,
      title,
      description,
      start_time,
      end_time,
      customer_id,
      employee_id,
      event_type,
      status,
      created_at,
      updated_at
    ) VALUES (
      NEW.company_id,
      NEW.id,
      COALESCE(NEW.title, 'Work Order: ' || COALESCE(NEW.job_number, NEW.quote_number, 'Untitled')),
      NEW.description,
      NEW.start_time,
      NEW.end_time,
      NEW.customer_id,
      NEW.assigned_technician_id,
      'work_order',
      'scheduled',
      NOW(),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.sync_schedule_events()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO public.schedule_events (
      company_id,
      work_order_id,
      title,
      description,
      start_time,
      end_time,
      employee_id,
      customer_id,
      event_type,
      status,
      created_at,
      updated_at
  )
  SELECT
      wo.company_id,
      wo.id,
      COALESCE(wo.title, 'Work Order #' || wo.id::text),
      wo.description,
      COALESCE(wo.start_time, NOW() + INTERVAL '1 day'),
      COALESCE(wo.end_time, COALESCE(wo.start_time, NOW() + INTERVAL '1 day') + INTERVAL '2 hours'),
      wo.assigned_technician_id,
      wo.customer_id,
      'work_order',
      wo.status,
      NOW(),
      NOW()
  FROM public.work_orders wo
  WHERE NOT EXISTS (
      SELECT 1 FROM public.schedule_events se
      WHERE se.work_order_id = wo.id
  );
END;
$function$
;
CREATE OR REPLACE FUNCTION public.trg_cancel_request()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  update public.marketplace_requests
  set status = 'canceled'
  where id = new.request_id;
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.trg_invoice_payments_status_bump_fn()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only run if payment inserted, deleted, or amount changed
  IF TG_OP = 'INSERT' 
     OR TG_OP = 'DELETE' 
     OR NEW.amount IS DISTINCT FROM OLD.amount THEN
    PERFORM public.invoices_auto_status(
      COALESCE(NEW.invoice_id, OLD.invoice_id)
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.trg_invoices_auto_status_fn()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') 
     AND (TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status) THEN
    PERFORM public.invoices_auto_status(NEW.id);
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.trg_log_decline_reason()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- New decline (use REJECTED instead of declined)
  IF NEW.response_status = 'REJECTED' AND NEW.decline_reason_code IS NOT NULL THEN
    INSERT INTO public.marketplace_request_decline_stats (request_id, reason_code, decline_count)
    VALUES (NEW.request_id, NEW.decline_reason_code, 1)
    ON CONFLICT (request_id, reason_code)
    DO UPDATE SET decline_count = marketplace_request_decline_stats.decline_count + 1,
                  updated_at = now();

    UPDATE public.marketplace_requests
    SET total_declines = total_declines + 1,
        updated_at = now()
    WHERE id = NEW.request_id;
  END IF;

  -- Undo decline (use REJECTED instead of declined)
  IF OLD.response_status = 'REJECTED' AND NEW.response_status <> 'REJECTED' AND OLD.decline_reason_code IS NOT NULL THEN
    UPDATE public.marketplace_request_decline_stats
    SET decline_count = greatest(decline_count - 1, 0),
        updated_at = now()
    WHERE request_id = OLD.request_id AND reason_code = OLD.decline_reason_code;

    UPDATE public.marketplace_requests
    SET total_declines = greatest(total_declines - 1, 0),
        updated_at = now()
    WHERE id = OLD.request_id;
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.trg_recalc_labor()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  PERFORM public.recalc_labor_totals(NEW.work_order_id);
  RETURN NEW;
END $function$
;
CREATE OR REPLACE FUNCTION public.trg_review_delete()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  perform update_company_rating(old.company_id);
  return old;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.trg_review_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  perform update_company_rating(new.company_id);
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.trg_review_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  perform update_company_rating(new.company_id);
  return new;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.trigger_update_vendor_costs()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only update costs when PO status changes to RECEIVED or CLOSED
  IF OLD.status != NEW.status AND NEW.status IN ('RECEIVED', 'CLOSED') THEN
    PERFORM public.update_vendor_item_costs();
  END IF;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_calendar_on_invoice()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status = 'PAID' THEN
    UPDATE public.schedule_events
    SET status = 'paid'
    WHERE work_order_id = NEW.job_id; -- invoices.job_id links to work_orders.id
  END IF;
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_company_customers_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_company_rating(company uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  update public.companies c
  set avg_rating = sub.new_avg,
      rating_count = sub.new_count
  from (
    select
      r.company_id,
      avg(r.rating)::numeric(3,2) as new_avg,
      count(r.id) as new_count
    from public.marketplace_reviews r
    where r.company_id = company
    group by r.company_id
  ) sub
  where c.id = sub.company_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.update_company_rating()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE companies
  SET 
    average_rating = (
      (average_rating * total_reviews + NEW.rating) / (total_reviews + 1)
    ),
    total_reviews = total_reviews + 1
  WHERE id = NEW.company_id;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_inventory_stock()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    stock_change NUMERIC;
BEGIN
    -- INSERT
    IF TG_OP = 'INSERT' THEN
        IF NEW.movement_type IN ('PURCHASE', 'RETURN') THEN
            stock_change := NEW.quantity; -- add stock
        ELSIF NEW.movement_type IN ('USAGE', 'TRANSFER') THEN
            stock_change := -NEW.quantity; -- remove stock
        ELSIF NEW.movement_type = 'ADJUSTMENT' THEN
            stock_change := NEW.quantity; -- +/- stock
        ELSIF NEW.movement_type = 'ALLOCATION' THEN
            -- allocation reserves stock but doesn’t consume it
            -- here we reduce available stock but not on-hand
            stock_change := 0; -- handled separately in reporting
        ELSE
            stock_change := 0;
        END IF;

        INSERT INTO inventory_stock (item_id, location_id, company_id, quantity, updated_at)
        VALUES (NEW.item_id, NEW.location_id, NEW.company_id, stock_change, NOW())
        ON CONFLICT (item_id, location_id, company_id)
        DO UPDATE SET 
            quantity = inventory_stock.quantity + stock_change,
            updated_at = NOW();

        RETURN NEW;
    END IF;

    -- DELETE
    IF TG_OP = 'DELETE' THEN
        IF OLD.movement_type IN ('PURCHASE', 'RETURN') THEN
            stock_change := -OLD.quantity;
        ELSIF OLD.movement_type IN ('USAGE', 'TRANSFER') THEN
            stock_change := OLD.quantity;
        ELSIF OLD.movement_type = 'ADJUSTMENT' THEN
            stock_change := -OLD.quantity;
        ELSIF OLD.movement_type = 'ALLOCATION' THEN
            stock_change := 0; -- allocations don’t affect stock directly
        ELSE
            stock_change := 0;
        END IF;

        UPDATE inventory_stock 
        SET quantity = quantity + stock_change,
            updated_at = NOW()
        WHERE item_id = OLD.item_id 
          AND location_id = OLD.location_id
          AND company_id = OLD.company_id;

        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_pto_request_historical()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Mark requests as historical when end_date passes
  IF NEW.end_date < CURRENT_DATE AND NEW.status = 'APPROVED' THEN
    NEW.is_historical = true;
  END IF;

  -- Set updated_at if column exists
  IF TG_TABLE_NAME = 'pto_requests' AND NEW.updated_at IS NOT NULL THEN
    NEW.updated_at = now();
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_vendor_item_costs()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update vendor_items.unit_cost based on most recent PO receipts
  UPDATE public.vendor_items vi
  SET 
    unit_cost = recent_costs.avg_cost,
    last_cost_update = now(),
    updated_at = now()
  FROM (
    SELECT 
      poi.supplier_part_number,
      po.vendor_id,
      AVG(poi.unit_cost) as avg_cost,
      MAX(po.created_at) as latest_po_date
    FROM public.po_items poi
    JOIN public.purchase_orders po ON poi.purchase_order_id = po.id
    WHERE po.status IN ('RECEIVED', 'CLOSED')
      AND po.created_at >= now() - interval '90 days'
      AND poi.supplier_part_number IS NOT NULL
      AND poi.unit_cost > 0
    GROUP BY poi.supplier_part_number, po.vendor_id
  ) recent_costs
  WHERE vi.supplier_part_number = recent_costs.supplier_part_number
    AND vi.vendor_id = recent_costs.vendor_id
    AND recent_costs.avg_cost != vi.unit_cost;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.update_vendor_stats()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.vendor_id IS NOT NULL THEN
      UPDATE public.vendors SET
        total_orders = (
          SELECT COUNT(*) FROM public.purchase_orders 
          WHERE vendor_id = NEW.vendor_id AND status != 'CANCELLED'
        ),
        lifetime_spend = (
          SELECT COALESCE(SUM(total_amount), 0) FROM public.purchase_orders 
          WHERE vendor_id = NEW.vendor_id AND status IN ('RECEIVED', 'CLOSED')
        ),
        last_order_date = (
          SELECT MAX(created_at::date) FROM public.purchase_orders 
          WHERE vendor_id = NEW.vendor_id
        ),
        updated_at = now()
      WHERE id = NEW.vendor_id;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' AND OLD.vendor_id IS NOT NULL THEN
    UPDATE public.vendors SET
      total_orders = (
        SELECT COUNT(*) FROM public.purchase_orders 
        WHERE vendor_id = OLD.vendor_id AND status != 'CANCELLED'
      ),
      lifetime_spend = (
        SELECT COALESCE(SUM(total_amount), 0) FROM public.purchase_orders 
        WHERE vendor_id = OLD.vendor_id AND status IN ('RECEIVED', 'CLOSED')
      ),
      last_order_date = (
        SELECT MAX(created_at::date) FROM public.purchase_orders 
        WHERE vendor_id = OLD.vendor_id
      ),
      updated_at = now()
    WHERE id = OLD.vendor_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$
;
CREATE OR REPLACE FUNCTION public.wo_change_status(p_id uuid, p_to text, p_reason text DEFAULT NULL::text)
 RETURNS work_orders
 LANGUAGE plpgsql
AS $function$
DECLARE rec work_orders;
BEGIN
  UPDATE work_orders
  SET status = p_to,
      updated_at = now()
  WHERE id = p_id
  RETURNING * INTO rec;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Work order % not found', p_id;
  END IF;

  RETURN rec;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.wo_change_status(p_id uuid, p_to work_order_status_enum, p_reason text DEFAULT NULL::text)
 RETURNS work_orders
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  rec_old work_orders;
  rec_new work_orders;
BEGIN
  SELECT * INTO rec_old FROM work_orders WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'work order % not found', p_id;
  END IF;

  UPDATE work_orders
  SET status = p_to,
      updated_at = now()
  WHERE id = p_id
  RETURNING * INTO rec_new;

  -- Audit
  INSERT INTO work_order_audit_log (work_order_id, company_id, action, old_status, new_status, details)
  VALUES (
    rec_old.id,
    rec_old.company_id,
    'status_changed',
    rec_old.status::text,
    rec_new.status::text,
    jsonb_build_object('reason', p_reason, 'changed_at', now())
  );

  RETURN rec_new;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.wo_is_legal_transition(p_stage text, p_from text, p_to text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
begin
  case p_stage
    when 'QUOTE' then
      return (p_from,p_to) in (('DRAFT','SENT'),('SENT','ACCEPTED'),('SENT','REJECTED'),('SENT','EXPIRED'));
    when 'JOB' then
      return (p_from,p_to) in (('DRAFT','SCHEDULED'),('SCHEDULED','IN_PROGRESS'),('IN_PROGRESS','COMPLETED'),('SCHEDULED','CANCELLED'));
    when 'WORK_ORDER' then
      return (p_from,p_to) in (('ASSIGNED','IN_PROGRESS'),('IN_PROGRESS','COMPLETED'));
    else
      return false;
  end case;
end $function$
;
CREATE OR REPLACE FUNCTION public.wo_stage_status_auto()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Stage changes based on unified status
  IF NEW.stage = 'QUOTE' AND NEW.status = 'ACCEPTED' THEN
    NEW.stage := 'JOB';
  ELSIF NEW.stage = 'JOB' AND NEW.status IN ('SCHEDULED','IN_PROGRESS') THEN
    NEW.stage := 'WORK_ORDER';
  ELSIF NEW.stage = 'WORK_ORDER' AND NEW.status IN ('CANCELLED') THEN
    NEW.stage := 'JOB';
  END IF;

  RETURN NEW;
END;
$function$
;
CREATE OR REPLACE FUNCTION public.wo_touch()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at := now();
  NEW.total_cents := COALESCE(NEW.subtotal_cents,0) + COALESCE(NEW.tax_cents,0);
  RETURN NEW;
END; $function$
;
CREATE OR REPLACE FUNCTION public.word_similarity(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity$function$
;
CREATE OR REPLACE FUNCTION public.word_similarity_commutator_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_commutator_op$function$
;
CREATE OR REPLACE FUNCTION public.word_similarity_dist_commutator_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_dist_commutator_op$function$
;
CREATE OR REPLACE FUNCTION public.word_similarity_dist_op(text, text)
 RETURNS real
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_dist_op$function$
;
CREATE OR REPLACE FUNCTION public.word_similarity_op(text, text)
 RETURNS boolean
 LANGUAGE c
 STABLE PARALLEL SAFE STRICT
AS '$libdir/pg_trgm', $function$word_similarity_op$function$
;


-- SELECT pg_get_triggerdef(oid) || ';' as sql
CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();
CREATE TRIGGER invoice_items_recalc_trigger BEFORE INSERT OR UPDATE ON public.invoice_items FOR EACH ROW EXECUTE FUNCTION invoice_items_recalc();
CREATE TRIGGER invoices_auto_status_trigger AFTER INSERT OR UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION invoices_auto_status();
CREATE TRIGGER invoices_paid_trigger AFTER UPDATE OF status ON public.invoices FOR EACH ROW WHEN (((new.status = 'PAID'::text) AND (old.status IS DISTINCT FROM new.status))) EXECUTE FUNCTION update_calendar_on_invoice();
CREATE TRIGGER invoices_update_total_trigger AFTER INSERT OR DELETE OR UPDATE ON public.invoice_items FOR EACH ROW EXECUTE FUNCTION invoices_update_total();
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION invoices_updated_at_fn();
CREATE TRIGGER messages_context_check BEFORE INSERT OR UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION enforce_message_context();
CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();
CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();
CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();
CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();
CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();
CREATE TRIGGER schedule_events_updated_at BEFORE UPDATE ON public.schedule_events FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();
CREATE TRIGGER trg_attachments_company BEFORE INSERT OR UPDATE ON public.attachments FOR EACH ROW EXECUTE FUNCTION enforce_attachments_company_match();
CREATE TRIGGER trg_deduct_pto AFTER UPDATE ON public.employee_time_off FOR EACH ROW EXECUTE FUNCTION deduct_pto_on_approval();
CREATE TRIGGER trg_enforce_response_cap BEFORE INSERT ON public.marketplace_responses FOR EACH ROW EXECUTE FUNCTION enforce_response_cap();
CREATE TRIGGER trg_invoice_payments_status_bump AFTER INSERT OR DELETE OR UPDATE ON public.invoice_payments FOR EACH ROW EXECUTE FUNCTION invoices_auto_status();
CREATE TRIGGER trg_log_customer_status_change BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION log_customer_status_change();
CREATE TRIGGER trg_marketplace_request_cancel AFTER INSERT ON public.marketplace_cancellations FOR EACH ROW EXECUTE FUNCTION trg_cancel_request();
CREATE TRIGGER trg_marketplace_response_decline AFTER INSERT OR UPDATE ON public.marketplace_responses FOR EACH ROW EXECUTE FUNCTION trg_log_decline_reason();
CREATE TRIGGER trg_marketplace_review_delete AFTER DELETE ON public.marketplace_reviews FOR EACH ROW EXECUTE FUNCTION trg_review_delete();
CREATE TRIGGER trg_marketplace_review_insert AFTER INSERT ON public.marketplace_reviews FOR EACH ROW EXECUTE FUNCTION trg_review_insert();
CREATE TRIGGER trg_marketplace_review_update AFTER UPDATE ON public.marketplace_reviews FOR EACH ROW EXECUTE FUNCTION trg_review_update();
CREATE TRIGGER trg_normalize_tag BEFORE INSERT OR UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION normalize_tag();
CREATE TRIGGER trg_normalize_tag_name BEFORE INSERT OR UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION normalize_tag_name();
CREATE TRIGGER trg_notify_new_request AFTER INSERT ON public.marketplace_requests FOR EACH ROW EXECUTE FUNCTION notify_on_new_request();
CREATE TRIGGER trg_notify_new_response AFTER INSERT ON public.marketplace_responses FOR EACH ROW EXECUTE FUNCTION notify_on_new_response();
CREATE TRIGGER trg_notify_response_accept AFTER UPDATE ON public.marketplace_responses FOR EACH ROW WHEN (((new.response_status = 'ACCEPTED'::marketplace_response_status_enum) AND (old.response_status IS DISTINCT FROM 'ACCEPTED'::marketplace_response_status_enum))) EXECUTE FUNCTION notify_on_response_accept();
CREATE TRIGGER trg_recalc_labor AFTER INSERT OR DELETE OR UPDATE ON public.work_order_labor FOR EACH ROW EXECUTE FUNCTION recalc_labor_trigger();
CREATE TRIGGER trg_set_joined_at BEFORE INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION set_joined_at();
CREATE TRIGGER trg_set_reimbursement_request_number BEFORE INSERT ON public.reimbursement_requests FOR EACH ROW EXECUTE FUNCTION set_reimbursement_request_number();
CREATE TRIGGER trg_update_company_customers_updated_at BEFORE UPDATE ON public.company_customers FOR EACH ROW EXECUTE FUNCTION update_company_customers_updated_at();
CREATE TRIGGER trg_update_company_rating AFTER INSERT ON public.contractor_ratings FOR EACH ROW EXECUTE FUNCTION update_company_rating();
CREATE TRIGGER trg_update_service_request_responses_created_at BEFORE INSERT ON public.service_request_responses FOR EACH ROW EXECUTE FUNCTION set_service_request_responses_created_at();
CREATE TRIGGER trg_update_service_requests_requested_at BEFORE INSERT ON public.service_requests FOR EACH ROW EXECUTE FUNCTION set_service_requests_requested_at();
CREATE TRIGGER trigger_auto_generate_po_number BEFORE INSERT ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION auto_generate_po_number();
CREATE TRIGGER trigger_po_status_update_costs AFTER UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION trigger_update_vendor_costs();
CREATE TRIGGER trigger_process_workflow_approval AFTER INSERT OR UPDATE ON public.workflow_approvals FOR EACH ROW EXECUTE FUNCTION process_workflow_approval();
CREATE TRIGGER trigger_update_inventory_stock AFTER INSERT OR DELETE ON public.inventory_movements FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_stats_trigger AFTER INSERT OR DELETE OR UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION update_vendor_stats();
CREATE TRIGGER update_work_order_items_updated_at BEFORE UPDATE ON public.work_order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER vendors_status_change_trigger BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION log_vendor_status_change();
CREATE TRIGGER wol_aiu_recalc AFTER INSERT OR DELETE OR UPDATE ON public.work_order_labor FOR EACH ROW EXECUTE FUNCTION trg_recalc_labor();
CREATE TRIGGER work_order_items_updated_at BEFORE UPDATE ON public.work_order_items FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER work_orders_updated_at BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


-- SELECT 'CREATE VIEW ' || table_name || ' AS ' || view_definition || ';' as sql
CREATE VIEW closed_jobs AS  SELECT id,
    company_id,
    company_name,
    title,
    description,
    customer_id,
    status,
    assigned_technician_id,
    start_time,
    end_time,
    estimated_duration,
    work_location,
    subtotal,
    tax_rate,
    tax_amount,
    total_amount,
    quote_number,
    quote_sent_date,
    quote_expires_date,
    job_number,
    actual_start_time,
    actual_end_time,
    invoice_number,
    invoice_date,
    due_date,
    amount_paid,
    created_at,
    updated_at,
    created_by,
    notes,
    internal_notes,
    attachments,
    stage,
    labor_subtotal,
    labor_summary,
    reason,
    invoice_id,
    pricing_model,
    flat_rate_amount,
    unit_count,
    unit_price,
    percentage,
    recurring_interval,
    percentage_base_amount,
    recurring_start_date,
    recurring_end_date,
    recurring_custom_interval_days,
    recurring_rate,
    milestone_base_amount,
    service_address_id,
    service_address_line_1,
    service_address_line_2,
    service_city,
    service_state,
    service_zip_code,
    service_country,
    access_instructions,
    completed_at,
    version,
    accepted_at,
    accepted_by,
    accepted_ip,
    sent_at,
    sent_to,
    applied_tax_rate,
    progress_percent,
    priority,
    tags,
    parent_job_id,
    expected_completion,
    is_visible_to_customer,
    is_recurring,
    recurrence_rule,
    customer_notified,
    last_notified_at,
    reminder_sent_at,
    reminder_method,
    confirmation_sent_at,
    customer_confirmed_at,
    reschedule_requested_at,
    recurring_parent_id,
    recurring_sequence,
    is_sent,
    marketplace_request_id,
    marketplace_response_id,
    preferred_time_option
   FROM work_orders
  WHERE ((stage = 'WORK_ORDER'::stage_enum) AND (status = 'COMPLETED'::text));;
CREATE VIEW inventory_item_summary AS  SELECT i.id AS item_id,
    i.name AS item_name,
    i.sku,
    i.cost,
    i.sell_price,
    (COALESCE(sum(s.on_hand), (0)::numeric))::numeric(12,4) AS total_on_hand,
    (COALESCE(sum(s.reserved), (0)::numeric))::numeric(12,4) AS total_reserved,
    (COALESCE(sum(s.available), (0)::numeric))::numeric(12,4) AS total_available
   FROM (inventory_items i
     LEFT JOIN inventory_stock_status s ON ((i.id = s.item_id)))
  GROUP BY i.id, i.name, i.sku, i.cost, i.sell_price;;
CREATE VIEW inventory_stock_status AS  SELECT s.item_id,
    i.name AS item_name,
    s.location_id,
    s.company_id,
    s.quantity AS on_hand,
    (0)::numeric(12,4) AS reserved,
    s.quantity AS available,
    s.updated_at
   FROM (inventory_stock s
     JOIN inventory_items i ON ((i.id = s.item_id)));;
CREATE VIEW pto_current_balances AS  SELECT employee_id,
    company_id,
    COALESCE(category_code, 'VAC'::text) AS category_code,
    COALESCE(sum(hours), (0)::numeric) AS current_balance,
    max(effective_date) AS last_transaction_date,
    count(
        CASE
            WHEN (entry_type = 'ACCRUAL'::text) THEN 1
            ELSE NULL::integer
        END) AS accrual_count,
    count(
        CASE
            WHEN (entry_type = 'USAGE'::text) THEN 1
            ELSE NULL::integer
        END) AS usage_count
   FROM pto_ledger l
  WHERE ((effective_date <= CURRENT_DATE) AND (company_id IS NOT NULL))
  GROUP BY employee_id, company_id, category_code;;
CREATE VIEW sales_performance AS  SELECT t.id AS target_id,
    t.user_id,
    u.email AS user_email,
    t.target_amount,
    t.achieved_amount,
    t.start_date,
    t.end_date,
    ((t.achieved_amount / NULLIF(t.target_amount, (0)::numeric)) * (100)::numeric) AS achievement_percent
   FROM (sales_targets t
     LEFT JOIN users u ON ((u.id = t.user_id)));;
CREATE VIEW sales_rep_commission_summary AS  SELECT ic.company_id,
    ic.sales_rep_id,
    count(*) AS total_invoices,
    sum(i.total_amount) AS total_sales,
    sum(ic.commission_amount) AS total_commission_earned,
    sum(
        CASE
            WHEN (ic.commission_status = 'paid'::text) THEN ic.commission_amount
            ELSE (0)::numeric
        END) AS commission_paid,
    sum(
        CASE
            WHEN (ic.commission_status = 'pending'::text) THEN ic.commission_amount
            ELSE (0)::numeric
        END) AS commission_pending,
    avg(ic.commission_rate) AS average_commission_rate
   FROM ((invoice_commissions ic
     JOIN invoices i ON ((ic.invoice_id = i.id)))
     JOIN users u ON ((ic.sales_rep_id = u.id)))
  GROUP BY ic.company_id, ic.sales_rep_id;;
CREATE VIEW vendor_catalog_v AS  SELECT vi.id,
    vi.company_id,
    vi.vendor_id,
    v.name AS vendor_name,
    vi.supplier_part_number,
    vi.supplier_description,
    vi.unit_cost,
    vi.minimum_order_qty,
    vi.lead_time_days,
    vi.is_active,
    vi.last_ordered_at,
    ii.id AS inventory_item_id,
    ii.sku AS internal_sku,
    ii.name AS item_name,
    ii.description AS internal_description,
    ii.cost AS internal_cost,
    ii.sell_price,
    ii.reorder_point,
    COALESCE(stock_summary.total_on_hand, (0)::numeric) AS stock_on_hand,
        CASE
            WHEN (ii.id IS NULL) THEN 'NOT_STOCKED'::text
            WHEN (COALESCE(stock_summary.total_on_hand, (0)::numeric) = (0)::numeric) THEN 'OUT_OF_STOCK'::text
            WHEN (COALESCE(stock_summary.total_on_hand, (0)::numeric) <= (COALESCE(ii.reorder_point, 5))::numeric) THEN 'LOW_STOCK'::text
            ELSE 'IN_STOCK'::text
        END AS stock_status,
    vi.created_at,
    vi.updated_at
   FROM (((vendor_items vi
     LEFT JOIN vendors v ON ((vi.vendor_id = v.id)))
     LEFT JOIN inventory_items ii ON ((vi.inventory_item_id = ii.id)))
     LEFT JOIN ( SELECT inventory_stock.item_id,
            sum(inventory_stock.quantity) AS total_on_hand
           FROM inventory_stock
          GROUP BY inventory_stock.item_id) stock_summary ON ((ii.id = stock_summary.item_id)))
  WHERE (vi.is_active = true);;
CREATE VIEW vw_employee_pto_ledger AS  SELECT l.id,
    e.full_name,
    e.company_id,
    l.entry_type,
    l.hours,
    l.created_at,
    l.policy_id
   FROM (pto_ledger l
     JOIN employees e ON ((l.employee_id = e.id)))
  ORDER BY l.created_at DESC;;
CREATE VIEW vw_timesheet_reports AS  SELECT et.id AS timesheet_id,
    u.company_id,
    u.id AS user_id,
    u.full_name,
    u.role,
    et.work_date,
    et.clock_in,
    et.clock_out,
    (((EXTRACT(epoch FROM (et.clock_out - et.clock_in)) / 3600.0) - ((COALESCE(et.break_minutes, 0))::numeric / 60.0)) + et.overtime_hours) AS total_hours,
    et.status,
    et.approved_by,
    et.approved_at,
    et.denial_reason
   FROM (employee_timesheets et
     JOIN users u ON ((et.user_id = u.id)));;
CREATE VIEW work_order_crew_v AS  SELECT wol.work_order_id,
    jsonb_agg(jsonb_build_object('employee_id', wol.employee_id, 'name', u.full_name, 'work_date', wol.work_date, 'hours', wol.hours, 'rate', wol.rate) ORDER BY u.full_name) AS crew
   FROM (work_order_labor wol
     LEFT JOIN users u ON ((u.id = wol.employee_id)))
  GROUP BY wol.work_order_id;;


-- SELECT 'CREATE POLICY ' || policyname || ' ON ' || tablename ||
CREATE POLICY Users can delete customer addresses for their company ON customer_addresses FOR DELETE TO public USING ((company_id = ((auth.jwt() ->> 'company_id'::text))::uuid));
CREATE POLICY Users can insert customer addresses for their company ON customer_addresses FOR INSERT TO public WITH CHECK ((company_id = ((auth.jwt() ->> 'company_id'::text))::uuid));
CREATE POLICY Users can update customer addresses for their company ON customer_addresses FOR UPDATE TO public USING ((company_id = ((auth.jwt() ->> 'company_id'::text))::uuid));
CREATE POLICY Users can view customer addresses for their company ON customer_addresses FOR SELECT TO public USING ((company_id = ((auth.jwt() ->> 'company_id'::text))::uuid));
CREATE POLICY customer_messages_company_isolation ON customer_messages FOR ALL TO public USING ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY Users can access documents for their company ON documents FOR ALL TO public USING ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY Users can manage own certifications ON employee_certifications FOR ALL TO public USING (((employee_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_certifications.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));
CREATE POLICY Users can view own certifications ON employee_certifications FOR SELECT TO public USING (((employee_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_certifications.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));
CREATE POLICY Users can update own goals ON employee_development_goals FOR UPDATE TO public USING (((employee_id = auth.uid()) OR (assigned_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_development_goals.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));
CREATE POLICY Users can view own goals ON employee_development_goals FOR SELECT TO public USING (((employee_id = auth.uid()) OR (assigned_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_development_goals.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));
CREATE POLICY Reviewers can manage reviews ON employee_performance_reviews FOR ALL TO public USING (((reviewer_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_performance_reviews.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));
CREATE POLICY Users can view own reviews ON employee_performance_reviews FOR SELECT TO public USING (((employee_id = auth.uid()) OR (reviewer_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_performance_reviews.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));
CREATE POLICY Users can give recognition ON employee_recognition FOR INSERT TO public WITH CHECK (((given_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_recognition.company_id))))));
CREATE POLICY Users can view recognition ON employee_recognition FOR SELECT TO public USING (((employee_id = auth.uid()) OR (given_by = auth.uid()) OR ((is_public = true) AND (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_recognition.company_id))))) OR (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_recognition.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));
CREATE POLICY Admins can manage skills ON employee_skills FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_skills.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text]))))));
CREATE POLICY Users can view own skills ON employee_skills FOR SELECT TO public USING (((employee_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_skills.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));
CREATE POLICY Users can view own time summary ON employee_time_summary FOR SELECT TO public USING (((employee_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.company_id = employee_time_summary.company_id) AND (users.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));
CREATE POLICY Admins can manage expense categories ON expense_categories FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND (expense_categories.company_id = expense_categories.company_id) AND ((users.role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::text[]))))));
CREATE POLICY Users can view company expense categories ON expense_categories FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND (expense_categories.company_id = expense_categories.company_id)))));
CREATE POLICY Users can create own expenses ON expenses FOR INSERT TO public WITH CHECK ((user_id = auth.uid()));
CREATE POLICY Users can delete expenses ON expenses FOR DELETE TO public USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND (expenses.company_id = expenses.company_id) AND ((users.role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::text[])))))));
CREATE POLICY Users can update expenses ON expenses FOR UPDATE TO public USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND (expenses.company_id = expenses.company_id) AND ((users.role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::text[])))))));
CREATE POLICY Users can view company expenses ON expenses FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND (expenses.company_id = expenses.company_id)))));
CREATE POLICY employee_message_access ON messages FOR SELECT TO public USING (((work_order_id IN ( SELECT work_orders.id
   FROM work_orders
  WHERE (work_orders.company_id = auth.uid()))) OR (recipient_id = auth.uid()) OR (sender_id = auth.uid())));
CREATE POLICY Company can see own notifications ON notifications FOR SELECT TO public USING ((company_id = ((auth.jwt() ->> 'company_id'::text))::uuid));
CREATE POLICY Users can insert quote analytics for their company ON quote_analytics FOR INSERT TO public WITH CHECK ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY Users can update quote analytics for their company ON quote_analytics FOR UPDATE TO public USING ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY Users can view quote analytics for their company ON quote_analytics FOR SELECT TO public USING ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY Users can insert approval workflows for their company ON quote_approval_workflows FOR INSERT TO public WITH CHECK ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY Users can update approval workflows for their company ON quote_approval_workflows FOR UPDATE TO public USING ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY Users can view approval workflows for their company ON quote_approval_workflows FOR SELECT TO public USING ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY Users can insert follow-ups for their company ON quote_follow_ups FOR INSERT TO public WITH CHECK ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY Users can update follow-ups for their company ON quote_follow_ups FOR UPDATE TO public USING ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY Users can view follow-ups for their company ON quote_follow_ups FOR SELECT TO public USING ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY Users can track own tool usage ON tool_usage FOR ALL TO public USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND (tool_usage.company_id = tool_usage.company_id) AND ((users.role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::text[])))))));
CREATE POLICY Users can access work order audit logs for their company ON work_order_audit_log FOR ALL TO public USING ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));
CREATE POLICY Users can view company work order items ON work_order_items FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = auth.uid()) AND (users.company_id = work_order_items.company_id)))));
CREATE POLICY wol_mod_in_company ON work_order_labor FOR ALL TO public USING ((company_id = ((auth.jwt() ->> 'company_id'::text))::uuid)) WITH CHECK ((company_id = ((auth.jwt() ->> 'company_id'::text))::uuid));
CREATE POLICY wol_select_in_company ON work_order_labor FOR SELECT TO public USING ((company_id = ((auth.jwt() ->> 'company_id'::text))::uuid));
CREATE POLICY Users can access work order versions for their company ON work_order_versions FOR ALL TO public USING ((company_id = ( SELECT users.company_id
   FROM users
  WHERE (users.id = auth.uid()))));

