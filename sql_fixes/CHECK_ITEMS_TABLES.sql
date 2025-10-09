-- Check what tables exist for storing quote/work order items
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%item%'
ORDER BY table_name;

