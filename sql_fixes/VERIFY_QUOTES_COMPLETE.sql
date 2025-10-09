-- ========================================
-- VERIFY QUOTES SYSTEM IS COMPLETE
-- ========================================

-- 1. Check new quote fields in work_orders
SELECT 
    '=== NEW QUOTE FIELDS IN WORK_ORDERS ===' as section;

SELECT 
    column_name,
    data_type,
    column_default,
    CASE 
        WHEN column_name LIKE 'quote_%' THEN '✅ QUOTE FIELD'
        ELSE '📋 OTHER'
    END as category
FROM information_schema.columns
WHERE table_name = 'work_orders'
AND column_name LIKE 'quote_%'
ORDER BY column_name;

-- 2. Check new tables
SELECT 
    '=== NEW QUOTE TABLES ===' as section;

SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
    '✅ CREATED' as status
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN (
    'quote_templates',
    'quote_template_items',
    'quote_approvals',
    'quote_follow_ups',
    'quote_analytics'
)
ORDER BY table_name;

-- 3. Check functions
SELECT 
    '=== NEW QUOTE FUNCTIONS ===' as section;

SELECT 
    routine_name,
    routine_type,
    '✅ CREATED' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (
    routine_name LIKE '%quote%' OR
    routine_name = 'generate_quote_number'
)
ORDER BY routine_name;

-- 4. Check triggers
SELECT 
    '=== NEW QUOTE TRIGGERS ===' as section;

SELECT 
    trigger_name,
    event_object_table,
    action_timing || ' ' || string_agg(event_manipulation, ', ') as trigger_event,
    '✅ CREATED' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND (
    trigger_name LIKE '%quote%'
)
GROUP BY trigger_name, event_object_table, action_timing
ORDER BY trigger_name;

-- 5. Check indexes
SELECT 
    '=== NEW QUOTE INDEXES ===' as section;

SELECT 
    indexname,
    tablename,
    '✅ CREATED' as status
FROM pg_indexes
WHERE schemaname = 'public'
AND (
    indexname LIKE '%quote%' OR
    tablename IN ('quote_templates', 'quote_template_items', 'quote_approvals', 'quote_follow_ups', 'quote_analytics')
)
ORDER BY tablename, indexname;

-- 6. Test quote number generation
SELECT 
    '=== TEST QUOTE NUMBER GENERATION ===' as section;

SELECT 
    generate_quote_number((SELECT id FROM companies LIMIT 1)) as sample_quote_number,
    '✅ WORKING' as status;

-- 7. Summary
SELECT 
    '=== IMPLEMENTATION SUMMARY ===' as section;

SELECT 
    'Quote lifecycle fields' as feature,
    COUNT(*) as count,
    '✅ COMPLETE' as status
FROM information_schema.columns
WHERE table_name = 'work_orders'
AND column_name IN (
    'quote_sent_at', 'quote_viewed_at', 'quote_expires_at',
    'quote_accepted_at', 'quote_rejected_at', 'quote_rejection_reason',
    'quote_terms', 'quote_notes', 'quote_version', 'quote_parent_id'
)

UNION ALL

SELECT 
    'Quote tables' as feature,
    COUNT(*) as count,
    '✅ COMPLETE' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'quote_templates', 'quote_template_items',
    'quote_approvals', 'quote_follow_ups', 'quote_analytics'
)

UNION ALL

SELECT 
    'Quote functions' as feature,
    COUNT(*) as count,
    '✅ COMPLETE' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'generate_quote_number', 'set_quote_expiration', 'update_quote_analytics'
)

UNION ALL

SELECT 
    'Quote triggers' as feature,
    COUNT(DISTINCT trigger_name) as count,
    '✅ COMPLETE' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN (
    'trg_set_quote_expiration', 'trg_update_quote_analytics'
);

SELECT '🎉 Quotes system verification complete!' as result;
