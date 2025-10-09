-- Fix user role the SIMPLE way - direct SQL
UPDATE profiles 
SET role = 'APP_OWNER' 
WHERE email = 'info@cgre-llc.com';

-- Verify the change
SELECT id, email, role FROM profiles WHERE email = 'info@cgre-llc.com';
