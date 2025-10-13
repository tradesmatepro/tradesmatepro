-- CREATE TEST WORK ORDERS FOR ALL PAGES
-- This SQL script creates test data to fix:
-- 1. Work Orders page (needs scheduled/in_progress/completed work orders)
-- 2. Scheduling page (needs scheduled work orders with dates)
-- 3. Invoices page (needs invoiced/paid work orders)

-- First, let's check what quotes exist
SELECT id, title, status, customer_id, company_id
FROM work_orders
WHERE status IN ('quote', 'sent')
ORDER BY created_at DESC
LIMIT 5;

-- Convert first quote to APPROVED (unscheduled job)
UPDATE work_orders
SET status = 'approved',
    updated_at = NOW()
WHERE id = (
  SELECT id FROM work_orders
  WHERE status IN ('quote', 'sent')
  ORDER BY created_at DESC
  LIMIT 1 OFFSET 0
)
RETURNING id, title, status;

-- Convert second quote to SCHEDULED (scheduled for tomorrow 9 AM - 5 PM)
UPDATE work_orders
SET status = 'scheduled',
    scheduled_start = (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '9 hours')::timestamptz,
    scheduled_end = (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '17 hours')::timestamptz,
    updated_at = NOW()
WHERE id = (
  SELECT id FROM work_orders
  WHERE status IN ('quote', 'sent')
  ORDER BY created_at DESC
  LIMIT 1 OFFSET 1
)
RETURNING id, title, status, scheduled_start, scheduled_end;

-- Convert third quote to IN_PROGRESS (work started)
UPDATE work_orders
SET status = 'in_progress',
    updated_at = NOW()
WHERE id = (
  SELECT id FROM work_orders
  WHERE status IN ('quote', 'sent')
  ORDER BY created_at DESC
  LIMIT 1 OFFSET 2
)
RETURNING id, title, status;

-- Convert fourth quote to COMPLETED (work finished, ready to invoice)
UPDATE work_orders
SET status = 'completed',
    updated_at = NOW()
WHERE id = (
  SELECT id FROM work_orders
  WHERE status IN ('quote', 'sent')
  ORDER BY created_at DESC
  LIMIT 1 OFFSET 3
)
RETURNING id, title, status;

-- Convert fifth quote to INVOICED (invoice sent, awaiting payment)
UPDATE work_orders
SET status = 'invoiced',
    updated_at = NOW()
WHERE id = (
  SELECT id FROM work_orders
  WHERE status IN ('quote', 'sent')
  ORDER BY created_at DESC
  LIMIT 1 OFFSET 4
)
RETURNING id, title, status;

-- Verify the changes
SELECT 
  status,
  COUNT(*) as count
FROM work_orders
GROUP BY status
ORDER BY count DESC;

-- Show the work orders we just created
SELECT 
  id,
  title,
  status,
  scheduled_start,
  scheduled_end,
  created_at
FROM work_orders
WHERE status IN ('approved', 'scheduled', 'in_progress', 'completed', 'invoiced')
ORDER BY created_at DESC;

