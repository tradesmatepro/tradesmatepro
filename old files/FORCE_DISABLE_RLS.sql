-- ============================================
-- FORCE DISABLE RLS - Emergency Fix
-- Run this to forcefully disable RLS on all tables
-- ============================================

-- 1. Force disable RLS on all core tables
ALTER TABLE IF EXISTS public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.work_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoice_line_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.work_order_audit_log DISABLE ROW LEVEL SECURITY;

-- 2. Force disable RLS on settings tables (if they exist)
ALTER TABLE IF EXISTS public.business_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.integration_settings DISABLE ROW LEVEL SECURITY;

-- 3. Create business_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    enable_auto_invoice BOOLEAN DEFAULT false,
    default_tax_rate NUMERIC(5,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id)
);

-- 4. Create integration_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.integration_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    api_key TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, service_name)
);

-- 5. Disable RLS on newly created tables
ALTER TABLE public.business_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_settings DISABLE ROW LEVEL SECURITY;

-- 6. Add missing columns to companies if they don't exist
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS invoice_prefix TEXT DEFAULT 'INV',
ADD COLUMN IF NOT EXISTS invoice_start_number INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS address JSONB,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 7. Add missing columns to users if they don't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- 8. Create business_settings record for the failing company
INSERT INTO public.business_settings (company_id, enable_auto_invoice, default_tax_rate, currency)
SELECT 'd8b9c013-fbc2-41d0-8957-8bfb887fe419', false, 0.0, 'USD'
WHERE NOT EXISTS (
    SELECT 1 FROM public.business_settings 
    WHERE company_id = 'd8b9c013-fbc2-41d0-8957-8bfb887fe419'
);

-- 9. Update the failing company with default values
UPDATE public.companies 
SET invoice_prefix = COALESCE(invoice_prefix, 'INV'),
    invoice_start_number = COALESCE(invoice_start_number, 1),
    timezone = COALESCE(timezone, 'UTC')
WHERE id = 'd8b9c013-fbc2-41d0-8957-8bfb887fe419';

-- 10. Grant permissions to authenticated role (if needed)
GRANT ALL ON public.business_settings TO authenticated;
GRANT ALL ON public.integration_settings TO authenticated;
GRANT ALL ON public.companies TO authenticated;
GRANT ALL ON public.users TO authenticated;

-- 11. Grant permissions to service_role (if needed)
GRANT ALL ON public.business_settings TO service_role;
GRANT ALL ON public.integration_settings TO service_role;
GRANT ALL ON public.companies TO service_role;
GRANT ALL ON public.users TO service_role;

-- 12. Verification - Check RLS status after fix
SELECT 'FINAL RLS CHECK' as test_type,
       tablename, 
       rowsecurity as rls_enabled,
       CASE WHEN rowsecurity THEN 'STILL ON (PROBLEM)' ELSE 'OFF (FIXED)' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('companies', 'users', 'business_settings', 'integration_settings')
ORDER BY tablename;
