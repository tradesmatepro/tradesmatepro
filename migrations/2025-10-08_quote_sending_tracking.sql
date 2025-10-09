-- =====================================================
-- Quote Sending & Tracking Fields Migration
-- Industry Standard: Jobber, ServiceTitan, Housecall Pro
-- =====================================================

-- Add sending tracking fields
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS sent_via TEXT[], -- ['email', 'sms', 'portal']
ADD COLUMN IF NOT EXISTS sent_to_email TEXT,
ADD COLUMN IF NOT EXISTS sent_to_phone TEXT;

-- Add viewing tracking fields
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP;

-- Add approval tracking fields
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS approved_by TEXT, -- customer name
ADD COLUMN IF NOT EXISTS approval_signature TEXT, -- base64 image or typed name
ADD COLUMN IF NOT EXISTS approval_ip_address TEXT,
ADD COLUMN IF NOT EXISTS approval_method TEXT; -- 'online', 'manual', 'verbal'

-- Add email tracking fields (Resend webhooks)
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS email_id TEXT, -- Resend email ID
ADD COLUMN IF NOT EXISTS email_delivered_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_clicked_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_bounced BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_bounce_reason TEXT;

-- Add portal link fields
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS portal_token TEXT UNIQUE, -- secure token for magic link
ADD COLUMN IF NOT EXISTS portal_link_expires_at TIMESTAMP;

-- Add quote expiration fields
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS expiration_date DATE,
ADD COLUMN IF NOT EXISTS expiration_reminder_sent BOOLEAN DEFAULT false;

-- Add follow-up reminder fields
ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS follow_up_reminder_days INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS follow_up_reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS follow_up_reminder_sent_at TIMESTAMP;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_orders_sent_at ON work_orders(sent_at);
CREATE INDEX IF NOT EXISTS idx_work_orders_viewed_at ON work_orders(viewed_at);
CREATE INDEX IF NOT EXISTS idx_work_orders_approved_at ON work_orders(approved_at);
CREATE INDEX IF NOT EXISTS idx_work_orders_portal_token ON work_orders(portal_token);
CREATE INDEX IF NOT EXISTS idx_work_orders_email_id ON work_orders(email_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_expiration_date ON work_orders(expiration_date);

-- Add comments for documentation
COMMENT ON COLUMN work_orders.sent_at IS 'Timestamp when quote was first sent to customer';
COMMENT ON COLUMN work_orders.sent_via IS 'Array of delivery methods used: email, sms, portal';
COMMENT ON COLUMN work_orders.sent_to_email IS 'Email address quote was sent to';
COMMENT ON COLUMN work_orders.sent_to_phone IS 'Phone number quote was sent to (SMS)';
COMMENT ON COLUMN work_orders.viewed_at IS 'Timestamp when customer first viewed the quote';
COMMENT ON COLUMN work_orders.view_count IS 'Number of times customer viewed the quote';
COMMENT ON COLUMN work_orders.last_viewed_at IS 'Timestamp of most recent view';
COMMENT ON COLUMN work_orders.approved_at IS 'Timestamp when customer approved the quote';
COMMENT ON COLUMN work_orders.approved_by IS 'Name of person who approved (for records)';
COMMENT ON COLUMN work_orders.approval_signature IS 'Base64 encoded signature image or typed name';
COMMENT ON COLUMN work_orders.approval_ip_address IS 'IP address of approval (for security)';
COMMENT ON COLUMN work_orders.approval_method IS 'How quote was approved: online, manual, verbal';
COMMENT ON COLUMN work_orders.email_id IS 'Resend email ID for tracking';
COMMENT ON COLUMN work_orders.email_delivered_at IS 'Timestamp when email was delivered';
COMMENT ON COLUMN work_orders.email_opened_at IS 'Timestamp when email was opened';
COMMENT ON COLUMN work_orders.email_clicked_at IS 'Timestamp when quote link was clicked';
COMMENT ON COLUMN work_orders.email_bounced IS 'Whether email bounced';
COMMENT ON COLUMN work_orders.email_bounce_reason IS 'Reason for email bounce';
COMMENT ON COLUMN work_orders.portal_token IS 'Secure token for magic link access';
COMMENT ON COLUMN work_orders.portal_link_expires_at IS 'When portal link expires (24 hours default)';
COMMENT ON COLUMN work_orders.expiration_date IS 'Date when quote expires';
COMMENT ON COLUMN work_orders.expiration_reminder_sent IS 'Whether expiration reminder was sent';
COMMENT ON COLUMN work_orders.follow_up_reminder_days IS 'Days after sending to send follow-up reminder';
COMMENT ON COLUMN work_orders.follow_up_reminder_sent IS 'Whether follow-up reminder was sent';
COMMENT ON COLUMN work_orders.follow_up_reminder_sent_at IS 'When follow-up reminder was sent';

-- =====================================================
-- Success Message
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Quote sending & tracking fields added successfully!';
  RAISE NOTICE '📊 New fields: sent_at, sent_via, viewed_at, approved_at, email tracking, portal_token';
  RAISE NOTICE '🔗 Portal links will use secure tokens with 24-hour expiration';
  RAISE NOTICE '📧 Email tracking via Resend webhooks enabled';
  RAISE NOTICE '✍️ E-signature capture ready';
END $$;

