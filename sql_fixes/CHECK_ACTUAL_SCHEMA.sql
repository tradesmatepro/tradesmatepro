-- ========================================
-- CHECK ACTUAL DATABASE SCHEMA
-- What tables do we ACTUALLY have?
-- ========================================

-- 1. List ALL tables in the database
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check if the tables the code is looking for exist
SELECT 
    'service_rates' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_rates') 
        THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
    'pricing_rules',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pricing_rules') 
        THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'tool_preferences',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tool_preferences') 
        THEN '✅ EXISTS' ELSE '❌ MISSING' END
UNION ALL
SELECT 
    'employees',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') 
        THEN '✅ EXISTS' ELSE '❌ MISSING' END;

-- 3. Check what pricing/rate related tables we DO have
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND (
    table_name LIKE '%rate%' OR 
    table_name LIKE '%price%' OR 
    table_name LIKE '%service%' OR
    table_name LIKE '%employee%' OR
    table_name LIKE '%labor%'
)
ORDER BY table_name;

-- 4. If employees table exists, show its structure
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'employees' 
ORDER BY ordinal_position;
