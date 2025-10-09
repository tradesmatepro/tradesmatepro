-- ========================================
-- ADD INVOICE CREATION TRACKING FIELDS
-- ========================================
-- Purpose: Add fields to track invoice creation details
-- Part of: Fix #3 - InvoiceCreationModal integration

-- Add invoice creation tracking columns
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS invoice_date DATE,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS invoice_notes TEXT,
ADD COLUMN IF NOT EXISTS invoice_sent_at TIMESTAMP WITH TIME ZONE;

-- Add comments
COMMENT ON COLUMN work_orders.invoice_date IS 'Date invoice was created';
COMMENT ON COLUMN work_orders.due_date IS 'Date payment is due';
COMMENT ON COLUMN work_orders.invoice_notes IS 'Notes visible to customer on invoice';
COMMENT ON COLUMN work_orders.invoice_sent_at IS 'Timestamp when invoice was sent to customer';

-- ========================================
-- TRIGGER: Auto-set invoiced_at timestamp
-- ========================================
-- Note: This trigger already exists from add_invoice_workflow_tracking.sql
-- Just ensuring it's present

CREATE OR REPLACE FUNCTION set_invoiced_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'invoiced' AND (OLD.status IS NULL OR OLD.status != 'invoiced') THEN
    NEW.invoiced_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_invoiced_timestamp ON work_orders;
CREATE TRIGGER trigger_set_invoiced_timestamp
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_invoiced_timestamp();

-- ========================================
-- ANALYTICS VIEWS
-- ========================================

-- View: Invoices Created Today
CREATE OR REPLACE VIEW invoices_created_today AS
SELECT 
  wo.id,
  wo.title,
  wo.company_id,
  wo.customer_id,
  c.name as customer_name,
  c.email as customer_email,
  wo.invoiced_at,
  wo.invoice_date,
  wo.due_date,
  wo.payment_terms,
  wo.total_amount,
  wo.invoice_sent_at,
  CASE 
    WHEN wo.invoice_sent_at IS NOT NULL THEN 'Sent'
    ELSE 'Draft'
  END as invoice_status
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
WHERE wo.status = 'invoiced'
  AND DATE(wo.invoiced_at) = CURRENT_DATE
ORDER BY wo.invoiced_at DESC;

-- View: Outstanding Invoices (Updated)
CREATE OR REPLACE VIEW outstanding_invoices_detailed AS
SELECT
  wo.id,
  wo.title,
  wo.company_id,
  wo.customer_id,
  c.name as customer_name,
  c.email as customer_email,
  c.phone as customer_phone,
  wo.invoice_date,
  wo.due_date,
  wo.invoiced_at,
  wo.total_amount,
  wo.payment_terms,
  (CURRENT_DATE - wo.due_date) as days_overdue,
  CASE
    WHEN wo.due_date < CURRENT_DATE THEN 'Overdue'
    WHEN wo.due_date = CURRENT_DATE THEN 'Due Today'
    WHEN wo.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'Due Soon'
    ELSE 'Not Due'
  END as urgency
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
WHERE wo.status = 'invoiced'
ORDER BY wo.due_date ASC;

-- View: Invoice Aging Report
CREATE OR REPLACE VIEW invoice_aging_report AS
SELECT 
  company_id,
  COUNT(*) as total_invoices,
  SUM(total_amount) as total_outstanding,
  SUM(CASE WHEN due_date >= CURRENT_DATE THEN total_amount ELSE 0 END) as current_amount,
  SUM(CASE WHEN due_date < CURRENT_DATE AND due_date >= CURRENT_DATE - INTERVAL '30 days' THEN total_amount ELSE 0 END) as overdue_0_30_days,
  SUM(CASE WHEN due_date < CURRENT_DATE - INTERVAL '30 days' AND due_date >= CURRENT_DATE - INTERVAL '60 days' THEN total_amount ELSE 0 END) as overdue_31_60_days,
  SUM(CASE WHEN due_date < CURRENT_DATE - INTERVAL '60 days' AND due_date >= CURRENT_DATE - INTERVAL '90 days' THEN total_amount ELSE 0 END) as overdue_61_90_days,
  SUM(CASE WHEN due_date < CURRENT_DATE - INTERVAL '90 days' THEN total_amount ELSE 0 END) as overdue_90_plus_days
FROM work_orders
WHERE status = 'invoiced'
GROUP BY company_id;

-- View: Average Days to Invoice
CREATE OR REPLACE VIEW avg_days_to_invoice AS
SELECT 
  company_id,
  COUNT(*) as jobs_invoiced,
  AVG(EXTRACT(DAY FROM (invoiced_at - completed_at))) as avg_days_to_invoice,
  MIN(EXTRACT(DAY FROM (invoiced_at - completed_at))) as min_days_to_invoice,
  MAX(EXTRACT(DAY FROM (invoiced_at - completed_at))) as max_days_to_invoice
FROM work_orders
WHERE status IN ('invoiced', 'paid', 'closed')
  AND completed_at IS NOT NULL
  AND invoiced_at IS NOT NULL
GROUP BY company_id;

-- View: Invoice Send Rate
CREATE OR REPLACE VIEW invoice_send_rate AS
SELECT 
  company_id,
  COUNT(*) as total_invoices,
  COUNT(invoice_sent_at) as invoices_sent,
  ROUND(100.0 * COUNT(invoice_sent_at) / NULLIF(COUNT(*), 0), 2) as send_rate_percent,
  AVG(EXTRACT(EPOCH FROM (invoice_sent_at - invoiced_at))/3600) as avg_hours_to_send
FROM work_orders
WHERE status IN ('invoiced', 'paid', 'closed')
  AND invoiced_at IS NOT NULL
GROUP BY company_id;

COMMENT ON VIEW invoices_created_today IS 'All invoices created today with send status';
COMMENT ON VIEW outstanding_invoices_detailed IS 'Detailed view of all outstanding invoices with aging and urgency';
COMMENT ON VIEW invoice_aging_report IS 'Invoice aging buckets by company (0-30, 31-60, 61-90, 90+ days)';
COMMENT ON VIEW avg_days_to_invoice IS 'Average time from job completion to invoice creation';
COMMENT ON VIEW invoice_send_rate IS 'Percentage of invoices sent immediately vs saved as draft';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Invoice creation tracking fields added successfully';
  RAISE NOTICE '✅ 5 analytics views created';
  RAISE NOTICE '📊 Views: invoices_created_today, outstanding_invoices_detailed, invoice_aging_report, avg_days_to_invoice, invoice_send_rate';
END $$;

