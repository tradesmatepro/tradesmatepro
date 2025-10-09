-- Find ALL sources of "Invalid status transition" error
-- Check triggers
SELECT 'TRIGGERS:' as source;
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'work_orders';

-- Check functions that contain "Invalid status transition"
SELECT 'FUNCTIONS WITH STATUS VALIDATION:' as source;
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_definition ILIKE '%Invalid status transition%';

-- Check CHECK constraints
SELECT 'CHECK CONSTRAINTS:' as source;
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'work_orders'::regclass
  AND contype = 'c';

