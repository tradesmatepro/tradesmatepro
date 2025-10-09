-- FINAL FIX: validate_onboarding_step function with correct schema relationships
-- The service_types table doesn't have company_id, it goes through service_categories

DROP FUNCTION IF EXISTS validate_onboarding_step(UUID, INTEGER);

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
      v_warnings := array_append(v_warnings, 'Phone number recommended for customer contact');
    END IF;

    IF v_company_record.address_line1 IS NULL OR trim(v_company_record.address_line1) = '' THEN
      v_warnings := array_append(v_warnings, 'Business address recommended for professional appearance');
    END IF;
  END IF;

  -- Step 2: Services validation
  IF p_step = 2 THEN
    -- CORRECT: Use proper join since service_types doesn't have company_id
    SELECT COUNT(*) INTO v_service_count
    FROM service_categories sc
    WHERE sc.company_id = p_company_id
    AND EXISTS (
      SELECT 1 FROM service_types st
      WHERE st.category_id = sc.id
    );

    IF v_service_count = 0 THEN
      v_errors := array_append(v_errors, 'At least one service must be defined before creating quotes');
    END IF;
  END IF;

  -- Step 3: Team validation
  IF p_step = 3 THEN
    SELECT COUNT(*) INTO v_employee_count
    FROM users
    WHERE company_id = p_company_id
    AND role IN ('owner', 'admin', 'manager', 'technician');

    IF v_employee_count = 0 THEN
      v_warnings := array_append(v_warnings, 'Consider adding team members to assign work orders');
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
GRANT EXECUTE ON FUNCTION validate_onboarding_step(UUID, INTEGER) TO authenticated;

-- Test the function
SELECT validate_onboarding_step('cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'::UUID, 1);
