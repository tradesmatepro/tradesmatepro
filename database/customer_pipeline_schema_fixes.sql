-- Customer Pipeline Schema Fixes
-- Based on actual schema analysis and GPT conversation
-- Fixes duplicate address fields, enables global customer registry, adds service request routing

-- =====================================================
-- 1. MAKE CUSTOMERS GLOBAL (nullable company_id)
-- =====================================================
-- Allow customers to exist without being tied to a specific company
-- This enables the global customer registry concept
ALTER TABLE public.customers 
ALTER COLUMN company_id DROP NOT NULL;

-- Add tracking fields for global customers
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_via TEXT DEFAULT 'contractor' CHECK (created_via IN ('contractor', 'self_signup', 'service_request'));

-- =====================================================
-- 2. CLEAN UP DUPLICATE ADDRESS FIELDS
-- =====================================================
-- Remove redundant street_address from customer_portal_accounts
-- Addresses should only be stored in customers table
ALTER TABLE public.customer_portal_accounts 
DROP COLUMN IF EXISTS street_address,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS state,
DROP COLUMN IF EXISTS zip_code,
DROP COLUMN IF EXISTS country,
DROP COLUMN IF EXISTS latitude,
DROP COLUMN IF EXISTS longitude;

-- Remove duplicate generic address fields from service_requests
-- Keep only the service_address_* fields (industry standard for job locations)
ALTER TABLE public.service_requests 
DROP COLUMN IF EXISTS address_line_1,
DROP COLUMN IF EXISTS address_line_2,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS state,
DROP COLUMN IF EXISTS zip_code,
DROP COLUMN IF EXISTS latitude,
DROP COLUMN IF EXISTS longitude;

-- =====================================================
-- 3. ADD SERVICE REQUEST ROUTING/MATCHING
-- =====================================================
-- Add fields to support contractor matching and claiming
ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS claimed_by_company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS claimed_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS matched_companies UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS budget_min DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS budget_max DECIMAL(10,2);

-- =====================================================
-- 4. ENHANCE CUSTOMER PORTAL ACCOUNTS
-- =====================================================
-- Add invitation and tracking fields
ALTER TABLE public.customer_portal_accounts 
ADD COLUMN IF NOT EXISTS invitation_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invitation_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- =====================================================
-- 5. PERFORMANCE INDEXES
-- =====================================================
-- Indexes for service request routing and filtering
CREATE INDEX IF NOT EXISTS idx_service_requests_claimed_by_company 
    ON public.service_requests(claimed_by_company_id);

CREATE INDEX IF NOT EXISTS idx_service_requests_service_zip_code 
    ON public.service_requests(service_zip_code);

CREATE INDEX IF NOT EXISTS idx_service_requests_status_unclaimed 
    ON public.service_requests(status) 
    WHERE claimed_by_company_id IS NULL;

-- Indexes for customer relationships
CREATE INDEX IF NOT EXISTS idx_customers_is_global 
    ON public.customers(is_global);

CREATE INDEX IF NOT EXISTS idx_customers_portal_account 
    ON public.customers(portal_account_id);

-- Indexes for portal accounts
CREATE INDEX IF NOT EXISTS idx_portal_accounts_invitation_token 
    ON public.customer_portal_accounts(invitation_token) 
    WHERE invitation_token IS NOT NULL;

-- =====================================================
-- 6. BUSINESS LOGIC FUNCTIONS
-- =====================================================
-- Function to claim a service request
CREATE OR REPLACE FUNCTION public.claim_service_request(
  p_request_id UUID,
  p_company_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  -- Check if already claimed
  IF EXISTS (
    SELECT 1 FROM public.service_requests 
    WHERE id = p_request_id 
      AND claimed_by_company_id IS NOT NULL
  ) THEN
    RETURN false;
  END IF;
  
  -- Get customer_id for linking
  SELECT customer_id INTO v_customer_id
  FROM public.service_requests 
  WHERE id = p_request_id;
  
  -- Claim the request
  UPDATE public.service_requests 
  SET 
    claimed_by_company_id = p_company_id,
    claimed_by_user_id = p_user_id,
    claimed_at = now(),
    status = 'claimed'
  WHERE id = p_request_id;
  
  -- Link customer to company if not already linked
  INSERT INTO public.company_customers (company_id, customer_id, relationship_type, added_at)
  VALUES (p_company_id, v_customer_id, 'lead', now())
  ON CONFLICT (company_id, customer_id) DO NOTHING;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to find or create global customer
CREATE OR REPLACE FUNCTION public.find_or_create_global_customer(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL,
  p_street_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_zip_code TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  -- Try to find existing customer by email
  IF p_email IS NOT NULL THEN
    SELECT id INTO v_customer_id
    FROM public.customers 
    WHERE email = p_email
    LIMIT 1;
    
    IF v_customer_id IS NOT NULL THEN
      RETURN v_customer_id;
    END IF;
  END IF;
  
  -- Create new global customer
  INSERT INTO public.customers (
    name, email, phone, street_address, city, state, zip_code,
    country, customer_type, status, is_global, created_via, company_id
  ) VALUES (
    p_name, p_email, p_phone, p_street_address, p_city, p_state, p_zip_code,
    'United States', 'RESIDENTIAL', 'ACTIVE', true, 'self_signup', NULL
  ) RETURNING id INTO v_customer_id;
  
  RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. UPDATE EXISTING DATA
-- =====================================================
-- Mark existing customers as global if they have no company_id
UPDATE public.customers 
SET is_global = true, created_via = 'self_signup'
WHERE company_id IS NULL AND is_global IS NOT TRUE;

-- Mark existing customers with company_id as contractor-created
UPDATE public.customers 
SET is_global = false, created_via = 'contractor'
WHERE company_id IS NOT NULL AND is_global IS NOT FALSE;
