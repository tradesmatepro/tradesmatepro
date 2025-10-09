-- ========================================
-- FIX CASE SENSITIVITY ISSUES STEP BY STEP
-- Industry standard approach: normalize at database level
-- ========================================

-- STEP 1: Remove existing constraints that might conflict
ALTER TABLE customers DROP CONSTRAINT IF EXISTS chk_customers_status;

-- STEP 2: Update existing data to lowercase
UPDATE customers 
SET status = LOWER(status)
WHERE status IS NOT NULL;

-- STEP 3: Add constraint with lowercase values
ALTER TABLE customers ADD CONSTRAINT chk_customers_status 
    CHECK (status IN ('active', 'inactive'));

-- STEP 4: Update customer types (handle enum carefully)
DO $$
BEGIN
    -- Update customer_type enum values
    UPDATE customers 
    SET customer_type = 'residential'::customer_type_enum
    WHERE customer_type::text ILIKE 'residential';
    
    UPDATE customers 
    SET customer_type = 'commercial'::customer_type_enum
    WHERE customer_type::text ILIKE 'commercial';
    
    UPDATE customers 
    SET customer_type = 'industrial'::customer_type_enum
    WHERE customer_type::text ILIKE 'industrial';
    
    UPDATE customers 
    SET customer_type = 'government'::customer_type_enum
    WHERE customer_type::text ILIKE 'government';
    
    -- Update type field
    UPDATE customers 
    SET type = LOWER(type)
    WHERE type IS NOT NULL;
END $$;

-- STEP 5: Handle customer tags (remove duplicates first)
DELETE FROM customer_tag_assignments 
WHERE tag_id IN (
    SELECT id FROM customer_tags 
    WHERE id NOT IN (
        SELECT MIN(id) 
        FROM customer_tags 
        GROUP BY company_id, LOWER(name)
    )
);

DELETE FROM customer_tags 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM customer_tags 
    GROUP BY company_id, LOWER(name)
);

-- Now update tag names to lowercase
UPDATE customer_tags 
SET name = LOWER(name)
WHERE name IS NOT NULL;

-- STEP 6: Create simple normalization triggers
CREATE OR REPLACE FUNCTION normalize_customer_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Always store status in lowercase
    IF NEW.status IS NOT NULL THEN
        NEW.status = LOWER(NEW.status);
    END IF;
    
    -- Always store type in lowercase
    IF NEW.type IS NOT NULL THEN
        NEW.type = LOWER(NEW.type);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger (this will run AFTER our existing customer trigger)
DROP TRIGGER IF EXISTS trg_normalize_customer_data ON customers;
CREATE TRIGGER trg_normalize_customer_data
    BEFORE INSERT OR UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION normalize_customer_data();

-- STEP 7: Create tag normalization trigger
CREATE OR REPLACE FUNCTION normalize_tag_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Always store tag names in lowercase
    IF NEW.name IS NOT NULL THEN
        NEW.name = LOWER(NEW.name);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_normalize_tag_data ON customer_tags;
CREATE TRIGGER trg_normalize_tag_data
    BEFORE INSERT OR UPDATE ON customer_tags
    FOR EACH ROW EXECUTE FUNCTION normalize_tag_data();

-- STEP 8: Verify the fix
SELECT 'Case sensitivity normalization complete!' as result;

-- Show current status values
SELECT DISTINCT status, COUNT(*) as count
FROM customers 
GROUP BY status;

-- Show current customer types
SELECT DISTINCT customer_type, COUNT(*) as count
FROM customers 
GROUP BY customer_type;
