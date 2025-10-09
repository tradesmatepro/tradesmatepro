-- Clean up test table
DROP TABLE IF EXISTS test_quote_analytics;

-- ========================================
-- CREATE MISSING INDUSTRY-STANDARD TABLES
-- Step by step to isolate any issues
-- ========================================

-- 1. QUOTE ANALYTICS TABLE
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
    time_to_view_hours NUMERIC,
    time_to_decision_hours NUMERIC,
    view_count INTEGER DEFAULT 0,
    
    -- Follow-up tracking
    follow_up_count INTEGER DEFAULT 0,
    last_follow_up_at TIMESTAMPTZ,
    
    -- Conversion tracking
    conversion_rate NUMERIC(5,2),
    quote_value NUMERIC(12,2),
    final_job_value NUMERIC(12,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. QUOTE FOLLOW-UPS TABLE
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
CREATE TABLE IF NOT EXISTS quote_approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    
    -- Workflow configuration
    workflow_name VARCHAR(100) NOT NULL,
    approval_threshold NUMERIC(12,2),
    
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
CREATE TABLE IF NOT EXISTS customer_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Tag details
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    
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

-- Success message
SELECT 'All industry-standard tables created successfully!' as result;
