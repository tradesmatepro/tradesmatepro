-- Advanced Quote Management Features for TradeMate Pro
-- Creates tables for quote analytics, approval workflows, and follow-ups
-- Run this in your Supabase SQL editor

BEGIN;

-- =====================================================
-- 1. QUOTE ANALYTICS TABLE
-- =====================================================
-- Tracks quote performance metrics and conversion data
CREATE TABLE IF NOT EXISTS public.quote_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  
  -- Analytics Data
  quote_sent_date TIMESTAMP WITH TIME ZONE,
  first_viewed_date TIMESTAMP WITH TIME ZONE,
  last_viewed_date TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  time_to_first_view_hours DECIMAL(10,2),
  time_to_decision_hours DECIMAL(10,2),
  
  -- Conversion Tracking
  conversion_stage TEXT DEFAULT 'SENT' CHECK (conversion_stage IN ('SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
  rejection_reason TEXT,
  competitor_name TEXT,
  lost_to_price BOOLEAN DEFAULT FALSE,
  
  -- Performance Metrics
  quote_value DECIMAL(12,2),
  final_job_value DECIMAL(12,2),
  value_variance_percentage DECIMAL(5,2),
  
  -- Customer Interaction
  customer_questions_count INTEGER DEFAULT 0,
  revision_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 2. QUOTE APPROVAL WORKFLOWS TABLE  
-- =====================================================
-- Manages multi-step approval processes for quotes
CREATE TABLE IF NOT EXISTS public.quote_approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  
  -- Workflow Definition
  workflow_name TEXT NOT NULL DEFAULT 'Standard Approval',
  approval_type TEXT NOT NULL CHECK (approval_type IN ('MANAGER', 'CUSTOMER', 'FINANCE', 'TECHNICAL')),
  sequence_order INTEGER NOT NULL DEFAULT 1,
  
  -- Approval Status
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SKIPPED')),
  required BOOLEAN DEFAULT TRUE,
  
  -- Approver Information
  approver_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approver_name TEXT,
  approver_email TEXT,
  
  -- Decision Details
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  decision_notes TEXT,
  rejection_reason TEXT,
  
  -- Workflow Rules
  auto_approve_threshold DECIMAL(12,2), -- Auto-approve if quote under this amount
  requires_manager_approval BOOLEAN DEFAULT FALSE,
  requires_customer_approval BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 3. QUOTE FOLLOW-UPS TABLE
-- =====================================================
-- Manages automated and manual follow-up scheduling
CREATE TABLE IF NOT EXISTS public.quote_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  
  -- Follow-up Details
  follow_up_type TEXT NOT NULL CHECK (follow_up_type IN ('EMAIL', 'PHONE', 'SMS', 'IN_PERSON', 'AUTOMATED')),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_date TIMESTAMP WITH TIME ZONE,
  
  -- Assignment
  assigned_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Follow-up Content
  subject TEXT,
  message TEXT,
  template_used TEXT,
  
  -- Status and Results
  status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'FAILED')),
  outcome TEXT CHECK (outcome IN ('NO_RESPONSE', 'INTERESTED', 'NOT_INTERESTED', 'NEEDS_REVISION', 'ACCEPTED', 'REJECTED')),
  customer_response TEXT,
  
  -- Automation Rules
  is_automated BOOLEAN DEFAULT FALSE,
  trigger_days_after INTEGER, -- Days after quote sent to trigger
  max_attempts INTEGER DEFAULT 3,
  attempt_number INTEGER DEFAULT 1,
  
  -- Next Steps
  next_follow_up_date TIMESTAMP WITH TIME ZONE,
  escalate_to_manager BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

-- Quote Analytics Indexes
CREATE INDEX IF NOT EXISTS quote_analytics_company_idx ON public.quote_analytics (company_id);
CREATE INDEX IF NOT EXISTS quote_analytics_work_order_idx ON public.quote_analytics (work_order_id);
CREATE INDEX IF NOT EXISTS quote_analytics_conversion_stage_idx ON public.quote_analytics (conversion_stage);
CREATE INDEX IF NOT EXISTS quote_analytics_sent_date_idx ON public.quote_analytics (quote_sent_date);

