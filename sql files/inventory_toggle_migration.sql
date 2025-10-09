-- Add inventory toggle to company_settings table
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS use_inventory BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN company_settings.use_inventory IS 'Enable/disable inventory management system for this company';

-- Set default to true for existing companies (they might already be using inventory)
UPDATE company_settings 
SET use_inventory = true 
WHERE use_inventory IS NULL;
