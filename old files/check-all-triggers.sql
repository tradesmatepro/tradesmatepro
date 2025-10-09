-- Find ALL triggers on work_orders table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'work_orders'
  AND trigger_schema = 'public'
ORDER BY trigger_name;

