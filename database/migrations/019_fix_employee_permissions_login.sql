-- Migration: Fix employee_permissions RLS to allow login
-- Problem: Policies block access during login when user_company_id() returns NULL
-- Solution: Add policy that uses auth_user_id directly (no circular dependency)

BEGIN;

-- Drop the restrictive policies that cause login issues
DROP POLICY IF EXISTS "employee_permissions_select_own" ON public.employee_permissions;
DROP POLICY IF EXISTS "employee_permissions_select_company" ON public.employee_permissions;

-- ============================================
-- CORRECT RLS POLICIES (NO CIRCULAR DEPENDENCY)
-- ============================================

-- Policy 1: Users can view their own permissions (using auth_user_id - works during login)
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

-- Policy 2: Users can view all permissions in their company (using user_company_id - works after login)
-- This is optional but useful for admins to see all employee permissions
CREATE POLICY "employee_permissions_select_company"
  ON public.employee_permissions
  FOR SELECT
  USING (
    company_id = public.user_company_id()
    OR
    -- Fallback: Allow if user_company_id() returns NULL (during login)
    (public.user_company_id() IS NULL AND user_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    ))
  );

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================
-- After this migration:
-- 1. Users can log in successfully (no circular dependency)
-- 2. Users can view their own permissions immediately after login
-- 3. Users can view all company permissions after session is established
-- 4. No 406 errors during login process

