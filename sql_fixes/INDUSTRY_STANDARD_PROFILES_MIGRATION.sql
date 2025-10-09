-- ============================================================================
-- INDUSTRY STANDARD MY PROFILE - DATABASE MIGRATION
-- Aligns TradeMate Pro with ServiceTitan, Jobber, Housecall Pro standards
-- ============================================================================

-- Step 1: Add missing columns to profiles table
-- ============================================================================

-- Personal Information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Address Information
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_line_1 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_line_2 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state_province TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US';

-- Emergency Contact
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;

-- Preferences & Settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Los_Angeles';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'MM/DD/YYYY';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS time_format TEXT DEFAULT '12h';

-- Verification Status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Two-Factor Authentication
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;

-- Notification Preferences (JSONB for flexibility)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true, "job_updates": true, "schedule_changes": true, "timesheet_reminders": true, "pto_updates": true}'::jsonb;

-- Step 2: Create user_sessions table (for security/session management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  device_name TEXT,
  device_type TEXT CHECK (device_type IN ('web', 'mobile', 'tablet', 'desktop')),
  browser TEXT,
  os TEXT,
  ip_address INET,
  user_agent TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON user_sessions(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

-- Step 3: Create user_activity_log table (for audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'login',
    'logout',
    'profile_update',
    'password_change',
    'email_change',
    'phone_change',
    'avatar_upload',
    '2fa_enabled',
    '2fa_disabled',
    'session_terminated',
    'failed_login',
    'password_reset_requested',
    'password_reset_completed'
  )),
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_company_id ON user_activity_log(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action_type ON user_activity_log(action_type);

-- Step 4: Create profile_photos storage bucket (if not exists)
-- ============================================================================
-- Note: This needs to be done via Supabase Dashboard or Storage API
-- Storage bucket: 'profile-photos'
-- Settings:
--   - Public: false (only authenticated users)
--   - File size limit: 5MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp
--   - RLS policies: Users can upload/update their own photos

-- Step 5: Add RLS policies for new tables
-- ============================================================================

-- user_sessions RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = user_sessions.user_id));

CREATE POLICY IF NOT EXISTS "Users can delete their own sessions"
  ON user_sessions FOR DELETE
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = user_sessions.user_id));

-- user_activity_log RLS
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own activity"
  ON user_activity_log FOR SELECT
  USING (auth.uid() IN (SELECT auth_user_id FROM users WHERE id = user_activity_log.user_id));

-- Step 6: Update existing profiles with default values
-- ============================================================================

-- Set timezone based on company location (if available)
UPDATE profiles p
SET timezone = COALESCE(
  (SELECT time_zone FROM companies c 
   JOIN users u ON u.company_id = c.id 
   WHERE u.id = p.user_id 
   LIMIT 1),
  'America/Los_Angeles'
)
WHERE timezone IS NULL;

-- Set country to US for existing profiles
UPDATE profiles
SET country = 'US'
WHERE country IS NULL;

-- Set language to English for existing profiles
UPDATE profiles
SET language = 'en'
WHERE language IS NULL;

-- Step 7: Create helper function to log user activity
-- ============================================================================

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

-- Step 8: Create trigger to update profiles.updated_at
-- ============================================================================

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

-- Step 9: Verify migration
-- ============================================================================

-- Check profiles table columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check new tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN ('user_sessions', 'user_activity_log')
ORDER BY table_name;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Update MyProfile.js to use profiles table with first_name/last_name
-- 2. Update UserContext.js to load from profiles table
-- 3. Add avatar upload component
-- 4. Add password change functionality
-- 5. Add 2FA setup
-- 6. Add session management UI
-- ============================================================================

