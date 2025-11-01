-- ============================================================================
-- FIXED INVOICE RPC FUNCTIONS
-- ============================================================================

-- Drop existing functions if they exist (to avoid conflicts)
DROP FUNCTION IF EXISTS get_filtered_invoices(UUID, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, INT, INT) CASCADE;
DROP FUNCTION IF EXISTS upsert_invoice_for_work_order(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_invoice_status(UUID, TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_invoice_analytics(UUID) CASCADE;

-- ============================================================================
-- 1. UPSERT INVOICE (Create or Update - prevents duplicates)
-- ============================================================================
CREATE OR REPLACE FUNCTION upsert_invoice_for_work_order(
  p_company_id UUID,
  p_work_order_id UUID,
  p_status TEXT DEFAULT 'draft'
)
RETURNS TABLE (
  success BOOLEAN,
  invoice_id UUID,
  message TEXT
) AS $$
DECLARE
  v_existing_id UUID;
BEGIN
  -- Check if invoice already exists for this work order
  SELECT id INTO v_existing_id
  FROM invoices
  WHERE work_order_id = p_work_order_id
    AND company_id = p_company_id
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- Update existing invoice
    UPDATE invoices
    SET status = p_status::invoice_status_enum,
        updated_at = NOW(),
        sent_at = CASE WHEN p_status = 'sent' THEN NOW() ELSE sent_at END
    WHERE id = v_existing_id;

    RETURN QUERY SELECT TRUE::BOOLEAN, v_existing_id, ('Invoice updated to ' || p_status)::TEXT;
  ELSE
    -- Create new invoice
    INSERT INTO invoices (
      company_id,
      work_order_id,
      status,
      created_at,
      updated_at,
      sent_at
    )
    VALUES (
      p_company_id,
      p_work_order_id,
      p_status::invoice_status_enum,
      NOW(),
      NOW(),
      CASE WHEN p_status = 'sent' THEN NOW() ELSE NULL END
    )
    RETURNING id INTO v_existing_id;

    RETURN QUERY SELECT TRUE::BOOLEAN, v_existing_id, ('Invoice created with status ' || p_status)::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. GET FILTERED INVOICES (Fixed - returns only invoice IDs for filtering)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_filtered_invoices(
  p_company_id UUID,
  p_status_filter TEXT DEFAULT 'all',
  p_search_term TEXT DEFAULT '',
  p_date_start TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_date_end TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID
) AS $$
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
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 3. UPDATE INVOICE STATUS (with flexible transitions)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_invoice_status(
  p_invoice_id UUID,
  p_new_status TEXT,
  p_company_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_current_status TEXT;
BEGIN
  -- Get current status
  SELECT i.status INTO v_current_status
  FROM invoices i
  WHERE i.id = p_invoice_id AND i.company_id = p_company_id;

  IF v_current_status IS NULL THEN
    RETURN QUERY SELECT FALSE::BOOLEAN, 'Invoice not found'::TEXT;
    RETURN;
  END IF;

  -- Update status (allow flexible transitions for now)
  UPDATE invoices
  SET status = p_new_status::invoice_status_enum,
      updated_at = NOW(),
      sent_at = CASE WHEN p_new_status = 'sent' THEN COALESCE(sent_at, NOW()) ELSE sent_at END
  WHERE id = p_invoice_id AND company_id = p_company_id;

  RETURN QUERY SELECT TRUE::BOOLEAN, ('Status updated to ' || p_new_status)::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. GET INVOICE ANALYTICS (KPI calculations)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_invoice_analytics(p_company_id UUID)
RETURNS TABLE (
  total_invoices INT,
  outstanding_amount NUMERIC,
  outstanding_count INT,
  paid_amount NUMERIC,
  paid_count INT,
  overdue_amount NUMERIC,
  overdue_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INT as total_invoices,
    COALESCE(SUM(CASE WHEN i.status IN ('draft', 'sent', 'viewed', 'partially_paid') THEN i.total_amount ELSE 0 END), 0) as outstanding_amount,
    COUNT(CASE WHEN i.status IN ('draft', 'sent', 'viewed', 'partially_paid') THEN 1 END)::INT as outstanding_count,
    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END), 0) as paid_amount,
    COUNT(CASE WHEN i.status = 'paid' THEN 1 END)::INT as paid_count,
    COALESCE(SUM(CASE WHEN i.due_date < CURRENT_DATE AND i.status NOT IN ('paid', 'cancelled') THEN i.total_amount ELSE 0 END), 0) as overdue_amount,
    COUNT(CASE WHEN i.due_date < CURRENT_DATE AND i.status NOT IN ('paid', 'cancelled') THEN 1 END)::INT as overdue_count
  FROM invoices i
  WHERE i.company_id = p_company_id;
END;
$$ LANGUAGE plpgsql STABLE;