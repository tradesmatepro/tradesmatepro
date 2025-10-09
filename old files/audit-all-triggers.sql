-- Get ALL triggers in the database with their functions
SELECT 
    t.trigger_name,
    t.event_object_table as table_name,
    t.event_manipulation as event_type,
    t.action_timing as timing,
    t.action_statement,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_code
FROM information_schema.triggers t
LEFT JOIN pg_proc p ON t.action_statement LIKE '%' || p.proname || '%'
WHERE t.trigger_schema = 'public'
ORDER BY t.event_object_table, t.trigger_name;

