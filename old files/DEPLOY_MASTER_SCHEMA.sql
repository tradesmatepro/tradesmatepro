-- =========================================
-- TRADEMATE PRO - MASTER SCHEMA DEPLOYMENT
-- Complete Production Database Schema
-- =========================================

-- This script deploys the complete TradeMate Pro database schema
-- Order: Enums → Tables → Constraints → Indexes → Functions → Views → Seeds
-- Safe for fresh Supabase project deployment

BEGIN;

-- =========================================
-- PHASE 1: ENUMS (Business Logic Types)
-- =========================================

-- Work Order Management Enums
CREATE TYPE work_order_status_enum AS ENUM (
    'draft', 'quote', 'approved', 'scheduled', 'parts_ordered', 
    'on_hold', 'in_progress', 'requires_approval', 'rework_needed', 
    'completed', 'invoiced', 'cancelled'
);

CREATE TYPE work_order_priority_enum AS ENUM (
    'low', 'normal', 'high', 'urgent', 'emergency', 'seasonal_peak'
);

CREATE TYPE work_order_line_item_type_enum AS ENUM (
    'labor', 'material', 'equipment', 'service', 'permit', 
    'disposal', 'travel', 'fee', 'discount', 'tax'
);

-- Finance Enums
CREATE TYPE invoice_status_enum AS ENUM (
    'draft', 'sent', 'viewed', 'partially_paid', 'paid', 
    'overdue', 'disputed', 'written_off', 'cancelled'
);

CREATE TYPE payment_status_enum AS ENUM (
    'pending', 'processing', 'completed', 'partially_completed', 
    'failed', 'cancelled', 'refunded', 'disputed'
);

CREATE TYPE expense_type_enum AS ENUM (
    'labor', 'material', 'equipment', 'subcontractor', 'permit', 
    'travel', 'fuel', 'insurance', 'overhead', 'training', 'other'
);

CREATE TYPE tax_type_enum AS ENUM (
    'vat', 'sales_tax', 'gst', 'hst', 'pst', 'excise', 'import_duty', 'none'
);

-- Team Management Enums
CREATE TYPE employee_status_enum AS ENUM (
    'probation', 'active', 'inactive', 'suspended', 
    'terminated', 'on_leave', 'retired'
);

CREATE TYPE user_role_enum AS ENUM (
    'owner', 'admin', 'manager', 'dispatcher', 'supervisor',
    'lead_technician', 'technician', 'apprentice', 'helper',
    'accountant', 'sales_rep', 'customer_service', 
    'customer_portal', 'vendor_portal'
);

CREATE TYPE timesheet_status_enum AS ENUM (
    'draft', 'submitted', 'under_review', 'approved', 'rejected', 'requires_correction', 'paid'
);

CREATE TYPE payroll_run_status_enum AS ENUM (
    'draft', 'calculating', 'pending_approval', 'approved', 'processing', 'completed', 'failed', 'cancelled'
);

-- Operations Enums
CREATE TYPE inventory_movement_type_enum AS ENUM (
    'purchase', 'sale', 'transfer', 'adjustment', 'return', 
    'waste', 'theft', 'damage', 'warranty_replacement'
);

CREATE TYPE vendor_type_enum AS ENUM (
    'supplier', 'subcontractor', 'manufacturer', 'distributor', 'service_provider', 'rental_company'
);

CREATE TYPE tool_status_enum AS ENUM (
    'available', 'assigned', 'in_use', 'maintenance', 
    'repair', 'calibration', 'lost', 'stolen', 'retired'
);

-- System Enums
CREATE TYPE notification_type_enum AS ENUM (
    'email', 'sms', 'in_app', 'push', 'webhook', 'slack', 'teams'
);

CREATE TYPE notification_status_enum AS ENUM (
    'pending', 'sent', 'delivered', 'read', 'clicked', 'failed', 'bounced', 'unsubscribed'
);

CREATE TYPE audit_action_enum AS ENUM (
    'insert', 'update', 'delete', 'login', 'logout', 'permission_change', 'export', 'import', 'backup', 'restore'
);

-- Phase 2 Enterprise Enums
CREATE TYPE job_template_type_enum AS ENUM (
    'installation', 'repair', 'maintenance', 'inspection', 
    'diagnostic', 'emergency', 'warranty', 'upgrade'
);

