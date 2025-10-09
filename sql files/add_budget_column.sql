-- Add budget_amount column to purchase_orders table
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS budget_amount NUMERIC DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN purchase_orders.budget_amount IS 'Optional budget limit for the purchase order';

-- Create index for budget queries
CREATE INDEX IF NOT EXISTS idx_purchase_orders_budget ON purchase_orders(budget_amount) WHERE budget_amount IS NOT NULL;
