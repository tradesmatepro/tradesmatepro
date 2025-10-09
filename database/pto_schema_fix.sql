-- =====================================================
-- PTO SCHEMA ALIGNMENT FIX
-- Aligns current schema with FINAL requirements
-- Safe, idempotent migration
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CREATE pto_current_balances TABLE (EXACT SPEC)
-- =====================================================
CREATE TABLE IF NOT EXISTS pto_current_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_code TEXT NOT NULL, -- 'VAC', 'SICK', 'PERS', etc.
  current_balance NUMERIC(8,2) DEFAULT 0,
  last_transaction_date TIMESTAMPTZ DEFAULT now(),
  accrual_count INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, category_code)
);

-- =====================================================
-- 2. MIGRATE DATA FROM OLD pto_balances TO pto_current_balances
-- =====================================================
-- Migrate vacation balances
INSERT INTO pto_current_balances (employee_id, company_id, category_code, current_balance, last_transaction_date)
SELECT 
  pb.employee_id,
  e.company_id,
  'VAC' as category_code,
  COALESCE(pb.vacation_balance, 0) as current_balance,
  COALESCE(pb.last_accrual, now()) as last_transaction_date
FROM pto_balances pb
JOIN employees e ON pb.employee_id = e.id
WHERE NOT EXISTS (
  SELECT 1 FROM pto_current_balances pcb 
  WHERE pcb.employee_id = pb.employee_id AND pcb.category_code = 'VAC'
);

-- Migrate sick balances
INSERT INTO pto_current_balances (employee_id, company_id, category_code, current_balance, last_transaction_date)
SELECT 
  pb.employee_id,
  e.company_id,
  'SICK' as category_code,
  COALESCE(pb.sick_balance, 0) as current_balance,
  COALESCE(pb.last_accrual, now()) as last_transaction_date
FROM pto_balances pb
JOIN employees e ON pb.employee_id = e.id
WHERE NOT EXISTS (
  SELECT 1 FROM pto_current_balances pcb 
  WHERE pcb.employee_id = pb.employee_id AND pcb.category_code = 'SICK'
);

-- =====================================================
-- 3. ENSURE pto_ledger HAS ALL REQUIRED COLUMNS
-- =====================================================
-- Add missing columns if they don't exist
ALTER TABLE pto_ledger 
  ADD COLUMN IF NOT EXISTS balance_after NUMERIC(8,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS processed_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS related_request_id UUID,
  ADD COLUMN IF NOT EXISTS payroll_period_id UUID,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS processed_by UUID;

-- =====================================================
-- 4. ENSURE employee_time_off HAS ALL REQUIRED COLUMNS
-- =====================================================
-- Verify all required columns exist
ALTER TABLE employee_time_off
  ADD COLUMN IF NOT EXISTS hours_requested NUMERIC(8,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hours_approved NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS accrual_type TEXT,
  ADD COLUMN IF NOT EXISTS policy_id UUID REFERENCES pto_policies(id),
  ADD COLUMN IF NOT EXISTS denied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS denial_reason TEXT;

-- =====================================================
-- 5. ENSURE pto_policies HAS ALL REQUIRED COLUMNS
-- =====================================================
-- Verify all required columns exist
ALTER TABLE pto_policies
  ADD COLUMN IF NOT EXISTS vacation_hours_per_period NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS sick_hours_per_period NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS accrual_period TEXT,
  ADD COLUMN IF NOT EXISTS max_vacation_hours NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS max_sick_hours NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS carryover_vacation_hours NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS carryover_sick_hours NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS accrual_rates JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS max_balances JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS carryover_rules JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS eligibility_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- =====================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_pto_current_balances_employee ON pto_current_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_pto_current_balances_company ON pto_current_balances(company_id);
CREATE INDEX IF NOT EXISTS idx_pto_current_balances_category ON pto_current_balances(category_code);
CREATE INDEX IF NOT EXISTS idx_pto_ledger_employee ON pto_ledger(employee_id);
CREATE INDEX IF NOT EXISTS idx_pto_ledger_company ON pto_ledger(company_id);
CREATE INDEX IF NOT EXISTS idx_pto_ledger_request ON pto_ledger(related_request_id);
CREATE INDEX IF NOT EXISTS idx_employee_time_off_employee ON employee_time_off(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_time_off_company ON employee_time_off(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_time_off_status ON employee_time_off(status);
CREATE INDEX IF NOT EXISTS idx_pto_policies_company ON pto_policies(company_id);

-- =====================================================
-- 7. CREATE HELPER VIEWS
-- =====================================================
CREATE OR REPLACE VIEW pto_employee_balances AS
SELECT 
  e.id as employee_id,
  e.company_id,
  e.name as employee_name,
  e.email,
  vac.current_balance as vacation_balance,
  sick.current_balance as sick_balance,
  pp.name as policy_name,
  pp.vacation_hours_per_period,
  pp.sick_hours_per_period,
  pp.accrual_period,
  pp.max_vacation_hours,
  pp.max_sick_hours
FROM employees e
LEFT JOIN pto_current_balances vac ON e.id = vac.employee_id AND vac.category_code = 'VAC'
LEFT JOIN pto_current_balances sick ON e.id = sick.employee_id AND sick.category_code = 'SICK'
LEFT JOIN pto_policies pp ON e.company_id = pp.company_id AND pp.is_active = true
WHERE e.is_active = true;

-- =====================================================
-- 8. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE pto_current_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE pto_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE pto_policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "pto_current_balances_company_isolation" ON pto_current_balances;
CREATE POLICY "pto_current_balances_company_isolation" ON pto_current_balances
  FOR ALL USING (company_id = (current_setting('app.current_company_id'))::uuid);

DROP POLICY IF EXISTS "pto_ledger_company_isolation" ON pto_ledger;
CREATE POLICY "pto_ledger_company_isolation" ON pto_ledger
  FOR ALL USING (company_id = (current_setting('app.current_company_id'))::uuid);

DROP POLICY IF EXISTS "employee_time_off_company_isolation" ON employee_time_off;
CREATE POLICY "employee_time_off_company_isolation" ON employee_time_off
  FOR ALL USING (company_id = (current_setting('app.current_company_id'))::uuid);

DROP POLICY IF EXISTS "pto_policies_company_isolation" ON pto_policies;
CREATE POLICY "pto_policies_company_isolation" ON pto_policies
  FOR ALL USING (company_id = (current_setting('app.current_company_id'))::uuid);

-- =====================================================
-- 9. CLEANUP OLD TABLES (OPTIONAL - ONLY IF SAFE)
-- =====================================================
-- Uncomment these lines only after verifying migration worked
-- DROP TABLE IF EXISTS pto_balances CASCADE;
-- DROP TABLE IF EXISTS pto_categories CASCADE;
-- DROP TABLE IF EXISTS pto_requests CASCADE;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the migration worked:
-- SELECT COUNT(*) FROM pto_current_balances;
-- SELECT COUNT(*) FROM pto_ledger;
-- SELECT COUNT(*) FROM employee_time_off WHERE accrual_type IS NOT NULL;
-- SELECT * FROM pto_employee_balances LIMIT 5;
