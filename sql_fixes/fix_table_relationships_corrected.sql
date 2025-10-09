-- ========================================
-- FIX TABLE RELATIONSHIPS AND MISSING COLUMNS (CORRECTED)
-- Based on actual schema from deploy tool
-- ========================================

-- 1. ADD MISSING company_id TO customer_tags
-- The application expects customer_tags to have company_id for filtering
ALTER TABLE customer_tags 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Update existing records to have a company_id (use first company if any exist)
DO $$
DECLARE
    first_company_id UUID;
BEGIN
    -- Get the first company ID
    SELECT id INTO first_company_id FROM companies LIMIT 1;
    
    IF first_company_id IS NOT NULL THEN
        -- Update existing customer_tags records
        UPDATE customer_tags 
        SET company_id = first_company_id 
        WHERE company_id IS NULL;
    END IF;
END $$;

-- Make company_id NOT NULL after updating existing records
ALTER TABLE customer_tags 
ALTER COLUMN company_id SET NOT NULL;

-- 2. ADD MISSING follow_up_date TO quote_follow_ups
-- The application is ordering by follow_up_date.asc but column doesn't exist
ALTER TABLE quote_follow_ups 
ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMPTZ DEFAULT NOW();

-- Update existing records to use scheduled_at as follow_up_date
UPDATE quote_follow_ups 
SET follow_up_date = scheduled_at 
WHERE follow_up_date IS NULL;

-- 3. CREATE INDEX FOR PERFORMANCE
-- Add indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_customer_tags_company_id ON customer_tags(company_id);
CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_follow_up_date ON quote_follow_ups(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_quote_approval_workflows_company_id ON quote_approval_workflows(company_id);

-- 4. CREATE VIEW FOR CUSTOMERS WITH TAGS (CORRECTED COLUMN NAMES)
-- Using actual customers table structure: first_name, last_name, company_name
CREATE OR REPLACE VIEW customers_with_tags AS
SELECT 
    c.id,
    c.company_id,
    c.customer_number,
    c.type,
    c.first_name,
    c.last_name,
    c.company_name,
    c.email,
    c.phone,
    c.mobile_phone,
    c.preferred_contact,
    c.source,
    c.notes,
    c.credit_limit,
    c.payment_terms,
    c.tax_exempt,
    c.is_active,
    c.created_at,
    c.updated_at,
    c.customer_since,
    COALESCE(
        ARRAY_AGG(ct.name) FILTER (WHERE ct.name IS NOT NULL),
        ARRAY[]::TEXT[]
    ) as customer_tags
FROM customers c
LEFT JOIN customer_tag_assignments cta ON c.id = cta.customer_id
LEFT JOIN customer_tags ct ON cta.tag_id = ct.id
GROUP BY 
    c.id, c.company_id, c.customer_number, c.type, c.first_name, c.last_name, 
    c.company_name, c.email, c.phone, c.mobile_phone, c.preferred_contact, 
    c.source, c.notes, c.credit_limit, c.payment_terms, c.tax_exempt, 
    c.is_active, c.created_at, c.updated_at, c.customer_since;

-- 5. GRANT PERMISSIONS
GRANT SELECT ON customers_with_tags TO authenticated;
GRANT ALL ON customer_tags TO authenticated;
GRANT ALL ON quote_follow_ups TO authenticated;
GRANT ALL ON quote_approval_workflows TO authenticated;

-- Success message
SELECT 'Table relationships and missing columns fixed!' as result;
