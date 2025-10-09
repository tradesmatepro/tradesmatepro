-- Complete audit of ALL triggers in the database
SELECT 
    event_object_table as table_name,
    trigger_name,
    event_manipulation as event_type,
    action_timing as timing,
    action_statement as function_called,
    CASE 
        WHEN trigger_name LIKE '%updated_at%' THEN 'Timestamp maintenance'
        WHEN trigger_name LIKE '%audit%' THEN 'Audit logging'
        WHEN trigger_name LIKE '%status%' THEN 'Status enforcement'
        WHEN trigger_name LIKE '%calculate%' THEN 'Auto-calculation'
        WHEN trigger_name LIKE '%notification%' THEN 'Notifications'
        ELSE 'Other'
    END as category
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

