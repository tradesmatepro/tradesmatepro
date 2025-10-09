-- Get the function definition
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'enforce_work_order_status'
AND routine_schema = 'public';

