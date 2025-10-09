-- =========================================
-- TRADEMATE PRO ONBOARDING INFRASTRUCTURE
-- =========================================
-- Industry-standard onboarding system with progress tracking,
-- validation, and sample data seeding capabilities

-- =========================================
-- 1. ONBOARDING PROGRESS TRACKING
-- =========================================

-- Add onboarding progress to company_settings
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS onboarding_progress JSONB DEFAULT '{
  "current_step": 1,
  "completed_steps": [],
  "started_at": null,
  "completed_at": null,
  "skipped": false,
  "steps": {
    "1": {"name": "Company Basics", "completed": false, "completed_at": null},
    "2": {"name": "Services & Pricing", "completed": false, "completed_at": null},
    "3": {"name": "Team Setup", "completed": false, "completed_at": null},
    "4": {"name": "Business Preferences", "completed": false, "completed_at": null},
    "5": {"name": "Financial Setup", "completed": false, "completed_at": null},
    "6": {"name": "Go Live", "completed": false, "completed_at": null}
  }
}'::jsonb;

-- =========================================
-- 2. ONBOARDING VALIDATION FUNCTIONS
-- =========================================

-- Function to check if company can proceed to next onboarding step
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
    SELECT COUNT(*) INTO v_service_count
    FROM service_categories sc
    WHERE EXISTS (
      SELECT 1 FROM service_types st 
      WHERE st.category_id = sc.id 
      AND st.company_id = p_company_id
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

-- =========================================
-- 3. ONBOARDING PROGRESS MANAGEMENT
-- =========================================

-- Function to update onboarding progress
CREATE OR REPLACE FUNCTION update_onboarding_progress(
  p_company_id UUID,
  p_step INTEGER,
  p_completed BOOLEAN DEFAULT true
) RETURNS JSONB AS $$
DECLARE
  v_current_progress JSONB;
  v_new_progress JSONB;
  v_step_key TEXT := p_step::text;
BEGIN
  -- Get current progress
  SELECT onboarding_progress INTO v_current_progress
  FROM company_settings
  WHERE company_id = p_company_id;
  
  -- Initialize if null
  IF v_current_progress IS NULL THEN
    v_current_progress := '{
      "current_step": 1,
      "completed_steps": [],
      "started_at": null,
      "completed_at": null,
      "skipped": false,
      "steps": {
        "1": {"name": "Company Basics", "completed": false, "completed_at": null},
        "2": {"name": "Services & Pricing", "completed": false, "completed_at": null},
        "3": {"name": "Team Setup", "completed": false, "completed_at": null},
        "4": {"name": "Business Preferences", "completed": false, "completed_at": null},
        "5": {"name": "Financial Setup", "completed": false, "completed_at": null},
        "6": {"name": "Go Live", "completed": false, "completed_at": null}
      }
    }'::jsonb;
  END IF;
  
  -- Set started_at if first step
  IF (v_current_progress->>'started_at') IS NULL THEN
    v_current_progress := jsonb_set(v_current_progress, '{started_at}', to_jsonb(NOW()));
  END IF;
  
  -- Update step completion
  v_new_progress := jsonb_set(
    v_current_progress,
    array['steps', v_step_key, 'completed'],
    to_jsonb(p_completed)
  );
  
  IF p_completed THEN
    v_new_progress := jsonb_set(
      v_new_progress,
      array['steps', v_step_key, 'completed_at'],
      to_jsonb(NOW())
    );
    
    -- Update current step to next step
    IF p_step < 6 THEN
      v_new_progress := jsonb_set(v_new_progress, '{current_step}', to_jsonb(p_step + 1));
    ELSE
      -- All steps completed
      v_new_progress := jsonb_set(v_new_progress, '{completed_at}', to_jsonb(NOW()));
      v_new_progress := jsonb_set(v_new_progress, '{current_step}', to_jsonb(6));
    END IF;
  END IF;
  
  -- Update database
  UPDATE company_settings 
  SET onboarding_progress = v_new_progress,
      updated_at = NOW()
  WHERE company_id = p_company_id;
  
  RETURN v_new_progress;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 4. SAMPLE DATA SEEDING FUNCTIONS
-- =========================================

-- Function to create sample customer for onboarding
CREATE OR REPLACE FUNCTION create_sample_customer(
  p_company_id UUID
) RETURNS UUID AS $$
DECLARE
  v_customer_id UUID;
  v_customer_number TEXT;
