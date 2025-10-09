-- ========================================
-- ADD RESCHEDULING STATUS & AUTO-FREE CALENDAR
-- ========================================
-- Purpose: Add needs_rescheduling status and auto-cancel schedule_events
--          when job is cancelled, on_hold, or needs_rescheduling
-- Date: 2025-10-02
-- ========================================

-- ========================================
-- STEP 1: Add needs_rescheduling to enum
-- ========================================

-- Add new status to work_order_status_enum
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'needs_rescheduling';

-- Verify it was added
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'work_order_status_enum'::regtype 
ORDER BY enumsortorder;

-- ========================================
-- STEP 2: Create trigger to auto-cancel schedule_events
-- ========================================

CREATE OR REPLACE FUNCTION auto_cancel_schedule_events()
RETURNS TRIGGER AS $$
BEGIN
  -- When work_order status changes TO cancelled, on_hold, or needs_rescheduling
  -- Cancel all associated schedule_events to free up technician calendar
  IF NEW.status IN ('cancelled', 'on_hold', 'needs_rescheduling') 
     AND (OLD.status IS NULL OR OLD.status NOT IN ('cancelled', 'on_hold', 'needs_rescheduling')) THEN
    
    -- Update all schedule_events for this work_order to 'cancelled' status
    UPDATE schedule_events
    SET 
      status = 'cancelled',
      updated_at = NOW()
    WHERE work_order_id = NEW.id
      AND status NOT IN ('cancelled', 'completed');
    
    -- Log how many events were cancelled
    RAISE NOTICE 'Auto-cancelled % schedule_events for work_order % (status: %)', 
      (SELECT COUNT(*) FROM schedule_events WHERE work_order_id = NEW.id AND status = 'cancelled'),
      NEW.id,
      NEW.status;
  END IF;
  
  -- When work_order status changes FROM cancelled/on_hold/needs_rescheduling back to scheduled/in_progress
  -- Restore schedule_events to 'scheduled' status
  IF NEW.status IN ('scheduled', 'in_progress')
     AND OLD.status IN ('cancelled', 'on_hold', 'needs_rescheduling') THEN
    
    -- Restore schedule_events to 'scheduled' status
    UPDATE schedule_events
    SET 
      status = 'scheduled',
      updated_at = NOW()
    WHERE work_order_id = NEW.id
      AND status = 'cancelled';
    
    RAISE NOTICE 'Restored % schedule_events for work_order % (status: %)', 
      (SELECT COUNT(*) FROM schedule_events WHERE work_order_id = NEW.id AND status = 'scheduled'),
      NEW.id,
      NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_auto_cancel_schedule_events ON work_orders;
CREATE TRIGGER trg_auto_cancel_schedule_events
  AFTER UPDATE OF status ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_cancel_schedule_events();

-- ========================================
-- STEP 3: Add rescheduling reason tracking
-- ========================================

-- Add columns for rescheduling tracking (similar to cancellation)
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS rescheduling_reason text;

ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS rescheduling_notes text;

ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS rescheduling_requested_at timestamp with time zone;

ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS rescheduling_requested_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- Create index for rescheduling queries
CREATE INDEX IF NOT EXISTS idx_work_orders_rescheduling_requested_at 
  ON work_orders(rescheduling_requested_at) 
  WHERE rescheduling_requested_at IS NOT NULL;

-- ========================================
-- STEP 4: Create trigger to auto-set rescheduling timestamp
-- ========================================

CREATE OR REPLACE FUNCTION set_rescheduling_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- When status changes to 'needs_rescheduling', set timestamp if not already set
  IF NEW.status = 'needs_rescheduling' AND OLD.status != 'needs_rescheduling' AND NEW.rescheduling_requested_at IS NULL THEN
    NEW.rescheduling_requested_at = NOW();
  END IF;
  
  -- When status changes FROM 'needs_rescheduling' to something else, clear rescheduling fields
  IF OLD.status = 'needs_rescheduling' AND NEW.status != 'needs_rescheduling' THEN
    NEW.rescheduling_requested_at = NULL;
    NEW.rescheduling_requested_by = NULL;
    NEW.rescheduling_reason = NULL;
    NEW.rescheduling_notes = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_set_rescheduling_timestamp ON work_orders;
CREATE TRIGGER trg_set_rescheduling_timestamp
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_rescheduling_timestamp();

-- ========================================
-- STEP 5: Add comments for documentation
-- ========================================

COMMENT ON COLUMN work_orders.rescheduling_reason IS 'Reason why job needs rescheduling (e.g., customer request, weather, emergency)';
COMMENT ON COLUMN work_orders.rescheduling_notes IS 'Detailed notes about rescheduling request';
COMMENT ON COLUMN work_orders.rescheduling_requested_at IS 'Timestamp when rescheduling was requested';
COMMENT ON COLUMN work_orders.rescheduling_requested_by IS 'User who requested rescheduling (FK to profiles)';

