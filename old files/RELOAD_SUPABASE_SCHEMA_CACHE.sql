-- ========================================
-- RELOAD SUPABASE SCHEMA CACHE
-- ========================================
-- This fixes the "table not found in schema cache" errors
-- Run this in Supabase SQL Editor
-- ========================================

-- Method 1: Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Method 2: If that doesn't work, restart PostgREST by toggling a setting
-- (This forces Supabase to restart the PostgREST service)

-- Verify tables exist
SELECT 'Verifying tables exist...' as status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_rates') 
        THEN '✅ service_rates EXISTS'
        ELSE '❌ service_rates MISSING - CREATE IT!'
    END as service_rates_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pricing_rules') 
        THEN '✅ pricing_rules EXISTS'
        ELSE '❌ pricing_rules MISSING - CREATE IT!'
    END as pricing_rules_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_cards') 
        THEN '✅ rate_cards EXISTS'
        ELSE '❌ rate_cards MISSING - CREATE IT!'
    END as rate_cards_status;

-- If tables exist, check row counts
SELECT 'service_rates' as table_name, COUNT(*) as row_count FROM service_rates;
SELECT 'pricing_rules' as table_name, COUNT(*) as row_count FROM pricing_rules;
SELECT 'rate_cards' as table_name, COUNT(*) as row_count FROM rate_cards;

SELECT '✅ Schema cache reload requested!' as status;
SELECT 'Wait 10-30 seconds, then test your app' as next_step;

