-- Fix the missing preferred_time_option column in marketplace_requests table
-- This column is needed by BookingForm.js but doesn't exist in the database

-- Add the missing column with proper constraints
ALTER TABLE public.marketplace_requests 
ADD COLUMN IF NOT EXISTS preferred_time_option TEXT DEFAULT 'anytime' 
CHECK (preferred_time_option IN ('anytime', 'soonest', 'this_week', 'weekend_only', 'specific'));

-- Verify the column was added
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'marketplace_requests' 
AND column_name = 'preferred_time_option';
