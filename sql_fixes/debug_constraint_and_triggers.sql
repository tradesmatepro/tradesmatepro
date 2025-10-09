-- Debug: Find the exact constraint and all triggers

-- 1. Show the EXACT constraint definition
SELECT 
    'CONSTRAINT DEFINITION:' as section,
    conname as constraint_name,
    pg_get_constraintdef(oid) as full_definition
FROM pg_constraint
WHERE conrelid = 'public.customers'::regclass
AND conname = 'chk_customers_status';

-- 2. Show ALL constraints on customers table
SELECT 
    'ALL CONSTRAINTS:' as section,
    conname as constraint_name,
    contype as type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.customers'::regclass
ORDER BY contype, conname;

-- 3. Show ALL triggers on customers table
SELECT 
    'ALL TRIGGERS:' as section,
    tgname as trigger_name,
    tgtype as trigger_type,
    tgenabled as enabled,
    proname as function_name,
    CASE 
        WHEN tgtype & 2 = 2 THEN 'BEFORE'
        WHEN tgtype & 64 = 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END as timing,
    CASE 
        WHEN tgtype & 4 = 4 THEN 'INSERT'
        WHEN tgtype & 8 = 8 THEN 'DELETE'
        WHEN tgtype & 16 = 16 THEN 'UPDATE'
        ELSE 'OTHER'
    END as event
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'public.customers'::regclass
AND NOT tgisinternal
ORDER BY tgname;

-- 4. Show the source code of handle_customer_changes_final function
SELECT 
    'TRIGGER FUNCTION SOURCE:' as section,
    proname as function_name,
    prosrc as source_code
FROM pg_proc
WHERE proname = 'handle_customer_changes_final';

-- 5. Test what the trigger actually does
DO $$
DECLARE
    test_id uuid := gen_random_uuid();
    test_company_id uuid := 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'::uuid;
    result_status text;
    result_is_active boolean;
BEGIN
    -- Insert a test customer with status='active'
    INSERT INTO customers (
        id,
        company_id,
        customer_number,
        type,
        first_name,
        last_name,
        email,
        phone,
        status
    ) VALUES (
        test_id,
        test_company_id,
        'CUST-TEST-001',
        'residential',
        'Test',
        'Customer',
        'test@test.com',
        '+15551234567',
        'active'
    )
    RETURNING status, is_active INTO result_status, result_is_active;
    
    RAISE NOTICE 'Test insert succeeded!';
    RAISE NOTICE 'Inserted status: %, is_active: %', result_status, result_is_active;
    
    -- Clean up
    DELETE FROM customers WHERE id = test_id;
    RAISE NOTICE 'Test customer deleted';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test insert FAILED: %', SQLERRM;
    RAISE NOTICE 'Error detail: %', SQLSTATE;
END $$;
