-- =====================================================
-- QUOTE MODAL DATA FIELDS MIGRATION
-- =====================================================
-- Purpose: Add columns to work_orders table to store rich data captured by quote status modals
-- Date: 2025-10-08
-- Industry Standard: ServiceTitan, Jobber, Housecall Pro all track this data for sales analytics
--
-- What this enables:
-- 1. Sales Analytics: Track conversion rates by presentation method, salesperson, customer reaction
-- 2. Follow-up Management: Automated reminders, task creation
-- 3. Process Improvement: Identify common objections, pricing issues
-- 4. Reporting: Sales pipeline, quote aging, win/loss analysis
-- 5. Customer Communication: Reference past conversations, track promises made
-- =====================================================

-- =====================================================
-- PRESENTED MODAL DATA
-- =====================================================
-- Tracks when quote was presented in person to customer

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS presented_time TIME;

COMMENT ON COLUMN work_orders.presented_time IS 'Time quote was presented in person';

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS presented_by TEXT;

COMMENT ON COLUMN work_orders.presented_by IS 'Name of technician/salesperson who presented quote';

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS customer_reaction TEXT;

COMMENT ON COLUMN work_orders.customer_reaction IS 'Customer reaction: very_interested, interested, neutral, hesitant, not_interested, needs_time';

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS next_steps TEXT;

COMMENT ON COLUMN work_orders.next_steps IS 'Next steps after presentation';

-- Note: presented_date and presented_notes already exist in work_orders table

-- =====================================================
-- CHANGES REQUESTED MODAL DATA
-- =====================================================
-- Tracks what changes customer requested to quote

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS change_types JSONB;

COMMENT ON COLUMN work_orders.change_types IS 'Array of change types requested: reduce_price, add_discount, payment_terms, add_items, remove_items, change_materials, change_scope, change_timeline, expedite_start, delay_start, warranty_changes, other';

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS change_details TEXT;

COMMENT ON COLUMN work_orders.change_details IS 'Specific details about requested changes';

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS change_urgency TEXT;

COMMENT ON COLUMN work_orders.change_urgency IS 'Urgency of changes: normal, high, urgent';

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS change_follow_up_date DATE;

COMMENT ON COLUMN work_orders.change_follow_up_date IS 'Date to follow up with revised quote';

-- =====================================================
-- FOLLOW UP MODAL DATA
-- =====================================================
-- Tracks follow-up scheduling for quotes

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS follow_up_date DATE;

COMMENT ON COLUMN work_orders.follow_up_date IS 'Date to follow up with customer';

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS follow_up_time TIME;

COMMENT ON COLUMN work_orders.follow_up_time IS 'Time to follow up with customer';

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS follow_up_method TEXT;

COMMENT ON COLUMN work_orders.follow_up_method IS 'Follow-up method: call, email, sms, visit, other';

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS follow_up_reminder_time TEXT;

COMMENT ON COLUMN work_orders.follow_up_reminder_time IS 'When to remind: 1_day_before, same_day, 1_hour_before, 30_min_before';

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS follow_up_reason TEXT;

COMMENT ON COLUMN work_orders.follow_up_reason IS 'Reason for follow-up';

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS follow_up_notes TEXT;

COMMENT ON COLUMN work_orders.follow_up_notes IS 'Notes about follow-up';

-- =====================================================
-- REJECTION MODAL DATA
-- =====================================================
-- Tracks why customer rejected quote (for win/loss analysis)

-- Note: rejection_reason already exists in work_orders table

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS rejection_competitor_name TEXT;

COMMENT ON COLUMN work_orders.rejection_competitor_name IS 'Name of competitor customer went with (if applicable)';

-- Note: rejection_notes already exists in work_orders table

-- =====================================================
-- APPROVAL MODAL DATA
-- =====================================================
-- Note: Approval modal data (customer_approved_at, approval_notes, deposit_amount, deposit_method)
-- already exists in work_orders table from previous migrations

-- =====================================================
-- INDEXES FOR ANALYTICS QUERIES
-- =====================================================
-- These indexes support common analytics queries for sales reporting

CREATE INDEX IF NOT EXISTS idx_work_orders_customer_reaction 
ON work_orders(customer_reaction) 
WHERE customer_reaction IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_work_orders_rejection_reason 
ON work_orders(rejection_reason) 
WHERE rejection_reason IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_work_orders_follow_up_date 
ON work_orders(follow_up_date) 
WHERE follow_up_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_work_orders_presented_by 
ON work_orders(presented_by) 
WHERE presented_by IS NOT NULL;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify all columns were added successfully:
--
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'work_orders'
-- AND column_name IN (
--   'presented_time', 'presented_by', 'customer_reaction', 'next_steps',
--   'change_types', 'change_details', 'change_urgency', 'change_follow_up_date',
--   'follow_up_date', 'follow_up_time', 'follow_up_method', 'follow_up_reminder_time', 
--   'follow_up_reason', 'follow_up_notes',
--   'rejection_competitor_name'
-- )
-- ORDER BY column_name;

-- =====================================================
-- EXAMPLE ANALYTICS QUERIES
-- =====================================================

-- Win/Loss Analysis by Rejection Reason:
-- SELECT rejection_reason, COUNT(*) as count
-- FROM work_orders
-- WHERE status = 'rejected' AND rejection_reason IS NOT NULL
-- GROUP BY rejection_reason
-- ORDER BY count DESC;

-- Conversion Rate by Customer Reaction:
-- SELECT customer_reaction, 
--        COUNT(*) as presented_count,
--        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
--        ROUND(100.0 * SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate
-- FROM work_orders
-- WHERE customer_reaction IS NOT NULL
-- GROUP BY customer_reaction
-- ORDER BY conversion_rate DESC;

-- Top Performing Salespeople:
-- SELECT presented_by,
--        COUNT(*) as quotes_presented,
--        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as quotes_approved,
--        ROUND(100.0 * SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) / COUNT(*), 2) as win_rate
-- FROM work_orders
-- WHERE presented_by IS NOT NULL
-- GROUP BY presented_by
-- ORDER BY win_rate DESC;

-- Common Change Requests:
-- SELECT jsonb_array_elements_text(change_types) as change_type, COUNT(*) as count
-- FROM work_orders
-- WHERE change_types IS NOT NULL
-- GROUP BY change_type
-- ORDER BY count DESC;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

