-- Create helper function to log user activity

CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_action_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_company_id UUID;
  v_log_id UUID;
BEGIN
  -- Get company_id from user
  SELECT company_id INTO v_company_id
  FROM users
  WHERE id = p_user_id;

  -- Insert activity log
  INSERT INTO user_activity_log (
    user_id,
    company_id,
    action_type,
    description,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    p_user_id,
    v_company_id,
    p_action_type,
    p_description,
    p_ip_address,
    p_user_agent,
    p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Create trigger to update profiles.updated_at

CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON profiles;

CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

