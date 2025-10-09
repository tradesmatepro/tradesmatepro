-- =====================================================
-- ENHANCED PTO SYSTEM IMPLEMENTATION
-- Based on existing schema + GPT-5 feedback
-- =====================================================

-- 1. Create PTO Categories table (missing from schema)
CREATE TABLE IF NOT EXISTS pto_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "Vacation", "Sick", "Personal", "Bereavement"
  code TEXT NOT NULL, -- "VAC", "SICK", "PERS", "BEREAVE"
  color TEXT DEFAULT '#3B82F6', -- UI color
  requires_approval BOOLEAN DEFAULT true,
  max_consecutive_days INTEGER, -- Optional limit
  advance_notice_days INTEGER DEFAULT 0, -- Required notice
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, code)
);

-- 2. Enhance existing pto_policies table structure
ALTER TABLE pto_policies 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS accrual_frequency TEXT CHECK (accrual_frequency IN ('weekly', 'biweekly', 'monthly', 'annually')) DEFAULT 'biweekly',
  ADD COLUMN IF NOT EXISTS accrual_rates JSONB DEFAULT '{}', -- {"VAC": 3.08, "SICK": 1.54}
  ADD COLUMN IF NOT EXISTS max_balances JSONB DEFAULT '{}', -- {"VAC": 160, "SICK": 80}
  ADD COLUMN IF NOT EXISTS carryover_rules JSONB DEFAULT '{}', -- {"VAC": {"max": 40, "expires": "2024-03-31"}}
  ADD COLUMN IF NOT EXISTS eligibility_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 3. Enhance pto_ledger table
ALTER TABLE pto_ledger
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS category_code TEXT NOT NULL DEFAULT 'VAC',
  ADD COLUMN IF NOT EXISTS balance_after DECIMAL(8,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS processed_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS related_request_id UUID REFERENCES employee_time_off(id),
  ADD COLUMN IF NOT EXISTS payroll_period_id UUID,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES users(id);

-- 4. Enhance pto_requests table
ALTER TABLE pto_requests
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS category_code TEXT NOT NULL DEFAULT 'VAC',
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS is_historical BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_approved BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 5. Add missing columns to employee_pto_policies
ALTER TABLE employee_pto_policies
  ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 6. Create view for current PTO balances
CREATE OR REPLACE VIEW pto_current_balances AS
SELECT 
  l.employee_id,
  l.company_id,
  l.category_code,
  COALESCE(SUM(l.hours), 0) as current_balance,
  MAX(l.effective_date) as last_transaction_date,
  COUNT(CASE WHEN l.entry_type = 'ACCRUAL' THEN 1 END) as accrual_count,
  COUNT(CASE WHEN l.entry_type = 'USAGE' THEN 1 END) as usage_count
FROM pto_ledger l
WHERE l.effective_date <= CURRENT_DATE
GROUP BY l.employee_id, l.company_id, l.category_code;

-- 7. Create indexes for performance
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
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pto_request_historical ON pto_requests;
CREATE TRIGGER trigger_pto_request_historical
  BEFORE UPDATE ON pto_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_pto_request_historical();

-- 9. Insert default PTO categories for existing companies
INSERT INTO pto_categories (company_id, name, code, color, requires_approval)
SELECT DISTINCT 
  c.id,
  'Vacation',
  'VAC',
  '#10B981',
  true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM pto_categories pc WHERE pc.company_id = c.id AND pc.code = 'VAC'
);

INSERT INTO pto_categories (company_id, name, code, color, requires_approval)
SELECT DISTINCT 
  c.id,
  'Sick Leave',
  'SICK',
  '#EF4444',
  false
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM pto_categories pc WHERE pc.company_id = c.id AND pc.code = 'SICK'
);

INSERT INTO pto_categories (company_id, name, code, color, requires_approval)
SELECT DISTINCT 
  c.id,
  'Personal',
  'PERS',
  '#8B5CF6',
  true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM pto_categories pc WHERE pc.company_id = c.id AND pc.code = 'PERS'
);

-- 10. Create default PTO policy for existing companies
INSERT INTO pto_policies (id, company_id, name, accrual_rates, max_balances)
SELECT 
  gen_random_uuid(),
  c.id,
  'Standard Full-time',
  '{"VAC": 3.08, "SICK": 1.54, "PERS": 0.77}',
  '{"VAC": 160, "SICK": 80, "PERS": 40}'
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM pto_policies pp WHERE pp.company_id = c.id
);

-- 11. Function to calculate PTO balance for an employee/category
CREATE OR REPLACE FUNCTION get_pto_balance(
  p_employee_id UUID,
  p_category_code TEXT,
  p_as_of_date DATE DEFAULT CURRENT_DATE
) RETURNS DECIMAL(8,2) AS $$
DECLARE
  balance DECIMAL(8,2) := 0;
BEGIN
  SELECT COALESCE(SUM(hours), 0)
  INTO balance
  FROM pto_ledger
  WHERE employee_id = p_employee_id
    AND category_code = p_category_code
    AND effective_date <= p_as_of_date;
    
  RETURN balance;
END;
$$ LANGUAGE plpgsql;

-- 12. Function to add PTO ledger entry
CREATE OR REPLACE FUNCTION add_pto_ledger_entry(
  p_employee_id UUID,
  p_company_id UUID,
  p_category_code TEXT,
  p_entry_type TEXT,
  p_hours DECIMAL(8,2),
  p_effective_date DATE,
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
