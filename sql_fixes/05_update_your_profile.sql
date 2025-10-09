-- Update Jerald Smith's profile with actual name

UPDATE profiles
SET 
  first_name = 'Jerald',
  last_name = 'Smith',
  phone = '+15417050524',
  address_line_1 = '1103 Chinook Street',
  city = 'The Dalles',
  state_province = 'OR',
  postal_code = '97058',
  country = 'US',
  timezone = 'America/Los_Angeles',
  updated_at = NOW()
WHERE user_id = '44475f47-be87-45ef-b465-2ecbbc0616ea';

-- Verify the update
SELECT 
  user_id,
  first_name,
  last_name,
  phone,
  address_line_1,
  city,
  state_province,
  postal_code
FROM profiles
WHERE user_id = '44475f47-be87-45ef-b465-2ecbbc0616ea';

