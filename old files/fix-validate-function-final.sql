-- ============================================
-- FIX VALIDATE_ONBOARDING_STEP FUNCTION
-- This fixes the column st.company_id does not exist error
-- ============================================

-- Drop the broken function
DROP FUNCTION IF EXISTS validate_onboarding_step(UUID, INTEGER);

-- Create the correct function with proper schema relationships
CREATE OR REPLACE FUNCTION validate_onboarding_step(
  p_company_id UUID,
  p_step INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB := '{"valid": false, "errors": [], "warnings": []}'::jsonb;
  v_company_record RECORD;
  v_service_count INTEGER;
  v_employee_count INTEGER;
  v_errors TEXT[] := '{}';
  v_warnings TEXT[] := '{}';
BEGIN
  -- Get company data
  SELECT * INTO v_company_record 
  FROM companies 
  WHERE id = p_company_id;
  
  IF NOT FOUND THEN
    v_errors := array_append(v_errors, 'Company not found');
    RETURN jsonb_build_object(
      'valid', false,
      'errors', v_errors,
      'warnings', v_warnings
    );
  END IF;

  -- Step 1: Company Basics validation
  IF p_step = 1 THEN
    IF v_company_record.name IS NULL OR trim(v_company_record.name) = '' THEN
      v_errors := array_append(v_errors, 'Company name is required');
    END IF;
    
    IF v_company_record.phone IS NULL OR trim(v_company_record.phone) = '' THEN
      v_errors := array_append(v_errors, 'Company phone is required');
    END IF;
    
    IF v_company_record.email IS NULL OR trim(v_company_record.email) = '' THEN
      v_errors := array_append(v_errors, 'Company email is required');
    END IF;
  END IF;

  -- Step 2: Services validation - FIXED to use proper schema relationship
  IF p_step = 2 THEN
    -- Count service categories for this company
    SELECT COUNT(*) INTO v_service_count
    FROM service_categories sc
    WHERE sc.company_id = p_company_id;
    
    IF v_service_count = 0 THEN
      v_warnings := array_append(v_warnings, 'No service categories configured');
    END IF;
    
    -- Count service types that belong to this company's categories
    -- FIXED: Use proper join instead of non-existent st.company_id
    SELECT COUNT(*) INTO v_service_count
    FROM service_types st
    JOIN service_categories sc ON st.category_id = sc.id
    WHERE sc.company_id = p_company_id;
    
    IF v_service_count = 0 THEN
      v_warnings := array_append(v_warnings, 'No service types configured');
    END IF;
  END IF;

  -- Step 3: Team validation
  IF p_step = 3 THEN
    SELECT COUNT(*) INTO v_employee_count
    FROM users
    WHERE company_id = p_company_id 
    AND status = 'ACTIVE';
    
    IF v_employee_count < 1 THEN
      v_warnings := array_append(v_warnings, 'No active employees found');
    END IF;
  END IF;

  -- Step 4: Business Preferences validation
  IF p_step = 4 THEN
    -- Basic validation - just check if company exists
    -- More specific validations can be added here
    IF v_company_record.id IS NULL THEN
      v_errors := array_append(v_errors, 'Company data missing');
    END IF;
  END IF;
  
  -- Return validation result
  RETURN jsonb_build_object(
    'valid', array_length(v_errors, 1) IS NULL,
    'errors', v_errors,
    'warnings', v_warnings
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION validate_onboarding_step(UUID, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION validate_onboarding_step(UUID, INTEGER) TO authenticated;

-- Test the function
SELECT 'Testing validate_onboarding_step function...' as status;
SELECT validate_onboarding_step('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'::uuid, 1) as step_1_test;
SELECT validate_onboarding_step('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'::uuid, 2) as step_2_test;

SELECT '✅ Function fixed successfully!' as result;
