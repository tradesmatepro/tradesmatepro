-- VERIFY PROFILES RLS STATUS
-- Run this in Supabase SQL Editor to check current state

-- 1. Check if RLS is enabled on profiles table
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled,
  CASE 
    WHEN relrowsecurity THEN '❌ RLS is ENABLED (causing 406 errors)'
    ELSE '✅ RLS is DISABLED (should fix 406 errors)'
  END as status
FROM pg_class 
WHERE relname = 'profiles';

-- 2. Count policies on profiles table
SELECT 
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '❌ Policies exist (causing 406 errors)'
    ELSE '✅ No policies (should fix 406 errors)'
  END as status
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. List all policies (if any exist)
SELECT 
  policyname,
  cmd as command,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 4. If RLS is still enabled or policies exist, run this to fix:
/*
-- Drop all policies
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles CASCADE';
    RAISE NOTICE 'Dropped policy: %', r.policyname;
  END LOOP;
END $$;

-- Disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
*/

