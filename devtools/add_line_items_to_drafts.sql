-- Add line items to draft quotes so they show data when editing
-- This fixes the issue where editing quotes shows $0.00 and no parts/materials

DO $$
DECLARE
  v_company_id UUID := 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';
  v_wo_001_id UUID;
  v_wo_002_id UUID;
  v_wo_003_id UUID;
BEGIN
  -- Get work order IDs
  SELECT id INTO v_wo_001_id FROM work_orders WHERE work_order_number = 'WO-TEST-001';
  SELECT id INTO v_wo_002_id FROM work_orders WHERE work_order_number = 'WO-TEST-002';
  SELECT id INTO v_wo_003_id FROM work_orders WHERE work_order_number = 'WO-TEST-003';

  -- WO-TEST-001: Kitchen Sink Repair ($500 subtotal)
  INSERT INTO work_order_line_items (work_order_id, line_type, description, quantity, unit_price, tax_rate, sort_order, taxable)
  VALUES
    (v_wo_001_id, 'labor', 'Plumbing Labor - Sink Repair', 4.0, 75.00, 0.0825, 1, true),
    (v_wo_001_id, 'material', 'Kitchen Faucet Assembly', 1.0, 125.00, 0.0825, 2, true),
    (v_wo_001_id, 'material', 'Supply Lines and Fittings', 1.0, 75.00, 0.0825, 3, true);

  -- WO-TEST-002: Bathroom Remodel ($800 subtotal)
  INSERT INTO work_order_line_items (work_order_id, line_type, description, quantity, unit_price, tax_rate, sort_order, taxable)
  VALUES
    (v_wo_002_id, 'labor', 'Bathroom Remodeling Labor', 8.0, 75.00, 0.0825, 1, true),
    (v_wo_002_id, 'material', 'Vanity Cabinet', 1.0, 150.00, 0.0825, 2, true),
    (v_wo_002_id, 'material', 'Toilet Fixture', 1.0, 200.00, 0.0825, 3, true),
    (v_wo_002_id, 'material', 'Tile and Grout', 1.0, 250.00, 0.0825, 4, true);

  -- WO-TEST-003: Water Heater Install ($1200 subtotal)
  INSERT INTO work_order_line_items (work_order_id, line_type, description, quantity, unit_price, tax_rate, sort_order, taxable)
  VALUES
    (v_wo_003_id, 'labor', 'Water Heater Installation Labor', 6.0, 95.00, 0.0825, 1, true),
    (v_wo_003_id, 'material', '50 Gallon Water Heater Unit', 1.0, 550.00, 0.0825, 2, true),
    (v_wo_003_id, 'material', 'Expansion Tank', 1.0, 80.00, 0.0825, 3, true);

  RAISE NOTICE '✅ Added line items to 3 draft quotes';
  RAISE NOTICE '   WO-TEST-001: 3 line items (labor + 2 materials)';
  RAISE NOTICE '   WO-TEST-002: 4 line items (labor + 3 materials)';
  RAISE NOTICE '   WO-TEST-003: 3 line items (labor + 2 materials)';
END $$;

-- Verify the line items were added
SELECT 
  wo.work_order_number,
  wo.title,
  wo.status,
  COUNT(li.id) as line_item_count,
  SUM(li.quantity * li.unit_price) as calculated_subtotal,
  wo.subtotal as stored_subtotal
FROM work_orders wo
LEFT JOIN work_order_line_items li ON wo.id = li.work_order_id
WHERE wo.work_order_number IN ('WO-TEST-001', 'WO-TEST-002', 'WO-TEST-003')
GROUP BY wo.id, wo.work_order_number, wo.title, wo.status, wo.subtotal
ORDER BY wo.work_order_number;

