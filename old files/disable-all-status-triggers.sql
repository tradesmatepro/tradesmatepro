-- Disable ALL status enforcement triggers
DROP TRIGGER IF EXISTS enforce_work_order_status_trigger ON work_orders;
DROP TRIGGER IF EXISTS trg_work_order_status_enforcement ON work_orders;

-- Verify they're gone
SELECT 'Status enforcement triggers disabled' as message;

SELECT trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'work_orders'
  AND trigger_schema = 'public'
  AND trigger_name LIKE '%status%'
ORDER BY trigger_name;

