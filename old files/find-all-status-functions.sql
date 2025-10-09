-- Find ALL functions with "status" in the name
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name ILIKE '%status%'
ORDER BY routine_name;

