-- ============================================
-- FIX: Users table login policy
-- ============================================
-- Problem: Users can't login because they can't query their own record
-- Solution: Add policy to allow users to see their own record by auth_user_id

-- Drop existing company-only policies
DROP POLICY IF EXISTS "company_users_select" ON users;
DROP POLICY IF EXISTS "company_users_insert" ON users;
DROP POLICY IF EXISTS "company_users_update" ON users;
DROP POLICY IF EXISTS "company_users_delete" ON users;

-- ============================================
-- SELECT: Allow users to see their own record + same company
-- ============================================
CREATE POLICY "users_select_own_or_company"
ON users FOR SELECT
USING (
  -- Allow users to see their own record (needed for login)
  auth_user_id = auth.uid()
  OR
  -- Allow users to see same company records (after login)
  company_id = public.user_company_id()
);

-- ============================================
-- INSERT: Only allow same company (admin operations)
-- ============================================
CREATE POLICY "users_insert_company"
ON users FOR INSERT
WITH CHECK (company_id = public.user_company_id());

-- ============================================
-- UPDATE: Allow users to update their own record + same company
-- ============================================
CREATE POLICY "users_update_own_or_company"
ON users FOR UPDATE
USING (
  -- Allow users to update their own record
  auth_user_id = auth.uid()
  OR
  -- Allow admins to update same company records
  company_id = public.user_company_id()
)
WITH CHECK (
  -- Prevent changing company_id
  company_id = public.user_company_id()
);

-- ============================================
-- DELETE: Only allow same company (admin operations)
-- ============================================
CREATE POLICY "users_delete_company"
ON users FOR DELETE
USING (company_id = public.user_company_id());

-- ============================================
-- VERIFICATION
-- ============================================
-- This should now work:
-- 1. User logs in with Supabase auth
-- 2. Query: SELECT * FROM users WHERE auth_user_id = auth.uid()
-- 3. Policy allows because auth_user_id = auth.uid() is true
-- 4. User data loads successfully
-- 5. user_company_id() function now works because employees table can be queried

