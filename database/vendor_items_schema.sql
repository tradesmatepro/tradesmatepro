-- Vendor Items Catalog Schema
-- Run this in Supabase SQL Editor to enable vendor-specific item catalogs and supplier part number mapping

-- 1. Create vendor_items table for supplier catalogs
CREATE TABLE IF NOT EXISTS public.vendor_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  
  -- Vendor's catalog information
  supplier_part_number TEXT NOT NULL, -- Vendor's SKU/part number
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

-- 2. Add budget_amount column to purchase_orders (if not exists)
ALTER TABLE public.purchase_orders 
  ADD COLUMN IF NOT EXISTS budget_amount NUMERIC(12,4);

-- 3. Add supplier_part_number to po_items for tracking vendor SKUs
ALTER TABLE public.po_items 
  ADD COLUMN IF NOT EXISTS supplier_part_number TEXT,
  ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_items_company_vendor ON public.vendor_items(company_id, vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_items_supplier_part ON public.vendor_items(supplier_part_number);
CREATE INDEX IF NOT EXISTS idx_vendor_items_inventory ON public.vendor_items(inventory_item_id) WHERE inventory_item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_po_items_supplier_part ON public.po_items(supplier_part_number) WHERE supplier_part_number IS NOT NULL;

-- 5. Create view for vendor catalog with inventory details
CREATE OR REPLACE VIEW public.vendor_catalog_v AS
SELECT 
  vi.id,
  vi.company_id,
  vi.vendor_id,
  v.name as vendor_name,
  vi.supplier_part_number,
  vi.supplier_description,
  vi.unit_cost,
  vi.minimum_order_qty,
  vi.lead_time_days,
  vi.is_active,
  vi.last_ordered_at,
  
  -- Inventory item details (if linked)
  ii.id as inventory_item_id,
  ii.sku as internal_sku,
  ii.name as item_name,
  ii.description as internal_description,
  ii.cost as internal_cost,
  ii.sell_price,
  ii.reorder_point,
  
  -- Stock status (if available)
  COALESCE(stock_summary.total_on_hand, 0) as stock_on_hand,
  CASE 
    WHEN ii.id IS NULL THEN 'NOT_STOCKED'
    WHEN COALESCE(stock_summary.total_on_hand, 0) = 0 THEN 'OUT_OF_STOCK'
    WHEN COALESCE(stock_summary.total_on_hand, 0) <= COALESCE(ii.reorder_point, 5) THEN 'LOW_STOCK'
    ELSE 'IN_STOCK'
  END as stock_status,
  
  vi.created_at,
  vi.updated_at
FROM public.vendor_items vi
LEFT JOIN public.vendors v ON vi.vendor_id = v.id
LEFT JOIN public.inventory_items ii ON vi.inventory_item_id = ii.id
LEFT JOIN (
  SELECT 
    item_id,
    SUM(quantity) as total_on_hand
  FROM public.inventory_stock
  GROUP BY item_id
) stock_summary ON ii.id = stock_summary.item_id
WHERE vi.is_active = true;

-- 6. Function to sync vendor item costs from recent PO receipts
CREATE OR REPLACE FUNCTION public.update_vendor_item_costs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update vendor_items.unit_cost based on most recent PO receipts
  UPDATE public.vendor_items vi
  SET 
    unit_cost = recent_costs.avg_cost,
    last_cost_update = now(),
    updated_at = now()
  FROM (
    SELECT 
      poi.supplier_part_number,
      po.vendor_id,
      AVG(poi.unit_cost) as avg_cost,
      MAX(po.created_at) as latest_po_date
    FROM public.po_items poi
    JOIN public.purchase_orders po ON poi.purchase_order_id = po.id
    WHERE po.status IN ('RECEIVED', 'CLOSED')
      AND po.created_at >= now() - interval '90 days'
      AND poi.supplier_part_number IS NOT NULL
      AND poi.unit_cost > 0
    GROUP BY poi.supplier_part_number, po.vendor_id
  ) recent_costs
  WHERE vi.supplier_part_number = recent_costs.supplier_part_number
    AND vi.vendor_id = recent_costs.vendor_id
    AND recent_costs.avg_cost != vi.unit_cost;
END;
$$;

-- 7. Trigger to auto-update vendor items when POs are received
CREATE OR REPLACE FUNCTION public.trigger_update_vendor_costs()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only update costs when PO status changes to RECEIVED or CLOSED
  IF OLD.status != NEW.status AND NEW.status IN ('RECEIVED', 'CLOSED') THEN
    PERFORM public.update_vendor_item_costs();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_po_status_update_costs ON public.purchase_orders;
CREATE TRIGGER trigger_po_status_update_costs
  AFTER UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_vendor_costs();

-- 8. Sample data (optional - remove if not needed)
-- INSERT INTO public.vendor_items (company_id, vendor_id, supplier_part_number, supplier_description, unit_cost, minimum_order_qty, lead_time_days)
-- SELECT 
--   v.company_id,
--   v.id,
--   'SAMPLE-' || generate_random_uuid()::text,
--   'Sample vendor item for ' || v.name,
--   random() * 100 + 10,
--   1,
--   7
-- FROM public.vendors v
-- LIMIT 5;

-- Notes:
-- - This schema enables full vendor catalog management with supplier part numbers
-- - Links vendor items to internal inventory for stock tracking
-- - Automatically updates costs based on recent PO receipts
-- - Provides a unified view (vendor_catalog_v) for PO autocomplete
-- - Supports minimum order quantities and lead times for procurement planning