CREATE TYPE rate_card_type_enum AS ENUM (
    'hourly', 'flat_fee', 'per_unit', 'tiered', 
    'time_and_materials', 'value_based', 'subscription'
);

CREATE TYPE sla_priority_enum AS ENUM (
    'critical', 'high', 'medium', 'low', 'scheduled'
);

CREATE TYPE certification_status_enum AS ENUM (
    'active', 'expired', 'pending_renewal', 'suspended', 'revoked'
);

CREATE TYPE performance_rating_enum AS ENUM (
    'excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'
);

-- Phase 3 Marketplace Enums
CREATE TYPE marketplace_request_status_enum AS ENUM (
    'draft', 'posted', 'bidding_open', 'bidding_closed', 
    'contractor_selected', 'work_in_progress', 'completed', 
    'cancelled', 'disputed'
);

CREATE TYPE bid_status_enum AS ENUM (
    'draft', 'submitted', 'under_review', 'accepted', 
    'rejected', 'withdrawn', 'expired'
);

CREATE TYPE escrow_status_enum AS ENUM (
    'pending', 'funded', 'held', 'released_to_contractor', 
    'refunded_to_customer', 'disputed'
);

-- Phase 4 AI/IoT Enums
CREATE TYPE optimization_type_enum AS ENUM (
    'distance', 'time', 'cost', 'customer_priority', 'ai_hybrid'
);

CREATE TYPE sensor_status_enum AS ENUM (
    'active', 'inactive', 'maintenance', 'error', 'calibrating'
);

CREATE TYPE alert_severity_enum AS ENUM (
    'info', 'warning', 'error', 'critical', 'emergency'
);

-- =========================================
-- PHASE 2: CORE TABLES (Foundation)
-- =========================================

-- Users and Authentication (works with Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID, -- Will reference companies(id) after companies table is created
    role user_role_enum NOT NULL DEFAULT 'technician',
    status employee_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, auth_user_id)
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT CHECK (phone ~ '^\+[1-9]\d{1,14}$'),
    avatar_url TEXT CHECK (avatar_url ~ '^https?://'),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    level INTEGER NOT NULL CHECK (level >= 0 AND level <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company Management
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_number TEXT UNIQUE NOT NULL CHECK (company_number ~ '^C-[0-9]{6}$'),
    name TEXT NOT NULL CHECK (LENGTH(name) >= 2),
    legal_name TEXT,
    tax_id TEXT CHECK (tax_id ~ '^[0-9]{2}-[0-9]{7}$'),
    phone TEXT CHECK (phone ~ '^\+[1-9]\d{1,14}$'),
    email TEXT CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
    website TEXT CHECK (website ~ '^https?://'),
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state_province TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'US',
    time_zone TEXT DEFAULT 'UTC',
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint to users table after companies table exists
ALTER TABLE users ADD CONSTRAINT fk_users_company
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    business_hours JSONB DEFAULT '{"monday": {"open": "08:00", "close": "17:00"}}',
    default_tax_rate NUMERIC(5,4) DEFAULT 0.0000,
    invoice_terms TEXT DEFAULT 'NET30',
    auto_invoice BOOLEAN DEFAULT FALSE,
    require_signatures BOOLEAN DEFAULT TRUE,
    allow_online_payments BOOLEAN DEFAULT TRUE,
    emergency_rate_multiplier NUMERIC(3,2) DEFAULT 1.50,
    travel_charge_per_mile NUMERIC(5,2) DEFAULT 0.65,
    minimum_travel_charge NUMERIC(8,2) DEFAULT 25.00,
    cancellation_fee NUMERIC(8,2) DEFAULT 50.00,
    transparency_mode BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE billing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    price_monthly NUMERIC(8,2) NOT NULL,
    price_yearly NUMERIC(8,2),
    features JSONB DEFAULT '{}',
    max_users INTEGER DEFAULT 1,
    max_work_orders INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    billing_plan_id UUID REFERENCES billing_plans(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'suspended')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Management
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    customer_number TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'residential' CHECK (type IN ('residential', 'commercial', 'industrial')),
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    email TEXT CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
    phone TEXT CHECK (phone ~ '^\+[1-9]\d{1,14}$'),
    mobile_phone TEXT CHECK (mobile_phone ~ '^\+[1-9]\d{1,14}$'),
    preferred_contact TEXT DEFAULT 'phone' CHECK (preferred_contact IN ('phone', 'email', 'text')),
    source TEXT,
    notes TEXT,
    credit_limit NUMERIC(12,2) DEFAULT 0.00,
    payment_terms TEXT DEFAULT 'NET30',
    tax_exempt BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_customer_name CHECK (
        (first_name IS NOT NULL AND last_name IS NOT NULL) OR
        company_name IS NOT NULL
    )
);

CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'service' CHECK (type IN ('billing', 'service', 'mailing')),
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state_province TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'US',
    is_primary BOOLEAN DEFAULT FALSE,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    access_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customer_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    title TEXT,
    email TEXT CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
    phone TEXT CHECK (phone ~ '^\+[1-9]\d{1,14}$'),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customer_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6b7280',
    priority INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customer_tag_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES customer_tags(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, tag_id)
);

CREATE TABLE customer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'service', 'billing', 'complaint')),
    subject TEXT,
    content TEXT NOT NULL,
    is_important BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Categories and Types
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    color TEXT DEFAULT '#6b7280',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, name)
);

CREATE TABLE service_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC(10,2) DEFAULT 0.00,
    estimated_duration TEXT DEFAULT '2 hours',
    requires_permit BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work Order Management (Unified Pipeline)
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    work_order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    customer_address_id UUID REFERENCES customer_addresses(id),
    service_category_id UUID REFERENCES service_categories(id),
    service_type_id UUID REFERENCES service_types(id),
    status work_order_status_enum DEFAULT 'draft',
    priority work_order_priority_enum DEFAULT 'normal',
    title TEXT NOT NULL,
    description TEXT,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    subtotal NUMERIC(12,2) DEFAULT 0.00,
    tax_amount NUMERIC(12,2) DEFAULT 0.00,
    total_amount NUMERIC(12,2) DEFAULT 0.00,
    notes TEXT,
    internal_notes TEXT,
    requires_signature BOOLEAN DEFAULT TRUE,
    customer_signature_url TEXT,
    technician_signature_url TEXT,
    completion_photos TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE work_order_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    line_type work_order_line_item_type_enum NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10,3) DEFAULT 1.000,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    tax_rate NUMERIC(5,4) DEFAULT 0.0000,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE work_order_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE work_order_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'internal', 'customer', 'technical')),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule Management
CREATE TABLE schedule_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    location TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_schedule_times CHECK (end_time > start_time)
);

-- Document Management
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    document_type TEXT NOT NULL CHECK (document_type IN ('quote', 'invoice', 'receipt', 'contract', 'permit', 'warranty', 'photo', 'other')),
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Management
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id),
    customer_id UUID REFERENCES customers(id) NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    status invoice_status_enum DEFAULT 'draft',
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal NUMERIC(12,2) DEFAULT 0.00,
    tax_amount NUMERIC(12,2) DEFAULT 0.00,
    total_amount NUMERIC(12,2) DEFAULT 0.00,
    amount_paid NUMERIC(12,2) DEFAULT 0.00,
    balance_due NUMERIC(12,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
    terms TEXT DEFAULT 'NET30',
    notes TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10,3) DEFAULT 1.000,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    tax_rate NUMERIC(5,4) DEFAULT 0.0000,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id),
    customer_id UUID REFERENCES customers(id) NOT NULL,
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'online', 'other')),
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    status payment_status_enum DEFAULT 'pending',
    reference_number TEXT,
    transaction_id TEXT,
    payment_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id),
    employee_id UUID REFERENCES users(id),
    expense_type expense_type_enum NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    expense_date DATE DEFAULT CURRENT_DATE,
    receipt_url TEXT,
    is_billable BOOLEAN DEFAULT FALSE,
    is_reimbursable BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE taxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tax_type tax_type_enum DEFAULT 'sales_tax',
    rate NUMERIC(5,4) NOT NULL CHECK (rate >= 0 AND rate <= 1),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- Team Management
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    employee_number TEXT UNIQUE NOT NULL,
    hire_date DATE DEFAULT CURRENT_DATE,
    termination_date DATE,
    job_title TEXT,
    department TEXT,
    hourly_rate NUMERIC(8,2) DEFAULT 0.00,
    overtime_rate NUMERIC(8,2),
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    certifications TEXT[],
    skills TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_termination_after_hire CHECK (termination_date IS NULL OR termination_date >= hire_date)
);

