-- ============================================
-- Auto-Create Profile Trigger
-- ============================================
-- This trigger automatically creates a profile record
-- whenever a new user is created in the users table.
-- This prevents 406 errors when querying profiles.
--
-- PROPER FIX - NO BANDAID!
-- ============================================

-- Create function to auto-create profile
CREATE OR REPLACE FUNCTION auto_create_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile for new user with sensible defaults
  INSERT INTO profiles (
    user_id,
    preferences,
    timezone,
    language,
    notification_preferences
  ) VALUES (
    NEW.id,
    '{}'::jsonb,
    'America/Los_Angeles',
    'en',
    '{"email": true, "sms": false, "push": true}'::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on users table
DROP TRIGGER IF EXISTS trigger_auto_create_profile ON users;
CREATE TRIGGER trigger_auto_create_profile
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_profile();

-- Backfill missing profiles for existing users
INSERT INTO profiles (user_id, preferences, timezone, language, notification_preferences)
SELECT 
  u.id,
  '{}'::jsonb,
  'America/Los_Angeles',
  'en',
  '{"email": true, "sms": false, "push": true}'::jsonb
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.id IS NULL;

-- Verify all users have profiles
SELECT 
  COUNT(*) as total_users,
  COUNT(p.id) as users_with_profiles,
  COUNT(*) - COUNT(p.id) as missing_profiles
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id;

COMMENT ON FUNCTION auto_create_profile() IS 'Automatically creates a profile record when a new user is created';
COMMENT ON TRIGGER trigger_auto_create_profile ON users IS 'Ensures every user has a profile record';

