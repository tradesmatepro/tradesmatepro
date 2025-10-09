-- ========================================
-- ADD COMPLETION TRACKING FIELDS
-- ========================================
-- Purpose: Add fields to track job completion details
-- Part of: Fix #2 - CompletionModal integration

-- Add completion tracking columns
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS work_performed TEXT,
ADD COLUMN IF NOT EXISTS materials_used TEXT,
ADD COLUMN IF NOT EXISTS completion_notes TEXT,
ADD COLUMN IF NOT EXISTS customer_signature_url TEXT,
ADD COLUMN IF NOT EXISTS completion_photos JSONB DEFAULT '[]'::jsonb;

-- Add comments
COMMENT ON COLUMN work_orders.work_performed IS 'Summary of work completed (visible to customer)';
COMMENT ON COLUMN work_orders.materials_used IS 'List of materials used during job';
COMMENT ON COLUMN work_orders.completion_notes IS 'Internal completion notes (not visible to customer)';
COMMENT ON COLUMN work_orders.customer_signature_url IS 'URL to customer signature image (Phase 5)';
COMMENT ON COLUMN work_orders.completion_photos IS 'Array of photo URLs for before/after images (Phase 5)';

-- ========================================
-- ANALYTICS VIEWS
-- ========================================

-- View: Jobs Completed Today
CREATE OR REPLACE VIEW jobs_completed_today AS
SELECT 
  wo.id,
  wo.title,
  wo.company_id,
  wo.customer_id,
  c.name as customer_name,
  wo.completed_at,
  wo.started_at,
  EXTRACT(EPOCH FROM (wo.completed_at - wo.started_at))/3600 as actual_duration_hours,
  wo.work_performed,
  wo.materials_used,
  wo.total_amount,
  wo.status
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
WHERE wo.status = 'completed'
  AND DATE(wo.completed_at) = CURRENT_DATE
ORDER BY wo.completed_at DESC;

-- View: Average Job Duration by Company
CREATE OR REPLACE VIEW avg_job_duration_by_company AS
SELECT 
  company_id,
  COUNT(*) as completed_jobs,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/3600) as avg_duration_hours,
  MIN(EXTRACT(EPOCH FROM (completed_at - started_at))/3600) as min_duration_hours,
  MAX(EXTRACT(EPOCH FROM (completed_at - started_at))/3600) as max_duration_hours
FROM work_orders
WHERE status = 'completed'
  AND started_at IS NOT NULL
  AND completed_at IS NOT NULL
GROUP BY company_id;

-- View: Jobs Ready to Invoice
CREATE OR REPLACE VIEW jobs_ready_to_invoice AS
SELECT 
  wo.id,
  wo.title,
  wo.company_id,
  wo.customer_id,
  c.name as customer_name,
  c.email as customer_email,
  wo.completed_at,
  wo.total_amount,
  wo.work_performed,
  EXTRACT(DAY FROM (CURRENT_TIMESTAMP - wo.completed_at)) as days_since_completion
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
WHERE wo.status = 'completed'
ORDER BY wo.completed_at ASC;

-- View: Materials Usage Report
CREATE OR REPLACE VIEW materials_usage_report AS
SELECT 
  company_id,
  materials_used,
  COUNT(*) as times_used,
  AVG(total_amount) as avg_job_value,
  MAX(completed_at) as last_used
FROM work_orders
WHERE status = 'completed'
  AND materials_used IS NOT NULL
  AND materials_used != ''
GROUP BY company_id, materials_used
ORDER BY times_used DESC;

COMMENT ON VIEW jobs_completed_today IS 'All jobs completed today with duration and completion details';
COMMENT ON VIEW avg_job_duration_by_company IS 'Average job duration analytics by company';
COMMENT ON VIEW jobs_ready_to_invoice IS 'Completed jobs that need invoices created';
COMMENT ON VIEW materials_usage_report IS 'Materials usage frequency and job value correlation';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Completion tracking fields added successfully';
  RAISE NOTICE '✅ 4 analytics views created';
  RAISE NOTICE '📊 Views: jobs_completed_today, avg_job_duration_by_company, jobs_ready_to_invoice, materials_usage_report';
END $$;

