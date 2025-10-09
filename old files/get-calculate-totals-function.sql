-- Get the calculate_work_order_totals function
SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'calculate_work_order_totals';

