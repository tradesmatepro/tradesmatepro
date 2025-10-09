-- Check which line items table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%work_order%item%'
ORDER BY table_name;

