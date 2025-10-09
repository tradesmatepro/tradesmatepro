-- Add an optional updated_by column to customers to satisfy any triggers/functions referencing NEW.updated_by
-- Safe to run multiple times.

BEGIN;

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS updated_by uuid;

-- Optional: default to NULL (explicit)
ALTER TABLE public.customers
  ALTER COLUMN updated_by DROP DEFAULT;

COMMIT;

