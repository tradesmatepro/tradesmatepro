-- =====================================================
-- COMPLETE TRADEMATE PRO DATABASE SCHEMA
-- Industry Standard - No More Patches
-- =====================================================

-- This creates the COMPLETE database schema that TradeMate Pro expects
-- Based on comprehensive frontend analysis - every table the app references

BEGIN;

-- =====================================================
-- ENUMS (Industry Standard Values)
-- =====================================================

-- Work Order Status (Complete Pipeline)
DROP TYPE IF EXISTS work_order_status_enum CASCADE;
CREATE TYPE work_order_status_enum AS ENUM (
    'QUOTE', 'SENT', 'ACCEPTED', 'REJECTED', 
    'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 
    'CANCELLED', 'INVOICED'
);

-- Pricing Models
DROP TYPE IF EXISTS pricing_preference_enum CASCADE;
CREATE TYPE pricing_preference_enum AS ENUM ('FIXED', 'TIME_AND_MATERIALS');

-- Customer Status
DROP TYPE IF EXISTS customer_status_enum CASCADE;
CREATE TYPE customer_status_enum AS ENUM ('ACTIVE', 'INACTIVE');

-- User Status
DROP TYPE IF EXISTS user_status_enum CASCADE;
CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- Invoice Status
DROP TYPE IF EXISTS invoice_status_enum CASCADE;
CREATE TYPE invoice_status_enum AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID');

-- Payment Status
DROP TYPE IF EXISTS payment_status_enum CASCADE;
CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- Employee Status
DROP TYPE IF EXISTS employee_status_enum CASCADE;
CREATE TYPE employee_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED');

-- Communication Types
DROP TYPE IF EXISTS communication_type_enum CASCADE;
CREATE TYPE communication_type_enum AS ENUM ('CALL', 'EMAIL', 'MEETING', 'NOTE');

-- Notification Types
DROP TYPE IF EXISTS notification_type_enum CASCADE;
CREATE TYPE notification_type_enum AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');

-- PTO Types
DROP TYPE IF EXISTS pto_type_enum CASCADE;
CREATE TYPE pto_type_enum AS ENUM ('VACATION', 'SICK', 'PERSONAL', 'HOLIDAY');

-- PTO Status
DROP TYPE IF EXISTS pto_status_enum CASCADE;
CREATE TYPE pto_status_enum AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'CANCELLED');

-- Marketplace Request Status
DROP TYPE IF EXISTS marketplace_status_enum CASCADE;
CREATE TYPE marketplace_status_enum AS ENUM ('OPEN', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'COMPLETED', 'CANCELLED');

-- =====================================================
-- CORE BUSINESS TABLES
-- =====================================================

-- Companies (Multi-tenant root)
CREATE TABLE IF NOT EXISTS companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text,
    phone text,
    address text,
    city text,
    state text,
    zip_code text,
    website text,
    logo_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Users (Authentication & Roles)
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text NOT NULL,
    role text NOT NULL DEFAULT 'user',
    tier text DEFAULT 'basic',
    phone_number text,
    avatar_url text,
    status user_status_enum NOT NULL DEFAULT 'ACTIVE',
    last_login timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Customers (CRM Core)
CREATE TABLE IF NOT EXISTS customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    city text,
    state text,
    zip_code text,
    status customer_status_enum NOT NULL DEFAULT 'ACTIVE',
    notes text,
    total_jobs integer DEFAULT 0,
    preferred_service_time text,
    special_instructions text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Customer Tags (Flexible Classification)
CREATE TABLE IF NOT EXISTS customer_tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Customer Communications
CREATE TABLE IF NOT EXISTS customer_communications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    created_by uuid NOT NULL REFERENCES users(id),
    type communication_type_enum NOT NULL,
    subject text,
    content text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Work Orders (Unified Quotes/Jobs/Invoices Pipeline)
