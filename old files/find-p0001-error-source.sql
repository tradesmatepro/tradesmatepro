-- P0001 is RAISE EXCEPTION in PostgreSQL
-- Find ALL functions that RAISE this specific error message

SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as full_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND pg_get_functiondef(p.oid) ILIKE '%Invalid status transition%'
ORDER BY p.proname;

