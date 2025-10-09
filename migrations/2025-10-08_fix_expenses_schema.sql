-- =====================================================
-- EXPENSES SCHEMA FIX
-- Date: 2025-10-08
-- Purpose: Fix expenses table schema and create missing tables
-- =====================================================

-- 1. Fix expenses table - add missing columns and rename mismatched ones
-- =====================================================

-- Add missing columns that code expects
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS vendor TEXT,
  ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reimbursable BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'draft' CHECK (approval_status IN ('draft', 'submitted', 'pending_approval', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS trip_category TEXT,
  ADD COLUMN IF NOT EXISTS odometer_start INTEGER,
  ADD COLUMN IF NOT EXISTS odometer_end INTEGER,
  ADD COLUMN IF NOT EXISTS business_purpose TEXT;

-- Migrate data from expense_date to date if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='expenses' AND column_name='expense_date'
  ) THEN
    UPDATE expenses SET date = expense_date WHERE date IS NULL AND expense_date IS NOT NULL;
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN expenses.date IS 'Expense date (replaces expense_date)';
COMMENT ON COLUMN expenses.category IS 'Expense category name (references expense_categories.name)';
COMMENT ON COLUMN expenses.vendor IS 'Vendor/merchant name';
COMMENT ON COLUMN expenses.tax_amount IS 'Tax amount for the expense';
COMMENT ON COLUMN expenses.project_id IS 'Optional link to work order/project';
COMMENT ON COLUMN expenses.reimbursable IS 'Whether expense is reimbursable to employee';
COMMENT ON COLUMN expenses.approval_status IS 'Approval workflow status';
COMMENT ON COLUMN expenses.trip_category IS 'For mileage expenses: trip category';
COMMENT ON COLUMN expenses.odometer_start IS 'For mileage expenses: starting odometer reading';
COMMENT ON COLUMN expenses.odometer_end IS 'For mileage expenses: ending odometer reading';
COMMENT ON COLUMN expenses.business_purpose IS 'For mileage expenses: business purpose of trip';

-- Update status column to use approval_status values if needed
UPDATE expenses 
SET approval_status = 
  CASE 
    WHEN status = 'pending' THEN 'pending_approval'
    WHEN status = 'approved' THEN 'approved'
    WHEN status = 'rejected' THEN 'rejected'
    ELSE 'draft'
  END
WHERE approval_status = 'draft' AND status IS NOT NULL;

-- 2. Create expense_categories table
-- =====================================================

CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, name)
);

CREATE INDEX IF NOT EXISTS idx_expense_categories_company ON expense_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_expense_categories_active ON expense_categories(company_id, is_active) WHERE is_active = true;

COMMENT ON TABLE expense_categories IS 'Expense categories for organizing business expenses';

-- Seed default expense categories for all companies
INSERT INTO expense_categories (company_id, name, description, sort_order)
SELECT 
  c.id,
  cat.name,
  cat.description,
  cat.sort_order
FROM companies c
CROSS JOIN (
  VALUES 
    ('Materials', 'Construction materials and supplies', 1),
    ('Labor', 'Labor costs and wages', 2),
    ('Equipment', 'Equipment rental and purchases', 3),
    ('Fuel', 'Vehicle fuel and gas', 4),
    ('Travel', 'Travel expenses and mileage', 5),
    ('Meals', 'Business meals and entertainment', 6),
    ('Permits', 'Permits and licenses', 7),
    ('Insurance', 'Insurance premiums', 8),
    ('Utilities', 'Utilities and services', 9),
    ('Office Supplies', 'Office supplies and equipment', 10),
    ('Marketing', 'Marketing and advertising', 11),
    ('Training', 'Training and education', 12),
    ('Subcontractors', 'Subcontractor payments', 13),
    ('Tools', 'Tools and small equipment', 14),
    ('Maintenance', 'Vehicle and equipment maintenance', 15),
    ('Other', 'Other miscellaneous expenses', 99)
) AS cat(name, description, sort_order)
ON CONFLICT (company_id, name) DO NOTHING;

-- 3. Create reimbursement_requests table
-- =====================================================

CREATE TABLE IF NOT EXISTS reimbursement_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reimbursement_requests_company ON reimbursement_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_reimbursement_requests_employee ON reimbursement_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_reimbursement_requests_status ON reimbursement_requests(company_id, status);
CREATE INDEX IF NOT EXISTS idx_reimbursement_requests_date ON reimbursement_requests(company_id, request_date DESC);

COMMENT ON TABLE reimbursement_requests IS 'Employee reimbursement requests for expenses';

-- 4. Create reimbursement_request_items junction table
-- =====================================================

CREATE TABLE IF NOT EXISTS reimbursement_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reimbursement_request_id UUID NOT NULL REFERENCES reimbursement_requests(id) ON DELETE CASCADE,
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(reimbursement_request_id, expense_id)
);

CREATE INDEX IF NOT EXISTS idx_reimbursement_items_request ON reimbursement_request_items(reimbursement_request_id);
CREATE INDEX IF NOT EXISTS idx_reimbursement_items_expense ON reimbursement_request_items(expense_id);

COMMENT ON TABLE reimbursement_request_items IS 'Links expenses to reimbursement requests';

-- 5. Add indexes for better query performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_expenses_company_date ON expenses(company_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(company_id, category);
CREATE INDEX IF NOT EXISTS idx_expenses_approval_status ON expenses(company_id, approval_status);
CREATE INDEX IF NOT EXISTS idx_expenses_reimbursable ON expenses(company_id, reimbursable) WHERE reimbursable = true;
CREATE INDEX IF NOT EXISTS idx_expenses_project ON expenses(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_employee ON expenses(employee_id) WHERE employee_id IS NOT NULL;

-- 6. Verification
-- =====================================================

DO $$
DECLARE
  missing_cols TEXT[] := ARRAY[]::TEXT[];
  missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check expenses columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='expenses' AND column_name='date') THEN
    missing_cols := array_append(missing_cols, 'expenses.date');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='expenses' AND column_name='category') THEN
    missing_cols := array_append(missing_cols, 'expenses.category');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='expenses' AND column_name='vendor') THEN
    missing_cols := array_append(missing_cols, 'expenses.vendor');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='expenses' AND column_name='reimbursable') THEN
    missing_cols := array_append(missing_cols, 'expenses.reimbursable');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='expenses' AND column_name='approval_status') THEN
    missing_cols := array_append(missing_cols, 'expenses.approval_status');
  END IF;

  -- Check tables
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='expense_categories') THEN
    missing_tables := array_append(missing_tables, 'expense_categories');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='reimbursement_requests') THEN
    missing_tables := array_append(missing_tables, 'reimbursement_requests');
  END IF;

  -- Report
  IF array_length(missing_cols, 1) > 0 THEN
    RAISE WARNING 'Still missing columns: %', array_to_string(missing_cols, ', ');
  ELSE
    RAISE NOTICE '✅ All required expenses columns exist';
  END IF;

  IF array_length(missing_tables, 1) > 0 THEN
    RAISE WARNING 'Still missing tables: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE '✅ All required tables exist';
  END IF;
END $$;

-- Show category count
DO $$
DECLARE
  cat_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cat_count FROM expense_categories;
  RAISE NOTICE '✅ % expense categories seeded', cat_count;
END $$;

