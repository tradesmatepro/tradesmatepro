-- ============================================================================
-- FINAL FIX: Complete RPC function reset with proper syntax
-- ============================================================================
-- Run this in Supabase SQL Editor to fix invoice RPC functions

-- Step 1: Drop ALL invoice RPC functions (all overloads)
-- Drop all versions of get_filtered_invoices
DROP FUNCTION IF EXISTS public.get_filtered_invoices() CASCADE;
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE) CASCADE;
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) CASCADE;
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, INT) CASCADE;
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE, INT, INT) CASCADE;
DROP FUNCTION IF EXISTS public.get_filtered_invoices(UUID, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, INT, INT) CASCADE;

-- Drop all versions of upsert_invoice_for_work_order
DROP FUNCTION IF EXISTS public.upsert_invoice_for_work_order() CASCADE;
DROP FUNCTION IF EXISTS public.upsert_invoice_for_work_order(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.upsert_invoice_for_work_order(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.upsert_invoice_for_work_order(UUID, UUID, TEXT) CASCADE;

-- Drop all versions of update_invoice_status
DROP FUNCTION IF EXISTS public.update_invoice_status() CASCADE;
DROP FUNCTION IF EXISTS public.update_invoice_status(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.update_invoice_status(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.update_invoice_status(UUID, TEXT, UUID) CASCADE;

-- Drop all versions of get_invoice_analytics
DROP FUNCTION IF EXISTS public.get_invoice_analytics() CASCADE;
DROP FUNCTION IF EXISTS public.get_invoice_analytics(UUID) CASCADE;

-- Step 2: Create get_filtered_invoices - returns only work order IDs with invoiced status
-- ✅ FIXED: Query work_orders table (unified pipeline) instead of invoices table
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

-- Step 3: Create upsert_invoice_for_work_order
CREATE FUNCTION public.upsert_invoice_for_work_order(
  p_company_id UUID,
  p_work_order_id UUID,
  p_status TEXT DEFAULT 'draft'
)
RETURNS TABLE (
  success BOOLEAN,
  invoice_id UUID,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_existing_id UUID;
BEGIN
  SELECT id INTO v_existing_id
  FROM invoices
  WHERE work_order_id = p_work_order_id 
    AND company_id = p_company_id
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    UPDATE invoices
    SET status = p_status::invoice_status_enum,
        updated_at = NOW(),
        sent_at = CASE WHEN p_status = 'sent' THEN NOW() ELSE sent_at END
    WHERE id = v_existing_id;
    
    RETURN QUERY SELECT TRUE::BOOLEAN, v_existing_id, ('Invoice updated to ' || p_status)::TEXT;
  ELSE
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
$$;

-- Step 4: Create update_invoice_status
CREATE FUNCTION public.update_invoice_status(
  p_invoice_id UUID,
  p_new_status TEXT,
  p_company_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_status TEXT;
BEGIN
  SELECT i.status INTO v_current_status
  FROM invoices i
  WHERE i.id = p_invoice_id AND i.company_id = p_company_id;

  IF v_current_status IS NULL THEN
    RETURN QUERY SELECT FALSE::BOOLEAN, 'Invoice not found'::TEXT;
    RETURN;
  END IF;

  UPDATE invoices
  SET status = p_new_status::invoice_status_enum,
      updated_at = NOW(),
      sent_at = CASE WHEN p_new_status = 'sent' THEN COALESCE(sent_at, NOW()) ELSE sent_at END
  WHERE id = p_invoice_id AND company_id = p_company_id;

  RETURN QUERY SELECT TRUE::BOOLEAN, ('Status updated to ' || p_new_status)::TEXT;
END;
$$;

-- Step 5: Create get_invoice_analytics
CREATE FUNCTION public.get_invoice_analytics(p_company_id UUID)
RETURNS TABLE (
  total_invoices INT,
  outstanding_amount NUMERIC,
  outstanding_count INT,
  paid_amount NUMERIC,
  paid_count INT,
  overdue_amount NUMERIC,
  overdue_count INT
)
LANGUAGE plpgsql
STABLE
AS $$
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
$$;

-- Done! All functions created fresh

