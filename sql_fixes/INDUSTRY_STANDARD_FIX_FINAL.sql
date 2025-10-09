-- ========================================
-- INDUSTRY STANDARD CUSTOMER STATUS FIX
-- Based on: Stripe, GitHub, Salesforce, ServiceTitan patterns
-- Standard: lowercase in DB, uppercase in code constants
-- ========================================

-- STEP 1: Drop ALL conflicting status constraints
ALTER TABLE customers DROP CONSTRAINT IF EXISTS chk_customers_status CASCADE;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_status_check CASCADE;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customer_status_check CASCADE;

-- STEP 2: Ensure status column exists (TEXT type, lowercase values)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'status') THEN
        ALTER TABLE customers ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
END $$;

-- STEP 3: Migrate from is_active to status (if needed)
UPDATE customers 
SET status = CASE 
    WHEN is_active = TRUE THEN 'active'
    WHEN is_active = FALSE THEN 'inactive'
    ELSE 'active'
END
WHERE status IS NULL OR status = '';

-- STEP 4: Normalize all existing status values to lowercase
UPDATE customers 
SET status = LOWER(status)
WHERE status IS NOT NULL;

-- STEP 5: Add industry-standard constraint (lowercase values)
-- Industry standard: active, inactive (simple)
-- Extended: suspended, archived (optional for future)
ALTER TABLE customers ADD CONSTRAINT customers_status_check
    CHECK (status IN ('active', 'inactive', 'suspended', 'archived'));

-- STEP 6: Ensure type column uses lowercase (industry standard)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'type') THEN
        ALTER TABLE customers ADD COLUMN type TEXT DEFAULT 'residential';
    END IF;
END $$;

-- Normalize type values to lowercase
UPDATE customers 
SET type = LOWER(type)
WHERE type IS NOT NULL;

-- Drop old type constraints
ALTER TABLE customers DROP CONSTRAINT IF EXISTS chk_customers_type CASCADE;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_type_check CASCADE;

-- Add industry-standard type constraint (lowercase)
ALTER TABLE customers ADD CONSTRAINT customers_type_check
    CHECK (type IN ('residential', 'commercial', 'industrial', 'government'));

-- STEP 7: Create ONE comprehensive trigger (industry standard)
CREATE OR REPLACE FUNCTION handle_customer_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-generate customer number if missing
    IF NEW.customer_number IS NULL OR NEW.customer_number = '' THEN
        NEW.customer_number := generate_customer_number(NEW.company_id);
    END IF;
    
    -- Normalize status to lowercase (industry standard)
    IF NEW.status IS NOT NULL THEN
        NEW.status := LOWER(NEW.status);
    ELSE
        NEW.status := 'active';
    END IF;
    
    -- Sync is_active from status (for backward compatibility)
    NEW.is_active := (NEW.status = 'active');
    
    -- Normalize type to lowercase (industry standard)
    IF NEW.type IS NOT NULL THEN
        NEW.type := LOWER(NEW.type);
    ELSE
        NEW.type := 'residential';
    END IF;
    
    -- Format phone numbers (if function exists)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'format_phone_e164') THEN
        NEW.phone := format_phone_e164(NEW.phone);
        NEW.mobile_phone := format_phone_e164(NEW.mobile_phone);
    END IF;
    
    -- Ensure customer_since is set
    IF NEW.customer_since IS NULL THEN
        NEW.customer_since := CURRENT_DATE;
    END IF;
    
    -- Update updated_at timestamp
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop all old triggers
DROP TRIGGER IF EXISTS trg_handle_customer_changes ON customers CASCADE;
DROP TRIGGER IF EXISTS trg_handle_customer_changes_final ON customers CASCADE;
DROP TRIGGER IF EXISTS trg_sync_customer_status ON customers CASCADE;
DROP TRIGGER IF EXISTS trg_normalize_customer_data ON customers CASCADE;
DROP TRIGGER IF EXISTS trg_log_customer_status_change ON customers CASCADE;

-- Create ONE trigger
CREATE TRIGGER trg_handle_customer_changes
    BEFORE INSERT OR UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION handle_customer_changes();

-- STEP 8: Verify the fix
SELECT 'Industry standard fix applied!' as result;

-- Show current status values
SELECT DISTINCT status, COUNT(*) as count
FROM customers
GROUP BY status
ORDER BY status;

-- Show current constraints
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.customers'::regclass
AND (conname LIKE '%status%' OR conname LIKE '%type%')
ORDER BY conname;

-- Test insert with lowercase status
DO $$
DECLARE
    test_id uuid := gen_random_uuid();
    test_company_id uuid := 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'::uuid;
    result_status text;
    result_is_active boolean;
    result_type text;
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
        'CUST-TEST-STD',
        'residential',
        'Test',
        'Customer',
        'test@test.com',
        '+15551234567',
        'active'
    )
    RETURNING status, is_active, type INTO result_status, result_is_active, result_type;
    
    RAISE NOTICE '✅ Test insert SUCCEEDED!';
    RAISE NOTICE 'Status: %, is_active: %, type: %', result_status, result_is_active, result_type;
    
    -- Clean up
    DELETE FROM customers WHERE id = test_id;
    RAISE NOTICE '✅ Test customer deleted';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Test insert FAILED: %', SQLERRM;
    RAISE NOTICE 'Error code: %', SQLSTATE;
END $$;
