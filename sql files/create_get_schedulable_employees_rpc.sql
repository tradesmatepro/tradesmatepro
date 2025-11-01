-- RPC: get_schedulable_employees
-- Returns all schedulable employees for a company with their user details
-- Used by: SmartSchedulingAssistant, JobsDatabasePanel, Calendar, Scheduling pages
-- Parameters: p_company_id (UUID)
-- Returns: Array of employee records with user details

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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_schedulable_employees(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_schedulable_employees(UUID) TO anon;

-- Add comment
COMMENT ON FUNCTION get_schedulable_employees(UUID) IS 'Returns all schedulable employees for a company with their user details. Used by scheduling components.';