COMMENT ON FUNCTION auto_cancel_schedule_events() IS 'Automatically cancels schedule_events when work_order is cancelled, on_hold, or needs_rescheduling to free up technician calendar';
COMMENT ON FUNCTION set_rescheduling_timestamp() IS 'Automatically sets rescheduling_requested_at when status changes to needs_rescheduling';

-- ========================================
-- STEP 6: Create view for jobs needing rescheduling
-- ========================================

CREATE OR REPLACE VIEW jobs_needing_rescheduling AS
SELECT 
  wo.id,
  wo.work_order_number,
  wo.title,
  wo.customer_id,
  c.name as customer_name,
  wo.scheduled_start as original_scheduled_start,
  wo.scheduled_end as original_scheduled_end,
  wo.assigned_to,
  wo.employee_id,
  u.name as assigned_technician_name,
  wo.rescheduling_requested_at,
  wo.rescheduling_requested_by,
  p.user_id,
  u2.name as requested_by_name,
  wo.rescheduling_reason,
  wo.rescheduling_notes,
  wo.company_id,
  -- Calculate how long it's been waiting for rescheduling
  EXTRACT(DAY FROM (NOW() - wo.rescheduling_requested_at)) as days_waiting
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
LEFT JOIN users u ON wo.assigned_to = u.id
LEFT JOIN profiles p ON wo.rescheduling_requested_by = p.id
LEFT JOIN users u2 ON p.user_id = u2.id
WHERE wo.status = 'needs_rescheduling'
  AND wo.rescheduling_requested_at IS NOT NULL
ORDER BY wo.rescheduling_requested_at ASC;

-- Grant access
GRANT SELECT ON jobs_needing_rescheduling TO authenticated;

COMMENT ON VIEW jobs_needing_rescheduling IS 'View of all jobs that need rescheduling with tracking details';

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify new status was added
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'work_order_status_enum'::regtype 
  AND enumlabel = 'needs_rescheduling';

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'work_orders'
  AND column_name LIKE 'rescheduling%'
ORDER BY ordinal_position;

-- Verify triggers were created
SELECT tgname, tgtype, tgenabled
FROM pg_trigger
WHERE tgname IN ('trg_auto_cancel_schedule_events', 'trg_set_rescheduling_timestamp');

-- ========================================
-- TEST SCENARIO (commented out - for manual testing)
-- ========================================

/*
-- Test 1: Create a test work order with schedule event
INSERT INTO work_orders (company_id, work_order_number, title, customer_id, status, scheduled_start, scheduled_end)
VALUES ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 'TEST-001', 'Test Job', 
        (SELECT id FROM customers LIMIT 1), 'scheduled', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '2 hours')
RETURNING id;

-- Create schedule event for the test job
INSERT INTO schedule_events (company_id, work_order_id, title, start_time, end_time, employee_id)
VALUES ('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', 
        (SELECT id FROM work_orders WHERE work_order_number = 'TEST-001'),
        'Test Job', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '2 hours',
        (SELECT id FROM employees LIMIT 1));

-- Test 2: Change status to on_hold (should cancel schedule_events)
UPDATE work_orders 
SET status = 'on_hold' 
WHERE work_order_number = 'TEST-001';

-- Verify schedule_events were cancelled
SELECT status FROM schedule_events WHERE work_order_id = (SELECT id FROM work_orders WHERE work_order_number = 'TEST-001');
-- Should show 'cancelled'

-- Test 3: Change status back to scheduled (should restore schedule_events)
UPDATE work_orders 
SET status = 'scheduled' 
WHERE work_order_number = 'TEST-001';

-- Verify schedule_events were restored
SELECT status FROM schedule_events WHERE work_order_id = (SELECT id FROM work_orders WHERE work_order_number = 'TEST-001');
-- Should show 'scheduled'

-- Cleanup
DELETE FROM work_orders WHERE work_order_number = 'TEST-001';
*/

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$ BEGIN
  RAISE NOTICE '✅ Rescheduling status and auto-free calendar migration complete!';
  RAISE NOTICE '✅ Added needs_rescheduling status to enum';
  RAISE NOTICE '✅ Created auto_cancel_schedule_events trigger';
  RAISE NOTICE '✅ Added 4 rescheduling tracking columns';
  RAISE NOTICE '✅ Created jobs_needing_rescheduling view';
  RAISE NOTICE '🚀 Technician calendars will now auto-free when jobs are cancelled, on_hold, or needs_rescheduling!';
END $$;

