-- ========================================
-- ADD CUSTOMER RATING & PORTAL COLUMNS
-- ========================================
-- Add missing columns that the UI expects
-- ========================================

-- Add rating column to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5);

-- Add has_portal_account column to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS has_portal_account BOOLEAN DEFAULT FALSE;

-- Add comments
COMMENT ON COLUMN public.customers.rating IS 'Customer rating from 0.0 to 5.0 based on service feedback';
COMMENT ON COLUMN public.customers.has_portal_account IS 'Whether customer has been invited to and has access to the customer portal';

-- Create index for rating queries
CREATE INDEX IF NOT EXISTS idx_customers_rating ON public.customers(rating) WHERE rating > 0;

-- Create index for portal account queries
CREATE INDEX IF NOT EXISTS idx_customers_portal_account ON public.customers(has_portal_account) WHERE has_portal_account = TRUE;

