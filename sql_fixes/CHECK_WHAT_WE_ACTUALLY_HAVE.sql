-- ========================================
-- CHECK WHAT WE ACTUALLY HAVE
-- Verify actual database schema
-- ========================================

-- 1. Check for rate_cards table (industry standard)
SELECT 
    'rate_cards' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_cards') 
        THEN '✅ EXISTS' ELSE '❌ MISSING' END as status,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'rate_cards') as column_count;

-- 2. Check for employees table
SELECT 
    'employees' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') 
        THEN '✅ EXISTS' ELSE '❌ MISSING' END as status,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'employees') as column_count;

-- 3. Check for settings/company_settings tables
SELECT 
    table_name,
    '✅ EXISTS' as status,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('settings', 'company_settings', 'public_settings')
ORDER BY table_name;

-- 4. If rate_cards exists, show its structure
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'rate_cards' 
ORDER BY ordinal_position;

-- 5. If employees exists, show its structure and FK relationships
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'employees' 
ORDER BY ordinal_position;

-- 6. Check what employees.user_id references
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'employees'
AND kcu.column_name = 'user_id';