CREATE TABLE IF NOT EXISTS work_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    quote_number text UNIQUE,
    job_number text UNIQUE,
    title text NOT NULL,
    description text,
    notes text,
    status work_order_status_enum NOT NULL DEFAULT 'QUOTE',
    pricing_model pricing_preference_enum NOT NULL DEFAULT 'TIME_AND_MATERIALS',
    estimated_duration integer,
    total_amount numeric(12,2) DEFAULT 0,
    scheduled_start timestamptz,
    scheduled_end timestamptz,
    valid_until date,
    discount_type text,
    discount_value numeric(10,2),
    approval_required boolean DEFAULT false,
    deposit_required numeric(10,2),
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Work Order Line Items (Labor & Materials)
CREATE TABLE IF NOT EXISTS work_order_line_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('LABOR', 'MATERIAL')),
    employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
    hours numeric(10,2),
    rate numeric(10,2),
    overtime_rate numeric(10,2),
    inventory_item_id uuid REFERENCES inventory_items(id) ON DELETE SET NULL,
    quantity numeric(10,2),
    unit_cost numeric(10,2),
    markup_percent numeric(5,2) DEFAULT 0,
    total_cost numeric(12,2) NOT NULL DEFAULT 0,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- EMPLOYEES & HR SYSTEM
-- =====================================================

-- Employees
CREATE TABLE IF NOT EXISTS employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    employee_number text UNIQUE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text,
    hire_date date,
    status employee_status_enum NOT NULL DEFAULT 'ACTIVE',
    hourly_rate numeric(10,2),
    overtime_rate numeric(10,2),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Employee Timesheets
CREATE TABLE IF NOT EXISTS employee_timesheets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    work_order_id uuid REFERENCES work_orders(id) ON DELETE SET NULL,
    date date NOT NULL,
    start_time time,
    end_time time,
    break_duration integer DEFAULT 0,
    total_hours numeric(8,2),
    overtime_hours numeric(8,2) DEFAULT 0,
    notes text,
    approved boolean DEFAULT false,
    approved_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- PTO Policies
CREATE TABLE IF NOT EXISTS pto_policies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    type pto_type_enum NOT NULL,
    accrual_rate numeric(8,4),
    max_balance numeric(8,2),
    carryover_limit numeric(8,2),
    effective_date date NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- PTO Ledger (Accruals & Usage)
CREATE TABLE IF NOT EXISTS pto_ledger (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    policy_id uuid NOT NULL REFERENCES pto_policies(id) ON DELETE CASCADE,
    entry_type text NOT NULL CHECK (entry_type IN ('ACCRUAL', 'USAGE', 'ADJUSTMENT', 'CARRYOVER')),
    hours numeric(8,2) NOT NULL,
    effective_date date NOT NULL,
    description text,
    created_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Employee PTO Balances (Current View)
CREATE TABLE IF NOT EXISTS employee_pto_balances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    policy_id uuid NOT NULL REFERENCES pto_policies(id) ON DELETE CASCADE,
    available_hours numeric(8,2) DEFAULT 0,
    pending_hours numeric(8,2) DEFAULT 0,
    used_hours numeric(8,2) DEFAULT 0,
    last_updated timestamptz NOT NULL DEFAULT now()
);

