-- Verify profiles table exists and create profile if missing

-- First, check if profiles table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    RAISE NOTICE 'profiles table does NOT exist!';
  ELSE
    RAISE NOTICE 'profiles table exists';
  END IF;
END $$;

-- Check if profile exists for user_id 44475f47-be87-45ef-b465-2ecbbc0616ea
DO $$
DECLARE
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count
  FROM profiles
  WHERE user_id = '44475f47-be87-45ef-b465-2ecbbc0616ea';
  
  RAISE NOTICE 'Profile count for user: %', profile_count;
  
  IF profile_count = 0 THEN
    RAISE NOTICE 'Profile does NOT exist - creating it now...';
    
    -- Create the profile
    INSERT INTO profiles (
      user_id,
      first_name,
      last_name,
      phone,
      address_line_1,
      city,
      state_province,
      postal_code,
      country,
      timezone,
      language,
      created_at,
      updated_at
    ) VALUES (
      '44475f47-be87-45ef-b465-2ecbbc0616ea',
      'Jerald',
      'Smith',
      '+15417050524',
      '1103 Chinook Street',
      'The Dalles',
      'OR',
      '97058',
      'US',
      'America/Los_Angeles',
      'en',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Profile created successfully!';
  ELSE
    RAISE NOTICE 'Profile already exists';
  END IF;
END $$;

-- Verify the profile now exists
SELECT 
  user_id,
  first_name,
  last_name,
  phone,
  address_line_1,
  city,
  state_province,
  postal_code,
  created_at
FROM profiles
WHERE user_id = '44475f47-be87-45ef-b465-2ecbbc0616ea';

