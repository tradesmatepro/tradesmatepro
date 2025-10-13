-- FIX PROFILES 406 ERRORS
-- Run this in Supabase SQL Editor

-- Step 1: Drop all 8 policies on profiles table
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "app_owner_bypass" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Step 2: Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify RLS is disabled
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname = 'profiles';
-- Should show: rls_enabled = false

-- Step 4: Verify no policies exist
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename = 'profiles';
-- Should show: policy_count = 0

-- Step 5: Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

