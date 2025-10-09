-- =============================================================
-- FIXED SCHEMA STANDARDIZATION MIGRATION
-- Purpose: Remove legacy status columns, enums, functions, views
--          and standardize on a unified work_order_status_enum
-- FIXES: Correct order of operations to avoid dependency errors
-- =============================================================

-- SAFETY: Check current status values first
DO $$
DECLARE
    status_values text[];
BEGIN
    -- Get all current status values
    SELECT array_agg(DISTINCT status) INTO status_values FROM work_orders;
    RAISE NOTICE 'Current work_orders.status values: %', status_values;
END $$;

BEGIN;

-- =============================================================
-- 1. FIRST: Drop Views (to unlock column changes)
-- =============================================================

-- Drop views that depend on work_orders.status column
DROP VIEW IF EXISTS quotes CASCADE;
DROP VIEW IF EXISTS jobs_with_payment_status CASCADE;
DROP VIEW IF EXISTS work_orders_history CASCADE;

-- =============================================================
-- 2. Create New Enum (before altering columns)
-- =============================================================

-- Create the unified enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_order_status_enum') THEN
        CREATE TYPE work_order_status_enum AS ENUM (
            'DRAFT',
            'QUOTE', 
            'SENT',
            'ACCEPTED',
            'REJECTED',
            'SCHEDULED',
            'IN_PROGRESS',
            'COMPLETED',
            'CANCELLED',
            'INVOICED'
        );
        RAISE NOTICE 'Created work_order_status_enum';
    END IF;
END $$;

-- =============================================================
-- 3. NOW: Convert work_orders.status to enum (views are gone)
-- =============================================================

-- Convert status column to enum (now safe - no views depend on it)
DO $$
BEGIN
    -- Check if conversion is possible
    PERFORM status::text::work_order_status_enum FROM work_orders LIMIT 1;
    
    -- If we get here, conversion is safe
    ALTER TABLE work_orders
        ALTER COLUMN status DROP DEFAULT,
        ALTER COLUMN status TYPE work_order_status_enum USING status::text::work_order_status_enum,
        ALTER COLUMN status SET DEFAULT 'DRAFT';
        
    RAISE NOTICE 'Successfully converted work_orders.status to enum';
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Cannot convert status values to enum. Current values: %. Error: %', 
            (SELECT array_agg(DISTINCT status) FROM work_orders), SQLERRM;
END $$;

-- =============================================================
-- 4. Drop Legacy Functions (that reference old patterns)
-- =============================================================

-- Only drop functions that actually exist and are problematic
DO $$
BEGIN
    -- Check and drop legacy functions
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'promote_quote_to_job') THEN
        DROP FUNCTION promote_quote_to_job CASCADE;
        RAISE NOTICE 'Dropped promote_quote_to_job';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'demote_job_to_quote') THEN
        DROP FUNCTION demote_job_to_quote CASCADE;
        RAISE NOTICE 'Dropped demote_job_to_quote';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'promote_job_to_work_order') THEN
        DROP FUNCTION promote_job_to_work_order CASCADE;
        RAISE NOTICE 'Dropped promote_job_to_work_order';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'demote_work_order_to_job') THEN
        DROP FUNCTION demote_work_order_to_job CASCADE;
        RAISE NOTICE 'Dropped demote_work_order_to_job';
    END IF;
END $$;

-- =============================================================
-- 5. Create New Unified Functions
-- =============================================================

-- Unified status change function
CREATE OR REPLACE FUNCTION public.wo_change_status(
    p_id uuid, 
    p_to work_order_status_enum, 
    p_reason text DEFAULT NULL
)
RETURNS work_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
    rec work_orders;
    old_status work_order_status_enum;
BEGIN
    -- Get current status
    SELECT status INTO old_status FROM work_orders WHERE id = p_id;
    
    -- Update status
    UPDATE work_orders
    SET status = p_to,
        updated_at = now()
    WHERE id = p_id
    RETURNING * INTO rec;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'work order % not found', p_id;
    END IF;

    -- Log the change if audit table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'work_order_audit_log') THEN
        INSERT INTO work_order_audit_log(work_order_id, company_id, action, old_status, new_status, details)
        VALUES (
            rec.id,
            rec.company_id,
            'STATUS_CHANGE',
            old_status::text,
            p_to::text,
            jsonb_build_object('reason', p_reason, 'changed_at', now())
        );
    END IF;

    RETURN rec;
END;
$$;

-- =============================================================
-- 6. Recreate Views (now with clean enum-based status)
-- =============================================================

-- Rebuild quotes view
CREATE OR REPLACE VIEW quotes AS
SELECT *
FROM work_orders
WHERE stage = 'QUOTE';

-- Rebuild jobs view  
CREATE OR REPLACE VIEW jobs_with_payment_status AS
SELECT 
    wo.*,
    CASE 
        WHEN wo.amount_paid >= wo.total_amount THEN 'PAID'
        WHEN wo.amount_paid > 0 THEN 'PARTIAL'
        WHEN wo.due_date < NOW() THEN 'OVERDUE'
        ELSE 'PENDING'
    END as payment_status
FROM work_orders wo
WHERE stage IN ('JOB', 'WORK_ORDER');

-- Simple history view
CREATE OR REPLACE VIEW work_orders_history AS
SELECT 
    id, company_id, customer_id, status, stage, title, total_amount, 
    created_at, updated_at, completed_at
FROM work_orders
ORDER BY updated_at DESC;

-- =============================================================
-- 7. LAST: Drop Legacy Enums (after everything is converted)
-- =============================================================

-- Now safe to drop legacy enums since nothing depends on them
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_status_enum') THEN
        DROP TYPE quote_status_enum CASCADE;
        RAISE NOTICE 'Dropped quote_status_enum';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status_enum') THEN
        DROP TYPE job_status_enum CASCADE;
        RAISE NOTICE 'Dropped job_status_enum';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_status_enum') THEN
        DROP TYPE work_status_enum CASCADE;
        RAISE NOTICE 'Dropped work_status_enum';
    END IF;
    
    -- Keep payment_status_enum - it's used by invoices table
    -- IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
    --     DROP TYPE payment_status_enum CASCADE;
    --     RAISE NOTICE 'Dropped payment_status_enum';
    -- END IF;
END $$;

-- =============================================================
-- 8. Verification
-- =============================================================

-- Verify the migration worked
DO $$
DECLARE
    status_count integer;
    enum_exists boolean;
BEGIN
    -- Check if enum exists
    SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_order_status_enum') INTO enum_exists;
    
    -- Count work orders
    SELECT COUNT(*) INTO status_count FROM work_orders;
    
    RAISE NOTICE 'Migration complete. Enum exists: %, Work orders: %', enum_exists, status_count;
    
    -- Show current status distribution
    FOR rec IN SELECT status, COUNT(*) as count FROM work_orders GROUP BY status ORDER BY status LOOP
        RAISE NOTICE 'Status %: % records', rec.status, rec.count;
    END LOOP;
END $$;

COMMIT;

-- =============================================================
-- ROLLBACK PLAN (if needed)
-- =============================================================
/*
-- If something goes wrong, run this:
BEGIN;
-- Recreate old views
CREATE OR REPLACE VIEW quotes AS SELECT * FROM work_orders WHERE stage = 'QUOTE';
-- Convert status back to text
ALTER TABLE work_orders ALTER COLUMN status TYPE text;
-- Drop new enum
DROP TYPE IF EXISTS work_order_status_enum CASCADE;
COMMIT;
*/
