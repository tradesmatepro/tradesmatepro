-- Advanced Purchase Order System Schema
-- Run this in Supabase SQL Editor to enable competitive PO features

-- First, ensure core tables exist (run this section first if tables don't exist)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  po_number TEXT NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  vendor_name TEXT,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CLOSED', 'CANCELLED')),
  subtotal NUMERIC(12,4) DEFAULT 0,
  tax_rate NUMERIC(5,4) DEFAULT 0,
  tax_amount NUMERIC(12,4) DEFAULT 0,
  shipping_amount NUMERIC(12,4) DEFAULT 0,
  total_amount NUMERIC(12,4) DEFAULT 0,
  budget_amount NUMERIC(12,4),
  expected_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.users(id),
  UNIQUE(company_id, po_number)
);

CREATE TABLE IF NOT EXISTS public.po_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_sku TEXT,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12,4) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  supplier_part_number TEXT,
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  contact_name TEXT,
  payment_terms TEXT DEFAULT 'Net 30',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1. Add approval workflow tables
CREATE TABLE IF NOT EXISTS public.po_approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),

  -- Approval requirements
  total_amount NUMERIC(12,4) NOT NULL,
  approval_level TEXT NOT NULL CHECK (approval_level IN ('auto', 'manager', 'owner')),
  required_approvers TEXT[] NOT NULL DEFAULT '{}',

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,

  UNIQUE(purchase_order_id)
);
  
  -- Pricing data
  supplier_part_number TEXT NOT NULL,
  unit_cost NUMERIC(12,4) NOT NULL,
  minimum_order_qty INTEGER DEFAULT 1,
  lead_time_days INTEGER DEFAULT 0,
  
  -- Context
  purchase_order_id UUID REFERENCES public.purchase_orders(id),
  ordered_date TIMESTAMPTZ DEFAULT now(),
  
  -- Performance tracking
  delivery_performance_score NUMERIC(3,2) DEFAULT 5.0, -- 1-5 scale
  quality_score NUMERIC(3,2) DEFAULT 5.0,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Company approval settings
CREATE TABLE IF NOT EXISTS public.company_approval_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Approval thresholds
  auto_approve_limit NUMERIC(12,4) DEFAULT 500,
  manager_approval_limit NUMERIC(12,4) DEFAULT 5000,
  owner_approval_required BOOLEAN DEFAULT true,
  
  -- Notification settings
  email_notifications BOOLEAN DEFAULT true,
  mobile_notifications BOOLEAN DEFAULT true,
  slack_notifications BOOLEAN DEFAULT false,
  slack_webhook_url TEXT,
  
  -- Workflow settings
  require_budget_check BOOLEAN DEFAULT true,
  allow_over_budget BOOLEAN DEFAULT false,
  over_budget_approval_required BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(company_id)
);

-- 5. PO analytics and reporting views
CREATE OR REPLACE VIEW public.po_analytics_v AS
SELECT 
  po.company_id,
  po.id as po_id,
  po.po_number,
  po.vendor_name,
  po.total_amount,
  po.status,
  po.approval_status,
  po.created_at,
  po.approved_at,
  po.expected_date,
  po.related_job_id,
  po.location_type,
  
  -- Budget analysis
  po.budget_amount,
  CASE 
    WHEN po.budget_amount IS NULL THEN 'no_budget'
    WHEN po.total_amount <= po.budget_amount * 0.75 THEN 'under_budget'
    WHEN po.total_amount <= po.budget_amount * 0.90 THEN 'near_budget'
    WHEN po.total_amount <= po.budget_amount THEN 'at_budget'
    ELSE 'over_budget'
  END as budget_status,
  
  -- Timing analysis
  CASE 
    WHEN po.expected_date IS NULL THEN 'no_date'
    WHEN po.expected_date < CURRENT_DATE THEN 'overdue'
    WHEN po.expected_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
    ELSE 'on_track'
  END as delivery_status,
  
  -- Approval timing
  EXTRACT(EPOCH FROM (po.approved_at - po.created_at))/3600 as approval_hours,
  
  -- Job context
  j.name as job_name,
  j.status as job_status,
  
  -- Vendor performance
  v.id as vendor_id,
  COALESCE(vp.avg_delivery_score, 5.0) as vendor_delivery_score,
  COALESCE(vp.avg_quality_score, 5.0) as vendor_quality_score
  
FROM public.purchase_orders po
LEFT JOIN public.jobs j ON po.related_job_id = j.id
LEFT JOIN public.vendors v ON po.vendor_id = v.id
LEFT JOIN (
  SELECT 
    vendor_id,
    AVG(delivery_performance_score) as avg_delivery_score,
    AVG(quality_score) as avg_quality_score
  FROM public.vendor_pricing_history
  WHERE ordered_date >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY vendor_id
) vp ON v.id = vp.vendor_id;

