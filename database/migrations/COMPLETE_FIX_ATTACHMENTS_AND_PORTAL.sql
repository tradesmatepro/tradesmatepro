-- ============================================
-- COMPLETE FIX: ATTACHMENTS + CUSTOMER PORTAL
-- ============================================
-- This migration fixes ALL issues with attachments and customer portal:
-- 1. Enables RLS on attachments table
-- 2. Fixes get_living_quote_data RPC function (portal token column + attachments + messages)
-- ============================================

-- ============================================
-- PART 1: ENABLE RLS ON ATTACHMENTS TABLE
-- ============================================

-- Step 1: Enable RLS on attachments table
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies (if any)
DROP POLICY IF EXISTS "attachments_select_company" ON public.attachments;
DROP POLICY IF EXISTS "attachments_insert_company" ON public.attachments;
DROP POLICY IF EXISTS "attachments_update_company" ON public.attachments;
DROP POLICY IF EXISTS "attachments_delete_company" ON public.attachments;

-- Step 3: Create helper function if it doesn't exist
CREATE OR REPLACE FUNCTION public.user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT company_id FROM public.users WHERE auth_user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create RLS policies

-- SELECT: Users can view attachments from their company
CREATE POLICY "attachments_select_company"
  ON public.attachments
  FOR SELECT
  USING (company_id = public.user_company_id());

-- INSERT: Users can create attachments for their company
CREATE POLICY "attachments_insert_company"
  ON public.attachments
  FOR INSERT
  WITH CHECK (company_id = public.user_company_id());

-- UPDATE: Users can update attachments from their company
CREATE POLICY "attachments_update_company"
  ON public.attachments
  FOR UPDATE
  USING (company_id = public.user_company_id())
  WITH CHECK (company_id = public.user_company_id());

-- DELETE: Users can delete attachments from their company
CREATE POLICY "attachments_delete_company"
  ON public.attachments
  FOR DELETE
  USING (company_id = public.user_company_id());

-- ============================================
-- PART 2: FIX CUSTOMER PORTAL RPC FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.get_living_quote_data(p_token TEXT)
RETURNS JSON AS $$
DECLARE
  v_work_order_id UUID;
  v_customer_id UUID;
  v_company_id UUID;
  v_quote JSON;
  v_customer JSON;
  v_company JSON;
  v_items JSON;
  v_invoice JSON;
  v_messages JSON;
  v_files JSON;
  v_timeline JSON;
  v_token_expired BOOLEAN;
