-- ========================================
-- INDUSTRY STANDARD CUSTOMER TABLES
-- Based on: Salesforce, ServiceTitan, Jobber, Housecall Pro
-- Creates ALL standard customer-related tables
-- ========================================

-- BEGIN; -- Removed transaction for debugging

-- ========================================
-- 1. CUSTOMER_CONTACTS
-- For commercial customers with multiple contacts
-- ========================================
CREATE TABLE IF NOT EXISTS customer_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    title TEXT, -- Job title: "Site Manager", "Accountant", "Owner"
    email TEXT CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
    phone TEXT CHECK (phone ~ '^\+[1-9]\d{1,14}$'),
    mobile_phone TEXT CHECK (mobile_phone ~ '^\+[1-9]\d{1,14}$'),
    is_primary BOOLEAN DEFAULT FALSE,
    is_billing_contact BOOLEAN DEFAULT FALSE,
    is_service_contact BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_contact_has_contact_method CHECK (email IS NOT NULL OR phone IS NOT NULL OR mobile_phone IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_customer_contacts_customer_id ON customer_contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_contacts_is_primary ON customer_contacts(customer_id, is_primary) WHERE is_primary = TRUE;

-- ========================================
-- 2. CUSTOMER_COMMUNICATIONS
-- Activity log for all customer interactions
-- ========================================
CREATE TABLE IF NOT EXISTS customer_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Who logged this
    communication_type TEXT NOT NULL CHECK (communication_type IN ('call', 'email', 'sms', 'meeting', 'note', 'visit', 'letter', 'chat')),
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    subject TEXT,
    content TEXT NOT NULL,
    outcome TEXT, -- "Quote sent", "Scheduled appointment", "No answer"
    duration_minutes INTEGER, -- For calls/meetings
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_communications_customer_id ON customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_created_at ON customer_communications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_communications_type ON customer_communications(communication_type);

-- ========================================
-- 3. CUSTOMER_NOTES
-- Simple notes about customers
-- ========================================
DROP TABLE IF EXISTS customer_notes CASCADE;
CREATE TABLE customer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE, -- Pin important notes to top
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_id ON customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_is_pinned ON customer_notes(customer_id, is_pinned) WHERE is_pinned = TRUE;

-- ========================================
-- 4. CUSTOMER_PREFERENCES
-- Customer-specific settings and preferences
-- ========================================
CREATE TABLE IF NOT EXISTS customer_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE UNIQUE,
    preferred_technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    preferred_contact_method TEXT CHECK (preferred_contact_method IN ('phone', 'email', 'sms', 'any')),
    preferred_contact_time TEXT, -- "Morning (8am-12pm)", "Afternoon (12pm-5pm)", "Evening (5pm-8pm)"
    notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": false}'::jsonb,
    special_instructions TEXT, -- "Call before arriving", "Use side gate", "Dog in backyard"
    do_not_contact BOOLEAN DEFAULT FALSE,
    do_not_contact_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_preferences_customer_id ON customer_preferences(customer_id);

-- ========================================
-- 5. CUSTOMER_HISTORY
-- Audit trail of changes to customer records
-- ========================================
CREATE TABLE IF NOT EXISTS customer_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('created', 'updated', 'status_changed', 'contacted', 'service_completed', 'payment_received', 'complaint', 'compliment', 'note_added')),
    event_description TEXT NOT NULL,
    event_data JSONB, -- Store old/new values for updates
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_history_customer_id ON customer_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_history_created_at ON customer_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_history_event_type ON customer_history(event_type);

-- ========================================
-- 6. CUSTOMER_FINANCIAL_SUMMARY (VIEW)
-- Computed financial data - NOT a table
-- ========================================
DROP TABLE IF EXISTS customer_financial_summary CASCADE;
DROP VIEW IF EXISTS customer_financial_summary CASCADE;

CREATE OR REPLACE VIEW customer_financial_summary AS
SELECT
    c.id as customer_id,
    COALESCE(SUM(CASE WHEN wo.status IN ('completed', 'invoiced') THEN wo.total_amount ELSE 0 END), 0) as lifetime_revenue,
    COALESCE(SUM(CASE WHEN wo.status = 'completed' THEN wo.total_amount ELSE 0 END), 0) as total_paid,
    COALESCE(SUM(CASE WHEN wo.status = 'invoiced' THEN wo.total_amount ELSE 0 END), 0) as outstanding_balance,
    COUNT(CASE WHEN wo.status IN ('completed', 'invoiced') THEN 1 END) as total_jobs,
    MAX(wo.updated_at) as last_service_date,
    COALESCE(AVG(CASE WHEN wo.status IN ('completed', 'invoiced') THEN wo.total_amount END), 0) as average_job_value
