-- ========================================
-- FINAL FIX: Remove ALL conflicting triggers and create ONE correct trigger
-- Industry standard: lowercase status values, proper sync logic
-- ========================================

-- STEP 1: Drop ALL existing customer triggers to start clean
DROP TRIGGER IF EXISTS trg_handle_customer_changes ON customers;
DROP TRIGGER IF EXISTS trg_sync_customer_status ON customers;
DROP TRIGGER IF EXISTS trg_normalize_customer_data ON customers;
DROP TRIGGER IF EXISTS trg_normalize_customer_status ON customers;
DROP TRIGGER IF EXISTS trg_auto_customer_number ON customers;
DROP TRIGGER IF EXISTS trg_sync_customer_fields ON customers;
DROP TRIGGER IF EXISTS trg_auto_format_customer_phones ON customers;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;

-- STEP 2: Drop ALL existing customer trigger functions
DROP FUNCTION IF EXISTS handle_customer_changes() CASCADE;
DROP FUNCTION IF EXISTS sync_customer_status() CASCADE;
DROP FUNCTION IF EXISTS normalize_customer_data() CASCADE;
DROP FUNCTION IF EXISTS normalize_customer_status() CASCADE;

-- STEP 3: Create ONE comprehensive, correct trigger function
CREATE OR REPLACE FUNCTION handle_customer_changes_final()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-generate customer number if missing
    IF NEW.customer_number IS NULL OR NEW.customer_number = '' THEN
        NEW.customer_number := generate_customer_number(NEW.company_id);
    END IF;
    
    -- CRITICAL: Normalize status to lowercase FIRST
    IF NEW.status IS NOT NULL THEN
        NEW.status := LOWER(NEW.status);
    END IF;
    
    -- Sync is_active from status (lowercase comparison)
    IF NEW.status IS NOT NULL THEN
        NEW.is_active := (NEW.status = 'active');
    ELSIF NEW.is_active IS NOT NULL THEN
        -- If only is_active is set, derive status from it
        NEW.status := CASE WHEN NEW.is_active THEN 'active' ELSE 'inactive' END;
    ELSE
        -- Default to active if neither is set
        NEW.status := 'active';
        NEW.is_active := true;
    END IF;
    
    -- Update display_name
    NEW.display_name := CASE 
        WHEN NEW.company_name IS NOT NULL AND trim(NEW.company_name) != '' THEN NEW.company_name
        WHEN NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL THEN 
            trim(NEW.first_name || ' ' || NEW.last_name)
        WHEN NEW.first_name IS NOT NULL AND trim(NEW.first_name) != '' THEN NEW.first_name
        WHEN NEW.last_name IS NOT NULL AND trim(NEW.last_name) != '' THEN NEW.last_name
        ELSE 'Unnamed Customer'
    END;
    
    -- Ensure customer_since is set
    IF NEW.customer_since IS NULL THEN
        NEW.customer_since := CURRENT_DATE;
    END IF;
    
    -- Format phone numbers using the E.164 function (if it exists)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'format_phone_e164') THEN
        NEW.phone := format_phone_e164(NEW.phone);
        NEW.mobile_phone := format_phone_e164(NEW.mobile_phone);
    END IF;
    
    -- Ensure customer_type and type are in sync (lowercase)
    IF NEW.customer_type IS NOT NULL THEN
        NEW.type := LOWER(NEW.customer_type::text);
    ELSIF NEW.type IS NOT NULL THEN
        NEW.customer_type := LOWER(NEW.type)::customer_type_enum;
    ELSE
        -- Default to residential
        NEW.customer_type := 'residential'::customer_type_enum;
        NEW.type := 'residential';
    END IF;
    
    -- Update updated_at timestamp
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 4: Create the ONE trigger
CREATE TRIGGER trg_handle_customer_changes_final
    BEFORE INSERT OR UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION handle_customer_changes_final();

-- STEP 5: Recreate the audit trigger (runs AFTER our main trigger)
DROP TRIGGER IF EXISTS trg_audit_customers ON customers;
CREATE TRIGGER trg_audit_customers
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- STEP 6: Update existing customers to have correct lowercase status
UPDATE customers 
SET status = 'active'
WHERE is_active = true AND (status IS NULL OR UPPER(status) = 'ACTIVE');

UPDATE customers 
SET status = 'inactive'
WHERE is_active = false AND (status IS NULL OR UPPER(status) = 'INACTIVE');

-- STEP 7: Verify the fix
SELECT 'Customer triggers fixed!' as result;

-- Show current trigger setup
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'customers'
ORDER BY action_timing, trigger_name;

-- Show current customer data
SELECT 
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
