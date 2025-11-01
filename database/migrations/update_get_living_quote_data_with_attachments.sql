-- ============================================
-- UPDATE get_living_quote_data TO INCLUDE ATTACHMENTS
-- ============================================
-- This migration updates the get_living_quote_data RPC function
-- to include attachments/files in the returned data.
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

