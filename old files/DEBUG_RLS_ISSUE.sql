-- ============================================
-- DEBUG RLS ISSUE - Check Current State
-- Run this first to see what's wrong
-- ============================================

-- 1. Check if tables exist
SELECT 'TABLE EXISTS CHECK' as test_type, 
       table_name, 
       CASE WHEN table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('business_settings', 'integration_settings', 'companies', 'users')
ORDER BY table_name;

-- 2. Check RLS status on all tables
SELECT 'RLS STATUS CHECK' as test_type,
       schemaname, 
       tablename, 
       rowsecurity as rls_enabled,
       CASE WHEN rowsecurity THEN 'RLS ON (PROBLEM)' ELSE 'RLS OFF (GOOD)' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('companies', 'users', 'business_settings', 'integration_settings', 'work_orders', 'invoices')
ORDER BY tablename;

-- 3. Check if business_settings table has data
SELECT 'BUSINESS_SETTINGS DATA' as test_type,
       count(*) as total_rows,
       count(DISTINCT company_id) as unique_companies
FROM business_settings;

-- 4. Check if integration_settings table has data  
SELECT 'INTEGRATION_SETTINGS DATA' as test_type,
       count(*) as total_rows,
       count(DISTINCT company_id) as unique_companies
FROM integration_settings;

-- 5. Check companies table structure
SELECT 'COMPANIES STRUCTURE' as test_type,
       column_name, 
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
  AND table_schema = 'public'
  AND column_name IN ('invoice_prefix', 'invoice_start_number', 'timezone', 'address', 'phone')
ORDER BY column_name;

-- 6. Check users table structure
SELECT 'USERS STRUCTURE' as test_type,
       column_name, 
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name IN ('role', 'phone', 'profile_picture_url', 'preferences')
ORDER BY column_name;

-- 7. Check specific company that's failing
SELECT 'SPECIFIC COMPANY CHECK' as test_type,
       id, 
       name,
       status,
       invoice_prefix,
       invoice_start_number,
       timezone
FROM companies 
WHERE id = 'd8b9c013-fbc2-41d0-8957-8bfb887fe419'
LIMIT 1;
