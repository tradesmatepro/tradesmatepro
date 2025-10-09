-- =====================================================
-- INVENTORY TRANSFERS MIGRATION
-- =====================================================
-- Add support for inventory transfers between locations

-- 1. Add transfer-specific columns to inventory_movements
ALTER TABLE inventory_movements 
ADD COLUMN IF NOT EXISTS from_location_id UUID REFERENCES inventory_locations(id),
ADD COLUMN IF NOT EXISTS to_location_id UUID REFERENCES inventory_locations(id);

-- 2. Add comments for documentation
COMMENT ON COLUMN inventory_movements.from_location_id IS 'Source location for transfers (only used when movement_type = TRANSFER)';
COMMENT ON COLUMN inventory_movements.to_location_id IS 'Destination location for transfers (only used when movement_type = TRANSFER)';

-- 3. Update the existing trigger to handle transfers
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
        
        -- Handle TRANSFER movements (special case)
        IF NEW.movement_type = 'TRANSFER' THEN
            -- Subtract from source location
            IF NEW.from_location_id IS NOT NULL THEN
                INSERT INTO inventory_stock (item_id, location_id, company_id, quantity, updated_at)
                VALUES (NEW.item_id, NEW.from_location_id, NEW.company_id, -movement_quantity, NOW())
                ON CONFLICT (item_id, location_id, company_id)
                DO UPDATE SET 
                    quantity = inventory_stock.quantity - movement_quantity,
                    updated_at = NOW();
            END IF;
            
            -- Add to destination location
            IF NEW.to_location_id IS NOT NULL THEN
                INSERT INTO inventory_stock (item_id, location_id, company_id, quantity, updated_at)
                VALUES (NEW.item_id, NEW.to_location_id, NEW.company_id, movement_quantity, NOW())
                ON CONFLICT (item_id, location_id, company_id)
                DO UPDATE SET 
                    quantity = inventory_stock.quantity + movement_quantity,
                    updated_at = NOW();
            END IF;
            
            RETURN NEW;
        END IF;
        
        -- Handle other movement types (existing logic)
        IF NEW.movement_type IN ('PURCHASE', 'RETURN') THEN
            stock_change := movement_quantity; -- Positive (add to stock)
        ELSIF NEW.movement_type IN ('USAGE') THEN
            stock_change := -movement_quantity; -- Negative (remove from stock)
        ELSIF NEW.movement_type = 'ADJUSTMENT' THEN
            stock_change := movement_quantity; -- Can be positive or negative
        ELSE
            stock_change := 0; -- Unknown movement type, no change
        END IF;
        
        -- Update or insert stock record for non-transfer movements
        IF NEW.location_id IS NOT NULL THEN
            INSERT INTO inventory_stock (item_id, location_id, company_id, quantity, updated_at)
            VALUES (NEW.item_id, NEW.location_id, NEW.company_id, stock_change, NOW())
            ON CONFLICT (item_id, location_id, company_id)
            DO UPDATE SET 
                quantity = inventory_stock.quantity + stock_change,
                updated_at = NOW();
        END IF;
            
        RETURN NEW;
    END IF;
    
    -- Handle UPDATE (movement changed) - simplified for now
    IF TG_OP = 'UPDATE' THEN
        -- For updates, we'll delete the old movement effect and apply the new one
        -- This is complex for transfers, so for now we'll prevent updates to transfer movements
        IF OLD.movement_type = 'TRANSFER' OR NEW.movement_type = 'TRANSFER' THEN
            RAISE EXCEPTION 'Transfer movements cannot be updated. Please delete and recreate.';
        END IF;
        
        -- Handle non-transfer updates (existing logic)
        -- Reverse the old movement
        old_movement_quantity := OLD.quantity;
        IF OLD.movement_type IN ('PURCHASE', 'RETURN') THEN
            stock_change := -old_movement_quantity; -- Reverse positive
        ELSIF OLD.movement_type IN ('USAGE') THEN
            stock_change := old_movement_quantity; -- Reverse negative
        ELSIF OLD.movement_type = 'ADJUSTMENT' THEN
            stock_change := -old_movement_quantity; -- Reverse adjustment
        ELSE
            stock_change := 0;
        END IF;
        
        -- Apply the reversal
        IF OLD.location_id IS NOT NULL THEN
            UPDATE inventory_stock 
            SET quantity = quantity + stock_change, updated_at = NOW()
            WHERE item_id = OLD.item_id 
              AND location_id = OLD.location_id 
              AND company_id = OLD.company_id;
        END IF;
        
        -- Apply the new movement
        movement_quantity := NEW.quantity;
        IF NEW.movement_type IN ('PURCHASE', 'RETURN') THEN
            stock_change := movement_quantity; -- Positive
        ELSIF NEW.movement_type IN ('USAGE') THEN
            stock_change := -movement_quantity; -- Negative
        ELSIF NEW.movement_type = 'ADJUSTMENT' THEN
            stock_change := movement_quantity; -- Can be positive or negative
        ELSE
            stock_change := 0;
        END IF;
        
        -- Update or insert stock record for new values
        IF NEW.location_id IS NOT NULL THEN
            INSERT INTO inventory_stock (item_id, location_id, company_id, quantity, updated_at)
            VALUES (NEW.item_id, NEW.location_id, NEW.company_id, stock_change, NOW())
            ON CONFLICT (item_id, location_id, company_id)
            DO UPDATE SET 
                quantity = inventory_stock.quantity + stock_change,
                updated_at = NOW();
        END IF;
            
        RETURN NEW;
    END IF;
    
    -- Handle DELETE (movement removed)
    IF TG_OP = 'DELETE' THEN
        -- Handle TRANSFER deletions
        IF OLD.movement_type = 'TRANSFER' THEN
            -- Reverse the transfer: add back to source, subtract from destination
            IF OLD.from_location_id IS NOT NULL THEN
                UPDATE inventory_stock 
                SET quantity = quantity + OLD.quantity, updated_at = NOW()
                WHERE item_id = OLD.item_id 
                  AND location_id = OLD.from_location_id 
                  AND company_id = OLD.company_id;
            END IF;
            
            IF OLD.to_location_id IS NOT NULL THEN
                UPDATE inventory_stock 
                SET quantity = quantity - OLD.quantity, updated_at = NOW()
                WHERE item_id = OLD.item_id 
                  AND location_id = OLD.to_location_id 
                  AND company_id = OLD.company_id;
            END IF;
            
            RETURN OLD;
        END IF;
        
        -- Handle other movement deletions (existing logic)
        old_movement_quantity := OLD.quantity;
        
        -- Reverse the movement
        IF OLD.movement_type IN ('PURCHASE', 'RETURN') THEN
            stock_change := -old_movement_quantity; -- Reverse positive
        ELSIF OLD.movement_type IN ('USAGE') THEN
            stock_change := old_movement_quantity; -- Reverse negative
        ELSIF OLD.movement_type = 'ADJUSTMENT' THEN
            stock_change := -old_movement_quantity; -- Reverse adjustment
        ELSE
            stock_change := 0;
        END IF;
        
        -- Apply the reversal
        IF OLD.location_id IS NOT NULL THEN
            UPDATE inventory_stock 
            SET quantity = quantity + stock_change, updated_at = NOW()
            WHERE item_id = OLD.item_id 
              AND location_id = OLD.location_id 
              AND company_id = OLD.company_id;
        END IF;
          
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Recreate the trigger (it should already exist from previous migration)
DROP TRIGGER IF EXISTS trigger_update_inventory_stock ON inventory_movements;
CREATE TRIGGER trigger_update_inventory_stock
    AFTER INSERT OR UPDATE OR DELETE ON inventory_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_stock();

-- 5. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_movements_from_location ON inventory_movements(from_location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_to_location ON inventory_movements(to_location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_transfer_type ON inventory_movements(movement_type) WHERE movement_type = 'TRANSFER';

-- 6. Add check constraint to ensure transfer movements have both locations
ALTER TABLE inventory_movements 
ADD CONSTRAINT IF NOT EXISTS check_transfer_locations 
CHECK (
    (movement_type != 'TRANSFER') OR 
    (movement_type = 'TRANSFER' AND from_location_id IS NOT NULL AND to_location_id IS NOT NULL AND from_location_id != to_location_id)
);

COMMENT ON CONSTRAINT check_transfer_locations ON inventory_movements IS 'Ensures transfer movements have valid from and to locations that are different';

-- 7. Update existing TRANSFER movements to have proper location references (if any exist)
-- This is a data migration - you may need to adjust based on your existing data
-- UPDATE inventory_movements 
-- SET from_location_id = location_id 
-- WHERE movement_type = 'TRANSFER' AND from_location_id IS NULL AND location_id IS NOT NULL;
