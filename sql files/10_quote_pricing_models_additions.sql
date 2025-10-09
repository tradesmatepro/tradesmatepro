-- Add missing fields for pricing model support
BEGIN;

DO $$ BEGIN
  BEGIN
    ALTER TABLE public.work_orders ADD COLUMN recurring_rate numeric; -- per-interval rate
  EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN
    ALTER TABLE public.work_orders ADD COLUMN milestone_base_amount numeric; -- base for percentage milestones
  EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

COMMIT;