BEGIN
  -- Generate customer number
  v_customer_number := generate_customer_number(p_company_id);
  
  -- Create sample customer
  INSERT INTO customers (
    id,
    company_id,
    customer_number,
    first_name,
    last_name,
    email,
    phone,
    customer_type,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_company_id,
    v_customer_number,
    'John',
    'Sample Customer',
    'john.sample@example.com',
    '(555) 123-4567',
    'residential',
    NOW(),
    NOW()
  ) RETURNING id INTO v_customer_id;
  
  -- Create sample address
  INSERT INTO customer_addresses (
    id,
    customer_id,
    company_id,
    address_type,
    address_line1,
    city,
    state,
    postal_code,
    country,
    is_primary,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_customer_id,
    p_company_id,
    'service',
    '123 Main Street',
    'Anytown',
    'CA',
    '90210',
    'United States',
    true,
    NOW(),
    NOW()
  );
  
  RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create sample work order (quote)
CREATE OR REPLACE FUNCTION create_sample_work_order(
  p_company_id UUID,
  p_customer_id UUID
) RETURNS UUID AS $$
DECLARE
  v_work_order_id UUID;
  v_work_order_number TEXT;
  v_service_type_id UUID;
BEGIN
  -- Get work order number
  v_work_order_number := generate_work_order_number(p_company_id);
  
  -- Get first available service type
  SELECT st.id INTO v_service_type_id
  FROM service_types st
  JOIN service_categories sc ON st.category_id = sc.id
  WHERE st.company_id = p_company_id
  LIMIT 1;
  
  -- Create sample work order
  INSERT INTO work_orders (
    id,
    company_id,
    customer_id,
    work_order_number,
    title,
    description,
    status,
    priority,
    service_type_id,
    subtotal,
    tax_amount,
    total_amount,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_company_id,
    p_customer_id,
    v_work_order_number,
    'Sample Service Quote',
    'This is a sample quote created during onboarding to demonstrate the system.',
    'quote',
    'normal',
    v_service_type_id,
    500.00,
    45.00,
    545.00,
    NOW(),
    NOW()
  ) RETURNING id INTO v_work_order_id;
  
  -- Add sample line items
  INSERT INTO work_order_line_items (
    id,
    work_order_id,
    company_id,
    item_type,
    description,
    quantity,
    unit_price,
    total_price,
    created_at,
    updated_at
  ) VALUES 
  (
    gen_random_uuid(),
    v_work_order_id,
    p_company_id,
    'labor',
    'Sample Labor - 2 hours',
    2.00,
    75.00,
    150.00,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    v_work_order_id,
    p_company_id,
    'material',
    'Sample Materials',
    1.00,
    350.00,
    350.00,
    NOW(),
    NOW()
  );
  
  RETURN v_work_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 5. COMPLETE ONBOARDING SAMPLE DATA
-- =========================================

-- Function to seed all sample data for completed onboarding
CREATE OR REPLACE FUNCTION seed_onboarding_sample_data(
  p_company_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_customer_id UUID;
  v_work_order_id UUID;
  v_result JSONB;
BEGIN
  -- Create sample customer
  v_customer_id := create_sample_customer(p_company_id);
  
  -- Create sample work order
  v_work_order_id := create_sample_work_order(p_company_id, v_customer_id);
  
  -- Return created IDs
  v_result := jsonb_build_object(
    'success', true,
    'customer_id', v_customer_id,
    'work_order_id', v_work_order_id,
    'message', 'Sample data created successfully'
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 6. ONBOARDING COMPLETION CHECK
-- =========================================

-- Function to check if onboarding is complete
CREATE OR REPLACE FUNCTION is_onboarding_complete(
  p_company_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_progress JSONB;
BEGIN
  SELECT onboarding_progress INTO v_progress
  FROM company_settings
  WHERE company_id = p_company_id;
  
  RETURN (v_progress->>'completed_at') IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 7. GRANT PERMISSIONS
-- =========================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION validate_onboarding_step(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_onboarding_progress(UUID, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION create_sample_customer(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_sample_work_order(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION seed_onboarding_sample_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_onboarding_complete(UUID) TO authenticated;

-- =========================================
-- ONBOARDING INFRASTRUCTURE COMPLETE
-- =========================================
