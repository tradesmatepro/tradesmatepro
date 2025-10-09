-- ========================================
-- CHECK ACTUAL DATABASE VS FRONTEND EXPECTATIONS
-- Verify what exists vs what code is looking for
-- ========================================

-- 1. Check actual work_orders table structure
SELECT 
    '=== ACTUAL WORK_ORDERS TABLE STRUCTURE ===' as section;

SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable,
    CASE 
        WHEN column_name LIKE '%quote%' THEN '📋 QUOTE'
        WHEN column_name LIKE '%customer%' THEN '👤 CUSTOMER'
        WHEN column_name LIKE '%schedule%' OR column_name LIKE '%time%' THEN '📅 TIMING'
        WHEN column_name LIKE '%amount%' OR column_name LIKE '%total%' OR column_name LIKE '%price%' THEN '💰 FINANCIAL'
        WHEN column_name = 'status' OR column_name = 'stage' THEN '🏷️ STATUS'
        ELSE '📋 OTHER'
    END as category
FROM information_schema.columns
WHERE table_name = 'work_orders'
ORDER BY ordinal_position;

-- 2. Check work_order_line_items structure
SELECT 
    '=== WORK_ORDER_LINE_ITEMS TABLE ===' as section;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'work_order_line_items'
ORDER BY ordinal_position;

-- 3. Check if we have service_categories and service_types
SELECT
    '=== SERVICE CATEGORIES & TYPES ===' as section;

SELECT
    'service_categories' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END as status
FROM service_categories

UNION ALL

SELECT
    'service_types' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END as status
FROM service_types;

-- 4. Check quote_templates
SELECT 
    '=== QUOTE TEMPLATES ===' as section;

SELECT 
    COUNT(*) as template_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ HAS TEMPLATES' ELSE '⚠️ NO TEMPLATES' END as status
FROM quote_templates;

-- 5. Check actual quote records
SELECT 
    '=== ACTUAL QUOTE RECORDS ===' as section;

SELECT 
    id,
    work_order_number,
    title,
    status,
    customer_id,
    total_amount,
    created_at,
    quote_sent_at,
    quote_expires_at
FROM work_orders
WHERE status IN ('draft', 'quote', 'approved')
ORDER BY created_at DESC
LIMIT 5;

-- 6. Check for missing industry standard fields
SELECT 
    '=== MISSING INDUSTRY STANDARD FIELDS ===' as section;

SELECT 
    field_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'work_orders' 
            AND column_name = field_name
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status,
    industry_standard
FROM (VALUES
    ('service_category_id', 'ServiceTitan, Jobber, Housecall Pro'),
    ('service_type_id', 'ServiceTitan, Jobber, Housecall Pro'),
    ('pricing_model', 'ServiceTitan, Jobber'),
    ('labor_rate', 'All platforms'),
    ('labor_hours', 'All platforms'),
    ('materials_cost', 'All platforms'),
    ('equipment_cost', 'ServiceTitan'),
    ('discount_amount', 'All platforms'),
    ('discount_percentage', 'All platforms'),
    ('tax_rate', 'All platforms'),
    ('tax_amount', 'All platforms'),
    ('deposit_amount', 'Jobber, Housecall Pro'),
    ('deposit_percentage', 'Jobber, Housecall Pro'),
    ('payment_terms', 'All platforms'),
    ('warranty_info', 'ServiceTitan'),
    ('estimated_duration', 'All platforms'),
    ('requires_site_visit', 'Jobber, Housecall Pro')
) AS fields(field_name, industry_standard);

-- 7. Check pricing models enum
SELECT 
    '=== PRICING MODELS ===' as section;

SELECT 
    enumlabel as pricing_model,
    enumsortorder as sort_order
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'pricing_model_enum')
ORDER BY enumsortorder;

-- 8. Check if pricing_model_enum exists
SELECT 
    '=== CHECK PRICING MODEL ENUM EXISTS ===' as section;

SELECT 
    typname as enum_name,
    '✅ EXISTS' as status
FROM pg_type
WHERE typname = 'pricing_model_enum'

UNION ALL

SELECT 
    'pricing_model_enum' as enum_name,
    '❌ MISSING - NEED TO CREATE' as status
WHERE NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'pricing_model_enum'
);

-- 9. Sample line items structure
SELECT 
    '=== SAMPLE LINE ITEMS ===' as section;

SELECT 
    woli.id,
    woli.work_order_id,
    woli.line_type,
    woli.description,
    woli.quantity,
    woli.unit_price,
    woli.total_price
FROM work_order_line_items woli
JOIN work_orders wo ON wo.id = woli.work_order_id
WHERE wo.status IN ('draft', 'quote', 'approved')
LIMIT 5;

-- 10. Check for customer addresses
SELECT 
    '=== CUSTOMER ADDRESSES ===' as section;

SELECT 
    COUNT(*) as address_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ HAS ADDRESSES' ELSE '⚠️ NO ADDRESSES' END as status
FROM customer_addresses;

SELECT '✅ Database vs Frontend check complete!' as result;
