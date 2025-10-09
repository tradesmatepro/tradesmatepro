-- Check if profile was updated successfully

SELECT 
  user_id,
  first_name,
  last_name,
  phone,
  email,
  address_line_1,
  city,
  state_province,
  postal_code,
  date_of_birth,
  emergency_contact_name,
  emergency_contact_phone,
  emergency_contact_relationship,
  updated_at
FROM profiles
WHERE user_id = '44475f47-be87-45ef-b465-2ecbbc0616ea';

