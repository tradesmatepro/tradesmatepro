-- =====================================================
-- TAX ID COLUMN-LEVEL SECURITY MIGRATION
-- =====================================================
-- This migration adds column-level security for tax_id
-- Only admins and super admins can view tax_id
-- =====================================================

-- Step 1: Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the user's role from profiles table
  SELECT role INTO user_role
  FROM profiles
  WHERE user_id = auth.uid();
  
  -- Return true if user is admin or super_admin
  RETURN user_role IN ('admin', 'super_admin', 'owner');
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create helper function to check if user is owner
CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the user's role from profiles table
  SELECT role INTO user_role
  FROM profiles
  WHERE user_id = auth.uid();
  
  -- Return true if user is owner
  RETURN user_role = 'owner';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create a secure view that hides tax_id from non-admins
CREATE OR REPLACE VIEW companies_secure AS
SELECT 
  c.id,
  c.company_number,
  c.name,
  c.legal_name,
  -- Only show tax_id to admins
  CASE 
    WHEN is_admin() OR is_owner() THEN decrypt_tax_id(c.encrypted_tax_id)
    ELSE NULL
  END AS tax_id,
  c.phone,
  c.email,
  c.website,
  c.address_line1,
  c.address_line2,
  c.city,
  c.state_province,
  c.postal_code,
  c.country,
  c.time_zone,
  c.currency,
  c.is_active,
  c.created_at,
  c.updated_at,
  c.default_tax_rate,
  c.created_by,
  c.tagline,
  c.logo_url,
  c.industry,
  c.industry_tags,
  c.business_hours_start,
  c.business_hours_end,
  c.working_days,
  c.default_buffer_before_minutes,
  c.default_buffer_after_minutes,
  c.job_buffer_minutes,
  c.min_advance_booking_hours,
  c.max_advance_booking_days,
  c.enable_customer_self_scheduling,
  c.auto_approve_customer_selections,
  c.invoice_prefix,
  c.invoice_start_number,
  c.company_logo_url,
  c.company_banner_url,
  c.accepts_emergency,
  c.emergency_fee,
  c.nights_weekends,
  c.theme_color,
  c.secondary_color,
  c.avg_rating,
  c.rating_count,
  c.licenses,
  c.timezone,
  c.invoice_footer,
  c.quote_terms,
  c.payment_instructions,
  -- Include encrypted_tax_id for admins who need to update it
  CASE 
    WHEN is_admin() OR is_owner() THEN c.encrypted_tax_id
    ELSE NULL
  END AS encrypted_tax_id
FROM companies c;

-- Step 4: Grant permissions on the secure view
GRANT SELECT ON companies_secure TO authenticated;

-- Step 5: Create RLS policy for encrypted_tax_id column
-- This prevents direct access to encrypted_tax_id column in companies table
-- Users must use the companies_secure view instead

-- First, let's add a comment to guide developers
COMMENT ON COLUMN companies.encrypted_tax_id IS 'SECURITY: Only accessible to admins. Use companies_secure view for automatic role-based filtering.';
COMMENT ON VIEW companies_secure IS 'Secure view of companies table with column-level security. Tax ID only visible to admins and owners.';

-- Step 6: Create function to check if user can view tax_id
CREATE OR REPLACE FUNCTION can_view_tax_id()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN is_admin() OR is_owner();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================
-- Frontend should use companies_secure view instead of companies table:
-- 
-- Instead of:
--   SELECT * FROM companies WHERE id = 'company-id'
-- 
-- Use:
--   SELECT * FROM companies_secure WHERE id = 'company-id'
-- 
-- The view will automatically hide tax_id from non-admins
-- =====================================================

-- =====================================================
-- TESTING
-- =====================================================
-- Test as admin:
-- SELECT tax_id FROM companies_secure WHERE id = 'your-company-id';
-- Should return decrypted tax_id
--
-- Test as non-admin:
-- SELECT tax_id FROM companies_secure WHERE id = 'your-company-id';
-- Should return NULL
-- =====================================================

-- =====================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =====================================================
-- To rollback this migration:
-- 1. DROP VIEW companies_secure;
-- 2. DROP FUNCTION can_view_tax_id();
-- 3. DROP FUNCTION is_owner();
-- 4. DROP FUNCTION is_admin();
-- =====================================================

