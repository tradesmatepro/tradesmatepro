-- Check current status values in customers table
SELECT 'Current customer status values:' as info;
SELECT DISTINCT status, COUNT(*) as count
FROM customers 
GROUP BY status;

-- Check current customer types
SELECT 'Current customer types:' as info;
SELECT DISTINCT customer_type, COUNT(*) as count
FROM customers 
GROUP BY customer_type;

-- Check current constraints
SELECT 'Current constraints on customers table:' as info;
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'customers' AND constraint_type = 'CHECK';
