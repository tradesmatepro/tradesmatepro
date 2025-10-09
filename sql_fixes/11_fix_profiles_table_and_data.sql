-- Fix profiles table structure and create missing profiles

-- Step 1: Add unique constraint on user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
    RAISE NOTICE 'Added unique constraint on profiles.user_id';
  ELSE
    RAISE NOTICE 'Unique constraint already exists';
  END IF;
END $$;

-- Step 2: Show all users
SELECT 
  'USERS TABLE:' as info,
  id as user_id,
  auth_user_id,
  company_id,
  role,
  status
FROM users
ORDER BY created_at DESC;

-- Step 3: Show all profiles
SELECT 
  'PROFILES TABLE:' as info,
  user_id,
  first_name,
  last_name,
  phone
FROM profiles
ORDER BY created_at DESC;

-- Step 4: Create profiles for users that don't have one
DO $$
DECLARE
  user_record RECORD;
  company_name TEXT;
  company_phone TEXT;
BEGIN
  FOR user_record IN 
    SELECT u.id, u.company_id
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE p.user_id IS NULL
  LOOP
    -- Get company info if available
    SELECT name, phone INTO company_name, company_phone
    FROM companies
    WHERE id = user_record.company_id;
    
    -- Create profile
    INSERT INTO profiles (
      user_id,
      first_name,
      last_name,
      phone,
      timezone,
      language,
      created_at,
      updated_at
    ) VALUES (
      user_record.id,
      'User',
      COALESCE(company_name, 'Unknown'),
      company_phone,
      'America/Los_Angeles',
      'en',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created profile for user_id: %', user_record.id;
  END LOOP;
END $$;

-- Step 5: Update profile for Smith Plumbing user
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

-- Step 6: Show final result
SELECT 
  'FINAL RESULT:' as info,
  u.id as user_id,
  u.auth_user_id,
  u.company_id,
  u.role,
  c.name as company_name,
  p.first_name,
  p.last_name,
  p.phone,
  p.address_line_1,
  p.city,
  p.state_province
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN companies c ON u.company_id = c.id
ORDER BY u.created_at DESC;

