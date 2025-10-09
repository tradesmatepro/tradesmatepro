-- Create the accept_marketplace_response RPC function
-- This function handles accepting a marketplace response and updating all related records

CREATE OR REPLACE FUNCTION public.accept_marketplace_response(
  _response_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response_record marketplace_responses%ROWTYPE;
  request_record marketplace_requests%ROWTYPE;
  result jsonb;
BEGIN
  -- Get the response record
  SELECT * INTO response_record 
  FROM public.marketplace_responses 
  WHERE id = _response_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Response not found'
    );
  END IF;
  
  -- Get the request record
  SELECT * INTO request_record 
  FROM public.marketplace_requests 
  WHERE id = response_record.request_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Request not found'
    );
  END IF;
  
  -- Check if request is still available for booking
  IF request_record.status != 'available' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Request is no longer available for booking'
    );
  END IF;
  
  -- Update the chosen response to 'accepted'
  UPDATE public.marketplace_responses 
  SET response_status = 'accepted'
  WHERE id = _response_id;
  
  -- Update the request status to 'booked' and set booked_response_id
  UPDATE public.marketplace_requests 
  SET 
    status = 'booked',
    booked_response_id = _response_id,
    updated_at = now()
  WHERE id = response_record.request_id;
  
  -- Reject all other responses for this request
  UPDATE public.marketplace_responses 
  SET response_status = 'rejected'
  WHERE request_id = response_record.request_id 
    AND id != _response_id
    AND response_status = 'pending';
  
  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Response accepted successfully',
    'request_id', response_record.request_id,
    'response_id', _response_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.accept_marketplace_response(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_marketplace_response(uuid) TO anon;
