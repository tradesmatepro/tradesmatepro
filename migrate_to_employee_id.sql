-- ============================================
-- MIGRATE TO INDUSTRY STANDARD: employee_id
-- ============================================
-- This migrates work_orders and schedule_events to use employee_id
-- instead of user_id, matching Jobber/ServiceTitan/Housecall Pro
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: ADD employee_id COLUMNS
-- ============================================

-- Add employee_id to work_orders
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id) ON DELETE SET NULL;

-- Add employee_id to schedule_events
ALTER TABLE schedule_events 
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id) ON DELETE CASCADE;

RAISE NOTICE '✅ Step 1 Complete: Added employee_id columns';

-- ============================================
-- STEP 2: BACKFILL employee_id FROM user_id
-- ============================================

-- Backfill work_orders.employee_id from assigned_to (user_id)
UPDATE work_orders wo
SET employee_id = e.id
FROM employees e
WHERE wo.assigned_to = e.user_id
  AND wo.employee_id IS NULL;

-- Show how many work_orders were updated
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM work_orders
  WHERE employee_id IS NOT NULL;
  
  RAISE NOTICE '✅ Step 2a Complete: Backfilled % work_orders with employee_id', updated_count;
END $$;

-- Backfill schedule_events.employee_id from user_id
UPDATE schedule_events se
SET employee_id = e.id
FROM employees e
WHERE se.user_id = e.user_id
  AND se.employee_id IS NULL;

-- Show how many schedule_events were updated
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM schedule_events
  WHERE employee_id IS NOT NULL;
  
  RAISE NOTICE '✅ Step 2b Complete: Backfilled % schedule_events with employee_id', updated_count;
END $$;

-- ============================================
-- STEP 3: ADD INDEXES FOR PERFORMANCE
-- ============================================

-- Index on work_orders.employee_id
CREATE INDEX IF NOT EXISTS idx_work_orders_employee_id ON work_orders(employee_id);

-- Index on schedule_events.employee_id
CREATE INDEX IF NOT EXISTS idx_schedule_events_employee_id ON schedule_events(employee_id);

RAISE NOTICE '✅ Step 3 Complete: Added indexes on employee_id columns';

-- ============================================
-- STEP 4: VERIFICATION
-- ============================================

-- Show work_orders with and without employee_id
DO $$
DECLARE
  with_employee INTEGER;
  without_employee INTEGER;
  total INTEGER;
BEGIN
  SELECT COUNT(*) INTO with_employee FROM work_orders WHERE employee_id IS NOT NULL;
  SELECT COUNT(*) INTO without_employee FROM work_orders WHERE employee_id IS NULL AND assigned_to IS NOT NULL;
  SELECT COUNT(*) INTO total FROM work_orders;
  
  RAISE NOTICE '📊 work_orders: % total, % with employee_id, % without employee_id', total, with_employee, without_employee;
END $$;

-- Show schedule_events with and without employee_id
DO $$
DECLARE
  with_employee INTEGER;
  without_employee INTEGER;
  total INTEGER;
BEGIN
  SELECT COUNT(*) INTO with_employee FROM schedule_events WHERE employee_id IS NOT NULL;
  SELECT COUNT(*) INTO without_employee FROM schedule_events WHERE employee_id IS NULL AND user_id IS NOT NULL;
  SELECT COUNT(*) INTO total FROM schedule_events;
  
  RAISE NOTICE '📊 schedule_events: % total, % with employee_id, % without employee_id', total, with_employee, without_employee;
END $$;

-- ============================================
-- STEP 5: SHOW SAMPLE DATA
-- ============================================

-- Show sample work_orders with both IDs
SELECT 
  'work_orders sample' as table_name,
  id,
  work_order_number,
  assigned_to as old_user_id,
  employee_id as new_employee_id,
  status
FROM work_orders
LIMIT 5;

-- Show sample schedule_events with both IDs
SELECT 
  'schedule_events sample' as table_name,
  id,
  title,
  user_id as old_user_id,
  employee_id as new_employee_id,
  start_time
FROM schedule_events
LIMIT 5;

RAISE NOTICE '✅ Step 5 Complete: Verification done';

-- ============================================
-- STEP 6: INSTRUCTIONS FOR NEXT STEPS
-- ============================================

RAISE NOTICE '';
RAISE NOTICE '🎉 ========== MIGRATION COMPLETE ==========';
RAISE NOTICE '';
RAISE NOTICE '✅ employee_id columns added to work_orders and schedule_events';
RAISE NOTICE '✅ Existing data backfilled from user_id → employee_id';
RAISE NOTICE '✅ Indexes created for performance';
RAISE NOTICE '';
RAISE NOTICE '📋 NEXT STEPS:';
RAISE NOTICE '1. Update frontend code to use employee_id instead of user_id';
RAISE NOTICE '2. Test thoroughly (create work orders, schedule events)';
RAISE NOTICE '3. After testing, run cleanup SQL to drop old columns:';
RAISE NOTICE '   -- ALTER TABLE work_orders DROP COLUMN assigned_to;';
RAISE NOTICE '   -- ALTER TABLE schedule_events DROP COLUMN user_id;';
RAISE NOTICE '';
RAISE NOTICE '⚠️  DO NOT drop old columns until frontend is updated and tested!';
RAISE NOTICE '';

COMMIT;

