-- Check the phone constraint on profiles table
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass
AND conname LIKE '%phone%';

-- Also check companies table phone constraint for comparison
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'companies'::regclass
AND conname LIKE '%phone%';

-- Test the phone format that failed
SELECT 
    '5417050524' ~ '^\+[1-9]\d{1,14}$' as raw_phone_matches,
    '+15417050524' ~ '^\+[1-9]\d{1,14}$' as formatted_phone_matches;
