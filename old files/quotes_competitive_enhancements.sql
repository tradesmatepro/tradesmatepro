-- =====================================================
-- QUOTES COMPETITIVE ENHANCEMENTS - DATABASE SCHEMA
-- Industry Standard Naming Conventions
-- =====================================================

BEGIN;

-- =====================================================
-- 1. QUOTE VERSIONING SYSTEM
-- =====================================================

-- Quote versions for comparison and revision tracking
CREATE TABLE IF NOT EXISTS quote_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  version_name TEXT,
  version_description TEXT,
  
  -- Snapshot of quote data at this version
  quote_data JSONB NOT NULL,
  pricing_model TEXT NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Version metadata
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_current BOOLEAN DEFAULT FALSE,
  
  -- Constraints
  UNIQUE(work_order_id, version_number),
  CHECK (version_number > 0)
);

-- =====================================================
-- 2. QUOTE ANALYTICS & TRACKING
-- =====================================================

-- Quote performance tracking
CREATE TABLE IF NOT EXISTS quote_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- View and engagement tracking
  views_count INTEGER DEFAULT 0,
  customer_views_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  last_customer_viewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Email tracking
  emails_sent_count INTEGER DEFAULT 0,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  email_opens_count INTEGER DEFAULT 0,
  last_email_opened_at TIMESTAMP WITH TIME ZONE,
  
  -- Response tracking
  customer_response_time_hours INTEGER,
  sales_rep_response_time_hours INTEGER,
  
  -- Competitive analysis
  competitor_mentioned TEXT,
  lost_to_competitor TEXT,
  win_loss_reason TEXT,
  win_loss_notes TEXT,
  
  -- Performance metrics
  quote_to_close_days INTEGER,
  follow_up_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. QUOTE FOLLOW-UP AUTOMATION
-- =====================================================

-- Quote follow-up sequences and automation
CREATE TABLE IF NOT EXISTS quote_follow_ups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- Follow-up details
  follow_up_type TEXT NOT NULL CHECK (follow_up_type IN ('email', 'call', 'sms', 'meeting', 'task')),
  follow_up_method TEXT NOT NULL CHECK (follow_up_method IN ('manual', 'automated', 'scheduled')),
  
  -- Scheduling
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_date TIMESTAMP WITH TIME ZONE,
  
  -- Content
  subject TEXT,
  message TEXT,
  template_used TEXT,
  
  -- Assignment
  assigned_to UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
  completion_notes TEXT,
  
  -- Automation
  sequence_step INTEGER DEFAULT 1,
  auto_sequence_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. QUOTE APPROVAL WORKFLOWS
-- =====================================================

-- Quote approval workflows for large deals
CREATE TABLE IF NOT EXISTS quote_approval_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- Approval details
  total_amount DECIMAL(12,2) NOT NULL,
  approval_level TEXT NOT NULL CHECK (approval_level IN ('manager', 'owner', 'custom')),
  required_approvers TEXT[] NOT NULL DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  
  -- Workflow metadata
  created_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual approval steps
CREATE TABLE IF NOT EXISTS quote_approval_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES quote_approval_workflows(id) ON DELETE CASCADE,
  
  -- Approver details
  approver_id UUID NOT NULL REFERENCES users(id),
  approver_role TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  
  -- Approval status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(workflow_id, step_order)
);

-- =====================================================
-- 5. QUOTE COLLABORATION & COMMENTS
-- =====================================================

-- Quote collaboration and internal comments
CREATE TABLE IF NOT EXISTS quote_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- Comment details
  comment_text TEXT NOT NULL,
  comment_type TEXT DEFAULT 'internal' CHECK (comment_type IN ('internal', 'customer', 'system')),
  
  -- User details
  created_by UUID NOT NULL REFERENCES users(id),
  mentioned_users UUID[] DEFAULT '{}',
  
  -- Threading
  parent_comment_id UUID REFERENCES quote_comments(id),
  thread_level INTEGER DEFAULT 0,
  
  -- Metadata
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. QUOTE TEMPLATES ENHANCEMENTS
-- =====================================================

-- Enhanced quote templates with analytics
ALTER TABLE quote_templates ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
ALTER TABLE quote_templates ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE quote_templates ADD COLUMN IF NOT EXISTS avg_close_time_days INTEGER DEFAULT 0;
ALTER TABLE quote_templates ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 7. SALES PIPELINE INTEGRATION
-- =====================================================

