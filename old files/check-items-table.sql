-- Check what items tables exist
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (table_name LIKE '%order%item%' OR table_name LIKE '%quote%item%')
ORDER BY table_name, ordinal_position;