CREATE TABLE employee_timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id),
    date DATE NOT NULL,
    clock_in TIMESTAMPTZ,
    clock_out TIMESTAMPTZ,
    break_duration INTEGER DEFAULT 0, -- minutes
    regular_hours NUMERIC(5,2) DEFAULT 0.00,
    overtime_hours NUMERIC(5,2) DEFAULT 0.00,
    status timesheet_status_enum DEFAULT 'draft',
    notes TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_clock_times CHECK (clock_out IS NULL OR clock_out > clock_in)
);

CREATE TABLE payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    status payroll_run_status_enum DEFAULT 'draft',
    total_gross NUMERIC(12,2) DEFAULT 0.00,
    total_deductions NUMERIC(12,2) DEFAULT 0.00,
    total_net NUMERIC(12,2) DEFAULT 0.00,
    processed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_payroll_period CHECK (pay_period_end >= pay_period_start)
);

CREATE TABLE payroll_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_run_id UUID REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    regular_hours NUMERIC(5,2) DEFAULT 0.00,
    overtime_hours NUMERIC(5,2) DEFAULT 0.00,
    regular_pay NUMERIC(10,2) DEFAULT 0.00,
    overtime_pay NUMERIC(10,2) DEFAULT 0.00,
    gross_pay NUMERIC(10,2) DEFAULT 0.00,
    deductions NUMERIC(10,2) DEFAULT 0.00,
    net_pay NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Management
CREATE TABLE inventory_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state_province TEXT,
    postal_code TEXT,
    is_mobile BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, name)
);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    unit_of_measure TEXT DEFAULT 'each',
    cost_price NUMERIC(10,2) DEFAULT 0.00,
    sell_price NUMERIC(10,2) DEFAULT 0.00,
    reorder_point INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,
    barcode TEXT,
    manufacturer TEXT,
    model_number TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    location_id UUID REFERENCES inventory_locations(id) ON DELETE CASCADE,
    quantity_on_hand INTEGER DEFAULT 0,
    quantity_allocated INTEGER DEFAULT 0,
    quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_allocated) STORED,
    last_counted_at TIMESTAMPTZ,
    last_counted_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, location_id)
);

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    location_id UUID REFERENCES inventory_locations(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id),
    movement_type inventory_movement_type_enum NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost NUMERIC(10,2) DEFAULT 0.00,
    reference_number TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Management
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    vendor_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    vendor_type vendor_type_enum DEFAULT 'supplier',
    contact_name TEXT,
    email TEXT CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
    phone TEXT CHECK (phone ~ '^\+[1-9]\d{1,14}$'),
    website TEXT CHECK (website ~ '^https?://'),
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state_province TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'US',
    tax_id TEXT,
    payment_terms TEXT DEFAULT 'NET30',
    credit_limit NUMERIC(12,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) NOT NULL,
    work_order_id UUID REFERENCES work_orders(id),
    po_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'acknowledged', 'partially_received', 'received', 'cancelled')),
    order_date DATE DEFAULT CURRENT_DATE,
    expected_date DATE,
    subtotal NUMERIC(12,2) DEFAULT 0.00,
    tax_amount NUMERIC(12,2) DEFAULT 0.00,
    shipping_amount NUMERIC(12,2) DEFAULT 0.00,
    total_amount NUMERIC(12,2) DEFAULT 0.00,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_order_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory_items(id),
    description TEXT NOT NULL,
    quantity NUMERIC(10,3) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    quantity_received NUMERIC(10,3) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tools and Equipment
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    tool_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    purchase_date DATE,
    purchase_price NUMERIC(10,2) DEFAULT 0.00,
    current_value NUMERIC(10,2) DEFAULT 0.00,
    status tool_status_enum DEFAULT 'available',
    assigned_to UUID REFERENCES users(id),
    location TEXT,
    maintenance_schedule TEXT,
    last_maintenance DATE,
    next_maintenance DATE,
    warranty_expiry DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id),
    customer_id UUID REFERENCES customers(id),
    sender_id UUID REFERENCES users(id),
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('customer', 'employee', 'vendor')),
    recipient_id UUID,
    subject TEXT,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'email' CHECK (message_type IN ('email', 'sms', 'in_app', 'system')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'delivered', 'read', 'failed')),
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Tables
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type_enum DEFAULT 'in_app',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    status notification_status_enum DEFAULT 'pending',
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    table_name TEXT NOT NULL,
    record_id UUID,
    action audit_action_enum NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- PHASE 3: INDEXES (Performance Optimization)
