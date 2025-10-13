-- ============================================
-- FIX: companies Table RLS Policies
-- ============================================
-- Problem: companies table has no RLS policies, causing 100+ 406 errors
-- Solution: Add policies to allow users to see their own company

-- Drop any existing policies (in case they exist)
DROP POLICY IF EXISTS "companies_select_own" ON companies;
DROP POLICY IF EXISTS "companies_insert_own" ON companies;
DROP POLICY IF EXISTS "companies_update_own" ON companies;
DROP POLICY IF EXISTS "companies_delete_own" ON companies;

-- ============================================
-- SELECT: Allow users to see their own company
-- ============================================
CREATE POLICY "companies_select_own"
ON companies FOR SELECT
USING (id = public.user_company_id());

-- ============================================
-- INSERT: Only super admins can create companies
-- ============================================
DO $$ BEGIN
  CREATE POLICY "companies_insert_admin"
  ON companies FOR INSERT
  WITH CHECK (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- ============================================
-- UPDATE: Allow users to update their own company
-- ============================================
DO $$ BEGIN
  CREATE POLICY "companies_update_own"
  ON companies FOR UPDATE
  USING (id = public.user_company_id())
  WITH CHECK (id = public.user_company_id());
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- ============================================
-- DELETE: Only super admins can delete companies
-- ============================================
DO $$ BEGIN
  CREATE POLICY "companies_delete_admin"
  ON companies FOR DELETE
  USING (public.is_super_admin());
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================
-- This should now work:
-- 1. User queries: SELECT name FROM companies WHERE id = user_company_id()
-- 2. Policy allows because id = user_company_id() is true
-- 3. Company name loads successfully
-- 4. No more 406 errors on companies table

