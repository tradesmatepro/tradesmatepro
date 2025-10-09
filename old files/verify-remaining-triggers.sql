-- Verify what triggers remain after cleanup
SELECT 
    COUNT(*) as total_triggers,
    COUNT(CASE WHEN trigger_name LIKE '%updated_at%' THEN 1 END) as timestamp_triggers,
    COUNT(CASE WHEN trigger_name LIKE '%number%' THEN 1 END) as numbering_triggers,
    COUNT(CASE WHEN trigger_name NOT LIKE '%updated_at%' AND trigger_name NOT LIKE '%number%' THEN 1 END) as other_triggers
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Show any non-timestamp, non-numbering triggers that remain
SELECT 
    event_object_table as table_name,
    trigger_name,
    action_statement as function_called
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name NOT LIKE '%updated_at%'
  AND trigger_name NOT LIKE '%number%'
ORDER BY event_object_table, trigger_name;

