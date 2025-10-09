-- Fix missing pricing columns in company_settings table
-- This adds the columns needed for the pricing setup step

DO $$
BEGIN
    -- Add labor_rate column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'labor_rate') THEN
        ALTER TABLE company_settings ADD COLUMN labor_rate NUMERIC(10,2) DEFAULT 75.00;
        RAISE NOTICE 'Added labor_rate column';
    ELSE
        RAISE NOTICE 'labor_rate column already exists';
    END IF;
    
    -- Add overtime_multiplier column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'overtime_multiplier') THEN
        ALTER TABLE company_settings ADD COLUMN overtime_multiplier NUMERIC(3,2) DEFAULT 1.5;
        RAISE NOTICE 'Added overtime_multiplier column';
    ELSE
        RAISE NOTICE 'overtime_multiplier column already exists';
    END IF;
    
    -- Add parts_markup column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'parts_markup') THEN
        ALTER TABLE company_settings ADD COLUMN parts_markup NUMERIC(5,2) DEFAULT 25.00;
        RAISE NOTICE 'Added parts_markup column';
    ELSE
        RAISE NOTICE 'parts_markup column already exists';
    END IF;
    
    -- Add invoice_terms column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'invoice_terms') THEN
        ALTER TABLE company_settings ADD COLUMN invoice_terms TEXT DEFAULT 'Net 30';
        RAISE NOTICE 'Added invoice_terms column';
    ELSE
        RAISE NOTICE 'invoice_terms column already exists';
    END IF;
    
    -- Update default_tax_rate to proper precision if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'company_settings' 
               AND column_name = 'default_tax_rate' 
               AND numeric_precision = 5 
               AND numeric_scale = 4) THEN
        -- Already correct precision
        RAISE NOTICE 'default_tax_rate has correct precision';
    ELSE
        -- Update to proper precision for percentage values
        ALTER TABLE company_settings ALTER COLUMN default_tax_rate TYPE NUMERIC(5,2);
        RAISE NOTICE 'Updated default_tax_rate precision';
    END IF;
    
END $$;

-- Verify the columns exist
SELECT 
    column_name,
    data_type,
    numeric_precision,
    numeric_scale,
    column_default
FROM information_schema.columns 
WHERE table_name = 'company_settings' 
AND column_name IN ('labor_rate', 'overtime_multiplier', 'parts_markup', 'default_tax_rate', 'invoice_terms')
ORDER BY column_name;
