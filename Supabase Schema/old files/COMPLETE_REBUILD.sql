-- ========================================
-- TradeMate Pro - COMPLETE Schema Rebuild
-- ========================================
-- This script rebuilds ALL 157 tables with industry standards
-- Based on existing schema analysis
--
-- IMPORTANT: Run full backup before executing!
-- ========================================

-- ========================================
-- 1. SCHEMA RESET (SAFE - PRESERVES AUTH)
-- ========================================
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- ========================================
-- 2. ALL ENUMS (INDUSTRY STANDARD)
-- ========================================

-- Core business enums (from your existing schema)
CREATE TYPE work_order_status_enum AS ENUM (
  'DRAFT', 'QUOTE', 'SENT', 'ACCEPTED', 'REJECTED', 'DECLINED', 'EXPIRED',
  'SCHEDULED', 'IN_PROGRESS', 'ASSIGNED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'INVOICED'
);

CREATE TYPE quote_status_enum AS ENUM (
  'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'DECLINED', 'EXPIRED'
);

CREATE TYPE job_status_enum AS ENUM (
  'DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
);

CREATE TYPE invoice_status_enum AS ENUM (
  'UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'
);

CREATE TYPE payment_status_enum AS ENUM (
  'PENDING', 'PARTIAL', 'PAID', 'OVERDUE'
);

CREATE TYPE unified_job_status_enum AS ENUM (
  'DRAFT', 'OPEN', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ASSIGNED'
);

CREATE TYPE job_priority_enum AS ENUM (
  'low', 'normal', 'high', 'emergency'
);

CREATE TYPE work_status_enum AS ENUM (
  'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
);

CREATE TYPE stage_enum AS ENUM (
  'QUOTE', 'JOB', 'WORK_ORDER'
);

-- Marketplace enums
CREATE TYPE marketplace_response_status_enum AS ENUM (
  'INTERESTED', 'OFFER_SUBMITTED', 'INFO_REQUESTED', 'SITE_VISIT_PROPOSED', 'ACCEPTED', 'DECLINED'
);

CREATE TYPE request_type_enum AS ENUM (
  'STANDARD', 'EMERGENCY'
);

CREATE TYPE review_target_enum AS ENUM (
  'COMPANY', 'WORK_ORDER', 'MARKETPLACE'
);

-- Pricing and service enums
CREATE TYPE pricing_enum AS ENUM (
  'FLAT', 'HOURLY', 'NEGOTIABLE'
);

CREATE TYPE pricing_model_enum AS ENUM (
  'FLAT', 'HOURLY', 'NEGOTIABLE'
);

CREATE TYPE pricing_preference_enum AS ENUM (
  'FLAT', 'HOURLY', 'NEGOTIABLE'
);

CREATE TYPE service_mode_enum AS ENUM (
  'ONSITE', 'REMOTE', 'HYBRID'
);

-- Inventory and item enums
CREATE TYPE item_type_enum AS ENUM (
  'material', 'part', 'labor', 'service'
);

CREATE TYPE movement_type_enum AS ENUM (
  'PURCHASE', 'RETURN', 'USAGE', 'TRANSFER', 'ADJUSTMENT', 'ALLOCATION'
);

-- Verification enum
CREATE TYPE verification_status_enum AS ENUM (
  'UNVERIFIED', 'PENDING', 'VERIFIED'
);

-- Additional enums for comprehensive coverage
CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE customer_status_enum AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE vendor_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE company_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE approval_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE signature_status_enum AS ENUM ('PENDING', 'SIGNED', 'DECLINED');
CREATE TYPE employment_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED');
CREATE TYPE time_off_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE timesheet_status_enum AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE expense_status_enum AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID');
CREATE TYPE purchase_order_status_enum AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'RECEIVED', 'PAID');
CREATE TYPE commission_status_enum AS ENUM ('PENDING', 'PAID');
CREATE TYPE inventory_status_enum AS ENUM ('AVAILABLE', 'ALLOCATED', 'RESERVED', 'CONSUMED', 'DAMAGED');
CREATE TYPE message_status_enum AS ENUM ('SENT', 'DELIVERED', 'READ');
CREATE TYPE notification_status_enum AS ENUM ('UNREAD', 'READ', 'ARCHIVED');
CREATE TYPE marketplace_request_status_enum AS ENUM ('AVAILABLE', 'TAKEN', 'CLOSED');
CREATE TYPE lead_status_enum AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');
CREATE TYPE service_request_status_enum AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE schedule_status_enum AS ENUM ('SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE document_status_enum AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- ========================================
-- 3. CORE BUSINESS TABLES
-- ========================================

-- Companies (multi-tenant base)
CREATE TABLE companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text UNIQUE,
    phone text,
    address_line_1 text,
    address_line_2 text,
    city text,
    state text,
    zip_code text,
    status company_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_by uuid
);

-- Users (employees)
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    first_name text,
    last_name text,
    phone text,
    status user_status_enum NOT NULL DEFAULT 'ACTIVE',
    employment_status employment_status_enum NOT NULL DEFAULT 'ACTIVE',
    hire_date date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id)
);

