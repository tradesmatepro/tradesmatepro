-- ========================================
-- CREATE CUSTOMER_COMMUNICATIONS TABLE
-- ========================================
-- This table tracks all communications with customers
-- (calls, emails, texts, meetings, notes)

CREATE TABLE IF NOT EXISTS public.customer_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Communication details
  communication_type TEXT NOT NULL CHECK (communication_type IN ('call', 'email', 'text', 'meeting', 'note')),
  subject TEXT,
  message TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  
  -- Metadata
  duration_minutes INTEGER, -- For calls/meetings
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_communications_company ON public.customer_communications(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_customer ON public.customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_created_by ON public.customer_communications(created_by);
CREATE INDEX IF NOT EXISTS idx_customer_communications_created_at ON public.customer_communications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_communications_type ON public.customer_communications(communication_type);

-- RLS Policies
ALTER TABLE public.customer_communications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view communications for their company
CREATE POLICY "Users can view company communications"
  ON public.customer_communications
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy: Users can create communications for their company
CREATE POLICY "Users can create company communications"
  ON public.customer_communications
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy: Users can update their own communications
CREATE POLICY "Users can update own communications"
  ON public.customer_communications
  FOR UPDATE
  USING (
    created_by = auth.uid()
  );

-- Policy: Users can delete their own communications
CREATE POLICY "Users can delete own communications"
  ON public.customer_communications
  FOR DELETE
  USING (
    created_by = auth.uid()
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_customer_communications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_communications_updated_at
  BEFORE UPDATE ON public.customer_communications
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_communications_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_communications TO authenticated;
GRANT USAGE ON SEQUENCE customer_communications_id_seq TO authenticated;

COMMENT ON TABLE public.customer_communications IS 'Tracks all communications with customers (calls, emails, texts, meetings, notes)';

