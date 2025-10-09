-- ========================================
-- VERIFY PIPELINE DEPLOYMENT
-- Check what actually got deployed
-- ========================================

-- 1. Check if new status values exist
SELECT 
    'Status Values' as check_type,
    e.enumlabel as value,
    '✅ EXISTS' as status
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'work_order_status_enum'
AND e.enumlabel IN ('sent', 'rejected', 'paid', 'closed')
ORDER BY e.enumsortorder;

-- 2. Check if new timestamp columns exist
SELECT 
    'Timestamp Columns' as check_type,
    column_name as value,
    '✅ EXISTS' as status
FROM information_schema.columns
WHERE table_name = 'work_orders'
AND column_name IN (
    'quote_sent_at', 'quote_viewed_at', 'quote_expires_at',
    'quote_accepted_at', 'quote_rejected_at', 'quote_rejection_reason',
    'has_change_orders', 'change_orders_total',
    'invoice_sent_at', 'invoice_viewed_at',
    'paid_at', 'closed_at'
)
ORDER BY column_name;

-- 3. Check if new tables exist
SELECT 
    'New Tables' as check_type,
    table_name as value,
    '✅ EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'quote_deliveries',
    'invoice_deliveries',
    'payment_deliveries',
    'quote_responses',
    'change_orders',
    'change_order_items',
    'job_completion_checklist',
    'customer_feedback'
)
ORDER BY table_name;

-- 4. Check if trigger exists
SELECT 
    'Triggers' as check_type,
    trigger_name as value,
    '✅ EXISTS' as status
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_work_order_on_change_order_approval';

-- 5. Summary count
SELECT 
    'SUMMARY' as check_type,
    'Total Deployed' as value,
    (
        (SELECT COUNT(*) FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid 
         WHERE t.typname = 'work_order_status_enum' AND e.enumlabel IN ('sent', 'rejected', 'paid', 'closed')) +
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'work_orders' 
         AND column_name IN ('quote_sent_at', 'quote_viewed_at', 'quote_expires_at', 'quote_accepted_at', 
                             'quote_rejected_at', 'quote_rejection_reason', 'has_change_orders', 
                             'change_orders_total', 'invoice_sent_at', 'invoice_viewed_at', 'paid_at', 'closed_at')) +
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' 
         AND table_name IN ('quote_deliveries', 'invoice_deliveries', 'payment_deliveries', 'quote_responses', 
                            'change_orders', 'change_order_items', 'job_completion_checklist', 'customer_feedback'))
    )::TEXT || ' / 24 items' as status;
