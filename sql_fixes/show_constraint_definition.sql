-- Show the exact constraint definition that's failing
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.customers'::regclass
AND conname LIKE '%status%';
