-- ========================================
-- STEP-BY-STEP CUSTOMER CREATION FIX
-- Fix the immediate customer creation issue first
-- ========================================

-- 1. ADD MISSING COLUMNS TO CUSTOMERS TABLE
DO $$
BEGIN
    -- Add customer_type column if it doesn't exist (for enum compatibility)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'customer_type') THEN
        ALTER TABLE customers ADD COLUMN customer_type customer_type_enum DEFAULT 'residential';
        
        -- Migrate existing data from 'type' to 'customer_type' if needed
        UPDATE customers SET customer_type = 
            CASE 
                WHEN type = 'residential' THEN 'residential'::customer_type_enum
                WHEN type = 'commercial' THEN 'commercial'::customer_type_enum
                WHEN type = 'industrial' THEN 'industrial'::customer_type_enum
                ELSE 'residential'::customer_type_enum
            END
        WHERE customer_type IS NULL;
    END IF;
    
    -- Add status column for compatibility (maps to is_active)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'status') THEN
        ALTER TABLE customers ADD COLUMN status TEXT DEFAULT 'ACTIVE' 
            CHECK (status IN ('ACTIVE', 'INACTIVE'));
        
        -- Sync with is_active field
        UPDATE customers SET status = CASE WHEN is_active THEN 'ACTIVE' ELSE 'INACTIVE' END;
    END IF;
    
    -- Add display_name column for easier queries
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'display_name') THEN
        ALTER TABLE customers ADD COLUMN display_name TEXT;
        
        -- Populate existing records
        UPDATE customers SET display_name = 
            CASE 
                WHEN company_name IS NOT NULL AND company_name != '' THEN company_name
                WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN 
                    CONCAT(first_name, ' ', last_name)
                WHEN first_name IS NOT NULL THEN first_name
                WHEN last_name IS NOT NULL THEN last_name
                ELSE 'Unnamed Customer'
            END;
    END IF;
    
    -- Add customer_since default if null
    UPDATE customers SET customer_since = created_at::date WHERE customer_since IS NULL;
    
END $$;

-- 2. ADD COMPANY_ID TO CUSTOMER_ADDRESSES IF MISSING
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customer_addresses' AND column_name = 'company_id') THEN
        ALTER TABLE customer_addresses ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
        
        -- Populate company_id from customers table
        UPDATE customer_addresses ca 
        SET company_id = c.company_id 
        FROM customers c 
        WHERE ca.customer_id = c.id AND ca.company_id IS NULL;
        
        -- Make it NOT NULL after population (only if we have data)
        IF EXISTS (SELECT 1 FROM customer_addresses WHERE company_id IS NOT NULL) THEN
            ALTER TABLE customer_addresses ALTER COLUMN company_id SET NOT NULL;
        END IF;
    END IF;
END $$;

-- 3. CREATE FUNCTION TO SYNC CUSTOMER STATUS AND DISPLAY NAME
CREATE OR REPLACE FUNCTION sync_customer_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync status with is_active
    IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.is_active := (NEW.status = 'ACTIVE');
    END IF;
    
    IF TG_OP = 'INSERT' OR NEW.is_active IS DISTINCT FROM OLD.is_active THEN
        NEW.status := CASE WHEN NEW.is_active THEN 'ACTIVE' ELSE 'INACTIVE' END;
    END IF;
    
    -- Update display_name when name fields change
    NEW.display_name := CASE 
        WHEN NEW.company_name IS NOT NULL AND NEW.company_name != '' THEN NEW.company_name
        WHEN NEW.first_name IS NOT NULL AND NEW.last_name IS NOT NULL THEN 
            CONCAT(NEW.first_name, ' ', NEW.last_name)
        WHEN NEW.first_name IS NOT NULL THEN NEW.first_name
        WHEN NEW.last_name IS NOT NULL THEN NEW.last_name
        ELSE 'Unnamed Customer'
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE TRIGGER FOR CUSTOMER FIELD SYNC
DROP TRIGGER IF EXISTS trg_sync_customer_fields ON customers;
CREATE TRIGGER trg_sync_customer_fields
    BEFORE INSERT OR UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION sync_customer_fields();

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_display_name ON customers(display_name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- 6. GRANT PERMISSIONS
GRANT ALL ON customers TO authenticated;
GRANT ALL ON customer_addresses TO authenticated;
GRANT ALL ON customer_contacts TO authenticated;
GRANT ALL ON customer_tags TO authenticated;

-- Success message
SELECT 'Customer creation system fixed!' as result,
       'Added customer_type, status, display_name columns and sync triggers' as changes;
