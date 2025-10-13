-- ============================================
-- FIX PROFILES RLS POLICIES PROPERLY
-- ============================================
-- 
-- PROBLEM: There are 8 conflicting policies on profiles table
-- - 4 policies check: user_id = auth.uid() (WRONG - different UUIDs!)
-- - 4 policies check: auth.uid() IN (SELECT auth_user_id FROM users WHERE id = user_id) (CORRECT!)
--
-- ARCHITECTURE:
-- auth.users (Supabase) → users.auth_user_id → users.id → profiles.user_id
--
-- SOLUTION: Drop all policies and recreate only the CORRECT ones
-- ============================================

-- Step 1: Drop ALL existing policies (both correct and incorrect)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "app_owner_bypass" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Step 2: Enable RLS (required for security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create CORRECT policies that join through users table
-- ============================================

-- Policy 1: SELECT - Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (
  auth.uid() IN (
    SELECT auth_user_id 
    FROM users 
    WHERE id = profiles.user_id
  )
);

-- Policy 2: INSERT - Users can create their own profile
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT auth_user_id 
    FROM users 
    WHERE id = profiles.user_id
  )
);

-- Policy 3: UPDATE - Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT auth_user_id 
    FROM users 
    WHERE id = profiles.user_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT auth_user_id 
    FROM users 
    WHERE id = profiles.user_id
  )
);

-- Policy 4: DELETE - Users can delete their own profile (optional)
CREATE POLICY "Users can delete own profile"
ON profiles
FOR DELETE
USING (
  auth.uid() IN (
    SELECT auth_user_id 
    FROM users 
    WHERE id = profiles.user_id
  )
);

-- Step 4: Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Step 5: Verify policies
SELECT 
  policyname,
  cmd as command,
  permissive,
  roles,
  CASE 
    WHEN qual LIKE '%auth_user_id%' THEN '✅ CORRECT (joins through users table)'
    WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%auth_user_id%' THEN '❌ WRONG (direct comparison)'
    ELSE 'ℹ️ CHECK MANUALLY'
  END as policy_status
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 6: Verify RLS is enabled
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled,
  CASE 
    WHEN relrowsecurity THEN '✅ RLS is ENABLED (secure)'
    ELSE '❌ RLS is DISABLED (insecure!)'
  END as status
FROM pg_class 
WHERE relname = 'profiles';

-- ============================================
-- EXPLANATION:
-- ============================================
-- 
-- WHY THIS WORKS:
-- 1. auth.uid() returns the Supabase auth user ID
-- 2. users.auth_user_id stores the Supabase auth user ID
-- 3. profiles.user_id references users.id (your internal user ID)
-- 4. The policy joins: auth.uid() → users.auth_user_id → users.id → profiles.user_id
--
-- WHY THE OLD POLICIES FAILED:
-- - They checked: profiles.user_id = auth.uid()
-- - But profiles.user_id is your internal UUID (from users.id)
-- - And auth.uid() is Supabase's auth UUID (from auth.users.id)
-- - These are DIFFERENT UUIDs, so the check always failed → 406 errors
--
-- ============================================

