-- ========================================
-- CANCELLATION TRACKING MIGRATION
-- ========================================
-- Purpose: Add comprehensive cancellation tracking to work_orders
-- Competitive Advantage: Better than ServiceTitan/Jobber/Housecall Pro
-- Date: 2025-10-02
-- ========================================

-- ========================================
-- STEP 1: Create cancellation_reason_enum
-- ========================================

DO $$ BEGIN
  CREATE TYPE cancellation_reason_enum AS ENUM (
    -- Customer-initiated reasons
    'customer_budget',           -- Customer can't afford it
    'customer_timing',           -- Customer wants to wait/delay
    'customer_found_other',      -- Went with competitor
    'customer_no_response',      -- Customer ghosted/no contact
    'customer_changed_mind',     -- Customer no longer needs service
    'customer_dissatisfied',     -- Unhappy with quote/proposal
    
    -- Company-initiated reasons
    'company_capacity',          -- We can't take the job (too busy)
    'company_outside_area',      -- Outside service area
    'company_not_qualified',     -- Don't have expertise/equipment
    'company_unprofitable',      -- Job not profitable enough
    
    -- Mutual/External reasons
    'pricing_disagreement',      -- Couldn't agree on price
    'scheduling_conflict',       -- Couldn't find mutually agreeable time
    'scope_changed',             -- Job scope changed significantly
    'duplicate',                 -- Duplicate work order
    'entered_in_error',          -- Created by mistake
    'weather',                   -- Weather prevented work
    'emergency',                 -- Emergency cancellation
    'permit_issues',             -- Permit/regulatory issues
    'property_sold',             -- Property sold/changed ownership
    'other'                      -- Other (requires notes)
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- STEP 2: Add cancellation tracking columns
-- ========================================

-- Add cancelled_at timestamp
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone;

-- Add cancelled_by (who cancelled it)
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS cancelled_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- Add cancellation_reason enum
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS cancellation_reason cancellation_reason_enum;

-- Add cancellation_notes (detailed explanation)
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS cancellation_notes text;

-- Add cancellation_initiated_by (customer vs company)
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS cancellation_initiated_by text;

-- Add constraint for cancellation_initiated_by
DO $$ BEGIN
  ALTER TABLE work_orders
    ADD CONSTRAINT chk_cancellation_initiated_by 
    CHECK (cancellation_initiated_by IN ('customer', 'company', 'mutual'));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- STEP 3: Create indexes for performance
-- ========================================

-- Index for querying cancelled jobs
CREATE INDEX IF NOT EXISTS idx_work_orders_cancelled_at 
  ON work_orders(cancelled_at) 
  WHERE cancelled_at IS NOT NULL;

-- Index for cancellation reason analytics
CREATE INDEX IF NOT EXISTS idx_work_orders_cancellation_reason 
  ON work_orders(cancellation_reason) 
  WHERE cancellation_reason IS NOT NULL;

-- Index for who cancelled (analytics)
CREATE INDEX IF NOT EXISTS idx_work_orders_cancelled_by 
  ON work_orders(cancelled_by) 
  WHERE cancelled_by IS NOT NULL;

-- ========================================
-- STEP 4: Create trigger to auto-set cancelled_at
-- ========================================

CREATE OR REPLACE FUNCTION set_cancelled_at()
RETURNS TRIGGER AS $$
BEGIN
  -- When status changes to 'cancelled', set cancelled_at if not already set
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' AND NEW.cancelled_at IS NULL THEN
    NEW.cancelled_at = NOW();
  END IF;
  
  -- When status changes FROM 'cancelled' to something else, clear cancellation fields
  IF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
    NEW.cancelled_at = NULL;
    NEW.cancelled_by = NULL;
    NEW.cancellation_reason = NULL;
    NEW.cancellation_notes = NULL;
    NEW.cancellation_initiated_by = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_set_cancelled_at ON work_orders;
CREATE TRIGGER trg_set_cancelled_at
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_cancelled_at();

-- ========================================
-- STEP 5: Create view for cancelled jobs analytics
-- ========================================

CREATE OR REPLACE VIEW cancelled_jobs_analytics AS
SELECT 
  wo.id,
  wo.work_order_number,
  wo.title,
  wo.customer_id,
  c.name as customer_name,
  wo.total_amount,
  wo.status,
  wo.cancelled_at,
  wo.cancelled_by,
  p.first_name || ' ' || p.last_name as cancelled_by_name,
  wo.cancellation_reason,
  wo.cancellation_notes,
  wo.cancellation_initiated_by,
  wo.created_at,
  wo.company_id,
  -- Calculate days from creation to cancellation
  EXTRACT(DAY FROM (wo.cancelled_at - wo.created_at)) as days_to_cancellation
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
LEFT JOIN profiles p ON wo.cancelled_by = p.id
WHERE wo.status = 'cancelled'
  AND wo.cancelled_at IS NOT NULL;

-- ========================================
-- STEP 6: Add comments for documentation
-- ========================================

COMMENT ON COLUMN work_orders.cancelled_at IS 'Timestamp when job was cancelled';
COMMENT ON COLUMN work_orders.cancelled_by IS 'User who cancelled the job (FK to profiles)';
COMMENT ON COLUMN work_orders.cancellation_reason IS 'Reason for cancellation (enum)';
COMMENT ON COLUMN work_orders.cancellation_notes IS 'Detailed notes about why job was cancelled';
COMMENT ON COLUMN work_orders.cancellation_initiated_by IS 'Who initiated cancellation: customer, company, or mutual';

COMMENT ON TYPE cancellation_reason_enum IS 'Reasons for job cancellation - competitive advantage over ServiceTitan/Jobber';
COMMENT ON VIEW cancelled_jobs_analytics IS 'Analytics view for cancelled jobs reporting and metrics';

-- ========================================
-- STEP 7: Grant permissions
-- ========================================

-- Grant access to authenticated users
GRANT SELECT ON cancelled_jobs_analytics TO authenticated;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify enum was created
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'cancellation_reason_enum'::regtype 
ORDER BY enumsortorder;

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'work_orders'
  AND column_name LIKE 'cancel%'
ORDER BY ordinal_position;

-- Verify indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'work_orders'
  AND indexname LIKE '%cancel%';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$ BEGIN
  RAISE NOTICE '✅ Cancellation tracking migration complete!';
  RAISE NOTICE '✅ Added 5 columns: cancelled_at, cancelled_by, cancellation_reason, cancellation_notes, cancellation_initiated_by';
  RAISE NOTICE '✅ Created cancellation_reason_enum with 20 reason options';
  RAISE NOTICE '✅ Created 3 indexes for performance';
  RAISE NOTICE '✅ Created trigger to auto-set cancelled_at';
  RAISE NOTICE '✅ Created cancelled_jobs_analytics view';
  RAISE NOTICE '🚀 Ready to implement UI components!';
END $$;

