-- ============================================================================
-- AGGRESSIVE FIX: Drop ALL versions of get_filtered_invoices and recreate
-- ============================================================================

-- Drop ALL possible overloads explicitly
DROP FUNCTION IF EXISTS public.get_filtered_invoices() CASCADE;
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE) CASCADE;
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) CASCADE;
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, INT) CASCADE;
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, INT, INT) CASCADE;
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, INT, INT) CASCADE;
-- Also drop the old signature that returns multiple columns
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID, TEXT, TEXT, INT, INT) CASCADE;

-- Create the new function that queries work_orders table
CREATE FUNCTION public.get_filtered_invoices(
  p_company_id UUID,
  p_status_filter TEXT DEFAULT 'all',
  p_search_term TEXT DEFAULT '',
  p_date_start TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_date_end TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (id UUID) 
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT wo.id
  FROM work_orders wo
  LEFT JOIN customers c ON wo.customer_id = c.id
  WHERE wo.company_id = p_company_id
    AND wo.status IN ('invoiced', 'paid', 'closed')
    AND (
      p_status_filter = 'all'
      OR (p_status_filter = 'outstanding' AND wo.status = 'invoiced')
      OR (p_status_filter = 'paid' AND wo.status = 'paid')
      OR (p_status_filter = 'overdue' AND wo.due_date < CURRENT_DATE AND wo.status IN ('invoiced', 'paid'))
      OR (p_status_filter = 'aging_0_30' AND wo.due_date < CURRENT_DATE AND (CURRENT_DATE - wo.due_date) <= 30 AND wo.status IN ('invoiced', 'paid'))
      OR (p_status_filter = 'aging_31_60' AND wo.due_date < CURRENT_DATE AND (CURRENT_DATE - wo.due_date) > 30 AND (CURRENT_DATE - wo.due_date) <= 60 AND wo.status IN ('invoiced', 'paid'))
      OR (p_status_filter = 'aging_61_90' AND wo.due_date < CURRENT_DATE AND (CURRENT_DATE - wo.due_date) > 60 AND (CURRENT_DATE - wo.due_date) <= 90 AND wo.status IN ('invoiced', 'paid'))
      OR (p_status_filter = 'aging_90_plus' AND wo.due_date < CURRENT_DATE AND (CURRENT_DATE - wo.due_date) > 90 AND wo.status IN ('invoiced', 'paid'))
    )
    AND (
      p_search_term = ''
      OR wo.work_order_number ILIKE '%' || p_search_term || '%'
      OR wo.quote_number ILIKE '%' || p_search_term || '%'
      OR c.name ILIKE '%' || p_search_term || '%'
    )
    AND (
      p_date_start IS NULL OR wo.created_at >= p_date_start
    )
    AND (
      p_date_end IS NULL OR wo.created_at <= p_date_end
    )
  ORDER BY wo.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Done!

