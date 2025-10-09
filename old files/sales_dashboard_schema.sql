-- Sales Dashboard Database Schema
-- Industry standard naming conventions (no underscores in foreign keys)
-- Following PostgreSQL and Supabase best practices

-- 1. Leads table for lead management
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Lead Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company_name TEXT,
    
    -- Lead Source & Attribution  
    source TEXT DEFAULT 'unknown', -- 'website', 'google_ads', 'referral', 'cold_call', 'social_media'
    source_details JSONB DEFAULT '{}', -- Campaign info, referrer details, etc.
    utm_data JSONB DEFAULT '{}', -- UTM parameters for digital attribution
    
    -- Lead Qualification
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost')),
    temperature TEXT DEFAULT 'cold' CHECK (temperature IN ('hot', 'warm', 'cold')),
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100), -- Lead scoring 0-100
    
    -- Assignment & Ownership
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,
    
    -- Lead Details
    service_needed TEXT,
    budget_range TEXT,
    timeline TEXT,
    notes TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    
    -- Conversion Tracking
    converted_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    converted_at TIMESTAMPTZ,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 2. Opportunities table for sales pipeline
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Opportunity Details
    name TEXT NOT NULL,
    description TEXT,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES work_orders(id) ON DELETE SET NULL, -- Link to quotes
    
    -- Sales Pipeline
    stage TEXT NOT NULL DEFAULT 'prospecting' CHECK (stage IN (
        'prospecting', 'qualification', 'needs_analysis', 'proposal', 
        'negotiation', 'closed_won', 'closed_lost'
    )),
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    expected_value DECIMAL(12,2) DEFAULT 0,
    expected_close_date DATE,
    
    -- Assignment
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Tracking
    source TEXT,
    competitor TEXT,
    win_loss_reason TEXT,
    
    -- Status
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'on_hold')),
    closed_at TIMESTAMPTZ,
    actual_value DECIMAL(12,2),
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Sales activities table for communication tracking
CREATE TABLE IF NOT EXISTS sales_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Activity Details
    type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'demo', 'proposal', 'follow_up', 'note', 'sms')),
    subject TEXT NOT NULL,
    description TEXT,
    
    -- Relationships (industry standard naming)
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    
    -- Activity Data
    duration_minutes INTEGER DEFAULT 0,
    outcome TEXT,
    next_action TEXT,
    next_action_date DATE,
    
    -- Assignment
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Scheduling
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- Email tracking, call recordings, etc.
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Sales targets table for goal tracking
CREATE TABLE IF NOT EXISTS sales_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Target Details
    name TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('revenue', 'leads', 'opportunities', 'conversions')),
    target_value DECIMAL(12,2) NOT NULL,
    
    -- Time Period
    period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'yearly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Assignment
    assigned_to UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL = company-wide target
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Lead sources table for source management
CREATE TABLE IF NOT EXISTS lead_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Source Details
    name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('website', 'advertising', 'referral', 'social_media', 'direct', 'other')),
    description TEXT,
    
    -- Tracking
    cost_per_lead DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    configuration JSONB DEFAULT '{}', -- API keys, tracking codes, etc.
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(company_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(company_id, source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(company_id, created_at);

CREATE INDEX IF NOT EXISTS idx_opportunities_company_id ON opportunities(company_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(company_id, stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned_to ON opportunities(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(company_id, status);
CREATE INDEX IF NOT EXISTS idx_opportunities_close_date ON opportunities(company_id, expected_close_date);

CREATE INDEX IF NOT EXISTS idx_sales_activities_company_id ON sales_activities(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_activities_lead_id ON sales_activities(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sales_activities_customer_id ON sales_activities(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sales_activities_opportunity_id ON sales_activities(opportunity_id) WHERE opportunity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sales_activities_performed_by ON sales_activities(performed_by) WHERE performed_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sales_activities_created_at ON sales_activities(company_id, created_at);

-- 7. Create views for common queries
CREATE OR REPLACE VIEW sales_pipeline_summary AS
SELECT 
    company_id,
    stage,
    COUNT(*) as opportunity_count,
    SUM(expected_value) as total_value,
    AVG(probability) as avg_probability,
    COUNT(*) FILTER (WHERE assigned_to IS NOT NULL) as assigned_count
FROM opportunities 
WHERE status = 'open'
GROUP BY company_id, stage;

CREATE OR REPLACE VIEW lead_conversion_summary AS
SELECT 
    company_id,
    source,
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE status = 'converted') as converted_leads,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'converted')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
        2
    ) as conversion_rate
FROM leads
GROUP BY company_id, source;

CREATE OR REPLACE VIEW sales_rep_performance AS
SELECT 
    company_id,
    assigned_to as user_id,
    COUNT(DISTINCT l.id) as leads_assigned,
    COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'converted') as leads_converted,
    COUNT(DISTINCT o.id) as opportunities_assigned,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'won') as opportunities_won,
    SUM(o.actual_value) FILTER (WHERE o.status = 'won') as revenue_generated,
    COUNT(DISTINCT sa.id) as activities_completed
FROM users u
LEFT JOIN leads l ON l.assigned_to = u.id
LEFT JOIN opportunities o ON o.assigned_to = u.id  
LEFT JOIN sales_activities sa ON sa.performed_by = u.id
GROUP BY company_id, assigned_to;

-- 8. Enable RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;

-- 9. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON opportunities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sales_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sales_targets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON lead_sources TO authenticated;

GRANT SELECT ON sales_pipeline_summary TO authenticated;
GRANT SELECT ON lead_conversion_summary TO authenticated;
GRANT SELECT ON sales_rep_performance TO authenticated;

-- 10. Add comments for documentation
COMMENT ON TABLE leads IS 'Lead management and tracking system';
COMMENT ON TABLE opportunities IS 'Sales pipeline and opportunity management';
COMMENT ON TABLE sales_activities IS 'Communication and activity tracking';
COMMENT ON TABLE sales_targets IS 'Sales goals and target management';
COMMENT ON TABLE lead_sources IS 'Lead source configuration and tracking';

COMMENT ON VIEW sales_pipeline_summary IS 'Pipeline overview by stage and company';
COMMENT ON VIEW lead_conversion_summary IS 'Lead conversion rates by source';
COMMENT ON VIEW sales_rep_performance IS 'Sales representative performance metrics';

-- 11. Create functions for common operations
CREATE OR REPLACE FUNCTION convert_lead_to_customer(
    lead_uuid UUID,
    customer_data JSONB
) RETURNS UUID AS $$
DECLARE
    new_customer_id UUID;
    lead_record leads%ROWTYPE;
BEGIN
    -- Get lead details
    SELECT * INTO lead_record FROM leads WHERE id = lead_uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lead not found';
    END IF;
    
    -- Create customer record
    INSERT INTO customers (
        company_id, name, email, phone, 
        street_address, city, state, zip_code,
        created_by, customer_type
    ) VALUES (
        lead_record.company_id,
        CONCAT(lead_record.first_name, ' ', lead_record.last_name),
        lead_record.email,
        lead_record.phone,
        lead_record.address,
        lead_record.city,
        lead_record.state,
        lead_record.zip_code,
        lead_record.created_by,
        'RESIDENTIAL'
    ) RETURNING id INTO new_customer_id;
    
    -- Update lead status
    UPDATE leads 
    SET 
        status = 'converted',
        converted_customer_id = new_customer_id,
        converted_at = NOW(),
        updated_at = NOW()
    WHERE id = lead_uuid;
    
    -- Log activity
    INSERT INTO sales_activities (
        company_id, lead_id, customer_id, type, subject, description, performed_by
    ) VALUES (
        lead_record.company_id,
        lead_uuid,
        new_customer_id,
        'note',
        'Lead Converted to Customer',
        'Lead successfully converted to customer account',
        lead_record.assigned_to
    );
    
    RETURN new_customer_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION convert_lead_to_customer TO authenticated;
