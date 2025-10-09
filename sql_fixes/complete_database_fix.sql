-- ========================================
-- COMPLETE DATABASE FIX FOR TRADEMATE PRO
-- Industry Standard Schema Alignment
-- ========================================

-- 1. FIX CUSTOMER_TAGS TABLE - ADD MISSING COMPANY_ID
-- This is required for proper multi-tenant filtering
DO $$
BEGIN
    -- Check if company_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_tags' AND column_name = 'company_id'
    ) THEN
        -- Add company_id column
        ALTER TABLE customer_tags 
        ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
        
        -- Update existing records with first company ID
        DECLARE
            first_company_id UUID;
        BEGIN
            SELECT id INTO first_company_id FROM companies LIMIT 1;
            IF first_company_id IS NOT NULL THEN
                UPDATE customer_tags 
                SET company_id = first_company_id 
                WHERE company_id IS NULL;
            END IF;
        END;
        
        -- Make it NOT NULL
        ALTER TABLE customer_tags ALTER COLUMN company_id SET NOT NULL;
        
        RAISE NOTICE 'Added company_id to customer_tags table';
    ELSE
        RAISE NOTICE 'customer_tags.company_id already exists';
    END IF;
END $$;

-- 2. FIX QUOTE_FOLLOW_UPS TABLE - ADD MISSING FOLLOW_UP_DATE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quote_follow_ups' AND column_name = 'follow_up_date'
    ) THEN
        ALTER TABLE quote_follow_ups 
        ADD COLUMN follow_up_date TIMESTAMPTZ DEFAULT NOW();
        
        -- Copy scheduled_at to follow_up_date for existing records
        UPDATE quote_follow_ups 
        SET follow_up_date = scheduled_at 
        WHERE follow_up_date IS NULL;
        
        RAISE NOTICE 'Added follow_up_date to quote_follow_ups table';
    ELSE
        RAISE NOTICE 'quote_follow_ups.follow_up_date already exists';
    END IF;
END $$;

