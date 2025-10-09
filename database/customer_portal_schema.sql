-- Customer Portal Schema for TradeMate Pro
-- Run this in Supabase SQL Editor to enable customer portal functionality
-- This creates the foundation for a marketplace-ready customer portal

-- 0. Add portal_account_id to customers table (links to customer_portal_accounts)
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS portal_account_id UUID REFERENCES public.customer_portal_accounts(id) ON DELETE SET NULL;

-- 1. Customer Portal Accounts (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.customer_portal_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES public.companies(id), -- company that invited this customer
  needs_password_setup BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(auth_user_id),
  UNIQUE(customer_id, email)
);

-- 2. E-Signatures for quotes and invoices
CREATE TABLE IF NOT EXISTS public.esignatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  signed_by TEXT NOT NULL, -- name/email
  signature_data JSONB, -- base64, coordinates, metadata
  signed_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  
  -- Ensure either quote_id or invoice_id is provided
  CONSTRAINT esignatures_document_check CHECK (
    (quote_id IS NOT NULL AND invoice_id IS NULL) OR 
    (quote_id IS NULL AND invoice_id IS NOT NULL)
  )
);

-- 3. Service Requests (marketplace-style lead generation)
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL, -- internal routing if needed
  
  -- Service details
  category TEXT NOT NULL, -- e.g., Plumbing, Electrical, HVAC
  title TEXT NOT NULL,
  description TEXT,
  urgency TEXT CHECK (urgency IN ('low','normal','high','emergency')) DEFAULT 'normal',
  
  -- Location information
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  
  -- Timing and status
  requested_at TIMESTAMPTZ DEFAULT now(),
  preferred_date DATE,
  preferred_time_start TIME,
  preferred_time_end TIME,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','claimed','scheduled','completed','cancelled')),
  
  -- Additional metadata
  photos JSONB DEFAULT '[]', -- array of photo URLs
  budget_range TEXT, -- e.g., "$100-$500", "Under $1000"
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Service Request Responses (contractor bids/responses)
CREATE TABLE IF NOT EXISTS public.service_request_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  contractor_company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Response details
  message TEXT,
  estimated_arrival TIMESTAMPTZ,
  quoted_amount NUMERIC(12,2),
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','withdrawn')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Prevent duplicate responses from same company
  UNIQUE(service_request_id, contractor_company_id)
);

-- 5. Request Tags (categories/filters for service requests)
CREATE TABLE IF NOT EXISTS public.request_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Ratings & Reviews (customer-to-contractor ratings)
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one rating per customer per work order or service request
  UNIQUE(work_order_id, customer_id),
  UNIQUE(service_request_id, customer_id)
);

-- 5. Extend Messages table for service request communication
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS portal_customer_id UUID REFERENCES public.customer_portal_accounts(id) ON DELETE SET NULL;

-- 6. Portal Sessions (for magic link authentication)
CREATE TABLE IF NOT EXISTS public.portal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_portal_account_id UUID NOT NULL REFERENCES public.customer_portal_accounts(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_accessed TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- 7. Portal Activity Log (for security and analytics)
CREATE TABLE IF NOT EXISTS public.portal_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_portal_account_id UUID NOT NULL REFERENCES public.customer_portal_accounts(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'login', 'quote_viewed', 'quote_signed', 'service_request_created'
  resource_type TEXT, -- 'quote', 'invoice', 'service_request'
  resource_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_portal_accounts_customer ON public.customer_portal_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_portal_accounts_email ON public.customer_portal_accounts(email);
CREATE INDEX IF NOT EXISTS idx_esignatures_quote ON public.esignatures(quote_id) WHERE quote_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_esignatures_invoice ON public.esignatures(invoice_id) WHERE invoice_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_service_requests_location ON public.service_requests(zip_code, latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status, created_at);
CREATE INDEX IF NOT EXISTS idx_service_request_responses_request ON public.service_request_responses(service_request_id);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_token ON public.portal_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_portal_activity_customer ON public.portal_activity_log(customer_portal_account_id, created_at);

-- 9. Views for customer portal data access
CREATE OR REPLACE VIEW public.customer_portal_quotes_v AS
SELECT 
  q.id,
  q.quote_number,
  q.title,
  q.description,
  q.status,
  q.subtotal,
  q.total_amount,
  q.created_at,
  q.updated_at,
  c.id as customer_id,
  c.name as customer_name,
  c.email as customer_email,
  comp.name as company_name,
  comp.phone as company_phone,
  comp.email as company_email,
  es.id as signature_id,
  es.signed_at,
  es.signed_by
FROM public.quotes q
JOIN public.customers c ON q.customer_id = c.id
LEFT JOIN public.companies comp ON c.company_id = comp.id
LEFT JOIN public.esignatures es ON q.id = es.quote_id
ORDER BY q.created_at DESC;

CREATE OR REPLACE VIEW public.customer_portal_invoices_v AS
SELECT 
  i.id,
  i.invoice_number,
  i.total_amount,
  i.status,
  i.due_date,
  i.created_at,
  i.updated_at,
  c.id as customer_id,
  c.name as customer_name,
  c.email as customer_email,
  comp.name as company_name,
  comp.phone as company_phone,
  comp.email as company_email,
  es.id as signature_id,
  es.signed_at,
  es.signed_by
FROM public.invoices i
JOIN public.customers c ON i.customer_id = c.id
LEFT JOIN public.companies comp ON c.company_id = comp.id
LEFT JOIN public.esignatures es ON i.id = es.invoice_id
ORDER BY i.created_at DESC;

-- 10. Service request matching view (for marketplace functionality)
CREATE OR REPLACE VIEW public.service_requests_with_responses_v AS
SELECT 
  sr.id,
  sr.category,
  sr.title,
  sr.description,
  sr.urgency,
  sr.address_line_1,
  sr.city,
  sr.state,
  sr.zip_code,
  sr.status,
  sr.requested_at,
  sr.preferred_date,
  sr.budget_range,
  c.name as customer_name,
  c.phone as customer_phone,
  COUNT(srr.id) as response_count,
  MIN(srr.quoted_amount) as lowest_quote,
  MAX(srr.quoted_amount) as highest_quote
FROM public.service_requests sr
LEFT JOIN public.customers c ON sr.customer_id = c.id
LEFT JOIN public.service_request_responses srr ON sr.id = srr.service_request_id
GROUP BY sr.id, c.name, c.phone
ORDER BY sr.created_at DESC;

-- 11. RLS Policies (Row Level Security) - Disabled for beta but structure ready
-- Note: RLS is currently disabled for beta. When enabled, add these policies:

-- COMMENT: Enable RLS when ready
-- ALTER TABLE public.customer_portal_accounts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.esignatures ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.service_request_responses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.portal_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.portal_activity_log ENABLE ROW LEVEL SECURITY;

-- Customer can only see their own data
-- CREATE POLICY customer_portal_own_data ON public.customer_portal_accounts FOR ALL USING (auth.uid()::text = id::text);

-- Notes:
-- - Schema supports both internal routing (company_id) and marketplace functionality
-- - E-signatures work for both quotes and invoices
-- - Service requests support photo uploads and location-based matching
-- - Portal sessions enable magic link authentication
-- - Activity logging for security and analytics
-- - Views provide optimized data access for portal UI
-- - Ready for RLS when security requirements are finalized
