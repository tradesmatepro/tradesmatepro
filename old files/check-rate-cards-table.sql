-- Check if rate_cards table exists and has data
SELECT 
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'rate_cards'
    ) as table_exists;

-- If table exists, show structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'rate_cards'
ORDER BY ordinal_position;

-- If table exists, show row count
SELECT COUNT(*) as row_count FROM rate_cards;

-- Show sample data if any
SELECT * FROM rate_cards LIMIT 5;

