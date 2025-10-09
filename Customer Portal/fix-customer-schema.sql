-- Fix Customer Portal Schema for Global Customer Registry
-- Run this in Supabase SQL Editor

-- 1. Create company_customers join table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.company_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'client' CHECK (relationship_type IN ('client', 'prospect', 'vendor')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, customer_id)
);

-- 2. Update customer_portal_accounts to link to auth.users properly
ALTER TABLE public.customer_portal_accounts 
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS invitation_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invitation_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_via TEXT DEFAULT 'manual' CHECK (created_via IN ('manual', 'self_signup', 'contractor_invite')),
  ADD COLUMN IF NOT EXISTS needs_password_setup BOOLEAN DEFAULT false;

-- 3. Remove company_id from customers table (make it global)
-- First, migrate existing customers to company_customers table
INSERT INTO public.company_customers (company_id, customer_id, relationship_type, status, created_at)
SELECT 
  company_id, 
  id as customer_id, 
  'client' as relationship_type,
  CASE WHEN status = 'ACTIVE' THEN 'active' ELSE 'inactive' END as status,
  created_at
FROM public.customers 
WHERE company_id IS NOT NULL
ON CONFLICT (company_id, customer_id) DO NOTHING;

-- Now remove company_id from customers (make it global)
ALTER TABLE public.customers DROP COLUMN IF EXISTS company_id;

-- Add created_via column to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS created_via TEXT DEFAULT 'manual' CHECK (created_via IN ('manual', 'self_signup', 'contractor_invite'));

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_customers_company ON public.company_customers(company_id);
CREATE INDEX IF NOT EXISTS idx_company_customers_customer ON public.company_customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_portal_accounts_auth_user ON public.customer_portal_accounts(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_customer_portal_accounts_invitation ON public.customer_portal_accounts(invitation_token) WHERE invitation_token IS NOT NULL;

-- 5. Create view for contractor's customers (replaces old company_id filtering)
CREATE OR REPLACE VIEW public.company_customers_view AS
SELECT 
  c.*,
  cc.company_id,
  cc.relationship_type,
  cc.status as relationship_status,
  cc.created_at as relationship_created_at
FROM public.customers c
JOIN public.company_customers cc ON c.id = cc.customer_id;

-- 6. Update customer_portal_accounts to use proper auth linking
-- Remove old password_hash column since we're using Supabase Auth
ALTER TABLE public.customer_portal_accounts DROP COLUMN IF EXISTS password_hash;

-- 7. Create function to get customers for a company
CREATE OR REPLACE FUNCTION get_company_customers(company_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  customer_type TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  relationship_type TEXT,
  relationship_status TEXT,
  has_portal_account BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    c.street_address,
    c.city,
    c.state,
    c.zip_code,
    c.country,
    c.customer_type,
    c.status,
    c.created_at,
    c.updated_at,
    cc.relationship_type,
    cc.status as relationship_status,
    (cpa.id IS NOT NULL) as has_portal_account
  FROM public.customers c
  JOIN public.company_customers cc ON c.id = cc.customer_id
  LEFT JOIN public.customer_portal_accounts cpa ON c.id = cpa.customer_id
  WHERE cc.company_id = company_uuid
  AND cc.status = 'active'
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to find or create global customer (used by CustomerAuthService)
CREATE OR REPLACE FUNCTION find_or_create_global_customer(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL,
  p_street_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_zip_code TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  customer_id UUID;
BEGIN
  -- First try to find existing customer by email
  IF p_email IS NOT NULL THEN
    SELECT id INTO customer_id
    FROM public.customers
    WHERE email = p_email
    LIMIT 1;
  END IF;

  -- If not found by email, try by name and phone
  IF customer_id IS NULL AND p_phone IS NOT NULL THEN
    SELECT id INTO customer_id
    FROM public.customers
    WHERE name = p_name AND phone = p_phone
    LIMIT 1;
  END IF;

  -- If still not found, create new customer
  IF customer_id IS NULL THEN
    INSERT INTO public.customers (
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
      created_at,
      updated_at
    ) VALUES (
      p_name,
      p_email,
      p_phone,
      p_street_address,
      p_city,
      p_state,
      p_zip_code,
      'United States',
      'RESIDENTIAL',
      'ACTIVE',
      now(),
      now()
    )
    RETURNING id INTO customer_id;
  END IF;

  RETURN customer_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Verify the schema
SELECT
  'Schema Update Complete' as status,
  (SELECT COUNT(*) FROM public.company_customers) as company_customer_relationships,
  (SELECT COUNT(*) FROM public.customer_portal_accounts WHERE auth_user_id IS NOT NULL) as portal_accounts_with_auth;
