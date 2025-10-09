-- ========================================
-- TradeMate Pro - Schema Diagnostic Check
-- ========================================
-- Run this to diagnose current schema state
-- and identify exact mismatches causing 400 errors
-- ========================================

\echo '=== DIAGNOSTIC SCHEMA CHECK ==='
\echo ''

-- ========================================
-- 1. CHECK PROFILES TABLE STRUCTURE
-- ========================================
\echo '1. PROFILES TABLE STRUCTURE:'
\echo '----------------------------'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

\echo ''
\echo 'Missing columns check:'
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status') 
        THEN '✅ status column exists' 
        ELSE '❌ status column MISSING' 
    END as status_check,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_id') 
        THEN '✅ user_id column exists' 
        ELSE '❌ user_id column MISSING' 
    END as user_id_check,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') 
        THEN '✅ email column exists' 
        ELSE '❌ email column MISSING' 
    END as email_check,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') 
        THEN '✅ full_name column exists' 
        ELSE '❌ full_name column MISSING' 
    END as full_name_check;

-- ========================================
-- 2. CHECK WORK_ORDERS STATUS ENUM
-- ========================================
\echo ''
\echo '2. WORK_ORDERS STATUS ENUM VALUES:'
\echo '----------------------------------'
SELECT 
    e.enumlabel as enum_value,
    e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'work_order_status_enum'
ORDER BY e.enumsortorder;

\echo ''
\echo 'Required enum values check:'
SELECT 
    CASE WHEN 'QUOTE' = ANY(enum_range(NULL::work_order_status_enum)::text[]) 
        THEN '✅ QUOTE exists' 
        ELSE '❌ QUOTE missing' 
    END as quote_check,
    CASE WHEN 'SENT' = ANY(enum_range(NULL::work_order_status_enum)::text[]) 
        THEN '✅ SENT exists' 
        ELSE '❌ SENT missing' 
    END as sent_check,
    CASE WHEN 'ACCEPTED' = ANY(enum_range(NULL::work_order_status_enum)::text[]) 
        THEN '✅ ACCEPTED exists' 
        ELSE '❌ ACCEPTED missing' 
    END as accepted_check,
    CASE WHEN 'SCHEDULED' = ANY(enum_range(NULL::work_order_status_enum)::text[]) 
        THEN '✅ SCHEDULED exists' 
        ELSE '❌ SCHEDULED missing' 
    END as scheduled_check,
    CASE WHEN 'IN_PROGRESS' = ANY(enum_range(NULL::work_order_status_enum)::text[]) 
        THEN '✅ IN_PROGRESS exists' 
        ELSE '❌ IN_PROGRESS missing' 
    END as in_progress_check,
    CASE WHEN 'COMPLETED' = ANY(enum_range(NULL::work_order_status_enum)::text[]) 
        THEN '✅ COMPLETED exists' 
        ELSE '❌ COMPLETED missing' 
    END as completed_check,
    CASE WHEN 'CANCELLED' = ANY(enum_range(NULL::work_order_status_enum)::text[]) 
        THEN '✅ CANCELLED exists' 
        ELSE '❌ CANCELLED missing' 
    END as cancelled_check,
    CASE WHEN 'INVOICED' = ANY(enum_range(NULL::work_order_status_enum)::text[]) 
        THEN '✅ INVOICED exists' 
        ELSE '❌ INVOICED missing' 
    END as invoiced_check;

-- ========================================
-- 3. CHECK EMPLOYEES TABLE STRUCTURE
-- ========================================
\echo ''
\echo '3. EMPLOYEES TABLE STRUCTURE:'
\echo '-----------------------------'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'employees'
ORDER BY ordinal_position;

\echo ''
\echo 'Employees status type check:'
SELECT 
    data_type,
    udt_name,
    CASE 
        WHEN data_type = 'USER-DEFINED' THEN '✅ Using enum (good)'
        WHEN data_type = 'text' THEN '⚠️ Using text (should be enum)'
        ELSE '❓ Unknown type'
    END as status_type_assessment
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'employees'
  AND column_name = 'status';

-- ========================================
-- 4. CHECK SETTINGS TABLES
-- ========================================
\echo ''
\echo '4. SETTINGS TABLES CHECK:'
\echo '-------------------------'
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'settings' THEN '❌ WRONG - Frontend queries this but it does not exist'
        WHEN table_name = 'company_settings' THEN '✅ CORRECT - Should be used instead'
        WHEN table_name = 'work_settings' THEN '✅ EXISTS - Alternative settings table'
        WHEN table_name = 'business_settings' THEN '✅ EXISTS - Alternative settings table'
        ELSE '❓ Other settings table'
    END as assessment
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name LIKE '%settings%'
ORDER BY table_name;

-- ========================================
-- 5. CHECK ALL ENUMS IN DATABASE
-- ========================================
\echo ''
\echo '5. ALL CUSTOM ENUMS IN DATABASE:'
\echo '--------------------------------'
SELECT 
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%enum%'
GROUP BY t.typname
ORDER BY t.typname;

-- ========================================
-- 6. CHECK FOREIGN KEY RELATIONSHIPS
-- ========================================
\echo ''
\echo '6. FOREIGN KEY RELATIONSHIPS:'
\echo '-----------------------------'
\echo 'Profiles foreign keys:'
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
    AND tc.table_name = 'profiles';

\echo ''
\echo 'Employees foreign keys:'
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
    AND tc.table_name = 'employees';

-- ========================================
-- 7. CHECK INDEXES FOR PERFORMANCE
-- ========================================
\echo ''
\echo '7. CRITICAL INDEXES CHECK:'
\echo '--------------------------'
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'profiles' AND indexname LIKE '%status%'
    ) THEN '✅ profiles.status indexed' 
      ELSE '❌ profiles.status NOT indexed (will be slow)' 
    END as profiles_status_index,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'work_orders' AND indexname LIKE '%status%'
    ) THEN '✅ work_orders.status indexed' 
      ELSE '❌ work_orders.status NOT indexed (will be slow)' 
    END as work_orders_status_index,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'employees' AND indexname LIKE '%status%'
    ) THEN '✅ employees.status indexed' 
      ELSE '❌ employees.status NOT indexed (will be slow)' 
    END as employees_status_index;

-- ========================================
-- 8. SAMPLE DATA CHECK
-- ========================================
\echo ''
\echo '8. SAMPLE DATA CHECK:'
\echo '---------------------'
\echo 'Profiles count:'
SELECT COUNT(*) as total_profiles FROM profiles;

\echo ''
\echo 'Work orders by status:'
SELECT 
    status::text as status,
    COUNT(*) as count
FROM work_orders
GROUP BY status
ORDER BY count DESC;

\echo ''
\echo 'Employees by status:'
SELECT 
    status,
    COUNT(*) as count
FROM employees
GROUP BY status
ORDER BY count DESC;

\echo ''
\echo '=== END DIAGNOSTIC CHECK ==='
\echo ''
\echo 'Next steps:'
\echo '1. Review the output above'
\echo '2. Identify missing columns/enums marked with ❌'
\echo '3. Run FIX_CRITICAL_SCHEMA_ISSUES.sql to apply fixes'
\echo '4. Re-run this diagnostic to verify fixes'

