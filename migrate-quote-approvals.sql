-- Drop existing quote_approvals table and recreate with proper schema
DROP TABLE IF EXISTS quote_approvals CASCADE;

-- Recreate with correct schema
CREATE TABLE quote_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Approval workflow tracking
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signature_id UUID REFERENCES quote_signatures(id),
  deposit_id UUID REFERENCES quote_deposits(id),
  
  -- Terms acceptance
  terms_accepted BOOLEAN DEFAULT FALSE,
  terms_accepted_at TIMESTAMPTZ,
  terms_version VARCHAR(50),
  
  -- Scheduling
  customer_selected_date TIMESTAMPTZ,
  customer_selected_notes TEXT,
  scheduling_status VARCHAR(20) CHECK (scheduling_status IN ('pending', 'confirmed', 'declined')),
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_quote_approval UNIQUE (quote_id)
);

CREATE INDEX idx_quote_approvals_company ON quote_approvals(company_id);
CREATE INDEX idx_quote_approvals_quote ON quote_approvals(quote_id);
CREATE INDEX idx_quote_approvals_customer ON quote_approvals(customer_id);

-- RLS policy
CREATE POLICY "anon_insert_quote_approvals"
ON quote_approvals
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM work_orders 
    WHERE work_orders.id = quote_approvals.quote_id 
    AND work_orders.status = 'sent'
  )
);

