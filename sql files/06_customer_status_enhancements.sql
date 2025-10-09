-- Customer status enhancements: richer statuses, audit history, and metadata
-- Safe to run multiple times.

BEGIN;

-- 1) Normalize existing statuses to lowercase and default to 'active' when null/empty
UPDATE public.customers
SET status = COALESCE(NULLIF(LOWER(status), ''), 'active');

-- 2) Add metadata columns if missing
DO $$ BEGIN
  BEGIN
    ALTER TABLE public.customers ADD COLUMN status_reason text;
  EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN
    ALTER TABLE public.customers ADD COLUMN status_changed_at timestamptz;
  EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

-- 3) Add a CHECK constraint for allowed statuses (use lowercase)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'customers_status_check' AND table_name = 'customers'
  ) THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_status_check
      CHECK (status IN ('active','inactive','suspended','credit_hold','do_not_service'));
  END IF;
END $$;

-- 4) Status history table
CREATE TABLE IF NOT EXISTS public.customers_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  reason text,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customers_status_history_customer_idx ON public.customers_status_history (customer_id);
CREATE INDEX IF NOT EXISTS customers_status_history_changed_at_idx ON public.customers_status_history (changed_at);

-- 5) Trigger to record history and set status_changed_at
CREATE OR REPLACE FUNCTION public.log_customer_status_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.customers_status_history (customer_id, from_status, to_status, reason, changed_by)
    VALUES (NEW.id, LOWER(OLD.status), LOWER(NEW.status), COALESCE(NEW.status_reason, OLD.status_reason), NEW.updated_by);
    NEW.status_changed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_log_customer_status_change'
  ) THEN
    CREATE TRIGGER trg_log_customer_status_change
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.log_customer_status_change();
  END IF;
END $$;

COMMIT;

