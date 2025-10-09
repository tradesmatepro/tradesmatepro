-- Create Test User for Customer Portal
-- Run this in Supabase SQL Editor to create a working test user

-- First, let's check if the user already exists and clean up if needed
DELETE FROM public.customer_portal_accounts WHERE email = 'test@gmail.com';
DELETE FROM public.customers WHERE email = 'test@gmail.com';
DELETE FROM auth.users WHERE email = 'test@gmail.com';

-- Step 1: Create user in Supabase Auth system
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
  company_id,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Test Customer',
  'test@gmail.com',
  '555-123-4567',
  '123 Test Street',
  'Test City',
  'TS',
  '12345',
  'United States',
  'RESIDENTIAL',
  'ACTIVE',
  NULL,
  now(),
  now()
);

-- Step 3: Create customer portal account linking the auth user to the customer
INSERT INTO public.customer_portal_accounts (
  id,
  customer_id,
  auth_user_id,
  email,
  is_active,
  created_via,
  needs_password_setup,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.customers WHERE email = 'test@gmail.com'),
  (SELECT id FROM auth.users WHERE email = 'test@gmail.com'),
  'test@gmail.com',
  true,
  'manual_setup',
  false,
  now(),
  now()
);

-- Verify the setup
SELECT 
  'Auth User' as type,
  id,
  email,
  created_at
FROM auth.users 
WHERE email = 'test@gmail.com'

UNION ALL

SELECT 
  'Customer' as type,
  id::text,
  email,
  created_at
FROM public.customers 
WHERE email = 'test@gmail.com'

UNION ALL

SELECT 
  'Portal Account' as type,
  id::text,
  email,
  created_at
FROM public.customer_portal_accounts 
WHERE email = 'test@gmail.com';

-- Show the complete setup
SELECT 
  cpa.id as portal_account_id,
  cpa.email,
  cpa.auth_user_id,
  cpa.customer_id,
  c.name as customer_name,
  au.id as auth_user_id_check,
  cpa.is_active,
  cpa.created_via
FROM public.customer_portal_accounts cpa
LEFT JOIN public.customers c ON cpa.customer_id = c.id
LEFT JOIN auth.users au ON cpa.auth_user_id = au.id
WHERE cpa.email = 'test@gmail.com';
