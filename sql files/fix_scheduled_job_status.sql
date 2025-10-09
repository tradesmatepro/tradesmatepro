-- Fix scheduled jobs that should be in WORK_ORDER stage but are still in JOB stage
-- Run this in Supabase SQL Editor

-- 1. First, let's see what jobs are scheduled but still in JOB stage
SELECT id, title, stage, job_status, work_status, start_time, end_time
FROM work_orders 
WHERE stage = 'JOB' 
  AND start_time IS NOT NULL 
  AND end_time IS NOT NULL;

-- 2. Update scheduled jobs to WORK_ORDER stage with ASSIGNED status
UPDATE work_orders 
SET 
  stage = 'WORK_ORDER',
  work_status = 'ASSIGNED',
  updated_at = NOW()
WHERE stage = 'JOB' 
  AND start_time IS NOT NULL 
  AND end_time IS NOT NULL;

-- 3. Ensure the trigger exists and is working
-- This is the simple trigger that should handle automatic stage transitions
CREATE OR REPLACE FUNCTION wo_stage_status_auto() RETURNS trigger AS $$
BEGIN
  -- Quote accepted → becomes a Job
  IF NEW.stage='QUOTE' AND NEW.quote_status='ACCEPTED' THEN
    NEW.stage := 'JOB';
    IF NEW.job_status IS NULL THEN NEW.job_status := 'DRAFT'; END IF;
  END IF;

  -- Revert acceptance while in JOB → back to Quote
  IF OLD.stage='JOB' AND NEW.quote_status IS DISTINCT FROM OLD.quote_status
     AND NEW.quote_status IN ('DRAFT','SENT','REJECTED','DECLINED','EXPIRED') THEN
    NEW.stage := 'QUOTE';
    NEW.job_status := NULL;
  END IF;

  -- Job scheduled (or times set) → becomes a Work Order
  IF NEW.stage='JOB' AND (NEW.job_status='SCHEDULED' OR (NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL)) THEN
    NEW.stage := 'WORK_ORDER';
    IF NEW.work_status IS NULL THEN NEW.work_status := 'ASSIGNED'; END IF;
  END IF;

  -- Unschedule Work Order (times cleared) → back to Job
  IF OLD.stage='WORK_ORDER' AND NEW.stage='WORK_ORDER' AND NEW.start_time IS NULL AND NEW.end_time IS NULL AND (NEW.work_status IS NULL OR NEW.work_status='CANCELLED') THEN
    NEW.stage := 'JOB';
    NEW.work_status := NULL;
  END IF;

  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- 4. Recreate the trigger
DROP TRIGGER IF EXISTS trg_wo_stage_status_auto ON work_orders;
CREATE TRIGGER trg_wo_stage_status_auto BEFORE UPDATE ON work_orders
FOR EACH ROW EXECUTE FUNCTION wo_stage_status_auto();

-- 5. Verify the fix worked
SELECT id, title, stage, job_status, work_status, start_time, end_time
FROM work_orders 
WHERE start_time IS NOT NULL 
  AND end_time IS NOT NULL
ORDER BY updated_at DESC;