BEGIN
  -- Find work order by portal token
  SELECT
    id,
    customer_id,
    company_id,
    CASE
      WHEN portal_link_expires_at IS NOT NULL AND portal_link_expires_at < NOW() THEN TRUE
      ELSE FALSE
    END as token_expired
  INTO v_work_order_id, v_customer_id, v_company_id, v_token_expired
  FROM work_orders
  WHERE portal_token = p_token;

  -- Check if token is valid
  IF v_work_order_id IS NULL THEN
    RETURN json_build_object('error', 'Invalid or expired token');
  END IF;

  IF v_token_expired THEN
    RETURN json_build_object('error', 'Token has expired');
  END IF;

  -- Update access tracking
  UPDATE work_orders
  SET 
    portal_last_accessed_at = NOW(),
    portal_access_count = COALESCE(portal_access_count, 0) + 1
  WHERE id = v_work_order_id;

  -- Get quote/work order data
  SELECT row_to_json(wo.*) INTO v_quote
  FROM work_orders wo
  WHERE wo.id = v_work_order_id;

  -- Get customer data
  SELECT row_to_json(c.*) INTO v_customer
  FROM customers c
  WHERE c.id = v_customer_id;

  -- Get company data
  SELECT row_to_json(comp.*) INTO v_company
  FROM companies comp
  WHERE comp.id = v_company_id;

  -- Get line items
  SELECT COALESCE(json_agg(row_to_json(li.*) ORDER BY li.sort_order), '[]'::json) INTO v_items
  FROM work_order_line_items li
  WHERE li.work_order_id = v_work_order_id;

  -- Get invoice (if exists)
  SELECT row_to_json(inv.*) INTO v_invoice
  FROM invoices inv
  WHERE inv.work_order_id = v_work_order_id
  LIMIT 1;

  -- Get messages (use messages table, not customer_communications)
  SELECT COALESCE(json_agg(row_to_json(msg.*) ORDER BY msg.created_at DESC), '[]'::json) INTO v_messages
  FROM messages msg
  WHERE msg.work_order_id = v_work_order_id
    AND msg.message_type IN ('in_app', 'system');

  -- Get attachments/files
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', a.id,
      'file_name', a.file_name,
      'file_url', a.file_url,
      'file_type', a.file_type,
      'file_size', a.file_size,
      'uploaded_at', a.uploaded_at
    ) ORDER BY a.uploaded_at DESC
  ), '[]'::json) INTO v_files
  FROM attachments a
  WHERE a.work_order_id = v_work_order_id;

  -- Get timeline events
  SELECT COALESCE(json_agg(
    json_build_object(
      'date', te.event_date,
      'label', te.event_label,
      'status', te.event_status
    ) ORDER BY te.event_date ASC
  ), '[]'::json) INTO v_timeline
  FROM (
    SELECT wo.quote_sent_at as event_date, 'Quote Sent' as event_label, 'completed' as event_status
    FROM work_orders wo WHERE wo.id = v_work_order_id AND wo.quote_sent_at IS NOT NULL
    UNION ALL
    SELECT wo.quote_viewed_at, 'Quote Viewed', 'completed'
    FROM work_orders wo WHERE wo.id = v_work_order_id AND wo.quote_viewed_at IS NOT NULL
    UNION ALL
    SELECT wo.quote_accepted_at, 'Quote Approved', 'completed'
    FROM work_orders wo WHERE wo.id = v_work_order_id AND wo.quote_accepted_at IS NOT NULL
    UNION ALL
    SELECT wo.scheduled_start, 'Job Scheduled', CASE WHEN wo.scheduled_start < NOW() THEN 'completed' ELSE 'in-progress' END
    FROM work_orders wo WHERE wo.id = v_work_order_id AND wo.scheduled_start IS NOT NULL
    UNION ALL
    SELECT wo.actual_start, 'Job Started', 'completed'
    FROM work_orders wo WHERE wo.id = v_work_order_id AND wo.actual_start IS NOT NULL
    UNION ALL
    SELECT COALESCE(wo.actual_end, wo.completed_at), 'Job Completed', 'completed'
    FROM work_orders wo WHERE wo.id = v_work_order_id AND (wo.actual_end IS NOT NULL OR wo.completed_at IS NOT NULL)
    UNION ALL
    SELECT wo.invoice_sent_at, 'Invoice Sent', 'completed'
    FROM work_orders wo WHERE wo.id = v_work_order_id AND wo.invoice_sent_at IS NOT NULL
    UNION ALL
    SELECT wo.paid_at, 'Payment Received', 'completed'
    FROM work_orders wo WHERE wo.id = v_work_order_id AND wo.paid_at IS NOT NULL
  ) te;

  -- Return combined data
  RETURN json_build_object(
    'quote', v_quote,
    'customer', v_customer,
    'company', v_company,
    'items', v_items,
    'invoice', v_invoice,
    'messages', v_messages,
    'files', v_files,
    'timeline', v_timeline
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_living_quote_data(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_living_quote_data(TEXT) TO anon;

-- ============================================
-- PART 3: ADD HELPER FUNCTION TO CALCULATE TOTALS FROM LINE ITEMS
-- ============================================
-- This ensures customer portal shows correct totals including markup

CREATE OR REPLACE FUNCTION public.calculate_work_order_totals(p_work_order_id UUID)
RETURNS JSON AS $$
DECLARE
  v_subtotal NUMERIC;
  v_tax_amount NUMERIC;
  v_total_amount NUMERIC;
BEGIN
  -- Calculate subtotal from line items using total_price (which includes markup)
  SELECT COALESCE(SUM(total_price), 0)
  INTO v_subtotal
  FROM work_order_line_items
  WHERE work_order_id = p_work_order_id;

  -- Get tax amount from work_orders table (already calculated)
  SELECT tax_amount, total_amount
  INTO v_tax_amount, v_total_amount
  FROM work_orders
  WHERE id = p_work_order_id;

  -- If total_amount is not set, calculate it
  IF v_total_amount IS NULL OR v_total_amount = 0 THEN
    v_total_amount := v_subtotal + COALESCE(v_tax_amount, 0);
  END IF;

  RETURN json_build_object(
    'subtotal', v_subtotal,
    'tax_amount', COALESCE(v_tax_amount, 0),
    'total_amount', v_total_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.calculate_work_order_totals(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_work_order_totals(UUID) TO anon;

-- ============================================
-- VERIFICATION QUERIES (OPTIONAL - COMMENT OUT IF NOT NEEDED)
-- ============================================

-- Verify RLS policies on attachments
-- SELECT policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename = 'attachments'
-- ORDER BY policyname;

-- Test the RPC function (replace with actual token)
-- SELECT get_living_quote_data('your-test-token-here');

-- Test totals calculation (replace with actual work_order_id)
-- SELECT calculate_work_order_totals('your-work-order-id-here');

