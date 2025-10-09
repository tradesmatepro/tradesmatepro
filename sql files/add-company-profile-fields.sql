-- =====================================================
-- Add Company Profile Fields Migration
-- =====================================================
-- This migration adds missing fields to the companies table for the upgraded Company Profile page

BEGIN;

-- Add missing fields to companies table
ALTER TABLE public.companies 
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#3B82F6',
  ADD COLUMN IF NOT EXISTS license_numbers JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS default_invoice_terms TEXT DEFAULT 'NET_30' CHECK (default_invoice_terms IN ('DUE_ON_RECEIPT', 'NET_15', 'NET_30', 'NET_60')),
  ADD COLUMN IF NOT EXISTS default_invoice_due_days INTEGER DEFAULT 30 CHECK (default_invoice_due_days >= 0),
  ADD COLUMN IF NOT EXISTS scheduling_buffer_minutes INTEGER DEFAULT 60 CHECK (scheduling_buffer_minutes >= 0),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing companies to have default values if they don't exist
UPDATE public.companies 
SET 
  theme_color = COALESCE(theme_color, '#3B82F6'),
  license_numbers = COALESCE(license_numbers, '[]'::jsonb),
  default_invoice_terms = COALESCE(default_invoice_terms, 'NET_30'),
  default_invoice_due_days = COALESCE(default_invoice_due_days, 30),
  scheduling_buffer_minutes = COALESCE(scheduling_buffer_minutes, 60),
  updated_at = NOW()
WHERE 
  theme_color IS NULL 
  OR license_numbers IS NULL 
  OR default_invoice_terms IS NULL 
  OR default_invoice_due_days IS NULL 
  OR scheduling_buffer_minutes IS NULL;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on companies table
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to document the new fields
COMMENT ON COLUMN public.companies.logo_url IS 'URL to company logo stored in Supabase storage';
COMMENT ON COLUMN public.companies.theme_color IS 'Primary theme color for company branding (hex value)';
COMMENT ON COLUMN public.companies.license_numbers IS 'Array of company license numbers stored as JSONB';
COMMENT ON COLUMN public.companies.default_invoice_terms IS 'Default payment terms for invoices';
COMMENT ON COLUMN public.companies.default_invoice_due_days IS 'Default number of days for invoice payment';
COMMENT ON COLUMN public.companies.scheduling_buffer_minutes IS 'Default buffer time in minutes for job scheduling';

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.companies TO authenticated;

-- Create RLS policies if they don't exist
DO $$
BEGIN
    -- Check if RLS is enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'companies' 
        AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Create policy for company access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'companies' 
        AND policyname = 'Users can view their own company'
    ) THEN
        CREATE POLICY "Users can view their own company" ON public.companies
            FOR SELECT USING (
                id IN (
                    SELECT company_id FROM public.users 
                    WHERE id = auth.uid()
                )
            );
    END IF;

    -- Create policy for company updates
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'companies' 
        AND policyname = 'Owners and admins can update company'
    ) THEN
        CREATE POLICY "Owners and admins can update company" ON public.companies
            FOR UPDATE USING (
                id IN (
                    SELECT company_id FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('owner', 'admin')
                )
            );
    END IF;
END $$;

COMMIT;

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to verify the migration worked correctly:

-- Check that all new columns exist
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'companies' 
-- AND column_name IN ('logo_url', 'theme_color', 'license_numbers', 'default_invoice_terms', 'default_invoice_due_days', 'scheduling_buffer_minutes');

-- Check sample data
-- SELECT id, name, theme_color, license_numbers, default_invoice_terms, default_invoice_due_days 
-- FROM public.companies 
-- LIMIT 5;
