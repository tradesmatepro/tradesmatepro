-- Fix Jobs Schema Issues
-- Run this in your Supabase SQL editor to fix the work_order_items issues

-- 1. Ensure work_order_items table exists with proper structure
CREATE TABLE IF NOT EXISTS public.work_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('labor', 'material', 'service')),
    name TEXT NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) DEFAULT 1,
    rate DECIMAL(12,4) DEFAULT 0,
    total DECIMAL(12,4) DEFAULT 0,
    unit TEXT DEFAULT 'each',
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_order_items_work_order_id ON public.work_order_items(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_items_company_id ON public.work_order_items(company_id);
CREATE INDEX IF NOT EXISTS idx_work_order_items_type ON public.work_order_items(item_type);

-- 3. Enable Row Level Security
ALTER TABLE public.work_order_items ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
DROP POLICY IF EXISTS "Users can view company work order items" ON public.work_order_items;
CREATE POLICY "Users can view company work order items" ON public.work_order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = work_order_items.company_id
        )
    );

DROP POLICY IF EXISTS "Users can manage company work order items" ON public.work_order_items;
CREATE POLICY "Users can manage company work order items" ON public.work_order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = work_order_items.company_id
        )
    );

-- 5. Grant permissions
GRANT ALL ON public.work_order_items TO authenticated;

-- 6. Create updated_at trigger
CREATE TRIGGER work_order_items_updated_at
    BEFORE UPDATE ON public.work_order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Create some sample work order items for existing work orders (optional)
INSERT INTO public.work_order_items (work_order_id, company_id, item_type, name, description, quantity, rate, total)
SELECT 
    wo.id as work_order_id,
    wo.company_id,
    'labor' as item_type,
    'Standard Labor' as name,
    'General labor for job completion' as description,
    8.0 as quantity,
    75.00 as rate,
    600.00 as total
FROM public.work_orders wo
WHERE wo.stage IN ('JOB', 'WORK_ORDER')
AND NOT EXISTS (
    SELECT 1 FROM public.work_order_items woi 
    WHERE woi.work_order_id = wo.id
)
LIMIT 10;

-- Add material items too
INSERT INTO public.work_order_items (work_order_id, company_id, item_type, name, description, quantity, rate, total)
SELECT 
    wo.id as work_order_id,
    wo.company_id,
    'material' as item_type,
    'Standard Materials' as name,
    'Materials required for job' as description,
    1.0 as quantity,
    150.00 as rate,
    150.00 as total
FROM public.work_orders wo
WHERE wo.stage IN ('JOB', 'WORK_ORDER')
AND EXISTS (
    SELECT 1 FROM public.work_order_items woi 
    WHERE woi.work_order_id = wo.id 
    AND woi.item_type = 'labor'
)
AND NOT EXISTS (
    SELECT 1 FROM public.work_order_items woi 
    WHERE woi.work_order_id = wo.id 
    AND woi.item_type = 'material'
)
LIMIT 10;

-- 8. Create a view for jobs with calculated totals
CREATE OR REPLACE VIEW public.jobs_with_totals AS
SELECT 
    wo.*,
    COALESCE(item_totals.labor_cost, 0) as labor_cost,
    COALESCE(item_totals.material_cost, 0) as material_cost,
    COALESCE(item_totals.total_cost, 0) as calculated_total,
    COALESCE(item_totals.estimated_hours, 0) as estimated_hours
FROM public.work_orders wo
LEFT JOIN (
    SELECT 
        work_order_id,
        SUM(CASE WHEN item_type = 'labor' THEN total ELSE 0 END) as labor_cost,
        SUM(CASE WHEN item_type = 'material' THEN total ELSE 0 END) as material_cost,
        SUM(total) as total_cost,
        SUM(CASE WHEN item_type = 'labor' THEN quantity ELSE 0 END) as estimated_hours
    FROM public.work_order_items
    GROUP BY work_order_id
) item_totals ON wo.id = item_totals.work_order_id
WHERE wo.stage IN ('JOB', 'WORK_ORDER');

-- Grant access to the view
GRANT SELECT ON public.jobs_with_totals TO authenticated;

-- 9. Create function to ensure work_order_items exist for new jobs
CREATE OR REPLACE FUNCTION public.create_default_work_order_items()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create default items for jobs (not quotes)
    IF NEW.stage IN ('JOB', 'WORK_ORDER') AND OLD.stage = 'QUOTE' THEN
        -- Add default labor item
        INSERT INTO public.work_order_items (
            work_order_id, 
            company_id, 
            item_type, 
            name, 
            description, 
            quantity, 
            rate, 
            total
        ) VALUES (
            NEW.id,
            NEW.company_id,
            'labor',
            'Standard Labor',
            'Labor for job completion',
            8.0,
            75.00,
            600.00
        );
        
        -- Add default material item
        INSERT INTO public.work_order_items (
            work_order_id, 
            company_id, 
            item_type, 
            name, 
            description, 
            quantity, 
            rate, 
            total
        ) VALUES (
            NEW.id,
            NEW.company_id,
            'material',
            'Materials',
            'Materials required for job',
            1.0,
            150.00,
            150.00
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger to auto-create work order items when quote becomes job
DROP TRIGGER IF EXISTS create_work_order_items_trigger ON public.work_orders;
CREATE TRIGGER create_work_order_items_trigger
    AFTER UPDATE ON public.work_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_work_order_items();

COMMIT;
