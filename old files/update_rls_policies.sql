-- Enable RLS on key tables if not already
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_responses ENABLE ROW LEVEL SECURITY;
-- Add more tables as needed

-- Policy for companies: App owner can manage all, others none (companies are created via admin)
CREATE POLICY "App owner can manage companies" ON public.companies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'APP_OWNER')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'APP_OWNER')
  );

-- Policy for users: Users can view/update own, company admins can manage company users
CREATE POLICY "Users can view own user record" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own user record" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Company admins can manage company users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.company_id = users.company_id AND p.role IN ('OWNER', 'ADMIN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.company_id = users.company_id AND p.role IN ('OWNER', 'ADMIN')
    )
  );

-- Similar for customers
CREATE POLICY "Company users can manage own company customers" ON public.customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.company_id = customers.company_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.company_id = customers.company_id
    )
  );

-- For work_orders
CREATE POLICY "Company users can manage own company work orders" ON public.work_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.company_id = work_orders.company_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.company_id = work_orders.company_id
    )
  );

-- For invoices
CREATE POLICY "Company users can manage own company invoices" ON public.invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.company_id = invoices.company_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.company_id = invoices.company_id
    )
  );

-- For marketplace_requests (customers post, so using customer.company_id)
CREATE POLICY "Company users can view own company marketplace requests" ON public.marketplace_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.customers c JOIN public.profiles p ON c.company_id = p.company_id
      WHERE p.id = auth.uid() AND c.id = marketplace_requests.customer_id
    )
  );

CREATE POLICY "Customers can manage own requests" ON public.marketplace_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p JOIN public.customers c ON p.company_id = c.company_id
      WHERE p.id = auth.uid() AND c.id = marketplace_requests.customer_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p JOIN public.customers c ON p.company_id = c.company_id
      WHERE p.id = auth.uid() AND c.id = marketplace_requests.customer_id
    )
  );

-- For marketplace_responses (contractors respond, using company_id)
CREATE POLICY "Company users can manage own responses" ON public.marketplace_responses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.company_id = marketplace_responses.company_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.company_id = marketplace_responses.company_id
    )
  );

-- App owner bypass for all tables
-- Add to each policy or use a function for common check
CREATE OR REPLACE FUNCTION public.is_app_owner()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'APP_OWNER');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example for companies, apply similarly to others
DROP POLICY IF EXISTS "App owner can manage companies" ON public.companies;
CREATE POLICY "App owner can manage companies" ON public.companies
  FOR ALL USING (public.is_app_owner())
  WITH CHECK (public.is_app_owner());

-- Grant permissions to authenticated
GRANT ALL ON public.companies TO authenticated;
GRANT ALL ON public.users TO authenticated;
-- Repeat for other tables

-- For marketplace, customers can view responses to their requests
CREATE POLICY "Customers can view responses to own requests" ON public.marketplace_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_requests mr JOIN public.customers c ON mr.customer_id = c.id
      JOIN public.profiles p ON c.company_id = p.company_id
      WHERE p.id = auth.uid() AND mr.id = marketplace_responses.request_id
    )
  );
