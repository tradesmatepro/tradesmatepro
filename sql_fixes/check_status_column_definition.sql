-- Check the actual column definition for status field
SELECT 
    column_name,
    data_type,
    udt_name,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'customers' AND column_name = 'status';

-- Check if there's an enum type
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%status%'
ORDER BY t.typname, e.enumsortorder;

-- Check current actual values in database
SELECT DISTINCT status, LENGTH(status) as len, ASCII(SUBSTRING(status, 1, 1)) as first_char_ascii
FROM customers;

-- Check all triggers on customers table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'customers'
ORDER BY trigger_name;
