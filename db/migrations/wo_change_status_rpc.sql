-- RPC function to handle work order status changes with proper stage management
-- This ensures single source of truth and handles side effects like invoice creation

CREATE OR REPLACE FUNCTION wo_change_status(
  p_id UUID,
  p_to TEXT
) RETURNS JSON AS $$
DECLARE
  v_record RECORD;
  v_old_status TEXT;
  v_stage TEXT;
  v_result JSON;
BEGIN
  -- Get current record
  SELECT * INTO v_record FROM work_orders WHERE id = p_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Work order not found');
  END IF;
  
  -- Get current stage and status
  v_stage := v_record.stage;
  
  -- Determine current status based on stage
  IF v_stage = 'QUOTE' THEN
    v_old_status := v_record.quote_status;
  ELSIF v_stage = 'JOB' THEN
    v_old_status := v_record.job_status;
  ELSIF v_stage = 'WORK_ORDER' THEN
    v_old_status := v_record.work_status;
  ELSE
    v_old_status := v_record.status; -- fallback
  END IF;
  
  -- Validate transition (basic check - can be expanded)
  IF v_old_status = p_to THEN
    RETURN json_build_object('success', true, 'message', 'No change needed');
  END IF;
  
  -- Update the appropriate status field based on stage
  IF v_stage = 'QUOTE' THEN
    UPDATE work_orders 
    SET quote_status = p_to, 
        status = p_to,
        updated_at = NOW()
    WHERE id = p_id;
    
  ELSIF v_stage = 'JOB' THEN
    UPDATE work_orders 
    SET job_status = p_to, 
        status = p_to,
        updated_at = NOW()
    WHERE id = p_id;
    
  ELSIF v_stage = 'WORK_ORDER' THEN
    UPDATE work_orders 
    SET work_status = p_to, 
        status = p_to,
        updated_at = NOW()
    WHERE id = p_id;
    
  ELSE
    -- Fallback: update unified status only
    UPDATE work_orders 
    SET status = p_to,
        updated_at = NOW()
    WHERE id = p_id;
  END IF;
  
  -- Build success response
  v_result := json_build_object(
    'success', true,
    'old_status', v_old_status,
    'new_status', p_to,
    'stage', v_stage,
    'work_order_id', p_id,
    'should_create_invoice', (p_to = 'COMPLETED')
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION wo_change_status(UUID, TEXT) TO authenticated;

-- Add RLS policy if needed (the function runs with SECURITY DEFINER so it has elevated privileges)
-- But we should still check company_id within the function for security

-- Enhanced version with company_id check
CREATE OR REPLACE FUNCTION wo_change_status(
  p_id UUID,
  p_to TEXT,
  p_company_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_record RECORD;
  v_old_status TEXT;
  v_stage TEXT;
  v_result JSON;
BEGIN
  -- Get current record with company check
  SELECT * INTO v_record FROM work_orders 
  WHERE id = p_id 
  AND (p_company_id IS NULL OR company_id = p_company_id);
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Work order not found or access denied');
  END IF;
  
  -- Get current stage and status
  v_stage := v_record.stage;
  
  -- Determine current status based on stage
  IF v_stage = 'QUOTE' THEN
    v_old_status := v_record.quote_status;
  ELSIF v_stage = 'JOB' THEN
    v_old_status := v_record.job_status;
  ELSIF v_stage = 'WORK_ORDER' THEN
    v_old_status := v_record.work_status;
  ELSE
    v_old_status := v_record.status; -- fallback
  END IF;
  
  -- Validate transition (basic check - can be expanded)
  IF v_old_status = p_to THEN
    RETURN json_build_object('success', true, 'message', 'No change needed');
  END IF;
  
  -- Update the appropriate status field based on stage
  IF v_stage = 'QUOTE' THEN
    UPDATE work_orders 
    SET quote_status = p_to, 
        status = p_to,
        updated_at = NOW()
    WHERE id = p_id AND company_id = v_record.company_id;
    
  ELSIF v_stage = 'JOB' THEN
    UPDATE work_orders 
    SET job_status = p_to, 
        status = p_to,
        updated_at = NOW()
    WHERE id = p_id AND company_id = v_record.company_id;
    
  ELSIF v_stage = 'WORK_ORDER' THEN
    UPDATE work_orders 
    SET work_status = p_to, 
        status = p_to,
        updated_at = NOW()
    WHERE id = p_id AND company_id = v_record.company_id;
    
  ELSE
    -- Fallback: update unified status only
    UPDATE work_orders 
    SET status = p_to,
        updated_at = NOW()
    WHERE id = p_id AND company_id = v_record.company_id;
  END IF;
  
  -- Build success response
  v_result := json_build_object(
    'success', true,
    'old_status', v_old_status,
    'new_status', p_to,
    'stage', v_stage,
    'work_order_id', p_id,
    'company_id', v_record.company_id,
    'customer_id', v_record.customer_id,
    'should_create_invoice', (p_to = 'COMPLETED')
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
