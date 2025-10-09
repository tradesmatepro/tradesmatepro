-- ============================================================================
-- COMPLETE INDUSTRY STANDARD PIPELINE MIGRATION
-- TradeMate Pro - Full Quote-to-Cash Workflow
-- ============================================================================
-- This migration implements the complete industry standard pipeline with
-- placeholders for features not yet built (SMS, email automation, etc.)
-- ============================================================================

-- ============================================================================
-- PHASE 1: FIX CRITICAL ISSUES
-- ============================================================================

-- 1.1: Update work_order_status_enum to include missing values
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'sent';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'rejected';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'paid';
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'closed';

-- 1.2: Add missing timestamp columns to work_orders
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS quote_sent_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS quote_viewed_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS quote_expires_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS quote_accepted_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS quote_rejected_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS quote_rejection_reason TEXT;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS has_change_orders BOOLEAN DEFAULT false;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS change_orders_total DECIMAL(10,2) DEFAULT 0;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS invoice_sent_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS invoice_viewed_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- 1.3: Add indexes for new timestamp columns
CREATE INDEX IF NOT EXISTS idx_work_orders_quote_sent_at ON work_orders(quote_sent_at);
CREATE INDEX IF NOT EXISTS idx_work_orders_quote_accepted_at ON work_orders(quote_accepted_at);
CREATE INDEX IF NOT EXISTS idx_work_orders_paid_at ON work_orders(paid_at);
CREATE INDEX IF NOT EXISTS idx_work_orders_closed_at ON work_orders(closed_at);

-- ============================================================================
-- PHASE 2: DELIVERY TRACKING TABLES
-- ============================================================================

-- 2.1: Quote Deliveries (Track how quotes are sent and viewed)
CREATE TABLE IF NOT EXISTS quote_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- Delivery details
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'sms', 'portal', 'download')),
  recipient_email TEXT,
  recipient_phone TEXT,
  
  -- Tracking timestamps
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  
  -- Content URLs
  pdf_url TEXT,
  portal_link TEXT,
  email_subject TEXT,
  email_body TEXT,
  sms_body TEXT,
  
  -- Status tracking
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'viewed', 'failed')),
  error_message TEXT,
  
  -- Metadata
  sent_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_deliveries_work_order ON quote_deliveries(work_order_id);
CREATE INDEX IF NOT EXISTS idx_quote_deliveries_company ON quote_deliveries(company_id);
CREATE INDEX IF NOT EXISTS idx_quote_deliveries_status ON quote_deliveries(delivery_status);
CREATE INDEX IF NOT EXISTS idx_quote_deliveries_sent_at ON quote_deliveries(sent_at);

COMMENT ON TABLE quote_deliveries IS 'Tracks quote delivery via email, SMS, portal, or download with view tracking';
COMMENT ON COLUMN quote_deliveries.viewed_at IS 'When customer opened/viewed the quote';
COMMENT ON COLUMN quote_deliveries.delivery_method IS 'How quote was delivered: email, sms, portal, download';

-- 2.2: Invoice Deliveries (Track how invoices are sent and viewed)
CREATE TABLE IF NOT EXISTS invoice_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Delivery details
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'sms', 'portal', 'download')),
  recipient_email TEXT,
  recipient_phone TEXT,
  
  -- Tracking timestamps
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  
  -- Content URLs
  pdf_url TEXT,
  portal_link TEXT,
  payment_link TEXT,
  
  -- Status tracking
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'viewed', 'failed')),
  error_message TEXT,
  
  -- Metadata
  sent_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_deliveries_invoice ON invoice_deliveries(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_deliveries_company ON invoice_deliveries(company_id);
CREATE INDEX IF NOT EXISTS idx_invoice_deliveries_status ON invoice_deliveries(delivery_status);

COMMENT ON TABLE invoice_deliveries IS 'Tracks invoice delivery via email, SMS, portal, or download with view tracking';

-- 2.3: Payment Deliveries (Track receipt delivery)
CREATE TABLE IF NOT EXISTS payment_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  
  -- Delivery details
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'sms', 'portal')),
  recipient_email TEXT,
  recipient_phone TEXT,
  
  -- Tracking timestamps
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  
  -- Content
  receipt_pdf_url TEXT,
  
  -- Status tracking
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_deliveries_payment ON payment_deliveries(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_deliveries_company ON payment_deliveries(company_id);

COMMENT ON TABLE payment_deliveries IS 'Tracks payment receipt delivery to customers';

-- ============================================================================
-- PHASE 3: CUSTOMER RESPONSE TRACKING
-- ============================================================================

-- 3.1: Quote Responses (Track customer acceptance/rejection)
CREATE TABLE IF NOT EXISTS quote_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- Response details
  response_type TEXT NOT NULL CHECK (response_type IN ('accepted', 'rejected', 'changes_requested')),
  rejection_reason TEXT,
  rejection_category TEXT CHECK (rejection_category IN ('price_too_high', 'timeline_too_long', 'went_with_competitor', 'scope_changed', 'other')),
  change_request_notes TEXT,
  
  -- Signature (if accepted)
  signature_id UUID,  -- TODO: Add FK when signatures table exists
  signature_data TEXT,

  -- Customer info
  responded_by_name TEXT,
  responded_by_email TEXT,
  responded_by_phone TEXT,
  responded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Tracking
  ip_address TEXT,
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_responses_work_order ON quote_responses(work_order_id);
CREATE INDEX IF NOT EXISTS idx_quote_responses_company ON quote_responses(company_id);
CREATE INDEX IF NOT EXISTS idx_quote_responses_type ON quote_responses(response_type);
CREATE INDEX IF NOT EXISTS idx_quote_responses_responded_at ON quote_responses(responded_at);

COMMENT ON TABLE quote_responses IS 'Tracks customer acceptance, rejection, or change requests for quotes';
COMMENT ON COLUMN quote_responses.rejection_category IS 'Categorized reason for rejection for analytics';

-- ============================================================================
-- PHASE 4: CHANGE ORDER MANAGEMENT (CRITICAL)
-- ============================================================================

-- 4.1: Change Orders
CREATE TABLE IF NOT EXISTS change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- Change order details
  change_order_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reason TEXT CHECK (reason IN ('customer_request', 'scope_change', 'unforeseen_work', 'code_requirement', 'other')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'cancelled')),
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Approval
  requested_by UUID REFERENCES profiles(id),
  approved_by_name TEXT,
  approved_by_email TEXT,
  signature_id UUID,  -- TODO: Add FK when signatures table exists
  signature_data TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_change_orders_work_order ON change_orders(work_order_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_company ON change_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON change_orders(status);
CREATE INDEX IF NOT EXISTS idx_change_orders_number ON change_orders(change_order_number);

COMMENT ON TABLE change_orders IS 'Change orders for approved quotes - tracks scope changes and additional work';
COMMENT ON COLUMN change_orders.change_order_number IS 'Unique identifier like CO-2025-001';

-- 4.2: Change Order Items
CREATE TABLE IF NOT EXISTS change_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  change_order_id UUID NOT NULL REFERENCES change_orders(id) ON DELETE CASCADE,
  
  -- Item details
  item_type TEXT NOT NULL CHECK (item_type IN ('addition', 'deletion', 'modification')),
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('labor', 'material', 'equipment', 'service', 'other')),
  
  -- Pricing
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Metadata
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_change_order_items_change_order ON change_order_items(change_order_id);
CREATE INDEX IF NOT EXISTS idx_change_order_items_company ON change_order_items(company_id);

