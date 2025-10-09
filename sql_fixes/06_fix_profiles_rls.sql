-- Fix RLS policies for profiles table
-- Users should be able to view and update their own profile

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (
  auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = profiles.user_id
  )
);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = profiles.user_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = profiles.user_id
  )
);

-- Policy 3: System can insert profiles (for new user creation)
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = profiles.user_id
  )
);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