-- Link quotes to opportunities and leads
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS opportunity_id UUID REFERENCES opportunities(id);
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS lead_source TEXT;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS sales_rep_id UUID REFERENCES users(id);
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS expected_close_date DATE;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS probability_percentage INTEGER DEFAULT 50 CHECK (probability_percentage BETWEEN 0 AND 100);

-- =====================================================
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================

-- Quote versions indexes
CREATE INDEX IF NOT EXISTS idx_quote_versions_work_order_id ON quote_versions(work_order_id);
CREATE INDEX IF NOT EXISTS idx_quote_versions_company_id ON quote_versions(company_id);
CREATE INDEX IF NOT EXISTS idx_quote_versions_current ON quote_versions(work_order_id, is_current) WHERE is_current = TRUE;

-- Quote analytics indexes
CREATE INDEX IF NOT EXISTS idx_quote_analytics_work_order_id ON quote_analytics(work_order_id);
CREATE INDEX IF NOT EXISTS idx_quote_analytics_company_id ON quote_analytics(company_id);

-- Quote follow-ups indexes
CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_work_order_id ON quote_follow_ups(work_order_id);
CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_scheduled_date ON quote_follow_ups(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_assigned_to ON quote_follow_ups(assigned_to);
CREATE INDEX IF NOT EXISTS idx_quote_follow_ups_status ON quote_follow_ups(status);

-- Quote approval workflows indexes
CREATE INDEX IF NOT EXISTS idx_quote_approval_workflows_work_order_id ON quote_approval_workflows(work_order_id);
CREATE INDEX IF NOT EXISTS idx_quote_approval_workflows_status ON quote_approval_workflows(status);

-- Quote comments indexes
CREATE INDEX IF NOT EXISTS idx_quote_comments_work_order_id ON quote_comments(work_order_id);
CREATE INDEX IF NOT EXISTS idx_quote_comments_parent ON quote_comments(parent_comment_id);

-- Work orders sales pipeline indexes
CREATE INDEX IF NOT EXISTS idx_work_orders_opportunity_id ON work_orders(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_sales_rep_id ON work_orders(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_expected_close_date ON work_orders(expected_close_date);

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE quote_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company isolation
CREATE POLICY quote_versions_company_isolation ON quote_versions FOR ALL USING (company_id = current_setting('app.current_company_id')::UUID);
CREATE POLICY quote_analytics_company_isolation ON quote_analytics FOR ALL USING (company_id = current_setting('app.current_company_id')::UUID);
CREATE POLICY quote_follow_ups_company_isolation ON quote_follow_ups FOR ALL USING (company_id = current_setting('app.current_company_id')::UUID);
CREATE POLICY quote_approval_workflows_company_isolation ON quote_approval_workflows FOR ALL USING (company_id = current_setting('app.current_company_id')::UUID);
CREATE POLICY quote_approval_steps_company_isolation ON quote_approval_steps FOR ALL USING (company_id = current_setting('app.current_company_id')::UUID);
CREATE POLICY quote_comments_company_isolation ON quote_comments FOR ALL USING (company_id = current_setting('app.current_company_id')::UUID);

-- =====================================================
-- 10. HELPER FUNCTIONS
-- =====================================================

-- Function to create new quote version
CREATE OR REPLACE FUNCTION create_quote_version(
  p_work_order_id UUID,
  p_version_name TEXT DEFAULT NULL,
  p_version_description TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_company_id UUID;
  v_next_version INTEGER;
  v_quote_data JSONB;
  v_pricing_model TEXT;
  v_total_amount DECIMAL(12,2);
  v_version_id UUID;
BEGIN
  -- Get company_id and quote data
  SELECT company_id,
         row_to_json(work_orders.*)::jsonb,
         pricing_model,
         total_amount
  INTO v_company_id, v_quote_data, v_pricing_model, v_total_amount
  FROM work_orders
  WHERE id = p_work_order_id AND stage = 'QUOTE';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quote not found';
  END IF;

  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_next_version
  FROM quote_versions
  WHERE work_order_id = p_work_order_id;

  -- Mark all previous versions as not current
  UPDATE quote_versions
  SET is_current = FALSE
  WHERE work_order_id = p_work_order_id;

  -- Create new version
  INSERT INTO quote_versions (
    company_id, work_order_id, version_number, version_name, version_description,
    quote_data, pricing_model, total_amount, created_by, is_current
  ) VALUES (
    v_company_id, p_work_order_id, v_next_version, p_version_name, p_version_description,
    v_quote_data, v_pricing_model, v_total_amount, p_created_by, TRUE
  ) RETURNING id INTO v_version_id;

  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track quote analytics
CREATE OR REPLACE FUNCTION update_quote_analytics(
  p_work_order_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Get company_id
  SELECT company_id INTO v_company_id
  FROM work_orders
  WHERE id = p_work_order_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Insert or update analytics record
  INSERT INTO quote_analytics (company_id, work_order_id)
  VALUES (v_company_id, p_work_order_id)
  ON CONFLICT (work_order_id) DO NOTHING;

  -- Update based on event type
  CASE p_event_type
    WHEN 'view' THEN
      UPDATE quote_analytics
      SET views_count = views_count + 1,
          last_viewed_at = NOW(),
          updated_at = NOW()
      WHERE work_order_id = p_work_order_id;

    WHEN 'customer_view' THEN
      UPDATE quote_analytics
      SET customer_views_count = customer_views_count + 1,
          last_customer_viewed_at = NOW(),
          updated_at = NOW()
      WHERE work_order_id = p_work_order_id;

    WHEN 'email_sent' THEN
      UPDATE quote_analytics
      SET emails_sent_count = emails_sent_count + 1,
          last_email_sent_at = NOW(),
          updated_at = NOW()
      WHERE work_order_id = p_work_order_id;

    WHEN 'email_opened' THEN
      UPDATE quote_analytics
      SET email_opens_count = email_opens_count + 1,
          last_email_opened_at = NOW(),
          updated_at = NOW()
      WHERE work_order_id = p_work_order_id;

    WHEN 'follow_up' THEN
      UPDATE quote_analytics
      SET follow_up_count = follow_up_count + 1,
          updated_at = NOW()
      WHERE work_order_id = p_work_order_id;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to schedule automatic follow-ups
CREATE OR REPLACE FUNCTION schedule_quote_follow_ups(
  p_work_order_id UUID,
  p_sequence_type TEXT DEFAULT 'standard'
) RETURNS VOID AS $$
DECLARE
  v_company_id UUID;
  v_created_by UUID;
  v_sales_rep_id UUID;
BEGIN
  -- Get quote details
  SELECT company_id, created_by, sales_rep_id
  INTO v_company_id, v_created_by, v_sales_rep_id
  FROM work_orders
  WHERE id = p_work_order_id AND stage = 'QUOTE';

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Schedule standard follow-up sequence
  IF p_sequence_type = 'standard' THEN
    -- Day 1: Email follow-up
    INSERT INTO quote_follow_ups (
      company_id, work_order_id, follow_up_type, follow_up_method,
      scheduled_date, subject, assigned_to, created_by, sequence_step
    ) VALUES (
      v_company_id, p_work_order_id, 'email', 'automated',
      NOW() + INTERVAL '1 day', 'Quote Follow-up',
      COALESCE(v_sales_rep_id, v_created_by), v_created_by, 1
    );

    -- Day 3: Phone call
    INSERT INTO quote_follow_ups (
      company_id, work_order_id, follow_up_type, follow_up_method,
      scheduled_date, subject, assigned_to, created_by, sequence_step
    ) VALUES (
      v_company_id, p_work_order_id, 'call', 'scheduled',
      NOW() + INTERVAL '3 days', 'Quote Follow-up Call',
      COALESCE(v_sales_rep_id, v_created_by), v_created_by, 2
    );

    -- Day 7: Final email
    INSERT INTO quote_follow_ups (
      company_id, work_order_id, follow_up_type, follow_up_method,
      scheduled_date, subject, assigned_to, created_by, sequence_step
    ) VALUES (
      v_company_id, p_work_order_id, 'email', 'automated',
      NOW() + INTERVAL '7 days', 'Final Quote Follow-up',
      COALESCE(v_sales_rep_id, v_created_by), v_created_by, 3
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 11. TRIGGERS
-- =====================================================

-- Trigger to automatically create quote analytics record
CREATE OR REPLACE FUNCTION trigger_create_quote_analytics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stage = 'QUOTE' AND (TG_OP = 'INSERT' OR OLD.stage != 'QUOTE') THEN
    INSERT INTO quote_analytics (company_id, work_order_id)
    VALUES (NEW.company_id, NEW.id)
    ON CONFLICT (work_order_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER work_orders_create_analytics
  AFTER INSERT OR UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_quote_analytics();

-- Trigger to update template usage statistics
CREATE OR REPLACE FUNCTION trigger_update_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.template_used IS NOT NULL THEN
    UPDATE quote_templates
    SET usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE id = NEW.template_used::UUID;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add template_used column to work_orders if not exists
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS template_used TEXT;

CREATE TRIGGER work_orders_update_template_usage
  AFTER INSERT ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_template_usage();

COMMIT;
