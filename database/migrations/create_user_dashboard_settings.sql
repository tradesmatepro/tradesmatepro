-- ========================================
-- CREATE USER_DASHBOARD_SETTINGS TABLE
-- ========================================
-- This table stores user-specific dashboard customization settings

CREATE TABLE IF NOT EXISTS public.user_dashboard_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Dashboard widget visibility and order
  widgets JSONB DEFAULT '{
    "revenue": {"visible": true, "order": 1},
    "jobs": {"visible": true, "order": 2},
    "quotes": {"visible": true, "order": 3},
    "customers": {"visible": true, "order": 4},
    "completion_rate": {"visible": true, "order": 5},
    "avg_job_value": {"visible": true, "order": 6},
    "team_utilization": {"visible": true, "order": 7},
    "recent_activity": {"visible": true, "order": 8}
  }'::jsonb,
  
  -- Date range preferences
  default_date_range TEXT DEFAULT 'this_month' CHECK (default_date_range IN ('today', 'this_week', 'this_month', 'this_quarter', 'this_year', 'custom')),
  custom_start_date DATE,
  custom_end_date DATE,
  
  -- Chart preferences
  chart_type TEXT DEFAULT 'bar' CHECK (chart_type IN ('bar', 'line', 'pie', 'area')),
  show_comparisons BOOLEAN DEFAULT true,
  
  -- Notification preferences for dashboard
  show_alerts BOOLEAN DEFAULT true,
  alert_types JSONB DEFAULT '["overdue_jobs", "pending_quotes", "unpaid_invoices"]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_dashboard_settings_user ON public.user_dashboard_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_settings_company ON public.user_dashboard_settings(company_id);

-- RLS Policies
ALTER TABLE public.user_dashboard_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own settings
CREATE POLICY "Users can view own dashboard settings"
  ON public.user_dashboard_settings
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can create their own settings
CREATE POLICY "Users can create own dashboard settings"
  ON public.user_dashboard_settings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own settings
CREATE POLICY "Users can update own dashboard settings"
  ON public.user_dashboard_settings
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can delete their own settings
CREATE POLICY "Users can delete own dashboard settings"
  ON public.user_dashboard_settings
  FOR DELETE
  USING (user_id = auth.uid());

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_dashboard_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_dashboard_settings_updated_at
  BEFORE UPDATE ON public.user_dashboard_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_dashboard_settings_updated_at();

-- Function to create default settings for new users
CREATE OR REPLACE FUNCTION create_default_dashboard_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_dashboard_settings (user_id, company_id)
  VALUES (NEW.id, NEW.company_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create dashboard settings for new users
CREATE TRIGGER trigger_create_default_dashboard_settings
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_dashboard_settings();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_dashboard_settings TO authenticated;

COMMENT ON TABLE public.user_dashboard_settings IS 'Stores user-specific dashboard customization settings';

