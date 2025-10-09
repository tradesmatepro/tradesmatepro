-- ========================================
-- COMPLETE CUSTOMER SYSTEM STANDARDIZATION
-- Industry Standard Customer Management System
-- Based on ServiceTitan, Jobber, Housecall Pro analysis
-- ========================================

-- 1. VERIFY CUSTOMER TABLE STRUCTURE
-- Check if we need to add any missing industry-standard columns
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
    
    -- Add display_name column for easier queries (will be populated by trigger)
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

-- 2. CREATE CUSTOMER PREFERENCES TABLE (Industry Standard)
CREATE TABLE IF NOT EXISTS customer_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    preference_key TEXT NOT NULL,
    preference_value TEXT,
    preference_type TEXT DEFAULT 'string' CHECK (preference_type IN ('string', 'boolean', 'number', 'json')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_customer_preference UNIQUE (customer_id, preference_key)
);

-- 3. CREATE CUSTOMER SERVICE HISTORY TABLE (Industry Standard)
CREATE TABLE IF NOT EXISTS customer_service_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
    service_date DATE NOT NULL,
    service_type TEXT,
    technician_notes TEXT,
    customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating BETWEEN 1 AND 5),
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE CUSTOMER BILLING PROFILES TABLE (Industry Standard)
CREATE TABLE IF NOT EXISTS customer_billing_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    profile_name TEXT NOT NULL DEFAULT 'Default',
    payment_method TEXT CHECK (payment_method IN ('cash', 'check', 'credit_card', 'ach', 'financing')),
    billing_address_id UUID REFERENCES customer_addresses(id),
    auto_pay_enabled BOOLEAN DEFAULT false,
    credit_limit NUMERIC(10,2) DEFAULT 0.00,
    payment_terms TEXT DEFAULT 'NET30',
    tax_exempt BOOLEAN DEFAULT false,
    tax_exempt_certificate TEXT,
    is_default BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_default_billing_profile EXCLUDE USING btree (customer_id WITH =) WHERE (is_default = true)
);

-- 5. UPDATE CUSTOMER_ADDRESSES TABLE FOR INDUSTRY STANDARDS
DO $$
BEGIN
    -- Add company_id for proper multi-tenant support
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customer_addresses' AND column_name = 'company_id') THEN
        ALTER TABLE customer_addresses ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
        
        -- Populate company_id from customers table
        UPDATE customer_addresses ca 
        SET company_id = c.company_id 
        FROM customers c 
        WHERE ca.customer_id = c.id AND ca.company_id IS NULL;
        
        -- Make it NOT NULL after population
        ALTER TABLE customer_addresses ALTER COLUMN company_id SET NOT NULL;
    END IF;
    
    -- Rename type to address_type for clarity
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'customer_addresses' AND column_name = 'type') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'customer_addresses' AND column_name = 'address_type') THEN
        ALTER TABLE customer_addresses RENAME COLUMN type TO address_type;
    END IF;
    
    -- Add geocoding status for service routing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customer_addresses' AND column_name = 'geocoded') THEN
        ALTER TABLE customer_addresses ADD COLUMN geocoded BOOLEAN DEFAULT false;
    END IF;
    
    -- Add service zone for territory management
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customer_addresses' AND column_name = 'service_zone') THEN
        ALTER TABLE customer_addresses ADD COLUMN service_zone TEXT;
    END IF;
END $$;

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_display_name ON customers(display_name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

CREATE INDEX IF NOT EXISTS idx_customer_preferences_customer_id ON customer_preferences(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_preferences_key ON customer_preferences(preference_key);

CREATE INDEX IF NOT EXISTS idx_customer_service_history_customer_id ON customer_service_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_service_history_service_date ON customer_service_history(service_date);
CREATE INDEX IF NOT EXISTS idx_customer_service_history_work_order_id ON customer_service_history(work_order_id);

CREATE INDEX IF NOT EXISTS idx_customer_billing_profiles_customer_id ON customer_billing_profiles(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_company_id ON customer_addresses(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_geocoded ON customer_addresses(geocoded);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_service_zone ON customer_addresses(service_zone);

-- 7. ENABLE ROW LEVEL SECURITY
ALTER TABLE customer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_service_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_billing_profiles ENABLE ROW LEVEL SECURITY;

-- 8. CREATE RLS POLICIES
CREATE POLICY "Users can manage customer preferences for their company customers" 
ON customer_preferences FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM customers c 
        WHERE c.id = customer_preferences.customer_id 
        AND c.company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
);

CREATE POLICY "Users can manage customer service history for their company customers" 
ON customer_service_history FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM customers c 
        WHERE c.id = customer_service_history.customer_id 
        AND c.company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
);

CREATE POLICY "Users can manage customer billing profiles for their company customers" 
ON customer_billing_profiles FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM customers c 
        WHERE c.id = customer_billing_profiles.customer_id 
        AND c.company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
);

-- 9. CREATE TRIGGERS
CREATE TRIGGER update_customer_preferences_updated_at
    BEFORE UPDATE ON customer_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_service_history_updated_at
    BEFORE UPDATE ON customer_service_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_billing_profiles_updated_at
    BEFORE UPDATE ON customer_billing_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. CREATE HELPER FUNCTIONS

-- Function to sync customer status with is_active and update display_name
CREATE OR REPLACE FUNCTION sync_customer_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync status with is_active
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.is_active := (NEW.status = 'ACTIVE');
    END IF;

    IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
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

CREATE TRIGGER trg_sync_customer_status
    BEFORE INSERT OR UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION sync_customer_status();

-- Function to create default billing profile
CREATE OR REPLACE FUNCTION create_default_billing_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO customer_billing_profiles (
        customer_id,
        profile_name,
        credit_limit,
        payment_terms,
        tax_exempt,
        is_default
    ) VALUES (
        NEW.id,
        'Default',
        NEW.credit_limit,
        NEW.payment_terms,
        NEW.tax_exempt,
        true
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_default_billing_profile
    AFTER INSERT ON customers
    FOR EACH ROW EXECUTE FUNCTION create_default_billing_profile();

-- Success message
SELECT 'Industry standard customer system created successfully!' as result,
       'Enhanced customers table, added preferences, service history, billing profiles' as enhancements;
