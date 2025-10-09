-- ========================================
-- STEP BY STEP DATABASE FIX FOR TRADEMATE PRO
-- Fix one issue at a time to avoid conflicts
-- ========================================

-- STEP 1: Drop existing view if it exists
DROP VIEW IF EXISTS customers_with_tags;

-- STEP 2: Add company_id to customer_tags if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_tags' AND column_name = 'company_id'
    ) THEN
        ALTER TABLE customer_tags 
        ADD COLUMN company_id UUID;
        
        -- Update existing records with first company ID
        UPDATE customer_tags 
        SET company_id = (SELECT id FROM companies LIMIT 1)
        WHERE company_id IS NULL;
        
        -- Add foreign key constraint
        ALTER TABLE customer_tags 
        ADD CONSTRAINT customer_tags_company_id_fkey 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
        
        -- Make it NOT NULL
        ALTER TABLE customer_tags ALTER COLUMN company_id SET NOT NULL;
        
        RAISE NOTICE 'Added company_id to customer_tags';
    END IF;
END $$;

-- STEP 3: Add follow_up_date to quote_follow_ups if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quote_follow_ups' AND column_name = 'follow_up_date'
    ) THEN
        ALTER TABLE quote_follow_ups 
        ADD COLUMN follow_up_date TIMESTAMPTZ DEFAULT NOW();
        
        -- Copy scheduled_at to follow_up_date
        UPDATE quote_follow_ups 
        SET follow_up_date = scheduled_at 
        WHERE follow_up_date IS NULL;
        
        RAISE NOTICE 'Added follow_up_date to quote_follow_ups';
    END IF;
END $$;

-- STEP 4: Create customer_tag_assignments table if missing
CREATE TABLE IF NOT EXISTS customer_tag_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES customer_tags(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    UNIQUE(customer_id, tag_id)
);

-- STEP 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_tags_company_id ON customer_tags(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_customer_id ON customer_tag_assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_tag_id ON customer_tag_assignments(tag_id);
CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_follow_up_date ON quote_follow_ups(follow_up_date);

-- STEP 6: Create new customers_with_tags view
CREATE VIEW customers_with_tags AS
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
    -- Create display name
    COALESCE(
        c.company_name,
        TRIM(CONCAT(c.first_name, ' ', c.last_name)),
        'Unnamed Customer'
    ) as display_name,
    -- Aggregate customer tags
    COALESCE(
        ARRAY_AGG(ct.name ORDER BY ct.name) FILTER (WHERE ct.name IS NOT NULL),
        ARRAY[]::TEXT[]
    ) as customer_tags
FROM customers c
LEFT JOIN customer_tag_assignments cta ON c.id = cta.customer_id
LEFT JOIN customer_tags ct ON cta.tag_id = ct.id AND ct.company_id = c.company_id
GROUP BY 
    c.id, c.company_id, c.customer_number, c.type, c.first_name, c.last_name, 
    c.company_name, c.email, c.phone, c.mobile_phone, c.preferred_contact, 
    c.source, c.notes, c.credit_limit, c.payment_terms, c.tax_exempt, 
    c.is_active, c.created_at, c.updated_at, c.customer_since;

-- STEP 7: Grant permissions
GRANT SELECT ON customers_with_tags TO authenticated;
GRANT ALL ON customer_tags TO authenticated;
GRANT ALL ON customer_tag_assignments TO authenticated;

-- Success message
SELECT 'Database relationships fixed successfully!' as result;
