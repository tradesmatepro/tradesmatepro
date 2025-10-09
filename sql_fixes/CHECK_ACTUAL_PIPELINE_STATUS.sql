-- ========================================
-- CHECK ACTUAL PIPELINE STATUS VALUES
-- What status values do we ACTUALLY have?
-- ========================================

-- 1. Check if work_order_status_enum exists and what values it has
SELECT 
    e.enumlabel as status_value,
    '✅ EXISTS' as current_status
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'work_order_status_enum'
ORDER BY e.enumsortorder;

-- 2. Check what status values are ACTUALLY being used in work_orders table
SELECT 
    status,
    COUNT(*) as count,
    '✅ IN USE' as usage_status
FROM work_orders
GROUP BY status
ORDER BY count DESC;

-- 3. Check work_orders table structure - what columns exist?
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'work_orders'
AND column_name LIKE '%status%' OR column_name LIKE '%stage%' OR column_name LIKE '%at'
ORDER BY ordinal_position;

-- 4. Check if we have timestamp columns for pipeline tracking
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'work_orders'
AND (
    column_name LIKE '%_at' OR 
    column_name LIKE '%_date' OR
    column_name LIKE 'quote_%' OR
    column_name LIKE 'invoice_%' OR
    column_name LIKE 'paid%' OR
    column_name LIKE 'closed%'
)
ORDER BY column_name;
