-- Customer Competitive Enhancements Database Schema
-- Industry standard naming conventions and competitive features
-- Addresses critical gaps vs ServiceTitan, Jobber, Housecall Pro

-- 1. Customer Communication History Table
CREATE TABLE IF NOT EXISTS customer_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Communication Details
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    communication_type TEXT NOT NULL CHECK (communication_type IN ('call', 'email', 'sms', 'meeting', 'note', 'voicemail')),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    
    -- Content
    subject TEXT,
    content TEXT,
    duration_minutes INTEGER DEFAULT 0,
    
    -- Status and Outcome
    status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'failed', 'cancelled')),
    outcome TEXT, -- 'interested', 'not_interested', 'callback_requested', etc.
    
    -- Assignment and Tracking
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- Phone numbers, email addresses, attachments, etc.
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customer Contacts Table (for commercial accounts with multiple contacts)
CREATE TABLE IF NOT EXISTS customer_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Contact Information
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    title TEXT, -- 'Manager', 'Owner', 'Maintenance Director', etc.
    department TEXT,
    
    -- Contact Details
    email TEXT,
    phone TEXT,
    mobile_phone TEXT,
    
    -- Contact Preferences
    is_primary_contact BOOLEAN DEFAULT FALSE,
    is_billing_contact BOOLEAN DEFAULT FALSE,
    is_decision_maker BOOLEAN DEFAULT FALSE,
    preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'any')),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Customer Tags Table (for better organization and segmentation)
CREATE TABLE IF NOT EXISTS customer_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Tag Details
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6', -- Hex color for UI
    description TEXT,
    
    -- Tag Type
    tag_type TEXT DEFAULT 'custom' CHECK (tag_type IN ('system', 'custom', 'service', 'priority')),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(company_id, name)
);

-- 4. Customer Tag Assignments (many-to-many relationship)
CREATE TABLE IF NOT EXISTS customer_tag_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES customer_tags(id) ON DELETE CASCADE,
    
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(customer_id, tag_id)
);

-- 5. Customer Service Agreements Table
CREATE TABLE IF NOT EXISTS customer_service_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Agreement Details
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    agreement_name TEXT NOT NULL,
    agreement_type TEXT NOT NULL CHECK (agreement_type IN ('maintenance', 'warranty', 'service_plan', 'contract')),
    
    -- Terms
    start_date DATE NOT NULL,
    end_date DATE,
    renewal_type TEXT CHECK (renewal_type IN ('manual', 'auto_monthly', 'auto_yearly')),
    
    -- Pricing
    monthly_fee DECIMAL(10,2) DEFAULT 0,
    yearly_fee DECIMAL(10,2) DEFAULT 0,
    service_discount_percent INTEGER DEFAULT 0,
    
    -- Service Details
    included_services TEXT[], -- Array of included service types
    service_frequency TEXT, -- 'monthly', 'quarterly', 'bi-annual', 'annual'
    priority_level TEXT DEFAULT 'standard' CHECK (priority_level IN ('standard', 'priority', 'emergency')),
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'suspended', 'expired', 'cancelled')),
    
    -- Notes
    terms_and_conditions TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Customer Feedback and Reviews Table
CREATE TABLE IF NOT EXISTS customer_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Feedback Details
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
    
    -- Rating and Review
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    service_quality_rating INTEGER CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
    technician_rating INTEGER CHECK (technician_rating >= 1 AND technician_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    
    -- Feedback Content
    review_title TEXT,
    review_text TEXT,
    would_recommend BOOLEAN,
    
    -- Feedback Source
    feedback_source TEXT DEFAULT 'manual' CHECK (feedback_source IN ('manual', 'email', 'sms', 'phone', 'online_form')),
    
    -- Response
    company_response TEXT,
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Status
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Customer Preferences Table
CREATE TABLE IF NOT EXISTS customer_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Communication Preferences
    preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'any')),
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    call_notifications BOOLEAN DEFAULT TRUE,
    
    -- Service Preferences
    preferred_technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
    preferred_service_time TEXT, -- 'morning', 'afternoon', 'evening', 'anytime'
    preferred_days TEXT[], -- Array like ['monday', 'tuesday', 'wednesday']
    
    -- Scheduling Preferences
    advance_notice_days INTEGER DEFAULT 1,
    reminder_preferences JSONB DEFAULT '{"email": true, "sms": false, "call": false}',
    
    -- Special Requirements
    special_instructions TEXT,
    access_instructions TEXT,
    pet_information TEXT,
    
    -- Billing Preferences
    preferred_payment_method TEXT,
    billing_email TEXT,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Add missing columns to existing customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_type TEXT DEFAULT 'RESIDENTIAL' CHECK (customer_type IN ('RESIDENTIAL', 'COMMERCIAL'));
