-- Migration: Add module_permissions column to companies table
-- Purpose: Allow company owners to control which modules their employees can access
-- This is SEPARATE from beta filter (which hides "Coming Soon" features from non-APP_OWNERs)

BEGIN;

-- Add module_permissions column to companies table
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS module_permissions JSONB DEFAULT '{}'::jsonb;

-- Add comment explaining the column
COMMENT ON COLUMN public.companies.module_permissions IS 'Company-specific module access control. Owners can enable/disable modules for their employees. Example: {"quotes": true, "invoices": false, "reports": true}';

COMMIT;

