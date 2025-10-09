-- ===============================================
-- MISSING TABLES CAUSING 400 ERRORS
-- These tables are referenced by the frontend but don't exist
-- Date: 2025-09-22
-- ===============================================

-- 1. PTO Categories table (referenced by PTO components)
CREATE TABLE IF NOT EXISTS pto_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PTO Policies table (referenced by PTO services)
CREATE TABLE IF NOT EXISTS pto_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    accrual_rate NUMERIC DEFAULT 0,
    max_balance NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PTO Accrual Policies table (referenced by Enterprise PTO)
CREATE TABLE IF NOT EXISTS pto_accrual_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    accrual_rate NUMERIC DEFAULT 0,
    max_balance NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Job Templates table (referenced by JobTemplatesService)
CREATE TABLE IF NOT EXISTS job_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Employees table (referenced by PTO services)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PO Approval Rules table (referenced by PurchaseOrdersService)
CREATE TABLE IF NOT EXISTS po_approval_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    min_amount NUMERIC DEFAULT 0,
    max_amount NUMERIC,
    approver_role TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Quote Versions table (referenced by QuotesPro.js)
CREATE TABLE IF NOT EXISTS quote_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    version_number INTEGER DEFAULT 1,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Quote Follow Ups table (referenced by QuotesPro.js)
CREATE TABLE IF NOT EXISTS quote_follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    scheduled_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Quote Approval Workflows table (referenced by QuotesPro.js)
CREATE TABLE IF NOT EXISTS quote_approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pto_categories_company_active ON pto_categories(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_pto_policies_company_active ON pto_policies(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_pto_accrual_policies_company_active ON pto_accrual_policies(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_job_templates_company_active ON job_templates(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_employees_company_active ON employees(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_po_approval_rules_company_active ON po_approval_rules(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_quote_versions_work_order ON quote_versions(work_order_id);
CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_work_order ON quote_follow_ups(work_order_id);
CREATE INDEX IF NOT EXISTS idx_quote_approval_workflows_work_order ON quote_approval_workflows(work_order_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_pto_categories
    BEFORE UPDATE ON pto_categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_pto_policies
    BEFORE UPDATE ON pto_policies
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_pto_accrual_policies
    BEFORE UPDATE ON pto_accrual_policies
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_job_templates
    BEFORE UPDATE ON job_templates
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_employees
    BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_po_approval_rules
    BEFORE UPDATE ON po_approval_rules
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_quote_versions
    BEFORE UPDATE ON quote_versions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_quote_follow_ups
    BEFORE UPDATE ON quote_follow_ups
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_quote_approval_workflows
    BEFORE UPDATE ON quote_approval_workflows
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ===============================================
-- SUMMARY
-- 
-- This creates 9 missing tables that are causing 400 errors:
-- 1. pto_categories - For PTO management
-- 2. pto_policies - For PTO policies  
-- 3. pto_accrual_policies - For enterprise PTO
-- 4. job_templates - For job template management
-- 5. employees - For employee management
-- 6. po_approval_rules - For purchase order approvals
-- 7. quote_versions - For quote versioning
-- 8. quote_follow_ups - For quote follow-ups
-- 9. quote_approval_workflows - For quote approvals
--
-- All tables include:
-- - Proper foreign keys to existing tables
-- - is_active fields where expected by frontend
-- - Performance indexes
-- - Updated_at triggers
-- ===============================================
