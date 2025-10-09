-- ========================================
-- INDUSTRY STANDARD QUOTE FEATURES
-- Adds all missing quote fields and tables
-- Preserves unified pipeline (competitive advantage)
-- ========================================

BEGIN;

-- ========================================
-- 1. ADD QUOTE LIFECYCLE FIELDS TO WORK_ORDERS
-- Track full quote journey from creation to acceptance/rejection
-- ========================================

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS quote_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_viewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_rejected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quote_rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS quote_terms TEXT DEFAULT 'Net 30',
ADD COLUMN IF NOT EXISTS quote_notes TEXT; -- Customer-facing notes

-- Add indexes for quote lifecycle queries
CREATE INDEX IF NOT EXISTS idx_work_orders_quote_sent ON work_orders(quote_sent_at) WHERE quote_sent_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_work_orders_quote_expires ON work_orders(quote_expires_at) WHERE quote_expires_at IS NOT NULL;

-- ========================================
-- 2. ADD QUOTE VERSIONING
-- Track quote revisions (v1, v2, v3)
-- ========================================

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS quote_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS quote_parent_id UUID REFERENCES work_orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_work_orders_quote_parent ON work_orders(quote_parent_id) WHERE quote_parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_work_orders_quote_version ON work_orders(quote_version);

-- ========================================
-- 3. QUOTE TEMPLATES
-- Pre-built quote templates for common services
-- ========================================

CREATE TABLE IF NOT EXISTS quote_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "HVAC Installation", "Electrical Repair"
    description TEXT,
    category TEXT, -- "HVAC", "Electrical", "Plumbing"
    default_pricing_model TEXT DEFAULT 'TIME_MATERIALS',
    default_terms TEXT DEFAULT 'Net 30',
    default_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    use_count INTEGER DEFAULT 0, -- Track how often template is used
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_templates_company ON quote_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_quote_templates_category ON quote_templates(category);
CREATE INDEX IF NOT EXISTS idx_quote_templates_active ON quote_templates(company_id, is_active) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS quote_template_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES quote_templates(id) ON DELETE CASCADE,
    line_type TEXT NOT NULL, -- 'labor', 'material', 'equipment', 'service'
    description TEXT NOT NULL,
    quantity NUMERIC(10,3) DEFAULT 1.000,
    unit_price NUMERIC(10,2) NOT NULL,
    is_optional BOOLEAN DEFAULT FALSE, -- Customer can add/remove
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_template_items_template ON quote_template_items(template_id);

-- ========================================
-- 4. QUOTE APPROVAL WORKFLOW
-- Internal approval before sending to customer
-- ========================================

-- Drop existing table if it has wrong structure
DROP TABLE IF EXISTS quote_approvals CASCADE;

CREATE TABLE quote_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approver_role TEXT, -- 'manager', 'owner', 'supervisor'
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SKIPPED')),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    decision_notes TEXT,
    auto_approved BOOLEAN DEFAULT FALSE, -- Was it auto-approved based on rules?
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_approvals_work_order ON quote_approvals(work_order_id);
CREATE INDEX IF NOT EXISTS idx_quote_approvals_company ON quote_approvals(company_id);
CREATE INDEX IF NOT EXISTS idx_quote_approvals_status ON quote_approvals(status) WHERE status = 'PENDING';

-- ========================================
-- 5. QUOTE FOLLOW-UPS
-- Automated follow-up reminders
-- ========================================

-- Drop existing table if it has wrong structure
DROP TABLE IF EXISTS quote_follow_ups CASCADE;

CREATE TABLE quote_follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    follow_up_type TEXT CHECK (follow_up_type IN ('email', 'sms', 'call', 'task')),
    scheduled_date TIMESTAMPTZ NOT NULL,
    completed_date TIMESTAMPTZ,
    status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'FAILED')),
    outcome TEXT CHECK (outcome IN ('NO_RESPONSE', 'INTERESTED', 'NOT_INTERESTED', 'NEEDS_REVISION', 'ACCEPTED', 'REJECTED')),
    subject TEXT,
    message TEXT,
    notes TEXT,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_automated BOOLEAN DEFAULT FALSE,
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_work_order ON quote_follow_ups(work_order_id);
CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_company ON quote_follow_ups(company_id);
CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_scheduled ON quote_follow_ups(scheduled_date) WHERE status = 'SCHEDULED';
CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_assigned ON quote_follow_ups(assigned_to) WHERE assigned_to IS NOT NULL;

-- ========================================
-- 6. QUOTE ANALYTICS
-- Track quote performance metrics
-- ========================================

-- Drop existing table if it has wrong structure
DROP TABLE IF EXISTS quote_analytics CASCADE;

CREATE TABLE quote_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Lifecycle timestamps
    quote_created_at TIMESTAMPTZ NOT NULL,
    quote_sent_at TIMESTAMPTZ,
    quote_viewed_at TIMESTAMPTZ,
    quote_accepted_at TIMESTAMPTZ,
    quote_rejected_at TIMESTAMPTZ,
    
    -- Performance metrics
    time_to_send_hours NUMERIC, -- Hours between created and sent
    time_to_view_hours NUMERIC, -- Hours between sent and viewed
    time_to_decision_hours NUMERIC, -- Hours between sent and accepted/rejected
    conversion_rate NUMERIC, -- 1.0 if accepted, 0.0 if rejected, NULL if pending
    
    -- Quote details
    quote_value NUMERIC(12,2),
    quote_version INTEGER DEFAULT 1,
    revision_count INTEGER DEFAULT 0,
    
    -- Customer engagement
    view_count INTEGER DEFAULT 0,
    follow_up_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_analytics_work_order ON quote_analytics(work_order_id);
