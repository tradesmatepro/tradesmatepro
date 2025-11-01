-- FIX: Correct the get_schedulable_employees RPC function structure
-- The issue is that the SELECT statement doesn't match the RETURNS TABLE definition

DROP FUNCTION IF EXISTS get_schedulable_employees(UUID) CASCADE;

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
    u.id,                                          -- id
    e.user_id,                                     -- user_id
    e.id,                                          -- employee_id
    u.name,                                        -- full_name
    u.first_name,                                  -- first_name
    u.last_name,                                   -- last_name
    u.email,                                       -- email
    u.role::text,                                  -- role (cast enum to text)
    u.status::text,                                -- status (cast enum to text)
    e.job_title,                                   -- job_title
    COALESCE(e.is_schedulable, true)              -- is_schedulable
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

