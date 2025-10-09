-- Debug customer creation issue
-- Check current state of customers table

-- 1. Check if status column exists and its type
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'customers' 
AND column_name IN ('status', 'is_active', 'customer_type', 'type', 'display_name')
ORDER BY column_name;

-- 2. Check constraints on customers table
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'customers' 
AND constraint_name LIKE '%status%'
ORDER BY constraint_name;

-- 3. Check the actual constraint definition
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'customers'::regclass
AND conname LIKE '%status%';

-- 4. Check current customer data
SELECT 
    id,
    customer_number,
    first_name,
    last_name,
    company_name,
    display_name,
    status,
    is_active,
    customer_type,
    type
FROM customers
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check all triggers on customers table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'customers'
ORDER BY trigger_name;
