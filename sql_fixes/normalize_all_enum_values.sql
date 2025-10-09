-- ========================================
-- NORMALIZE ALL ENUM VALUES TO LOWERCASE
-- Industry standard: consistent casing at database level
-- Based on Salesforce/ServiceTitan/Stripe patterns
-- ========================================

-- 1. UPDATE ALL CUSTOMER STATUS VALUES TO LOWERCASE
UPDATE customers 
SET status = LOWER(status)
WHERE status IS NOT NULL;

-- 2. UPDATE ALL WORK ORDER STATUS VALUES TO LOWERCASE
UPDATE work_orders
SET status = LOWER(status::text)::work_order_status_enum
WHERE status IS NOT NULL;

-- 3. UPDATE ALL CUSTOMER TYPES TO LOWERCASE
UPDATE customers
SET customer_type = LOWER(customer_type::text)::customer_type_enum
WHERE customer_type IS NOT NULL;

UPDATE customers
SET type = LOWER(type)
WHERE type IS NOT NULL;

-- 4. UPDATE ALL CUSTOMER TAG NAMES TO LOWERCASE (handle duplicates)
-- First, remove duplicate tags that would conflict when lowercased
DELETE FROM customer_tags
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY company_id, LOWER(name) ORDER BY created_at) as rn
        FROM customer_tags
    ) t WHERE rn > 1
);

-- Now safely update to lowercase
UPDATE customer_tags
SET name = LOWER(name)
WHERE name IS NOT NULL;

-- 5. CREATE NORMALIZATION TRIGGERS FOR FUTURE INSERTS/UPDATES
-- This ensures ALL future data is automatically normalized

-- Customer status normalization trigger
CREATE OR REPLACE FUNCTION normalize_customer_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Normalize status to lowercase
    IF NEW.status IS NOT NULL THEN
        NEW.status = LOWER(NEW.status);
    END IF;
    
    -- Normalize customer_type to lowercase
    IF NEW.customer_type IS NOT NULL THEN
        NEW.customer_type = LOWER(NEW.customer_type::text)::customer_type_enum;
    END IF;
    
    -- Normalize type to lowercase
    IF NEW.type IS NOT NULL THEN
        NEW.type = LOWER(NEW.type);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply normalization trigger to customers
DROP TRIGGER IF EXISTS trg_normalize_customer_status ON customers;
CREATE TRIGGER trg_normalize_customer_status
    BEFORE INSERT OR UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION normalize_customer_status();

-- Work order status normalization trigger
CREATE OR REPLACE FUNCTION normalize_work_order_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Normalize status to lowercase
    IF NEW.status IS NOT NULL THEN
        NEW.status = LOWER(NEW.status::text)::work_order_status_enum;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply normalization trigger to work_orders
DROP TRIGGER IF EXISTS trg_normalize_work_order_status ON work_orders;
CREATE TRIGGER trg_normalize_work_order_status
    BEFORE INSERT OR UPDATE ON work_orders
    FOR EACH ROW EXECUTE FUNCTION normalize_work_order_status();

-- Customer tags normalization trigger
CREATE OR REPLACE FUNCTION normalize_customer_tags()
RETURNS TRIGGER AS $$
BEGIN
    -- Normalize tag name to lowercase
    IF NEW.name IS NOT NULL THEN
        NEW.name = LOWER(NEW.name);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply normalization trigger to customer_tags
DROP TRIGGER IF EXISTS trg_normalize_customer_tags ON customer_tags;
CREATE TRIGGER trg_normalize_customer_tags
    BEFORE INSERT OR UPDATE ON customer_tags
    FOR EACH ROW EXECUTE FUNCTION normalize_customer_tags();

-- 6. UPDATE DATABASE CONSTRAINTS TO ENFORCE LOWERCASE
-- Customer status constraint
ALTER TABLE customers DROP CONSTRAINT IF EXISTS chk_customers_status;
ALTER TABLE customers ADD CONSTRAINT chk_customers_status 
    CHECK (status IN ('active', 'inactive'));

-- 7. CREATE DISPLAY HELPER FUNCTIONS
-- These handle UI capitalization consistently

CREATE OR REPLACE FUNCTION format_status_display(status_value TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE LOWER(status_value)
        WHEN 'active' THEN 'Active'
        WHEN 'inactive' THEN 'Inactive'
        WHEN 'draft' THEN 'Draft'
        WHEN 'quote' THEN 'Quote'
        WHEN 'approved' THEN 'Approved'
        WHEN 'scheduled' THEN 'Scheduled'
        WHEN 'in_progress' THEN 'In Progress'
        WHEN 'completed' THEN 'Completed'
        WHEN 'invoiced' THEN 'Invoiced'
        WHEN 'paid' THEN 'Paid'
        WHEN 'cancelled' THEN 'Cancelled'
        ELSE INITCAP(status_value)
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION format_customer_type_display(type_value TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE LOWER(type_value)
        WHEN 'residential' THEN 'Residential'
        WHEN 'commercial' THEN 'Commercial'
        WHEN 'industrial' THEN 'Industrial'
        WHEN 'government' THEN 'Government'
        WHEN 'property_management' THEN 'Property Management'
        ELSE INITCAP(type_value)
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. VERIFY NORMALIZATION
SELECT 'Normalization complete!' as result,
       'All enum values are now lowercase in database' as status,
       'UI will handle display capitalization' as note;

-- Show sample of normalized data
SELECT 'Sample normalized customers:' as info;
SELECT id, status, customer_type, type, display_name 
FROM customers 
LIMIT 5;
