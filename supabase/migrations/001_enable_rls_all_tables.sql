-- ============================================
-- TradeMate Pro - Enable RLS on All Tables
-- ============================================
-- This migration enables Row Level Security on all tables
-- and creates company-scoped policies for data isolation
-- ============================================

-- Enable RLS on all core business tables
ALTER TABLE IF EXISTS work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- Enable RLS on financial tables (skip views - they inherit RLS from base tables)
-- ALTER TABLE IF EXISTS customer_financial_summary ENABLE ROW LEVEL SECURITY; -- VIEW
-- ALTER TABLE IF EXISTS invoices_summary ENABLE ROW LEVEL SECURITY; -- VIEW
ALTER TABLE IF EXISTS payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tax_exemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tax_jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS taxes ENABLE ROW LEVEL SECURITY;

-- Enable RLS on employee/payroll tables (skip views)
-- ALTER TABLE IF EXISTS employee_performance ENABLE ROW LEVEL SECURITY; -- VIEW
-- ALTER TABLE IF EXISTS employee_performance_metrics ENABLE ROW LEVEL SECURITY; -- VIEW
-- ALTER TABLE IF EXISTS employee_timesheets ENABLE ROW LEVEL SECURITY; -- VIEW
ALTER TABLE IF EXISTS payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payroll_line_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on configuration tables
ALTER TABLE IF EXISTS companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS service_categories ENABLE ROW LEVEL SECURITY;

-- Enable RLS on quote/template tables
ALTER TABLE IF EXISTS quote_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quote_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quote_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quote_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quote_approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quote_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quote_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quote_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quote_responses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on work order related tables
ALTER TABLE IF EXISTS work_order_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS work_order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS work_order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS work_order_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS work_order_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS work_order_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS change_order_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on customer related tables
ALTER TABLE IF EXISTS customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on inventory tables
ALTER TABLE IF EXISTS inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventory_stock ENABLE ROW LEVEL SECURITY;

-- Enable RLS on marketplace tables
ALTER TABLE IF EXISTS marketplace_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS marketplace_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS marketplace_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS marketplace_settings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on invoice/payment tables
ALTER TABLE IF EXISTS invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoice_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_deliveries ENABLE ROW LEVEL SECURITY;

-- Enable RLS on purchase order tables
ALTER TABLE IF EXISTS purchase_order_line_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on service agreement tables
ALTER TABLE IF EXISTS service_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS service_address_tax_rates ENABLE ROW LEVEL SECURITY;

-- Enable RLS on subscription/billing tables
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS billing_plans ENABLE ROW LEVEL SECURITY;

-- Enable RLS on recurring schedule tables
ALTER TABLE IF EXISTS recurring_schedules ENABLE ROW LEVEL SECURITY;

-- Enable RLS on document template tables
ALTER TABLE IF EXISTS document_templates ENABLE ROW LEVEL SECURITY;

-- Enable RLS on job completion tables
ALTER TABLE IF EXISTS job_completion_checklist ENABLE ROW LEVEL SECURITY;

-- Enable RLS on tools table
ALTER TABLE IF EXISTS tools ENABLE ROW LEVEL SECURITY;

-- Enable RLS on audit/logging tables
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_sessions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user preference tables
ALTER TABLE IF EXISTS user_dashboard_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Enable RLS on work settings table
ALTER TABLE IF EXISTS work_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper Function: Get User's Company ID
-- ============================================
CREATE OR REPLACE FUNCTION public.user_company_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT company_id
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- ============================================
-- Helper Function: Check if User is Admin
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role IN ('admin', 'super_admin')
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- ============================================
-- Helper Function: Check if User is Super Admin
-- ============================================
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role = 'super_admin'
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

