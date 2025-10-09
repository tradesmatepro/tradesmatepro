-- Find what depends on the status column
SELECT 
    'TRIGGERS USING STATUS:' as section;
    
SELECT 
    tgname as trigger_name,
    proname as function_name,
    prosrc as source_code
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.customers'::regclass
AND NOT tgisinternal
AND prosrc LIKE '%status%';

SELECT 
    'VIEWS USING STATUS:' as section;
    
SELECT 
    viewname,
    definition
FROM pg_views
WHERE schemaname = 'public'
AND definition LIKE '%customers%'
AND definition LIKE '%status%';

SELECT 
    'FUNCTIONS USING STATUS:' as section;
    
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
AND prosrc LIKE '%customers%'
AND prosrc LIKE '%status%'
LIMIT 10;