COMMENT ON TABLE change_order_items IS 'Line items for change orders - additions, deletions, or modifications';

-- ============================================================================
-- PHASE 5: JOB COMPLETION & FEEDBACK
-- ============================================================================

-- 5.1: Job Completion Checklist
CREATE TABLE IF NOT EXISTS job_completion_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- Checklist item
  item_text TEXT NOT NULL,
  is_required BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  
  -- Completion details
  completed_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  
  -- Metadata
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_completion_checklist_work_order ON job_completion_checklist(work_order_id);
CREATE INDEX IF NOT EXISTS idx_job_completion_checklist_company ON job_completion_checklist(company_id);

COMMENT ON TABLE job_completion_checklist IS 'Required completion steps for jobs - ensures nothing is forgotten';

-- 5.2: Customer Feedback
CREATE TABLE IF NOT EXISTS customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Ratings (1-5 stars)
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  timeliness_rating INTEGER CHECK (timeliness_rating BETWEEN 1 AND 5),
  professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
  value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
  
  -- Feedback
  comments TEXT,
  would_recommend BOOLEAN,
  
  -- Review posting
  review_posted BOOLEAN DEFAULT false,
  review_platform TEXT CHECK (review_platform IN ('google', 'yelp', 'facebook', 'internal', 'other')),
  review_url TEXT,
  
  -- Metadata
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_feedback_work_order ON customer_feedback(work_order_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_company ON customer_feedback(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_customer ON customer_feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_overall_rating ON customer_feedback(overall_rating);

COMMENT ON TABLE customer_feedback IS 'Customer satisfaction surveys and reviews';

-- ============================================================================
-- PHASE 6: HELPER FUNCTIONS
-- ============================================================================

-- 6.1: Function to generate change order numbers
CREATE OR REPLACE FUNCTION generate_change_order_number(p_company_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
  v_number TEXT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM change_orders
  WHERE company_id = p_company_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  v_number := 'CO-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((v_count + 1)::TEXT, 4, '0');
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_change_order_number IS 'Generates sequential change order numbers like CO-2025-0001';

-- ============================================================================
-- PHASE 7: TRIGGERS
-- ============================================================================

-- 7.1: Update work_orders when change order is approved
CREATE OR REPLACE FUNCTION update_work_order_on_change_order_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE work_orders
    SET 
      has_change_orders = true,
      change_orders_total = COALESCE(change_orders_total, 0) + NEW.total_amount,
      total_amount = COALESCE(total_amount, 0) + NEW.total_amount,
      updated_at = NOW()
    WHERE id = NEW.work_order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_work_order_on_change_order_approval
  AFTER UPDATE ON change_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_work_order_on_change_order_approval();

COMMENT ON FUNCTION update_work_order_on_change_order_approval IS 'Automatically updates work order totals when change order is approved';

-- ============================================================================
-- PHASE 8: GRANT PERMISSIONS (RLS disabled for beta)
-- ============================================================================

-- Grant permissions to authenticated users
GRANT ALL ON quote_deliveries TO authenticated;
GRANT ALL ON invoice_deliveries TO authenticated;
GRANT ALL ON payment_deliveries TO authenticated;
GRANT ALL ON quote_responses TO authenticated;
GRANT ALL ON change_orders TO authenticated;
GRANT ALL ON change_order_items TO authenticated;
GRANT ALL ON job_completion_checklist TO authenticated;
GRANT ALL ON customer_feedback TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ Industry Standard Pipeline Migration Complete!';
  RAISE NOTICE '📊 New Tables Created: 8';
  RAISE NOTICE '📝 New Columns Added: 12';
  RAISE NOTICE '🔧 New Functions Created: 1';
  RAISE NOTICE '⚡ New Triggers Created: 1';
  RAISE NOTICE '🎯 Status Enum Values Added: 4 (sent, rejected, paid, closed)';
END $$;

