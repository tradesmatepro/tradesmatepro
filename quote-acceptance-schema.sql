-- ============================================================================
-- TRADEMATE PRO - QUOTE ACCEPTANCE WORKFLOW SCHEMA
-- ============================================================================
-- Purpose: Industry-standard quote acceptance flow matching/exceeding
--          ServiceTitan, Jobber, and Housecall Pro
-- Date: 2025-10-10
-- ============================================================================

-- ============================================================================
-- TABLE: quote_signatures
-- Purpose: Store customer signatures for quote approvals
-- ============================================================================
CREATE TABLE IF NOT EXISTS quote_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Signature data
  signature_type VARCHAR(20) NOT NULL CHECK (signature_type IN ('drawn', 'typed')),
  signature_image_url TEXT, -- Supabase Storage URL for drawn signatures
  signature_text VARCHAR(255), -- Text for typed signatures
  
  -- Metadata
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT unique_quote_signature UNIQUE (quote_id)
);

CREATE INDEX idx_quote_signatures_company ON quote_signatures(company_id);
CREATE INDEX idx_quote_signatures_quote ON quote_signatures(quote_id);
CREATE INDEX idx_quote_signatures_customer ON quote_signatures(customer_id);

-- ============================================================================
-- TABLE: quote_rejections
-- Purpose: Track why customers decline quotes for analytics and follow-up
-- ============================================================================
CREATE TABLE IF NOT EXISTS quote_rejections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Rejection details
  rejection_reason VARCHAR(50) NOT NULL CHECK (rejection_reason IN (
    'too_expensive',
    'other_contractor',
    'timeline',
    'no_longer_needed',
    'other'
  )),
  rejection_reason_other TEXT, -- Required if rejection_reason = 'other'
  feedback TEXT, -- Optional customer feedback
  
  -- Follow-up preferences
  wants_revised_quote BOOLEAN DEFAULT FALSE,
  wants_payment_plan BOOLEAN DEFAULT FALSE,
  wants_follow_up BOOLEAN DEFAULT FALSE,
  follow_up_date TIMESTAMPTZ,
  follow_up_completed BOOLEAN DEFAULT FALSE,
  follow_up_completed_at TIMESTAMPTZ,
  follow_up_notes TEXT,
  
  -- Metadata
  rejected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_quote_rejection UNIQUE (quote_id)
);

CREATE INDEX idx_quote_rejections_company ON quote_rejections(company_id);
CREATE INDEX idx_quote_rejections_quote ON quote_rejections(quote_id);
CREATE INDEX idx_quote_rejections_reason ON quote_rejections(rejection_reason);
CREATE INDEX idx_quote_rejections_follow_up ON quote_rejections(wants_follow_up, follow_up_completed);

-- ============================================================================
-- TABLE: quote_change_requests
-- Purpose: Track customer requests for quote changes
-- ============================================================================
CREATE TABLE IF NOT EXISTS quote_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Change request details
  requested_changes TEXT NOT NULL,
  urgency VARCHAR(20) NOT NULL DEFAULT 'moderate' CHECK (urgency IN ('low', 'moderate', 'urgent')),
  
  -- Response tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  responded_at TIMESTAMPTZ,
  response_notes TEXT,
  revised_quote_id UUID REFERENCES work_orders(id),
  
  -- Metadata
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quote_change_requests_company ON quote_change_requests(company_id);
CREATE INDEX idx_quote_change_requests_quote ON quote_change_requests(quote_id);
CREATE INDEX idx_quote_change_requests_status ON quote_change_requests(status);
CREATE INDEX idx_quote_change_requests_urgency ON quote_change_requests(urgency);

-- ============================================================================
-- TABLE: quote_deposits
-- Purpose: Track deposit payments on quotes
-- ============================================================================
CREATE TABLE IF NOT EXISTS quote_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Payment details
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('stripe', 'cash', 'check', 'other')),
  
  -- Stripe integration
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  
  -- Payment status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  
  -- Refund tracking
  refunded_at TIMESTAMPTZ,
  refund_amount NUMERIC(10, 2),
  refund_reason TEXT,
  stripe_refund_id VARCHAR(255),
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quote_deposits_company ON quote_deposits(company_id);
CREATE INDEX idx_quote_deposits_quote ON quote_deposits(quote_id);
CREATE INDEX idx_quote_deposits_customer ON quote_deposits(customer_id);
CREATE INDEX idx_quote_deposits_status ON quote_deposits(status);
CREATE INDEX idx_quote_deposits_stripe_payment_intent ON quote_deposits(stripe_payment_intent_id);

-- ============================================================================
-- TABLE: quote_approvals
-- Purpose: Track complete quote approval workflow
-- ============================================================================
CREATE TABLE IF NOT EXISTS quote_approvals (
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
  terms_version VARCHAR(50), -- Track which version of terms was accepted
  
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

-- ============================================================================
-- UPDATE: settings table
-- Purpose: Add quote acceptance workflow settings
-- ============================================================================
ALTER TABLE settings ADD COLUMN IF NOT EXISTS require_signature_on_approval BOOLEAN DEFAULT FALSE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS require_terms_acceptance BOOLEAN DEFAULT FALSE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS require_deposit_on_approval BOOLEAN DEFAULT FALSE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS default_deposit_percentage NUMERIC(5, 2) DEFAULT 0.00 CHECK (default_deposit_percentage >= 0 AND default_deposit_percentage <= 100);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS default_deposit_amount NUMERIC(10, 2) DEFAULT 0.00 CHECK (default_deposit_amount >= 0);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS allow_customer_scheduling BOOLEAN DEFAULT FALSE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS auto_schedule_after_approval BOOLEAN DEFAULT FALSE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS allow_partial_deposits BOOLEAN DEFAULT FALSE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS rejection_follow_up_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS terms_and_conditions_text TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS terms_version VARCHAR(50) DEFAULT '1.0';

-- ============================================================================
-- RLS POLICIES
-- Purpose: Allow anonymous users to interact with quote acceptance workflow
-- ============================================================================

-- quote_signatures: Allow anon to insert signatures for sent quotes
CREATE POLICY "anon_insert_quote_signatures"
ON quote_signatures
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM work_orders 
    WHERE work_orders.id = quote_signatures.quote_id 
    AND work_orders.status = 'sent'
  )
);

-- quote_rejections: Allow anon to insert rejections for sent quotes
CREATE POLICY "anon_insert_quote_rejections"
ON quote_rejections
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM work_orders 
    WHERE work_orders.id = quote_rejections.quote_id 
    AND work_orders.status = 'sent'
  )
);

-- quote_change_requests: Allow anon to insert change requests for sent quotes
CREATE POLICY "anon_insert_quote_change_requests"
ON quote_change_requests
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM work_orders 
    WHERE work_orders.id = quote_change_requests.quote_id 
    AND work_orders.status = 'sent'
  )
);

-- quote_deposits: Allow anon to insert deposits for sent quotes
CREATE POLICY "anon_insert_quote_deposits"
ON quote_deposits
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM work_orders 
    WHERE work_orders.id = quote_deposits.quote_id 
    AND work_orders.status = 'sent'
  )
);

-- quote_approvals: Allow anon to insert approvals for sent quotes
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

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE quote_signatures IS 'Customer signatures for quote approvals';
COMMENT ON TABLE quote_rejections IS 'Track why customers decline quotes for analytics and follow-up';
COMMENT ON TABLE quote_change_requests IS 'Customer requests for quote changes';
COMMENT ON TABLE quote_deposits IS 'Deposit payments on quotes';
COMMENT ON TABLE quote_approvals IS 'Complete quote approval workflow tracking';

