-- Comprehensive schema audit to identify mismatches between DB and code expectations
-- Based on errors in logs.md

-- 1. Check companies table for missing/renamed columns
SELECT 'companies table columns' as audit_section;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema='public' AND table_name='companies'
ORDER BY column_name;

-- 2. Check settings table structure
SELECT 'settings table columns' as audit_section;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema='public' AND table_name='settings'
ORDER BY column_name;

-- 3. Check rate_cards table for active vs is_active column
SELECT 'rate_cards table columns' as audit_section;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema='public' AND table_name='rate_cards'
AND column_name IN ('active', 'is_active');

-- 4. Check for tags table existence
SELECT 'tags table existence' as audit_section;
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema='public' AND table_name='tags'
) as tags_table_exists;

-- 5. Check for company_tags table existence
SELECT 'company_tags table existence' as audit_section;
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema='public' AND table_name='company_tags'
) as company_tags_table_exists;

-- 6. Check for auto_accept_rules table existence
SELECT 'auto_accept_rules table existence' as audit_section;
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema='public' AND table_name='auto_accept_rules'
) as auto_accept_rules_table_exists;

-- 7. Check for integration_tokens table existence
SELECT 'integration_tokens table existence' as audit_section;
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema='public' AND table_name='integration_tokens'
) as integration_tokens_table_exists;

-- 8. Check profiles table for preferences column
SELECT 'profiles table preferences column' as audit_section;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema='public' AND table_name='profiles'
AND column_name = 'preferences';

-- 9. List all companies columns that code expects but might be missing
SELECT 'companies missing columns check' as audit_section;
SELECT 
  col.expected_column,
  CASE WHEN ic.column_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM (
  VALUES 
    ('company_logo_url'),
    ('accepts_emergency'),
    ('emergency_fee'),
    ('nights_weekends'),
    ('business_hours_start'),
    ('business_hours_end'),
    ('working_days'),
    ('default_buffer_before_minutes'),
    ('default_buffer_after_minutes'),
    ('job_buffer_minutes'),
    ('min_advance_booking_hours'),
    ('max_advance_booking_days'),
    ('enable_customer_self_scheduling'),
    ('auto_approve_customer_selections'),
    ('invoice_prefix'),
    ('invoice_start_number')
) AS col(expected_column)
LEFT JOIN information_schema.columns ic 
  ON ic.table_schema='public' 
  AND ic.table_name='companies' 
  AND ic.column_name = col.expected_column
ORDER BY status, col.expected_column;

-- 10. List all settings columns that exist
SELECT 'all settings columns' as audit_section;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema='public' AND table_name='settings'
ORDER BY column_name;

-- 11. Check if company_settings still exists (should be deprecated)
SELECT 'company_settings table existence' as audit_section;
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema='public' AND table_name='company_settings'
) as company_settings_exists;

-- 12. Sample data from settings table
SELECT 'settings table sample data' as audit_section;
SELECT * FROM settings LIMIT 1;

-- 13. Sample data from companies table
SELECT 'companies table sample data' as audit_section;
SELECT * FROM companies LIMIT 1;

