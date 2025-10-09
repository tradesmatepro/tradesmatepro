-- Create profile for Jerry Smith to fix 406 errors
-- First check if it exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = '44475f47-be87-45ef-b465-2ecbbc0616ea') THEN
    INSERT INTO profiles (user_id, avatar_url, preferences, timezone, language, notification_preferences)
    VALUES (
      '44475f47-be87-45ef-b465-2ecbbc0616ea',
      NULL,
      '{}',
      'America/Los_Angeles',
      'en',
      '{"email": true, "sms": false, "push": true}'
    );
    RAISE NOTICE 'Profile created for Jerry Smith';
  ELSE
    RAISE NOTICE 'Profile already exists for Jerry Smith';
  END IF;
END $$;

