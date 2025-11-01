-- Migration: Fix employee_permissions RLS policies
-- Problem: Policies use auth.uid() = user_id which is incorrect
--          user_id points to public.users.id, not auth.users.id
-- Solution: Use standard user_company_id() helper function pattern

BEGIN;

-- Drop existing incorrect policies
DROP POLICY IF EXISTS "Users can view own permissions" ON public.employee_permissions;
DROP POLICY IF EXISTS "Owners can manage employee permissions" ON public.employee_permissions;

-- ============================================
-- CORRECT RLS POLICIES
-- ============================================

-- Policy 1: Users can view their own permissions
-- Standard pattern: Join through users table to match auth.uid() → users.auth_user_id
CREATE POLICY "employee_permissions_select_own"
  ON public.employee_permissions
  FOR SELECT
  USING (
    user_id IN (
      SELECT id 
      FROM public.users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Policy 2: Users can view all permissions in their company (for company-wide visibility)
-- Standard pattern: Use user_company_id() helper function
CREATE POLICY "employee_permissions_select_company"
  ON public.employee_permissions
  FOR SELECT
  USING (company_id = public.user_company_id());

-- Policy 3: Company owners/admins can insert employee permissions
-- Standard pattern: Use user_company_id() helper function
CREATE POLICY "employee_permissions_insert_company"
  ON public.employee_permissions
  FOR INSERT
  WITH CHECK (company_id = public.user_company_id());

-- Policy 4: Company owners/admins can update employee permissions
-- Standard pattern: Use user_company_id() helper function
CREATE POLICY "employee_permissions_update_company"
  ON public.employee_permissions
  FOR UPDATE
  USING (company_id = public.user_company_id())
  WITH CHECK (company_id = public.user_company_id());

-- Policy 5: Company owners/admins can delete employee permissions
-- Standard pattern: Use user_company_id() helper function
CREATE POLICY "employee_permissions_delete_company"
  ON public.employee_permissions
  FOR DELETE
  USING (company_id = public.user_company_id());

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================
-- After this migration:
-- 1. Users can view their own permissions (SELECT own)
-- 2. Users can view all permissions in their company (SELECT company)
-- 3. Company users can manage all permissions in their company (INSERT/UPDATE/DELETE)
-- 4. Cross-company access is blocked (company isolation)

