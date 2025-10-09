-- Schema Fix 1: Add default_tax_rate to rates_pricing_settings
ALTER TABLE rates_pricing_settings 
ADD COLUMN IF NOT EXISTS default_tax_rate NUMERIC DEFAULT 8.25;

-- Schema Fix 2: Update existing records to have the default tax rate
UPDATE rates_pricing_settings 
SET default_tax_rate = 8.25 
WHERE default_tax_rate IS NULL;

-- Schema Fix 3: Add comment for documentation
COMMENT ON COLUMN rates_pricing_settings.default_tax_rate IS 'Default tax rate percentage for quotes and invoices';

-- Schema Fix 4: Ensure all rates_pricing_settings columns are NOT NULL (they should have defaults)
ALTER TABLE rates_pricing_settings 
ALTER COLUMN default_tax_rate SET NOT NULL;
