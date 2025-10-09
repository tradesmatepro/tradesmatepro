-- Fix the profile record to link to the correct user_id

-- Step 1: Show the current state
SELECT 
  'BEFORE FIX - Users table:' as info,
  id as business_user_id,
  auth_user_id,
  company_id,
  role,
  status
FROM users
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';

SELECT 
  'BEFORE FIX - Profiles table:' as info,
  id as profile_id,
  user_id as business_user_id_link,
  first_name,
  last_name,
  email,
  company_id
FROM profiles
WHERE email = 'jeraldjsmith@gmail.com' OR company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';

-- Step 2: Fix the profile by linking it to the correct business user ID
-- The profile with auth_user_id 268b99b5-907d-4b48-ad0e-92cdd4ac388a
-- should link to business user with auth_user_id 268b99b5-907d-4b48-ad0e-92cdd4ac388a

UPDATE profiles
SET user_id = (
  SELECT id 
  FROM users 
  WHERE auth_user_id = '268b99b5-907d-4b48-ad0e-92cdd4ac388a'
)
WHERE id = '268b99b5-907d-4b48-ad0e-92cdd4ac388a'
  AND user_id IS NULL;

-- Step 3: Show the result
SELECT 
  'AFTER FIX - Profiles table:' as info,
  id as profile_id,
  user_id as business_user_id_link,
  first_name,
  last_name,
  email,
  phone,
  address_line_1,
  city,
  state_province,
  postal_code
FROM profiles
WHERE email = 'jeraldjsmith@gmail.com' OR company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';

-- Step 4: Verify the link is correct
SELECT 
  'VERIFICATION - User and Profile linked:' as info,
  u.id as business_user_id,
  u.auth_user_id,
  u.company_id,
  u.role,
  p.id as profile_id,
  p.user_id as profile_links_to,
  p.first_name,
  p.last_name,
  p.email,
  CASE 
    WHEN u.id = p.user_id THEN '✅ LINKED CORRECTLY'
    ELSE '❌ NOT LINKED'
  END as link_status
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';

