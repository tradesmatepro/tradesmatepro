-- ========================================
-- AUDIT QUOTES SYSTEM
-- Check what exists vs what should exist
-- ========================================

-- 1. Check work_orders table structure
SELECT 
    '=== WORK_ORDERS TABLE STRUCTURE ===' as section;

SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable,
    CASE 
        WHEN column_name LIKE '%quote%' THEN '📋 QUOTE FIELD'
        WHEN column_name LIKE '%status%' THEN '🏷️ STATUS FIELD'
        WHEN column_name LIKE '%amount%' OR column_name LIKE '%total%' OR column_name LIKE '%subtotal%' THEN '💰 FINANCIAL'
        WHEN column_name LIKE '%customer%' THEN '👤 CUSTOMER'
        WHEN column_name LIKE '%scheduled%' OR column_name LIKE '%actual%' THEN '📅 TIMING'
        ELSE '📋 OTHER'
    END as category
FROM information_schema.columns
WHERE table_name = 'work_orders'
ORDER BY 
    CASE 
        WHEN column_name = 'id' THEN 1
        WHEN column_name = 'company_id' THEN 2
        WHEN column_name = 'work_order_number' THEN 3
        WHEN column_name = 'customer_id' THEN 4
        WHEN column_name = 'status' THEN 5
        WHEN column_name LIKE '%quote%' THEN 6
        ELSE 7
    END,
    column_name;

-- 2. Check work_order_status_enum values
SELECT 
    '=== WORK_ORDER_STATUS_ENUM VALUES ===' as section;

SELECT 
    enumlabel as status_value,
    enumsortorder as sort_order
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'work_order_status_enum')
ORDER BY enumsortorder;

-- 3. Check if deprecated quotes table exists
SELECT 
    '=== CHECK FOR DEPRECATED TABLES ===' as section;

SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_name = 'quotes' THEN '❌ DEPRECATED - Should be dropped'
        WHEN table_name LIKE '%quote%' THEN '⚠️ CHECK IF NEEDED'
        ELSE '✅ OK'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND (table_name LIKE '%quote%' OR table_name = 'quotes')
ORDER BY table_name;

-- 4. Check for customers_with_tags view
SELECT 
    '=== CHECK FOR CUSTOMERS_WITH_TAGS VIEW ===' as section;

SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_name = 'customers_with_tags' THEN '✅ EXISTS'
        ELSE '❓ OTHER'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%customer%'
AND table_name LIKE '%tag%'
ORDER BY table_name;

-- 5. Count quotes in work_orders
SELECT 
    '=== QUOTE RECORDS IN WORK_ORDERS ===' as section;

SELECT
    status,
    COUNT(*) as count,
    CASE
        WHEN status IN ('draft', 'quote', 'approved') THEN '📋 QUOTE STAGE'
        WHEN status IN ('scheduled', 'in_progress', 'completed') THEN '🔧 JOB STAGE'
        WHEN status = 'invoiced' THEN '💰 INVOICE STAGE'
        ELSE '❓ OTHER'
    END as stage
FROM work_orders
GROUP BY status
ORDER BY
    CASE status
        WHEN 'draft' THEN 1
        WHEN 'quote' THEN 2
        WHEN 'approved' THEN 3
        WHEN 'scheduled' THEN 4
        WHEN 'in_progress' THEN 5
        WHEN 'completed' THEN 6
        WHEN 'invoiced' THEN 7
        ELSE 8
    END;

-- 6. Check work_order_line_items table
SELECT 
    '=== WORK_ORDER_LINE_ITEMS TABLE ===' as section;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'work_order_line_items'
ORDER BY ordinal_position;

-- 7. Check for quote-related tables
SELECT 
    '=== ALL QUOTE-RELATED TABLES ===' as section;

SELECT 
    table_name,
    table_type,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND (
    table_name LIKE '%quote%' OR
    table_name = 'work_orders' OR
    table_name LIKE '%work_order%'
)
ORDER BY 
    CASE 
        WHEN table_name = 'work_orders' THEN 1
        WHEN table_name LIKE 'work_order_%' THEN 2
        ELSE 3
    END,
    table_name;

-- 8. Sample quote data
SELECT 
    '=== SAMPLE QUOTE DATA ===' as section;

SELECT 
    work_order_number,
    status,
    title,
    total_amount,
    created_at,
    CASE 
        WHEN status IN ('draft', 'quote') THEN '📋 Active Quote'
        WHEN status = 'approved' THEN '✅ Approved'
        WHEN status = 'cancelled' THEN '❌ Cancelled'
        ELSE '🔧 Converted to Job'
    END as quote_status
FROM work_orders
WHERE status IN ('draft', 'quote', 'approved')
ORDER BY created_at DESC
LIMIT 5;

-- 9. Check for missing quote fields
SELECT 
    '=== MISSING QUOTE FIELDS CHECK ===' as section;

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
    purpose
FROM (VALUES
    ('quote_sent_at', 'Track when quote was sent to customer'),
    ('quote_viewed_at', 'Track when customer viewed quote'),
    ('quote_expires_at', 'Track when quote expires'),
    ('quote_accepted_at', 'Track when customer accepted'),
    ('quote_rejected_at', 'Track when customer rejected'),
    ('quote_rejection_reason', 'Track why customer rejected'),
    ('quote_version', 'Track quote revisions'),
    ('quote_parent_id', 'Link to original quote for revisions')
) AS fields(field_name, purpose);

-- 10. Final summary
SELECT 
    '=== AUDIT SUMMARY ===' as section;

SELECT 
    'Total work_orders' as metric,
    COUNT(*) as value
FROM work_orders

UNION ALL

SELECT 
    'Quotes (draft/quote/approved)' as metric,
    COUNT(*) as value
FROM work_orders
WHERE status IN ('draft', 'quote', 'approved')

UNION ALL

SELECT 
    'Jobs (scheduled/in_progress/completed)' as metric,
    COUNT(*) as value
FROM work_orders
WHERE status IN ('scheduled', 'in_progress', 'completed')

UNION ALL

SELECT 
    'Invoiced' as metric,
    COUNT(*) as value
FROM work_orders
WHERE status = 'invoiced';

SELECT '✅ Quotes system audit complete!' as result;
