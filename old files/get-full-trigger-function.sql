-- Get the full function definition with proper formatting
SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'validate_work_order_status_transition';

