-- Check customers table columns - look for 'name' column
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'customers'
  AND (column_name LIKE '%name%' OR column_name = 'status')
ORDER BY ordinal_position;

