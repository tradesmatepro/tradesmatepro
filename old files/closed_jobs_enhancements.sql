-- Closed Jobs Enhancements SQL Script
-- Add columns for advanced analytics, customer feedback, and warranty tracking

-- Add customer feedback tracking columns
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS feedback_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS feedback_method VARCHAR(10) CHECK (feedback_method IN ('email', 'sms')),
ADD COLUMN IF NOT EXISTS customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
ADD COLUMN IF NOT EXISTS customer_feedback TEXT,
ADD COLUMN IF NOT EXISTS feedback_received_at TIMESTAMPTZ;

-- Add warranty tracking columns
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS warranty_period INTEGER DEFAULT 0, -- warranty period in days
ADD COLUMN IF NOT EXISTS warranty_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS warranty_notes TEXT;

-- Add cost tracking columns for profit/loss analysis
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS labor_hours DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS labor_rate DECIMAL(10,2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS material_cost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS equipment_cost DECIMAL(10,2) DEFAULT 0;

-- Add technician assignment column if not exists
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);

-- Create index for better performance on analytics queries
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned_to ON work_orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_orders_warranty_period ON work_orders(warranty_period) WHERE warranty_period > 0;
CREATE INDEX IF NOT EXISTS idx_work_orders_customer_rating ON work_orders(customer_rating) WHERE customer_rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_work_orders_feedback_requested ON work_orders(feedback_requested_at) WHERE feedback_requested_at IS NOT NULL;

-- Create a view for warranty tracking
CREATE OR REPLACE VIEW active_warranties AS
SELECT 
    wo.*,
    (warranty_start_date + INTERVAL '1 day' * warranty_period) AS warranty_end_date,
    CASE 
        WHEN (warranty_start_date + INTERVAL '1 day' * warranty_period) > NOW() 
        THEN 'ACTIVE'
        ELSE 'EXPIRED'
    END AS warranty_status,
    EXTRACT(DAYS FROM (warranty_start_date + INTERVAL '1 day' * warranty_period) - NOW()) AS days_remaining
FROM work_orders wo
WHERE warranty_period > 0 
    AND warranty_start_date IS NOT NULL
    AND unified_status = 'closed_job';

-- Create a view for technician performance analytics
CREATE OR REPLACE VIEW technician_performance AS
SELECT 
    u.id as technician_id,
    COALESCE(u.full_name, u.email) as technician_name,
    COUNT(wo.id) as jobs_completed,
    SUM(wo.total_amount) as total_revenue,
    SUM(wo.labor_hours) as total_hours,
    AVG(wo.customer_rating) as avg_rating,
    COUNT(wo.customer_rating) as rating_count,
    SUM(wo.labor_hours * wo.labor_rate + wo.material_cost + wo.equipment_cost) as total_costs,
    SUM(wo.total_amount) - SUM(wo.labor_hours * wo.labor_rate + wo.material_cost + wo.equipment_cost) as gross_profit
FROM auth.users u
LEFT JOIN work_orders wo ON wo.assigned_to = u.id 
    AND wo.unified_status = 'closed_job'
WHERE u.id IN (SELECT DISTINCT assigned_to FROM work_orders WHERE assigned_to IS NOT NULL)
GROUP BY u.id, u.full_name, u.email;

-- Create a function to calculate job profitability
CREATE OR REPLACE FUNCTION calculate_job_profitability(job_id UUID)
RETURNS TABLE (
    revenue DECIMAL,
    labor_cost DECIMAL,
    material_cost DECIMAL,
    equipment_cost DECIMAL,
    total_cost DECIMAL,
    gross_profit DECIMAL,
    profit_margin DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wo.total_amount as revenue,
        (wo.labor_hours * wo.labor_rate) as labor_cost,
        wo.material_cost,
        wo.equipment_cost,
        (wo.labor_hours * wo.labor_rate + wo.material_cost + wo.equipment_cost) as total_cost,
        (wo.total_amount - (wo.labor_hours * wo.labor_rate + wo.material_cost + wo.equipment_cost)) as gross_profit,
        CASE 
            WHEN wo.total_amount > 0 
            THEN ((wo.total_amount - (wo.labor_hours * wo.labor_rate + wo.material_cost + wo.equipment_cost)) / wo.total_amount * 100)
            ELSE 0
        END as profit_margin
    FROM work_orders wo
    WHERE wo.id = job_id;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for the new columns (assuming RLS is enabled)
-- These policies should match your existing work_orders RLS policies

-- Grant permissions to authenticated users
GRANT SELECT ON active_warranties TO authenticated;
GRANT SELECT ON technician_performance TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_job_profitability(UUID) TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN work_orders.feedback_requested_at IS 'Timestamp when customer feedback was requested';
COMMENT ON COLUMN work_orders.feedback_method IS 'Method used to request feedback (email or sms)';
COMMENT ON COLUMN work_orders.customer_rating IS 'Customer rating from 1-5 stars';
COMMENT ON COLUMN work_orders.customer_feedback IS 'Customer feedback text';
COMMENT ON COLUMN work_orders.warranty_period IS 'Warranty period in days';
COMMENT ON COLUMN work_orders.warranty_start_date IS 'When warranty period starts (usually completion date)';
COMMENT ON COLUMN work_orders.warranty_notes IS 'Warranty terms and conditions';
COMMENT ON COLUMN work_orders.labor_hours IS 'Total labor hours for the job';
COMMENT ON COLUMN work_orders.labor_rate IS 'Hourly labor rate';
COMMENT ON COLUMN work_orders.material_cost IS 'Total cost of materials used';
COMMENT ON COLUMN work_orders.equipment_cost IS 'Total cost of equipment/tools used';

-- Sample data update (optional - uncomment if you want to populate some test data)
/*
UPDATE work_orders 
SET 
    labor_hours = 4.5,
    labor_rate = 75.00,
    material_cost = 150.00,
    equipment_cost = 25.00,
    warranty_period = 365,
    warranty_start_date = completed_at
WHERE unified_status = 'closed_job' 
    AND id IN (SELECT id FROM work_orders WHERE unified_status = 'closed_job' LIMIT 5);
*/