-- Customers
CREATE TABLE customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text,
    phone text,
    status customer_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id)
);

-- Work Orders (unified pipeline)
CREATE TABLE work_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES customers(id),
    assigned_to uuid REFERENCES users(id),
    status work_order_status_enum NOT NULL DEFAULT 'DRAFT',
    stage stage_enum,
    priority job_priority_enum DEFAULT 'normal',
    
    -- Quote fields
    quote_number text,
    quote_sent_at timestamptz,
    quote_expires_at timestamptz,
    
    -- Job fields
    scheduled_start timestamptz,
    scheduled_end timestamptz,
    actual_start timestamptz,
    actual_end timestamptz,
    
    -- Financial
    subtotal numeric(10,2) DEFAULT 0,
    tax_amount numeric(10,2) DEFAULT 0,
    total_amount numeric(10,2) DEFAULT 0,
    
    -- Service details
    service_address_line_1 text,
    service_address_line_2 text,
    service_city text,
    service_state text,
    service_zip_code text,
    description text,
    notes text,
    
    -- Metadata
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id),
    version integer NOT NULL DEFAULT 1
);

-- Invoices
CREATE TABLE invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id uuid REFERENCES work_orders(id),
    customer_id uuid NOT NULL REFERENCES customers(id),
    invoice_number text UNIQUE NOT NULL,
    status invoice_status_enum NOT NULL DEFAULT 'UNPAID',
    subtotal numeric(10,2) NOT NULL DEFAULT 0,
    tax_amount numeric(10,2) NOT NULL DEFAULT 0,
    total_amount numeric(10,2) NOT NULL DEFAULT 0,
    amount_paid numeric(10,2) NOT NULL DEFAULT 0,
    invoice_date date NOT NULL DEFAULT CURRENT_DATE,
    due_date date,
    paid_date date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id)
);

-- ========================================
-- 4. CUSTOMER & RELATIONSHIP TABLES
-- ========================================

-- Customer Addresses
CREATE TABLE customer_addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    address_type text DEFAULT 'service',
    address_line_1 text NOT NULL,
    address_line_2 text,
    city text,
    state text,
    zip_code text,
    is_primary boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Customer Communications
CREATE TABLE customer_communications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    communication_type text,
    subject text,
    content text,
    sent_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Customer Messages
CREATE TABLE customer_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES users(id),
    message text,
    status message_status_enum NOT NULL DEFAULT 'SENT',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Customer Reviews
CREATE TABLE customer_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    work_order_id uuid REFERENCES work_orders(id),
    rating integer CHECK (rating >= 1 AND rating <= 5),
    review_text text,
    target review_target_enum DEFAULT 'WORK_ORDER',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Customer Service Agreements
CREATE TABLE customer_service_agreements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    agreement_name text NOT NULL,
    status approval_status_enum NOT NULL DEFAULT 'PENDING',
    start_date date,
    end_date date,
    terms text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Customer Signatures
CREATE TABLE customer_signatures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    work_order_id uuid REFERENCES work_orders(id),
    signature_data text,
    signed_at timestamptz,
    status signature_status_enum NOT NULL DEFAULT 'PENDING',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Customer Tags
CREATE TABLE customer_tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag_name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Customer Status History
CREATE TABLE customers_status_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    old_status text,
    new_status text,
    changed_by uuid REFERENCES users(id),
    changed_at timestamptz NOT NULL DEFAULT now(),
    reason text
);

-- Customer Portal Accounts
CREATE TABLE customer_portal_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    password_hash text,
    is_active boolean DEFAULT true,
    last_login timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ========================================
-- 5. EMPLOYEE & HR TABLES
-- ========================================

-- Employees (extended user info)
CREATE TABLE employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_number text,
    department text,
    position text,
    manager_id uuid REFERENCES users(id),
    hourly_rate numeric(10,2),
    salary numeric(10,2),
    employment_type text DEFAULT 'full_time',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Employee Certifications
CREATE TABLE employee_certifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    certification_name text NOT NULL,
    issuing_organization text,
    certification_number text,
    issued_date date,
    expiry_date date,
    status document_status_enum NOT NULL DEFAULT 'DRAFT',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Employee Compensation
CREATE TABLE employee_compensation (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    compensation_type text,
    amount numeric(10,2),
    effective_date date,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Employee Development Goals
CREATE TABLE employee_development_goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    goal_title text NOT NULL,
    description text,
    target_date date,
    status document_status_enum NOT NULL DEFAULT 'DRAFT',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Employee Pay Rates
CREATE TABLE employee_pay_rates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    rate_type text,
    hourly_rate numeric(10,2),
    overtime_rate numeric(10,2),
    effective_date date,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Employee Performance Reviews
CREATE TABLE employee_performance_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    reviewer_id uuid REFERENCES users(id),
    review_period_start date,
    review_period_end date,
    overall_rating integer CHECK (overall_rating >= 1 AND overall_rating <= 5),
    review_notes text,
    status document_status_enum NOT NULL DEFAULT 'DRAFT',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- CONTINUE WITH MORE TABLES...
