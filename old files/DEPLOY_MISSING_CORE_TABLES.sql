-- =========================================
-- DEPLOY MISSING CORE FSM TABLES
-- Based on error log analysis - these are CRITICAL gaps
-- =========================================

-- The logs show 400 errors on basic FSM functionality
-- This means we're missing fundamental tables/columns

BEGIN;

-- =========================================
-- MISSING ENUMS (Required for table constraints)
-- =========================================

-- Notification enums
DO $$ BEGIN
    CREATE TYPE notification_type_enum AS ENUM (
        'in_app', 'email', 'sms', 'push', 'system', 'webhook'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_status_enum AS ENUM (
        'pending', 'sent', 'delivered', 'read', 'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User/Employee status enums
DO $$ BEGIN
    CREATE TYPE employee_status_enum AS ENUM (
        'active', 'inactive', 'suspended', 'terminated', 'pending'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment enums
DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM (
        'cash', 'check', 'credit_card', 'debit_card', 'ach', 'wire_transfer', 'online'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM (
        'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =========================================
-- MISSING CORE TABLES (Based on 400 errors)
-- =========================================

-- User Dashboard Settings (404 error in logs)
CREATE TABLE IF NOT EXISTS user_dashboard_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dashboard_config JSONB DEFAULT '{}',
    widget_preferences JSONB DEFAULT '{}',
    layout_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Notifications table (400 errors in logs)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type_enum DEFAULT 'in_app',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    status notification_status_enum DEFAULT 'pending',
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table (400 errors in logs)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method payment_method_enum NOT NULL,
    payment_reference TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status payment_status_enum DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- =========================================

-- Add status column to profiles (400 errors in logs)
-- First check if profiles is a table or view
DO $$
BEGIN
    -- Only add column if profiles is a table, not a view
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_name = 'profiles' AND table_type = 'BASE TABLE') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'profiles' AND column_name = 'status') THEN
            ALTER TABLE profiles ADD COLUMN status employee_status_enum DEFAULT 'active';
        END IF;
    END IF;
END $$;

-- Add received_at to payments if it doesn't exist and it's a table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_name = 'payments' AND table_type = 'BASE TABLE') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'payments' AND column_name = 'received_at') THEN
            ALTER TABLE payments ADD COLUMN received_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Ensure work_orders has all required columns for FSM
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_name = 'work_orders' AND table_type = 'BASE TABLE') THEN
        -- Add missing columns that logs show are being queried
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'work_orders' AND column_name = 'created_by') THEN
            ALTER TABLE work_orders ADD COLUMN created_by UUID REFERENCES users(id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'work_orders' AND column_name = 'title') THEN
            ALTER TABLE work_orders ADD COLUMN title TEXT;
        END IF;
    END IF;
END $$;

-- Ensure invoices has all required columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_name = 'invoices' AND table_type = 'BASE TABLE') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'invoices' AND column_name = 'due_date') THEN
            ALTER TABLE invoices ADD COLUMN due_date DATE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_name = 'invoices' AND column_name = 'total_amount') THEN
            ALTER TABLE invoices ADD COLUMN total_amount DECIMAL(10,2);
        END IF;
    END IF;
END $$;

-- =========================================
-- CREATE ESSENTIAL INDEXES
-- =========================================

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_company_id ON payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_received_at ON payments(received_at);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- User dashboard settings indexes
CREATE INDEX IF NOT EXISTS idx_user_dashboard_settings_user_id ON user_dashboard_settings(user_id);

-- Work orders indexes (ensure they exist)
CREATE INDEX IF NOT EXISTS idx_work_orders_company_id ON work_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_at ON work_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned_to ON work_orders(assigned_to);

-- =========================================
-- CREATE ESSENTIAL VIEWS FOR DASHBOARD
-- =========================================

-- Work orders dashboard view (fixes 400 errors)
CREATE OR REPLACE VIEW work_orders_dashboard AS
SELECT 
    wo.id,
    wo.work_order_number,
    wo.title,
    wo.status,
    wo.priority,
    wo.total_amount,
    wo.created_at,
    wo.updated_at,
    wo.scheduled_start,
    wo.scheduled_end,
    wo.assigned_to,
    
    -- Customer info
    c.customer_number,
    CASE 
        WHEN c.company_name IS NOT NULL THEN c.company_name
        ELSE c.first_name || ' ' || c.last_name
    END AS customer_name,
    
    -- Assigned technician
    p.first_name || ' ' || p.last_name AS assigned_technician_name

FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
LEFT JOIN users u ON wo.assigned_to = u.id
LEFT JOIN profiles p ON u.id = p.user_id;

COMMIT;

-- =========================================
-- SUCCESS MESSAGE
-- =========================================

DO $$
BEGIN
    RAISE NOTICE '🎉 MISSING CORE FSM TABLES DEPLOYED!';
    RAISE NOTICE '✅ Added: notifications, payments, user_dashboard_settings';
    RAISE NOTICE '✅ Fixed: profiles.status, payments.received_at columns';
    RAISE NOTICE '✅ Enhanced: work_orders and invoices with missing columns';
    RAISE NOTICE '✅ Created: Essential indexes and dashboard views';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 This should fix the 400/404 errors in the logs!';
    RAISE NOTICE '📊 Core FSM functionality should now work properly';
END $$;
