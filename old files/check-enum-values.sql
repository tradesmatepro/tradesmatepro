-- Check the actual enum values for work_order_status_enum
SELECT 
    enumlabel as status_value,
    enumsortorder as sort_order
FROM pg_enum
WHERE enumtypid = 'work_order_status_enum'::regtype
ORDER BY enumsortorder;

