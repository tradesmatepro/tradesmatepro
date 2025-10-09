-- =====================================================
-- ENHANCED PTO SYSTEM SCHEMA
-- Addresses GPT-5 feedback for audit-friendly design
-- =====================================================

-- 1. PTO Categories (Company-specific, flexible)
CREATE TABLE pto_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "Vacation", "Sick", "Personal", "Bereavement", "Jury Duty"
  code TEXT NOT NULL, -- "VAC", "SICK", "PERS", "BEREAVE", "JURY"
  color TEXT DEFAULT '#3B82F6', -- UI color
  requires_approval BOOLEAN DEFAULT true,
  max_consecutive_days INTEGER, -- Optional limit
  advance_notice_days INTEGER DEFAULT 0, -- Required notice
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, code)
);

-- 2. PTO Policies (Accrual rules)
CREATE TABLE pto_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "Standard", "Probationary", "Senior", "Part-time"
  description TEXT,
  
  -- Accrual settings
  accrual_frequency TEXT CHECK (accrual_frequency IN ('weekly', 'biweekly', 'monthly', 'annually')) DEFAULT 'biweekly',
  
  -- Per-category accrual rates (JSON for flexibility)
  accrual_rates JSONB, -- {"VAC": 3.08, "SICK": 1.54} hours per period
  
  -- Maximum balances
  max_balances JSONB, -- {"VAC": 160, "SICK": 80} max hours
  
  -- Carryover rules
  carryover_rules JSONB, -- {"VAC": {"max": 40, "expires": "2024-03-31"}}
  
  -- Eligibility
  eligibility_days INTEGER DEFAULT 0, -- Days before accrual starts
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Employee Policy Assignment (Historical tracking)
CREATE TABLE employee_pto_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES pto_policies(id),
  effective_date DATE NOT NULL,
  end_date DATE, -- NULL = current policy
  assigned_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PTO Ledger (Audit trail for all PTO transactions)
CREATE TABLE pto_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  category_code TEXT NOT NULL,
  
  -- Transaction details
  entry_type TEXT CHECK (entry_type IN ('ACCRUAL', 'USAGE', 'ADJUSTMENT', 'CARRYOVER', 'PAYOUT', 'FORFEITURE')) NOT NULL,
  hours DECIMAL(8,2) NOT NULL, -- Can be negative for usage
  balance_after DECIMAL(8,2) NOT NULL, -- Running balance
  
  -- Dates
  effective_date DATE NOT NULL, -- When this affects balance
  processed_date DATE DEFAULT CURRENT_DATE, -- When this was recorded
  
  -- References
  related_request_id UUID REFERENCES employee_time_off(id), -- If from PTO request
  payroll_period_id UUID, -- If from payroll accrual
  policy_id UUID REFERENCES pto_policies(id),
  
  -- Audit info
  description TEXT,
  processed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enhanced PTO Requests (Keep forever for audit)
CREATE TABLE pto_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  category_code TEXT NOT NULL,
  
  -- Request details
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  hours_requested DECIMAL(8,2) NOT NULL,
  
  -- Status tracking
  status TEXT CHECK (status IN ('PENDING', 'APPROVED', 'DENIED', 'CANCELLED', 'EXPIRED', 'COMPLETED')) DEFAULT 'PENDING',
  
  -- Approval workflow
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT,
  
  -- Employee notes
  reason TEXT,
  notes TEXT,
  
  -- System flags
  is_historical BOOLEAN DEFAULT false, -- Mark as past for UI filtering
  auto_approved BOOLEAN DEFAULT false, -- If approved by policy rules
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PTO Balance View (Current balances per employee/category)
CREATE VIEW pto_current_balances AS
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

-- 7. Indexes for performance
CREATE INDEX idx_pto_ledger_employee_date ON pto_ledger(employee_id, effective_date);
CREATE INDEX idx_pto_ledger_company_category ON pto_ledger(company_id, category_code);
CREATE INDEX idx_pto_requests_employee_status ON pto_requests(employee_id, status);
CREATE INDEX idx_pto_requests_company_dates ON pto_requests(company_id, start_date, end_date);
CREATE INDEX idx_employee_policies_current ON employee_pto_policies(employee_id, effective_date) WHERE end_date IS NULL;

-- 8. Triggers for automatic updates
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

CREATE TRIGGER trigger_pto_request_historical
  BEFORE UPDATE ON pto_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_pto_request_historical();

-- 9. Sample data for testing
INSERT INTO pto_categories (company_id, name, code, color, requires_approval) VALUES
  ('company-uuid', 'Vacation', 'VAC', '#10B981', true),
  ('company-uuid', 'Sick Leave', 'SICK', '#EF4444', false),
  ('company-uuid', 'Personal', 'PERS', '#8B5CF6', true),
  ('company-uuid', 'Bereavement', 'BEREAVE', '#6B7280', false);

INSERT INTO pto_policies (company_id, name, accrual_rates, max_balances) VALUES
  ('company-uuid', 'Standard Full-time', 
   '{"VAC": 3.08, "SICK": 1.54, "PERS": 0.77}',
   '{"VAC": 160, "SICK": 80, "PERS": 40}');
