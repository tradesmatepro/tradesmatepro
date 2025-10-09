-- Find ALL customer-related tables in the database
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name LIKE '%customer%'
ORDER BY table_name;

-- Show structure of each customer table
SELECT 
    'CUSTOMERS TABLE:' as section;
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;

SELECT 
    'CUSTOMER_ADDRESSES TABLE:' as section;
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'customer_addresses'
ORDER BY ordinal_position;

SELECT 
    'CUSTOMER_CONTACTS TABLE:' as section;
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'customer_contacts'
ORDER BY ordinal_position;

SELECT 
    'CUSTOMER_TAGS TABLE:' as section;
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'customer_tags'
ORDER BY ordinal_position;

SELECT 
    'CUSTOMER_TAG_ASSIGNMENTS TABLE:' as section;
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'customer_tag_assignments'
ORDER BY ordinal_position;

SELECT 
    'CUSTOMER_COMMUNICATIONS TABLE:' as section;
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'customer_communications'
ORDER BY ordinal_position;

SELECT 
    'CUSTOMER_NOTES TABLE:' as section;
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'customer_notes'
ORDER BY ordinal_position;

SELECT 
    'CUSTOMER_HISTORY TABLE:' as section;
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'customer_history'
ORDER BY ordinal_position;

SELECT 
    'CUSTOMER_PREFERENCES TABLE:' as section;
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'customer_preferences'
ORDER BY ordinal_position;

SELECT 
    'CUSTOMER_FINANCIAL_SUMMARY TABLE:' as section;
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'customer_financial_summary'
ORDER BY ordinal_position;

SELECT 
    'CUSTOMER_SUMMARY TABLE:' as section;
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'customer_summary'
ORDER BY ordinal_position;

-- Check for views (computed tables)
SELECT 
    'CUSTOMER VIEWS:' as section;
SELECT 
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE '%customer%';

-- Check row counts
SELECT 
    'ROW COUNTS:' as section;
    
DO $$
DECLARE
    tbl TEXT;
    cnt INTEGER;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%customer%'
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', tbl) INTO cnt;
        RAISE NOTICE 'Table: % - Rows: %', tbl, cnt;
    END LOOP;
END $$;