-- Employee Time Off Requests
CREATE TABLE IF NOT EXISTS employee_time_off (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    policy_id uuid NOT NULL REFERENCES pto_policies(id) ON DELETE CASCADE,
    start_date date NOT NULL,
    end_date date NOT NULL,
    hours_requested numeric(8,2) NOT NULL,
    status pto_status_enum NOT NULL DEFAULT 'PENDING',
    reason text,
    notes text,
    approved_by uuid REFERENCES users(id),
    approved_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- INVOICING & PAYMENTS SYSTEM
-- =====================================================

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    invoice_number text UNIQUE NOT NULL,
    status invoice_status_enum NOT NULL DEFAULT 'UNPAID',
    subtotal numeric(12,2) NOT NULL DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    discount_amount numeric(12,2) DEFAULT 0,
    total_amount numeric(12,2) NOT NULL DEFAULT 0,
    due_date date,
    paid_date date,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Invoice Line Items
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    work_order_line_item_id uuid REFERENCES work_order_line_items(id) ON DELETE SET NULL,
    description text NOT NULL,
    quantity numeric(10,2) NOT NULL DEFAULT 1,
    unit_price numeric(10,2) NOT NULL DEFAULT 0,
    total_price numeric(12,2) NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount numeric(12,2) NOT NULL,
    payment_method text,
    payment_date date NOT NULL DEFAULT CURRENT_DATE,
    status payment_status_enum NOT NULL DEFAULT 'PENDING',
    transaction_id text,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- INVENTORY MANAGEMENT
-- =====================================================

-- Inventory Items
CREATE TABLE IF NOT EXISTS inventory_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sku text UNIQUE,
    name text NOT NULL,
    description text,
    category text,
    unit_cost numeric(10,2) DEFAULT 0,
    selling_price numeric(10,2) DEFAULT 0,
    quantity_on_hand integer DEFAULT 0,
    reorder_level integer DEFAULT 0,
    supplier text,
    barcode text,
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Inventory Transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    inventory_item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    work_order_id uuid REFERENCES work_orders(id) ON DELETE SET NULL,
    transaction_type text NOT NULL CHECK (transaction_type IN ('IN', 'OUT', 'ADJUSTMENT')),
    quantity integer NOT NULL,
    unit_cost numeric(10,2),
    reference_number text,
    notes text,
    created_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- SCHEDULING SYSTEM
-- =====================================================

-- Schedule Events
CREATE TABLE IF NOT EXISTS schedule_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE,
    employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    all_day boolean DEFAULT false,
    location text,
    color text DEFAULT '#3B82F6',
    created_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- VENDOR & PURCHASE ORDER SYSTEM
-- =====================================================

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    contact_name text,
    email text,
    phone text,
    address text,
    city text,
    state text,
    zip_code text,
    tax_id text,
    payment_terms text,
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    po_number text UNIQUE NOT NULL,
    status text NOT NULL DEFAULT 'DRAFT',
    order_date date NOT NULL DEFAULT CURRENT_DATE,
    expected_date date,
    total_amount numeric(12,2) DEFAULT 0,
    notes text,
    created_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Purchase Order Items
CREATE TABLE IF NOT EXISTS po_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    inventory_item_id uuid REFERENCES inventory_items(id) ON DELETE SET NULL,
    description text NOT NULL,
    quantity integer NOT NULL,
    unit_cost numeric(10,2) NOT NULL,
    total_cost numeric(12,2) NOT NULL,
    received_quantity integer DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- MARKETPLACE SYSTEM
-- =====================================================

-- Marketplace Requests (Customer Service Requests)
CREATE TABLE IF NOT EXISTS marketplace_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text NOT NULL,
    service_category text,
    location text,
    pricing_preference pricing_preference_enum DEFAULT 'TIME_AND_MATERIALS',
    budget numeric(12,2),
    urgency text DEFAULT 'NORMAL',
    status marketplace_status_enum NOT NULL DEFAULT 'OPEN',
    expires_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Marketplace Responses (Contractor Quotes)
CREATE TABLE IF NOT EXISTS marketplace_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id uuid NOT NULL REFERENCES marketplace_requests(id) ON DELETE CASCADE,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    quoted_price numeric(12,2),
    estimated_duration text,
    message text,
    status text NOT NULL DEFAULT 'PENDING',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Request Tags (Service Categories)
CREATE TABLE IF NOT EXISTS request_tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id uuid NOT NULL REFERENCES marketplace_requests(id) ON DELETE CASCADE,
    tag text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- COMMUNICATION & MESSAGING
-- =====================================================

-- Messages (Internal Communication)
CREATE TABLE IF NOT EXISTS messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
    sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id uuid REFERENCES users(id) ON DELETE SET NULL,
    subject text,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    message_type text DEFAULT 'INTERNAL',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Work Order Messages (Job-Specific Communication)
CREATE TABLE IF NOT EXISTS work_order_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message text NOT NULL,
    is_internal boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type notification_type_enum NOT NULL DEFAULT 'INFO',
    is_read boolean DEFAULT false,
    action_url text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- SETTINGS & CONFIGURATION
-- =====================================================

-- Company Settings (Business Configuration)
CREATE TABLE IF NOT EXISTS company_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    quote_prefix text DEFAULT 'Q',
    job_prefix text DEFAULT 'J',
    invoice_prefix text DEFAULT 'INV',
    default_tax_rate numeric(5,4) DEFAULT 0.0875,
    labor_rate numeric(10,2) DEFAULT 75.00,
    overtime_multiplier numeric(3,2) DEFAULT 1.5,
    parts_markup numeric(5,2) DEFAULT 25.00,
    business_hours jsonb,
    timezone text DEFAULT 'America/New_York',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Business Settings (Legacy Compatibility)
CREATE TABLE IF NOT EXISTS business_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    setting_key text NOT NULL,
    setting_value text,
    setting_type text DEFAULT 'string',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(company_id, setting_key)
);

