-- Create RPC function to approve/reject quotes
-- This bypasses RLS by running as SECURITY DEFINER

CREATE OR REPLACE FUNCTION approve_quote(
  quote_id UUID,
  new_status work_order_status_enum
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  current_status work_order_status_enum;
BEGIN
  -- Check if quote exists and is in 'sent' status
  SELECT status INTO current_status
  FROM work_orders
  WHERE id = quote_id;
  
  IF current_status IS NULL THEN
    RAISE EXCEPTION 'Quote not found';
  END IF;
  
  IF current_status != 'sent' THEN
    RAISE EXCEPTION 'Quote is not in sent status (current: %)', current_status;
  END IF;
  
  IF new_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status. Must be approved or rejected';
  END IF;
  
  -- Update the quote
  UPDATE work_orders
  SET 
    status = new_status,
    approved_at = CASE WHEN new_status = 'approved' THEN NOW() ELSE approved_at END,
    customer_approved_at = CASE WHEN new_status = 'approved' THEN NOW() ELSE customer_approved_at END,
    rejected_at = CASE WHEN new_status = 'rejected' THEN NOW() ELSE rejected_at END,
    quote_rejected_at = CASE WHEN new_status = 'rejected' THEN NOW() ELSE quote_rejected_at END
  WHERE id = quote_id
  RETURNING json_build_object(
    'id', id,
    'status', status,
    'approved_at', approved_at,
    'rejected_at', rejected_at
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission to anon
GRANT EXECUTE ON FUNCTION approve_quote(UUID, work_order_status_enum) TO anon;
GRANT EXECUTE ON FUNCTION approve_quote(UUID, work_order_status_enum) TO authenticated;

-- Test it
SELECT approve_quote('a83a2550-a46e-4953-b378-9e093bcbe21a'::UUID, 'approved'::work_order_status_enum);

-- Verify
SELECT id, status, approved_at FROM work_orders WHERE id = 'a83a2550-a46e-4953-b378-9e093bcbe21a';