-- =========================================

-- Core table indexes
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_customers_customer_number ON customers(customer_number);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);

CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX idx_customer_addresses_type ON customer_addresses(type);

CREATE INDEX idx_work_orders_company_id ON work_orders(company_id);
CREATE INDEX idx_work_orders_customer_id ON work_orders(customer_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_assigned_to ON work_orders(assigned_to);
CREATE INDEX idx_work_orders_scheduled_start ON work_orders(scheduled_start);
CREATE INDEX idx_work_orders_work_order_number ON work_orders(work_order_number);

CREATE INDEX idx_work_order_line_items_work_order_id ON work_order_line_items(work_order_id);

CREATE INDEX idx_schedule_events_company_id ON schedule_events(company_id);
CREATE INDEX idx_schedule_events_work_order_id ON schedule_events(work_order_id);
CREATE INDEX idx_schedule_events_user_id ON schedule_events(user_id);
CREATE INDEX idx_schedule_events_start_time ON schedule_events(start_time);

CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

CREATE INDEX idx_payments_company_id ON payments(company_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);

CREATE INDEX idx_expenses_company_id ON expenses(company_id);
CREATE INDEX idx_expenses_work_order_id ON expenses(work_order_id);
CREATE INDEX idx_expenses_employee_id ON expenses(employee_id);

CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_user_id ON employees(user_id);

CREATE INDEX idx_inventory_items_company_id ON inventory_items(company_id);
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);

CREATE INDEX idx_inventory_stock_item_id ON inventory_stock(item_id);
CREATE INDEX idx_inventory_stock_location_id ON inventory_stock(location_id);

CREATE INDEX idx_vendors_company_id ON vendors(company_id);
CREATE INDEX idx_purchase_orders_company_id ON purchase_orders(company_id);
CREATE INDEX idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);

CREATE INDEX idx_tools_company_id ON tools(company_id);
CREATE INDEX idx_tools_assigned_to ON tools(assigned_to);
CREATE INDEX idx_tools_status ON tools(status);

CREATE INDEX idx_messages_company_id ON messages(company_id);
CREATE INDEX idx_messages_work_order_id ON messages(work_order_id);
CREATE INDEX idx_messages_customer_id ON messages(customer_id);

CREATE INDEX idx_notifications_company_id ON notifications(company_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =========================================
-- PHASE 4: FUNCTIONS & TRIGGERS
-- =========================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_events_updated_at BEFORE UPDATE ON schedule_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_timesheets_updated_at BEFORE UPDATE ON employee_timesheets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_runs_updated_at BEFORE UPDATE ON payroll_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_stock_updated_at BEFORE UPDATE ON inventory_stock
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Work order totals calculation function
CREATE OR REPLACE FUNCTION calculate_work_order_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE work_orders
    SET
        subtotal = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM work_order_line_items
            WHERE work_order_id = COALESCE(NEW.work_order_id, OLD.work_order_id)
        ),
        tax_amount = (
            SELECT COALESCE(SUM(total_price * tax_rate), 0)
            FROM work_order_line_items
            WHERE work_order_id = COALESCE(NEW.work_order_id, OLD.work_order_id)
        )
    WHERE id = COALESCE(NEW.work_order_id, OLD.work_order_id);

    -- Update total_amount
    UPDATE work_orders
    SET total_amount = subtotal + tax_amount
    WHERE id = COALESCE(NEW.work_order_id, OLD.work_order_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_calculate_work_order_totals
    AFTER INSERT OR UPDATE OR DELETE ON work_order_line_items
    FOR EACH ROW EXECUTE FUNCTION calculate_work_order_totals();

-- Invoice totals calculation function
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE invoices
    SET
        subtotal = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM invoice_line_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        ),
        tax_amount = (
            SELECT COALESCE(SUM(total_price * tax_rate), 0)
            FROM invoice_line_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        )
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    -- Update total_amount
    UPDATE invoices
    SET total_amount = subtotal + tax_amount
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_calculate_invoice_totals
    AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items
    FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

-- Update invoice amount_paid when payments are made
CREATE OR REPLACE FUNCTION update_invoice_amount_paid()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE invoices
    SET amount_paid = (
        SELECT COALESCE(SUM(amount), 0)
        FROM payments
        WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        AND status = 'completed'
    )
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_invoice_amount_paid
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_invoice_amount_paid();

