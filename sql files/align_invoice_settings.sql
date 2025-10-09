-- Align invoice-related fields to the `settings` table
-- Run this in Supabase SQL

-- 1) Ensure columns exist on settings
alter table if exists settings add column if not exists invoice_prefix text default 'INV-';
alter table if exists settings add column if not exists next_invoice_number integer default 1001;
-- default_invoice_terms and default_invoice_due_days already exist in your schema.csv

-- 2) Optional: Backfill from company_settings if present (one-time best-effort)
-- This assumes one row per company_id in company_settings
update settings s
set
  default_invoice_terms = coalesce(cs.default_invoice_terms, s.default_invoice_terms),
  default_invoice_due_days = coalesce(cs.default_invoice_due_days, s.default_invoice_due_days)
from company_settings cs
where cs.company_id = s.company_id;

-- Note: business_settings does not contain invoice_prefix/sequence or invoice terms/days in your schema.
-- If you previously stored invoice_prefix/next_invoice_number elsewhere, let me know and I’ll add a backfill.

