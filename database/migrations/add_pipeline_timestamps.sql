-- =====================================================
-- PHASE 1: PIPELINE TIMESTAMPS & TRIGGERS
-- =====================================================
-- Purpose: Add missing timestamp columns and auto-set triggers
-- Date: 2025-10-02
-- Part of: Unified Pipeline Implementation (No Bandaids)
-- =====================================================

-- =====================================================
-- STEP 1: Add Missing Timestamp Columns
-- =====================================================

ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS presented_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS started_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS invoiced_at timestamp with time zone;

COMMENT ON COLUMN work_orders.presented_at IS 'Timestamp when quote was presented in person to customer';
COMMENT ON COLUMN work_orders.started_at IS 'Timestamp when job status changed to in_progress';
COMMENT ON COLUMN work_orders.completed_at IS 'Timestamp when job status changed to completed';
COMMENT ON COLUMN work_orders.invoiced_at IS 'Timestamp when job status changed to invoiced';

-- =====================================================
-- STEP 2: Create Trigger Functions
-- =====================================================

-- Trigger: Auto-set presented_at when status changes to 'presented'
CREATE OR REPLACE FUNCTION set_presented_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set if status is changing TO 'presented' and timestamp is not already set
  IF NEW.status = 'presented' AND OLD.status != 'presented' AND NEW.presented_at IS NULL THEN
    NEW.presented_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-set started_at when status changes to 'in_progress'
CREATE OR REPLACE FUNCTION set_started_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set if status is changing TO 'in_progress' and timestamp is not already set
  IF NEW.status = 'in_progress' AND OLD.status != 'in_progress' AND NEW.started_at IS NULL THEN
    NEW.started_at = NOW();
    
    -- Also set actual_start if not already set
    IF NEW.actual_start IS NULL THEN
      NEW.actual_start = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-set completed_at when status changes to 'completed'
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set if status is changing TO 'completed' and timestamp is not already set
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.completed_at IS NULL THEN
    NEW.completed_at = NOW();
    
    -- Also set actual_end if not already set
    IF NEW.actual_end IS NULL THEN
      NEW.actual_end = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-set invoiced_at when status changes to 'invoiced'
CREATE OR REPLACE FUNCTION set_invoiced_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set if status is changing TO 'invoiced' and timestamp is not already set
  IF NEW.status = 'invoiced' AND OLD.status != 'invoiced' AND NEW.invoiced_at IS NULL THEN
    NEW.invoiced_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 3: Attach Triggers to work_orders Table
-- =====================================================

-- Drop existing triggers if they exist (idempotent)
DROP TRIGGER IF EXISTS trigger_set_presented_at ON work_orders;
DROP TRIGGER IF EXISTS trigger_set_started_at ON work_orders;
DROP TRIGGER IF EXISTS trigger_set_completed_at ON work_orders;
DROP TRIGGER IF EXISTS trigger_set_invoiced_at ON work_orders;

-- Create triggers
CREATE TRIGGER trigger_set_presented_at
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_presented_at();

CREATE TRIGGER trigger_set_started_at
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_started_at();

CREATE TRIGGER trigger_set_completed_at
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_completed_at();

CREATE TRIGGER trigger_set_invoiced_at
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_invoiced_at();

-- =====================================================
-- STEP 4: Create Audit Trail View
-- =====================================================

-- View: Complete audit trail for work orders
CREATE OR REPLACE VIEW work_order_audit_trail AS
SELECT 
  id,
  job_number,
  job_title,
  status,
  created_at,
  quote_sent_at,
  presented_at,
  quote_accepted_at,
  quote_rejected_at,
  customer_approved_at,
  scheduled_start,
  started_at,
  actual_start,
  scheduled_end,
  completed_at,
  actual_end,
  invoiced_at,
  invoice_sent_at,
  paid_at,
  closed_at,
  cancelled_at,
  rescheduling_requested_at,
  -- Calculate durations
  CASE 
    WHEN started_at IS NOT NULL AND completed_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (completed_at - started_at)) / 60 
  END AS actual_duration_minutes,
  CASE 
    WHEN scheduled_start IS NOT NULL AND scheduled_end IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (scheduled_end - scheduled_start)) / 60 
  END AS scheduled_duration_minutes,
  -- Calculate time differences
  CASE 
    WHEN quote_sent_at IS NOT NULL AND quote_accepted_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (quote_accepted_at - quote_sent_at)) / 3600 
  END AS hours_to_accept_quote,
  CASE 
    WHEN completed_at IS NOT NULL AND invoiced_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (invoiced_at - completed_at)) / 3600 
  END AS hours_to_invoice,
  CASE 
    WHEN invoiced_at IS NOT NULL AND paid_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (paid_at - invoiced_at)) / 86400 
  END AS days_to_payment
