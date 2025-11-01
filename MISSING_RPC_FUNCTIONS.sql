-- ============================================================================
-- MISSING RPC FUNCTIONS FOR FRONTEND CONSOLIDATION
-- ============================================================================
-- These functions move business logic from frontend to backend
-- Provides single source of truth for common queries

-- ============================================================================
-- 1. GET UNSCHEDULED WORK ORDERS (for backlog)
-- ============================================================================
DROP FUNCTION IF EXISTS get_unscheduled_work_orders(UUID);
CREATE FUNCTION get_unscheduled_work_orders(p_company_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  customer_id UUID,
  labor_summary JSONB,
  estimated_duration INTEGER,
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wo.id,
    wo.title,
    wo.customer_id,
    wo.labor_summary,
    wo.estimated_duration,
    wo.scheduled_start,
    wo.scheduled_end,
    wo.status,
    wo.created_at
  FROM work_orders wo
  WHERE wo.company_id = p_company_id
    AND wo.status IN ('approved', 'scheduled', 'in_progress')
    AND wo.scheduled_start IS NULL
  ORDER BY wo.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. GET WORK ORDERS BY STATUS (for filtering)
-- ============================================================================
DROP FUNCTION IF EXISTS get_work_orders_by_status(UUID, TEXT[]);
CREATE FUNCTION get_work_orders_by_status(
  p_company_id UUID,
  p_statuses TEXT[] DEFAULT ARRAY['approved', 'scheduled', 'in_progress', 'completed', 'invoiced', 'paid', 'on_hold', 'needs_rescheduling']
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  status TEXT,
  customer_id UUID,
  customer_name TEXT,
  assigned_to UUID,
  assigned_user_name TEXT,
  total_amount NUMERIC,
  estimated_duration INTEGER,
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wo.id,
    wo.title,
    wo.status,
    wo.customer_id,
    c.name,
    wo.assigned_to,
    u.first_name || ' ' || u.last_name,
    wo.total_amount,
    wo.estimated_duration,
    wo.scheduled_start,
    wo.scheduled_end,
    wo.created_at
  FROM work_orders wo
  LEFT JOIN customers c ON wo.customer_id = c.id
  LEFT JOIN users u ON wo.assigned_to = u.id
  WHERE wo.company_id = p_company_id
    AND wo.status = ANY(p_statuses)
  ORDER BY wo.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. GET WORK ORDERS WITH CREW (for crew assignments)
-- ============================================================================
DROP FUNCTION IF EXISTS get_work_orders_with_crew(UUID, TEXT);
CREATE FUNCTION get_work_orders_with_crew(
  p_company_id UUID,
  p_status TEXT DEFAULT 'scheduled'
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  status TEXT,
  customer_id UUID,
  customer_name TEXT,
  total_amount NUMERIC,
  estimated_duration INTEGER,
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  crew_members JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wo.id,
    wo.title,
    wo.status,
    wo.customer_id,
    c.name,
    wo.total_amount,
    wo.estimated_duration,
    wo.scheduled_start,
    wo.scheduled_end,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'employee_id', wol.employee_id,
          'employee_name', e.full_name,
          'hours', wol.hours,
          'rate', wol.rate
        )
      ) FILTER (WHERE wol.employee_id IS NOT NULL),
      '[]'::jsonb
    ) as crew_members,
    wo.created_at
  FROM work_orders wo
  LEFT JOIN customers c ON wo.customer_id = c.id
  LEFT JOIN work_order_labor wol ON wo.id = wol.work_order_id
  LEFT JOIN employees e ON wol.employee_id = e.id
  WHERE wo.company_id = p_company_id
    AND wo.status = p_status
  GROUP BY wo.id, wo.title, wo.status, wo.customer_id, c.name, wo.total_amount, 
           wo.estimated_duration, wo.scheduled_start, wo.scheduled_end, wo.created_at
  ORDER BY wo.scheduled_start ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. GET WORK ORDERS FOR CALENDAR (optimized for calendar view)
-- ============================================================================
DROP FUNCTION IF EXISTS get_work_orders_for_calendar(UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, UUID);
CREATE FUNCTION get_work_orders_for_calendar(
  p_company_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE,
  p_employee_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  status TEXT,
  customer_id UUID,
  customer_name TEXT,
  assigned_to UUID,
  assigned_user_name TEXT,
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER,
  total_amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wo.id,
    wo.title,
    wo.status,
    wo.customer_id,
    c.name,
    wo.assigned_to,
    u.first_name || ' ' || u.last_name,
    wo.scheduled_start,
    wo.scheduled_end,
    wo.estimated_duration,
    wo.total_amount
  FROM work_orders wo
  LEFT JOIN customers c ON wo.customer_id = c.id
  LEFT JOIN users u ON wo.assigned_to = u.id
  WHERE wo.company_id = p_company_id
    AND wo.scheduled_start IS NOT NULL
    AND wo.scheduled_end IS NOT NULL
    AND wo.scheduled_start < p_end_date
    AND wo.scheduled_end > p_start_date
    AND (p_employee_id IS NULL OR wo.assigned_to = p_employee_id)
  ORDER BY wo.scheduled_start ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. GET CUSTOMERS WITH WORK ORDERS (for customer view)
-- ============================================================================
DROP FUNCTION IF EXISTS get_customers_with_work_order_count(UUID);
CREATE FUNCTION get_customers_with_work_order_count(p_company_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  work_order_count BIGINT,
  total_spent NUMERIC,
  last_work_order_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    c.street_address,
    COUNT(wo.id)::BIGINT,
    COALESCE(SUM(wo.total_amount), 0),
    MAX(wo.created_at)
  FROM customers c
  LEFT JOIN work_orders wo ON c.id = wo.customer_id
  WHERE c.company_id = p_company_id
  GROUP BY c.id, c.name, c.email, c.phone, c.street_address
  ORDER BY c.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT EXECUTE ON FUNCTION get_unscheduled_work_orders(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_work_orders_by_status(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_work_orders_with_crew(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_work_orders_for_calendar(UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_customers_with_work_order_count(UUID) TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the functions work:
-- SELECT * FROM get_unscheduled_work_orders('your-company-id');
-- SELECT * FROM get_work_orders_by_status('your-company-id');
-- SELECT * FROM get_work_orders_with_crew('your-company-id', 'scheduled');
-- SELECT * FROM get_work_orders_for_calendar('your-company-id', NOW(), NOW() + INTERVAL '7 days');
-- SELECT * FROM get_customers_with_work_order_count('your-company-id');