-- Integration Settings
CREATE TABLE IF NOT EXISTS integration_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    integration_name text NOT NULL,
    is_enabled boolean DEFAULT false,
    configuration jsonb,
    api_key_encrypted text,
    last_sync timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(company_id, integration_name)
);

-- =====================================================
-- DOCUMENT MANAGEMENT
-- =====================================================

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
    name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    mime_type text,
    category text,
    uploaded_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Attachments (Generic File Storage)
CREATE TABLE IF NOT EXISTS attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    mime_type text,
    uploaded_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Job Photos
CREATE TABLE IF NOT EXISTS job_photos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    file_name text NOT NULL,
    file_path text NOT NULL,
    caption text,
    taken_at timestamptz DEFAULT now(),
    uploaded_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Document Templates
CREATE TABLE IF NOT EXISTS document_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    template_type text NOT NULL,
    content text NOT NULL,
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- AUDIT & TRACKING
-- =====================================================

-- Work Order Audit Log
CREATE TABLE IF NOT EXISTS work_order_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    action text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Quote Analytics
CREATE TABLE IF NOT EXISTS quote_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    viewed_at timestamptz,
    accepted_at timestamptz,
    rejected_at timestamptz,
    converted_at timestamptz,
    customer_ip inet,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Quote Follow-ups
CREATE TABLE IF NOT EXISTS quote_follow_ups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    follow_up_date date NOT NULL,
    notes text,
    completed boolean DEFAULT false,
    completed_at timestamptz,
    created_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Quote Approval Workflows
CREATE TABLE IF NOT EXISTS quote_approval_workflows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    approver_id uuid NOT NULL REFERENCES users(id),
    status text NOT NULL DEFAULT 'PENDING',
    approved_at timestamptz,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- VIEWS (Industry Standard)
-- =====================================================

-- Jobs with Payment Status (Commonly Used View)
CREATE OR REPLACE VIEW jobs_with_payment_status AS
SELECT
    wo.*,
    i.status as invoice_status,
    COALESCE(SUM(p.amount), 0) as total_paid
FROM work_orders wo
LEFT JOIN invoices i ON i.work_order_id = wo.id
LEFT JOIN payments p ON p.invoice_id = i.id AND p.status = 'COMPLETED'
WHERE wo.status IN ('COMPLETED', 'INVOICED')
GROUP BY wo.id, i.status;

-- Work Orders View (with Customer Info)
CREATE OR REPLACE VIEW work_orders_v AS
SELECT
    wo.*,
    c.name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id;

-- Quotes View (Quote-specific filtering)
CREATE OR REPLACE VIEW quotes AS
SELECT *
FROM work_orders
WHERE status IN ('QUOTE', 'SENT', 'ACCEPTED', 'REJECTED');

-- =====================================================
-- INDEXES (Performance Optimization)
-- =====================================================

-- Core business indexes
CREATE INDEX IF NOT EXISTS idx_work_orders_company_id ON work_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_customer_id ON work_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_at ON work_orders(created_at);

CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_work_order_id ON invoices(work_order_id);

CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

CREATE INDEX IF NOT EXISTS idx_schedule_events_company_id ON schedule_events(company_id);
CREATE INDEX IF NOT EXISTS idx_schedule_events_start_time ON schedule_events(start_time);

-- =====================================================
-- TRIGGERS (Auto-update timestamps)
-- =====================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_work_orders_updated_at BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_work_order_line_items_updated_at BEFORE UPDATE ON work_order_line_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- PERMISSIONS (Full Access for Beta)
-- =====================================================

-- Grant all permissions to all roles for beta testing
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('GRANT ALL ON %I TO postgres, anon, authenticated, service_role', table_name);
    END LOOP;
END $$;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the complete schema:
-- SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'work_order_status_enum');
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;
