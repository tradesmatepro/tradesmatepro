-- ===============================================
-- Expenses Storage & Workflow
-- Date: 2025-10-08
-- ===============================================

-- 1) Ensure storage bucket for company files exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'company-files'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('company-files', 'company-files', true);
  END IF;
END $$;

-- 2) Documents table to record uploads (if missing)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  linked_to UUID,
  type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);
-- Ensure expected columns exist on existing documents table
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS company_id UUID,
  ADD COLUMN IF NOT EXISTS linked_to UUID,
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_size BIGINT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_by UUID,
  ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ;

-- Add FK if not present (will be ignored if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_name = 'documents' AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE documents
      ADD CONSTRAINT documents_company_fk FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_linked_company ON documents(company_id, linked_to);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(company_id, type);

-- 3) Entry type for expenses (receipt vs mileage vs per diem vs corporate card)
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS entry_type TEXT DEFAULT 'receipt' CHECK (entry_type IN ('receipt','mileage','per_diem','corporate_card'));

-- Backfill nulls
UPDATE expenses SET entry_type = 'receipt' WHERE entry_type IS NULL;

COMMENT ON COLUMN expenses.entry_type IS 'UX-level type of expense entry (receipt, mileage, per_diem, corporate_card)';

-- 4) Basic approvals table for expenses
CREATE TABLE IF NOT EXISTS expense_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  requester_id UUID,
  approver_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  notes TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expense_approvals_company ON expense_approvals(company_id);
CREATE INDEX IF NOT EXISTS idx_expense_approvals_status ON expense_approvals(company_id, status);
CREATE INDEX IF NOT EXISTS idx_expense_approvals_expense ON expense_approvals(expense_id);

-- 5) Verification notices
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'company-files') THEN
    RAISE NOTICE '✅ Storage bucket company-files exists';
  ELSE
    RAISE WARNING '❌ Storage bucket company-files missing';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='expenses' AND column_name='entry_type') THEN
    RAISE NOTICE '✅ expenses.entry_type column exists';
  ELSE
    RAISE WARNING '❌ expenses.entry_type column missing';
  END IF;
END $$;

