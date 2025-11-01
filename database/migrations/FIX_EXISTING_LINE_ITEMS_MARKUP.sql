-- ============================================
-- FIX EXISTING LINE ITEMS - ADD MARKUP TO TOTAL_PRICE
-- ============================================
-- This migration updates existing line items that have NULL or 0 total_price
-- by calculating total_price = quantity × unit_price with markup applied
-- for parts/materials.
-- ============================================

-- Step 1: Get the default markup percentage from settings
-- (We'll use 30% as default if not found)

DO $$
DECLARE
  v_markup_pct NUMERIC := 30; -- Default 30% markup
  v_settings_markup NUMERIC;
BEGIN
  -- Try to get markup from settings table (column is 'parts_markup' not 'parts_markup_percent')
  SELECT parts_markup INTO v_settings_markup
  FROM settings
  LIMIT 1;
  
  IF v_settings_markup IS NOT NULL THEN
    v_markup_pct := v_settings_markup;
  END IF;
  
  RAISE NOTICE 'Using markup percentage: %', v_markup_pct;
  
  -- Step 2: Update line items with NULL or 0 total_price
  -- Apply markup for parts/materials, no markup for labor/service
  UPDATE work_order_line_items
  SET total_price = CASE
    -- For parts and materials: apply markup
    WHEN line_type IN ('part', 'material') THEN
      (quantity * unit_price) * (1 + v_markup_pct / 100)
    -- For labor, service, fee, discount, tax: no markup
    ELSE
      quantity * unit_price
  END
  WHERE total_price IS NULL OR total_price = 0;
  
  RAISE NOTICE 'Updated % line items with calculated total_price', 
    (SELECT COUNT(*) FROM work_order_line_items WHERE total_price IS NOT NULL);
    
END $$;

-- Step 3: Update work_orders subtotal/total to match line items
-- This ensures the work_order totals are correct after fixing line items

UPDATE work_orders wo
SET 
  subtotal = (
    SELECT COALESCE(SUM(li.total_price), 0)
    FROM work_order_line_items li
    WHERE li.work_order_id = wo.id
  ),
  total_amount = (
    SELECT COALESCE(SUM(li.total_price), 0) + COALESCE(wo.tax_amount, 0)
    FROM work_order_line_items li
    WHERE li.work_order_id = wo.id
  )
WHERE EXISTS (
  SELECT 1 FROM work_order_line_items li WHERE li.work_order_id = wo.id
);

-- Step 4: Verify the fix
SELECT 
  wo.quote_number,
  wo.status,
  COUNT(li.id) as line_item_count,
  SUM(li.quantity * li.unit_price) as base_total,
  SUM(li.total_price) as total_with_markup,
  wo.subtotal as wo_subtotal,
  wo.total_amount as wo_total
FROM work_orders wo
LEFT JOIN work_order_line_items li ON li.work_order_id = wo.id
WHERE wo.status IN ('draft', 'sent', 'presented', 'approved')
GROUP BY wo.id, wo.quote_number, wo.status, wo.subtotal, wo.total_amount
ORDER BY wo.created_at DESC
LIMIT 10;