-- =========================================
-- PHASE 5: VIEWS (Business Intelligence)
-- =========================================

-- Work Orders Summary View
CREATE VIEW work_orders_summary AS
SELECT
    wo.id,
    wo.work_order_number,
    wo.status,
    wo.priority,
    wo.title,
    wo.scheduled_start,
    wo.scheduled_end,
    wo.total_amount,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.company_name,
    ca.address_line1 || ', ' || ca.city || ', ' || ca.state_province AS service_address,
    sc.name AS service_category,
    st.name AS service_type,
    p.first_name || ' ' || p.last_name AS assigned_technician,
    wo.created_at,
    wo.updated_at
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
LEFT JOIN customer_addresses ca ON wo.customer_address_id = ca.id
LEFT JOIN service_categories sc ON wo.service_category_id = sc.id
LEFT JOIN service_types st ON wo.service_type_id = st.id
LEFT JOIN users u ON wo.assigned_to = u.id
LEFT JOIN profiles p ON u.id = p.user_id;

-- Customer Summary View
CREATE VIEW customers_summary AS
SELECT
    c.id,
    c.customer_number,
    c.type,
    CASE
        WHEN c.company_name IS NOT NULL THEN c.company_name
        ELSE c.first_name || ' ' || c.last_name
    END AS display_name,
    c.email,
    c.phone,
    ca.address_line1 || ', ' || ca.city || ', ' || ca.state_province AS primary_address,
    COUNT(wo.id) AS total_work_orders,
    COALESCE(SUM(wo.total_amount), 0) AS total_revenue,
    MAX(wo.created_at) AS last_service_date,
    c.created_at,
    c.is_active
FROM customers c
LEFT JOIN customer_addresses ca ON c.id = ca.customer_id AND ca.is_primary = true
LEFT JOIN work_orders wo ON c.id = wo.customer_id
GROUP BY c.id, ca.address_line1, ca.city, ca.state_province;

-- Invoice Summary View
CREATE VIEW invoices_summary AS
SELECT
    i.id,
    i.invoice_number,
    i.status,
    i.issue_date,
    i.due_date,
    i.total_amount,
    i.amount_paid,
    i.balance_due,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.company_name,
    wo.work_order_number,
    CASE
        WHEN i.due_date < CURRENT_DATE AND i.balance_due > 0 THEN 'overdue'
        WHEN i.balance_due = 0 THEN 'paid'
        ELSE 'current'
    END AS payment_status,
    i.created_at
FROM invoices i
LEFT JOIN customers c ON i.customer_id = c.id
LEFT JOIN work_orders wo ON i.work_order_id = wo.id;

-- Inventory Summary View
CREATE VIEW inventory_summary AS
SELECT
    ii.id,
    ii.sku,
    ii.name,
    ii.category,
    ii.cost_price,
    ii.sell_price,
    ii.reorder_point,
    SUM(ist.quantity_on_hand) AS total_on_hand,
    SUM(ist.quantity_allocated) AS total_allocated,
    SUM(ist.quantity_available) AS total_available,
    CASE
        WHEN SUM(ist.quantity_available) <= ii.reorder_point THEN 'reorder'
        WHEN SUM(ist.quantity_available) = 0 THEN 'out_of_stock'
        ELSE 'in_stock'
    END AS stock_status,
    ii.is_active
FROM inventory_items ii
LEFT JOIN inventory_stock ist ON ii.id = ist.item_id
GROUP BY ii.id, ii.sku, ii.name, ii.category, ii.cost_price, ii.sell_price, ii.reorder_point, ii.is_active;

-- Employee Performance View
CREATE VIEW employee_performance AS
SELECT
    e.id,
    e.employee_number,
    p.first_name || ' ' || p.last_name AS employee_name,
    e.job_title,
    e.department,
    COUNT(wo.id) AS total_work_orders,
    AVG(EXTRACT(EPOCH FROM (wo.actual_end - wo.actual_start))/3600) AS avg_job_hours,
    COALESCE(SUM(wo.total_amount), 0) AS total_revenue,
    COUNT(CASE WHEN wo.status = 'completed' THEN 1 END) AS completed_jobs,
    ROUND(
        COUNT(CASE WHEN wo.status = 'completed' THEN 1 END)::NUMERIC /
        NULLIF(COUNT(wo.id), 0) * 100, 2
    ) AS completion_rate,
    e.hire_date,
    u.status
