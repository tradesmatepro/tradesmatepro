-- Org & Approvals settings schema
-- Date: 2025-10-08

-- Company-level approvals settings
CREATE TABLE IF NOT EXISTS approval_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  -- thresholds (amount in company currency)
  level2_threshold NUMERIC(12,2) DEFAULT 500.00, -- above this requires manager's manager
  level3_threshold NUMERIC(12,2) DEFAULT 2000.00, -- above this requires next level
  finance_required_card BOOLEAN DEFAULT true,
  auto_escalate_days INTEGER DEFAULT 3,
  allow_delegate BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id)
);

CREATE TABLE IF NOT EXISTS employee_delegates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  delegate_employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  valid_from DATE,
  valid_to DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Basic updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_approval_settings_updated_at'
  ) THEN
    CREATE TRIGGER trg_approval_settings_updated_at
    BEFORE UPDATE ON approval_settings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

