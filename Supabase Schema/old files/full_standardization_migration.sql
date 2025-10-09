-- =============================================================
-- FULL SCHEMA STANDARDIZATION MIGRATION
-- Purpose: Remove legacy status columns, enums, functions, views
--          and standardize on a unified work_order_status_enum
-- =============================================================

BEGIN;

-- =============================================================
-- 1. Legacy Enum Cleanup
-- =============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_status_enum') THEN
        DROP TYPE quote_status_enum CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status_enum') THEN
        DROP TYPE job_status_enum CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_status_enum') THEN
        DROP TYPE work_status_enum CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        DROP TYPE payment_status_enum CASCADE;
    END IF;
END $$;

-- =============================================================
-- 2. Work Orders Table Fix
-- =============================================================

-- Ensure enum exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_order_status_enum') THEN
        CREATE TYPE work_order_status_enum AS ENUM (
            'QUOTE',
            'ACCEPTED',
            'SCHEDULED',
            'IN_PROGRESS',
            'COMPLETED',
            'CANCELLED',
            'INVOICED'
        );
    END IF;
END $$;

-- Drop legacy columns safely
ALTER TABLE work_orders DROP COLUMN IF EXISTS quote_status CASCADE;
ALTER TABLE work_orders DROP COLUMN IF EXISTS job_status CASCADE;
ALTER TABLE work_orders DROP COLUMN IF EXISTS work_status CASCADE;
ALTER TABLE work_orders DROP COLUMN IF EXISTS payment_status CASCADE;

-- Convert unified status to enum
ALTER TABLE work_orders
    ALTER COLUMN status DROP DEFAULT,
    ALTER COLUMN status TYPE work_order_status_enum USING status::text::work_order_status_enum,
    ALTER COLUMN status SET DEFAULT 'QUOTE';

-- =============================================================
-- 3. Views Cleanup + Rebuild
-- =============================================================

DROP VIEW IF EXISTS quotes CASCADE;
DROP VIEW IF EXISTS jobs_with_payment_status CASCADE;
DROP VIEW IF EXISTS work_orders_history CASCADE;

-- Rebuild simplified views
CREATE OR REPLACE VIEW quotes AS
SELECT *
FROM work_orders
WHERE stage = 'QUOTE';

CREATE OR REPLACE VIEW jobs_with_payment_status AS
SELECT *
FROM work_orders
WHERE stage = 'JOB';

CREATE OR REPLACE VIEW work_orders_history AS
SELECT *
FROM work_orders;

-- =============================================================
-- 4. Function Rewrite (unified on status)
-- =============================================================

CREATE OR REPLACE FUNCTION public.wo_change_status(p_id uuid, p_to work_order_status_enum, p_reason text DEFAULT NULL)
RETURNS work_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
    rec work_orders;
BEGIN
    UPDATE work_orders
    SET status = p_to,
        updated_at = now()
    WHERE id = p_id
    RETURNING * INTO rec;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'work order % not found', p_id;
    END IF;

    -- Optional: Audit log
    INSERT INTO work_order_audit_log(work_order_id, company_id, action, old_status, new_status, details)
    VALUES (
        rec.id,
        rec.company_id,
        'STATUS_CHANGE',
        rec.status::text,
        p_to::text,
        jsonb_build_object('reason', p_reason)
    );

    RETURN rec;
END;
$$;

-- Drop/replace other legacy functions that referenced old status columns
DROP FUNCTION IF EXISTS promote_quote_to_job CASCADE;
DROP FUNCTION IF EXISTS demote_job_to_quote CASCADE;
DROP FUNCTION IF EXISTS promote_job_to_work_order CASCADE;
DROP FUNCTION IF EXISTS demote_work_order_to_job CASCADE;
DROP FUNCTION IF EXISTS cancel_job CASCADE;
DROP FUNCTION IF EXISTS count_closed_jobs CASCADE;
DROP FUNCTION IF EXISTS get_closed_jobs CASCADE;

-- =============================================================
-- 5. Trigger Alignment
-- =============================================================

-- Rebuild log trigger
CREATE OR REPLACE FUNCTION public.log_work_order_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO work_order_audit_log(work_order_id, company_id, action, old_status, new_status, details)
    VALUES (
      NEW.id,
      NEW.company_id,
      'STATUS_CHANGE',
      OLD.status::text,
      NEW.status::text,
      jsonb_build_object('stage', NEW.stage)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Reattach trigger
DROP TRIGGER IF EXISTS trg_log_work_order_change ON work_orders;
CREATE TRIGGER trg_log_work_order_change
AFTER UPDATE ON work_orders
FOR EACH ROW
EXECUTE FUNCTION log_work_order_change();

-- =============================================================
-- 6. Calendar + Schedule Events
-- =============================================================

CREATE OR REPLACE FUNCTION public.sync_schedule_events()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.schedule_events (
      company_id, work_order_id, title, description, start_time, end_time,
      employee_id, customer_id, event_type, status, created_at, updated_at
  )
  SELECT
      wo.company_id,
      wo.id,
      COALESCE(wo.title, 'Work Order #' || wo.id::text),
      wo.description,
      COALESCE(wo.start_time, NOW() + INTERVAL '1 day'),
      COALESCE(wo.end_time, NOW() + INTERVAL '2 hours'),
      wo.assigned_technician_id,
      wo.customer_id,
      'work_order',
      wo.status::text,
      NOW(), NOW()
  FROM public.work_orders wo
  WHERE NOT EXISTS (
      SELECT 1 FROM public.schedule_events se WHERE se.work_order_id = wo.id
  );
END;
$$;

-- =============================================================
-- 7. Audit + History Tables
-- =============================================================

-- Standardize audit table to use unified status
ALTER TABLE work_order_audit_log
    ALTER COLUMN old_status TYPE work_order_status_enum USING old_status::text::work_order_status_enum,
    ALTER COLUMN new_status TYPE work_order_status_enum USING new_status::text::work_order_status_enum;

-- =============================================================
-- 8. Remove Dead Enums / Functions
-- =============================================================

DROP FUNCTION IF EXISTS quote_ident CASCADE;
DROP FUNCTION IF EXISTS quote_literal CASCADE;
DROP FUNCTION IF EXISTS quote_nullable CASCADE;
DROP FUNCTION IF EXISTS quote_wal2json CASCADE;

-- =============================================================
-- 9. Test + Data Seeding (minimal)
-- =============================================================

-- Insert one clean company + work order
INSERT INTO companies (id, name, created_at)
VALUES (gen_random_uuid(), 'Test Company', now())
ON CONFLICT DO NOTHING;

-- END OF MIGRATION
COMMIT;
