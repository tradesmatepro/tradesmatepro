-- ========================================
-- FIX EQUIPMENT & PORTAL ISSUES
-- ========================================
-- 1. Equipment schema is correct (installed_by → employees.id)
-- 2. Create stub RPC function for portal invites (disable for now)
-- ========================================

-- Create stub RPC function for customer portal invites
-- This is a placeholder - full portal functionality will be implemented later
CREATE OR REPLACE FUNCTION public.find_or_create_global_customer(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_street_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_zip_code TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  -- For now, just return NULL to indicate feature is not ready
  -- This prevents the 404 error but doesn't actually create portal accounts
  RAISE EXCEPTION 'Customer portal invites are not yet implemented. This feature is coming soon!';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION public.find_or_create_global_customer IS 'Placeholder for customer portal invite functionality - not yet implemented';

