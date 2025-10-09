-- Create Test Customer Portal User
-- Email: test@gmail.com
-- Password: Gizmo123

-- Step 1: Create user in Supabase Auth
INSERT INTO auth.users (
  id, 
  instance_id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  aud,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'test@gmail.com',
  crypt('Gizmo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated'
);

-- Step 2: Create customer record
INSERT INTO public.customers (
  id,
  name,
  email,
  phone,
  street_address,
  city,
  state,
  zip_code,
  country,
  customer_type,
  status,
  is_global,
  created_via,
  company_id
) VALUES (
  gen_random_uuid(),
  'Test Customer',
  'test@gmail.com',
  '555-123-4567',
  '123 Test Street',
  'Test City',
  'CA',
  '90210',
  'United States',
  'RESIDENTIAL',
  'ACTIVE',
  true,
  'self_signup',
  null
);

-- Step 3: Create customer portal account
INSERT INTO public.customer_portal_accounts (
  id,
  customer_id,
  auth_user_id,
  is_active,
  created_via,
  needs_password_setup,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.customers WHERE email = 'test@gmail.com'),
  (SELECT id FROM auth.users WHERE email = 'test@gmail.com'),
  true,
  'self_signup',
  false,
  now(),
  now()
);

-- Step 4: Link customer to portal account
UPDATE public.customers 
SET portal_account_id = (
  SELECT id FROM public.customer_portal_accounts 
  WHERE auth_user_id = (SELECT id FROM auth.users WHERE email = 'test@gmail.com')
)
WHERE email = 'test@gmail.com';

-- Verify the setup
SELECT 
  'Auth User' as type,
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at
FROM auth.users au 
WHERE au.email = 'test@gmail.com'

UNION ALL

SELECT 
  'Customer' as type,
  c.id::text,
  c.email,
  c.created_at::text,
  c.portal_account_id::text
FROM public.customers c 
WHERE c.email = 'test@gmail.com'

UNION ALL

SELECT 
  'Portal Account' as type,
  cpa.id::text,
  'test@gmail.com',
  cpa.created_at::text,
  cpa.needs_password_setup::text
FROM public.customer_portal_accounts cpa 
WHERE cpa.auth_user_id = (SELECT id FROM auth.users WHERE email = 'test@gmail.com');
