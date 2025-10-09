-- ============================================================================
-- URGENT: FIX 400 ERRORS - Run this in Supabase SQL Editor IMMEDIATELY
-- ============================================================================
-- This fixes the confirmed root cause of your 400 Bad Request errors
-- ============================================================================

-- FIX 1: Add missing created_via column to customers table
-- This is causing: "Could not find the 'created_via' column of 'customers' in the schema cache"
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS created_via TEXT DEFAULT 'manual'
CHECK (created_via IN ('manual', 'self_signup', 'contractor_invite'));

-- Update existing records to have the default value
UPDATE public.customers 
SET created_via = 'manual' 
WHERE created_via IS NULL;

-- FIX 2: Ensure customer_portal_accounts has all required columns
-- The table exists but is missing key columns the app expects
ALTER TABLE public.customer_portal_accounts 
ADD COLUMN IF NOT EXISTS auth_user_id UUID,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS needs_password_setup BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS invitation_token TEXT,
ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invited_by UUID;

-- FIX 3: Add foreign key constraints with the names the app expects
-- This fixes relationship embedding errors
DO $$
BEGIN
    -- Add auth_user_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'customer_portal_accounts_auth_user_id_fkey'
        AND table_name = 'customer_portal_accounts'
    ) THEN
        ALTER TABLE public.customer_portal_accounts 
        ADD CONSTRAINT customer_portal_accounts_auth_user_id_fkey 
        FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Ensure customer_id foreign key has the expected name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'customer_portal_accounts_customer_id_fkey'
        AND table_name = 'customer_portal_accounts'
    ) THEN
        -- Drop any existing foreign key on customer_id first
        ALTER TABLE public.customer_portal_accounts 
        DROP CONSTRAINT IF EXISTS customer_portal_accounts_customer_id_fkey1;
        
        -- Add with the expected name
        ALTER TABLE public.customer_portal_accounts 
        ADD CONSTRAINT customer_portal_accounts_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
    END IF;

    -- Add invited_by foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'customer_portal_accounts_invited_by_fkey'
        AND table_name = 'customer_portal_accounts'
    ) THEN
        ALTER TABLE public.customer_portal_accounts 
        ADD CONSTRAINT customer_portal_accounts_invited_by_fkey 
        FOREIGN KEY (invited_by) REFERENCES public.companies(id);
    END IF;
END $$;

-- FIX 4: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_customers_created_via ON public.customers(created_via);
CREATE INDEX IF NOT EXISTS idx_customer_portal_accounts_auth_user ON public.customer_portal_accounts(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_customer_portal_accounts_email ON public.customer_portal_accounts(email);
CREATE INDEX IF NOT EXISTS idx_customer_portal_accounts_active ON public.customer_portal_accounts(is_active) WHERE is_active = true;

-- ============================================================================
-- VERIFICATION - Run these to confirm fixes worked
-- ============================================================================

-- Verify created_via column exists
SELECT 'created_via column check:' as check_type, 
       CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'created_via';

-- Verify foreign key exists with correct name
SELECT 'foreign key check:' as check_type,
       CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.table_constraints 
WHERE constraint_name = 'customer_portal_accounts_customer_id_fkey';

-- Show customer_portal_accounts structure
SELECT 'portal accounts columns:' as info, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'customer_portal_accounts' 
ORDER BY ordinal_position;

-- ============================================================================
-- AFTER RUNNING THIS SQL:
-- 1. Customer Portal signup should work without 400 errors
-- 2. Relationship embedding should work
-- 3. Test the signup flow immediately
-- ============================================================================
