-- Expense approvals wiring that does not require storage ownership
-- Date: 2025-10-08

-- 1) Documents table RLS (metadata about uploaded files)
ALTER TABLE IF EXISTS documents ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='documents-company-access'
  ) THEN
    DROP POLICY "documents-company-access" ON documents;
  END IF;
END $$;
CREATE POLICY "documents-company-access"
ON documents FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e WHERE e.user_id = auth.uid() AND e.company_id = documents.company_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e WHERE e.user_id = auth.uid() AND e.company_id = documents.company_id
  )
);

-- 2) Expenses.created_by and trigger (to know requester)
ALTER TABLE IF EXISTS expenses ADD COLUMN IF NOT EXISTS created_by UUID;

CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS trigger AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_expenses_set_created_by'
  ) THEN
    CREATE TRIGGER trg_expenses_set_created_by
    BEFORE INSERT ON expenses
    FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
  END IF;
END $$;

-- 3) Expense approvals RLS and helper function
ALTER TABLE IF EXISTS expense_approvals ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='expense_approvals' AND policyname='expense-approvals-company-access'
  ) THEN
    DROP POLICY "expense-approvals-company-access" ON expense_approvals;
  END IF;
END $$;
CREATE POLICY "expense-approvals-company-access"
ON expense_approvals FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM expenses x
    JOIN employees e ON e.company_id = x.company_id AND e.user_id = auth.uid()
    WHERE x.id = expense_approvals.expense_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM expenses x
    JOIN employees e ON e.company_id = x.company_id AND e.user_id = auth.uid()
    WHERE x.id = expense_approvals.expense_id
  )
);

-- Ensure employees.manager_id exists for hierarchy
ALTER TABLE IF EXISTS employees ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES employees(id) ON DELETE SET NULL;

-- RPC: create_initial_expense_approval(expense_id)
CREATE OR REPLACE FUNCTION public.create_initial_expense_approval(p_expense_id UUID)
RETURNS UUID AS $$
DECLARE
  v_company_id UUID;
  v_requester UUID;
  v_manager_employee_id UUID;
  v_manager_user_id UUID;
  v_new_id UUID;
BEGIN
  SELECT company_id, created_by INTO v_company_id, v_requester
  FROM expenses WHERE id = p_expense_id;

  -- Find direct manager via employees hierarchy
  SELECT e2.id, e2.user_id INTO v_manager_employee_id, v_manager_user_id
  FROM employees e1
  JOIN employees e2 ON e2.id = e1.manager_id
  WHERE e1.user_id = COALESCE(v_requester, auth.uid()) AND e1.company_id = v_company_id
  LIMIT 1;

  INSERT INTO expense_approvals(company_id, expense_id, requester_id, approver_id, status)
  VALUES (v_company_id, p_expense_id, COALESCE(v_requester, auth.uid()), v_manager_user_id, 'pending')
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

