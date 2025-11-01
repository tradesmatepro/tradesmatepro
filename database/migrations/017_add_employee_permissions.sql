-- Migration: Add employee_permissions table for granular per-user permissions
-- Purpose: Allow owners to override module access for individual employees
-- Hierarchy: individual permissions → company module_permissions → role defaults

BEGIN;

-- Create employee_permissions table
CREATE TABLE IF NOT EXISTS public.employee_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Module permissions (matches EMPLOYEE_MODULES from employeePermissions.js)
  -- NULL = inherit from company/role, TRUE = force enable, FALSE = force disable
  dashboard BOOLEAN DEFAULT NULL,
  calendar BOOLEAN DEFAULT NULL,
  jobs BOOLEAN DEFAULT NULL,
  documents BOOLEAN DEFAULT NULL,
  customers BOOLEAN DEFAULT NULL,
  quotes BOOLEAN DEFAULT NULL,
  invoices BOOLEAN DEFAULT NULL,
  incoming_requests BOOLEAN DEFAULT NULL,
  employees BOOLEAN DEFAULT NULL,
  timesheets BOOLEAN DEFAULT NULL,
  payroll BOOLEAN DEFAULT NULL,
  expenses BOOLEAN DEFAULT NULL,
  purchase_orders BOOLEAN DEFAULT NULL,
  vendors BOOLEAN DEFAULT NULL,
  tools BOOLEAN DEFAULT NULL,
  inventory BOOLEAN DEFAULT NULL,
  marketplace BOOLEAN DEFAULT NULL,
  reports BOOLEAN DEFAULT NULL,
  settings BOOLEAN DEFAULT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, company_id)
);

-- Add RLS policies
ALTER TABLE public.employee_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own permissions
CREATE POLICY "Users can view own permissions"
  ON public.employee_permissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Company owners/admins can manage all employee permissions in their company
CREATE POLICY "Owners can manage employee permissions"
  ON public.employee_permissions
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id
      FROM public.users
      WHERE id = auth.uid()
      AND (role::text ILIKE '%owner%' OR role::text ILIKE '%admin%')
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_permissions_user_id ON public.employee_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_permissions_company_id ON public.employee_permissions(company_id);

-- Add comment
COMMENT ON TABLE public.employee_permissions IS 'Per-employee module permission overrides. NULL = inherit from company/role, TRUE = force enable, FALSE = force disable';

COMMIT;

