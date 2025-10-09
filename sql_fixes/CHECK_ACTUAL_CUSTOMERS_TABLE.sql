-- Check the actual structure of customers table
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- Check if customer_contacts already exists
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('customer_contacts', 'customer_communications', 'customer_notes', 'customer_preferences', 'customer_history')
ORDER BY table_name;
