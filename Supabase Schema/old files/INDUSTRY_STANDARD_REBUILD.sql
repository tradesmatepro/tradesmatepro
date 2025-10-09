-- ========================================
-- TradeMate Pro - Industry Standard Schema Rebuild
-- ========================================
-- This script creates a clean, industry-standard database schema
-- following PostgreSQL best practices and trade industry norms.
--
-- IMPORTANT: Run full backup before executing!
-- pg_dump -h [host] -U [user] -d [db] -F c -b -v -f backup.dump
--
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
-- 2. ENUMS (INDUSTRY STANDARD NAMING)
-- ========================================

-- Core business status enums
CREATE TYPE work_order_status_enum AS ENUM (
  'DRAFT',
  'QUOTE', 
  'SENT',
  'ACCEPTED',
  'REJECTED',
  'DECLINED', 
  'EXPIRED',
  'SCHEDULED',
  'IN_PROGRESS',
  'ASSIGNED',
  'RESCHEDULED',
  'COMPLETED',
  'CANCELLED',
  'INVOICED'
);

CREATE TYPE quote_status_enum AS ENUM (
  'DRAFT',
  'SENT', 
  'ACCEPTED',
  'REJECTED',
  'DECLINED',
  'EXPIRED'
);

CREATE TYPE job_status_enum AS ENUM (
  'DRAFT',
  'SCHEDULED',
  'IN_PROGRESS', 
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE invoice_status_enum AS ENUM (
  'UNPAID',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'VOID'
);

-- User and entity status enums
CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE customer_status_enum AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE vendor_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE company_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- Workflow and approval enums
CREATE TYPE approval_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE signature_status_enum AS ENUM ('PENDING', 'SIGNED', 'DECLINED');

-- HR and employee enums
CREATE TYPE employment_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED');
CREATE TYPE time_off_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE timesheet_status_enum AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE performance_review_status_enum AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- Financial enums
CREATE TYPE expense_status_enum AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID');
CREATE TYPE purchase_order_status_enum AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'RECEIVED', 'PAID');
CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');
CREATE TYPE commission_status_enum AS ENUM ('PENDING', 'PAID');

-- Inventory and operations enums
CREATE TYPE inventory_status_enum AS ENUM ('AVAILABLE', 'ALLOCATED', 'RESERVED', 'CONSUMED', 'DAMAGED');
CREATE TYPE movement_type_enum AS ENUM ('PURCHASE', 'RETURN', 'USAGE', 'TRANSFER', 'ADJUSTMENT', 'ALLOCATION');

-- Communication enums
CREATE TYPE message_status_enum AS ENUM ('SENT', 'DELIVERED', 'READ');
CREATE TYPE notification_status_enum AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- Marketplace enums
CREATE TYPE marketplace_request_status_enum AS ENUM ('AVAILABLE', 'TAKEN', 'CLOSED');
CREATE TYPE lead_status_enum AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');

-- Service and scheduling enums
CREATE TYPE service_request_status_enum AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE schedule_status_enum AS ENUM ('SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- Document and workflow enums
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
    address_line_1 text,
    address_line_2 text,
    city text,
    state text,
    zip_code text,
    status customer_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id)
);

-- Work Orders (unified pipeline: quote → job → invoice)
CREATE TABLE work_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES customers(id),
    assigned_to uuid REFERENCES users(id),
    status work_order_status_enum NOT NULL DEFAULT 'DRAFT',
    
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

-- Invoices (generated from completed work orders)
CREATE TABLE invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id uuid NOT NULL REFERENCES work_orders(id),
    customer_id uuid NOT NULL REFERENCES customers(id),
    
    invoice_number text UNIQUE NOT NULL,
    status invoice_status_enum NOT NULL DEFAULT 'UNPAID',
    
    -- Financial
    subtotal numeric(10,2) NOT NULL DEFAULT 0,
    tax_amount numeric(10,2) NOT NULL DEFAULT 0,
    total_amount numeric(10,2) NOT NULL DEFAULT 0,
    amount_paid numeric(10,2) NOT NULL DEFAULT 0,
    
    -- Dates
    invoice_date date NOT NULL DEFAULT CURRENT_DATE,
    due_date date,
    paid_date date,
    
    -- Metadata
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES users(id),
    updated_by uuid REFERENCES users(id)
);

-- ========================================
-- 4. AUDIT AND LOGGING TABLES
-- ========================================

-- Work order audit log
CREATE TABLE work_order_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    action text NOT NULL,
    old_status text,
    new_status text,
    details jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES users(id)
);

-- ========================================
-- 5. INDEXES FOR PERFORMANCE
-- ========================================

