-- Verify all quote-related tables exist

SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('service_rates', 'pricing_rules', 'tool_preferences', 'employees')
ORDER BY table_name;

-- Check tool_preferences data
SELECT COUNT(*) as tool_preferences_count FROM tool_preferences;

-- Check employees table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'employees' 
ORDER BY ordinal_position;
