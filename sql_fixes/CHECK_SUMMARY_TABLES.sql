-- Check if customer_financial_summary and customer_summary are TABLES or VIEWS
SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_type = 'BASE TABLE' THEN 'ACTUAL TABLE'
        WHEN table_type = 'VIEW' THEN 'VIEW (computed)'
        ELSE table_type
    END as type_description
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('customer_financial_summary', 'customer_summary', 'customers_financial_summary')
ORDER BY table_name;

-- If they're views, show their definitions
SELECT 
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('customer_financial_summary', 'customer_summary', 'customers_financial_summary');

-- Check row counts if they're tables
DO $$
DECLARE
    cnt INTEGER;
BEGIN
    -- Check customer_financial_summary
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_financial_summary' AND table_type = 'BASE TABLE') THEN
        SELECT COUNT(*) INTO cnt FROM customer_financial_summary;
        RAISE NOTICE 'customer_financial_summary: % rows', cnt;
    ELSE
        RAISE NOTICE 'customer_financial_summary: Not a table or does not exist';
    END IF;
    
    -- Check customer_summary
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_summary' AND table_type = 'BASE TABLE') THEN
        SELECT COUNT(*) INTO cnt FROM customer_summary;
        RAISE NOTICE 'customer_summary: % rows', cnt;
    ELSE
        RAISE NOTICE 'customer_summary: Not a table or does not exist';
    END IF;
    
    -- Check customers_financial_summary (alternate name)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers_financial_summary' AND table_type = 'BASE TABLE') THEN
        SELECT COUNT(*) INTO cnt FROM customers_financial_summary;
        RAISE NOTICE 'customers_financial_summary: % rows', cnt;
    ELSE
        RAISE NOTICE 'customers_financial_summary: Not a table or does not exist';
    END IF;
END $$;

-- Show ALL customer-related tables and their types
SELECT 
    table_name,
    table_type,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name LIKE '%customer%'
ORDER BY 
    CASE table_type 
        WHEN 'BASE TABLE' THEN 1 
        WHEN 'VIEW' THEN 2 
        ELSE 3 
    END,
    table_name;
