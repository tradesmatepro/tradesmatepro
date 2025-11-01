-- Fix invoice status constraint to allow proper lifecycle states
-- Run this in Supabase SQL editor first

-- 1) Drop the old constraint that only allows UNPAID,PAID,OVERDUE,CANCELLED
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_status_check;

-- 2) Add new constraint with proper invoice lifecycle states
ALTER TABLE public.invoices 
ADD CONSTRAINT invoices_status_check 
CHECK (status IN ('DRAFT','SENT','UNPAID','OVERDUE','PARTIAL_PAID','PAID','CANCELLED'));

-- 3) Update any existing invoices with invalid statuses to UNPAID
UPDATE public.invoices 
SET status = 'UNPAID' 
WHERE status NOT IN ('DRAFT','SENT','UNPAID','OVERDUE','PARTIAL_PAID','PAID','CANCELLED');
