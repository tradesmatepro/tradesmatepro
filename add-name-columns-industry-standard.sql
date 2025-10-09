-- ============================================================================
-- ADD COMPUTED NAME COLUMNS - INDUSTRY STANDARD
-- Makes TradeMate Pro match Jobber, Housecall Pro, AND ServiceTitan
-- ============================================================================
-- Date: 2025-10-01
-- Purpose: Add computed 'name' columns to profiles and employees tables
-- Why: Industry standard is to have BOTH first_name/last_name AND name
--      - first_name/last_name = Structured data (for sorting, filtering)
--      - name = Display name (for UI, reports, dropdowns)
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ADD COMPUTED NAME COLUMN TO PROFILES TABLE
-- ============================================================================

-- Add name column (computed from first_name + last_name)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS name TEXT 
GENERATED ALWAYS AS (
  CASE 
    WHEN first_name IS NOT NULL AND last_name IS NOT NULL 
      THEN first_name || ' ' || last_name
    WHEN first_name IS NOT NULL 
      THEN first_name
    WHEN last_name IS NOT NULL 
      THEN last_name
    ELSE 'Unknown'
  END
) STORED;

-- Add index for fast name searches
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name);

-- Add index for fast name sorting
CREATE INDEX IF NOT EXISTS idx_profiles_name_lower ON profiles(LOWER(name));

COMMENT ON COLUMN profiles.name IS 'Computed full name (first_name + last_name) - Industry standard for display';

-- ============================================================================
-- 2. ADD COMPUTED NAME COLUMN TO EMPLOYEES TABLE
-- ============================================================================

-- First, check if employees table needs first_name/last_name
-- (It should reference profiles.user_id for name data, but having a computed column helps)

-- Add computed name column that pulls from profiles
-- Note: This requires a JOIN, so we'll use a VIEW instead (see below)

-- ============================================================================
-- 3. CREATE USER_PROFILES VIEW (INDUSTRY STANDARD)
-- ============================================================================

-- This view combines users + profiles for easy querying
-- Matches Jobber/ServiceTitan pattern
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    -- Profile data
    p.id,
    p.user_id,
    p.first_name,
    p.last_name,
    p.name,  -- ✅ NEW: Computed name column
    p.phone,
    p.email,
    p.avatar_url,
    p.status,
    p.role,
    p.preferences,
    p.created_at,
    p.updated_at,
    
    -- User data
    u.auth_user_id,
    u.company_id,
    u.login_count,
    
    -- Company data
    c.name AS company_name,
    c.is_active AS company_is_active
    
FROM profiles p
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN companies c ON u.company_id = c.id;

COMMENT ON VIEW user_profiles IS 'Industry standard view combining users + profiles + companies';

-- ============================================================================
-- 4. CREATE EMPLOYEES_WITH_PROFILES VIEW (INDUSTRY STANDARD)
-- ============================================================================

-- This view combines employees + profiles for easy querying
-- Matches ServiceTitan pattern
CREATE OR REPLACE VIEW employees_with_profiles AS
SELECT 
    -- Employee data
    e.id AS employee_id,
    e.company_id,
    e.user_id,
    e.employee_number,
    e.hire_date,
    e.termination_date,
    e.job_title,
    e.department,
    e.hourly_rate,
    e.overtime_rate,
    e.employee_type,
    e.pay_type,
    e.certifications,
    e.skills,
    e.notes,
    e.created_at,
    e.updated_at,
    
    -- Profile data (for name and contact info)
    p.first_name,
    p.last_name,
    p.name,  -- ✅ NEW: Computed name column
    p.phone,
    p.email,
    p.avatar_url,
    p.status,
    p.role,
    
    -- User data
    u.auth_user_id,
    
    -- Company data
    c.name AS company_name
    
FROM employees e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN companies c ON e.company_id = c.id;

COMMENT ON VIEW employees_with_profiles IS 'Industry standard view combining employees + profiles + users + companies';

-- ============================================================================
-- 5. UPDATE EXISTING ROWS (BACKFILL)
-- ============================================================================

-- The GENERATED ALWAYS column will automatically compute for existing rows
-- No manual backfill needed!

-- ============================================================================
-- 6. CREATE HELPER FUNCTIONS (OPTIONAL)
-- ============================================================================

-- Function to get display name (handles NULL cases gracefully)
CREATE OR REPLACE FUNCTION get_display_name(
    p_first_name TEXT,
    p_last_name TEXT,
    p_email TEXT DEFAULT NULL
) RETURNS TEXT AS $$
BEGIN
    IF p_first_name IS NOT NULL AND p_last_name IS NOT NULL THEN
        RETURN p_first_name || ' ' || p_last_name;
    ELSIF p_first_name IS NOT NULL THEN
        RETURN p_first_name;
    ELSIF p_last_name IS NOT NULL THEN
        RETURN p_last_name;
    ELSIF p_email IS NOT NULL THEN
        RETURN split_part(p_email, '@', 1);  -- Use email username as fallback
    ELSE
        RETURN 'Unknown User';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_display_name IS 'Helper function to get display name with fallbacks';

COMMIT;

-- ============================================================================
-- VERIFY: Check the changes
-- ============================================================================

-- Check profiles table has name column
SELECT column_name, data_type, is_generated 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'name';

-- Check views exist
SELECT viewname FROM pg_views WHERE schemaname = 'public' 
AND viewname IN ('user_profiles', 'employees_with_profiles');

-- Sample query to test
SELECT id, first_name, last_name, name, email 
FROM profiles 
LIMIT 5;

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- profiles table now has:
-- ✅ first_name (structured data)
-- ✅ last_name (structured data)
-- ✅ name (computed display name) - INDUSTRY STANDARD
--
-- Views created:
-- ✅ user_profiles (users + profiles + companies)
-- ✅ employees_with_profiles (employees + profiles + users + companies)
--
-- This matches Jobber, Housecall Pro, and ServiceTitan patterns!
-- ============================================================================

