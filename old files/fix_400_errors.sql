-- ============================================================================
-- IMMEDIATE FIX FOR 400 ERRORS - TradeMate Pro & Customer Portal
-- ============================================================================
-- These fixes resolve the specific 400 Bad Request errors you're seeing
-- Run this IMMEDIATELY to fix the Customer Portal signup and login issues
-- ============================================================================

-- BACKUP REMINDER: Always backup before schema changes
-- pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql

-- ============================================================================
-- FIX 1: Add missing created_via column to customers table
-- ============================================================================
-- This fixes the 400 error: "Could not find the 'created_via' column"

ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS created_via TEXT DEFAULT 'manual' 
CHECK (created_via IN ('manual', 'self_signup', 'contractor_invite', 'contractor_created'));

-- Update existing records to have a default value
UPDATE public.customers 
SET created_via = 'manual' 
WHERE created_via IS NULL;

-- ============================================================================
-- FIX 2: Ensure customer_portal_accounts has proper foreign key
-- ============================================================================
-- This fixes relationship embedding errors

-- Check if the foreign key exists with the expected name
DO $$
BEGIN
    -- Add foreign key if it doesn't exist with the expected name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'customer_portal_accounts_customer_id_fkey'
        AND table_name = 'customer_portal_accounts'
    ) THEN
        -- Drop any existing foreign key on customer_id
        ALTER TABLE public.customer_portal_accounts 
        DROP CONSTRAINT IF EXISTS customer_portal_accounts_customer_id_fkey;
        
        -- Add the foreign key with the expected name
        ALTER TABLE public.customer_portal_accounts 
        ADD CONSTRAINT customer_portal_accounts_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- FIX 3: Ensure all required columns exist in customer_portal_accounts
-- ============================================================================

-- Add missing columns that the app expects
ALTER TABLE public.customer_portal_accounts 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_via TEXT DEFAULT 'contractor_invite',
ADD COLUMN IF NOT EXISTS needs_password_setup BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS invitation_token TEXT,
ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES public.companies(id);

-- ============================================================================
-- FIX 4: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_customers_created_via ON public.customers(created_via);
CREATE INDEX IF NOT EXISTS idx_customer_portal_accounts_auth_user ON public.customer_portal_accounts(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_customer_portal_accounts_email ON public.customer_portal_accounts(email);
CREATE INDEX IF NOT EXISTS idx_customer_portal_accounts_active ON public.customer_portal_accounts(is_active) WHERE is_active = true;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the fixes worked

-- Check that created_via column exists
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'created_via';

-- Check foreign key exists with correct name
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE constraint_name = 'customer_portal_accounts_customer_id_fkey';

-- Check customer_portal_accounts structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'customer_portal_accounts' 
ORDER BY ordinal_position;

-- ============================================================================
-- NOTES
-- ============================================================================
-- After running this script:
-- 1. Customer Portal signup should work (no more created_via errors)
-- 2. Relationship embedding should work (proper foreign key names)
-- 3. Portal account creation should work (all required columns exist)
-- 4. Test the Customer Portal signup flow immediately
-- ============================================================================
