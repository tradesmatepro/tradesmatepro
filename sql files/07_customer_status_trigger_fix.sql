-- Fix customer status trigger: remove dependency on non-existent updated_by column
BEGIN;

-- Drop existing trigger and function if present
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_log_customer_status_change') THEN
    DROP TRIGGER trg_log_customer_status_change ON public.customers;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'log_customer_status_change' AND pronamespace = 'public'::regnamespace
  ) THEN
    DROP FUNCTION public.log_customer_status_change();
  END IF;
END $$;

-- Recreate function without NEW.updated_by
CREATE OR REPLACE FUNCTION public.log_customer_status_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.customers_status_history (customer_id, from_status, to_status, reason, changed_by)
    VALUES (NEW.id, LOWER(OLD.status), LOWER(NEW.status), COALESCE(NEW.status_reason, OLD.status_reason), NULL);
    NEW.status_changed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER trg_log_customer_status_change
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.log_customer_status_change();

COMMIT;

