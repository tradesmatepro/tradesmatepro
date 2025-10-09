-- Get work_order_line_items table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'work_order_line_items'
ORDER BY ordinal_position;

