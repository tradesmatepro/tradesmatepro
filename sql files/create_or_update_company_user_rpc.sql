-- ============================================================================
-- CREATE OR UPDATE COMPANY USER - Atomic RPC Function
-- ============================================================================
-- Industry-standard user creation/update that handles:
-- 1. Check if auth user exists (by email)
-- 2. Create auth user if needed (via Edge Function - this RPC can't do it)
-- 3. Create/update users record
-- 4. Create/update profile record
-- 5. Create/update employee record
-- All in a single transaction with rollback on error
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_or_update_company_user(
  p_auth_user_id UUID,
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_company_id UUID,
  p_role TEXT DEFAULT 'employee',
  p_phone TEXT DEFAULT NULL,
  p_job_title TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_profile_id UUID;
  v_employee_id UUID;
  v_result jsonb;
BEGIN
  -- ========================================================================
  -- STEP 1: Check if user already exists for this auth_user_id
  -- ========================================================================
  SELECT id INTO v_user_id FROM public.users 
  WHERE auth_user_id = p_auth_user_id;
  
  IF v_user_id IS NULL THEN
    -- User doesn't exist, create new user record
    INSERT INTO public.users (
      auth_user_id,
      email,
      company_id,
      role,
      status,
      first_name,
      last_name,
      phone,
      created_at,
      updated_at
    ) VALUES (
      p_auth_user_id,
      p_email,
      p_company_id,
      LOWER(p_role),
      'active',
      p_first_name,
      p_last_name,
      p_phone,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_user_id;
    
    RAISE NOTICE '✅ Created new user record: %', v_user_id;
  ELSE
    -- User exists, update it
    UPDATE public.users SET
      email = COALESCE(p_email, email),
      company_id = COALESCE(p_company_id, company_id),
      role = COALESCE(LOWER(p_role), role),
      first_name = COALESCE(p_first_name, first_name),
      last_name = COALESCE(p_last_name, last_name),
      phone = COALESCE(p_phone, phone),
      updated_at = NOW()
    WHERE id = v_user_id;
    
    RAISE NOTICE '✅ Updated existing user record: %', v_user_id;
  END IF;
  
  -- ========================================================================
  -- STEP 2: Create or update profile record
  -- ========================================================================
  SELECT id INTO v_profile_id FROM public.profiles 
  WHERE user_id = v_user_id;
  
  IF v_profile_id IS NULL THEN
    -- Profile doesn't exist, create it
    INSERT INTO public.profiles (
      user_id,
      preferences,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      '{}'::jsonb,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_profile_id;
    
    RAISE NOTICE '✅ Created new profile record: %', v_profile_id;
  ELSE
    -- Profile exists, just update timestamp
    UPDATE public.profiles SET
      updated_at = NOW()
    WHERE id = v_profile_id;
    
    RAISE NOTICE '✅ Updated existing profile record: %', v_profile_id;
  END IF;
  
  -- ========================================================================
  -- STEP 3: Create or update employee record
  -- ========================================================================
  SELECT id INTO v_employee_id FROM public.employees 
  WHERE user_id = v_user_id AND company_id = p_company_id;
  
  IF v_employee_id IS NULL THEN
    -- Employee doesn't exist, create it
    INSERT INTO public.employees (
      user_id,
      company_id,
      first_name,
      last_name,
      job_title,
      employee_number,
      hire_date,
      is_schedulable,
      status,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      p_company_id,
      p_first_name,
      p_last_name,
      COALESCE(p_job_title, 'Employee'),
      'EMP-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS'),
      CURRENT_DATE,
      true,
      'active',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_employee_id;
    
    RAISE NOTICE '✅ Created new employee record: %', v_employee_id;
  ELSE
    -- Employee exists, update it
    UPDATE public.employees SET
      first_name = COALESCE(p_first_name, first_name),
      last_name = COALESCE(p_last_name, last_name),
      job_title = COALESCE(p_job_title, job_title),
      updated_at = NOW()
    WHERE id = v_employee_id;
    
    RAISE NOTICE '✅ Updated existing employee record: %', v_employee_id;
  END IF;
  
  -- ========================================================================
  -- STEP 4: Return success with all created/updated IDs
  -- ========================================================================
  v_result := jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'profile_id', v_profile_id,
    'employee_id', v_employee_id,
    'auth_user_id', p_auth_user_id,
    'email', p_email,
    'first_name', p_first_name,
    'last_name', p_last_name,
    'company_id', p_company_id,
    'role', LOWER(p_role)
  );
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error with details
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'error_code', SQLSTATE
  );
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.create_or_update_company_user(UUID, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT) 
  TO authenticated, anon;

-- Add comment
COMMENT ON FUNCTION public.create_or_update_company_user(UUID, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT) IS
  'Atomic RPC function to create or update a company user with all related records (users, profiles, employees). Handles deduplication and ensures data consistency.';

