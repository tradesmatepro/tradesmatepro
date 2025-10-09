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
ADD COLUMN IF NOT EXISTS denial_reason TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_timesheets_status ON public.employee_timesheets(status);
CREATE INDEX IF NOT EXISTS idx_employee_timesheets_approved_by ON public.employee_timesheets(approved_by);
CREATE INDEX IF NOT EXISTS idx_employee_timesheets_denied_by ON public.employee_timesheets(denied_by);

-- Update existing timesheets to have 'approved' status (so they appear in payroll)
-- You can change this to 'draft' if you want to require approval for existing timesheets
UPDATE public.employee_timesheets 
SET status = 'approved' 
WHERE status IS NULL;

-- Add comment to document the workflow
COMMENT ON COLUMN public.employee_timesheets.status IS 'Approval status: draft, submitted, approved, rejected';
COMMENT ON COLUMN public.employee_timesheets.submitted_at IS 'When timesheet was submitted for approval';
COMMENT ON COLUMN public.employee_timesheets.approved_by IS 'User ID who approved the timesheet';
COMMENT ON COLUMN public.employee_timesheets.approved_at IS 'When timesheet was approved';
COMMENT ON COLUMN public.employee_timesheets.denied_by IS 'User ID who rejected the timesheet';
COMMENT ON COLUMN public.employee_timesheets.denied_at IS 'When timesheet was rejected';
COMMENT ON COLUMN public.employee_timesheets.denial_reason IS 'Reason for rejection';

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
-- Notes
-- =====================================================
-- After running this migration:
-- 1. Existing timesheets will be marked as 'approved' (included in payroll)
-- 2. New timesheets will default to 'draft' status
-- 3. Employees can submit timesheets for approval
-- 4. Admins/Owners can approve or reject submitted timesheets
-- 5. Only approved timesheets will be included in payroll calculations
-- 6. The approval workflow UI will be fully functional
