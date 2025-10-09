const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://amgtktrwpdsigcomavlg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const createAcceptRPCFunction = async () => {
  console.log('Creating accept_marketplace_response RPC function...');

  const sql = `
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
  `;

  try {
    // Execute the SQL using the exec_sql RPC function
    const { data, error } = await supabase.rpc('exec_sql', {
      query: sql
    });

    if (error) {
      console.error('❌ Failed to create RPC function:', error);
      return false;
    }

    console.log('✅ Successfully created accept_marketplace_response RPC function');
    console.log('Response:', data);
    return true;
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
};

// Run the function
createAcceptRPCFunction()
  .then(success => {
    if (success) {
      console.log('🎉 RPC function creation completed successfully!');
      process.exit(0);
    } else {
      console.log('💥 RPC function creation failed!');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('💥 Script failed:', err);
    process.exit(1);
  });