-- Work orders indexes
CREATE INDEX idx_work_orders_company_id ON work_orders(company_id);
CREATE INDEX idx_work_orders_customer_id ON work_orders(customer_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_assigned_to ON work_orders(assigned_to);
CREATE INDEX idx_work_orders_created_at ON work_orders(created_at);

-- Invoice indexes
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_work_order_id ON invoices(work_order_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Customer indexes
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_customers_status ON customers(status);

-- User indexes
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_status ON users(status);

-- Audit log indexes
CREATE INDEX idx_work_order_audit_log_work_order_id ON work_order_audit_log(work_order_id);
CREATE INDEX idx_work_order_audit_log_created_at ON work_order_audit_log(created_at);

-- ========================================
-- 6. VIEWS (INDUSTRY STANDARD)
-- ========================================

-- Quotes view (work orders in quote stage)
CREATE OR REPLACE VIEW quotes AS
SELECT
    id,
    company_id,
    customer_id,
    quote_number,
    status,
    total_amount,
    quote_sent_at,
    quote_expires_at,
    service_address_line_1,
    description,
    created_at,
    updated_at,
    created_by
FROM work_orders
WHERE status IN ('DRAFT'::work_order_status_enum, 'QUOTE'::work_order_status_enum, 'SENT'::work_order_status_enum);

-- Jobs view (work orders in job stage)
CREATE OR REPLACE VIEW jobs AS
SELECT
    id,
    company_id,
    customer_id,
    assigned_to,
    status,
    scheduled_start,
    scheduled_end,
    actual_start,
    actual_end,
    total_amount,
    service_address_line_1,
    description,
    created_at,
    updated_at
FROM work_orders
WHERE status IN ('SCHEDULED'::work_order_status_enum, 'IN_PROGRESS'::work_order_status_enum, 'COMPLETED'::work_order_status_enum);

-- Completed jobs view
CREATE OR REPLACE VIEW completed_jobs AS
SELECT *
FROM work_orders
WHERE status = 'COMPLETED'::work_order_status_enum;

-- Jobs with payment status
CREATE OR REPLACE VIEW jobs_with_payment_status AS
SELECT
    wo.*,
    i.id as invoice_id,
    i.invoice_number,
    i.status as invoice_status,
    i.total_amount as invoice_total,
    i.amount_paid,
    i.due_date,
    i.paid_date
FROM work_orders wo
LEFT JOIN invoices i ON i.work_order_id = wo.id
WHERE wo.status IN ('COMPLETED'::work_order_status_enum, 'INVOICED'::work_order_status_enum);

-- ========================================
-- 7. FUNCTIONS (INDUSTRY STANDARD)
-- ========================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Work order status change function
CREATE OR REPLACE FUNCTION change_work_order_status(
    p_work_order_id uuid,
    p_new_status work_order_status_enum,
    p_user_id uuid DEFAULT NULL
) RETURNS work_orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_work_order work_orders;
    v_old_status work_order_status_enum;
BEGIN
    -- Get current work order and status
    SELECT * INTO v_work_order FROM work_orders WHERE id = p_work_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Work order not found: %', p_work_order_id;
    END IF;

    v_old_status := v_work_order.status;

    -- Update the status
    UPDATE work_orders
    SET
        status = p_new_status,
        updated_at = now(),
        updated_by = p_user_id,
        version = version + 1
    WHERE id = p_work_order_id
    RETURNING * INTO v_work_order;

    -- Log the change
    INSERT INTO work_order_audit_log (
        work_order_id,
        company_id,
        action,
        old_status,
        new_status,
        details,
        created_by
    ) VALUES (
        p_work_order_id,
        v_work_order.company_id,
        'status_change',
        v_old_status::text,
        p_new_status::text,
        jsonb_build_object(
            'old_status', v_old_status,
            'new_status', p_new_status,
            'version', v_work_order.version
        ),
        p_user_id
    );

    RETURN v_work_order;
END;
$$;

-- Generate invoice from work order
CREATE OR REPLACE FUNCTION generate_invoice_from_work_order(
    p_work_order_id uuid,
    p_user_id uuid DEFAULT NULL
) RETURNS invoices
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_work_order work_orders;
    v_invoice invoices;
    v_invoice_number text;
BEGIN
    -- Get the work order
    SELECT * INTO v_work_order FROM work_orders WHERE id = p_work_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Work order not found: %', p_work_order_id;
    END IF;

    IF v_work_order.status != 'COMPLETED'::work_order_status_enum THEN
        RAISE EXCEPTION 'Work order must be completed to generate invoice';
    END IF;

    -- Check if invoice already exists
    IF EXISTS (SELECT 1 FROM invoices WHERE work_order_id = p_work_order_id) THEN
        RAISE EXCEPTION 'Invoice already exists for work order: %', p_work_order_id;
    END IF;

    -- Generate invoice number (simple sequence - customize as needed)
    SELECT 'INV-' || EXTRACT(YEAR FROM now()) || '-' || LPAD(nextval('invoice_number_seq')::text, 6, '0')
    INTO v_invoice_number;

    -- Create the invoice
    INSERT INTO invoices (
        company_id,
        work_order_id,
        customer_id,
        invoice_number,
        subtotal,
        tax_amount,
        total_amount,
        due_date,
        created_by
    ) VALUES (
        v_work_order.company_id,
        v_work_order.id,
        v_work_order.customer_id,
        v_invoice_number,
        v_work_order.subtotal,
        v_work_order.tax_amount,
        v_work_order.total_amount,
        CURRENT_DATE + INTERVAL '30 days',
        p_user_id
    ) RETURNING * INTO v_invoice;

    -- Update work order status to invoiced
    PERFORM change_work_order_status(p_work_order_id, 'INVOICED'::work_order_status_enum, p_user_id);

    RETURN v_invoice;
END;
$$;

-- ========================================
-- 8. TRIGGERS
-- ========================================

-- Updated at triggers
CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_work_orders_updated_at BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 9. SEQUENCES
-- ========================================

-- Invoice number sequence
CREATE SEQUENCE invoice_number_seq START 1;

-- ========================================
-- 10. RLS POLICIES (DISABLED FOR BETA)
-- ========================================

-- Enable RLS on all tables (but policies will allow all for beta)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_audit_log ENABLE ROW LEVEL SECURITY;

-- Beta policies (allow all - replace with proper policies later)
CREATE POLICY "Allow all for beta" ON companies FOR ALL USING (true);
CREATE POLICY "Allow all for beta" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for beta" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all for beta" ON work_orders FOR ALL USING (true);
CREATE POLICY "Allow all for beta" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow all for beta" ON work_order_audit_log FOR ALL USING (true);

-- ========================================
-- REBUILD COMPLETE
-- ========================================

-- Verify the rebuild
SELECT 'Schema rebuild completed successfully!' as status;
