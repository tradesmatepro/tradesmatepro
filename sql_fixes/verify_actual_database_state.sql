-- ========================================
-- VERIFY ACTUAL DATABASE STATE
-- Check what columns, constraints, and triggers actually exist
-- ========================================

-- 1. Check all columns in customers table
SELECT 
    'CUSTOMERS TABLE COLUMNS:' as info;
    
SELECT 
    column_name,
    data_type,
    udt_name,
    column_default,
    is_nullable,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'customers'
ORDER BY ordinal_position;

-- 2. Check all constraints on customers table
SELECT 
    'CUSTOMERS TABLE CONSTRAINTS:' as info;
    
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public' 
AND table_name = 'customers'
ORDER BY constraint_type, constraint_name;

-- 3. Check constraint definitions
SELECT 
    'CONSTRAINT DEFINITIONS:' as info;
    
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.customers'::regclass
ORDER BY conname;

-- 4. Check all triggers on customers table
SELECT 
    'CUSTOMERS TABLE TRIGGERS:' as info;
    
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public' 
AND event_object_table = 'customers'
ORDER BY trigger_name;

-- 5. Check trigger function definitions
SELECT 
    'TRIGGER FUNCTION DEFINITIONS:' as info;
    
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc
WHERE proname IN (
    'handle_customer_changes',
    'handle_customer_changes_final',
    'sync_customer_status',
    'normalize_customer_data',
    'auto_generate_customer_number',
    'generate_customer_number',
    'format_phone_e164'
)
ORDER BY proname;

-- 6. Check if customer_type_enum exists
SELECT 
    'CUSTOMER TYPE ENUM:' as info;
    
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'customer_type_enum'
ORDER BY e.enumsortorder;

-- 7. Check sample customer data
SELECT 
    'SAMPLE CUSTOMER DATA:' as info;
    
SELECT 
    id,
    customer_number,
    type,
    first_name,
    last_name,
    company_name,
    email,
    phone,
    is_active,
    created_at
FROM customers
ORDER BY created_at DESC
LIMIT 3;

-- 8. Try to select columns that might not exist
DO $$
BEGIN
    BEGIN
        PERFORM status FROM customers LIMIT 1;
        RAISE NOTICE 'Column "status" EXISTS';
    EXCEPTION WHEN undefined_column THEN
        RAISE NOTICE 'Column "status" DOES NOT EXIST';
    END;
    
    BEGIN
        PERFORM customer_type FROM customers LIMIT 1;
        RAISE NOTICE 'Column "customer_type" EXISTS';
    EXCEPTION WHEN undefined_column THEN
        RAISE NOTICE 'Column "customer_type" DOES NOT EXIST';
    END;
    
    BEGIN
        PERFORM display_name FROM customers LIMIT 1;
        RAISE NOTICE 'Column "display_name" EXISTS';
    EXCEPTION WHEN undefined_column THEN
        RAISE NOTICE 'Column "display_name" DOES NOT EXIST';
    END;
END $$;
