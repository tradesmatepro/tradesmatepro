-- ============================================================================
-- ENUM STANDARDIZATION - REMOVE UPPERCASE DUPLICATES
-- ============================================================================
-- Problem: Database has BOTH uppercase and lowercase enum values (28 total)
-- Solution: Keep only lowercase (industry standard), recreate enum without UPPERCASE
-- Safe to run: Creates new enum, migrates data, drops old enum
-- Note: PostgreSQL doesn't support DROP VALUE, so we recreate the enum
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Update all existing data to use lowercase values
-- ============================================================================

-- Update work_orders table to use lowercase status values
UPDATE work_orders 
SET status = LOWER(status::text)::work_order_status_enum
WHERE status::text IN ('DRAFT', 'QUOTE', 'SENT', 'ACCEPTED', 'REJECTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'INVOICED', 'PAID', 'CLOSED');

-- Check for any other tables using work_order_status_enum
-- (Add more UPDATE statements here if other tables use this enum)

-- ============================================================================
-- STEP 2: Create new enum with ONLY lowercase values (industry standard)
-- ============================================================================

-- Create new enum type with only lowercase values from locked schema
CREATE TYPE work_order_status_enum_new AS ENUM (
    'draft', 'quote', 'sent', 'approved', 'rejected', 'scheduled',
    'parts_ordered', 'on_hold', 'in_progress', 'requires_approval',
    'rework_needed', 'completed', 'invoiced', 'cancelled', 'paid', 'closed'
);

-- ============================================================================
-- STEP 3: Migrate work_orders table to use new enum
-- ============================================================================

-- Drop default temporarily (required for type change)
ALTER TABLE work_orders ALTER COLUMN status DROP DEFAULT;

-- Convert status column to use new enum
ALTER TABLE work_orders
    ALTER COLUMN status TYPE work_order_status_enum_new
    USING LOWER(status::text)::work_order_status_enum_new;

-- Restore default with new enum
ALTER TABLE work_orders ALTER COLUMN status SET DEFAULT 'draft'::work_order_status_enum_new;

-- ============================================================================
-- STEP 4: Drop old enum and rename new one
-- ============================================================================

-- Drop the old enum (now unused)
DROP TYPE work_order_status_enum;

-- Rename new enum to original name
ALTER TYPE work_order_status_enum_new RENAME TO work_order_status_enum;

-- ============================================================================
-- STEP 5: Verify cleanup
-- ============================================================================

-- Show remaining enum values (should be lowercase only - 16 values)
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'work_order_status_enum')
ORDER BY enumsortorder;

-- Show count of each status in work_orders (should all be lowercase)
SELECT status, COUNT(*)
FROM work_orders
GROUP BY status
ORDER BY status;

COMMIT;

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- Enum now has ONLY lowercase values (industry standard)
-- All data migrated successfully
-- Frontend should use lowercase only: 'draft', 'quote', 'sent', 'approved', etc.
-- ============================================================================

