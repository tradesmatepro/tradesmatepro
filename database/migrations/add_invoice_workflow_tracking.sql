-- ============================================================================
-- PHASE 3C: INVOICE WORKFLOW TRACKING COLUMNS
-- ============================================================================
-- Purpose: Add tracking columns for invoice/payment status transitions
-- Date: 2025-10-03
-- Modals: Payment, CloseWorkOrder
-- ============================================================================

-- ============================================================================
-- 1. PAYMENT TRACKING
-- ============================================================================
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS payment_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS payment_method text, -- 'cash', 'check', 'credit_card', 'debit_card', 'ach', 'wire', 'paypal', 'venmo', 'zelle', 'other'
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS payment_notes text;

-- ============================================================================
-- 2. WORK ORDER CLOSURE TRACKING
-- ============================================================================
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS closed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS customer_satisfaction_rating integer, -- 1-5 stars
  ADD COLUMN IF NOT EXISTS final_notes text,
  ADD COLUMN IF NOT EXISTS lessons_learned text,
  ADD COLUMN IF NOT EXISTS request_review boolean DEFAULT false;

-- ============================================================================
-- 3. AUTO-TIMESTAMP TRIGGERS
-- ============================================================================

-- Trigger: Auto-set paid_at when status changes to 'paid'
CREATE OR REPLACE FUNCTION set_paid_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    IF NEW.paid_at IS NULL THEN
      NEW.paid_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_paid_timestamp ON work_orders;
CREATE TRIGGER trigger_set_paid_timestamp
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_paid_timestamp();

-- Trigger: Auto-set closed_at when status changes to 'closed'
CREATE OR REPLACE FUNCTION set_closed_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'closed' AND (OLD.status IS NULL OR OLD.status != 'closed') THEN
    IF NEW.closed_at IS NULL THEN
      NEW.closed_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_closed_timestamp ON work_orders;
CREATE TRIGGER trigger_set_closed_timestamp
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_closed_timestamp();

-- ============================================================================
-- 4. ANALYTICS VIEWS
-- ============================================================================

-- View: Payments Received Today
CREATE OR REPLACE VIEW payments_received_today AS
SELECT 
  wo.id,
  wo.title,
  wo.company_id,
  wo.customer_id,
  c.name as customer_name,
  wo.paid_at,
  wo.payment_amount,
  wo.payment_method,
  wo.payment_reference,
  wo.total_amount,
  wo.payment_notes
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
WHERE wo.status = 'paid' 
  AND DATE(wo.paid_at) = CURRENT_DATE
ORDER BY wo.paid_at DESC;

-- View: Payment Method Analytics
CREATE OR REPLACE VIEW payment_method_analytics AS
SELECT 
  wo.company_id,
  wo.payment_method,
  COUNT(*) as payment_count,
  SUM(wo.payment_amount) as total_collected,
  AVG(wo.payment_amount) as avg_payment_amount,
  MIN(wo.paid_at) as first_payment,
  MAX(wo.paid_at) as last_payment
FROM work_orders wo
WHERE wo.status = 'paid' 
  AND wo.paid_at IS NOT NULL
GROUP BY wo.company_id, wo.payment_method
ORDER BY total_collected DESC;

-- View: Customer Satisfaction Analytics
CREATE OR REPLACE VIEW customer_satisfaction_analytics AS
SELECT 
  wo.company_id,
  wo.customer_satisfaction_rating,
  COUNT(*) as rating_count,
  ROUND(AVG(wo.total_amount), 2) as avg_job_value,
  COUNT(*) FILTER (WHERE wo.request_review = true) as review_requests
FROM work_orders wo
WHERE wo.status = 'closed' 
  AND wo.customer_satisfaction_rating IS NOT NULL
GROUP BY wo.company_id, wo.customer_satisfaction_rating
ORDER BY wo.customer_satisfaction_rating DESC;

-- View: Work Orders Closed This Month
CREATE OR REPLACE VIEW work_orders_closed_this_month AS
SELECT 
  wo.id,
  wo.title,
  wo.company_id,
  wo.customer_id,
  c.name as customer_name,
  wo.closed_at,
  wo.customer_satisfaction_rating,
  wo.total_amount,
  wo.request_review,
  wo.final_notes,
  wo.lessons_learned,
  EXTRACT(EPOCH FROM (wo.closed_at - wo.created_at))/86400 as days_to_complete
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
WHERE wo.status = 'closed' 
  AND DATE_TRUNC('month', wo.closed_at) = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY wo.closed_at DESC;

-- View: Outstanding Invoices (Invoiced but not Paid)
CREATE OR REPLACE VIEW outstanding_invoices AS
SELECT 
  wo.id,
  wo.title,
  wo.company_id,
  wo.customer_id,
  c.name as customer_name,
  c.email as customer_email,
  c.phone as customer_phone,
  wo.invoiced_at,
  wo.total_amount,
  EXTRACT(EPOCH FROM (NOW() - wo.invoiced_at))/86400 as days_outstanding,
  CASE 
    WHEN EXTRACT(EPOCH FROM (NOW() - wo.invoiced_at))/86400 > 60 THEN 'critical'
    WHEN EXTRACT(EPOCH FROM (NOW() - wo.invoiced_at))/86400 > 30 THEN 'warning'
    ELSE 'normal'
  END as urgency_level
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
WHERE wo.status = 'invoiced'
ORDER BY wo.invoiced_at ASC;

-- View: Revenue by Payment Method (Last 30 Days)
CREATE OR REPLACE VIEW revenue_by_payment_method_30d AS
SELECT 
  wo.company_id,
  wo.payment_method,
  COUNT(*) as transaction_count,
  SUM(wo.payment_amount) as total_revenue,
  AVG(wo.payment_amount) as avg_transaction,
  MIN(wo.payment_amount) as min_transaction,
  MAX(wo.payment_amount) as max_transaction
FROM work_orders wo
WHERE wo.status = 'paid' 
  AND wo.paid_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY wo.company_id, wo.payment_method
ORDER BY total_revenue DESC;

-- View: Customer Lifetime Value (Based on Closed Work Orders)
CREATE OR REPLACE VIEW customer_lifetime_value AS
SELECT 
  wo.company_id,
  wo.customer_id,
  c.name as customer_name,
  c.email as customer_email,
  COUNT(*) as total_jobs,
  SUM(wo.total_amount) as lifetime_value,
  AVG(wo.total_amount) as avg_job_value,
  AVG(wo.customer_satisfaction_rating) FILTER (WHERE wo.customer_satisfaction_rating IS NOT NULL) as avg_satisfaction,
  MIN(wo.created_at) as first_job_date,
  MAX(wo.closed_at) as last_job_date,
  EXTRACT(EPOCH FROM (MAX(wo.closed_at) - MIN(wo.created_at)))/86400 as customer_tenure_days
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
WHERE wo.status = 'closed'
GROUP BY wo.company_id, wo.customer_id, c.name, c.email
ORDER BY lifetime_value DESC;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All invoice/payment workflow tracking columns added
-- All auto-timestamp triggers created
-- All analytics views created
-- ============================================================================

