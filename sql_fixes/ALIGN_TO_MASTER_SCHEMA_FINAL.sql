-- ========================================
-- ALIGN CUSTOMERS TABLE TO MASTER SCHEMA
-- Based on: DEPLOY_MASTER_SCHEMA.sql and MASTER_DATABASE_SCHEMA_LOCKED.md
-- Industry Standard: Simple is_active boolean, not complex status enums
-- ========================================

-- STEP 1: Drop ALL status-related constraints and columns that aren't in master schema
ALTER TABLE customers DROP CONSTRAINT IF EXISTS chk_customers_status;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_status_check;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customer_status_check;

-- STEP 2: Drop columns that aren't in master schema (CASCADE to drop dependencies)
ALTER TABLE customers DROP COLUMN IF EXISTS status CASCADE;
ALTER TABLE customers DROP COLUMN IF EXISTS customer_type CASCADE;
ALTER TABLE customers DROP COLUMN IF EXISTS display_name CASCADE;
ALTER TABLE customers DROP COLUMN IF EXISTS status_reason CASCADE;
ALTER TABLE customers DROP COLUMN IF EXISTS status_changed_at CASCADE;

-- STEP 3: Ensure master schema columns exist with correct constraints
DO $$
BEGIN
    -- Ensure type column exists with correct constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'type') THEN
        ALTER TABLE customers ADD COLUMN type TEXT DEFAULT 'residential';
    END IF;
    
    -- Drop old type constraint if exists
    ALTER TABLE customers DROP CONSTRAINT IF EXISTS chk_customers_type;
    ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_type_check;
    
    -- Add correct type constraint (from master schema)
    ALTER TABLE customers ADD CONSTRAINT customers_type_check
        CHECK (type IN ('residential', 'commercial', 'industrial'));
    
    -- Ensure is_active exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'is_active') THEN
        ALTER TABLE customers ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Ensure customer_since exists (for tracking)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'customer_since') THEN
        ALTER TABLE customers ADD COLUMN customer_since DATE DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- STEP 4: Normalize existing data
UPDATE customers SET type = LOWER(type) WHERE type IS NOT NULL;
UPDATE customers SET is_active = COALESCE(is_active, TRUE) WHERE is_active IS NULL;

-- STEP 5: Create ONE simple trigger (master schema standard)
CREATE OR REPLACE FUNCTION handle_customer_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-generate customer number if missing
    IF NEW.customer_number IS NULL OR NEW.customer_number = '' THEN
        NEW.customer_number := generate_customer_number(NEW.company_id);
    END IF;
    
    -- Normalize type to lowercase
    IF NEW.type IS NOT NULL THEN
        NEW.type := LOWER(NEW.type);
    END IF;
    
    -- Ensure is_active has a value
    IF NEW.is_active IS NULL THEN
        NEW.is_active := TRUE;
    END IF;
    
    -- Ensure customer_since is set
    IF NEW.customer_since IS NULL THEN
        NEW.customer_since := CURRENT_DATE;
    END IF;
    
    -- Format phone numbers (if function exists)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'format_phone_e164') THEN
        NEW.phone := format_phone_e164(NEW.phone);
        NEW.mobile_phone := format_phone_e164(NEW.mobile_phone);
    END IF;
    
    -- Update updated_at timestamp
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop all old triggers
DROP TRIGGER IF EXISTS trg_handle_customer_changes ON customers;
DROP TRIGGER IF EXISTS trg_handle_customer_changes_final ON customers;
DROP TRIGGER IF EXISTS trg_sync_customer_status ON customers;
DROP TRIGGER IF EXISTS trg_normalize_customer_data ON customers;
DROP TRIGGER IF EXISTS trg_log_customer_status_change ON customers;

-- Create ONE trigger
CREATE TRIGGER trg_handle_customer_changes
    BEFORE INSERT OR UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION handle_customer_changes();

-- STEP 6: Verify the fix
SELECT 'Customers table aligned to master schema!' as result;

-- Show current columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'customers'
AND column_name IN ('type', 'is_active', 'status', 'customer_type', 'display_name')
ORDER BY column_name;

-- Show current constraints
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.customers'::regclass
AND (conname LIKE '%type%' OR conname LIKE '%status%' OR conname LIKE '%active%')
ORDER BY conname;

-- Test insert
DO $$
DECLARE
    test_id uuid := gen_random_uuid();
    test_company_id uuid := 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'::uuid;
    result_type text;
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
        is_active
    ) VALUES (
        test_id,
        test_company_id,
        'CUST-TEST-MASTER',
        'residential',
        'Test',
        'Customer',
        'test@test.com',
        '+15551234567',
        TRUE
    )
    RETURNING type, is_active INTO result_type, result_is_active;
    
    RAISE NOTICE '✅ Test insert SUCCEEDED!';
    RAISE NOTICE 'Type: %, is_active: %', result_type, result_is_active;
    
    -- Clean up
    DELETE FROM customers WHERE id = test_id;
    RAISE NOTICE '✅ Test customer deleted';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Test insert FAILED: %', SQLERRM;
    RAISE NOTICE 'Error code: %', SQLSTATE;
END $$;
