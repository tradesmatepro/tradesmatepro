-- =====================================================
-- INVENTORY STOCK AUTOMATIC UPDATE TRIGGERS
-- =====================================================
-- This script creates triggers to automatically update inventory_stock
-- when inventory_movements are created, updated, or deleted

-- 1. Function to update stock levels based on movements
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
DECLARE
    movement_quantity NUMERIC;
    old_movement_quantity NUMERIC;
    stock_change NUMERIC;
BEGIN
    -- Handle INSERT (new movement)
    IF TG_OP = 'INSERT' THEN
        movement_quantity := NEW.quantity;
        
        -- Determine if this is an incoming or outgoing movement
        IF NEW.movement_type IN ('PURCHASE', 'RETURN') THEN
            stock_change := movement_quantity; -- Positive (add to stock)
        ELSIF NEW.movement_type IN ('USAGE', 'TRANSFER') THEN
            stock_change := -movement_quantity; -- Negative (remove from stock)
        ELSIF NEW.movement_type = 'ADJUSTMENT' THEN
            stock_change := movement_quantity; -- Can be positive or negative
        ELSE
            stock_change := 0; -- Unknown movement type, no change
        END IF;
        
        -- Update or insert stock record
        INSERT INTO inventory_stock (item_id, location_id, company_id, quantity, updated_at)
        VALUES (NEW.item_id, NEW.location_id, NEW.company_id, stock_change, NOW())
        ON CONFLICT (item_id, location_id, company_id)
        DO UPDATE SET 
            quantity = inventory_stock.quantity + stock_change,
            updated_at = NOW();
            
        RETURN NEW;
    END IF;
    
    -- Handle UPDATE (movement changed)
    IF TG_OP = 'UPDATE' THEN
        -- Reverse the old movement
        old_movement_quantity := OLD.quantity;
        IF OLD.movement_type IN ('PURCHASE', 'RETURN') THEN
            stock_change := -old_movement_quantity; -- Reverse positive
        ELSIF OLD.movement_type IN ('USAGE', 'TRANSFER') THEN
            stock_change := old_movement_quantity; -- Reverse negative
        ELSIF OLD.movement_type = 'ADJUSTMENT' THEN
            stock_change := -old_movement_quantity; -- Reverse adjustment
        ELSE
            stock_change := 0;
        END IF;
        
        -- Apply the reversal
        UPDATE inventory_stock 
        SET quantity = quantity + stock_change, updated_at = NOW()
        WHERE item_id = OLD.item_id 
          AND location_id = OLD.location_id 
          AND company_id = OLD.company_id;
        
        -- Apply the new movement
        movement_quantity := NEW.quantity;
        IF NEW.movement_type IN ('PURCHASE', 'RETURN') THEN
            stock_change := movement_quantity; -- Positive
        ELSIF NEW.movement_type IN ('USAGE', 'TRANSFER') THEN
            stock_change := -movement_quantity; -- Negative
        ELSIF NEW.movement_type = 'ADJUSTMENT' THEN
            stock_change := movement_quantity; -- Can be positive or negative
        ELSE
            stock_change := 0;
        END IF;
        
        -- Update or insert stock record for new values
        INSERT INTO inventory_stock (item_id, location_id, company_id, quantity, updated_at)
        VALUES (NEW.item_id, NEW.location_id, NEW.company_id, stock_change, NOW())
        ON CONFLICT (item_id, location_id, company_id)
        DO UPDATE SET 
            quantity = inventory_stock.quantity + stock_change,
            updated_at = NOW();
            
        RETURN NEW;
    END IF;
    
    -- Handle DELETE (movement removed)
    IF TG_OP = 'DELETE' THEN
        old_movement_quantity := OLD.quantity;
        
        -- Reverse the movement
        IF OLD.movement_type IN ('PURCHASE', 'RETURN') THEN
            stock_change := -old_movement_quantity; -- Reverse positive
        ELSIF OLD.movement_type IN ('USAGE', 'TRANSFER') THEN
            stock_change := old_movement_quantity; -- Reverse negative
        ELSIF OLD.movement_type = 'ADJUSTMENT' THEN
            stock_change := -old_movement_quantity; -- Reverse adjustment
        ELSE
            stock_change := 0;
        END IF;
        
        -- Apply the reversal
        UPDATE inventory_stock 
        SET quantity = quantity + stock_change, updated_at = NOW()
        WHERE item_id = OLD.item_id 
          AND location_id = OLD.location_id 
          AND company_id = OLD.company_id;
          
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS trigger_update_inventory_stock ON inventory_movements;
CREATE TRIGGER trigger_update_inventory_stock
    AFTER INSERT OR UPDATE OR DELETE ON inventory_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_stock();

-- 3. Function to recalculate all stock levels (for data repair)
CREATE OR REPLACE FUNCTION recalculate_inventory_stock(target_company_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    movement_record RECORD;
    stock_change NUMERIC;
    processed_count INTEGER := 0;
BEGIN
    -- Clear existing stock for the company (or all if no company specified)
    IF target_company_id IS NOT NULL THEN
        DELETE FROM inventory_stock WHERE company_id = target_company_id;
    ELSE
        DELETE FROM inventory_stock;
    END IF;
    
    -- Recalculate stock from all movements
    FOR movement_record IN 
        SELECT * FROM inventory_movements 
        WHERE (target_company_id IS NULL OR company_id = target_company_id)
        ORDER BY created_at ASC
    LOOP
        -- Determine stock change
        IF movement_record.movement_type IN ('PURCHASE', 'RETURN') THEN
            stock_change := movement_record.quantity; -- Positive
        ELSIF movement_record.movement_type IN ('USAGE', 'TRANSFER') THEN
            stock_change := -movement_record.quantity; -- Negative
        ELSIF movement_record.movement_type = 'ADJUSTMENT' THEN
            stock_change := movement_record.quantity; -- Can be positive or negative
        ELSE
            stock_change := 0; -- Unknown type
        END IF;
        
        -- Update or insert stock record
        INSERT INTO inventory_stock (item_id, location_id, company_id, quantity, updated_at)
        VALUES (movement_record.item_id, movement_record.location_id, movement_record.company_id, stock_change, NOW())
        ON CONFLICT (item_id, location_id, company_id)
        DO UPDATE SET 
            quantity = inventory_stock.quantity + stock_change,
            updated_at = NOW();
            
        processed_count := processed_count + 1;
    END LOOP;
    
    RETURN 'Recalculated stock levels from ' || processed_count || ' movements';
END;
$$ LANGUAGE plpgsql;

-- 4. Add unique constraint to prevent duplicate stock records
ALTER TABLE inventory_stock 
ADD CONSTRAINT IF NOT EXISTS unique_item_location_company 
UNIQUE (item_id, location_id, company_id);

-- 5. Add comment for documentation
COMMENT ON FUNCTION update_inventory_stock() IS 'Automatically updates inventory_stock table when movements are created, updated, or deleted';
COMMENT ON FUNCTION recalculate_inventory_stock(UUID) IS 'Recalculates all stock levels from movement history. Use for data repair.';

-- 6. Example usage to recalculate stock for a specific company:
-- SELECT recalculate_inventory_stock('your-company-id-here');

-- 7. Example usage to recalculate stock for all companies:
-- SELECT recalculate_inventory_stock();
