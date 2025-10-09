-- =====================================================
-- Timesheet Approval Workflow Migration
-- =====================================================
-- This script adds approval workflow functionality to the employee_timesheets table
-- Run this in your Supabase SQL editor to enable the approval workflow

-- Add approval workflow columns to employee_timesheets table
ALTER TABLE public.employee_timesheets
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS denied_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS denied_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS denial_reason TEXT,
ADD COLUMN IF NOT EXISTS lunch_taken BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS lunch_override_minutes INTEGER NULL,
ADD COLUMN IF NOT EXISTS regular_hours NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_paid_hours NUMERIC(5,2) DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_timesheets_status ON public.employee_timesheets(status);
CREATE INDEX IF NOT EXISTS idx_employee_timesheets_approved_by ON public.employee_timesheets(approved_by);
CREATE INDEX IF NOT EXISTS idx_employee_timesheets_denied_by ON public.employee_timesheets(denied_by);

-- Update existing timesheets to have 'approved' status (so they appear in payroll)
-- You can change this to 'draft' if you want to require approval for existing timesheets
UPDATE public.employee_timesheets 
SET status = 'approved' 
WHERE status IS NULL;

-- Add default lunch minutes to companies table if not exists
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS default_lunch_minutes INTEGER DEFAULT 30;

-- Add comments to document the workflow
COMMENT ON COLUMN public.employee_timesheets.status IS 'Approval status: draft, submitted, approved, rejected';
COMMENT ON COLUMN public.employee_timesheets.submitted_at IS 'When timesheet was submitted for approval';
COMMENT ON COLUMN public.employee_timesheets.approved_by IS 'User ID who approved the timesheet';
COMMENT ON COLUMN public.employee_timesheets.approved_at IS 'When timesheet was approved';
COMMENT ON COLUMN public.employee_timesheets.denied_by IS 'User ID who rejected the timesheet';
COMMENT ON COLUMN public.employee_timesheets.denied_at IS 'When timesheet was rejected';
COMMENT ON COLUMN public.employee_timesheets.denial_reason IS 'Reason for rejection';
COMMENT ON COLUMN public.employee_timesheets.lunch_taken IS 'Whether employee took lunch break';
COMMENT ON COLUMN public.employee_timesheets.lunch_override_minutes IS 'Custom lunch minutes if different from company default';
COMMENT ON COLUMN public.employee_timesheets.regular_hours IS 'Calculated regular hours (up to 8 per day)';
COMMENT ON COLUMN public.employee_timesheets.total_paid_hours IS 'Total paid hours after lunch deduction';

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to verify the migration worked correctly:

-- Check that columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'employee_timesheets' 
AND column_name IN ('status', 'submitted_at', 'approved_by', 'approved_at', 'denied_by', 'denied_at', 'denial_reason')
ORDER BY column_name;

-- Check that indexes were created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'employee_timesheets' 
AND indexname LIKE 'idx_employee_timesheets_%';

-- Check status distribution
SELECT status, COUNT(*) as count
FROM public.employee_timesheets
GROUP BY status
ORDER BY status;

-- =====================================================
-- Additional Schema Notes for Payroll Approval Dashboard
-- =====================================================
-- The following columns are required for the approval dashboard:
-- ✅ status TEXT (pending, approved, denied) - ADDED ABOVE
-- ✅ approved_by UUID (references users.id) - ADDED ABOVE
-- ✅ approved_at TIMESTAMP - ADDED ABOVE
-- ✅ denied_at TIMESTAMP - ADDED ABOVE (as denied_at)
-- ✅ denial_reason TEXT - ADDED ABOVE

-- If you need to add these individually, use these statements:
/*
ALTER TABLE public.employee_timesheets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied'));
ALTER TABLE public.employee_timesheets ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id);
ALTER TABLE public.employee_timesheets ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.employee_timesheets ADD COLUMN IF NOT EXISTS denied_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.employee_timesheets ADD COLUMN IF NOT EXISTS denial_reason TEXT;
*/

-- =====================================================
-- Create Timesheet Reports View
-- =====================================================
-- This view simplifies reporting by joining all necessary data

CREATE OR REPLACE VIEW public.vw_timesheet_reports AS
SELECT
    ts.id,
    ts.company_id,
    ts.employee_id,
    u.full_name as employee_name,
    u.email as employee_email,
    ts.job_id,
    j.job_title,
    c.name as customer_name,
    ts.work_date,
    ts.clock_in,
    ts.clock_out,
    ts.break_minutes,
    ts.lunch_taken,
    ts.lunch_override_minutes,
    ts.regular_hours,
    ts.overtime_hours,
    ts.total_paid_hours,
    -- Calculate total hours if not stored
    COALESCE(
        ts.total_paid_hours,
        CASE
            WHEN ts.clock_in IS NOT NULL AND ts.clock_out IS NOT NULL THEN
                EXTRACT(EPOCH FROM (ts.clock_out - ts.clock_in)) / 3600 -
                COALESCE(ts.break_minutes, 0) / 60.0
            ELSE 0
        END
    ) as calculated_total_hours,
    ts.notes,
    ts.status,
    ts.submitted_at,
    ts.approved_by,
    ts.approved_at,
    ts.denied_by,
    ts.denied_at,
    ts.denial_reason,
    ts.created_at,
    ts.updated_at,
    -- Additional calculated fields
    EXTRACT(WEEK FROM ts.work_date) as work_week,
    EXTRACT(MONTH FROM ts.work_date) as work_month,
    EXTRACT(YEAR FROM ts.work_date) as work_year,
    DATE_TRUNC('week', ts.work_date) as week_start,
    DATE_TRUNC('month', ts.work_date) as month_start
FROM public.employee_timesheets ts
LEFT JOIN public.profiles u ON ts.employee_id = u.id
LEFT JOIN public.jobs j ON ts.job_id = j.id
LEFT JOIN public.customers c ON j.customer_id = c.id
WHERE ts.company_id IS NOT NULL;

-- Grant permissions on the view
GRANT SELECT ON public.vw_timesheet_reports TO authenticated;

-- Add comment to document the view
COMMENT ON VIEW public.vw_timesheet_reports IS 'Comprehensive timesheet reporting view with employee, job, and customer data';

-- =====================================================
-- Verification Query for the View
-- =====================================================
-- Test the view works correctly:
-- SELECT * FROM public.vw_timesheet_reports LIMIT 5;
