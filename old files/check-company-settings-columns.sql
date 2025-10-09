-- Check what columns exist in company_settings table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'company_settings'
ORDER BY ordinal_position;

-- Show the actual data
SELECT * FROM company_settings;

