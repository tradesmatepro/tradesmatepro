-- TradeMate Pro: Add Feature Flags Table
-- Stores per-company feature flag settings for modular deployment
-- Safe, idempotent migration

BEGIN;

-- Create feature_flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  flags JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_company_id ON public.feature_flags(company_id);

-- Add RLS policies
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see feature flags for their company
CREATE POLICY feature_flags_company_isolation ON public.feature_flags
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.users 
    WHERE auth_user_id = auth.uid()
  ));

-- Policy: Only admins can update feature flags
CREATE POLICY feature_flags_admin_update ON public.feature_flags
  FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM public.users 
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  ));

-- Add comment
COMMENT ON TABLE public.feature_flags IS 'Stores per-company feature flag settings for modular deployment and beta/enterprise feature control';
COMMENT ON COLUMN public.feature_flags.flags IS 'JSONB object with module IDs as keys and boolean values (e.g., {"marketplace": false, "payroll": true})';

COMMIT;

