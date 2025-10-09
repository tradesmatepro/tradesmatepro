-- Check what values exist in work_order_status_enum
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'work_order_status_enum') 
ORDER BY enumsortorder;

