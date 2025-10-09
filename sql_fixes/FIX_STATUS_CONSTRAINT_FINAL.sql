-- ========================================
-- FINAL FIX: Status Constraint Mismatch
-- ROOT CAUSE: Constraint expects UPPERCASE but app sends lowercase
-- SOLUTION: Fix constraint to accept lowercase (industry standard)
-- ========================================

-- STEP 1: Drop the incorrect UPPERCASE constraint
ALTER TABLE customers DROP CONSTRAINT IF EXISTS chk_customers_status;

-- STEP 2: Add correct lowercase constraint (industry standard)
ALTER TABLE customers ADD CONSTRAINT chk_customers_status 
    CHECK (status IN ('active', 'inactive'));

-- STEP 3: Normalize any existing uppercase values to lowercase
UPDATE customers 
SET status = LOWER(status)
WHERE status IS NOT NULL;

-- STEP 4: Verify the fix
SELECT 'Constraint fixed! Now accepts lowercase values.' as result;

-- Show the new constraint definition
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.customers'::regclass
AND conname = 'chk_customers_status';

-- Test insert
DO $$
DECLARE
    test_id uuid := gen_random_uuid();
    test_company_id uuid := 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'::uuid;
    result_status text;
    result_is_active boolean;
BEGIN
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
        'CUST-TEST-999',
        'residential',
        'Test',
        'Customer',
        'test@test.com',
        '+15551234567',
        'active'
    )
    RETURNING status, is_active INTO result_status, result_is_active;
    
    RAISE NOTICE '✅ Test insert SUCCEEDED!';
    RAISE NOTICE 'Status: %, is_active: %', result_status, result_is_active;
    
    -- Clean up
    DELETE FROM customers WHERE id = test_id;
    RAISE NOTICE '✅ Test customer deleted';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Test insert FAILED: %', SQLERRM;
END $$;
