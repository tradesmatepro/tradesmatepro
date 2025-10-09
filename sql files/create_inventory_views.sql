-- Create Inventory Views for API Hardening
-- Run this script in Supabase SQL Editor to create the required views
-- This will eliminate API errors and improve inventory system performance

-- 1. Create inventory_stock_status view (base view for stock calculations)
CREATE OR REPLACE VIEW inventory_stock_status AS
SELECT 
    i.id as item_id,
    i.name as item_name,
    s.location_id,
    i.company_id,
    COALESCE(s.quantity, 0) as on_hand,
    COALESCE(reserved.total_reserved, 0) as reserved,
    GREATEST(0, COALESCE(s.quantity, 0) - COALESCE(reserved.total_reserved, 0)) as available,
    GREATEST(s.updated_at, i.updated_at) as updated_at
FROM 
    inventory_items i
LEFT JOIN 
    inventory_stock s ON i.id = s.item_id
LEFT JOIN (
    -- Calculate reserved quantities from allocations
    SELECT 
        item_id,
        location_id,
        SUM(quantity) as total_reserved
    FROM 
        inventory_movements 
    WHERE 
        movement_type = 'ALLOCATION'
    GROUP BY 
        item_id, location_id
) reserved ON s.item_id = reserved.item_id AND s.location_id = reserved.location_id
WHERE 
    i.company_id IS NOT NULL;

COMMENT ON VIEW inventory_stock_status IS 'Base view for inventory stock status calculations with reserved quantities';

-- 2. Create inventory_stock_status_named_v (enhanced view with names for REST-safe selection)
CREATE OR REPLACE VIEW inventory_stock_status_named_v AS
SELECT 
    iss.item_id,
    ii.name AS item_name,
    ii.sku,
    ii.category,
    ii.reorder_point,
    iss.location_id,
    il.name AS location_name,
    il.type AS location_type,
    iss.company_id,
    iss.on_hand,
    iss.reserved,
    iss.available,
    iss.updated_at
FROM inventory_stock_status iss
LEFT JOIN inventory_items ii ON ii.id = iss.item_id
LEFT JOIN inventory_locations il ON il.id = iss.location_id;

COMMENT ON VIEW inventory_stock_status_named_v IS 'Per-location stock with item and location names for REST-safe selection';

-- 3. Create inventory_item_summary view (aggregated summary for dashboard)
CREATE OR REPLACE VIEW inventory_item_summary AS
SELECT 
    i.id as item_id,
    i.name as item_name,
    i.sku,
    i.description,
    i.category,
    i.unit_of_measure,
    i.cost,
    i.sell_price,
    i.reorder_point,
    i.company_id,
    COALESCE(stock_totals.total_on_hand, 0) as total_on_hand,
    COALESCE(stock_totals.total_reserved, 0) as total_reserved,
    COALESCE(stock_totals.total_available, 0) as total_available,
    CASE 
        WHEN COALESCE(stock_totals.total_available, 0) = 0 THEN 'OUT_OF_STOCK'
        WHEN COALESCE(stock_totals.total_available, 0) <= COALESCE(i.reorder_point, 5) THEN 'LOW_STOCK'
        ELSE 'IN_STOCK'
    END as stock_status,
    (COALESCE(i.cost, 0) * COALESCE(stock_totals.total_on_hand, 0)) as item_value,
    i.updated_at
FROM 
    inventory_items i
LEFT JOIN (
    -- Aggregate stock across all locations for each item
    SELECT 
        item_id,
        SUM(on_hand) as total_on_hand,
        SUM(reserved) as total_reserved,
        SUM(available) as total_available
    FROM 
        inventory_stock_status
    GROUP BY 
        item_id
) stock_totals ON i.id = stock_totals.item_id
WHERE 
    i.company_id IS NOT NULL;

COMMENT ON VIEW inventory_item_summary IS 'Aggregated inventory summary with stock status and values for dashboard display';

-- 4. Create inventory_total_value_v (company-wide inventory value)
CREATE OR REPLACE VIEW inventory_total_value_v AS
SELECT 
    company_id,
    COUNT(*) as total_items,
    SUM(CASE WHEN stock_status = 'IN_STOCK' THEN 1 ELSE 0 END) as in_stock_items,
    SUM(CASE WHEN stock_status = 'LOW_STOCK' THEN 1 ELSE 0 END) as low_stock_items,
    SUM(CASE WHEN stock_status = 'OUT_OF_STOCK' THEN 1 ELSE 0 END) as out_of_stock_items,
    SUM(item_value) as total_inventory_value,
    SUM(total_on_hand) as total_quantity_on_hand,
    SUM(total_available) as total_quantity_available
FROM 
    inventory_item_summary
GROUP BY 
    company_id;

COMMENT ON VIEW inventory_total_value_v IS 'Company-wide inventory statistics and total values';

-- Grant permissions (adjust as needed for your RLS setup)
-- These views inherit the RLS policies from their underlying tables
-- No additional grants needed if using service role key

-- Verification queries (uncomment to test)
-- SELECT 'inventory_stock_status' as view_name, COUNT(*) as row_count FROM inventory_stock_status LIMIT 1;
-- SELECT 'inventory_stock_status_named_v' as view_name, COUNT(*) as row_count FROM inventory_stock_status_named_v LIMIT 1;
-- SELECT 'inventory_item_summary' as view_name, COUNT(*) as row_count FROM inventory_item_summary LIMIT 1;
-- SELECT 'inventory_total_value_v' as view_name, COUNT(*) as row_count FROM inventory_total_value_v LIMIT 1;

-- Success message
SELECT 'Inventory views created successfully! The inventory system should now have improved performance and stability.' as status;
