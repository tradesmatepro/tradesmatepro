-- Check the user's profile data
-- Email from logs: jeraldjsmith@gmail.com
-- User ID from logs: 44475f47-be87-45ef-b465-2ecbbc0616ea

-- Check users table
SELECT 
  id,
  auth_user_id,
  company_id,
  role,
  status,
  created_at
FROM users
WHERE id = '44475f47-be87-45ef-b465-2ecbbc0616ea';

-- Check profiles table
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  phone,
  avatar_url,
  preferences,
  created_at
FROM profiles
WHERE user_id = '44475f47-be87-45ef-b465-2ecbbc0616ea';

-- Check auth.users for email
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'jeraldjsmith@gmail.com';

