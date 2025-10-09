-- 1) Add the custom days column if missing
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS default_invoice_due_days integer;

-- 2) Ensure it’s non-negative (constraint added once)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ck_company_settings_default_invoice_due_days_nonneg'
  ) THEN
    ALTER TABLE company_settings
      ADD CONSTRAINT ck_company_settings_default_invoice_due_days_nonneg
      CHECK (default_invoice_due_days IS NULL OR default_invoice_due_days >= 0);
  END IF;
END $$;

-- 3) Restrict terms to allowed values (keep column type as text)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ck_company_settings_default_invoice_terms_allowed'
  ) THEN
    ALTER TABLE company_settings
      ADD CONSTRAINT ck_company_settings_default_invoice_terms_allowed
      CHECK (default_invoice_terms IN (
        'DUE_ON_RECEIPT','NET_7','NET_15','NET_30','NET_45','NET_60','CUSTOM'
      ));
  END IF;
END $$;

-- 4) Sensible default/backfill for CUSTOM rows without a value (optional)
UPDATE company_settings
SET default_invoice_due_days = 14
WHERE default_invoice_terms = 'CUSTOM'
  AND default_invoice_due_days IS NULL;