-- ========================================
-- COMPLETE AUDIT: What customer tables exist and are they being used?
-- ========================================

-- 1. List ALL customer-related tables and views
SELECT 
    'ALL CUSTOMER TABLES AND VIEWS:' as section;

SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_type = 'BASE TABLE' THEN '📊 TABLE (stores data)'
        WHEN table_type = 'VIEW' THEN '👁️ VIEW (computed)'
        ELSE table_type
    END as description
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%customer%'
ORDER BY table_type, table_name;

-- 2. Check row counts for each TABLE (not views)
SELECT 
    'ROW COUNTS FOR EACH TABLE:' as section;

DO $$
DECLARE
    tbl TEXT;
    cnt INTEGER;
    tbl_type TEXT;
BEGIN
    FOR tbl, tbl_type IN 
        SELECT table_name, table_type
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%customer%'
        ORDER BY table_name
    LOOP
        IF tbl_type = 'BASE TABLE' THEN
            EXECUTE format('SELECT COUNT(*) FROM %I', tbl) INTO cnt;
            RAISE NOTICE '📊 % - % rows', tbl, cnt;
        ELSE
            RAISE NOTICE '👁️ % - VIEW (computed)', tbl;
        END IF;
    END LOOP;
END $$;

-- 3. Show structure of main customers table
SELECT 
    'CUSTOMERS TABLE STRUCTURE:' as section;

SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable,
    CASE 
        WHEN column_name IN ('first_name', 'last_name', 'company_name') THEN '👤 NAME FIELDS'
        WHEN column_name IN ('email', 'phone', 'mobile_phone') THEN '📞 CONTACT FIELDS'
        WHEN column_name IN ('status', 'is_active', 'type') THEN '🏷️ STATUS FIELDS'
        WHEN column_name IN ('credit_limit', 'payment_terms', 'tax_exempt') THEN '💰 FINANCIAL FIELDS'
        ELSE '📋 OTHER'
    END as category
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- 4. Check foreign key relationships
SELECT 
    'FOREIGN KEY RELATIONSHIPS:' as section;

SELECT 
    tc.table_name as child_table,
    kcu.column_name as child_column,
    ccu.table_name AS parent_table,
    ccu.column_name AS parent_column
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND (tc.table_name LIKE '%customer%' OR ccu.table_name LIKE '%customer%')
ORDER BY tc.table_name;

-- 5. Check if summary tables are views or tables
SELECT 
    'SUMMARY TABLES CHECK:' as section;

SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_type = 'BASE TABLE' THEN '❌ SHOULD BE VIEW (duplicate data)'
        WHEN table_type = 'VIEW' THEN '✅ CORRECT (computed)'
        ELSE '❓ UNKNOWN'
    END as recommendation
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('customer_financial_summary', 'customer_summary', 'customers_financial_summary')
ORDER BY table_name;

-- 6. Show view definitions if they exist
SELECT 
    'VIEW DEFINITIONS:' as section;

SELECT 
    table_name,
    LEFT(view_definition, 200) as definition_preview
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE '%customer%'
ORDER BY table_name;

-- 7. Check for indexes on customer tables
SELECT 
    'INDEXES ON CUSTOMER TABLES:' as section;

SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename LIKE '%customer%'
ORDER BY tablename, indexname;

-- 8. Sample data from customers table
SELECT 
    'SAMPLE CUSTOMER DATA:' as section;

SELECT 
    customer_number,
    type,
    first_name,
    last_name,
    company_name,
    email,
    status,
    is_active,
    CASE 
        WHEN company_name IS NOT NULL THEN '🏢 Commercial'
        WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN '🏠 Residential'
        ELSE '❓ Incomplete'
    END as data_quality
FROM customers
ORDER BY created_at DESC
LIMIT 5;
