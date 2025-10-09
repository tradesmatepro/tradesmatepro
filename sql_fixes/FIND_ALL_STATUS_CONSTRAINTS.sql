-- Find EVERY constraint on customers table that mentions status
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.customers'::regclass
AND (
    conname LIKE '%status%' 
    OR pg_get_constraintdef(oid) LIKE '%status%'
)
ORDER BY conname;
