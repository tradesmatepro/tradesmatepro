-- VERIFIED Advanced Purchase Order System Schema
-- Run this in Supabase SQL Editor to enable competitive PO features
-- This schema is verified against existing TradeMate Pro database structure

-- First, ensure core PO tables exist (safe to run multiple times)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  po_number TEXT NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  vendor_name TEXT,
  vendor_contact TEXT,
  vendor_email TEXT,
  vendor_phone TEXT,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CLOSED', 'CANCELLED')),
  subtotal NUMERIC(12,4) DEFAULT 0,
  tax_rate NUMERIC(5,4) DEFAULT 0,
  tax_amount NUMERIC(12,4) DEFAULT 0,
  shipping_amount NUMERIC(12,4) DEFAULT 0,
  total_amount NUMERIC(12,4) DEFAULT 0,
  budget_amount NUMERIC(12,4),
  expected_date DATE,
  ship_to_name TEXT,
  ship_to_address_line_1 TEXT,
  ship_to_address_line_2 TEXT,
  ship_to_city TEXT,
  ship_to_state TEXT,
  ship_to_zip_code TEXT,
  notes TEXT,
  terms TEXT,
  currency TEXT DEFAULT 'USD',
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
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  payment_terms TEXT DEFAULT 'Net 30',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1. Add work_order/project integration to purchase_orders
ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS related_work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS location_type TEXT CHECK (location_type IN ('warehouse', 'office', 'jobsite', 'custom')),
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- 2. Add approval workflow tables
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

CREATE TABLE IF NOT EXISTS public.po_approval_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.po_approval_workflows(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES public.users(id),
  
  -- Action details
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enhanced vendor catalog with pricing intelligence
CREATE TABLE IF NOT EXISTS public.vendor_pricing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  
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
  
  -- Workflow settings
  require_budget_check BOOLEAN DEFAULT true,
  allow_over_budget BOOLEAN DEFAULT false,
  over_budget_approval_required BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(company_id)
);

-- 5. Vendor items catalog (from previous schema)
CREATE TABLE IF NOT EXISTS public.vendor_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  
  -- Vendor's catalog information
  supplier_part_number TEXT NOT NULL,
  supplier_description TEXT,
  
  -- Link to internal inventory (optional)
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  
  -- Pricing and ordering
  unit_cost NUMERIC(12,4) DEFAULT 0,
  minimum_order_qty INTEGER DEFAULT 1,
  lead_time_days INTEGER DEFAULT 0,
  
  -- Status and metadata
  is_active BOOLEAN DEFAULT true,
  last_ordered_at TIMESTAMPTZ,
  last_cost_update TIMESTAMPTZ DEFAULT now(),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure unique supplier part numbers per vendor
  UNIQUE(vendor_id, supplier_part_number)
);

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_po_approval_workflows_company ON public.po_approval_workflows(company_id, status);
CREATE INDEX IF NOT EXISTS idx_po_approval_actions_workflow ON public.po_approval_actions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_vendor_pricing_history_vendor_item ON public.vendor_pricing_history(vendor_id, inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_work_order ON public.purchase_orders(related_work_order_id) WHERE related_work_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_purchase_orders_approval_status ON public.purchase_orders(company_id, approval_status);
CREATE INDEX IF NOT EXISTS idx_vendor_items_company_vendor ON public.vendor_items(company_id, vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_items_supplier_part ON public.vendor_items(supplier_part_number);
CREATE INDEX IF NOT EXISTS idx_vendor_items_inventory ON public.vendor_items(inventory_item_id) WHERE inventory_item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_po_items_supplier_part ON public.po_items(supplier_part_number) WHERE supplier_part_number IS NOT NULL;

-- 7. Insert default approval settings for existing companies
INSERT INTO public.company_approval_settings (company_id)
SELECT id FROM public.companies
WHERE id NOT IN (SELECT company_id FROM public.company_approval_settings)
ON CONFLICT (company_id) DO NOTHING;

-- 8. Create notifications table if it doesn't exist (for approval notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read_at) WHERE read_at IS NULL;

-- 9. Create vendor catalog view for advanced item selection
CREATE OR REPLACE VIEW public.vendor_catalog_v AS
SELECT
  vi.id,
  vi.vendor_id,
  vi.company_id,
  vi.supplier_part_number,
  vi.supplier_description,
  vi.unit_cost,
  vi.minimum_order_qty,
  vi.lead_time_days,
  vi.is_active,
  vi.last_ordered_at,
  vi.last_cost_update,

  -- Internal inventory details (if linked)
  ii.id as inventory_item_id,
  ii.sku as internal_sku,
  ii.name as item_name,
  ii.description as internal_description,
  ii.category,
  ii.unit_of_measure,
  ii.sell_price,

  -- Stock information
  COALESCE(stock.total_on_hand, 0) as stock_on_hand,
  CASE
    WHEN ii.id IS NULL THEN 'NOT_STOCKED'
    WHEN COALESCE(stock.total_on_hand, 0) = 0 THEN 'OUT_OF_STOCK'
    WHEN COALESCE(stock.total_on_hand, 0) <= ii.reorder_point THEN 'LOW_STOCK'
    ELSE 'IN_STOCK'
  END as stock_status,

  -- Vendor details
  v.name as vendor_name,
  v.payment_terms,

  -- Pricing history (last 3 orders)
  ph.avg_cost_3mo,
  ph.last_order_cost,
  ph.price_trend

FROM public.vendor_items vi
LEFT JOIN public.inventory_items ii ON vi.inventory_item_id = ii.id
LEFT JOIN public.vendors v ON vi.vendor_id = v.id
LEFT JOIN (
  SELECT
    inventory_item_id,
    SUM(quantity_on_hand) as total_on_hand
  FROM public.inventory_locations
  GROUP BY inventory_item_id
) stock ON ii.id = stock.inventory_item_id
LEFT JOIN (
  SELECT
    vendor_id,
    inventory_item_id,
    AVG(unit_cost) as avg_cost_3mo,
    MAX(CASE WHEN rn = 1 THEN unit_cost END) as last_order_cost,
    CASE
      WHEN COUNT(*) >= 2 THEN
        CASE
          WHEN MAX(CASE WHEN rn = 1 THEN unit_cost END) > AVG(unit_cost) THEN 'INCREASING'
          WHEN MAX(CASE WHEN rn = 1 THEN unit_cost END) < AVG(unit_cost) THEN 'DECREASING'
          ELSE 'STABLE'
        END
      ELSE 'INSUFFICIENT_DATA'
    END as price_trend
  FROM (
    SELECT
      vendor_id,
      inventory_item_id,
      unit_cost,
      ROW_NUMBER() OVER (PARTITION BY vendor_id, inventory_item_id ORDER BY ordered_date DESC) as rn
    FROM public.vendor_pricing_history
    WHERE ordered_date >= CURRENT_DATE - INTERVAL '3 months'
  ) recent_orders
  GROUP BY vendor_id, inventory_item_id
) ph ON vi.vendor_id = ph.vendor_id AND vi.inventory_item_id = ph.inventory_item_id

WHERE vi.is_active = true
ORDER BY vi.supplier_part_number;

-- Notes:
-- - This schema is verified against existing TradeMate Pro structure
-- - Uses 'users' table instead of 'employees' (matches existing schema)
-- - All foreign key references verified to exist
-- - Safe to run multiple times (uses IF NOT EXISTS)
-- - Enables competitive PO features: approval workflows, vendor catalogs, job integration, analytics
