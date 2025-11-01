-- ============================================
-- GET EMPLOYEE PERMISSIONS (READ)
-- ============================================
CREATE OR REPLACE FUNCTION get_employee_permissions(
  p_user_id uuid,
  p_company_id uuid
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  company_id uuid,
  dashboard boolean,
  calendar boolean,
  jobs boolean,
  documents boolean,
  customers boolean,
  quotes boolean,
  invoices boolean,
  incoming_requests boolean,
  employees boolean,
  timesheets boolean,
  payroll boolean,
  expenses boolean,
  purchase_orders boolean,
  vendors boolean,
  tools boolean,
  inventory boolean,
  marketplace boolean,
  reports boolean,
  settings boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return employee permissions for the specified user in the company
  RETURN QUERY
  SELECT
    ep.id,
    ep.user_id,
    ep.company_id,
    ep.dashboard,
    ep.calendar,
    ep.jobs,
    ep.documents,
    ep.customers,
    ep.quotes,
    ep.invoices,
    ep.incoming_requests,
    ep.employees,
    ep.timesheets,
    ep.payroll,
    ep.expenses,
    ep.purchase_orders,
    ep.vendors,
    ep.tools,
    ep.inventory,
    ep.marketplace,
    ep.reports,
    ep.settings,
    ep.created_at,
    ep.updated_at
  FROM public.employee_permissions ep
  WHERE ep.user_id = p_user_id
    AND ep.company_id = p_company_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_employee_permissions TO authenticated;

-- ============================================
-- UPSERT EMPLOYEE PERMISSIONS (WRITE)
-- ============================================
CREATE OR REPLACE FUNCTION upsert_employee_permissions(
  p_company_id uuid,
  p_user_id uuid,
  p_dashboard boolean DEFAULT NULL,
  p_calendar boolean DEFAULT NULL,
  p_jobs boolean DEFAULT NULL,
  p_documents boolean DEFAULT NULL,
  p_customers boolean DEFAULT NULL,
  p_quotes boolean DEFAULT NULL,
  p_invoices boolean DEFAULT NULL,
  p_incoming_requests boolean DEFAULT NULL,
  p_employees boolean DEFAULT NULL,
  p_timesheets boolean DEFAULT NULL,
  p_payroll boolean DEFAULT NULL,
  p_expenses boolean DEFAULT NULL,
  p_purchase_orders boolean DEFAULT NULL,
  p_vendors boolean DEFAULT NULL,
  p_tools boolean DEFAULT NULL,
  p_inventory boolean DEFAULT NULL,
  p_marketplace boolean DEFAULT NULL,
  p_reports boolean DEFAULT NULL,
  p_settings boolean DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_company_id uuid;
  v_user_id uuid;
BEGIN
  -- Validate: Caller must be owner/admin of the company
  SELECT company_id INTO v_company_id
  FROM public.users
  WHERE id = auth.uid()
  AND (role::text ILIKE '%owner%' OR role::text ILIKE '%admin%')
  AND company_id = p_company_id;
  
  IF v_company_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Only company owners/admins can manage permissions'
    );
  END IF;
  
  -- Validate: User exists and belongs to company
  SELECT id INTO v_user_id
  FROM public.users
  WHERE id = p_user_id
  AND company_id = p_company_id;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found in this company'
    );
  END IF;
  
  -- Upsert employee permissions
  INSERT INTO public.employee_permissions (
    user_id,
    company_id,
    dashboard,
    calendar,
    jobs,
    documents,
    customers,
    quotes,
    invoices,
    incoming_requests,
    employees,
    timesheets,
    payroll,
    expenses,
    purchase_orders,
    vendors,
    tools,
    inventory,
    marketplace,
    reports,
    settings
  ) VALUES (
    p_user_id,
    p_company_id,
    p_dashboard,
    p_calendar,
    p_jobs,
    p_documents,
    p_customers,
    p_quotes,
    p_invoices,
    p_incoming_requests,
    p_employees,
    p_timesheets,
    p_payroll,
    p_expenses,
    p_purchase_orders,
    p_vendors,
    p_tools,
    p_inventory,
    p_marketplace,
    p_reports,
    p_settings
  )
  ON CONFLICT (user_id, company_id) DO UPDATE SET
    dashboard = COALESCE(EXCLUDED.dashboard, employee_permissions.dashboard),
    calendar = COALESCE(EXCLUDED.calendar, employee_permissions.calendar),
    jobs = COALESCE(EXCLUDED.jobs, employee_permissions.jobs),
    documents = COALESCE(EXCLUDED.documents, employee_permissions.documents),
    customers = COALESCE(EXCLUDED.customers, employee_permissions.customers),
    quotes = COALESCE(EXCLUDED.quotes, employee_permissions.quotes),
    invoices = COALESCE(EXCLUDED.invoices, employee_permissions.invoices),
    incoming_requests = COALESCE(EXCLUDED.incoming_requests, employee_permissions.incoming_requests),
    employees = COALESCE(EXCLUDED.employees, employee_permissions.employees),
    timesheets = COALESCE(EXCLUDED.timesheets, employee_permissions.timesheets),
    payroll = COALESCE(EXCLUDED.payroll, employee_permissions.payroll),
    expenses = COALESCE(EXCLUDED.expenses, employee_permissions.expenses),
    purchase_orders = COALESCE(EXCLUDED.purchase_orders, employee_permissions.purchase_orders),
    vendors = COALESCE(EXCLUDED.vendors, employee_permissions.vendors),
    tools = COALESCE(EXCLUDED.tools, employee_permissions.tools),
    inventory = COALESCE(EXCLUDED.inventory, employee_permissions.inventory),
    marketplace = COALESCE(EXCLUDED.marketplace, employee_permissions.marketplace),
    reports = COALESCE(EXCLUDED.reports, employee_permissions.reports),
    settings = COALESCE(EXCLUDED.settings, employee_permissions.settings),
    updated_at = NOW();
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Employee permissions updated successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_employee_permissions TO authenticated;

