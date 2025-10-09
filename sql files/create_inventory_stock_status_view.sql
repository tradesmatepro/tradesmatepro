-- Create inventory_stock_status view for enhanced inventory UI
-- Run this in your Supabase SQL editor

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
    s.location_id IS NOT NULL  -- Only include items that have stock records
ORDER BY 
    i.name, s.location_id;

-- Grant access to the view
GRANT SELECT ON inventory_stock_status TO authenticated;
GRANT SELECT ON inventory_stock_status TO anon;
