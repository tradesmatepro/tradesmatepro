-- ========================================
-- PHASE 1 CORE REBUILD - INDUSTRY STANDARD CORRECTED
-- ========================================
-- Based on actual TradeMate Pro app usage analysis
-- Fixes critical enum mismatches found in new phase 1.txt

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 1. INDUSTRY STANDARD ENUM TYPES
-- ========================================

-- Basic entity status enums
CREATE TYPE company_status_enum AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE customer_status_enum AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE');

-- CORRECTED: Work Order Status (unified pipeline)
-- Based on actual app usage in workOrderStatus.js
CREATE TYPE work_order_status_enum AS ENUM (
  'QUOTE',           -- Initial quote stage
  'ACCEPTED',        -- Customer accepted quote
  'SCHEDULED',       -- Job scheduled
  'ASSIGNED',        -- Job assigned to technician (MISSING in your schema!)
  'IN_PROGRESS',     -- Job in progress
  'COMPLETED',       -- Job completed
  'INVOICED',        -- Invoice created
  'CANCELLED'        -- Job cancelled
);

-- CORRECTED: Invoice Status (industry standard + app usage)
-- Based on actual filtering logic in Invoices.js
CREATE TYPE invoice_status_enum AS ENUM (
  'UNPAID',          -- Not paid
  'PARTIALLY_PAID',  -- Partially paid (matches app usage)
  'PAID',            -- Fully paid
  'OVERDUE',         -- Past due date
  'VOID'             -- Voided invoice
);

-- ========================================
-- 2. CORE ENTITIES
-- ========================================

-- Companies
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status company_status_enum DEFAULT 'ACTIVE',
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
    status customer_status_enum DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Users
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    status user_status_enum DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Work Orders (unified pipeline - single source of truth)
CREATE TABLE public.work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status work_order_status_enum DEFAULT 'QUOTE',
    estimated_duration INTEGER,
    total_amount NUMERIC(12,2) DEFAULT 0,
    
    -- Quote-specific fields
    quote_number TEXT,
    quote_sent_at TIMESTAMPTZ,
    quote_expires_at TIMESTAMPTZ,
    
    -- Job-specific fields  
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.users(id),
    
    -- Invoice-specific fields
    invoice_number TEXT,
    invoice_status invoice_status_enum,
    due_date TIMESTAMPTZ,
    
    -- Audit fields
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices (separate financial documents)
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    status invoice_status_enum DEFAULT 'UNPAID',
    total_amount NUMERIC(12,2) DEFAULT 0,
    due_date TIMESTAMPTZ,
    issued_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES public.users(id),
    updated_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Invoice line items
CREATE TABLE public.invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Work Order Audit Log
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

-- ========================================
-- 3. FUNCTIONS & TRIGGERS
-- ========================================

-- Updated_at automation
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER set_updated_at_companies
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_customers
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_users
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_work_orders
BEFORE UPDATE ON public.work_orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_invoices
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Work order audit trigger
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
        'new_total', NEW.total_amount,
        'changed_by', NEW.updated_by
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_work_order_change
AFTER UPDATE ON public.work_orders
FOR EACH ROW EXECUTE FUNCTION log_work_order_change();

-- ========================================
-- 4. INDUSTRY STANDARD VIEWS
-- ========================================

-- Quotes view (work orders in quote stage)
CREATE OR REPLACE VIEW public.quotes AS
SELECT 
    id,
    company_id,
    customer_id,
    title,
    description,
    status,
    total_amount,
    quote_number,
    quote_sent_at,
    quote_expires_at,
    created_by,
    created_at,
    updated_at
FROM public.work_orders
WHERE status IN ('QUOTE');

-- Jobs view (work orders in job stages)  
CREATE OR REPLACE VIEW public.jobs AS
SELECT 
    id,
    company_id,
    customer_id,
    title,
    description,
    status,
    total_amount,
    scheduled_start,
    scheduled_end,
    assigned_to,
    created_by,
    created_at,
    updated_at
FROM public.work_orders
WHERE status IN ('ACCEPTED', 'SCHEDULED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED');

-- Closed jobs view
CREATE OR REPLACE VIEW public.closed_jobs AS
SELECT * FROM public.work_orders
WHERE status IN ('COMPLETED', 'INVOICED', 'CANCELLED');

-- Open invoices view
CREATE OR REPLACE VIEW public.open_invoices AS
SELECT 
    i.id,
    i.work_order_id,
    i.customer_id,
    c.name AS customer_name,
    i.invoice_number,
    i.status,
    i.total_amount,
    i.due_date,
    i.issued_at,
    i.created_at,
    i.updated_at
FROM public.invoices i
JOIN public.customers c ON c.id = i.customer_id
WHERE i.status IN ('UNPAID', 'PARTIALLY_PAID', 'OVERDUE');

-- Pipeline overview (unified view)
CREATE OR REPLACE VIEW public.pipeline_overview AS
SELECT 
    wo.*,
    c.name AS customer_name,
    c.email AS customer_email,
    i.status AS invoice_status,
    i.due_date AS invoice_due_date
FROM public.work_orders wo
JOIN public.customers c ON c.id = wo.customer_id
LEFT JOIN public.invoices i ON i.work_order_id = wo.id;

-- ========================================
-- 5. INDEXES FOR PERFORMANCE
-- ========================================

-- Work orders indexes
CREATE INDEX idx_work_orders_company_id ON public.work_orders(company_id);
CREATE INDEX idx_work_orders_customer_id ON public.work_orders(customer_id);
CREATE INDEX idx_work_orders_status ON public.work_orders(status);
CREATE INDEX idx_work_orders_assigned_to ON public.work_orders(assigned_to);
CREATE INDEX idx_work_orders_created_at ON public.work_orders(created_at);

-- Invoices indexes
CREATE INDEX idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX idx_invoices_work_order_id ON public.invoices(work_order_id);
CREATE INDEX idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);

-- Customers indexes
CREATE INDEX idx_customers_company_id ON public.customers(company_id);
CREATE INDEX idx_customers_email ON public.customers(email);

-- Users indexes  
CREATE INDEX idx_users_company_id ON public.users(company_id);
CREATE INDEX idx_users_email ON public.users(email);
