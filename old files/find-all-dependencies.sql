-- Find all views and rules that depend on work_orders table
SELECT 
    'Views depending on work_orders:' as type,
    schemaname,
    viewname as name,
    definition
FROM pg_views
WHERE definition LIKE '%work_orders%'
  AND schemaname = 'public';

-- Find all rules
SELECT 
    'Rules on work_orders:' as type,
    rulename as name
FROM pg_rules
WHERE tablename = 'work_orders'
  AND schemaname = 'public';

-- Find all triggers
SELECT 
    'Triggers on work_orders:' as type,
    trigger_name as name
FROM information_schema.triggers
WHERE event_object_table = 'work_orders'
  AND trigger_schema = 'public';