ALTER TABLE customers ADD COLUMN IF NOT EXISTS lead_source TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS assigned_sales_rep UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_since DATE DEFAULT CURRENT_DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_city TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_state TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_zip_code TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tax_exempt BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(10,2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 30; -- Net 30, etc.

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_communications_customer_id ON customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_company_id ON customer_communications(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_type ON customer_communications(company_id, communication_type);
CREATE INDEX IF NOT EXISTS idx_customer_communications_date ON customer_communications(company_id, completed_at);

CREATE INDEX IF NOT EXISTS idx_customer_contacts_customer_id ON customer_contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_contacts_primary ON customer_contacts(customer_id) WHERE is_primary_contact = TRUE;

CREATE INDEX IF NOT EXISTS idx_customer_tags_company_id ON customer_tags(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_customer_id ON customer_tag_assignments(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_service_agreements_customer_id ON customer_service_agreements(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_service_agreements_status ON customer_service_agreements(company_id, status);

CREATE INDEX IF NOT EXISTS idx_customer_feedback_customer_id ON customer_feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_rating ON customer_feedback(company_id, overall_rating);

CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(company_id, customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_source ON customers(company_id, lead_source);
CREATE INDEX IF NOT EXISTS idx_customers_sales_rep ON customers(assigned_sales_rep) WHERE assigned_sales_rep IS NOT NULL;

-- 10. Create views for common queries
CREATE OR REPLACE VIEW customer_summary AS
SELECT 
    c.*,
    -- Communication stats
    COALESCE(comm_stats.total_communications, 0) as total_communications,
    COALESCE(comm_stats.last_communication_date, NULL) as last_communication_date,
    COALESCE(comm_stats.last_communication_type, NULL) as last_communication_type,
    
    -- Contact count
    COALESCE(contact_stats.contact_count, 0) as contact_count,
    
    -- Tag information
    COALESCE(tag_stats.tag_names, ARRAY[]::TEXT[]) as tag_names,
    
    -- Service agreement status
    COALESCE(agreement_stats.active_agreements, 0) as active_agreements,
    COALESCE(agreement_stats.agreement_types, ARRAY[]::TEXT[]) as agreement_types,
    
    -- Feedback stats
    COALESCE(feedback_stats.avg_rating, 0) as avg_rating,
    COALESCE(feedback_stats.total_reviews, 0) as total_reviews,
    COALESCE(feedback_stats.last_review_date, NULL) as last_review_date
    
FROM customers c

LEFT JOIN (
    SELECT 
        customer_id,
        COUNT(*) as total_communications,
        MAX(completed_at) as last_communication_date,
        (ARRAY_AGG(communication_type ORDER BY completed_at DESC))[1] as last_communication_type
    FROM customer_communications 
    WHERE completed_at IS NOT NULL
    GROUP BY customer_id
) comm_stats ON c.id = comm_stats.customer_id

LEFT JOIN (
    SELECT customer_id, COUNT(*) as contact_count
    FROM customer_contacts 
    WHERE is_active = TRUE
    GROUP BY customer_id
) contact_stats ON c.id = contact_stats.customer_id

LEFT JOIN (
    SELECT 
        cta.customer_id,
        ARRAY_AGG(ct.name) as tag_names
    FROM customer_tag_assignments cta
    JOIN customer_tags ct ON cta.tag_id = ct.id
    WHERE ct.is_active = TRUE
    GROUP BY cta.customer_id
) tag_stats ON c.id = tag_stats.customer_id

LEFT JOIN (
    SELECT 
        customer_id,
        COUNT(*) as active_agreements,
        ARRAY_AGG(agreement_type) as agreement_types
    FROM customer_service_agreements 
    WHERE status = 'active'
    GROUP BY customer_id
) agreement_stats ON c.id = agreement_stats.customer_id

LEFT JOIN (
    SELECT 
        customer_id,
        AVG(overall_rating::DECIMAL) as avg_rating,
        COUNT(*) as total_reviews,
        MAX(created_at) as last_review_date
    FROM customer_feedback 
    WHERE overall_rating IS NOT NULL
    GROUP BY customer_id
) feedback_stats ON c.id = feedback_stats.customer_id;

-- 11. Enable RLS (Row Level Security)
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_service_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_preferences ENABLE ROW LEVEL SECURITY;

-- 12. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_communications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_tag_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_service_agreements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_preferences TO authenticated;

GRANT SELECT ON customer_summary TO authenticated;

-- 13. Add comments for documentation
COMMENT ON TABLE customer_communications IS 'Communication history and tracking for customers';
COMMENT ON TABLE customer_contacts IS 'Multiple contacts per customer for commercial accounts';
COMMENT ON TABLE customer_tags IS 'Tagging system for customer organization and segmentation';
COMMENT ON TABLE customer_service_agreements IS 'Service contracts and maintenance agreements';
COMMENT ON TABLE customer_feedback IS 'Customer reviews and feedback system';
COMMENT ON TABLE customer_preferences IS 'Customer communication and service preferences';

COMMENT ON VIEW customer_summary IS 'Comprehensive customer view with aggregated statistics';

-- 14. Create functions for common operations
CREATE OR REPLACE FUNCTION log_customer_communication(
    p_company_id UUID,
    p_customer_id UUID,
    p_communication_type TEXT,
    p_direction TEXT,
    p_subject TEXT,
    p_content TEXT,
    p_performed_by UUID,
    p_duration_minutes INTEGER DEFAULT 0,
    p_outcome TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    communication_id UUID;
BEGIN
    INSERT INTO customer_communications (
        company_id, customer_id, communication_type, direction,
        subject, content, performed_by, duration_minutes, outcome,
        completed_at
    ) VALUES (
        p_company_id, p_customer_id, p_communication_type, p_direction,
        p_subject, p_content, p_performed_by, p_duration_minutes, p_outcome,
        NOW()
    ) RETURNING id INTO communication_id;
    
    RETURN communication_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_customer_lifetime_value(p_customer_id UUID) 
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_value DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(total_amount), 0)
    INTO total_value
    FROM work_orders 
    WHERE customer_id = p_customer_id 
    AND invoice_status = 'PAID';
    
    RETURN total_value;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION log_customer_communication TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_lifetime_value TO authenticated;
