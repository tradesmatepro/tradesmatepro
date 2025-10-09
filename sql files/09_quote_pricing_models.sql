-- Quote pricing models support: schema hardening + milestones + recurring fields
-- Safe to run multiple times.

BEGIN;

-- 1) Ensure pricing_model has an allowed set
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='work_orders' AND constraint_name='work_orders_pricing_model_check'
  ) THEN
    ALTER TABLE public.work_orders
      ADD CONSTRAINT work_orders_pricing_model_check
      CHECK (pricing_model IN (
        'TIME_MATERIALS',
        'FLAT_RATE',
        'UNIT',
        'MILESTONE',
        'RECURRING',
        'PERCENTAGE'
      ));
  END IF;
END $$;

-- 2) Add supporting columns for percentage and recurring models
DO $$ BEGIN
  BEGIN
    ALTER TABLE public.work_orders ADD COLUMN percentage_base_amount numeric; -- for PERCENTAGE model
  EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN
    ALTER TABLE public.work_orders ADD COLUMN recurring_start_date date; -- for RECURRING model
  EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN
    ALTER TABLE public.work_orders ADD COLUMN recurring_end_date date; -- optional end date
  EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN
    ALTER TABLE public.work_orders ADD COLUMN recurring_custom_interval_days integer; -- when recurring_interval='CUSTOM'
  EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

-- 3) Constrain recurring_interval values (if present)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='work_orders' AND column_name='recurring_interval'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_name='work_orders' AND constraint_name='work_orders_recurring_interval_check'
    ) THEN
      ALTER TABLE public.work_orders
        ADD CONSTRAINT work_orders_recurring_interval_check
        CHECK (recurring_interval IS NULL OR recurring_interval IN ('MONTHLY','QUARTERLY','YEARLY','CUSTOM'));
    END IF;
  END IF;
END $$;

-- 4) Milestones table for MILESTONE model
CREATE TABLE IF NOT EXISTS public.work_order_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  company_id uuid NOT NULL,
  name text NOT NULL,
  -- Either amount OR percentage must be provided (but not both)
  amount numeric,
  percentage numeric,
  sort_order integer NOT NULL DEFAULT 0,
  due_date date,
  required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT work_order_milestones_amount_or_percentage_chk CHECK (
    (amount IS NOT NULL AND percentage IS NULL) OR (amount IS NULL AND percentage IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS wom_work_order_idx ON public.work_order_milestones (work_order_id);
CREATE INDEX IF NOT EXISTS wom_company_idx ON public.work_order_milestones (company_id);
CREATE INDEX IF NOT EXISTS wom_sort_idx ON public.work_order_milestones (work_order_id, sort_order);

-- 5) Harden item types for time & materials (optional but recommended)
--    Keep your existing data but constrain new writes to known values
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='work_order_items' AND constraint_name='work_order_items_type_check'
  ) THEN
    ALTER TABLE public.work_order_items
      ADD CONSTRAINT work_order_items_type_check
      CHECK (item_type IN ('labor','material','part','fee','discount'));
  END IF;
END $$;

COMMIT;

