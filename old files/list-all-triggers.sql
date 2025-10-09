-- List ALL triggers in the database
SELECT 
    event_object_table as table_name,
    trigger_name,
    event_manipulation as event_type,
    action_timing as timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

