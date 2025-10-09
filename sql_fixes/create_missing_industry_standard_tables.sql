-- ========================================
-- CREATE MISSING INDUSTRY-STANDARD TABLES
-- Based on research of Jobber, Housecall Pro, ServiceTitan
-- ========================================

-- 1. QUOTE ANALYTICS TABLE
-- Track quote performance metrics and conversion rates
CREATE TABLE IF NOT EXISTS quote_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    
    -- Quote tracking metrics
    quote_sent_at TIMESTAMPTZ,
    quote_viewed_at TIMESTAMPTZ,
    quote_approved_at TIMESTAMPTZ,
    quote_rejected_at TIMESTAMPTZ,
    
    -- Performance metrics
    time_to_view_hours NUMERIC, -- Hours from sent to first view
    time_to_decision_hours NUMERIC, -- Hours from sent to approval/rejection
    view_count INTEGER DEFAULT 0,
    
    -- Follow-up tracking
    follow_up_count INTEGER DEFAULT 0,
    last_follow_up_at TIMESTAMPTZ,
    
    -- Conversion tracking
    conversion_rate NUMERIC(5,2), -- Percentage
    quote_value NUMERIC(12,2),
    final_job_value NUMERIC(12,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. QUOTE FOLLOW-UPS TABLE
-- Automated and manual follow-up tracking
CREATE TABLE IF NOT EXISTS quote_follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    
    -- Follow-up details
    follow_up_type VARCHAR(50) NOT NULL CHECK (follow_up_type IN ('email', 'sms', 'phone', 'manual')),
    follow_up_method VARCHAR(50) NOT NULL CHECK (follow_up_method IN ('automated', 'manual')),
    
    -- Scheduling
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    
    -- Content
    subject VARCHAR(255),
    message TEXT,
    template_used VARCHAR(100),
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'failed')),
    
    -- Response tracking
    customer_responded BOOLEAN DEFAULT FALSE,
    response_received_at TIMESTAMPTZ,
    response_type VARCHAR(50) CHECK (response_type IN ('approved', 'rejected', 'questions', 'reschedule')),
    
    -- User tracking
    created_by UUID REFERENCES profiles(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. QUOTE APPROVAL WORKFLOWS TABLE
-- Multi-level approval processes for quotes above thresholds
CREATE TABLE IF NOT EXISTS quote_approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    
    -- Workflow configuration
    workflow_name VARCHAR(100) NOT NULL,
    approval_threshold NUMERIC(12,2), -- Dollar amount requiring approval
    
    -- Current status
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER NOT NULL,
    overall_status VARCHAR(50) DEFAULT 'pending' CHECK (overall_status IN ('pending', 'approved', 'rejected', 'cancelled')),
    
    -- Approval chain
    approver_user_id UUID REFERENCES profiles(id),
    approver_role VARCHAR(50),
    
    -- Timing
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    
    -- Decision details
    approval_notes TEXT,
    rejection_reason TEXT,
    
    -- Escalation
    escalated BOOLEAN DEFAULT FALSE,
    escalated_at TIMESTAMPTZ,
    escalated_to UUID REFERENCES profiles(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CUSTOMER TAGS TABLE
-- Customer segmentation and categorization
CREATE TABLE IF NOT EXISTS customer_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Tag details
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
    
    -- Tag categorization
    category VARCHAR(50) CHECK (category IN ('service_type', 'priority', 'payment', 'location', 'custom')),
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, name)
);

-- 5. CUSTOMER TAG ASSIGNMENTS TABLE
-- Many-to-many relationship between customers and tags
CREATE TABLE IF NOT EXISTS customer_tag_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES customer_tags(id) ON DELETE CASCADE,
    
    -- Assignment details
    assigned_by UUID REFERENCES profiles(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Notes
    assignment_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(customer_id, tag_id)
);

-- ========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- Quote Analytics indexes
CREATE INDEX IF NOT EXISTS idx_quote_analytics_company_id ON quote_analytics(company_id);
CREATE INDEX IF NOT EXISTS idx_quote_analytics_work_order_id ON quote_analytics(work_order_id);
CREATE INDEX IF NOT EXISTS idx_quote_analytics_sent_at ON quote_analytics(quote_sent_at);

-- Quote Follow-ups indexes
CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_company_id ON quote_follow_ups(company_id);
CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_work_order_id ON quote_follow_ups(work_order_id);
CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_scheduled_at ON quote_follow_ups(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_status ON quote_follow_ups(status);

-- Quote Approval Workflows indexes
CREATE INDEX IF NOT EXISTS idx_quote_approval_workflows_company_id ON quote_approval_workflows(company_id);
CREATE INDEX IF NOT EXISTS idx_quote_approval_workflows_work_order_id ON quote_approval_workflows(work_order_id);
CREATE INDEX IF NOT EXISTS idx_quote_approval_workflows_status ON quote_approval_workflows(overall_status);
CREATE INDEX IF NOT EXISTS idx_quote_approval_workflows_approver ON quote_approval_workflows(approver_user_id);

-- Customer Tags indexes
CREATE INDEX IF NOT EXISTS idx_customer_tags_company_id ON customer_tags(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_tags_category ON customer_tags(category);
CREATE INDEX IF NOT EXISTS idx_customer_tags_active ON customer_tags(is_active);

-- Customer Tag Assignments indexes
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_customer_id ON customer_tag_assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_tag_id ON customer_tag_assignments(tag_id);
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_company_id ON customer_tag_assignments(company_id);

-- ========================================
-- CREATE RLS POLICIES (SIMPLIFIED)
-- ========================================

-- Note: RLS policies will be added later when get_user_company_id() function is available
-- For now, tables are created without RLS to avoid function dependency issues

-- Enable RLS on all tables (but no policies yet)
ALTER TABLE quote_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tag_assignments ENABLE ROW LEVEL SECURITY;

-- TODO: Add RLS policies once get_user_company_id() function is available
-- The application will handle company_id filtering at the application level for now

-- ========================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ========================================

-- Quote Analytics trigger
CREATE OR REPLACE FUNCTION update_quote_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_quote_analytics_updated_at
    BEFORE UPDATE ON quote_analytics
    FOR EACH ROW EXECUTE FUNCTION update_quote_analytics_updated_at();

-- Quote Follow-ups trigger
CREATE OR REPLACE FUNCTION update_quote_follow_ups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_quote_follow_ups_updated_at
    BEFORE UPDATE ON quote_follow_ups
    FOR EACH ROW EXECUTE FUNCTION update_quote_follow_ups_updated_at();

-- Quote Approval Workflows trigger
CREATE OR REPLACE FUNCTION update_quote_approval_workflows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_quote_approval_workflows_updated_at
    BEFORE UPDATE ON quote_approval_workflows
    FOR EACH ROW EXECUTE FUNCTION update_quote_approval_workflows_updated_at();

-- Customer Tags trigger
CREATE OR REPLACE FUNCTION update_customer_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customer_tags_updated_at
    BEFORE UPDATE ON customer_tags
    FOR EACH ROW EXECUTE FUNCTION update_customer_tags_updated_at();
