-- FULL SCHEMA AUDIT FOR SETTINGS DATABASE PANEL
-- This will show EXACTLY what columns exist in companies and settings tables

-- 1. COMPANIES TABLE COLUMNS
SELECT 
  'COMPANIES TABLE' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'companies'
ORDER BY ordinal_position;

-- 2. SETTINGS TABLE COLUMNS
SELECT 
  'SETTINGS TABLE' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'settings'
ORDER BY ordinal_position;

-- 3. CHECK FOR SPECIFIC COLUMNS MENTIONED IN ERROR
SELECT 
  'COLUMN CHECK' as check_type,
  'quote_terms in companies' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'companies' 
      AND column_name = 'quote_terms'
  ) THEN 'EXISTS ✅' ELSE 'MISSING ❌' END as result
UNION ALL
SELECT 
  'COLUMN CHECK',
  'quote_terms in settings',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'settings' 
      AND column_name = 'quote_terms'
  ) THEN 'EXISTS ✅' ELSE 'MISSING ❌' END
UNION ALL
SELECT 
  'COLUMN CHECK',
  'invoice_footer in companies',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'companies' 
      AND column_name = 'invoice_footer'
  ) THEN 'EXISTS ✅' ELSE 'MISSING ❌' END
UNION ALL
SELECT 
  'COLUMN CHECK',
  'invoice_footer in settings',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'settings' 
      AND column_name = 'invoice_footer'
  ) THEN 'EXISTS ✅' ELSE 'MISSING ❌' END;

