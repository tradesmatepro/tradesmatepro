-- Migration: Fix RLS policies for profiles, employee_timesheets, invoices
-- Problem: Tables exist but 400 errors indicate RLS is blocking access
-- Solution: Add proper RLS policies using user_company_id() pattern

BEGIN;

-- ============================================
-- PROFILES TABLE
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- EMPLOYEE_TIMESHEETS TABLE
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.employee_timesheets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "employee_timesheets_select_company" ON public.employee_timesheets;
DROP POLICY IF EXISTS "employee_timesheets_insert_company" ON public.employee_timesheets;
DROP POLICY IF EXISTS "employee_timesheets_update_company" ON public.employee_timesheets;
DROP POLICY IF EXISTS "employee_timesheets_delete_company" ON public.employee_timesheets;

-- SELECT: Users can view timesheets from their company
CREATE POLICY "employee_timesheets_select_company"
  ON public.employee_timesheets
  FOR SELECT
  USING (company_id = public.user_company_id());

-- INSERT: Users can create timesheets for their company
CREATE POLICY "employee_timesheets_insert_company"
  ON public.employee_timesheets
  FOR INSERT
  WITH CHECK (company_id = public.user_company_id());

-- UPDATE: Users can update timesheets from their company
CREATE POLICY "employee_timesheets_update_company"
  ON public.employee_timesheets
  FOR UPDATE
  USING (company_id = public.user_company_id())
  WITH CHECK (company_id = public.user_company_id());

-- DELETE: Users can delete timesheets from their company
CREATE POLICY "employee_timesheets_delete_company"
  ON public.employee_timesheets
  FOR DELETE
  USING (company_id = public.user_company_id());

-- ============================================
-- INVOICES TABLE
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "invoices_select_company" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert_company" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update_company" ON public.invoices;
DROP POLICY IF EXISTS "invoices_delete_company" ON public.invoices;

-- SELECT: Users can view invoices from their company
CREATE POLICY "invoices_select_company"
  ON public.invoices
  FOR SELECT
  USING (company_id = public.user_company_id());

-- INSERT: Users can create invoices for their company
CREATE POLICY "invoices_insert_company"
  ON public.invoices
  FOR INSERT
  WITH CHECK (company_id = public.user_company_id());

-- UPDATE: Users can update invoices from their company
CREATE POLICY "invoices_update_company"
  ON public.invoices
  FOR UPDATE
  USING (company_id = public.user_company_id())
  WITH CHECK (company_id = public.user_company_id());

-- DELETE: Users can delete invoices from their company
CREATE POLICY "invoices_delete_company"
  ON public.invoices
  FOR DELETE
  USING (company_id = public.user_company_id());

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================
-- After this migration:
-- 1. profiles table: Users can access their own profile
-- 2. employee_timesheets table: Users can access company timesheets
-- 3. invoices table: Users can access company invoices
-- 4. No more 400 errors on Reports page

