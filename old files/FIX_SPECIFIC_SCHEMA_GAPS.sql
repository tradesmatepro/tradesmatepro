-- =========================================
-- FIX SPECIFIC SCHEMA GAPS
-- Based on actual schema analysis and error logs
-- =========================================

-- These are the EXACT issues causing 400/404 errors:
-- 1. user_dashboard_settings table missing (404 error)
-- 2. profiles.status column missing (400 error) 
-- 3. payments.received_at column missing (400 error)

BEGIN;

-- =========================================
-- 1. CREATE MISSING user_dashboard_settings TABLE
-- =========================================

-- This table is completely missing and causing 404 errors
CREATE TABLE IF NOT EXISTS user_dashboard_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dashboard_config JSONB DEFAULT '{}',
    widget_preferences JSONB DEFAULT '{}',
    layout_settings JSONB DEFAULT '{}',
    theme_settings JSONB DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_dashboard_settings_user_id ON user_dashboard_settings(user_id);

-- =========================================
-- 2. ADD MISSING status COLUMN TO profiles
-- =========================================

-- The profiles table exists but is missing the status column
-- Frontend is querying: profiles?select=id&status=eq.ACTIVE
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status employee_status_enum DEFAULT 'active';

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- =========================================
-- 3. ADD MISSING received_at COLUMN TO payments
-- =========================================

-- The payments table exists but is missing received_at column
-- Frontend is querying: payments?select=amount,received_at
ALTER TABLE payments ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing payments to have received_at = payment_date if it exists
UPDATE payments 
SET received_at = payment_date 
WHERE received_at IS NULL AND payment_date IS NOT NULL;

-- Update existing payments to have received_at = created_at if payment_date is null
UPDATE payments 
SET received_at = created_at 
WHERE received_at IS NULL;

-- Index for received_at queries
CREATE INDEX IF NOT EXISTS idx_payments_received_at ON payments(received_at);

-- =========================================
-- 4. CREATE ESSENTIAL FUNCTIONS FOR DASHBOARD
-- =========================================

-- Function to get user dashboard data (fixes frontend queries)
CREATE OR REPLACE FUNCTION get_user_dashboard_data(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'user_id', p_user_id,
        'active_work_orders', (
            SELECT COUNT(*) 
            FROM work_orders wo
            JOIN users u ON wo.assigned_to = u.id
            WHERE u.id = p_user_id 
            AND wo.status IN ('SCHEDULED', 'IN_PROGRESS')
        ),
        'completed_today', (
            SELECT COUNT(*) 
            FROM work_orders wo
            JOIN users u ON wo.assigned_to = u.id
            WHERE u.id = p_user_id 
            AND wo.status = 'COMPLETED'
            AND DATE(wo.actual_end) = CURRENT_DATE
        ),
        'total_revenue_today', (
            SELECT COALESCE(SUM(wo.total_amount), 0)
            FROM work_orders wo
            JOIN users u ON wo.assigned_to = u.id
            WHERE u.id = p_user_id 
            AND wo.status = 'COMPLETED'
            AND DATE(wo.actual_end) = CURRENT_DATE
        ),
        'pending_invoices', (
            SELECT COUNT(*)
            FROM invoices i
            JOIN work_orders wo ON i.work_order_id = wo.id
            JOIN users u ON wo.assigned_to = u.id
            WHERE u.id = p_user_id
            AND i.status IN ('DRAFT', 'SENT')
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- 5. CREATE TRIGGER FOR updated_at ON user_dashboard_settings
-- =========================================

CREATE OR REPLACE FUNCTION update_user_dashboard_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_dashboard_settings_updated_at
    BEFORE UPDATE ON user_dashboard_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_dashboard_settings_updated_at();

-- =========================================
-- 6. INSERT DEFAULT DASHBOARD SETTINGS FOR EXISTING USERS
-- =========================================

-- Create default dashboard settings for all existing users
INSERT INTO user_dashboard_settings (user_id, dashboard_config, widget_preferences)
SELECT 
    u.id,
    '{
        "layout": "default",
        "widgets": ["work_orders", "revenue", "schedule", "notifications"],
        "refresh_interval": 300
    }'::jsonb,
    '{
        "work_orders": {"visible": true, "position": 1},
        "revenue": {"visible": true, "position": 2},
        "schedule": {"visible": true, "position": 3},
        "notifications": {"visible": true, "position": 4}
    }'::jsonb
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_dashboard_settings uds WHERE uds.user_id = u.id
);

COMMIT;

-- =========================================
-- SUCCESS MESSAGE
-- =========================================

DO $$
BEGIN
    RAISE NOTICE '🎉 SPECIFIC SCHEMA GAPS FIXED!';
    RAISE NOTICE '✅ Added: user_dashboard_settings table (fixes 404 errors)';
    RAISE NOTICE '✅ Added: profiles.status column (fixes 400 errors)';
    RAISE NOTICE '✅ Added: payments.received_at column (fixes 400 errors)';
    RAISE NOTICE '✅ Created: Dashboard helper functions';
    RAISE NOTICE '✅ Added: Default dashboard settings for existing users';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 This should fix the specific 400/404 errors in logs!';
    RAISE NOTICE '📊 Frontend queries should now work properly';
END $$;
