-- DISABLE the auto-calculate trigger that's breaking updates
-- The frontend already calculates totals correctly
-- This trigger is recalculating wrong and violating the CHECK constraint

DROP TRIGGER IF EXISTS trigger_calculate_work_order_totals ON work_order_line_items;

-- Document why it's disabled
COMMENT ON FUNCTION calculate_work_order_totals() IS 
'DISABLED: This trigger was recalculating totals incorrectly (double-taxing). 
Frontend calculates totals correctly before saving. 
If re-enabled, must fix the tax calculation logic.';