CREATE INDEX IF NOT EXISTS idx_quote_analytics_company ON quote_analytics(company_id);
CREATE INDEX IF NOT EXISTS idx_quote_analytics_conversion ON quote_analytics(conversion_rate) WHERE conversion_rate IS NOT NULL;

-- ========================================
-- 7. QUOTE NUMBER GENERATION FUNCTION
-- Generate sequential quote numbers: QT-YYYYMM-XXXX
-- ========================================

CREATE OR REPLACE FUNCTION generate_quote_number(company_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_month TEXT;
    prefix TEXT;
BEGIN
    year_month := TO_CHAR(NOW(), 'YYYYMM');
    prefix := 'QT-' || year_month || '-';
    
    -- Find the highest number for this month
    SELECT COALESCE(
        MAX(
            CAST(
                SUBSTRING(work_order_number FROM LENGTH(prefix) + 1) 
                AS INTEGER
            )
        ), 
        0
    ) + 1
    INTO next_num
    FROM work_orders
    WHERE company_id = company_uuid
    AND work_order_number LIKE prefix || '%'
    AND status IN ('draft', 'quote', 'approved');
    
    RETURN prefix || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. TRIGGER TO AUTO-SET QUOTE EXPIRATION
-- Automatically set expiration date when quote is sent
-- ========================================

CREATE OR REPLACE FUNCTION set_quote_expiration()
RETURNS TRIGGER AS $$
BEGIN
    -- When quote_sent_at is set and quote_expires_at is not set
    IF NEW.quote_sent_at IS NOT NULL AND OLD.quote_sent_at IS NULL AND NEW.quote_expires_at IS NULL THEN
        -- Set expiration to 30 days from sent date (industry standard)
        NEW.quote_expires_at := NEW.quote_sent_at + INTERVAL '30 days';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_quote_expiration ON work_orders;
CREATE TRIGGER trg_set_quote_expiration
    BEFORE UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION set_quote_expiration();

-- ========================================
-- 9. TRIGGER TO UPDATE QUOTE ANALYTICS
-- Automatically update analytics when quote lifecycle changes
-- ========================================

CREATE OR REPLACE FUNCTION update_quote_analytics()
RETURNS TRIGGER AS $$
DECLARE
    analytics_record quote_analytics%ROWTYPE;
BEGIN
    -- Only process for quote-stage work orders
    IF NEW.status NOT IN ('draft', 'quote', 'approved') THEN
        RETURN NEW;
    END IF;
    
    -- Get or create analytics record
    SELECT * INTO analytics_record
    FROM quote_analytics
    WHERE work_order_id = NEW.id;
    
    IF NOT FOUND THEN
        -- Create new analytics record
        INSERT INTO quote_analytics (
            work_order_id,
            company_id,
            quote_created_at,
            quote_value,
            quote_version
        ) VALUES (
            NEW.id,
            NEW.company_id,
            NEW.created_at,
            NEW.total_amount,
            COALESCE(NEW.quote_version, 1)
        );
    ELSE
        -- Update existing analytics
        UPDATE quote_analytics SET
            quote_sent_at = NEW.quote_sent_at,
            quote_viewed_at = NEW.quote_viewed_at,
            quote_accepted_at = NEW.quote_accepted_at,
            quote_rejected_at = NEW.quote_rejected_at,
            quote_value = NEW.total_amount,
            quote_version = COALESCE(NEW.quote_version, 1),
            
            -- Calculate time metrics
            time_to_send_hours = CASE 
                WHEN NEW.quote_sent_at IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (NEW.quote_sent_at - NEW.created_at)) / 3600
                ELSE NULL
            END,
            time_to_view_hours = CASE 
                WHEN NEW.quote_viewed_at IS NOT NULL AND NEW.quote_sent_at IS NOT NULL
                THEN EXTRACT(EPOCH FROM (NEW.quote_viewed_at - NEW.quote_sent_at)) / 3600
                ELSE NULL
            END,
            time_to_decision_hours = CASE 
                WHEN NEW.quote_accepted_at IS NOT NULL AND NEW.quote_sent_at IS NOT NULL
                THEN EXTRACT(EPOCH FROM (NEW.quote_accepted_at - NEW.quote_sent_at)) / 3600
                WHEN NEW.quote_rejected_at IS NOT NULL AND NEW.quote_sent_at IS NOT NULL
                THEN EXTRACT(EPOCH FROM (NEW.quote_rejected_at - NEW.quote_sent_at)) / 3600
                ELSE NULL
            END,
            conversion_rate = CASE 
                WHEN NEW.quote_accepted_at IS NOT NULL THEN 1.0
                WHEN NEW.quote_rejected_at IS NOT NULL THEN 0.0
                ELSE NULL
            END,
            updated_at = NOW()
        WHERE work_order_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_quote_analytics ON work_orders;
CREATE TRIGGER trg_update_quote_analytics
    AFTER INSERT OR UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_quote_analytics();

COMMIT;

-- ========================================
-- VERIFICATION
-- ========================================

SELECT '✅ Industry standard quote features added!' as result;

-- Show new quote fields
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'work_orders'
AND column_name LIKE '%quote%'
ORDER BY column_name;
