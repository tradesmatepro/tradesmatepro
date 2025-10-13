-- Add quote-level override columns to work_orders table
-- These allow per-quote customization of scheduling and deposit requirements
-- (Overrides company-wide default settings)

-- Scheduling overrides
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS scheduling_mode TEXT DEFAULT 'customer_choice';

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS custom_availability_days TEXT[];

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS custom_availability_hours_start TIME;

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS custom_availability_hours_end TIME;

-- Deposit overrides
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS deposit_required_before_scheduling BOOLEAN DEFAULT FALSE;

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS allowed_payment_methods TEXT[];

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS deposit_payment_method TEXT;

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMPTZ;

-- Add check constraint for scheduling_mode
ALTER TABLE work_orders 
ADD CONSTRAINT chk_scheduling_mode 
CHECK (scheduling_mode IN ('customer_choice', 'company_schedules', 'auto_schedule'));

-- Add comments for documentation
COMMENT ON COLUMN work_orders.scheduling_mode IS 'How this quote should be scheduled: customer_choice (default), company_schedules (no customer input), auto_schedule (ASAP)';
COMMENT ON COLUMN work_orders.custom_availability_days IS 'Override business days for this quote (e.g., {saturday,sunday} for emergency work)';
COMMENT ON COLUMN work_orders.custom_availability_hours_start IS 'Override business hours start for this quote';
COMMENT ON COLUMN work_orders.custom_availability_hours_end IS 'Override business hours end for this quote';
COMMENT ON COLUMN work_orders.deposit_required_before_scheduling IS 'If TRUE, customer must pay deposit before seeing scheduling options';
COMMENT ON COLUMN work_orders.allowed_payment_methods IS 'Restrict payment methods for this quote (e.g., {online} for emergency jobs)';
COMMENT ON COLUMN work_orders.deposit_payment_method IS 'What customer selected: online, cash, check, prepaid';
COMMENT ON COLUMN work_orders.deposit_paid_at IS 'When deposit was actually paid (NULL if not paid yet)';

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'work_orders' 
  AND column_name IN (
    'scheduling_mode', 
    'custom_availability_days', 
    'custom_availability_hours_start', 
    'custom_availability_hours_end',
    'deposit_required_before_scheduling',
    'allowed_payment_methods',
    'deposit_payment_method',
    'deposit_paid_at'
  )
ORDER BY column_name;

