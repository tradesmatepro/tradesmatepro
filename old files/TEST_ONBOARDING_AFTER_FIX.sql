-- ============================================
-- TEST ONBOARDING AFTER SCHEMA FIX
-- Run this after COMPLETE_SCHEMA_FIX.sql to verify everything works
-- ============================================

-- 1. Test company creation (simulate what onboarding does)
INSERT INTO public.companies (
    name, 
    invoice_prefix, 
    invoice_start_number, 
    timezone, 
    logo_url, 
    address, 
    phone, 
    status
) VALUES (
    'Test Company Ltd',
    '2025',
    1,
    'America/Los_Angeles',
    null,
    null,
    null,
    'ACTIVE'
) RETURNING id, name, invoice_prefix;

-- 2. Get the company ID for next steps (replace with actual ID from above)
-- Note: You'll need to replace 'COMPANY_ID_FROM_STEP_1' with the actual UUID returned above

-- 3. Test user creation (simulate what onboarding does)
-- INSERT INTO public.users (
--     id,
--     email,
--     full_name,
--     company_id,
--     role,
--     phone,
--     profile_picture_url,
--     preferences,
--     status
-- ) VALUES (
--     gen_random_uuid(),  -- In real onboarding, this comes from Supabase Auth
--     'test@testcompany.com',
--     'Test Owner',
--     'COMPANY_ID_FROM_STEP_1',  -- Replace with actual company ID
--     'owner',
--     null,
--     null,
--     '{}',
--     'ACTIVE'
-- ) RETURNING id, email, full_name, role;

-- 4. Test business settings creation
-- INSERT INTO public.business_settings (
--     company_id,
--     enable_auto_invoice,
--     default_tax_rate,
--     currency
-- ) VALUES (
--     'COMPANY_ID_FROM_STEP_1',  -- Replace with actual company ID
--     true,
--     0.0,
--     'USD'
-- ) RETURNING id, company_id, currency;

-- 5. Verify the test data was created
SELECT 'TEST RESULTS' as test_type, 'Checking test data...' as message;

-- Check companies
SELECT 'COMPANIES TEST' as check_type,
       count(*) as total_companies,
       count(*) FILTER (WHERE name LIKE 'Test Company%') as test_companies
FROM companies;

-- Check users  
SELECT 'USERS TEST' as check_type,
       count(*) as total_users,
       count(*) FILTER (WHERE email LIKE 'test@%') as test_users
FROM users;

-- Check business settings
SELECT 'BUSINESS_SETTINGS TEST' as check_type,
       count(*) as total_settings,
       count(*) FILTER (WHERE currency = 'USD') as usd_settings
FROM business_settings;

-- 6. Clean up test data (optional)
-- DELETE FROM business_settings WHERE company_id IN (SELECT id FROM companies WHERE name LIKE 'Test Company%');
-- DELETE FROM users WHERE email LIKE 'test@%';
-- DELETE FROM companies WHERE name LIKE 'Test Company%';

-- 7. Final verification that schema is ready for onboarding
SELECT 'ONBOARDING READINESS CHECK' as final_check, 'Schema should be ready' as message;

-- Check all required tables exist
SELECT 'REQUIRED TABLES' as check_type,
       string_agg(table_name, ', ') as existing_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('companies', 'users', 'business_settings', 'integration_settings');

-- Check all required columns exist on companies
SELECT 'COMPANIES REQUIRED COLUMNS' as check_type,
       string_agg(column_name, ', ') as existing_columns
FROM information_schema.columns 
WHERE table_name = 'companies' 
  AND table_schema = 'public'
  AND column_name IN ('name', 'status', 'invoice_prefix', 'invoice_start_number', 'timezone', 'phone', 'address');

-- Check all required columns exist on users
SELECT 'USERS REQUIRED COLUMNS' as check_type,
       string_agg(column_name, ', ') as existing_columns
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name IN ('id', 'email', 'full_name', 'company_id', 'role', 'phone', 'profile_picture_url', 'preferences', 'status');

-- Check RLS is disabled
SELECT 'RLS DISABLED CHECK' as check_type,
       string_agg(
           tablename || ':' || CASE WHEN rowsecurity THEN 'ON' ELSE 'OFF' END, 
           ', '
       ) as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('companies', 'users', 'business_settings', 'integration_settings');

SELECT 'SCHEMA FIX VERIFICATION COMPLETE' as final_status, 
       'If all checks show expected results, onboarding should work!' as message;
