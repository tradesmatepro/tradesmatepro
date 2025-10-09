-- Check current profiles table schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if profiles table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'profiles'
) as profiles_exists;

-- Check sample data
SELECT 
    id,
    user_id,
    first_name,
    last_name,
    phone,
    avatar_url,
    created_at
FROM profiles
LIMIT 5;

