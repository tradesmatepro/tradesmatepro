-- ============================================================================
-- UPDATE INVOICE RPC FUNCTION - Add aging bucket filters
-- ============================================================================

CREATE OR REPLACE FUNCTION get_filtered_invoices(
  p_company_id UUID,
  p_status_filter TEXT DEFAULT 'all',
  p_search_term TEXT DEFAULT '',
  p_date_start TIMESTAMPTZ DEFAULT NULL,
  p_date_end TIMESTAMPTZ DEFAULT NULL,
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  invoice_number TEXT,
  status TEXT,
  customer_name TEXT,
  total_amount NUMERIC,
  created_at TIMESTAMPTZ,
  due_date DATE,
  days_overdue INT,
  is_overdue BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.invoice_number,
    i.status,
    c.name as customer_name,
    i.total_amount,
    i.created_at,
    i.due_date,
    CASE
      WHEN i.due_date < CURRENT_DATE AND i.status NOT IN ('paid', 'cancelled')
      THEN (CURRENT_DATE - i.due_date)::INT
      ELSE 0
    END as days_overdue,
    CASE
      WHEN i.due_date < CURRENT_DATE AND i.status NOT IN ('paid', 'cancelled')
      THEN TRUE
      ELSE FALSE
    END as is_overdue
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
$$ LANGUAGE plpgsql STABLE;

