-- Fix customer_addresses table issues
-- Run this in your Supabase SQL editor

-- Check if RLS is enabled on customer_addresses
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'customer_addresses';

-- Disable RLS on customer_addresses table (since RLS is disabled for beta)
ALTER TABLE customer_addresses DISABLE ROW LEVEL SECURITY;

-- Check table structure
\d customer_addresses;

-- Test insert to see if there are any constraints or issues
-- (This will help identify the problem)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customer_addresses' 
ORDER BY ordinal_position;

-- Check for any foreign key constraints that might be failing
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
    AND tc.table_name = 'customer_addresses';

-- Test a simple insert to see what happens
-- Replace with actual customer_id and company_id from your database
/*
INSERT INTO customer_addresses (
    customer_id,
    company_id,
    address_type,
    address_name,
    address_line_1,
    city,
    state,
    zip_code,
    is_primary
) VALUES (
    'your-customer-id-here',
    'your-company-id-here',
    'SERVICE',
    'Test Location',
    '123 Test St',
    'Test City',
    'CA',
    '12345',
    false
);
*/
