-- ========================================
-- Phase 1 Schema - Onboarding Compatible
-- ========================================
-- This version includes all fields needed for onboarding to work
-- Based on your new phase 1.txt but with onboarding compatibility
-- ========================================

-- ========================================
-- 1. ENUM TYPES
-- ========================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Company status
CREATE TYPE company_status_enum AS ENUM ('ACTIVE', 'INACTIVE');

-- Customer status
CREATE TYPE customer_status_enum AS ENUM ('ACTIVE', 'INACTIVE');

-- Work order status (unified pipeline)
CREATE TYPE work_order_status_enum AS ENUM (
  'QUOTE',
  'SENT',
  'ACCEPTED',
  'REJECTED',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'INVOICED'
);

-- Invoice status (more standard)
CREATE TYPE invoice_status_enum AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID');

-- User status
CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE');

-- ========================================
-- 2. CORE ENTITIES (ONBOARDING COMPATIBLE)
-- ========================================

-- Companies (with onboarding fields)
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    street_address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'United States',
    status company_status_enum DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Users (with onboarding fields)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    company_name TEXT, -- For onboarding compatibility
    role TEXT DEFAULT 'admin',
    tier TEXT DEFAULT 'free_trial',
    active BOOLEAN DEFAULT true,
    notes TEXT,
    trial_end TIMESTAMPTZ,
    status user_status_enum DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customers
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    street_address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'United States',
    status customer_status_enum DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Work Orders (pipeline anchor)
CREATE TABLE public.work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status work_order_status_enum DEFAULT 'QUOTE',
    estimated_duration INTEGER,
    total_amount NUMERIC(12,2) DEFAULT 0,
    service_address_line_1 TEXT,
    service_address_line_2 TEXT,
    service_city TEXT,
    service_state TEXT,
    service_zip_code TEXT,
    service_country TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    status invoice_status_enum DEFAULT 'UNPAID',
    total_amount NUMERIC(12,2) DEFAULT 0,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Invoice line items (with company_id for multi-tenancy)
CREATE TABLE public.invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- ========================================
-- 3. FUNCTIONS & TRIGGERS
-- ========================================

-- Work order status change audit (with proper FK)
CREATE TABLE public.work_order_audit_log (
    id BIGSERIAL PRIMARY KEY,
    work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    action TEXT,
    old_status TEXT,
    new_status TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Work order change logging function
CREATE OR REPLACE FUNCTION log_work_order_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.work_order_audit_log (
            work_order_id, company_id, action, old_status, new_status, details
        ) VALUES (
            NEW.id, NEW.company_id, 'status_changed',
            OLD.status::text, NEW.status::text,
            jsonb_build_object(
                'old_total', OLD.total_amount,
                'new_total', NEW.total_amount
            )
        );
    END IF;
    RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_work_orders_updated_at BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_log_work_order_change
AFTER UPDATE ON public.work_orders
FOR EACH ROW
EXECUTE FUNCTION log_work_order_change();

-- ========================================
-- 4. VIEWS (UNIFIED PIPELINE)
-- ========================================

-- All work orders history
CREATE OR REPLACE VIEW public.work_orders_history AS
SELECT * FROM public.work_orders;

-- Closed jobs = completed work orders
CREATE OR REPLACE VIEW public.closed_jobs AS
SELECT * FROM public.work_orders
WHERE status = 'COMPLETED';

-- Quotes = pipeline stage "QUOTE"
CREATE OR REPLACE VIEW public.quotes AS
SELECT * FROM public.work_orders
WHERE status = 'QUOTE';

-- Invoices with customer info
CREATE OR REPLACE VIEW public.open_invoices AS
SELECT 
    i.id,
    i.work_order_id,
    i.customer_id,
    c.name AS customer_name,
    i.status,
    i.total_amount,
    i.due_date,
    i.created_at,
    i.updated_at
FROM public.invoices i
JOIN public.customers c ON c.id = i.customer_id
WHERE i.status = 'UNPAID';

-- Jobs with payment status
CREATE OR REPLACE VIEW public.jobs_with_payment_status AS
SELECT 
    wo.*,
    i.status AS invoice_status
FROM public.work_orders wo
LEFT JOIN public.invoices i ON i.work_order_id = wo.id;

-- ========================================
-- 5. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX idx_users_company_id ON public.users(company_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_customers_company_id ON public.customers(company_id);
CREATE INDEX idx_work_orders_company_id ON public.work_orders(company_id);
CREATE INDEX idx_work_orders_customer_id ON public.work_orders(customer_id);
CREATE INDEX idx_work_orders_status ON public.work_orders(status);
CREATE INDEX idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX idx_invoices_work_order_id ON public.invoices(work_order_id);
CREATE INDEX idx_invoice_line_items_company_id ON public.invoice_line_items(company_id);
CREATE INDEX idx_work_order_audit_log_work_order_id ON public.work_order_audit_log(work_order_id);

-- ========================================
-- 6. RLS POLICIES (DISABLED FOR BETA)
-- ========================================

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_audit_log ENABLE ROW LEVEL SECURITY;

-- Beta policies (allow all)
CREATE POLICY "Allow all for beta" ON public.companies FOR ALL USING (true);
CREATE POLICY "Allow all for beta" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all for beta" ON public.customers FOR ALL USING (true);
CREATE POLICY "Allow all for beta" ON public.work_orders FOR ALL USING (true);
CREATE POLICY "Allow all for beta" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Allow all for beta" ON public.invoice_line_items FOR ALL USING (true);
CREATE POLICY "Allow all for beta" ON public.work_order_audit_log FOR ALL USING (true);

-- ========================================
-- ONBOARDING COMPATIBLE SCHEMA COMPLETE
-- ========================================
