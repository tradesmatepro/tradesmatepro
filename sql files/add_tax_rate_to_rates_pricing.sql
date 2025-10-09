-- Add default_tax_rate column to rates_pricing_settings table
-- This fixes the missing tax rate field in Rates & Pricing settings

ALTER TABLE rates_pricing_settings 
ADD COLUMN IF NOT EXISTS default_tax_rate NUMERIC DEFAULT 8.25;

-- Update any existing records to have the default tax rate
UPDATE rates_pricing_settings 
SET default_tax_rate = 8.25 
WHERE default_tax_rate IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN rates_pricing_settings.default_tax_rate IS 'Default tax rate percentage for quotes and invoices';
