-- ============================================
-- MIGRATE TO INDUSTRY STANDARD: employee_id
-- ============================================

-- Step 1: Add employee_id columns
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id) ON DELETE SET NULL;

ALTER TABLE schedule_events 
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id) ON DELETE CASCADE;

-- Step 2: Backfill work_orders.employee_id from assigned_to
UPDATE work_orders wo
SET employee_id = e.id
FROM employees e
WHERE wo.assigned_to = e.user_id
  AND wo.employee_id IS NULL;

-- Step 3: Backfill schedule_events.employee_id from user_id
UPDATE schedule_events se
SET employee_id = e.id
FROM employees e
WHERE se.user_id = e.user_id
  AND se.employee_id IS NULL;

-- Step 4: Add indexes
CREATE INDEX IF NOT EXISTS idx_work_orders_employee_id ON work_orders(employee_id);
CREATE INDEX IF NOT EXISTS idx_schedule_events_employee_id ON schedule_events(employee_id);

-- Step 5: Verification
SELECT 'work_orders' as table_name, 
       COUNT(*) as total,
       COUNT(employee_id) as with_employee_id,
       COUNT(*) - COUNT(employee_id) as without_employee_id
FROM work_orders;

SELECT 'schedule_events' as table_name,
       COUNT(*) as total,
       COUNT(employee_id) as with_employee_id,
       COUNT(*) - COUNT(employee_id) as without_employee_id
FROM schedule_events;

