-- ============================================================================
-- ON HOLD TRACKING - Phase 2B
-- ============================================================================
-- Purpose: Track why jobs are put on hold and when they should resume
-- Industry Standard: ServiceTitan, Jobber, Housecall Pro all track this
-- Part of: Unified Pipeline Implementation (No Bandaids)
-- ============================================================================

-- Add on-hold tracking columns to work_orders
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS on_hold_reason text,
  ADD COLUMN IF NOT EXISTS on_hold_notes text,
  ADD COLUMN IF NOT EXISTS on_hold_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS on_hold_by uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS estimated_resume_date date,
  ADD COLUMN IF NOT EXISTS resumed_at timestamp with time zone;

-- Create index for querying on-hold jobs
CREATE INDEX IF NOT EXISTS idx_work_orders_on_hold 
  ON work_orders(status, on_hold_at) 
  WHERE status = 'on_hold';

-- Create index for estimated resume dates
CREATE INDEX IF NOT EXISTS idx_work_orders_estimated_resume 
  ON work_orders(estimated_resume_date) 
  WHERE status = 'on_hold' AND estimated_resume_date IS NOT NULL;

-- ============================================================================
-- TRIGGER: Auto-set on_hold_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION set_on_hold_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- When status changes TO 'on_hold', set on_hold_at
  IF NEW.status = 'on_hold' AND (OLD.status IS NULL OR OLD.status != 'on_hold') THEN
    NEW.on_hold_at = NOW();
  END IF;
  
  -- When status changes FROM 'on_hold' to something else, set resumed_at
  IF OLD.status = 'on_hold' AND NEW.status != 'on_hold' THEN
    NEW.resumed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_set_on_hold_timestamp ON work_orders;
CREATE TRIGGER trigger_set_on_hold_timestamp
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_on_hold_timestamp();

-- ============================================================================
-- VIEW: Jobs Ready to Resume
-- ============================================================================
-- Shows on-hold jobs that are past their estimated resume date
CREATE OR REPLACE VIEW jobs_ready_to_resume AS
SELECT
  wo.id,
  wo.work_order_number,
  wo.title,
  wo.on_hold_reason,
  wo.on_hold_notes,
  wo.on_hold_at,
  wo.estimated_resume_date,
  CURRENT_DATE - wo.estimated_resume_date AS days_overdue,
  c.company_name AS customer_name,
  c.email AS customer_email,
  c.phone AS customer_phone,
  wo.assigned_to AS assigned_technician_id
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
WHERE wo.status = 'on_hold'
  AND wo.estimated_resume_date IS NOT NULL
  AND wo.estimated_resume_date <= CURRENT_DATE
ORDER BY wo.estimated_resume_date ASC;

-- ============================================================================
-- VIEW: On-Hold Analytics
-- ============================================================================
-- Track common reasons for holds and average hold duration
CREATE OR REPLACE VIEW on_hold_analytics AS
SELECT 
  on_hold_reason,
  COUNT(*) AS total_holds,
  COUNT(*) FILTER (WHERE status = 'on_hold') AS currently_on_hold,
  COUNT(*) FILTER (WHERE resumed_at IS NOT NULL) AS resumed_count,
  AVG(
    CASE 
      WHEN resumed_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (resumed_at - on_hold_at)) / 86400 
      ELSE NULL 
    END
  ) AS avg_hold_duration_days,
  MIN(on_hold_at) AS first_occurrence,
  MAX(on_hold_at) AS last_occurrence
FROM work_orders
WHERE on_hold_at IS NOT NULL
GROUP BY on_hold_reason
ORDER BY total_holds DESC;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON COLUMN work_orders.on_hold_reason IS 'Reason why job was put on hold (e.g., awaiting_parts, customer_not_ready)';
COMMENT ON COLUMN work_orders.on_hold_notes IS 'Additional details about why job is on hold';
COMMENT ON COLUMN work_orders.on_hold_at IS 'Timestamp when job was put on hold';
COMMENT ON COLUMN work_orders.on_hold_by IS 'User who put the job on hold';
COMMENT ON COLUMN work_orders.estimated_resume_date IS 'Expected date when job can resume';
COMMENT ON COLUMN work_orders.resumed_at IS 'Timestamp when job was resumed from on-hold status';

COMMENT ON VIEW jobs_ready_to_resume IS 'On-hold jobs that are past their estimated resume date and ready to be rescheduled';
COMMENT ON VIEW on_hold_analytics IS 'Analytics on common hold reasons and average hold durations';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ On-hold tracking added successfully!';
  RAISE NOTICE '   - 6 new columns added to work_orders';
  RAISE NOTICE '   - Auto-set trigger created';
  RAISE NOTICE '   - 2 analytics views created';
  RAISE NOTICE '   - Ready for OnHoldModal integration';
END $$;

