-- Check customer_status_enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'customer_status_enum') 
ORDER BY enumsortorder;

