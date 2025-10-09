-- DISABLE the invoice auto-calculate trigger (same bug as work_orders)
-- Frontend already calculates invoice totals correctly

DROP TRIGGER IF EXISTS trigger_calculate_invoice_totals ON invoice_line_items;

-- Document why it's disabled
COMMENT ON FUNCTION calculate_invoice_totals() IS 
'DISABLED: This trigger was recalculating invoice totals incorrectly (same bug as work_orders). 
Frontend calculates totals correctly before saving. 
Modern SaaS architecture: frontend calculates, backend stores.';

