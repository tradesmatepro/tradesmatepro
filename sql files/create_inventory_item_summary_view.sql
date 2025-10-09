-- Create inventory_item_summary view for main inventory page
-- Run this in your Supabase SQL editor AFTER creating inventory_stock_status view

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
ORDER BY 
    i.name;

-- Grant access to the view
GRANT SELECT ON inventory_item_summary TO authenticated;
GRANT SELECT ON inventory_item_summary TO anon;
