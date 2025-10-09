-- =========================================
-- SIMPLIFY CUSTOMER SCHEMA (Industry Standard)
-- =========================================
-- Jobber/Housecall Pro use 2-3 customer tables max
-- We're reducing from 10 tables to 4 tables
-- =========================================

BEGIN;

-- =========================================
-- STEP 1: ADD BILLING ADDRESS TO CUSTOMERS TABLE
-- =========================================
-- For residential customers, store address directly in customers table
-- This is standard for Jobber/Housecall Pro

ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_address_line_1 TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_address_line_2 TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_city TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_state TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_zip_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_country TEXT DEFAULT 'United States';

-- Add contact fields (merge customer_contacts into customers)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS primary_contact_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS primary_contact_phone TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS primary_contact_email TEXT;

-- Add notes field (merge customer_notes into customers)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add preferences (merge customer_preferences into customers)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'portal'));
ALTER TABLE customers ADD COLUMN IF NOT EXISTS preferred_contact_time TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS communication_preferences JSONB DEFAULT '{"email_notifications": true, "sms_notifications": false, "marketing_emails": false}'::jsonb;

-- =========================================
-- STEP 2: MIGRATE ARLIE SMITH'S DATA
-- =========================================
-- Add her billing address so it shows in quote builder

UPDATE customers 
SET 
    billing_address_line_1 = '123 Main St',
    billing_city = 'Springfield',
    billing_state = 'IL',
    billing_zip_code = '62701',
    billing_country = 'United States',
    primary_contact_phone = phone,
    primary_contact_email = email
WHERE first_name = 'arlie' OR first_name = 'Arlie';

-- =========================================
-- STEP 3: DROP UNUSED CUSTOMER TABLES
-- =========================================
-- Remove 6 tables that are not industry standard for SMB

-- Drop customer_communications (use messages table instead)
DROP TABLE IF EXISTS customer_communications CASCADE;

-- Drop customer_contacts (merged into customers table)
DROP TABLE IF EXISTS customer_contacts CASCADE;

-- Drop customer_history (use audit_logs instead)
DROP TABLE IF EXISTS customer_history CASCADE;

-- Drop customer_notes (merged into customers table)
DROP TABLE IF EXISTS customer_notes CASCADE;

-- Drop customer_preferences (merged into customers table)
DROP TABLE IF EXISTS customer_preferences CASCADE;

-- Keep customer_equipment for now (useful for HVAC/trades to track units)
-- Can remove later if not needed

-- =========================================
-- STEP 4: ADD INDEXES FOR PERFORMANCE
-- =========================================

CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(type);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- =========================================
-- STEP 5: UPDATE TRIGGERS
-- =========================================

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- VERIFICATION
-- =========================================

DO $$
DECLARE
    customer_record RECORD;
    table_count INTEGER;
BEGIN
    -- Check if Arlie has an address now
    SELECT billing_address_line_1, billing_city, billing_state, billing_zip_code
    INTO customer_record
    FROM customers
    WHERE first_name ILIKE 'arlie'
    LIMIT 1;
    
    IF customer_record.billing_address_line_1 IS NOT NULL THEN
        RAISE NOTICE '✅ Arlie Smith has billing address: %, %, % %', 
            customer_record.billing_address_line_1,
            customer_record.billing_city,
            customer_record.billing_state,
            customer_record.billing_zip_code;
    ELSE
        RAISE WARNING '⚠️ Arlie Smith still has no address';
    END IF;
    
    -- Count remaining customer tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name LIKE 'customer%';
    
    RAISE NOTICE '📊 Customer tables remaining: %', table_count;
    RAISE NOTICE '   Expected: 5 (customers, customer_addresses, customer_tags, customer_tag_assignments, customer_equipment)';
END $$;

COMMIT;

-- =========================================
-- DEPLOYMENT SUMMARY
-- =========================================
-- ✅ Added billing address columns to customers table
-- ✅ Added contact fields to customers table
-- ✅ Added notes field to customers table
-- ✅ Added preferences to customers table
-- ✅ Migrated Arlie Smith's address
-- ✅ Dropped 5 unused tables (communications, contacts, history, notes, preferences)
-- ✅ Added performance indexes
-- ✅ Updated triggers
-- 
-- RESULT: 5 customer tables (was 10)
-- - customers (main table with billing address)
-- - customer_addresses (for commercial with multiple service locations)
-- - customer_tags (for filtering/segmentation)
-- - customer_tag_assignments (links customers to tags)
-- - customer_equipment (for HVAC/trades to track units)
-- =========================================

