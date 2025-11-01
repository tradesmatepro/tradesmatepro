-- COMPREHENSIVE FIX: Create RPC function and add missing settings columns
-- This fixes the 400 Bad Request errors in logs

-- ============================================================================
-- PART 1: Create get_schedulable_employees RPC function
-- ============================================================================

CREATE OR REPLACE FUNCTION get_schedulable_employees(p_company_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  employee_id UUID,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  role TEXT,
  status TEXT,
  job_title TEXT,
  is_schedulable BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    e.user_id,
    e.id AS employee_id,
    u.name AS full_name,
    u.first_name,
    u.last_name,
    u.email,
    u.role,
    u.status,
    e.job_title,
    COALESCE(e.is_schedulable, true) AS is_schedulable
  FROM employees e
  INNER JOIN users u ON e.user_id = u.id
  WHERE e.company_id = p_company_id
    AND COALESCE(e.is_schedulable, true) = true
  ORDER BY u.name ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_schedulable_employees(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_schedulable_employees(UUID) TO anon;

COMMENT ON FUNCTION get_schedulable_employees(UUID) IS 'Returns all schedulable employees for a company with their user details. Used by scheduling components.';

-- ============================================================================
-- PART 2: Add missing columns to settings table
-- ============================================================================

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS enable_customer_self_scheduling BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_approve_customer_selections BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS job_buffer_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS default_buffer_before_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS default_buffer_after_minutes INTEGER DEFAULT 0;

-- ============================================================================
-- PART 3: Verify the changes
-- ============================================================================

-- Verify RPC function exists
SELECT 'RPC Function Status' as check_type, 
       CASE WHEN EXISTS (
         SELECT 1 FROM pg_proc 
         WHERE proname = 'get_schedulable_employees'
       ) THEN '✅ CREATED' ELSE '❌ MISSING' END as status;

-- Verify settings columns exist
SELECT 'Settings Columns' as check_type,
       COUNT(*) as columns_found
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'settings' 
  AND column_name IN (
    'enable_customer_self_scheduling',
    'auto_approve_customer_selections',
    'job_buffer_minutes',
    'default_buffer_before_minutes',
    'default_buffer_after_minutes'
  );