-- 6. Vendor spend analysis view
CREATE OR REPLACE VIEW public.vendor_spend_analysis_v AS
SELECT 
  po.company_id,
  po.vendor_id,
  po.vendor_name,
  
  -- Spend metrics
  COUNT(*) as total_pos,
  SUM(po.total_amount) as total_spend,
  AVG(po.total_amount) as avg_po_amount,
  MAX(po.total_amount) as largest_po,
  
  -- Time-based spend
  SUM(CASE WHEN po.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN po.total_amount ELSE 0 END) as spend_30d,
  SUM(CASE WHEN po.created_at >= CURRENT_DATE - INTERVAL '90 days' THEN po.total_amount ELSE 0 END) as spend_90d,
  SUM(CASE WHEN po.created_at >= CURRENT_DATE - INTERVAL '365 days' THEN po.total_amount ELSE 0 END) as spend_12m,
  
  -- Performance metrics
  AVG(EXTRACT(EPOCH FROM (po.approved_at - po.created_at))/3600) as avg_approval_hours,
  COUNT(CASE WHEN po.status = 'RECEIVED' THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) as completion_rate,
  
  -- Latest activity
  MAX(po.created_at) as last_po_date,
  
  -- Budget performance
  AVG(CASE 
    WHEN po.budget_amount > 0 THEN (po.total_amount / po.budget_amount) * 100 
    ELSE NULL 
  END) as avg_budget_utilization
  
FROM public.purchase_orders po
WHERE po.created_at >= CURRENT_DATE - INTERVAL '24 months'
GROUP BY po.company_id, po.vendor_id, po.vendor_name;

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_po_approval_workflows_company ON public.po_approval_workflows(company_id, status);
CREATE INDEX IF NOT EXISTS idx_po_approval_actions_workflow ON public.po_approval_actions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_vendor_pricing_history_vendor_item ON public.vendor_pricing_history(vendor_id, inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_job ON public.purchase_orders(related_job_id) WHERE related_job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_purchase_orders_approval_status ON public.purchase_orders(company_id, approval_status);

-- 8. Functions for automated workflows
CREATE OR REPLACE FUNCTION public.auto_create_approval_workflow()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  settings RECORD;
  approval_level TEXT;
  required_approvers TEXT[];
BEGIN
  -- Get company approval settings
  SELECT * INTO settings 
  FROM public.company_approval_settings 
  WHERE company_id = NEW.company_id;
  
  -- Use defaults if no settings found
  IF settings IS NULL THEN
    settings.auto_approve_limit := 500;
    settings.manager_approval_limit := 5000;
    settings.owner_approval_required := true;
  END IF;
  
  -- Determine approval requirements
  IF NEW.total_amount < settings.auto_approve_limit THEN
    -- Auto-approve
    UPDATE public.purchase_orders 
    SET approval_status = 'approved', approved_at = now(), approved_by = NEW.created_by
    WHERE id = NEW.id;
    RETURN NEW;
  ELSIF NEW.total_amount < settings.manager_approval_limit THEN
    approval_level := 'manager';
    required_approvers := ARRAY['manager'];
  ELSE
    approval_level := 'owner';
    required_approvers := ARRAY['manager', 'owner'];
  END IF;
  
  -- Create approval workflow
  INSERT INTO public.po_approval_workflows (
    company_id, purchase_order_id, created_by, total_amount, 
    approval_level, required_approvers
  ) VALUES (
    NEW.company_id, NEW.id, NEW.created_by, NEW.total_amount,
    approval_level, required_approvers
  );
  
  RETURN NEW;
END;
$$;

-- 9. Trigger to auto-create approval workflows
DROP TRIGGER IF EXISTS trigger_auto_approval_workflow ON public.purchase_orders;
CREATE TRIGGER trigger_auto_approval_workflow
  AFTER INSERT ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_approval_workflow();

-- 10. Insert default approval settings for existing companies
INSERT INTO public.company_approval_settings (company_id)
SELECT id FROM public.companies
WHERE id NOT IN (SELECT company_id FROM public.company_approval_settings)
ON CONFLICT (company_id) DO NOTHING;

-- Notes:
-- This schema enables:
-- - Multi-level approval workflows with configurable thresholds
-- - Job/project budget integration and tracking
-- - Vendor performance scoring and pricing history
-- - Advanced analytics and reporting
-- - Location-based shipping (warehouse, office, jobsite)
-- - Automated workflow creation based on PO amount
-- - Mobile-friendly approval notifications
