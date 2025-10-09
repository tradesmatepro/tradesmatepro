-- Purchase Order Budget Enhancement
-- Add budget_amount field to purchase_orders table

-- Add budget_amount column to purchase_orders table
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS budget_amount NUMERIC DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN purchase_orders.budget_amount IS 'Optional budget limit for the purchase order';

-- Create index for budget queries
CREATE INDEX IF NOT EXISTS idx_purchase_orders_budget ON purchase_orders(budget_amount) WHERE budget_amount IS NOT NULL;

-- Create function to check budget compliance
CREATE OR REPLACE FUNCTION check_po_budget_compliance(po_id UUID)
RETURNS JSONB AS $$
DECLARE
    po_record RECORD;
    result JSONB;
BEGIN
    -- Get PO details
    SELECT budget_amount, total_amount, po_number
    INTO po_record
    FROM purchase_orders 
    WHERE id = po_id;
    
    -- If no budget set, return compliant
    IF po_record.budget_amount IS NULL THEN
        result := jsonb_build_object(
            'compliant', true,
            'budget_amount', null,
            'total_amount', po_record.total_amount,
            'variance', null,
            'message', 'No budget limit set'
        );
    ELSE
        -- Check compliance
        result := jsonb_build_object(
            'compliant', po_record.total_amount <= po_record.budget_amount,
            'budget_amount', po_record.budget_amount,
            'total_amount', po_record.total_amount,
            'variance', po_record.total_amount - po_record.budget_amount,
            'message', CASE 
                WHEN po_record.total_amount <= po_record.budget_amount THEN 'Within budget'
                ELSE 'Exceeds budget by $' || (po_record.total_amount - po_record.budget_amount)::TEXT
            END
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_po_budget_compliance(UUID) TO authenticated;

-- Create trigger function to log budget violations
CREATE OR REPLACE FUNCTION log_budget_violation()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if budget is set and exceeded
    IF NEW.budget_amount IS NOT NULL AND NEW.total_amount > NEW.budget_amount THEN
        INSERT INTO po_status_history (
            company_id,
            purchase_order_id,
            old_status,
            new_status,
            note,
            changed_at
        ) VALUES (
            NEW.company_id,
            NEW.id,
            OLD.status,
            NEW.status,
            'Budget exceeded: $' || NEW.total_amount || ' > $' || NEW.budget_amount || ' (variance: $' || (NEW.total_amount - NEW.budget_amount) || ')',
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for budget violation logging
DROP TRIGGER IF EXISTS trigger_log_budget_violation ON purchase_orders;
CREATE TRIGGER trigger_log_budget_violation
    AFTER UPDATE ON purchase_orders
    FOR EACH ROW
    WHEN (NEW.total_amount IS DISTINCT FROM OLD.total_amount OR NEW.budget_amount IS DISTINCT FROM OLD.budget_amount)
    EXECUTE FUNCTION log_budget_violation();

-- Update existing POs to have default budget (optional - can be removed if not desired)
-- UPDATE purchase_orders SET budget_amount = total_amount * 1.1 WHERE budget_amount IS NULL AND total_amount > 0;