-- 3. FIX QUOTE_APPROVAL_WORKFLOWS - CORRECT FOREIGN KEY REFERENCE
DO $$
BEGIN
    -- Check if approver_id column exists (incorrect reference)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quote_approval_workflows' AND column_name = 'approver_id'
    ) THEN
        -- Rename to correct column name
        ALTER TABLE quote_approval_workflows 
        RENAME COLUMN approver_id TO approver_user_id;
        
        -- Drop old foreign key constraint if exists
        ALTER TABLE quote_approval_workflows 
        DROP CONSTRAINT IF EXISTS quote_approval_workflows_approver_id_fkey;
        
        -- Add correct foreign key constraint to profiles table
        ALTER TABLE quote_approval_workflows 
        ADD CONSTRAINT quote_approval_workflows_approver_user_id_fkey 
        FOREIGN KEY (approver_user_id) REFERENCES profiles(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Fixed approver foreign key in quote_approval_workflows';
    ELSE
        RAISE NOTICE 'quote_approval_workflows.approver_id does not exist or already fixed';
    END IF;
END $$;

-- 4. CREATE CUSTOMER_TAG_ASSIGNMENTS TABLE IF MISSING
CREATE TABLE IF NOT EXISTS customer_tag_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES customer_tags(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    UNIQUE(customer_id, tag_id)
);

-- 5. CREATE PROPER INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_customer_tags_company_id ON customer_tags(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_customer_id ON customer_tag_assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_tag_id ON customer_tag_assignments(tag_id);
CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_follow_up_date ON quote_follow_ups(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_quote_approval_workflows_approver_user_id ON quote_approval_workflows(approver_user_id);

-- 6. CREATE CUSTOMERS_WITH_TAGS VIEW (CORRECTED)
CREATE OR REPLACE VIEW customers_with_tags AS
SELECT 
    c.id,
    c.company_id,
    c.customer_number,
    c.type,
    c.first_name,
    c.last_name,
    c.company_name,
    -- Create display name field for compatibility
    COALESCE(
        c.company_name,
        TRIM(CONCAT(c.first_name, ' ', c.last_name)),
        'Unnamed Customer'
    ) as display_name,
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
    -- Aggregate customer tags
    COALESCE(
        ARRAY_AGG(ct.name ORDER BY ct.name) FILTER (WHERE ct.name IS NOT NULL),
        ARRAY[]::TEXT[]
    ) as customer_tags,
    -- Count of tags
    COUNT(ct.id) FILTER (WHERE ct.id IS NOT NULL) as tag_count
FROM customers c
LEFT JOIN customer_tag_assignments cta ON c.id = cta.customer_id
LEFT JOIN customer_tags ct ON cta.tag_id = ct.id AND ct.company_id = c.company_id
GROUP BY 
    c.id, c.company_id, c.customer_number, c.type, c.first_name, c.last_name, 
    c.company_name, c.email, c.phone, c.mobile_phone, c.preferred_contact, 
    c.source, c.notes, c.credit_limit, c.payment_terms, c.tax_exempt, 
    c.is_active, c.created_at, c.updated_at, c.customer_since;

-- 7. GRANT PROPER PERMISSIONS
GRANT SELECT ON customers_with_tags TO authenticated;
GRANT ALL ON customer_tags TO authenticated;
GRANT ALL ON customer_tag_assignments TO authenticated;
GRANT ALL ON quote_follow_ups TO authenticated;
GRANT ALL ON quote_approval_workflows TO authenticated;

-- 8. ENABLE ROW LEVEL SECURITY (RLS) FOR NEW TABLES
ALTER TABLE customer_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customer_tag_assignments
CREATE POLICY "Users can manage customer tag assignments for their company" 
ON customer_tag_assignments FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM customers c 
        WHERE c.id = customer_tag_assignments.customer_id 
        AND c.company_id = (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid()
        )
    )
);

-- Update RLS policy for customer_tags to include company_id
DROP POLICY IF EXISTS "Users can manage customer tags for their company" ON customer_tags;
CREATE POLICY "Users can manage customer tags for their company" 
ON customer_tags FOR ALL 
TO authenticated 
USING (
    company_id = (
        SELECT company_id FROM profiles 
        WHERE id = auth.uid()
    )
);

-- 9. CREATE HELPER FUNCTIONS FOR COMMON OPERATIONS

-- Function to get customer display name
CREATE OR REPLACE FUNCTION get_customer_display_name(customer_row customers)
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        customer_row.company_name,
        TRIM(CONCAT(customer_row.first_name, ' ', customer_row.last_name)),
        'Unnamed Customer'
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to assign tag to customer
CREATE OR REPLACE FUNCTION assign_customer_tag(
    p_customer_id UUID,
    p_tag_name TEXT,
    p_company_id UUID
) RETURNS UUID AS $$
DECLARE
    v_tag_id UUID;
    v_assignment_id UUID;
BEGIN
    -- Get or create tag
    SELECT id INTO v_tag_id 
    FROM customer_tags 
    WHERE name = p_tag_name AND company_id = p_company_id;
    
    IF v_tag_id IS NULL THEN
        INSERT INTO customer_tags (name, company_id)
        VALUES (p_tag_name, p_company_id)
        RETURNING id INTO v_tag_id;
    END IF;
    
    -- Create assignment if not exists
    INSERT INTO customer_tag_assignments (customer_id, tag_id, assigned_by)
    VALUES (p_customer_id, v_tag_id, auth.uid())
    ON CONFLICT (customer_id, tag_id) DO NOTHING
    RETURNING id INTO v_assignment_id;
    
    RETURN COALESCE(v_assignment_id, 
        (SELECT id FROM customer_tag_assignments 
         WHERE customer_id = p_customer_id AND tag_id = v_tag_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'TradeMate Pro database schema successfully standardized!' as result,
       'All foreign key relationships fixed' as status,
       'Industry-standard structure implemented' as note;