FROM work_orders;

COMMENT ON VIEW work_order_audit_trail IS 'Complete audit trail showing all timestamps and calculated durations for work orders';

-- =====================================================
-- STEP 5: Create Analytics View
-- =====================================================

-- View: Pipeline performance metrics
CREATE OR REPLACE VIEW pipeline_performance_metrics AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'sent') AS quotes_sent,
  COUNT(*) FILTER (WHERE status = 'presented') AS quotes_presented,
  COUNT(*) FILTER (WHERE status = 'approved') AS quotes_approved,
  COUNT(*) FILTER (WHERE status = 'scheduled') AS jobs_scheduled,
  COUNT(*) FILTER (WHERE status = 'in_progress') AS jobs_in_progress,
  COUNT(*) FILTER (WHERE status = 'completed') AS jobs_completed,
  COUNT(*) FILTER (WHERE status = 'invoiced') AS jobs_invoiced,
  COUNT(*) FILTER (WHERE status = 'paid') AS jobs_paid,
  COUNT(*) FILTER (WHERE status = 'closed') AS jobs_closed,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS jobs_cancelled,
  
  -- Average times
  AVG(EXTRACT(EPOCH FROM (quote_accepted_at - quote_sent_at)) / 3600) 
    FILTER (WHERE quote_sent_at IS NOT NULL AND quote_accepted_at IS NOT NULL) 
    AS avg_hours_to_accept_quote,
  
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 60) 
    FILTER (WHERE started_at IS NOT NULL AND completed_at IS NOT NULL) 
    AS avg_minutes_job_duration,
  
  AVG(EXTRACT(EPOCH FROM (invoiced_at - completed_at)) / 3600) 
    FILTER (WHERE completed_at IS NOT NULL AND invoiced_at IS NOT NULL) 
    AS avg_hours_to_invoice,
  
  AVG(EXTRACT(EPOCH FROM (paid_at - invoiced_at)) / 86400) 
    FILTER (WHERE invoiced_at IS NOT NULL AND paid_at IS NOT NULL) 
    AS avg_days_to_payment,
  
  -- Conversion rates
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status IN ('approved', 'scheduled', 'in_progress', 'completed', 'invoiced', 'paid', 'closed')) / 
    NULLIF(COUNT(*) FILTER (WHERE status IN ('sent', 'presented', 'approved', 'scheduled', 'in_progress', 'completed', 'invoiced', 'paid', 'closed', 'rejected')), 0),
    2
  ) AS quote_conversion_rate_percent
  
FROM work_orders
WHERE created_at >= NOW() - INTERVAL '30 days';

COMMENT ON VIEW pipeline_performance_metrics IS 'Pipeline performance metrics for the last 30 days';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check that columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'work_orders'
  AND column_name IN ('presented_at', 'started_at', 'completed_at', 'invoiced_at')
ORDER BY column_name;

-- Check that triggers were created
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'work_orders'
  AND trigger_name LIKE 'trigger_set_%'
ORDER BY trigger_name;

-- Check that views were created
SELECT table_name, view_definition
FROM information_schema.views
WHERE table_name IN ('work_order_audit_trail', 'pipeline_performance_metrics');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Phase 1 Complete: Timestamps & Triggers';
  RAISE NOTICE '   - Added 4 timestamp columns';
  RAISE NOTICE '   - Created 4 auto-set triggers';
  RAISE NOTICE '   - Created audit trail view';
  RAISE NOTICE '   - Created performance metrics view';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next: Test timestamp updates by changing work_order statuses';
END $$;

