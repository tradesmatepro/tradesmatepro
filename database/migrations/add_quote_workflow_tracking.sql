-- ============================================================================
-- PHASE 3: QUOTE WORKFLOW TRACKING COLUMNS
-- ============================================================================
-- Purpose: Add tracking columns for all quote status transitions
-- Date: 2025-10-03
-- Modals: SendQuote, Presented, Approval, Rejection, ChangesRequested, FollowUp, Expired
-- ============================================================================

-- ============================================================================
-- 1. SEND QUOTE TRACKING
-- ============================================================================
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS sent_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS delivery_method text, -- 'email', 'sms', 'both'
  ADD COLUMN IF NOT EXISTS custom_message text;

-- ============================================================================
-- 2. PRESENTED TRACKING
-- ============================================================================
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS presented_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS presented_by text,
  ADD COLUMN IF NOT EXISTS customer_reaction text, -- 'very_interested', 'interested', 'neutral', 'hesitant', 'not_interested'
  ADD COLUMN IF NOT EXISTS presentation_next_steps text,
  ADD COLUMN IF NOT EXISTS presentation_notes text;

-- ============================================================================
-- 3. APPROVAL TRACKING
-- ============================================================================
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS customer_approved_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS deposit_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS deposit_method text, -- 'cash', 'check', 'credit_card', etc.
  ADD COLUMN IF NOT EXISTS approval_notes text;

-- ============================================================================
-- 4. REJECTION TRACKING
-- ============================================================================
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS rejected_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS competitor_name text,
  ADD COLUMN IF NOT EXISTS rejection_notes text;

-- ============================================================================
-- 5. CHANGES REQUESTED TRACKING
-- ============================================================================
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS changes_requested_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS change_types text[], -- Array of change types
  ADD COLUMN IF NOT EXISTS change_details text,
  ADD COLUMN IF NOT EXISTS change_urgency text, -- 'low', 'normal', 'high', 'urgent'
  ADD COLUMN IF NOT EXISTS follow_up_date date;

-- ============================================================================
-- 6. FOLLOW UP TRACKING
-- ============================================================================
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS follow_up_scheduled_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS follow_up_date date,
  ADD COLUMN IF NOT EXISTS follow_up_time time,
  ADD COLUMN IF NOT EXISTS follow_up_method text, -- 'call', 'email', 'sms', 'visit', 'other'
  ADD COLUMN IF NOT EXISTS follow_up_reminder text, -- '1_hour_before', '1_day_before', etc.
  ADD COLUMN IF NOT EXISTS follow_up_reason text,
  ADD COLUMN IF NOT EXISTS follow_up_notes text;

-- ============================================================================
-- 7. EXPIRED TRACKING
-- ============================================================================
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS expired_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS expiration_date date,
  ADD COLUMN IF NOT EXISTS renewed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS expired_notes text;

-- ============================================================================
-- 8. AUTO-TIMESTAMP TRIGGERS
-- ============================================================================

-- Trigger: Auto-set sent_at when status changes to 'sent'
CREATE OR REPLACE FUNCTION set_sent_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sent' AND (OLD.status IS NULL OR OLD.status != 'sent') THEN
    NEW.sent_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_sent_timestamp ON work_orders;
CREATE TRIGGER trigger_set_sent_timestamp
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_sent_timestamp();

-- Trigger: Auto-set presented_at when status changes to 'presented'
CREATE OR REPLACE FUNCTION set_presented_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'presented' AND (OLD.status IS NULL OR OLD.status != 'presented') THEN
    IF NEW.presented_at IS NULL THEN
      NEW.presented_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_presented_timestamp ON work_orders;
CREATE TRIGGER trigger_set_presented_timestamp
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_presented_timestamp();

-- Trigger: Auto-set customer_approved_at when status changes to 'approved'
CREATE OR REPLACE FUNCTION set_approved_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    IF NEW.customer_approved_at IS NULL THEN
      NEW.customer_approved_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_approved_timestamp ON work_orders;
CREATE TRIGGER trigger_set_approved_timestamp
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_approved_timestamp();

-- Trigger: Auto-set rejected_at when status changes to 'rejected'
CREATE OR REPLACE FUNCTION set_rejected_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    IF NEW.rejected_at IS NULL THEN
      NEW.rejected_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_rejected_timestamp ON work_orders;
