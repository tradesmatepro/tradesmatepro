-- ========================================
-- UPDATE CUSTOMERS_WITH_TAGS VIEW
-- Include new customer fields for proper display
-- ========================================

-- Drop and recreate the view with all necessary fields
DROP VIEW IF EXISTS customers_with_tags;

CREATE VIEW customers_with_tags AS
SELECT
    c.id,
    c.company_id,
    c.customer_number,
    c.customer_type,
    c.type,
    c.first_name,
    c.last_name,
    c.company_name,
    c.display_name,
    c.email,
    c.phone,
    c.mobile_phone,
    c.preferred_contact,
    c.source,
    c.notes,
    c.credit_limit,
    c.payment_terms,
    c.tax_exempt,
    c.status,
    c.is_active,
    c.customer_since,
    c.created_at,
    c.updated_at,
    -- Aggregate customer tags
    COALESCE(
        STRING_AGG(ct.name, ', ' ORDER BY ct.name),
        ''
    ) as customer_tags,
    -- Count of tags
    COUNT(cta.id) as tag_count,
    -- Array of tag names for easier filtering
    ARRAY_AGG(ct.name ORDER BY ct.name) FILTER (WHERE ct.name IS NOT NULL) as tag_array
FROM customers c
LEFT JOIN customer_tag_assignments cta ON c.id = cta.customer_id
LEFT JOIN customer_tags ct ON cta.tag_id = ct.id
GROUP BY
    c.id, c.company_id, c.customer_number, c.customer_type, c.type,
    c.first_name, c.last_name, c.company_name, c.display_name,
    c.email, c.phone, c.mobile_phone, c.preferred_contact,
    c.source, c.notes, c.credit_limit, c.payment_terms, c.tax_exempt,
    c.status, c.is_active, c.customer_since, c.created_at, c.updated_at;

-- Grant permissions
GRANT SELECT ON customers_with_tags TO authenticated;

-- Create index on the view for better performance
CREATE INDEX IF NOT EXISTS idx_customers_with_tags_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_with_tags_display_name ON customers(display_name);
CREATE INDEX IF NOT EXISTS idx_customers_with_tags_status ON customers(status);

-- Success message
SELECT 'customers_with_tags view updated successfully!' as result,
       'Now includes all customer fields including display_name, status, customer_type' as changes;
