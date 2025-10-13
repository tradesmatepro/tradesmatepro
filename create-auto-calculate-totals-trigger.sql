-- =====================================================
-- AUTO-CALCULATE WORK ORDER TOTALS FROM LINE ITEMS
-- =====================================================
-- This trigger automatically recalculates work order totals
-- whenever line items are inserted, updated, or deleted

-- Function to recalculate work order totals
CREATE OR REPLACE FUNCTION recalculate_work_order_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_work_order_id UUID;
  v_subtotal DECIMAL(10,2);
  v_tax_rate DECIMAL(5,2);
  v_tax_amount DECIMAL(10,2);
  v_total_amount DECIMAL(10,2);
BEGIN
  -- Get the work_order_id from the affected row
  IF TG_OP = 'DELETE' THEN
    v_work_order_id := OLD.work_order_id;
  ELSE
    v_work_order_id := NEW.work_order_id;
  END IF;

  -- Calculate subtotal from all line items
  SELECT COALESCE(SUM(total_price), 0)
  INTO v_subtotal
  FROM work_order_line_items
  WHERE work_order_id = v_work_order_id;

  -- Get tax rate from work order (or default to 0)
  SELECT COALESCE(tax_rate, 0)
  INTO v_tax_rate
  FROM work_orders
  WHERE id = v_work_order_id;

  -- Calculate tax amount
  v_tax_amount := v_subtotal * (v_tax_rate / 100);

  -- Calculate total
  v_total_amount := v_subtotal + v_tax_amount;

  -- Update work order with new totals
  UPDATE work_orders
  SET 
    subtotal = v_subtotal,
    tax_amount = v_tax_amount,
    total_amount = v_total_amount,
    updated_at = NOW()
  WHERE id = v_work_order_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_recalculate_totals_on_insert ON work_order_line_items;
DROP TRIGGER IF EXISTS trigger_recalculate_totals_on_update ON work_order_line_items;
DROP TRIGGER IF EXISTS trigger_recalculate_totals_on_delete ON work_order_line_items;

-- Create triggers for INSERT, UPDATE, DELETE
CREATE TRIGGER trigger_recalculate_totals_on_insert
AFTER INSERT ON work_order_line_items
FOR EACH ROW
EXECUTE FUNCTION recalculate_work_order_totals();

CREATE TRIGGER trigger_recalculate_totals_on_update
AFTER UPDATE ON work_order_line_items
FOR EACH ROW
EXECUTE FUNCTION recalculate_work_order_totals();

CREATE TRIGGER trigger_recalculate_totals_on_delete
AFTER DELETE ON work_order_line_items
FOR EACH ROW
EXECUTE FUNCTION recalculate_work_order_totals();

-- =====================================================
-- TEST: Recalculate all existing work orders
-- =====================================================
-- This will fix any existing quotes with $0.00 totals

DO $$
DECLARE
  v_work_order RECORD;
  v_subtotal DECIMAL(10,2);
  v_tax_rate DECIMAL(5,2);
  v_tax_amount DECIMAL(10,2);
  v_total_amount DECIMAL(10,2);
BEGIN
  FOR v_work_order IN 
    SELECT id, tax_rate FROM work_orders
  LOOP
    -- Calculate subtotal from line items
    SELECT COALESCE(SUM(total_price), 0)
    INTO v_subtotal
    FROM work_order_line_items
    WHERE work_order_id = v_work_order.id;

    -- Calculate tax
    v_tax_rate := COALESCE(v_work_order.tax_rate, 0);
    v_tax_amount := v_subtotal * (v_tax_rate / 100);
    v_total_amount := v_subtotal + v_tax_amount;

    -- Update work order
    UPDATE work_orders
    SET 
      subtotal = v_subtotal,
      tax_amount = v_tax_amount,
      total_amount = v_total_amount
    WHERE id = v_work_order.id;
  END LOOP;

  RAISE NOTICE 'Recalculated totals for all work orders';
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Show work orders with their calculated totals

SELECT 
  id,
  work_order_number,
  pricing_model,
  subtotal,
  tax_rate,
  tax_amount,
  total_amount,
  (SELECT COUNT(*) FROM work_order_line_items WHERE work_order_id = work_orders.id) as line_item_count,
  (SELECT SUM(total_price) FROM work_order_line_items WHERE work_order_id = work_orders.id) as calculated_subtotal
FROM work_orders
WHERE status IN ('draft', 'sent', 'approved')
ORDER BY created_at DESC
LIMIT 10;

