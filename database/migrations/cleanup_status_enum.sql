-- ========================================
-- STATUS ENUM CLEANUP MIGRATION
-- ========================================
-- Purpose: Remove duplicate enum values (DRAFT/draft, QUOTE/quote, etc.)
--          and standardize to lowercase only
-- Date: 2025-10-02
-- ========================================

-- STEP 1: Update all existing records to use lowercase values
-- (Currently only 'scheduled' is in use, but this handles all cases)

UPDATE work_orders SET status = 'draft' WHERE status = 'DRAFT';
UPDATE work_orders SET status = 'sent' WHERE status IN ('QUOTE', 'SENT');
UPDATE work_orders SET status = 'approved' WHERE status = 'ACCEPTED';
UPDATE work_orders SET status = 'rejected' WHERE status = 'REJECTED';
UPDATE work_orders SET status = 'scheduled' WHERE status = 'SCHEDULED';
UPDATE work_orders SET status = 'in_progress' WHERE status = 'IN_PROGRESS';
UPDATE work_orders SET status = 'completed' WHERE status = 'COMPLETED';
UPDATE work_orders SET status = 'cancelled' WHERE status = 'CANCELLED';
UPDATE work_orders SET status = 'invoiced' WHERE status = 'INVOICED';
UPDATE work_orders SET status = 'paid' WHERE status = 'PAID';
UPDATE work_orders SET status = 'closed' WHERE status = 'CLOSED';

-- STEP 2: Create new enum with only lowercase values (industry standard + competitive advantages)
CREATE TYPE work_order_status_enum_new AS ENUM (
  -- QUOTE STAGE (8 statuses)
  'draft',              -- Creating quote
  'sent',               -- Sent to customer
  'presented',          -- ✅ ServiceTitan feature: Shown in person
  'changes_requested',  -- ✅ Jobber pain point fix: Customer wants changes
  'follow_up',          -- ✅ ServiceTitan feature: Needs follow-up
  'approved',           -- Customer accepted (becomes unscheduled job)
  'rejected',           -- Customer declined
  'expired',            -- ✅ Housecall Pro feature: Quote expired
  
  -- JOB STAGE (5 statuses)
  'scheduled',          -- Job scheduled with tech
  'in_progress',        -- Work started
  'completed',          -- Work finished
  'on_hold',            -- ✅ Pain point fix: Pause jobs
  
  -- INVOICE STAGE (2 statuses)
  'invoiced',           -- Invoice created
  'paid',               -- Invoice paid
  'closed',             -- Job closed
  
  -- UNIVERSAL (1 status)
  'cancelled'           -- Can happen at any stage
);

-- STEP 3: Remove default constraint temporarily
ALTER TABLE work_orders ALTER COLUMN status DROP DEFAULT;

-- STEP 4: Update the work_orders table to use the new enum
ALTER TABLE work_orders
  ALTER COLUMN status TYPE work_order_status_enum_new
  USING status::text::work_order_status_enum_new;

-- STEP 5: Drop the old enum and rename the new one (CASCADE to handle dependencies)
DROP TYPE work_order_status_enum CASCADE;
ALTER TYPE work_order_status_enum_new RENAME TO work_order_status_enum;

-- STEP 6: Restore default constraint
ALTER TABLE work_orders ALTER COLUMN status SET DEFAULT 'draft'::work_order_status_enum;

-- STEP 7: Verify the cleanup
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'work_order_status_enum'::regtype ORDER BY enumsortorder;

-- ========================================
-- ROLLBACK SCRIPT (if needed)
-- ========================================
-- To rollback, run:
-- 
-- CREATE TYPE work_order_status_enum_old AS ENUM (
--   'draft', 'quote', 'approved', 'scheduled', 'parts_ordered', 'on_hold',
--   'in_progress', 'requires_approval', 'rework_needed', 'completed',
--   'invoiced', 'cancelled', 'sent', 'rejected', 'paid', 'closed',
--   'DRAFT', 'QUOTE', 'SENT', 'ACCEPTED', 'REJECTED', 'SCHEDULED',
--   'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'INVOICED', 'PAID', 'CLOSED',
--   'presented', 'changes_requested', 'follow_up', 'expired'
-- );
-- 
-- ALTER TABLE work_orders 
--   ALTER COLUMN status TYPE work_order_status_enum_old 
--   USING status::text::work_order_status_enum_old;
-- 
-- DROP TYPE work_order_status_enum;
-- ALTER TYPE work_order_status_enum_old RENAME TO work_order_status_enum;

