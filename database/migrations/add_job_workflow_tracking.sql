-- ============================================================================
-- PHASE 3B: JOB WORKFLOW TRACKING COLUMNS
-- ============================================================================
-- Purpose: Add tracking columns for job status transitions
-- Date: 2025-10-03
-- Modals: StartJob, ResumeJob
-- ============================================================================

-- ============================================================================
-- 1. START JOB TRACKING
-- ============================================================================
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS started_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS start_notes text,
  ADD COLUMN IF NOT EXISTS timer_enabled boolean DEFAULT false;

-- ============================================================================
-- 2. RESUME JOB TRACKING
-- ============================================================================
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS resumed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS on_hold_issue_resolved boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS resume_notes text;

-- ============================================================================
-- 3. AUTO-TIMESTAMP TRIGGERS
-- ============================================================================

-- Trigger: Auto-set started_at when status changes to 'in_progress'
CREATE OR REPLACE FUNCTION set_started_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'in_progress' AND (OLD.status IS NULL OR OLD.status != 'in_progress') THEN
    IF NEW.started_at IS NULL THEN
      NEW.started_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_started_timestamp ON work_orders;
CREATE TRIGGER trigger_set_started_timestamp
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_started_timestamp();

-- Trigger: Auto-set resumed_at when status changes from 'on_hold' to 'scheduled' or 'in_progress'
CREATE OR REPLACE FUNCTION set_resumed_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'on_hold' AND NEW.status IN ('scheduled', 'in_progress') THEN
    IF NEW.resumed_at IS NULL THEN
      NEW.resumed_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_resumed_timestamp ON work_orders;
CREATE TRIGGER trigger_set_resumed_timestamp
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_resumed_timestamp();

-- ============================================================================
-- 4. ANALYTICS VIEWS
-- ============================================================================

-- View: Jobs Started Today
CREATE OR REPLACE VIEW jobs_started_today AS
SELECT 
  wo.id,
  wo.title,
  wo.company_id,
  wo.customer_id,
  c.name as customer_name,
  wo.employee_id,
  wo.started_at,
  wo.scheduled_start,
  EXTRACT(EPOCH FROM (wo.started_at - wo.scheduled_start))/60 as minutes_late_or_early,
  wo.start_notes,
  wo.timer_enabled
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
WHERE wo.status = 'in_progress' 
  AND DATE(wo.started_at) = CURRENT_DATE
ORDER BY wo.started_at DESC;

-- View: Jobs Resumed from Hold
CREATE OR REPLACE VIEW jobs_resumed_from_hold AS
SELECT 
  wo.id,
  wo.title,
  wo.company_id,
  wo.customer_id,
  c.name as customer_name,
  wo.on_hold_at,
  wo.resumed_at,
  EXTRACT(EPOCH FROM (wo.resumed_at - wo.on_hold_at))/3600 as hours_on_hold,
  wo.on_hold_reason,
  wo.on_hold_notes,
  wo.on_hold_issue_resolved,
  wo.resume_notes,
  wo.status as current_status
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
WHERE wo.resumed_at IS NOT NULL
ORDER BY wo.resumed_at DESC;

-- View: Job Start Time Performance (Early/Late/On-Time)
CREATE OR REPLACE VIEW job_start_performance AS
SELECT 
  wo.company_id,
  wo.employee_id,
  COUNT(*) as total_jobs_started,
  COUNT(*) FILTER (WHERE wo.started_at < wo.scheduled_start) as started_early,
  COUNT(*) FILTER (WHERE wo.started_at > wo.scheduled_start + INTERVAL '15 minutes') as started_late,
  COUNT(*) FILTER (WHERE wo.started_at BETWEEN wo.scheduled_start AND wo.scheduled_start + INTERVAL '15 minutes') as started_on_time,
  AVG(EXTRACT(EPOCH FROM (wo.started_at - wo.scheduled_start))/60) as avg_minutes_variance,
  MIN(wo.started_at) as first_job_started,
  MAX(wo.started_at) as last_job_started
FROM work_orders wo
WHERE wo.started_at IS NOT NULL 
  AND wo.scheduled_start IS NOT NULL
GROUP BY wo.company_id, wo.employee_id
ORDER BY total_jobs_started DESC;

-- View: On-Hold Resolution Time Analysis
CREATE OR REPLACE VIEW on_hold_resolution_analysis AS
SELECT 
  wo.company_id,
  wo.on_hold_reason,
  COUNT(*) as total_holds,
  COUNT(*) FILTER (WHERE wo.on_hold_issue_resolved = true) as resolved_count,
  COUNT(*) FILTER (WHERE wo.on_hold_issue_resolved = false OR wo.on_hold_issue_resolved IS NULL) as unresolved_count,
  AVG(EXTRACT(EPOCH FROM (wo.resumed_at - wo.on_hold_at))/3600) FILTER (WHERE wo.resumed_at IS NOT NULL) as avg_hours_to_resolve,
  MIN(EXTRACT(EPOCH FROM (wo.resumed_at - wo.on_hold_at))/3600) FILTER (WHERE wo.resumed_at IS NOT NULL) as min_hours_to_resolve,
  MAX(EXTRACT(EPOCH FROM (wo.resumed_at - wo.on_hold_at))/3600) FILTER (WHERE wo.resumed_at IS NOT NULL) as max_hours_to_resolve
FROM work_orders wo
WHERE wo.on_hold_at IS NOT NULL
GROUP BY wo.company_id, wo.on_hold_reason
ORDER BY total_holds DESC;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All job workflow tracking columns added
-- All auto-timestamp triggers created
-- All analytics views created
-- ============================================================================

