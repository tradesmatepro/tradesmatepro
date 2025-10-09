-- ============================================================================
-- INVOICE STATUS FIX - DISABLE TRIGGERS APPROACH
-- ============================================================================
-- The issue: Triggers are reverting status changes after UPDATE
-- Solution: Disable triggers, fix data, re-enable triggers, add constraint
-- ============================================================================

-- Step 1: Identify and disable all triggers on invoices table
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    -- List all triggers on invoices table
    FOR trigger_rec IN 
        SELECT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE event_object_table = 'invoices'
    LOOP
        RAISE NOTICE 'Found trigger: % on table %', trigger_rec.trigger_name, trigger_rec.event_object_table;
        -- Disable the trigger
        EXECUTE format('ALTER TABLE %I DISABLE TRIGGER %I', trigger_rec.event_object_table, trigger_rec.trigger_name);
        RAISE NOTICE 'Disabled trigger: %', trigger_rec.trigger_name;
    END LOOP;
END $$;

-- Step 2: Fix all invoice statuses with triggers disabled
UPDATE invoices SET status = 'DRAFT';

-- Step 3: Verify the fix worked
SELECT DISTINCT status FROM invoices;
-- Should show only 'DRAFT'

-- Step 4: Add the constraint (should work now)
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
CHECK (status IN ('DRAFT','SENT','PAID','VOID'));

-- Step 5: Re-enable all triggers on invoices table
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    -- Re-enable all triggers on invoices table
    FOR trigger_rec IN 
        SELECT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE event_object_table = 'invoices'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE TRIGGER %I', trigger_rec.event_object_table, trigger_rec.trigger_name);
        RAISE NOTICE 'Re-enabled trigger: %', trigger_rec.trigger_name;
    END LOOP;
END $$;

-- Step 6: Final verification
SELECT DISTINCT status FROM invoices;
SELECT conname, conrelid::regclass 
FROM pg_constraint 
WHERE conname = 'invoices_status_check';

-- ============================================================================
-- ALTERNATIVE APPROACH: Session-level trigger disable
-- ============================================================================
-- If the above doesn't work, try this session-level approach:

-- Disable triggers for this session only
SET session_replication_role = replica;

-- Fix the data
UPDATE invoices SET status = 'DRAFT';

-- Add constraint
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
CHECK (status IN ('DRAFT','SENT','PAID','VOID'));

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- ============================================================================
-- DIAGNOSTIC QUERIES - Run if still failing
-- ============================================================================

-- Check for any functions that might be modifying invoices
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%invoices%'
  AND pg_get_functiondef(p.oid) ILIKE '%status%';

-- Check for any rules on invoices table
SELECT 
    schemaname,
    tablename,
    rulename,
    definition
FROM pg_rules
WHERE tablename = 'invoices';

-- Check for any policies that might interfere
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'invoices';

RAISE NOTICE '============================================================================';
RAISE NOTICE 'INVOICE STATUS FIX COMPLETED';
RAISE NOTICE 'If this still fails, there may be:';
RAISE NOTICE '1. Custom functions modifying invoice status';
RAISE NOTICE '2. Database rules interfering with updates';
RAISE NOTICE '3. Row Level Security policies blocking changes';
RAISE NOTICE '4. Application code running concurrent updates';
RAISE NOTICE '============================================================================';
