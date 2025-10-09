-- =====================================================
-- APPLY PTO SYSTEM SCHEMA TO SUPABASE
-- Based on existing schema structure
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- 1. Create PTO Categories table (NEW - doesn't exist in schema)
CREATE TABLE IF NOT EXISTS pto_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  requires_approval BOOLEAN DEFAULT true,
  max_consecutive_days INTEGER,
  advance_notice_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, code)
);

-- 2. Enhance existing pto_policies table (add missing columns)
-- Current schema: id, company_id, name, vacation_hours_per_period, sick_hours_per_period, accrual_period, max_vacation_hours, max_sick_hours, carryover_vacation_hours, carryover_sick_hours
ALTER TABLE pto_policies
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS accrual_rates JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS max_balances JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS carryover_rules JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS eligibility_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 3. Enhance existing employee_pto_policies table (add missing columns)
-- Current schema: id, employee_id, policy_id, effective_date, end_date
ALTER TABLE employee_pto_policies
  ADD COLUMN IF NOT EXISTS assigned_by UUID,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 4. Enhance existing pto_ledger table (add missing columns)
-- Current schema: id, employee_id, policy_id, entry_type, hours, effective_date, notes, created_at
ALTER TABLE pto_ledger
  ADD COLUMN IF NOT EXISTS company_id UUID,
  ADD COLUMN IF NOT EXISTS category_code TEXT DEFAULT 'VAC',
  ADD COLUMN IF NOT EXISTS balance_after DECIMAL(8,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS processed_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS related_request_id UUID,
  ADD COLUMN IF NOT EXISTS payroll_period_id UUID,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS processed_by UUID;

-- Update existing pto_ledger records to have company_id from employee
UPDATE pto_ledger
SET company_id = u.company_id
FROM users u
WHERE pto_ledger.employee_id = u.id AND pto_ledger.company_id IS NULL;

-- 5. Enhance existing pto_requests table (add missing columns)
-- Current schema: id, employee_id, policy_id, start_date, end_date, hours_requested, status, created_at
ALTER TABLE pto_requests
  ADD COLUMN IF NOT EXISTS company_id UUID,
  ADD COLUMN IF NOT EXISTS category_code TEXT DEFAULT 'VAC',
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID,
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS is_historical BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_approved BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Update existing pto_requests records to have company_id from employee
UPDATE pto_requests
SET company_id = u.company_id
FROM users u
WHERE pto_requests.employee_id = u.id AND pto_requests.company_id IS NULL;

-- 6. Create view for current PTO balances (using enhanced pto_ledger)
CREATE OR REPLACE VIEW pto_current_balances AS
SELECT
  l.employee_id,
  l.company_id,
  COALESCE(l.category_code, 'VAC') as category_code,
  COALESCE(SUM(l.hours), 0) as current_balance,
  MAX(l.effective_date) as last_transaction_date,
  COUNT(CASE WHEN l.entry_type = 'ACCRUAL' THEN 1 END) as accrual_count,
  COUNT(CASE WHEN l.entry_type = 'USAGE' THEN 1 END) as usage_count
FROM pto_ledger l
WHERE l.effective_date <= CURRENT_DATE
  AND l.company_id IS NOT NULL
GROUP BY l.employee_id, l.company_id, l.category_code;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pto_categories_company ON pto_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_pto_policies_company ON pto_policies(company_id);
CREATE INDEX IF NOT EXISTS idx_pto_ledger_employee_date ON pto_ledger(employee_id, effective_date);
CREATE INDEX IF NOT EXISTS idx_pto_ledger_company_category ON pto_ledger(company_id, category_code);
CREATE INDEX IF NOT EXISTS idx_pto_requests_employee_status ON pto_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_pto_requests_company_dates ON pto_requests(company_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_employee_policies_current ON employee_pto_policies(employee_id, effective_date) WHERE end_date IS NULL;

-- 8. Create trigger for automatic historical marking
CREATE OR REPLACE FUNCTION update_pto_request_historical()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark requests as historical when end_date passes
  IF NEW.end_date < CURRENT_DATE AND NEW.status = 'APPROVED' THEN
    NEW.is_historical = true;
  END IF;

  -- Set updated_at if column exists
  IF TG_TABLE_NAME = 'pto_requests' AND NEW.updated_at IS NOT NULL THEN
    NEW.updated_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pto_request_historical ON pto_requests;
CREATE TRIGGER trigger_pto_request_historical
  BEFORE UPDATE ON pto_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_pto_request_historical();

-- 9. Create function to get PTO balance
CREATE OR REPLACE FUNCTION get_pto_balance(
  p_employee_id UUID,
  p_category_code TEXT DEFAULT 'VAC',
  p_as_of_date DATE DEFAULT CURRENT_DATE
) RETURNS DECIMAL(8,2) AS $$
DECLARE
  balance DECIMAL(8,2) := 0;
BEGIN
  SELECT COALESCE(SUM(hours), 0)
  INTO balance
  FROM pto_ledger
  WHERE employee_id = p_employee_id
    AND COALESCE(category_code, 'VAC') = p_category_code
    AND effective_date <= p_as_of_date;

  RETURN balance;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to add PTO ledger entry
CREATE OR REPLACE FUNCTION add_pto_ledger_entry(
  p_employee_id UUID,
  p_company_id UUID,
  p_category_code TEXT DEFAULT 'VAC',
  p_entry_type TEXT DEFAULT 'ACCRUAL',
  p_hours DECIMAL(8,2) DEFAULT 0,
  p_effective_date DATE DEFAULT CURRENT_DATE,
  p_description TEXT DEFAULT NULL,
  p_related_request_id UUID DEFAULT NULL,
  p_processed_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_balance DECIMAL(8,2);
  entry_id UUID;
BEGIN
  -- Calculate new balance
  new_balance := get_pto_balance(p_employee_id, p_category_code, p_effective_date) + p_hours;

  -- Insert ledger entry
  INSERT INTO pto_ledger (
    employee_id, company_id, category_code, entry_type, hours,
    effective_date, balance_after, description, related_request_id, processed_by
  ) VALUES (
    p_employee_id, p_company_id, p_category_code, p_entry_type, p_hours,
    p_effective_date, new_balance, p_description, p_related_request_id, p_processed_by
  ) RETURNING id INTO entry_id;

  RETURN entry_id;
END;
$$ LANGUAGE plpgsql;

-- 11. Add constraints to ensure data integrity (with proper error handling)
DO $$
BEGIN
  -- Add constraint to pto_ledger if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'pto_ledger_entry_type_check'
    AND table_name = 'pto_ledger'
  ) THEN
    ALTER TABLE pto_ledger
      ADD CONSTRAINT pto_ledger_entry_type_check
      CHECK (entry_type IN ('ACCRUAL', 'USAGE', 'ADJUSTMENT', 'CARRYOVER', 'PAYOUT', 'FORFEITURE'));
  END IF;

  -- Add constraint to pto_requests if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'pto_requests_status_check'
    AND table_name = 'pto_requests'
  ) THEN
    ALTER TABLE pto_requests
      ADD CONSTRAINT pto_requests_status_check
      CHECK (status IN ('PENDING', 'APPROVED', 'DENIED', 'CANCELLED', 'EXPIRED', 'COMPLETED'));
  END IF;
END $$;

-- 12. Create a simple migration function to populate missing data
CREATE OR REPLACE FUNCTION migrate_existing_pto_data() RETURNS VOID AS $$
BEGIN
  -- Update any NULL company_id values in pto_ledger
  UPDATE pto_ledger
  SET company_id = u.company_id
  FROM users u
  WHERE pto_ledger.employee_id = u.id AND pto_ledger.company_id IS NULL;

  -- Update any NULL company_id values in pto_requests
  UPDATE pto_requests
  SET company_id = u.company_id
  FROM users u
  WHERE pto_requests.employee_id = u.id AND pto_requests.company_id IS NULL;

  -- Set default category_code for existing records
  UPDATE pto_ledger SET category_code = 'VAC' WHERE category_code IS NULL;
  UPDATE pto_requests SET category_code = 'VAC' WHERE category_code IS NULL;

  RAISE NOTICE 'PTO data migration completed successfully';
END;
$$ LANGUAGE plpgsql;

-- Run the migration
SELECT migrate_existing_pto_data();

-- =====================================================
-- SCHEMA ENHANCEMENT COMPLETED!
--
-- What was done:
-- 1. Created pto_categories table (new)
-- 2. Enhanced existing pto_policies table
-- 3. Enhanced existing employee_pto_policies table
-- 4. Enhanced existing pto_ledger table
-- 5. Enhanced existing pto_requests table
-- 6. Created pto_current_balances view
-- 7. Added indexes for performance
-- 8. Added triggers and functions
-- 9. Migrated existing data
--
-- Now you can enable the PTO system initialization!
-- =====================================================
