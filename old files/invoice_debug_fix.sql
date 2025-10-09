-- ============================================================================
-- INVOICE STATUS DEBUG & FIX - FIND THE REAL PROBLEM
-- ============================================================================
-- The row shows status='DRAFT' but constraint fails
-- This means: wrong constraint syntax, data type issue, or hidden characters
-- ============================================================================

-- Step 1: Check the EXACT constraint definition
SELECT 
    conname,
    conrelid::regclass as table_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%invoices%status%' OR conrelid = 'invoices'::regclass;

-- Step 2: Check the column data type
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'invoices' AND column_name = 'status';

-- Step 3: Check for ENUM type (this might be the issue)
SELECT 
    t.typname,
    e.enumlabel
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname LIKE '%status%' OR t.typname LIKE '%invoice%';

-- Step 4: Get the EXACT status value with all details
SELECT 
    id,
    status,
    LENGTH(status) as len,
    ascii(status) as first_char,
    ascii(substring(status from length(status))) as last_char,
    status::text = 'DRAFT' as equals_draft,
    status IN ('DRAFT','SENT','PAID','VOID') as in_allowed_values
FROM invoices 
WHERE id = '09e2b2e5-5aaa-4383-a865-e35c40f901dc';

-- ============================================================================
-- SOLUTION 1: If it's an ENUM type issue
-- ============================================================================

-- Drop the constraint completely first
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;

-- If status column is an ENUM, we need to change the ENUM values, not add a CHECK constraint
-- Check if status is an ENUM:
SELECT 
    column_name,
    udt_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'invoices' AND column_name = 'status';

-- If it shows udt_name as something like 'invoice_status_enum', then we need to:
-- 1. Add new enum values
-- 2. Update data 
-- 3. Remove old enum values

-- ============================================================================
-- SOLUTION 2: Force to TEXT type and add CHECK constraint
-- ============================================================================

-- Convert status column to TEXT if it's currently an ENUM
ALTER TABLE invoices ALTER COLUMN status TYPE TEXT;

-- Now set all values to DRAFT
UPDATE invoices SET status = 'DRAFT';

-- Verify
SELECT DISTINCT status FROM invoices;

-- Add the CHECK constraint (should work now)
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
CHECK (status IN ('DRAFT','SENT','PAID','VOID'));

-- ============================================================================
-- SOLUTION 3: If there are multiple status columns
-- ============================================================================

-- Check if there are multiple status-related columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'invoices' 
  AND column_name ILIKE '%status%';

-- ============================================================================
-- SOLUTION 4: Nuclear option - recreate the constraint properly
-- ============================================================================

-- Drop ALL constraints on invoices table
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'invoices'::regclass 
          AND contype = 'c'  -- check constraints only
    LOOP
        EXECUTE format('ALTER TABLE invoices DROP CONSTRAINT IF EXISTS %I', constraint_rec.conname);
        RAISE NOTICE 'Dropped constraint: %', constraint_rec.conname;
    END LOOP;
END $$;

-- Set all status values to DRAFT
UPDATE invoices SET status = 'DRAFT';

-- Add constraint with explicit casting
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
CHECK (status::text IN ('DRAFT','SENT','PAID','VOID'));

-- Final verification
SELECT 
    id,
    status,
    status::text IN ('DRAFT','SENT','PAID','VOID') as constraint_check
FROM invoices 
LIMIT 5;

-- ============================================================================
-- DIAGNOSTIC OUTPUT
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'INVOICE STATUS DEBUG COMPLETED';
    RAISE NOTICE 'Check the output above to identify:';
    RAISE NOTICE '1. Current constraint definition';
    RAISE NOTICE '2. Column data type (TEXT vs ENUM)';
    RAISE NOTICE '3. Exact status values and their properties';
    RAISE NOTICE '4. Whether constraint check passes for individual rows';
    RAISE NOTICE '============================================================================';
END $$;
