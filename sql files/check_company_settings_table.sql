-- Check company_settings table structure and issues
-- Run this in your Supabase SQL editor

-- Check if company_settings table exists
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'company_settings';

-- Check the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'company_settings'
ORDER BY ordinal_position;

-- Check if there are any existing records
SELECT company_id, invoice_number_prefix, default_payment_terms, default_due_days
FROM company_settings 
LIMIT 5;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'company_settings';

-- Check for any constraints that might be causing issues
SELECT constraint_name, constraint_type, table_name
FROM information_schema.table_constraints 
WHERE table_name = 'company_settings';

-- Check for any foreign key constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='company_settings';
