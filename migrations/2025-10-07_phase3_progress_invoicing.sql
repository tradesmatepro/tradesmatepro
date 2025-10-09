-- Phase 3: Progress/Partial Invoicing groundwork
-- Idempotent DDL

-- 1) Invoice kind: standard, deposit, progress, final
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_kind_enum') THEN
    CREATE TYPE invoice_kind_enum AS ENUM ('standard','deposit','progress','final');
  END IF;
END$$;

ALTER TABLE if exists invoices
  ADD COLUMN IF NOT EXISTS kind invoice_kind_enum DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS parent_invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS progress_basis text, -- 'percent' | 'amount'
  ADD COLUMN IF NOT EXISTS progress_percent numeric(5,2),
  ADD COLUMN IF NOT EXISTS progress_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS deposit_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS computed_balance numeric(12,2);

CREATE INDEX IF NOT EXISTS idx_invoices_parent ON invoices(parent_invoice_id);

-- 2) Link work order to initial invoice (if not present already)
ALTER TABLE IF EXISTS work_orders
  ADD COLUMN IF NOT EXISTS initial_invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL;

-- 3) Optional ledger to record progress steps (simple for now)
CREATE TABLE IF NOT EXISTS invoice_progress_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  entry_type text NOT NULL, -- 'deposit' | 'progress' | 'adjustment'
  percent numeric(5,2),
  amount numeric(12,2),
  note text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_progress_ledger_invoice ON invoice_progress_ledger(invoice_id);