CREATE TRIGGER trigger_set_rejected_timestamp
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_rejected_timestamp();

-- Trigger: Auto-set changes_requested_at when status changes to 'changes_requested'
CREATE OR REPLACE FUNCTION set_changes_requested_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'changes_requested' AND (OLD.status IS NULL OR OLD.status != 'changes_requested') THEN
    IF NEW.changes_requested_at IS NULL THEN
      NEW.changes_requested_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_changes_requested_timestamp ON work_orders;
CREATE TRIGGER trigger_set_changes_requested_timestamp
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_changes_requested_timestamp();

-- Trigger: Auto-set follow_up_scheduled_at when status changes to 'follow_up'
CREATE OR REPLACE FUNCTION set_follow_up_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'follow_up' AND (OLD.status IS NULL OR OLD.status != 'follow_up') THEN
    IF NEW.follow_up_scheduled_at IS NULL THEN
      NEW.follow_up_scheduled_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_follow_up_timestamp ON work_orders;
CREATE TRIGGER trigger_set_follow_up_timestamp
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_follow_up_timestamp();

-- Trigger: Auto-set expired_at when status changes to 'expired'
CREATE OR REPLACE FUNCTION set_expired_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'expired' AND (OLD.status IS NULL OR OLD.status != 'expired') THEN
    IF NEW.expired_at IS NULL THEN
      NEW.expired_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_expired_timestamp ON work_orders;
CREATE TRIGGER trigger_set_expired_timestamp
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_expired_timestamp();

-- ============================================================================
-- 9. ANALYTICS VIEWS
-- ============================================================================

-- View: Quote Rejection Analytics
CREATE OR REPLACE VIEW quote_rejection_analytics AS
SELECT
  company_id,
  rejection_reason,
  COUNT(*) as rejection_count,
  COUNT(DISTINCT competitor_name) FILTER (WHERE competitor_name IS NOT NULL) as competitor_count,
  ARRAY_AGG(DISTINCT competitor_name) FILTER (WHERE competitor_name IS NOT NULL) as competitors,
  AVG(total_amount) as avg_quote_value,
  MIN(rejected_at) as first_rejection,
  MAX(rejected_at) as last_rejection
FROM work_orders
WHERE status = 'rejected' AND rejected_at IS NOT NULL
GROUP BY company_id, rejection_reason
ORDER BY rejection_count DESC;

-- View: Changes Requested Analytics
CREATE OR REPLACE VIEW changes_requested_analytics AS
SELECT
  company_id,
  UNNEST(change_types) as change_type,
  COUNT(*) as request_count,
  change_urgency,
  AVG(total_amount) as avg_quote_value
FROM work_orders
WHERE status = 'changes_requested' AND changes_requested_at IS NOT NULL
GROUP BY company_id, change_type, change_urgency
ORDER BY request_count DESC;

-- View: Follow-Up Due Today
CREATE OR REPLACE VIEW follow_ups_due_today AS
SELECT
  wo.id,
  wo.title,
  wo.company_id,
  wo.customer_id,
  c.name as customer_name,
  c.email as customer_email,
  c.phone as customer_phone,
  wo.follow_up_date,
  wo.follow_up_time,
  wo.follow_up_method,
  wo.follow_up_reason,
  wo.follow_up_notes,
  wo.total_amount as quote_value
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
WHERE wo.status = 'follow_up'
  AND wo.follow_up_date = CURRENT_DATE
ORDER BY wo.follow_up_time;

-- View: Quotes Expiring Soon (next 7 days)
CREATE OR REPLACE VIEW quotes_expiring_soon AS
SELECT
  wo.id,
  wo.title,
  wo.company_id,
  wo.customer_id,
  c.name as customer_name,
  c.email as customer_email,
  wo.expiration_date,
  wo.total_amount as quote_value,
  wo.sent_at,
  (wo.expiration_date - CURRENT_DATE) as days_until_expiration
FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
WHERE wo.status IN ('sent', 'presented', 'follow_up')
  AND wo.expiration_date IS NOT NULL
  AND wo.expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY wo.expiration_date;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All quote workflow tracking columns added
-- All auto-timestamp triggers created
-- All analytics views created
-- ============================================================================

