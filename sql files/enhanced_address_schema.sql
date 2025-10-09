-- Enhanced Address Schema for TradeMate Pro
-- Adds proper billing vs service address separation

-- 1. Add customer type and enhanced address fields
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS customer_type TEXT DEFAULT 'RESIDENTIAL' CHECK (customer_type IN ('RESIDENTIAL', 'COMMERCIAL', 'PROPERTY_MANAGEMENT')),
ADD COLUMN IF NOT EXISTS billing_address_line_1 TEXT,
ADD COLUMN IF NOT EXISTS billing_address_line_2 TEXT,
ADD COLUMN IF NOT EXISTS billing_city TEXT,
ADD COLUMN IF NOT EXISTS billing_state TEXT,
ADD COLUMN IF NOT EXISTS billing_zip_code TEXT,
ADD COLUMN IF NOT EXISTS billing_country TEXT DEFAULT 'United States';

-- 2. Create customer_addresses table for multiple service locations
CREATE TABLE IF NOT EXISTS customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    company_id UUID NOT NULL,
    address_type TEXT NOT NULL DEFAULT 'SERVICE' CHECK (address_type IN ('BILLING', 'SERVICE', 'MAILING')),
    address_name TEXT, -- e.g., "Main Office", "Warehouse", "Home"
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT DEFAULT 'United States',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_primary BOOLEAN DEFAULT false,
    access_instructions TEXT, -- Gate codes, special instructions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add proper service address fields to work_orders
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS service_address_id UUID REFERENCES customer_addresses(id),
ADD COLUMN IF NOT EXISTS service_address_line_1 TEXT,
ADD COLUMN IF NOT EXISTS service_address_line_2 TEXT,
ADD COLUMN IF NOT EXISTS service_city TEXT,
ADD COLUMN IF NOT EXISTS service_state TEXT,
ADD COLUMN IF NOT EXISTS service_zip_code TEXT,
ADD COLUMN IF NOT EXISTS service_country TEXT DEFAULT 'United States',
ADD COLUMN IF NOT EXISTS access_instructions TEXT;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_company_id ON customer_addresses(company_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_service_address_id ON work_orders(service_address_id);

-- 5. Enable RLS (when ready)
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for customer_addresses (with proper UUID casting)
CREATE POLICY "Users can view customer addresses for their company" ON customer_addresses
    FOR SELECT USING (company_id = (auth.jwt() ->> 'company_id')::uuid);

CREATE POLICY "Users can insert customer addresses for their company" ON customer_addresses
    FOR INSERT WITH CHECK (company_id = (auth.jwt() ->> 'company_id')::uuid);

CREATE POLICY "Users can update customer addresses for their company" ON customer_addresses
    FOR UPDATE USING (company_id = (auth.jwt() ->> 'company_id')::uuid);

CREATE POLICY "Users can delete customer addresses for their company" ON customer_addresses
    FOR DELETE USING (company_id = (auth.jwt() ->> 'company_id')::uuid);

-- 7. Migrate existing data
-- Copy existing customer addresses to billing addresses
UPDATE customers 
SET 
    billing_address_line_1 = street_address,
    billing_city = city,
    billing_state = state,
    billing_zip_code = zip_code
WHERE street_address IS NOT NULL;

-- Create primary service addresses for existing customers
INSERT INTO customer_addresses (customer_id, company_id, address_type, address_name, address_line_1, city, state, zip_code, is_primary)
SELECT 
    id as customer_id,
    company_id,
    'SERVICE' as address_type,
    'Primary Location' as address_name,
    street_address as address_line_1,
    city,
    state,
    zip_code,
    true as is_primary
FROM customers 
WHERE street_address IS NOT NULL
ON CONFLICT DO NOTHING;

-- 8. Copy work_location to structured service address fields
UPDATE work_orders 
SET 
    service_address_line_1 = work_location
WHERE work_location IS NOT NULL AND service_address_line_1 IS NULL;

COMMENT ON TABLE customer_addresses IS 'Multiple addresses per customer - billing, service locations, etc.';
COMMENT ON COLUMN customers.customer_type IS 'RESIDENTIAL, COMMERCIAL, or PROPERTY_MANAGEMENT';
COMMENT ON COLUMN customer_addresses.address_type IS 'BILLING, SERVICE, or MAILING address';
COMMENT ON COLUMN customer_addresses.is_primary IS 'Primary address of this type for the customer';
