-- Customer Dashboard Schema - Missing Tables for Beta
-- Following Supabase standards: id for PKs, table_id for FKs, proper constraints

-- =====================================================
-- 1. CUSTOMER MESSAGES TABLE
-- =====================================================
-- Separate from internal messages - customer ↔ contractor only
CREATE TABLE IF NOT EXISTS public.customer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  work_order_id uuid REFERENCES public.work_orders(work_order_id) ON DELETE SET NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'contractor')),
  sender_id uuid, -- customer_id or user_id depending on sender_type
  message_text text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_messages_company_id ON public.customer_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_messages_customer_id ON public.customer_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_messages_work_order_id ON public.customer_messages(work_order_id);
CREATE INDEX IF NOT EXISTS idx_customer_messages_created_at ON public.customer_messages(created_at DESC);

-- =====================================================
-- 2. SERVICE REQUESTS TABLE (Marketplace Leads)
-- =====================================================
-- Nullable company_id for marketplace functionality
CREATE TABLE IF NOT EXISTS public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL, -- NULL until accepted
  service_type text NOT NULL,
  title text NOT NULL,
  description text,
  service_location text,
  preferred_date timestamptz,
  emergency boolean DEFAULT false,
  budget_range text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'declined', 'completed', 'cancelled')),
  accepted_at timestamptz,
  accepted_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  work_order_id uuid REFERENCES public.work_orders(work_order_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for marketplace queries
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_company_id ON public.service_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_customer_id ON public.service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_service_type ON public.service_requests(service_type);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON public.service_requests(created_at DESC);

-- =====================================================
-- 3. CUSTOMER SIGNATURES TABLE
-- =====================================================
-- For quote approvals and e-signatures
CREATE TABLE IF NOT EXISTS public.customer_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES public.work_orders(work_order_id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  signature_type text NOT NULL DEFAULT 'quote_approval' CHECK (signature_type IN ('quote_approval', 'work_completion', 'invoice_approval')),
  signed_by text NOT NULL, -- Customer name
  signature_data text NOT NULL, -- Base64 signature image
  ip_address text,
  signed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customer_signatures_work_order_id ON public.customer_signatures(work_order_id);
CREATE INDEX IF NOT EXISTS idx_customer_signatures_customer_id ON public.customer_signatures(customer_id);

-- =====================================================
-- 4. UPDATE TRIGGERS FOR updated_at
-- =====================================================
-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_customer_messages_updated_at ON public.customer_messages;
CREATE TRIGGER update_customer_messages_updated_at
  BEFORE UPDATE ON public.customer_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_requests_updated_at ON public.service_requests;
CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 5. RLS POLICIES (Future-proofed but disabled for beta)
-- =====================================================
-- Enable RLS on tables (commented out for beta)
-- ALTER TABLE public.customer_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.customer_signatures ENABLE ROW LEVEL SECURITY;

-- Company isolation policies (ready for when RLS is enabled)
/*
CREATE POLICY "customer_messages_company_isolation" ON public.customer_messages
  FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "service_requests_company_isolation" ON public.service_requests
  FOR ALL USING (company_id IS NULL OR company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY "customer_signatures_company_isolation" ON public.customer_signatures
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.work_orders wo 
    WHERE wo.work_order_id = customer_signatures.work_order_id 
    AND wo.company_id = current_setting('app.current_company_id')::uuid
  ));
*/

-- =====================================================
-- 6. SAMPLE DATA FOR TESTING (Optional)
-- =====================================================
-- Uncomment to add sample data for testing
/*
-- Sample service request
INSERT INTO public.service_requests (customer_id, service_type, title, description, service_location, emergency)
SELECT 
  c.id as customer_id,
  'HVAC Repair' as service_type,
  'Air Conditioning Not Working' as title,
  'AC unit stopped working yesterday, need urgent repair' as description,
  c.street_address || ', ' || c.city || ', ' || c.state as service_location,
  true as emergency
FROM public.customers c 
WHERE c.company_id IS NOT NULL
LIMIT 1;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Verify tables were created
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('customer_messages', 'service_requests', 'customer_signatures')
ORDER BY table_name, ordinal_position;
