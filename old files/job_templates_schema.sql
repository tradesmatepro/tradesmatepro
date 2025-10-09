-- =====================================================
-- JOB TEMPLATES SYSTEM - SQL SCHEMA
-- Run this script in your Supabase SQL Editor
-- =====================================================

BEGIN;

-- 1. Create job_templates table
CREATE TABLE IF NOT EXISTS job_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- HVAC, Plumbing, Electrical, General, etc.
    
    -- Default job settings
    default_duration INTEGER DEFAULT 0, -- in minutes
    default_crew_size INTEGER DEFAULT 1,
    default_hourly_rate DECIMAL(10,2),
    default_markup_percentage DECIMAL(5,2) DEFAULT 30.00,
    default_pricing_model VARCHAR(50) DEFAULT 'TIME_MATERIALS' CHECK (default_pricing_model IN (
        'TIME_MATERIALS', 'FLAT_RATE', 'UNIT', 'MILESTONE', 'RECURRING', 'PERCENTAGE'
    )),
    
    -- Template metadata
    is_active BOOLEAN DEFAULT true,
    is_company_wide BOOLEAN DEFAULT true, -- vs user-specific
    usage_count INTEGER DEFAULT 0,
    
    -- Audit fields
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT job_templates_company_name_unique UNIQUE(company_id, name)
);

-- 2. Create job_template_items table (predefined services/materials)
CREATE TABLE IF NOT EXISTS job_template_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES job_templates(id) ON DELETE CASCADE,
    
    -- Item details
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('LABOR', 'MATERIAL', 'SERVICE')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Pricing
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'each', -- hours, each, sq ft, linear ft, etc.
    
    -- Labor specific
    labor_rate DECIMAL(10,2), -- override default hourly rate
    estimated_hours DECIMAL(5,2), -- for labor items
    
    -- Display order
    sort_order INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create job_template_checklists table (workflow steps)
CREATE TABLE IF NOT EXISTS job_template_checklists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES job_templates(id) ON DELETE CASCADE,
    
    -- Checklist item
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    
    -- Workflow stage
    stage VARCHAR(50) DEFAULT 'EXECUTION', -- PREPARATION, EXECUTION, COMPLETION
    sort_order INTEGER DEFAULT 0,
    
    -- Estimated time for this step
    estimated_minutes INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add template_id to work_orders table
