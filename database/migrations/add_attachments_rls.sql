-- ============================================
-- ADD RLS POLICIES FOR ATTACHMENTS TABLE
-- ============================================
-- This migration adds Row-Level Security policies to the attachments table
-- to ensure company-level data isolation (users can only access attachments
-- from their own company).
--
-- Pattern matches existing RLS policies on invoices, timesheets, etc.
-- ============================================

-- Step 1: Enable RLS on attachments table
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies (if any)
DROP POLICY IF EXISTS "attachments_select_company" ON public.attachments;
DROP POLICY IF EXISTS "attachments_insert_company" ON public.attachments;
DROP POLICY IF EXISTS "attachments_update_company" ON public.attachments;
DROP POLICY IF EXISTS "attachments_delete_company" ON public.attachments;

-- Step 3: Create helper function if it doesn't exist
-- This function returns the company_id for the currently authenticated user
CREATE OR REPLACE FUNCTION public.user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT company_id FROM public.users WHERE auth_user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create RLS policies

-- SELECT: Users can view attachments from their company
CREATE POLICY "attachments_select_company"
  ON public.attachments
  FOR SELECT
  USING (company_id = public.user_company_id());

-- INSERT: Users can create attachments for their company
CREATE POLICY "attachments_insert_company"
  ON public.attachments
  FOR INSERT
  WITH CHECK (company_id = public.user_company_id());

-- UPDATE: Users can update attachments from their company
CREATE POLICY "attachments_update_company"
  ON public.attachments
  FOR UPDATE
  USING (company_id = public.user_company_id())
  WITH CHECK (company_id = public.user_company_id());

-- DELETE: Users can delete attachments from their company
CREATE POLICY "attachments_delete_company"
  ON public.attachments
  FOR DELETE
  USING (company_id = public.user_company_id());

-- Step 5: Verify policies (optional - for debugging)
-- SELECT policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename = 'attachments'
-- ORDER BY policyname;

