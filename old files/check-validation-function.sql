-- Check the validation function signature and body
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments,
    prosrc as source
FROM pg_proc 
WHERE proname = 'validate_work_order_status_transition';

