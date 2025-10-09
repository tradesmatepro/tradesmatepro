-- Find all users and their profiles

-- Show all users
SELECT 
  id as user_id,
  auth_user_id,
  company_id,
  role,
  status
FROM users
ORDER BY created_at DESC;

-- Show all profiles
SELECT 
  user_id,
  first_name,
  last_name,
  phone,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- Find users WITHOUT profiles
SELECT 
  u.id as user_id,
  u.auth_user_id,
  u.role,
  u.company_id,
  p.user_id as profile_exists
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- Create profiles for ALL users that don't have one
INSERT INTO profiles (
  user_id,
  first_name,
  last_name,
  phone,
  timezone,
  language,
  created_at,
  updated_at
)
SELECT 
  u.id,
  'User',  -- Default first name
  COALESCE(c.name, 'Unknown'),  -- Use company name as last name if available
  c.phone,  -- Use company phone if available
  'America/Los_Angeles',
  'en',
  NOW(),
  NOW()
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN companies c ON u.company_id = c.id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Update the profile for user with company_id cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e (Smith Plumbing)
UPDATE profiles
SET 
  first_name = 'Jerald',
  last_name = 'Smith',
  phone = '+15417050524',
  address_line_1 = '1103 Chinook Street',
  city = 'The Dalles',
  state_province = 'OR',
  postal_code = '97058',
  country = 'US',
  updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM users WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'
);

-- Show final result
SELECT 
  u.id as user_id,
  u.auth_user_id,
  u.company_id,
  u.role,
  c.name as company_name,
  p.first_name,
  p.last_name,
  p.phone,
  p.address_line_1
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN companies c ON u.company_id = c.id
ORDER BY u.created_at DESC;

