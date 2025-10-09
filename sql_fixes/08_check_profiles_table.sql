-- Check if profiles table exists and has data

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if your profile exists
SELECT *
FROM profiles
WHERE user_id = '44475f47-be87-45ef-b465-2ecbbc0616ea';

-- Check all profiles
SELECT user_id, first_name, last_name, phone, created_at
FROM profiles;

