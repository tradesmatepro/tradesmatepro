-- Fix schedule_events table: Add missing columns for customer scheduling
-- Run this to fix the "column does not exist" error in approve_and_schedule_work_order RPC

-- Add created_by_customer column (tracks if customer scheduled this vs. company)
ALTER TABLE schedule_events 
ADD COLUMN IF NOT EXISTS created_by_customer BOOLEAN DEFAULT FALSE;

-- Add auto_scheduled column (tracks if this was auto-scheduled vs. manually selected)
ALTER TABLE schedule_events 
ADD COLUMN IF NOT EXISTS auto_scheduled BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN schedule_events.created_by_customer IS 'TRUE if customer scheduled this via quote approval portal, FALSE if company scheduled';
COMMENT ON COLUMN schedule_events.auto_scheduled IS 'TRUE if auto-scheduled (ASAP), FALSE if customer/company manually selected time';

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'schedule_events' 
  AND column_name IN ('created_by_customer', 'auto_scheduled')
ORDER BY column_name;

