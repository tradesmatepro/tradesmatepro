-- ============================================================================
-- FIX: Update RPC to query invoices table correctly
-- ============================================================================
-- The invoices table exists and has the invoice records
-- The RPC was querying the wrong table

-- Drop old function
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, INT, INT) CASCADE;

-- Create new function that queries invoices table
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
  SELECT i.id
  FROM invoices i
  LEFT JOIN customers c ON i.customer_id = c.id
  WHERE i.company_id = p_company_id
    AND (
      p_status_filter = 'all'
      OR (p_status_filter = 'outstanding' AND i.status IN ('draft', 'sent', 'viewed', 'partially_paid'))
      OR (p_status_filter = 'paid' AND i.status = 'paid')
      OR (p_status_filter = 'overdue' AND i.due_date < CURRENT_DATE AND i.status NOT IN ('paid', 'cancelled'))
      OR (p_status_filter = 'aging_0_30' AND i.due_date < CURRENT_DATE AND (CURRENT_DATE - i.due_date) <= 30 AND i.status NOT IN ('paid', 'cancelled'))
      OR (p_status_filter = 'aging_31_60' AND i.due_date < CURRENT_DATE AND (CURRENT_DATE - i.due_date) > 30 AND (CURRENT_DATE - i.due_date) <= 60 AND i.status NOT IN ('paid', 'cancelled'))
      OR (p_status_filter = 'aging_61_90' AND i.due_date < CURRENT_DATE AND (CURRENT_DATE - i.due_date) > 60 AND (CURRENT_DATE - i.due_date) <= 90 AND i.status NOT IN ('paid', 'cancelled'))
      OR (p_status_filter = 'aging_90_plus' AND i.due_date < CURRENT_DATE AND (CURRENT_DATE - i.due_date) > 90 AND i.status NOT IN ('paid', 'cancelled'))
    )
    AND (
      p_search_term = ''
      OR i.invoice_number ILIKE '%' || p_search_term || '%'
      OR c.name ILIKE '%' || p_search_term || '%'
    )
    AND (
      p_date_start IS NULL OR i.created_at >= p_date_start
    )
    AND (
      p_date_end IS NULL OR i.created_at <= p_date_end
    )
  ORDER BY i.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Done! RPC now queries invoices table correctly