-- Quote Approval Workflows Indexes  
CREATE INDEX IF NOT EXISTS quote_approval_workflows_company_idx ON public.quote_approval_workflows (company_id);
CREATE INDEX IF NOT EXISTS quote_approval_workflows_work_order_idx ON public.quote_approval_workflows (work_order_id);
CREATE INDEX IF NOT EXISTS quote_approval_workflows_status_idx ON public.quote_approval_workflows (status);
CREATE INDEX IF NOT EXISTS quote_approval_workflows_approver_idx ON public.quote_approval_workflows (approver_user_id);
CREATE INDEX IF NOT EXISTS quote_approval_workflows_sequence_idx ON public.quote_approval_workflows (work_order_id, sequence_order);

-- Quote Follow-ups Indexes
CREATE INDEX IF NOT EXISTS quote_follow_ups_company_idx ON public.quote_follow_ups (company_id);
CREATE INDEX IF NOT EXISTS quote_follow_ups_work_order_idx ON public.quote_follow_ups (work_order_id);
CREATE INDEX IF NOT EXISTS quote_follow_ups_scheduled_date_idx ON public.quote_follow_ups (scheduled_date);
CREATE INDEX IF NOT EXISTS quote_follow_ups_assigned_user_idx ON public.quote_follow_ups (assigned_user_id);
CREATE INDEX IF NOT EXISTS quote_follow_ups_status_idx ON public.quote_follow_ups (status);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.quote_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_follow_ups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quote_analytics
CREATE POLICY "Users can view quote analytics for their company" ON public.quote_analytics
  FOR SELECT USING (company_id = (SELECT company_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert quote analytics for their company" ON public.quote_analytics
  FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update quote analytics for their company" ON public.quote_analytics
  FOR UPDATE USING (company_id = (SELECT company_id FROM public.users WHERE id = auth.uid()));

-- RLS Policies for quote_approval_workflows
CREATE POLICY "Users can view approval workflows for their company" ON public.quote_approval_workflows
  FOR SELECT USING (company_id = (SELECT company_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert approval workflows for their company" ON public.quote_approval_workflows
  FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update approval workflows for their company" ON public.quote_approval_workflows
  FOR UPDATE USING (company_id = (SELECT company_id FROM public.users WHERE id = auth.uid()));

-- RLS Policies for quote_follow_ups
CREATE POLICY "Users can view follow-ups for their company" ON public.quote_follow_ups
  FOR SELECT USING (company_id = (SELECT company_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert follow-ups for their company" ON public.quote_follow_ups
  FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update follow-ups for their company" ON public.quote_follow_ups
  FOR UPDATE USING (company_id = (SELECT company_id FROM public.users WHERE id = auth.uid()));

COMMIT;

-- =====================================================
-- 6. VERIFICATION QUERIES
-- =====================================================

-- Check that tables were created
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('quote_analytics', 'quote_approval_workflows', 'quote_follow_ups')
ORDER BY table_name;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('quote_analytics', 'quote_approval_workflows', 'quote_follow_ups');

-- =====================================================
-- 7. TRIGGER FUNCTIONS FOR AUTOMATION
-- =====================================================

-- Function to automatically create quote analytics when quote is sent
CREATE OR REPLACE FUNCTION create_quote_analytics_on_send()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create analytics when quote status changes to SENT
  IF NEW.stage = 'QUOTE' AND NEW.quote_status = 'SENT' AND
     (OLD.quote_status IS NULL OR OLD.quote_status != 'SENT') THEN

    INSERT INTO public.quote_analytics (
      company_id,
      work_order_id,
      quote_sent_date,
      conversion_stage,
      quote_value
    ) VALUES (
      NEW.company_id,
      NEW.id,
      NOW(),
      'SENT',
      NEW.total_amount
    )
    ON CONFLICT (work_order_id) DO UPDATE SET
      quote_sent_date = NOW(),
      conversion_stage = 'SENT',
      quote_value = NEW.total_amount,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update analytics when quote status changes
CREATE OR REPLACE FUNCTION update_quote_analytics_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update analytics when quote status changes
  IF NEW.stage = 'QUOTE' AND NEW.quote_status != OLD.quote_status THEN
    UPDATE public.quote_analytics
    SET
      conversion_stage = NEW.quote_status,
      time_to_decision_hours = EXTRACT(EPOCH FROM (NOW() - quote_sent_date)) / 3600,
      updated_at = NOW()
    WHERE work_order_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create default approval workflow
CREATE OR REPLACE FUNCTION create_default_approval_workflow()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default customer approval workflow for new quotes
  IF NEW.stage = 'QUOTE' AND NEW.quote_status = 'SENT' THEN
    INSERT INTO public.quote_approval_workflows (
      company_id,
      work_order_id,
      workflow_name,
      approval_type,
      sequence_order,
      required,
      requires_customer_approval
    ) VALUES (
      NEW.company_id,
      NEW.id,
      'Customer Approval',
      'CUSTOMER',
      1,
      TRUE,
      TRUE
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to schedule automatic follow-ups
CREATE OR REPLACE FUNCTION schedule_quote_follow_ups()
RETURNS TRIGGER AS $$
BEGIN
  -- Schedule follow-ups when quote is sent
  IF NEW.stage = 'QUOTE' AND NEW.quote_status = 'SENT' AND
     (OLD.quote_status IS NULL OR OLD.quote_status != 'SENT') THEN

    -- Schedule first follow-up in 3 days
    INSERT INTO public.quote_follow_ups (
      company_id,
      work_order_id,
      follow_up_type,
      scheduled_date,
      subject,
      message,
      is_automated,
      trigger_days_after,
      attempt_number
    ) VALUES (
      NEW.company_id,
      NEW.id,
      'EMAIL',
      NOW() + INTERVAL '3 days',
      'Following up on your quote',
      'Hi! I wanted to follow up on the quote we sent you. Do you have any questions?',
      TRUE,
      3,
      1
    );

    -- Schedule second follow-up in 7 days
    INSERT INTO public.quote_follow_ups (
      company_id,
      work_order_id,
      follow_up_type,
      scheduled_date,
      subject,
      message,
      is_automated,
      trigger_days_after,
      attempt_number
    ) VALUES (
      NEW.company_id,
      NEW.id,
      'PHONE',
      NOW() + INTERVAL '7 days',
      'Phone follow-up on quote',
      'Call customer to discuss quote and answer any questions',
      TRUE,
      7,
      2
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. CREATE TRIGGERS
-- =====================================================

-- Trigger for quote analytics creation
DROP TRIGGER IF EXISTS trigger_create_quote_analytics ON public.work_orders;
CREATE TRIGGER trigger_create_quote_analytics
  AFTER UPDATE ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION create_quote_analytics_on_send();

-- Trigger for quote analytics updates
DROP TRIGGER IF EXISTS trigger_update_quote_analytics ON public.work_orders;
CREATE TRIGGER trigger_update_quote_analytics
  AFTER UPDATE ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_analytics_on_status_change();

-- Trigger for approval workflow creation
DROP TRIGGER IF EXISTS trigger_create_approval_workflow ON public.work_orders;
CREATE TRIGGER trigger_create_approval_workflow
  AFTER UPDATE ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION create_default_approval_workflow();

-- Trigger for follow-up scheduling
DROP TRIGGER IF EXISTS trigger_schedule_follow_ups ON public.work_orders;
CREATE TRIGGER trigger_schedule_follow_ups
  AFTER UPDATE ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION schedule_quote_follow_ups();

-- =====================================================
-- 9. HELPER FUNCTIONS FOR QUOTE MANAGEMENT
-- =====================================================

-- Function to get quote conversion metrics
CREATE OR REPLACE FUNCTION get_quote_conversion_metrics(p_company_id UUID, p_date_from DATE DEFAULT NULL, p_date_to DATE DEFAULT NULL)
RETURNS TABLE (
  total_quotes INTEGER,
  sent_quotes INTEGER,
  viewed_quotes INTEGER,
  accepted_quotes INTEGER,
  rejected_quotes INTEGER,
  conversion_rate DECIMAL(5,2),
  average_time_to_decision_hours DECIMAL(10,2),
  average_quote_value DECIMAL(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_quotes,
    COUNT(CASE WHEN qa.conversion_stage != 'DRAFT' THEN 1 END)::INTEGER as sent_quotes,
    COUNT(CASE WHEN qa.first_viewed_date IS NOT NULL THEN 1 END)::INTEGER as viewed_quotes,
    COUNT(CASE WHEN qa.conversion_stage = 'ACCEPTED' THEN 1 END)::INTEGER as accepted_quotes,
    COUNT(CASE WHEN qa.conversion_stage = 'REJECTED' THEN 1 END)::INTEGER as rejected_quotes,
    CASE
      WHEN COUNT(CASE WHEN qa.conversion_stage != 'DRAFT' THEN 1 END) > 0
      THEN (COUNT(CASE WHEN qa.conversion_stage = 'ACCEPTED' THEN 1 END)::DECIMAL / COUNT(CASE WHEN qa.conversion_stage != 'DRAFT' THEN 1 END) * 100)
      ELSE 0
    END as conversion_rate,
    AVG(qa.time_to_decision_hours) as average_time_to_decision_hours,
    AVG(qa.quote_value) as average_quote_value
  FROM public.quote_analytics qa
  WHERE qa.company_id = p_company_id
    AND (p_date_from IS NULL OR qa.quote_sent_date >= p_date_from)
    AND (p_date_to IS NULL OR qa.quote_sent_date <= p_date_to);
END;
$$ LANGUAGE plpgsql;

-- Function to get pending follow-ups
CREATE OR REPLACE FUNCTION get_pending_follow_ups(p_company_id UUID, p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  follow_up_id UUID,
  work_order_id UUID,
  quote_number TEXT,
  customer_name TEXT,
  follow_up_type TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  days_overdue INTEGER,
  attempt_number INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    qf.id as follow_up_id,
    qf.work_order_id,
    wo.quote_number,
    c.name as customer_name,
    qf.follow_up_type,
    qf.scheduled_date,
    CASE
      WHEN qf.scheduled_date < NOW() THEN EXTRACT(DAY FROM NOW() - qf.scheduled_date)::INTEGER
      ELSE 0
    END as days_overdue,
    qf.attempt_number
  FROM public.quote_follow_ups qf
  JOIN public.work_orders wo ON qf.work_order_id = wo.id
  JOIN public.customers c ON wo.customer_id = c.id
  WHERE qf.company_id = p_company_id
    AND qf.status = 'SCHEDULED'
    AND (p_user_id IS NULL OR qf.assigned_user_id = p_user_id)
  ORDER BY qf.scheduled_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to mark follow-up as completed
CREATE OR REPLACE FUNCTION complete_follow_up(
  p_follow_up_id UUID,
  p_outcome TEXT,
  p_customer_response TEXT DEFAULT NULL,
  p_schedule_next BOOLEAN DEFAULT FALSE
) RETURNS BOOLEAN AS $$
DECLARE
  v_work_order_id UUID;
  v_company_id UUID;
  v_attempt_number INTEGER;
BEGIN
  -- Update the follow-up
  UPDATE public.quote_follow_ups
  SET
    status = 'COMPLETED',
    completed_date = NOW(),
    outcome = p_outcome,
    customer_response = p_customer_response,
    updated_at = NOW()
  WHERE id = p_follow_up_id
  RETURNING work_order_id, company_id, attempt_number
  INTO v_work_order_id, v_company_id, v_attempt_number;

  -- Schedule next follow-up if requested and not final attempt
  IF p_schedule_next AND v_attempt_number < 3 AND p_outcome NOT IN ('ACCEPTED', 'REJECTED') THEN
    INSERT INTO public.quote_follow_ups (
      company_id,
      work_order_id,
      follow_up_type,
      scheduled_date,
      subject,
      message,
      is_automated,
      attempt_number
    ) VALUES (
      v_company_id,
      v_work_order_id,
      CASE WHEN v_attempt_number = 1 THEN 'PHONE' ELSE 'EMAIL' END,
      NOW() + INTERVAL '5 days',
      'Additional follow-up on your quote',
      'Following up again on your quote. Please let us know if you have any questions.',
      TRUE,
      v_attempt_number + 1
    );
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
