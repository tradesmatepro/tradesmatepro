-- ========================================
-- CREATE DEFAULT CUSTOMER TAGS
-- Industry standard customer categorization tags
-- ========================================

-- Create default customer tags for all companies
INSERT INTO customer_tags (company_id, name, description, color, priority)
SELECT 
    c.id as company_id,
    tag_data.name,
    tag_data.description,
    tag_data.color,
    tag_data.priority
FROM companies c
CROSS JOIN (
    VALUES 
        ('residential', 'Residential customers - homeowners and renters', '#10b981', 10),
        ('commercial', 'Commercial customers - businesses and offices', '#3b82f6', 20),
        ('industrial', 'Industrial customers - factories and warehouses', '#f59e0b', 30),
        ('government', 'Government customers - municipal and federal', '#8b5cf6', 40),
        ('vip', 'VIP customers - high value clients', '#ef4444', 5),
        ('new', 'New customers - first time clients', '#06b6d4', 15),
        ('repeat', 'Repeat customers - returning clients', '#84cc16', 25),
        ('priority', 'Priority customers - urgent response needed', '#f97316', 8),
        ('maintenance', 'Maintenance customers - recurring service contracts', '#6366f1', 35),
        ('emergency', 'Emergency customers - after hours service', '#dc2626', 3),
        ('seasonal', 'Seasonal customers - periodic service needs', '#059669', 45),
        ('referral', 'Referral customers - came from existing clients', '#7c3aed', 50)
) AS tag_data(name, description, color, priority)
WHERE NOT EXISTS (
    SELECT 1 FROM customer_tags ct 
    WHERE ct.company_id = c.id 
    AND ct.name = tag_data.name
);

-- Success message
SELECT 'Default customer tags created!' as result,
       COUNT(*) as tags_created
FROM customer_tags 
WHERE created_at >= NOW() - INTERVAL '1 minute';
