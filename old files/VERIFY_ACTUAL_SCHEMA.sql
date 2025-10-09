-- ========================================
-- Verify What ACTUALLY Exists in Supabase
-- ========================================
-- Run this in Supabase SQL Editor to see the TRUTH
-- ========================================

-- Check if service_rates table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_rates') 
        THEN '✅ service_rates EXISTS'
        ELSE '❌ service_rates DOES NOT EXIST'
    END as service_rates_check;

-- Check if pricing_rules table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pricing_rules') 
        THEN '✅ pricing_rules EXISTS'
        ELSE '❌ pricing_rules DOES NOT EXIST'
    END as pricing_rules_check;

-- Check if rate_cards table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_cards') 
        THEN '✅ rate_cards EXISTS'
        ELSE '❌ rate_cards DOES NOT EXIST'
    END as rate_cards_check;

-- Check employees table structure
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;

-- Check profiles table structure  
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check foreign keys on employees table
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'employees';

-- Check what company_settings actually has
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'company_settings'
ORDER BY ordinal_position;

-- List ALL tables that actually exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