DO $$
BEGIN
    -- Check if template_id column doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'work_orders' AND column_name = 'template_id'
    ) THEN
        ALTER TABLE work_orders ADD COLUMN template_id UUID REFERENCES job_templates(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_templates_company_id ON job_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_job_templates_category ON job_templates(category);
CREATE INDEX IF NOT EXISTS idx_job_templates_active ON job_templates(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_job_template_items_template_id ON job_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_job_template_items_type ON job_template_items(item_type);

CREATE INDEX IF NOT EXISTS idx_job_template_checklists_template_id ON job_template_checklists(template_id);
CREATE INDEX IF NOT EXISTS idx_job_template_checklists_stage ON job_template_checklists(stage);

CREATE INDEX IF NOT EXISTS idx_work_orders_template_id ON work_orders(template_id);

-- 6. Create RLS policies
ALTER TABLE job_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_template_checklists ENABLE ROW LEVEL SECURITY;

-- Job templates policies
CREATE POLICY "Users can view company job templates" ON job_templates
    FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can create company job templates" ON job_templates
    FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update company job templates" ON job_templates
    FOR UPDATE USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete company job templates" ON job_templates
    FOR DELETE USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Job template items policies
CREATE POLICY "Users can view template items" ON job_template_items
    FOR SELECT USING (
        template_id IN (
            SELECT id FROM job_templates 
            WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can manage template items" ON job_template_items
    FOR ALL USING (
        template_id IN (
            SELECT id FROM job_templates 
            WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
        )
    );

-- Job template checklists policies  
CREATE POLICY "Users can view template checklists" ON job_template_checklists
    FOR SELECT USING (
        template_id IN (
            SELECT id FROM job_templates 
            WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can manage template checklists" ON job_template_checklists
    FOR ALL USING (
        template_id IN (
            SELECT id FROM job_templates 
            WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
        )
    );

-- 7. Create function to update usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE job_templates 
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = template_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to get template with items
CREATE OR REPLACE FUNCTION get_job_template_with_items(template_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'template', row_to_json(t.*),
        'items', COALESCE(items.items_array, '[]'::json),
        'checklist', COALESCE(checklist.checklist_array, '[]'::json)
    ) INTO result
    FROM job_templates t
    LEFT JOIN (
        SELECT 
            template_id,
            json_agg(
                json_build_object(
                    'id', id,
                    'item_type', item_type,
                    'name', name,
                    'description', description,
                    'unit_price', unit_price,
                    'quantity', quantity,
                    'unit', unit,
                    'labor_rate', labor_rate,
                    'estimated_hours', estimated_hours,
                    'sort_order', sort_order
                ) ORDER BY sort_order
            ) as items_array
        FROM job_template_items
        WHERE template_id = template_uuid
        GROUP BY template_id
    ) items ON t.id = items.template_id
    LEFT JOIN (
        SELECT 
            template_id,
            json_agg(
                json_build_object(
                    'id', id,
                    'title', title,
                    'description', description,
                    'is_required', is_required,
                    'stage', stage,
                    'estimated_minutes', estimated_minutes,
                    'sort_order', sort_order
                ) ORDER BY sort_order
            ) as checklist_array
        FROM job_template_checklists
        WHERE template_id = template_uuid
        GROUP BY template_id
    ) checklist ON t.id = checklist.template_id
    WHERE t.id = template_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Insert some default templates for common services
INSERT INTO job_templates (company_id, name, description, category, default_duration, default_crew_size, default_hourly_rate, default_pricing_model, created_by)
SELECT
    c.id,
    template_name,
    template_description,
    template_category,
    template_duration,
    template_crew_size,
    75.00, -- default hourly rate
    template_pricing_model,
    NULL -- system created
FROM companies c
CROSS JOIN (
    VALUES 
        ('HVAC System Installation', 'Complete HVAC system installation including ductwork and electrical connections', 'HVAC', 480, 2, 'FLAT_RATE'),
        ('Plumbing Repair - Emergency', 'Emergency plumbing repair service for leaks, clogs, and pipe issues', 'Plumbing', 120, 1, 'TIME_MATERIALS'),
        ('Electrical Panel Upgrade', 'Upgrade electrical panel to modern standards with new breakers', 'Electrical', 360, 2, 'FLAT_RATE'),
        ('Water Heater Installation', 'Remove old water heater and install new unit with connections', 'Plumbing', 240, 2, 'FLAT_RATE'),
        ('AC Maintenance Service', 'Routine air conditioning maintenance and tune-up service', 'HVAC', 90, 1, 'RECURRING'),
        ('General Handyman Service', 'General repair and maintenance tasks around the property', 'General', 120, 1, 'TIME_MATERIALS'),
        ('Preventive Maintenance Contract', 'Annual preventive maintenance contract with quarterly visits', 'General', 90, 1, 'RECURRING'),
        ('Unit-Based Cleaning Service', 'Cleaning service charged per square foot or room', 'General', 60, 1, 'UNIT')
) AS templates(template_name, template_description, template_category, template_duration, template_crew_size, template_pricing_model)
ON CONFLICT (company_id, name) DO NOTHING;

-- 10. Create recurring_jobs table for maintenance contracts
CREATE TABLE IF NOT EXISTS recurring_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    template_id UUID REFERENCES job_templates(id) ON DELETE SET NULL,

    -- Basic info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

    -- Scheduling
    frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual')),
    start_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    end_date DATE, -- optional end date for contracts

    -- Job defaults
    default_duration INTEGER DEFAULT 0, -- in minutes
    default_crew_size INTEGER DEFAULT 1,
    default_price DECIMAL(10,2) DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'inactive', 'completed')),

    -- Tracking
    jobs_created INTEGER DEFAULT 0,
    last_job_created_at TIMESTAMP WITH TIME ZONE,

    -- Audit
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Create indexes for recurring jobs
CREATE INDEX IF NOT EXISTS idx_recurring_jobs_company_id ON recurring_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_recurring_jobs_customer_id ON recurring_jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_recurring_jobs_next_due ON recurring_jobs(next_due_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_recurring_jobs_template_id ON recurring_jobs(template_id);

-- 12. Create RLS policies for recurring jobs
ALTER TABLE recurring_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company recurring jobs" ON recurring_jobs
    FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can create company recurring jobs" ON recurring_jobs
    FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update company recurring jobs" ON recurring_jobs
    FOR UPDATE USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete company recurring jobs" ON recurring_jobs
    FOR DELETE USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- 13. Create function to calculate next due date
CREATE OR REPLACE FUNCTION calculate_next_due_date(current_date DATE, frequency_type VARCHAR)
RETURNS DATE AS $$
BEGIN
    CASE frequency_type
        WHEN 'weekly' THEN RETURN current_date + INTERVAL '1 week';
        WHEN 'biweekly' THEN RETURN current_date + INTERVAL '2 weeks';
        WHEN 'monthly' THEN RETURN current_date + INTERVAL '1 month';
        WHEN 'quarterly' THEN RETURN current_date + INTERVAL '3 months';
        WHEN 'semiannual' THEN RETURN current_date + INTERVAL '6 months';
        WHEN 'annual' THEN RETURN current_date + INTERVAL '1 year';
        ELSE RETURN current_date + INTERVAL '1 month';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 14. Create function to create job from recurring job
CREATE OR REPLACE FUNCTION create_job_from_recurring(recurring_job_id UUID)
RETURNS UUID AS $$
DECLARE
    recurring_record recurring_jobs%ROWTYPE;
    new_job_id UUID;
    template_data JSON;
BEGIN
    -- Get recurring job details
    SELECT * INTO recurring_record FROM recurring_jobs WHERE id = recurring_job_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Recurring job not found';
    END IF;

    -- Create new work order
    INSERT INTO work_orders (
        company_id,
        template_id,
        customer_id,
        title,
        description,
        stage,
        estimated_duration,
        total_amount,
        created_at,
        updated_at
    ) VALUES (
        recurring_record.company_id,
        recurring_record.template_id,
        recurring_record.customer_id,
        recurring_record.title,
        recurring_record.description,
        'JOB',
        recurring_record.default_duration,
        recurring_record.default_price,
        NOW(),
        NOW()
    ) RETURNING id INTO new_job_id;

    -- If there's a template, copy its items
    IF recurring_record.template_id IS NOT NULL THEN
        INSERT INTO work_order_items (
            work_order_id,
            item_type,
            description,
            quantity,
            unit_price,
            unit,
            labor_hours,
            labor_rate
        )
        SELECT
            new_job_id,
            jti.item_type,
            jti.name,
            jti.quantity,
            jti.unit_price,
            jti.unit,
            jti.estimated_hours,
            jti.labor_rate
        FROM job_template_items jti
        WHERE jti.template_id = recurring_record.template_id;
    END IF;

    -- Update recurring job tracking
    UPDATE recurring_jobs
    SET
        jobs_created = jobs_created + 1,
        last_job_created_at = NOW(),
        next_due_date = calculate_next_due_date(next_due_date, frequency),
        updated_at = NOW()
    WHERE id = recurring_job_id;

    RETURN new_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Create function to get due recurring jobs
CREATE OR REPLACE FUNCTION get_due_recurring_jobs(company_uuid UUID)
RETURNS TABLE(
    id UUID,
    title VARCHAR,
    customer_name VARCHAR,
    next_due_date DATE,
    frequency VARCHAR,
    days_overdue INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rj.id,
        rj.title,
        c.name as customer_name,
        rj.next_due_date,
        rj.frequency,
        (CURRENT_DATE - rj.next_due_date)::INTEGER as days_overdue
    FROM recurring_jobs rj
    JOIN customers c ON rj.customer_id = c.id
    WHERE rj.company_id = company_uuid
        AND rj.status = 'active'
        AND rj.next_due_date <= CURRENT_DATE
    ORDER BY rj.next_due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check that tables were created
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('job_templates', 'job_template_items', 'job_template_checklists', 'recurring_jobs')
ORDER BY table_name;

-- Check template_id was added to work_orders
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'work_orders' AND column_name = 'template_id';

-- Count default templates created
SELECT category, COUNT(*) as template_count
FROM job_templates
GROUP BY category
ORDER BY category;

-- Check recurring jobs functions were created
SELECT routine_name FROM information_schema.routines
WHERE routine_name IN ('calculate_next_due_date', 'create_job_from_recurring', 'get_due_recurring_jobs')
ORDER BY routine_name;
