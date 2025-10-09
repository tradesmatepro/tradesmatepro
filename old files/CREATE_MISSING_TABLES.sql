-- CREATE MISSING TABLES FOR SCHEMA STANDARDIZATION
-- Generated: 2025-09-22
-- Purpose: Create tables referenced by frontend but missing from database

-- =====================================================
-- CRITICAL MISSING TABLES
-- =====================================================

-- 1. JOB TEMPLATES (Referenced by JobTemplatesService.js)
CREATE TABLE IF NOT EXISTS job_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    estimated_duration INTEGER, -- in minutes
    default_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    template_data JSONB, -- flexible template structure
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SERVICE REQUESTS (Referenced by IncomingRequests.js)
-- Note: This might be an alias for marketplace_requests, but creating for compatibility
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'scheduled', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    service_type TEXT,
    location_address TEXT,
    preferred_date DATE,
    preferred_time TIME,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    created_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PTO POLICIES (Referenced by DevTools)
CREATE TABLE IF NOT EXISTS pto_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    policy_name TEXT NOT NULL,
    policy_type TEXT NOT NULL CHECK (policy_type IN ('vacation', 'sick', 'personal', 'holiday', 'bereavement')),
    accrual_rate DECIMAL(5,2), -- hours per pay period
    accrual_frequency TEXT CHECK (accrual_frequency IN ('weekly', 'biweekly', 'monthly', 'annually')),
    max_balance DECIMAL(8,2), -- maximum hours that can be accrued
    carryover_limit DECIMAL(8,2), -- hours that can carry over to next year
    waiting_period_days INTEGER DEFAULT 0, -- days before policy takes effect
    is_active BOOLEAN DEFAULT true,
    effective_date DATE NOT NULL,
    end_date DATE,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PTO LEDGER (Referenced by DevTools)
CREATE TABLE IF NOT EXISTS pto_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES pto_policies(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('accrual', 'usage', 'adjustment', 'carryover', 'payout')),
    hours DECIMAL(8,2) NOT NULL, -- positive for accruals, negative for usage
    balance_after DECIMAL(8,2) NOT NULL, -- running balance after this transaction
    transaction_date DATE NOT NULL,
    description TEXT,
    reference_id UUID, -- reference to time_off request or other related record
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EMPLOYEE PTO BALANCES (Referenced by DevTools)
CREATE TABLE IF NOT EXISTS employee_pto_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES pto_policies(id) ON DELETE CASCADE,
    current_balance DECIMAL(8,2) NOT NULL DEFAULT 0,
    pending_requests DECIMAL(8,2) DEFAULT 0, -- hours in pending requests
    available_balance DECIMAL(8,2) GENERATED ALWAYS AS (current_balance - pending_requests) STORED,
    last_accrual_date DATE,
    next_accrual_date DATE,
    year_to_date_used DECIMAL(8,2) DEFAULT 0,
    year_to_date_accrued DECIMAL(8,2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, policy_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Job Templates
CREATE INDEX IF NOT EXISTS idx_job_templates_company_active ON job_templates(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_job_templates_category ON job_templates(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_job_templates_usage ON job_templates(usage_count DESC) WHERE is_active = true;

-- Service Requests  
CREATE INDEX IF NOT EXISTS idx_service_requests_company_status ON service_requests(company_id, status);
CREATE INDEX IF NOT EXISTS idx_service_requests_customer ON service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_assigned ON service_requests(assigned_to) WHERE assigned_to IS NOT NULL;

-- PTO Policies
CREATE INDEX IF NOT EXISTS idx_pto_policies_company_active ON pto_policies(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_pto_policies_effective ON pto_policies(effective_date, end_date);

-- PTO Ledger
CREATE INDEX IF NOT EXISTS idx_pto_ledger_employee_date ON pto_ledger(employee_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_pto_ledger_policy ON pto_ledger(policy_id);

-- Employee PTO Balances
CREATE INDEX IF NOT EXISTS idx_employee_pto_balances_employee ON employee_pto_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_pto_balances_company ON employee_pto_balances(company_id);

-- =====================================================
-- GRANTS FOR AUTHENTICATED USERS
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON job_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON service_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pto_policies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pto_ledger TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON employee_pto_balances TO authenticated;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_job_templates_updated_at BEFORE UPDATE ON job_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pto_policies_updated_at BEFORE UPDATE ON pto_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_pto_balances_updated_at BEFORE UPDATE ON employee_pto_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Missing tables created successfully!';
    RAISE NOTICE '📋 Created: job_templates, service_requests, pto_policies, pto_ledger, employee_pto_balances';
    RAISE NOTICE '🔧 Added indexes and triggers for performance';
    RAISE NOTICE '🔐 Granted permissions to authenticated role';
END $$;
