-- Check the actual trigger functions
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc
WHERE proname IN ('sync_customer_status', 'handle_customer_changes', 'normalize_customer_data')
ORDER BY proname;
