-- Drop and recreate the trigger to use the updated function
DROP TRIGGER IF EXISTS enforce_work_order_status_trigger ON work_orders;

-- Recreate the trigger function (simplified - allow all transitions)
CREATE OR REPLACE FUNCTION enforce_work_order_status()
RETURNS TRIGGER AS $$
BEGIN
    -- ✅ If NEW.status is NULL, keep OLD.status
    IF NEW.status IS NULL AND OLD.status IS NOT NULL THEN
        NEW.status := OLD.status;
    END IF;

    -- ✅ REMOVED: Status validation - frontend controls workflow
    -- No validation, just allow all status changes

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER enforce_work_order_status_trigger
    BEFORE UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION enforce_work_order_status();

-- Verify
SELECT 'Trigger recreated - status validation DISABLED' as message;

