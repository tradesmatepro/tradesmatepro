-- ========================================
-- VERIFY INDUSTRY STANDARD CUSTOMER SYSTEM
-- ========================================

-- 1. Show all customer-related tables and views
SELECT 
    '=== ALL CUSTOMER TABLES AND VIEWS ===' as section;

SELECT 
    table_name,
    table_type,
    CASE table_type 
        WHEN 'BASE TABLE' THEN '📊 TABLE (stores data)'
        WHEN 'VIEW' THEN '👁️ VIEW (computed)'
    END as description
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%customer%'
ORDER BY 
    CASE table_type 
        WHEN 'BASE TABLE' THEN 1 
        WHEN 'VIEW' THEN 2 
    END,
    table_name;

-- 2. Verify summary tables are VIEWS (not tables)
SELECT 
    '=== VERIFY SUMMARY TABLES ARE VIEWS ===' as section;

SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_type = 'VIEW' THEN '✅ CORRECT (computed data)'
        WHEN table_type = 'BASE TABLE' THEN '❌ WRONG (should be view)'
        ELSE '❓ UNKNOWN'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('customer_financial_summary', 'customer_summary')
ORDER BY table_name;

-- 3. Show structure of main customers table
SELECT 
    '=== CUSTOMERS TABLE STRUCTURE ===' as section;

SELECT 
    column_name,
    data_type,
    CASE 
        WHEN column_name IN ('first_name', 'last_name', 'company_name') THEN '👤 NAME FIELDS'
        WHEN column_name IN ('email', 'phone', 'mobile_phone') THEN '📞 CONTACT'
        WHEN column_name IN ('type', 'is_active') THEN '🏷️ TYPE/STATUS'
        WHEN column_name IN ('credit_limit', 'payment_terms', 'tax_exempt') THEN '💰 FINANCIAL'
        ELSE '📋 OTHER'
    END as category,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY 
    CASE 
        WHEN column_name = 'id' THEN 1
        WHEN column_name = 'company_id' THEN 2
        WHEN column_name = 'customer_number' THEN 3
        WHEN column_name = 'type' THEN 4
        WHEN column_name IN ('first_name', 'last_name', 'company_name') THEN 5
        WHEN column_name IN ('email', 'phone', 'mobile_phone') THEN 6
        ELSE 7
    END,
    column_name;

-- 4. Show all indexes on customer tables
SELECT 
    '=== INDEXES ON CUSTOMER TABLES ===' as section;

SELECT 
    tablename,
    indexname,
    CASE 
        WHEN indexname LIKE '%_pkey' THEN '🔑 PRIMARY KEY'
        WHEN indexname LIKE '%customer_id%' THEN '🔗 FOREIGN KEY'
        WHEN indexname LIKE '%is_primary%' THEN '⭐ PRIMARY FLAG'
        WHEN indexname LIKE '%created_at%' THEN '📅 TIMESTAMP'
        ELSE '📊 INDEX'
    END as index_type
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename LIKE '%customer%'
ORDER BY tablename, indexname;

-- 5. Show foreign key relationships
SELECT 
    '=== FOREIGN KEY RELATIONSHIPS ===' as section;

SELECT 
    tc.table_name as child_table,
    kcu.column_name as child_column,
    ccu.table_name AS parent_table,
    ccu.column_name AS parent_column,
    '✅' as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name LIKE '%customer%'
ORDER BY tc.table_name, kcu.column_name;

-- 6. Show triggers on customers table
SELECT 
    '=== TRIGGERS ON CUSTOMERS TABLE ===' as section;

SELECT 
    trigger_name,
    event_manipulation as event,
    action_timing as timing,
    '✅' as status
FROM information_schema.triggers
WHERE event_object_table = 'customers'
AND trigger_schema = 'public'
ORDER BY trigger_name;

-- 7. Count records in each table
SELECT 
    '=== RECORD COUNTS ===' as section;

DO $$
DECLARE
    tbl TEXT;
    cnt INTEGER;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%customer%'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', tbl) INTO cnt;
        RAISE NOTICE '📊 % - % records', tbl, cnt;
    END LOOP;
END $$;

-- 8. Show sample customer data
SELECT 
    '=== SAMPLE CUSTOMER DATA ===' as section;

SELECT 
    customer_number,
    type,
    first_name,
    last_name,
    company_name,
    email,
    is_active,
    CASE 
        WHEN company_name IS NOT NULL THEN '🏢 Commercial'
        WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN '🏠 Residential'
        ELSE '❓ Incomplete'
    END as data_quality,
    created_at
FROM customers
ORDER BY created_at DESC
LIMIT 5;

-- 9. Final summary
SELECT 
    '=== ✅ INDUSTRY STANDARD VERIFICATION COMPLETE ===' as section;

SELECT 
    'Total customer tables' as metric,
    COUNT(*) as value
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%customer%'
AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
    'Total customer views' as metric,
    COUNT(*) as value
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%customer%'
AND table_type = 'VIEW'

UNION ALL

SELECT 
    'Total indexes' as metric,
    COUNT(*) as value
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename LIKE '%customer%'

UNION ALL

SELECT 
    'Total foreign keys' as metric,
    COUNT(*) as value
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
AND table_schema = 'public'
AND table_name LIKE '%customer%'

UNION ALL

SELECT 
    'Total triggers' as metric,
    COUNT(*) as value
FROM information_schema.triggers
WHERE event_object_table = 'customers'
AND trigger_schema = 'public';

SELECT '✅ All industry standard customer tables created!' as result;
