-- Quick check to see if the schema fix has been applied
-- Run this in Supabase SQL Editor to check current state

-- 1. Check if companies table has the new fields
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if users table has the new fields  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check RLS status on key tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('companies', 'users', 'work_orders', 'invoices')
ORDER BY tablename;

-- 4. Check if any companies have settings data
SELECT id, name, 
       CASE WHEN settings IS NOT NULL THEN 'HAS_SETTINGS' ELSE 'NO_SETTINGS' END as settings_status,
       jsonb_pretty(settings) as settings_preview
FROM companies 
LIMIT 3;
