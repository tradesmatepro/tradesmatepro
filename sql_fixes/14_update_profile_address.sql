-- Update profile with address from company data

UPDATE profiles
SET 
  address_line_1 = '1103 Chinook Street',
  city = 'The Dalles',
  state_province = 'OR',
  postal_code = '97058',
  country = 'US',
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
  postal_code,
  country
FROM profiles
WHERE user_id = '44475f47-be87-45ef-b465-2ecbbc0616ea';

