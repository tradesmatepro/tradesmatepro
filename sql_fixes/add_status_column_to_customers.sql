-- ========================================
-- ADD STATUS COLUMN TO CUSTOMERS TABLE
-- Industry standard: use status field instead of just is_active boolean
-- ========================================

-- Step 1: Add status column (text type for simplicity, lowercase values)
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Step 2: Populate status from existing is_active field
UPDATE customers 
SET status = CASE 
    WHEN is_active = true THEN 'active'
    WHEN is_active = false THEN 'inactive'
    ELSE 'active'
END;

-- Step 3: Add constraint to ensure only valid values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'chk_customers_status' AND table_name = 'customers'
    ) THEN
        ALTER TABLE customers
        ADD CONSTRAINT chk_customers_status
        CHECK (status IN ('active', 'inactive'));
    END IF;
END $$;

-- Step 4: Add customer_type column if it doesn't exist
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS customer_type customer_type_enum DEFAULT 'residential'::customer_type_enum;

-- Step 5: Populate customer_type from type field if needed
UPDATE customers 
SET customer_type = type::customer_type_enum
WHERE customer_type IS NULL AND type IS NOT NULL;

-- Step 6: Add display_name column if it doesn't exist
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Step 7: Populate display_name
UPDATE customers 
SET display_name = CASE 
    WHEN company_name IS NOT NULL AND trim(company_name) != '' THEN company_name
    WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN 
        trim(first_name || ' ' || last_name)
    WHEN first_name IS NOT NULL AND trim(first_name) != '' THEN first_name
    WHEN last_name IS NOT NULL AND trim(last_name) != '' THEN last_name
    ELSE 'Unnamed Customer'
END
WHERE display_name IS NULL;

-- Step 8: Create or replace trigger to keep status and is_active in sync
CREATE OR REPLACE FUNCTION sync_customer_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync status to is_active
    NEW.is_active := (NEW.status = 'active');
    
    -- Auto-update display_name
    NEW.display_name := CASE 
        WHEN NEW.company_name IS NOT NULL AND trim(NEW.company_name) != '' THEN NEW.company_name
        WHEN NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL THEN 
            trim(NEW.first_name || ' ' || NEW.last_name)
        WHEN NEW.first_name IS NOT NULL AND trim(NEW.first_name) != '' THEN NEW.first_name
        WHEN NEW.last_name IS NOT NULL AND trim(NEW.last_name) != '' THEN NEW.last_name
        ELSE 'Unnamed Customer'
    END;
    
    -- Ensure status is lowercase
    IF NEW.status IS NOT NULL THEN
        NEW.status := LOWER(NEW.status);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
DROP TRIGGER IF EXISTS trg_sync_customer_status ON customers;
CREATE TRIGGER trg_sync_customer_status
    BEFORE INSERT OR UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION sync_customer_status();

-- Verify the changes
SELECT 'Status column added successfully!' as result;
SELECT status, is_active, COUNT(*) as count
FROM customers 
GROUP BY status, is_active;