FROM customers c
LEFT JOIN work_orders wo ON wo.customer_id = c.id
GROUP BY c.id;

-- ========================================
-- 7. CUSTOMER_SUMMARY (VIEW)
-- Computed summary data - NOT a table
-- ========================================
DROP TABLE IF EXISTS customer_summary CASCADE;
DROP VIEW IF EXISTS customer_summary CASCADE;

CREATE OR REPLACE VIEW customer_summary AS
SELECT
    c.id as customer_id,
    c.customer_number,
    COALESCE(c.company_name, c.first_name || ' ' || c.last_name) as display_name,
    c.type,
    c.is_active,
    c.email,
    c.phone,
    -- Financial summary
    COALESCE(fs.lifetime_revenue, 0) as lifetime_revenue,
    COALESCE(fs.outstanding_balance, 0) as outstanding_balance,
    COALESCE(fs.total_jobs, 0) as total_jobs,
    fs.last_service_date,
    -- Counts
    (SELECT COUNT(*) FROM customer_addresses WHERE customer_id = c.id) as address_count,
    (SELECT COUNT(*) FROM customer_contacts WHERE customer_id = c.id) as contact_count,
    (SELECT COUNT(*) FROM customer_notes WHERE customer_id = c.id) as note_count,
    (SELECT COUNT(*) FROM customer_communications WHERE customer_id = c.id) as communication_count,
    -- Latest activity
    (SELECT MAX(created_at) FROM customer_communications WHERE customer_id = c.id) as last_communication_date,
    c.created_at,
    c.updated_at
FROM customers c
LEFT JOIN customer_financial_summary fs ON fs.customer_id = c.id;

-- ========================================
-- 8. TRIGGERS FOR AUDIT TRAIL
-- ========================================

-- Trigger to log customer creation
CREATE OR REPLACE FUNCTION log_customer_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO customer_history (customer_id, event_type, event_description, created_by)
    VALUES (NEW.id, 'created', 'Customer record created', NULL);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_customer_creation ON customers;
CREATE TRIGGER trg_log_customer_creation
    AFTER INSERT ON customers
    FOR EACH ROW EXECUTE FUNCTION log_customer_creation();

-- Trigger to log customer updates
CREATE OR REPLACE FUNCTION log_customer_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Log is_active changes
    IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
        INSERT INTO customer_history (customer_id, event_type, event_description, event_data)
        VALUES (NEW.id, 'status_changed',
                'Status changed from ' || CASE WHEN OLD.is_active THEN 'active' ELSE 'inactive' END || ' to ' || CASE WHEN NEW.is_active THEN 'active' ELSE 'inactive' END,
                jsonb_build_object('old_is_active', OLD.is_active, 'new_is_active', NEW.is_active));
    END IF;

    -- Log other significant changes
    IF OLD.email IS DISTINCT FROM NEW.email OR
       OLD.phone IS DISTINCT FROM NEW.phone OR
       OLD.company_name IS DISTINCT FROM NEW.company_name OR
       OLD.first_name IS DISTINCT FROM NEW.first_name OR
       OLD.last_name IS DISTINCT FROM NEW.last_name THEN
        INSERT INTO customer_history (customer_id, event_type, event_description)
        VALUES (NEW.id, 'updated', 'Customer information updated');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_customer_update ON customers;
CREATE TRIGGER trg_log_customer_update
    AFTER UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION log_customer_update();

-- COMMIT; -- Removed transaction for debugging

-- ========================================
-- VERIFICATION
-- ========================================
SELECT 'Industry standard customer tables created!' as result;

-- Show all customer tables
SELECT 
    table_name,
    table_type,
    CASE table_type 
        WHEN 'BASE TABLE' THEN '📊 TABLE'
        WHEN 'VIEW' THEN '👁️ VIEW'
    END as type_icon
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%customer%'
ORDER BY table_type, table_name;
