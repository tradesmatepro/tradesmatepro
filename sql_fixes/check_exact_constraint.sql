-- Check the exact constraint that's failing
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'public.customers'::regclass
AND conname = 'chk_customers_status';

-- Check if there are multiple status constraints
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.customers'::regclass
AND conname LIKE '%status%';

-- Try to insert a test row to see the exact error
DO $$
BEGIN
    INSERT INTO customers (
        company_id,
        customer_number,
        type,
        first_name,
        last_name,
        email,
        phone,
        status
    ) VALUES (
        'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'::uuid,
        'CUST-999999',
        'residential',
        'Test',
        'Customer',
        'test@test.com',
        '+15551234567',
        'active'
    );
    
    RAISE NOTICE 'Test insert succeeded!';
    
    -- Clean up
    DELETE FROM customers WHERE customer_number = 'CUST-999999';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test insert failed: %', SQLERRM;
END $$;
