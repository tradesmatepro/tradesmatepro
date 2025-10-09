-- Check all constraints on companies and profiles tables
SELECT 
    'companies' as table_name,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'companies'::regclass
UNION ALL
SELECT 
    'profiles' as table_name,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass
ORDER BY table_name, constraint_type, constraint_name;
