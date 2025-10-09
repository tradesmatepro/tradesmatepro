-- TradeMate Pro: Add labor_summary JSONB column to work_orders
-- Safe, idempotent migration

BEGIN;

ALTER TABLE public.work_orders
  ADD COLUMN IF NOT EXISTS labor_summary jsonb;

-- Optional: document the structure for future devs
COMMENT ON COLUMN public.work_orders.labor_summary IS 'JSON summary of quote/job labor: {"crew_size":int,"hours_per_day":number,"days":int,"regular_hours":number,"overtime_hours":number,"labor_subtotal":number}';

COMMIT;

