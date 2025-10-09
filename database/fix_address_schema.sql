-- Fix Address Schema Issues
-- This script addresses the duplicate address fields and inconsistencies identified

-- 1. Remove duplicate address fields from service_requests
-- Keep the service_address_* fields and remove the generic address_* fields
ALTER TABLE service_requests 
DROP COLUMN IF EXISTS address_line_1,
DROP COLUMN IF EXISTS address_line_2,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS state,
DROP COLUMN IF EXISTS zip_code;

-- 2. Ensure service_requests has all required service address fields
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS service_address_line_1 text,
ADD COLUMN IF NOT EXISTS service_address_line_2 text,
ADD COLUMN IF NOT EXISTS service_city text,
ADD COLUMN IF NOT EXISTS service_state text,
ADD COLUMN IF NOT EXISTS service_zip_code text,
ADD COLUMN IF NOT EXISTS service_country text DEFAULT 'United States';

-- 3. Remove the legacy 'address' text field from customers table
-- Keep the normalized address fields (street_address, city, state, zip_code)
ALTER TABLE customers 
DROP COLUMN IF EXISTS address;

-- 4. Ensure customers table has proper address structure
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS street_address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip_code text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'United States',
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

-- 5. Ensure customer_portal_accounts has address fields for self-signup customers
-- These are needed for customers who sign up independently before being linked to contractors
ALTER TABLE customer_portal_accounts 
ADD COLUMN IF NOT EXISTS street_address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip_code text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'United States',
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

-- 6. Add indexes for efficient address-based filtering
CREATE INDEX IF NOT EXISTS idx_customers_zip_code ON customers(zip_code);
CREATE INDEX IF NOT EXISTS idx_customers_city_state ON customers(city, state);
CREATE INDEX IF NOT EXISTS idx_service_requests_service_zip ON service_requests(service_zip_code);
CREATE INDEX IF NOT EXISTS idx_service_requests_service_city_state ON service_requests(service_city, service_state);
CREATE INDEX IF NOT EXISTS idx_portal_accounts_zip ON customer_portal_accounts(zip_code);

-- 7. Add comments for clarity
COMMENT ON COLUMN customers.street_address IS 'Customer billing/contact address - street';
COMMENT ON COLUMN customers.city IS 'Customer billing/contact address - city';
COMMENT ON COLUMN customers.state IS 'Customer billing/contact address - state';
COMMENT ON COLUMN customers.zip_code IS 'Customer billing/contact address - ZIP code for filtering';

COMMENT ON COLUMN service_requests.service_address_line_1 IS 'Job site address - street (where service is needed)';
COMMENT ON COLUMN service_requests.service_city IS 'Job site address - city (where service is needed)';
COMMENT ON COLUMN service_requests.service_state IS 'Job site address - state (where service is needed)';
COMMENT ON COLUMN service_requests.service_zip_code IS 'Job site address - ZIP code for contractor matching';

COMMENT ON COLUMN customer_portal_accounts.street_address IS 'Self-signup customer address (before contractor assignment)';
COMMENT ON COLUMN customer_portal_accounts.zip_code IS 'Self-signup customer ZIP for service area matching';
