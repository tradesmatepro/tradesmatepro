-- Check for triggers on work_order_line_items table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'work_order_line_items'
ORDER BY trigger_name;

