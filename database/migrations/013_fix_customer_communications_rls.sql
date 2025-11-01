-- ========================================
-- FIX CUSTOMER COMMUNICATIONS RLS POLICIES
-- ========================================
-- Issue: RLS policies were using current_setting('app.current_company_id')
-- which TradeMate Pro doesn't set. Need to use standard pattern.
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS customer_communications_select_policy ON public.customer_communications;
DROP POLICY IF EXISTS customer_communications_insert_policy ON public.customer_communications;
DROP POLICY IF EXISTS customer_communications_update_policy ON public.customer_communications;
DROP POLICY IF EXISTS customer_communications_delete_policy ON public.customer_communications;

-- Create helper function if it doesn't exist
CREATE OR REPLACE FUNCTION public.user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT company_id FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Users can view communications for their company
CREATE POLICY customer_communications_select_policy ON public.customer_communications
    FOR SELECT
    TO authenticated
    USING (company_id = public.user_company_id());

-- Policy: Users can insert communications for their company
CREATE POLICY customer_communications_insert_policy ON public.customer_communications
    FOR INSERT
    TO authenticated
    WITH CHECK (company_id = public.user_company_id());

-- Policy: Users can update communications for their company
CREATE POLICY customer_communications_update_policy ON public.customer_communications
    FOR UPDATE
    TO authenticated
    USING (company_id = public.user_company_id())
    WITH CHECK (company_id = public.user_company_id());

-- Policy: Users can delete communications for their company
CREATE POLICY customer_communications_delete_policy ON public.customer_communications
    FOR DELETE
    TO authenticated
    USING (company_id = public.user_company_id());

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'customer_communications'
ORDER BY policyname;

