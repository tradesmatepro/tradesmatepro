-- ============================================
-- FIX: profiles Table RLS Policies
-- ============================================
-- Problem: profiles table has no RLS policies, causing 200+ 406 errors
-- Solution: Add policies to allow users to manage their own profile

-- Drop any existing policies (in case they exist)
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

-- ============================================
-- SELECT: Allow users to see their own profile
-- ============================================
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
USING (user_id = auth.uid());

-- ============================================
-- INSERT: Allow users to create their own profile
-- ============================================
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ============================================
-- UPDATE: Allow users to update their own profile
-- ============================================
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- DELETE: Allow users to delete their own profile
-- ============================================
CREATE POLICY "profiles_delete_own"
ON profiles FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- VERIFICATION
-- ============================================
-- This should now work:
-- 1. User queries: SELECT * FROM profiles WHERE user_id = auth.uid()
-- 2. Policy allows because user_id = auth.uid() is true
-- 3. Theme preferences load successfully
-- 4. No more 406 errors on profiles table

