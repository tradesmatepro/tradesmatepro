-- Fix marketplace_requests schema to match BookingForm expectations
-- Run this in Supabase SQL Editor

BEGIN;

-- Add missing columns that the BookingForm is trying to use
ALTER TABLE public.marketplace_requests 
ADD COLUMN IF NOT EXISTS preferred_time_option TEXT DEFAULT 'anytime' 
  CHECK (preferred_time_option IN ('anytime', 'soonest', 'this_week', 'weekend_only', 'specific')),
ADD COLUMN IF NOT EXISTS service_mode TEXT DEFAULT 'onsite' 
  CHECK (service_mode IN ('onsite', 'remote', 'hybrid')),
ADD COLUMN IF NOT EXISTS pricing_preference TEXT DEFAULT 'NEGOTIABLE' 
  CHECK (pricing_preference IN ('FLAT', 'HOURLY', 'NEGOTIABLE')),
ADD COLUMN IF NOT EXISTS flat_rate NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS requires_inspection BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS location_city TEXT,
ADD COLUMN IF NOT EXISTS location_state TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Update existing records to have default values
UPDATE public.marketplace_requests 
SET 
  preferred_time_option = 'anytime',
  service_mode = 'onsite',
  pricing_preference = 'NEGOTIABLE',
  requires_inspection = false
WHERE 
  preferred_time_option IS NULL 
  OR service_mode IS NULL 
  OR pricing_preference IS NULL 
  OR requires_inspection IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_requests_preferred_time ON public.marketplace_requests(preferred_time_option);
CREATE INDEX IF NOT EXISTS idx_marketplace_requests_service_mode ON public.marketplace_requests(service_mode);
CREATE INDEX IF NOT EXISTS idx_marketplace_requests_pricing_preference ON public.marketplace_requests(pricing_preference);
CREATE INDEX IF NOT EXISTS idx_marketplace_requests_postal_code ON public.marketplace_requests(postal_code);
CREATE INDEX IF NOT EXISTS idx_marketplace_requests_location_city ON public.marketplace_requests(location_city);

-- Add comment to track this fix
COMMENT ON TABLE public.marketplace_requests IS 'Updated schema to match BookingForm expectations - includes time preferences, service modes, pricing options, and location details';

COMMIT;
