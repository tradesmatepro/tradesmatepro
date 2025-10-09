-- ========================================
-- Industry Standard Fix for Signup/Login
-- Adds missing fields needed for production SaaS
-- ========================================

-- 1. USERS TABLE UPDATES (Industry Standard)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'USER',          -- USER, ADMIN, OWNER
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,            -- Track last activity
ADD COLUMN IF NOT EXISTS phone TEXT,                        -- Optional phone
ADD COLUMN IF NOT EXISTS avatar_url TEXT;                   -- Profile picture

-- 2. COMPANIES TABLE UPDATES (Business Metadata)
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb; -- Replace old business_settings/integration_settings

-- 3. CUSTOMERS TABLE UPDATES (Industry Standard)
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- 4. DISABLE RLS (for beta/dev only)
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_audit_log DISABLE ROW LEVEL SECURITY;

-- 5. SET DEFAULT SETTINGS STRUCTURE (Future-proofing)
UPDATE public.companies
SET settings = jsonb_build_object(
    'currency', 'USD',
    'timezone', 'UTC',
    'invoice_prefix', COALESCE(name, 'INV') || '-' || to_char(now(), 'YYYY') || '-',
    'features', jsonb_build_object(
        'business_settings', true,
        'integration_settings', true,
        'quotes', true,
        'jobs', true,
        'invoices', true,
        'inventory', true,
        'scheduling', true
    ),
    'business_info', jsonb_build_object(
        'tax_rate', 0.0,
        'payment_terms', 'Net 30',
        'default_hourly_rate', 75.00
    )
)
WHERE settings = '{}'::jsonb OR settings IS NULL;

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_company_id_role ON public.users(company_id, role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON public.users(last_login);
CREATE INDEX IF NOT EXISTS idx_companies_settings ON public.companies USING GIN(settings);

-- 7. UPDATE TRIGGERS FOR LAST_LOGIN
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_login = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger would be called from application code when user logs in
-- CREATE TRIGGER trg_update_last_login
-- BEFORE UPDATE ON public.users
-- FOR EACH ROW
-- WHEN (OLD.last_login IS DISTINCT FROM NEW.last_login)
-- EXECUTE FUNCTION update_last_login();

-- 8. GRANT PERMISSIONS (if needed)
-- GRANT ALL ON public.companies TO authenticated;
-- GRANT ALL ON public.users TO authenticated;
-- GRANT ALL ON public.customers TO authenticated;
-- GRANT ALL ON public.work_orders TO authenticated;
-- GRANT ALL ON public.invoices TO authenticated;
-- GRANT ALL ON public.invoice_line_items TO authenticated;
-- GRANT ALL ON public.work_order_audit_log TO authenticated;