FROM employees e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN work_orders wo ON u.id = wo.assigned_to
GROUP BY e.id, e.employee_number, p.first_name, p.last_name, e.job_title, e.department, e.hire_date, u.status;

-- =========================================
-- PHASE 6: SEED DATA (Essential Defaults)
-- =========================================

-- Default billing plans
INSERT INTO billing_plans (name, description, price_monthly, price_yearly, features, max_users) VALUES
('Starter', 'Perfect for small contractors', 49.00, 490.00, '{"quotes": true, "scheduling": true, "invoicing": true, "basic_inventory": true}', 3),
('Professional', 'For growing businesses', 99.00, 990.00, '{"everything_in_starter": true, "advanced_inventory": true, "payroll": true, "reporting": true}', 10),
('Enterprise', 'For large operations', 199.00, 1990.00, '{"everything_in_professional": true, "marketplace": true, "api_access": true, "custom_integrations": true}', 50);

-- Default permissions
INSERT INTO permissions (name, description, level) VALUES
('view_dashboard', 'View company dashboard', 10),
('manage_customers', 'Create and edit customers', 30),
('manage_work_orders', 'Create and edit work orders', 40),
('manage_scheduling', 'Schedule and assign work', 50),
('manage_invoicing', 'Create and send invoices', 60),
('manage_inventory', 'Manage inventory items and stock', 70),
('manage_employees', 'Manage employee records', 80),
('manage_company', 'Manage company settings', 90),
('super_admin', 'Full system access', 100);

-- Default customer tags
INSERT INTO customer_tags (name, description, color, priority) VALUES
('VIP', 'Very Important Customer', '#f59e0b', 90),
('High Value', 'High revenue customer', '#10b981', 80),
('Repeat Customer', 'Regular repeat business', '#3b82f6', 70),
('New Customer', 'First time customer', '#8b5cf6', 60),
('Commercial', 'Commercial account', '#ef4444', 50),
('Residential', 'Residential customer', '#6b7280', 40),
('Emergency Only', 'Emergency services only', '#f97316', 30);

-- Default service categories (common trades)
INSERT INTO service_categories (company_id, name, description, color, sort_order) VALUES
(NULL, 'Plumbing', 'Plumbing services and repairs', '#3b82f6', 1),
(NULL, 'Electrical', 'Electrical installation and repair', '#f59e0b', 2),
(NULL, 'HVAC', 'Heating, ventilation, and air conditioning', '#10b981', 3),
(NULL, 'General Contracting', 'General construction and renovation', '#8b5cf6', 4),
(NULL, 'Landscaping', 'Lawn care and landscaping services', '#22c55e', 5),
(NULL, 'Cleaning', 'Residential and commercial cleaning', '#06b6d4', 6),
(NULL, 'Roofing', 'Roof installation and repair', '#dc2626', 7),
(NULL, 'Flooring', 'Flooring installation and refinishing', '#92400e', 8);

-- Default taxes
INSERT INTO taxes (company_id, name, tax_type, rate, description) VALUES
(NULL, 'Sales Tax', 'sales_tax', 0.0875, 'Standard sales tax'),
(NULL, 'GST', 'gst', 0.05, 'Goods and Services Tax'),
(NULL, 'HST', 'hst', 0.13, 'Harmonized Sales Tax'),
(NULL, 'VAT', 'vat', 0.20, 'Value Added Tax');

COMMIT;

-- =========================================
-- DEPLOYMENT COMPLETE
-- =========================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🚀 TradeMate Pro Master Schema Deployment Complete!';
    RAISE NOTICE '✅ Enums: Created all business logic types';
    RAISE NOTICE '✅ Tables: Created ~30 core tables with proper relationships';
    RAISE NOTICE '✅ Indexes: Added performance optimization indexes';
    RAISE NOTICE '✅ Functions: Created calculation and trigger functions';
    RAISE NOTICE '✅ Triggers: Added automated business logic triggers';
    RAISE NOTICE '✅ Views: Created business intelligence views';
    RAISE NOTICE '✅ Seeds: Inserted essential default data';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Ready for application deployment!';
    RAISE NOTICE '📊 Database contains industry-standard FSM schema';
    RAISE NOTICE '🔧 All business logic automated at database level';
END $$;
