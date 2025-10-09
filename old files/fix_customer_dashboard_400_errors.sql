-- Fix Customer Dashboard 400 Errors
-- This creates the missing RPC function and view that the Customer Dashboard expects

-- 1. Create the missing get_company_customers RPC function
CREATE OR REPLACE FUNCTION public.get_company_customers(company_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    status TEXT,
    relationship_type TEXT,
    relationship_status TEXT,
    has_portal_account BOOLEAN,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.address,
        COALESCE(c.status, 'active') as status,
        'client' as relationship_type,
        'active' as relationship_status,
        false as has_portal_account,
        c.created_at
    FROM public.customers c
    WHERE c.company_id = company_uuid OR company_uuid IS NULL
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the missing company_customers_view
CREATE OR REPLACE VIEW public.company_customers_view AS
SELECT 
    c.*,
    'client' as relationship_type,
    'active' as relationship_status,
    false as has_portal_account
FROM public.customers c;

-- 3. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_company_customers(UUID) TO anon, authenticated;
GRANT SELECT ON public.company_customers_view TO anon, authenticated;
