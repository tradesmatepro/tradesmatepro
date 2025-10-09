-- Check the actual status of the quote being edited
SELECT 
    id,
    title,
    status,
    pg_typeof(status) as status_type,
    created_at,
    updated_at
FROM work_orders
WHERE id = '92333880-d0fe-4b21-9310-c1af14ecd4c7';

