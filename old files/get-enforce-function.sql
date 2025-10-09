-- Get the full enforce function definition
SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'enforce_work_order_status';

