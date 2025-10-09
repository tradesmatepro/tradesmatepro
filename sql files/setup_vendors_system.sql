-- Vendors/Suppliers System - Based on customers architecture
-- Complete vendor management with status tracking, history, and metadata
-- Run this in Supabase SQL editor

BEGIN;

-- 1) Create vendors table (enhanced version of the basic one from PO setup)
DROP TABLE IF EXISTS public.vendors CASCADE;
CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  address text,
  preferred_contact_method text,
  created_at timestamptz DEFAULT now(),
  notes text,
  preferred_payment_terms text,
  preferred_times text,
  street_address text,
  city text,
  state text,
  zip_code text,
  country text DEFAULT 'United States',
  latitude double precision,
  longitude double precision,
  last_order_date date,
  rating integer DEFAULT 5,
  lifetime_spend numeric DEFAULT 0,
  total_orders integer DEFAULT 0,
  status text DEFAULT 'ACTIVE',
  preferred_delivery_time text,
  special_instructions text,
  company_name text,
  status_reason text,
  status_changed_at timestamptz,
  updated_by uuid,
  vendor_type text DEFAULT 'SUPPLIER', -- SUPPLIER, CONTRACTOR, SERVICE_PROVIDER
  billing_address_line_1 text,
  billing_address_line_2 text,
  billing_city text,
  billing_state text,
  billing_zip_code text,
  billing_country text DEFAULT 'United States',
  tax_id text,
  payment_terms text DEFAULT 'NET_30',
  credit_limit numeric DEFAULT 0,
  account_number text,
  website text,
  primary_contact_name text,
  primary_contact_phone text,
  primary_contact_email text,
  accounts_payable_contact text,
  accounts_payable_phone text,
  accounts_payable_email text,
  created_by uuid REFERENCES public.users(id),
  updated_at timestamptz DEFAULT now()
);

-- 2) Add status constraint
ALTER TABLE public.vendors
ADD CONSTRAINT vendors_status_check
CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED','CREDIT_HOLD','DO_NOT_ORDER'));

-- 3) Add vendor type constraint  
ALTER TABLE public.vendors
ADD CONSTRAINT vendors_type_check
CHECK (vendor_type IN ('SUPPLIER','CONTRACTOR','SERVICE_PROVIDER','MANUFACTURER','DISTRIBUTOR'));

-- 4) Add payment terms constraint
ALTER TABLE public.vendors
ADD CONSTRAINT vendors_payment_terms_check
CHECK (payment_terms IN ('NET_15','NET_30','NET_45','NET_60','COD','PREPAID','2_10_NET_30'));

-- 5) Vendor status history table (mirrors customers_status_history)
CREATE TABLE public.vendors_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  reason text,
  changed_by uuid REFERENCES public.users(id),
  changed_at timestamptz NOT NULL DEFAULT now()
);

-- 6) Vendor contacts table (for multiple contacts per vendor)
CREATE TABLE public.vendor_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text,
  phone text,
  email text,
  is_primary boolean DEFAULT false,
  department text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7) Vendor categories/tags
CREATE TABLE public.vendor_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text DEFAULT '#6B7280',
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, name)
);

CREATE TABLE public.vendor_category_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.vendor_categories(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(vendor_id, category_id)
);

-- 8) Indexes for performance
CREATE INDEX vendors_company_id_idx ON public.vendors(company_id);
CREATE INDEX vendors_status_idx ON public.vendors(company_id, status);
CREATE INDEX vendors_name_idx ON public.vendors(company_id, name);
CREATE INDEX vendors_email_idx ON public.vendors(company_id, email);
CREATE INDEX vendors_type_idx ON public.vendors(company_id, vendor_type);
CREATE INDEX vendors_status_history_vendor_idx ON public.vendors_status_history(vendor_id);
CREATE INDEX vendors_status_history_changed_at_idx ON public.vendors_status_history(changed_at);
CREATE INDEX vendor_contacts_vendor_idx ON public.vendor_contacts(vendor_id);
CREATE INDEX vendor_contacts_company_idx ON public.vendor_contacts(company_id);

-- 9) Trigger to record status history and set status_changed_at
CREATE OR REPLACE FUNCTION public.log_vendor_status_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.vendors_status_history (vendor_id, from_status, to_status, reason, changed_by)
    VALUES (NEW.id, LOWER(OLD.status), LOWER(NEW.status), COALESCE(NEW.status_reason, OLD.status_reason), NEW.updated_by);
    NEW.status_changed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vendors_status_change_trigger
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.log_vendor_status_change();

-- 10) Update purchase_orders to reference vendors table
ALTER TABLE public.purchase_orders 
DROP CONSTRAINT IF EXISTS purchase_orders_vendor_id_fkey;

ALTER TABLE public.purchase_orders
ADD CONSTRAINT purchase_orders_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL;

-- 11) Function to update vendor stats when POs are created/updated
CREATE OR REPLACE FUNCTION public.update_vendor_stats()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.vendor_id IS NOT NULL THEN
      UPDATE public.vendors SET
        total_orders = (
          SELECT COUNT(*) FROM public.purchase_orders 
          WHERE vendor_id = NEW.vendor_id AND status != 'CANCELLED'
        ),
        lifetime_spend = (
          SELECT COALESCE(SUM(total_amount), 0) FROM public.purchase_orders 
          WHERE vendor_id = NEW.vendor_id AND status IN ('RECEIVED', 'CLOSED')
        ),
        last_order_date = (
          SELECT MAX(created_at::date) FROM public.purchase_orders 
          WHERE vendor_id = NEW.vendor_id
        ),
        updated_at = now()
      WHERE id = NEW.vendor_id;
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' AND OLD.vendor_id IS NOT NULL THEN
    UPDATE public.vendors SET
      total_orders = (
        SELECT COUNT(*) FROM public.purchase_orders 
        WHERE vendor_id = OLD.vendor_id AND status != 'CANCELLED'
      ),
      lifetime_spend = (
        SELECT COALESCE(SUM(total_amount), 0) FROM public.purchase_orders 
        WHERE vendor_id = OLD.vendor_id AND status IN ('RECEIVED', 'CLOSED')
      ),
      last_order_date = (
        SELECT MAX(created_at::date) FROM public.purchase_orders 
        WHERE vendor_id = OLD.vendor_id
      ),
      updated_at = now()
    WHERE id = OLD.vendor_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendor_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vendor_stats();

-- 12) Approval workflow tables
CREATE TABLE public.po_approval_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  min_amount numeric NOT NULL DEFAULT 0,
  max_amount numeric,
  approver_user_id uuid REFERENCES public.users(id),
  approver_role text,
  vendor_category_id uuid REFERENCES public.vendor_categories(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.po_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  purchase_order_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES public.po_approval_rules(id),
  approver_user_id uuid REFERENCES public.users(id),
  status text NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  comments text,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.po_approvals
ADD CONSTRAINT po_approvals_status_check
CHECK (status IN ('PENDING','APPROVED','REJECTED'));

CREATE INDEX po_approval_rules_company_idx ON public.po_approval_rules(company_id);
CREATE INDEX po_approvals_po_idx ON public.po_approvals(purchase_order_id);
CREATE INDEX po_approvals_approver_idx ON public.po_approvals(approver_user_id);

COMMIT;

-- RLS Policies (add these after enabling RLS on each table)
-- ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.vendors_status_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.vendor_contacts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.vendor_categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.vendor_category_assignments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.po_approval_rules ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.po_approvals ENABLE ROW LEVEL SECURITY;

-- Create company-scoped SELECT/INSERT/UPDATE/DELETE policies similar to customers table
