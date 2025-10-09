-- ========================================
-- CREATE CUSTOMERS_WITH_TAGS VIEW
-- Provides backward compatibility for any code that references this view
-- ========================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS customers_with_tags CASCADE;

-- Create view with all customer fields plus aggregated tags
CREATE VIEW customers_with_tags AS
SELECT
    c.id,
    c.company_id,
    c.customer_number,
    c.type,
    c.first_name,
    c.last_name,
    c.company_name,
    -- Create display name for compatibility
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
    c.customer_since,
    c.created_at,
    c.updated_at,
    -- Aggregate customer tags as JSON array
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', ct.id,
                'name', ct.name,
                'color', ct.color,
                'description', ct.description
            )
        ) FILTER (WHERE ct.id IS NOT NULL),
        '[]'::json
    ) as customer_tags,
    -- Count of tags
    COUNT(ct.id) FILTER (WHERE ct.id IS NOT NULL) as tag_count,
    -- Array of tag names for easier filtering
    ARRAY_AGG(ct.name ORDER BY ct.name) FILTER (WHERE ct.name IS NOT NULL) as tag_names
FROM customers c
LEFT JOIN customer_tag_assignments cta ON c.id = cta.customer_id
LEFT JOIN customer_tags ct ON cta.tag_id = ct.id
GROUP BY 
    c.id, c.company_id, c.customer_number, c.type,
    c.first_name, c.last_name, c.company_name,
    c.email, c.phone, c.mobile_phone, c.preferred_contact,
    c.source, c.notes, c.credit_limit, c.payment_terms,
    c.tax_exempt, c.is_active, c.customer_since,
    c.created_at, c.updated_at;

-- Grant permissions
GRANT SELECT ON customers_with_tags TO authenticated;
GRANT SELECT ON customers_with_tags TO anon;

-- Success message
SELECT '✅ customers_with_tags view created successfully!' as result;
