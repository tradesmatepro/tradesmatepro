-- Fix Missing Tables for Sales Section
-- This SQL creates the missing tables causing HTTP 400 errors on Customers page
-- Run this in your Supabase SQL editor

BEGIN;

-- =====================================================
-- 1. CUSTOMER COMMUNICATIONS TABLE
-- =====================================================
-- For tracking customer interactions (calls, emails, meetings, etc.)
CREATE TABLE IF NOT EXISTS public.customer_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Communication Details
  type TEXT NOT NULL DEFAULT 'call' CHECK (type IN ('call', 'email', 'text', 'meeting', 'note')),
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
  subject TEXT,
  content TEXT,
  outcome TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 2. CUSTOMER TAGS TABLE
-- =====================================================
-- For categorizing and organizing customers
CREATE TABLE IF NOT EXISTS public.customer_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Tag Details
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(company_id, name)
);

-- =====================================================
-- 3. CUSTOMER SERVICE AGREEMENTS TABLE
-- =====================================================
-- For managing service contracts and maintenance agreements
CREATE TABLE IF NOT EXISTS public.customer_service_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  
  -- Agreement Details
  title TEXT NOT NULL,
  description TEXT,
  agreement_type TEXT NOT NULL DEFAULT 'maintenance' 
    CHECK (agreement_type IN ('maintenance', 'service', 'warranty', 'support')),
  
  -- Terms
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_fee DECIMAL(10,2),
  annual_fee DECIMAL(10,2),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'inactive', 'expired', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 4. SERVICE REQUESTS TABLE
-- =====================================================
-- For managing customer service requests and support tickets
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  
  -- Request Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' 
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'open' 
    CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  
  -- Assignment
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Customer Communications Indexes
CREATE INDEX IF NOT EXISTS idx_customer_communications_company_id ON public.customer_communications(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_customer_id ON public.customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_created_at ON public.customer_communications(created_at DESC);

-- Customer Tags Indexes
CREATE INDEX IF NOT EXISTS idx_customer_tags_company_id ON public.customer_tags(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_tags_is_active ON public.customer_tags(is_active);

-- Customer Service Agreements Indexes
CREATE INDEX IF NOT EXISTS idx_customer_service_agreements_company_id ON public.customer_service_agreements(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_service_agreements_customer_id ON public.customer_service_agreements(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_service_agreements_status ON public.customer_service_agreements(status);

-- Service Requests Indexes
CREATE INDEX IF NOT EXISTS idx_service_requests_company_id ON public.service_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_customer_id ON public.service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON public.service_requests(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_service_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access customer communications for their company" ON public.customer_communications
  FOR ALL USING (company_id = auth.jwt() ->> 'company_id'::text);

CREATE POLICY "Users can access customer tags for their company" ON public.customer_tags
  FOR ALL USING (company_id = auth.jwt() ->> 'company_id'::text);

CREATE POLICY "Users can access customer service agreements for their company" ON public.customer_service_agreements
  FOR ALL USING (company_id = auth.jwt() ->> 'company_id'::text);

CREATE POLICY "Users can access service requests for their company" ON public.service_requests
  FOR ALL USING (company_id = auth.jwt() ->> 'company_id'::text);

COMMIT;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- All missing tables have been created successfully!
-- The Customers page should now work without HTTP 400 errors.
