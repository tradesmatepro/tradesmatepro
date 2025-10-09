-- ============================================
-- FIX USER COMPANY LINK
-- The user exists but has company_id = null
-- ============================================

-- 1. Check current state
SELECT 'CURRENT USER STATE' as check_type,
       id, email, full_name, company_id, role, status
FROM profiles
WHERE email = 'jeraldjsmith@gmail.com';

-- 2. Check if the company exists
SELECT 'COMPANY CHECK' as check_type,
       id, name, status
FROM companies
WHERE id = 'd8b9c013-fbc2-41d0-8957-8bfb887fe419';

-- 3. Link the user to the company
UPDATE profiles
SET company_id = 'd8b9c013-fbc2-41d0-8957-8bfb887fe419',
    role = 'OWNER',  -- First user should be owner
    updated_at = now()
WHERE email = 'jeraldjsmith@gmail.com';

-- 4. Create business_settings for the company (if it doesn't exist)
INSERT INTO business_settings (company_id, enable_auto_invoice, default_tax_rate, currency)
VALUES ('d8b9c013-fbc2-41d0-8957-8bfb887fe419', false, 0.0, 'USD')
ON CONFLICT (company_id) DO NOTHING;

-- 5. Verify the fix
SELECT 'FIXED USER STATE' as check_type,
       id, email, full_name, company_id, role, status
FROM profiles
WHERE email = 'jeraldjsmith@gmail.com';

-- 6. Check business_settings was created
SELECT 'BUSINESS_SETTINGS CHECK' as check_type,
       id, company_id, currency, enable_auto_invoice
FROM business_settings 
WHERE company_id = 'd8b9c013-fbc2-41d0-8957-8bfb887fe419';

-- 7. Test the queries that were failing
SELECT 'TEST BUSINESS_SETTINGS QUERY' as test_type,
       count(*) as found_records
FROM business_settings 
WHERE company_id = 'd8b9c013-fbc2-41d0-8957-8bfb887fe419';

SELECT 'TEST COMPANIES QUERY' as test_type,
       count(*) as found_records
FROM companies 
WHERE id = 'd8b9c013-fbc2-41d0-8957-8bfb887fe419';

SELECT 'TEST INTEGRATION_SETTINGS QUERY' as test_type,
       count(*) as found_records
FROM integration_settings 
WHERE company_id = 'd8b9c013-fbc2-41d0-8957-8bfb887fe419';

SELECT 'FIX COMPLETE' as final_status, 
       'User should now be linked to company and settings should load' as message;
