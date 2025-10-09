-- Find the enum type name for profiles.status
SELECT 
    c.column_name,
    t.typname as enum_type_name
FROM information_schema.columns c
JOIN pg_type t ON c.udt_name = t.typname
WHERE c.table_schema = 'public'
  AND c.table_name = 'profiles'
  AND c.column_name = 'status';

-- Get the enum values
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%profile%status%' OR t.typname LIKE '%user%status%'
ORDER BY t.typname, e.enumsortorder;

