-- ========================================
-- CUSTOMER COMMUNICATIONS TABLE
-- Industry Standard Schema (Better than ServiceTitan/Jobber/Housecall Pro)
-- ========================================
-- 
-- COMPETITOR PAIN POINTS ADDRESSED:
-- ❌ ServiceTitan: Communication log buried in menus, hard to find
-- ❌ Jobber: No quick call logging, requires too many clicks
-- ❌ Housecall Pro: Can't attach files to communications, no outcome tracking
-- ❌ All: No AI summary of customer interactions, no sentiment tracking
--
-- ✅ TradeMate Pro Solutions:
-- ✅ Quick "Log Call" button in customer profile
-- ✅ Outcome tracking (quote sent, appointment scheduled, etc.)
-- ✅ File attachments support
-- ✅ Duration tracking for calls/meetings
-- ✅ Sentiment tracking (positive, neutral, negative)
-- ✅ Follow-up reminders
-- ✅ Integration with work orders
-- ========================================

-- Drop existing table if it exists (clean slate)
DROP TABLE IF EXISTS public.customer_communications CASCADE;

-- Create customer_communications table
CREATE TABLE public.customer_communications (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
    work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
    
    -- Communication Type & Direction
    communication_type TEXT NOT NULL CHECK (communication_type IN (
        'call',           -- Phone call
        'email',          -- Email
        'text',           -- SMS/Text message
        'meeting',        -- In-person meeting
        'note',           -- Internal note
        'voicemail',      -- Voicemail left/received
        'video_call',     -- Video conference
        'chat'            -- Live chat
    )),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    
    -- Content
    subject TEXT,
    content TEXT NOT NULL,
    
    -- Outcome & Follow-up (COMPETITIVE ADVANTAGE)
    outcome TEXT,  -- "Quote sent", "Appointment scheduled", "Issue resolved", etc.
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_notes TEXT,
    
    -- Duration (for calls/meetings)
    duration_minutes INTEGER,
    
    -- Attachments (COMPETITIVE ADVANTAGE - Housecall Pro doesn't have this)
    attachments JSONB DEFAULT '[]'::jsonb,
    
    -- Status & Scheduling
    status TEXT DEFAULT 'completed' CHECK (status IN (
        'scheduled',      -- Future communication
        'completed',      -- Completed communication
        'failed',         -- Failed to connect
        'cancelled'       -- Cancelled communication
    )),
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,  -- For extensibility
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_customer_communications_company ON public.customer_communications(company_id);
CREATE INDEX idx_customer_communications_customer ON public.customer_communications(customer_id);
CREATE INDEX idx_customer_communications_created_by ON public.customer_communications(created_by);
CREATE INDEX idx_customer_communications_work_order ON public.customer_communications(work_order_id);
CREATE INDEX idx_customer_communications_type ON public.customer_communications(communication_type);
CREATE INDEX idx_customer_communications_created_at ON public.customer_communications(created_at DESC);
CREATE INDEX idx_customer_communications_follow_up ON public.customer_communications(follow_up_date) WHERE follow_up_required = true;
CREATE INDEX idx_customer_communications_sentiment ON public.customer_communications(sentiment) WHERE sentiment IS NOT NULL;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_customer_communications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_communications_updated_at
    BEFORE UPDATE ON public.customer_communications
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_communications_updated_at();

-- RLS Policies
ALTER TABLE public.customer_communications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view communications for their company
CREATE POLICY customer_communications_select_policy ON public.customer_communications
    FOR SELECT
    USING (company_id = current_setting('app.current_company_id', true)::uuid);

-- Policy: Users can insert communications for their company
CREATE POLICY customer_communications_insert_policy ON public.customer_communications
    FOR INSERT
    WITH CHECK (company_id = current_setting('app.current_company_id', true)::uuid);

-- Policy: Users can update communications for their company
CREATE POLICY customer_communications_update_policy ON public.customer_communications
    FOR UPDATE
    USING (company_id = current_setting('app.current_company_id', true)::uuid);

-- Policy: Users can delete communications for their company
CREATE POLICY customer_communications_delete_policy ON public.customer_communications
    FOR DELETE
    USING (company_id = current_setting('app.current_company_id', true)::uuid);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_communications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_communications TO anon;

-- ========================================
-- HELPER VIEWS & FUNCTIONS
-- ========================================

-- View: Recent communications with customer names
CREATE OR REPLACE VIEW public.customer_communications_with_details AS
SELECT
    cc.*,
    c.name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    u.first_name || ' ' || u.last_name as created_by_name,
    wo.title as work_order_title
FROM public.customer_communications cc
LEFT JOIN public.customers c ON cc.customer_id = c.id
LEFT JOIN public.users u ON cc.created_by = u.id
LEFT JOIN public.work_orders wo ON cc.work_order_id = wo.id;

-- Grant view permissions
GRANT SELECT ON public.customer_communications_with_details TO authenticated;
GRANT SELECT ON public.customer_communications_with_details TO anon;

-- Function: Get communication stats for a customer
CREATE OR REPLACE FUNCTION get_customer_communication_stats(p_customer_id UUID)
RETURNS TABLE (
    total_communications BIGINT,
    total_calls BIGINT,
    total_emails BIGINT,
    total_meetings BIGINT,
    last_contact_date TIMESTAMPTZ,
    avg_response_time_hours NUMERIC,
    positive_interactions BIGINT,
    negative_interactions BIGINT,
    pending_follow_ups BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_communications,
        COUNT(*) FILTER (WHERE communication_type = 'call')::BIGINT as total_calls,
        COUNT(*) FILTER (WHERE communication_type = 'email')::BIGINT as total_emails,
        COUNT(*) FILTER (WHERE communication_type = 'meeting')::BIGINT as total_meetings,
        MAX(completed_at) as last_contact_date,
        AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600)::NUMERIC as avg_response_time_hours,
        COUNT(*) FILTER (WHERE sentiment = 'positive')::BIGINT as positive_interactions,
        COUNT(*) FILTER (WHERE sentiment = 'negative')::BIGINT as negative_interactions,
        COUNT(*) FILTER (WHERE follow_up_required = true AND follow_up_date >= CURRENT_DATE)::BIGINT as pending_follow_ups
    FROM public.customer_communications
    WHERE customer_id = p_customer_id
      AND status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION get_customer_communication_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_communication_stats(UUID) TO anon;

-- ========================================
-- SAMPLE DATA (for testing)
-- ========================================
-- Uncomment to insert sample data:
-- INSERT INTO public.customer_communications (
--     company_id, customer_id, created_by, communication_type, direction,
--     subject, content, outcome, sentiment, status, completed_at
-- ) VALUES (
--     'your-company-id'::uuid,
--     'your-customer-id'::uuid,
--     'your-user-id'::uuid,
--     'call',
--     'outbound',
--     'Follow-up on quote',
--     'Called customer to discuss HVAC quote. Customer interested but wants to think about it.',
--     'Quote discussed, follow-up needed',
--     'positive',
--     'completed',
--     now()
-- );

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
-- Run this migration with:
-- psql -h your-host -U postgres -d your-database -f 012_customer_communications_industry_standard.sql
-- 
-- Or use Supabase SQL Editor:
-- 1. Copy this entire file
-- 2. Paste into Supabase SQL Editor
-- 3. Click "Run"
-- ========================================

