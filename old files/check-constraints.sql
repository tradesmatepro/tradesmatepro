-- Check all constraints on work_orders table
SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'work_orders'::regclass
ORDER BY conname;

