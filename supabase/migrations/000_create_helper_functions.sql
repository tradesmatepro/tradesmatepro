-- ============================================
-- TradeMate Pro - Helper Functions for RLS
-- ============================================
-- Create these functions FIRST before enabling RLS
-- ============================================

-- ============================================
-- Helper Function: Get User's Company ID
-- ============================================
-- Note: company_id is stored in employees table, not profiles
CREATE OR REPLACE FUNCTION public.user_company_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT company_id
  FROM public.employees
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- ============================================
-- Helper Function: Check if User is Admin
-- ============================================
-- Note: role is stored in users table (from auth.users)
-- For now, we'll check if user exists in employees table
-- TODO: Add role column to employees table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT true; -- Temporarily allow all authenticated users
  -- TODO: Implement proper role checking when role column is added
$$;

-- ============================================
-- Helper Function: Check if User is Super Admin
-- ============================================
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT false; -- No super admins yet
  -- TODO: Implement when role system is in place
$$;

