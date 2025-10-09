-- Cleanup Test Users Script
-- Run this in Supabase SQL Editor to clean up test data

-- 1. Delete test customer portal accounts
DELETE FROM public.customer_portal_accounts 
WHERE email IN ('test@gmail.com', 'test@example.com');

-- 2. Delete test customers (if any exist)
DELETE FROM public.customers 
WHERE email IN ('test@gmail.com', 'test@example.com');

-- 3. Delete test auth users (requires admin privileges)
-- Note: You may need to delete these manually in Supabase Auth dashboard
-- or use the Supabase CLI/Admin API

-- Check what's left
SELECT 'Cleanup Complete' as status;
SELECT COUNT(*) as remaining_portal_accounts FROM public.customer_portal_accounts;
SELECT COUNT(*) as remaining_customers FROM public.customers;
