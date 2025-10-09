-- Industry Standard Rate Cards / Price Book System
-- This creates the proper pricing structure used by ServiceTitan, Jobber, etc.

-- Create enum for unit types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'unit_type_enum') THEN
        CREATE TYPE unit_type_enum AS ENUM (
            'HOUR',           -- Hourly rate (e.g., $75/hour)
            'FLAT_FEE',       -- Fixed price (e.g., $150 for service call)
            'SQFT',           -- Per square foot (e.g., $5/sqft)
            'LINEAR_FOOT',    -- Per linear foot (e.g., $12/ft for pipe)
            'UNIT',           -- Per unit/item (e.g., $25 per outlet)
            'CUBIC_YARD',     -- Per cubic yard (landscaping)
            'GALLON'          -- Per gallon (chemicals, etc.)
        );
        RAISE NOTICE 'Created unit_type_enum';
    ELSE
        RAISE NOTICE 'unit_type_enum already exists';
    END IF;
END $$;

-- Create enum for service categories
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_category_enum') THEN
        CREATE TYPE service_category_enum AS ENUM (
            'HVAC',
            'PLUMBING', 
            'ELECTRICAL',
            'GENERAL_REPAIR',
            'APPLIANCE_REPAIR',
            'LANDSCAPING',
            'CLEANING',
            'PEST_CONTROL',
            'ROOFING',
            'FLOORING',
            'PAINTING',
            'CARPENTRY',
            'OTHER'
        );
        RAISE NOTICE 'Created service_category_enum';
    ELSE
        RAISE NOTICE 'service_category_enum already exists';
    END IF;
END $$;

-- Rate Cards / Price Book Table (Industry Standard)
CREATE TABLE IF NOT EXISTS rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Service Details
    service_name TEXT NOT NULL,
    description TEXT,
    category service_category_enum NOT NULL DEFAULT 'OTHER',
    
    -- Pricing Structure
    unit_type unit_type_enum NOT NULL DEFAULT 'FLAT_FEE',
    rate NUMERIC(10,2) NOT NULL CHECK (rate >= 0),
    
    -- Optional: Tiered pricing support
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER,
    
    -- Business Logic
    active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false, -- Default service for category
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    UNIQUE(company_id, service_name),
    CHECK (min_quantity <= max_quantity OR max_quantity IS NULL)
);

-- Add missing columns to company_settings for fallback rates
DO $$
BEGIN
    -- Add labor_rate column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'labor_rate') THEN
        ALTER TABLE company_settings ADD COLUMN labor_rate NUMERIC(10,2) DEFAULT 75.00;
        RAISE NOTICE 'Added labor_rate column to company_settings';
    END IF;
    
    -- Add overtime_multiplier column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'overtime_multiplier') THEN
        ALTER TABLE company_settings ADD COLUMN overtime_multiplier NUMERIC(3,2) DEFAULT 1.5;
        RAISE NOTICE 'Added overtime_multiplier column to company_settings';
    END IF;
    
    -- Add parts_markup column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'parts_markup') THEN
        ALTER TABLE company_settings ADD COLUMN parts_markup NUMERIC(5,2) DEFAULT 25.00;
        RAISE NOTICE 'Added parts_markup column to company_settings';
    END IF;
    
    -- Add invoice_terms column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'invoice_terms') THEN
        ALTER TABLE company_settings ADD COLUMN invoice_terms TEXT DEFAULT 'Net 30';
        RAISE NOTICE 'Added invoice_terms column to company_settings';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rate_cards_company_id ON rate_cards(company_id);
CREATE INDEX IF NOT EXISTS idx_rate_cards_category ON rate_cards(category);
CREATE INDEX IF NOT EXISTS idx_rate_cards_active ON rate_cards(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_rate_cards_company_active ON rate_cards(company_id, active) WHERE active = true;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_rate_cards_updated_at ON rate_cards;
CREATE TRIGGER update_rate_cards_updated_at
    BEFORE UPDATE ON rate_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Future-proof default rate cards (structure only, zero prices)
CREATE OR REPLACE FUNCTION create_default_rate_cards(
    p_company_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_industry TEXT;
BEGIN
    -- Look up the company's industry
    SELECT industry INTO v_industry
    FROM companies
    WHERE id = p_company_id;

    -- Only seed if company has no rate cards
    IF NOT EXISTS (SELECT 1 FROM rate_cards WHERE company_id = p_company_id) THEN

        -- Universal defaults (always added, 0.00 placeholder)
        INSERT INTO rate_cards (company_id, service_name, description, category, unit_type, rate, is_default, sort_order)
        VALUES
        (p_company_id, 'General Labor', 'Standard labor rate', 'OTHER', 'HOUR', 0.00, true, 1),
        (p_company_id, 'Service Call', 'Basic service call / dispatch', 'OTHER', 'FLAT_FEE', 0.00, false, 2),
        (p_company_id, 'Emergency Service', 'After-hours / urgent response', 'OTHER', 'HOUR', 0.00, false, 3),
        (p_company_id, 'Parts & Materials', 'Parts and consumables', 'OTHER', 'UNIT', 0.00, false, 4);

        -- Optional trade-specific placeholders
        IF v_industry = 'HVAC' THEN
            INSERT INTO rate_cards (company_id, service_name, description, category, unit_type, rate, is_default, sort_order)
            VALUES
            (p_company_id, 'HVAC Repair', 'General HVAC repair work', 'HVAC', 'HOUR', 0.00, false, 10),
            (p_company_id, 'System Tune-up', 'Annual maintenance and tune-up', 'HVAC', 'FLAT_FEE', 0.00, false, 11);

        ELSIF v_industry = 'PLUMBING' THEN
            INSERT INTO rate_cards (company_id, service_name, description, category, unit_type, rate, is_default, sort_order)
            VALUES
            (p_company_id, 'Plumbing Repair', 'General plumbing repair work', 'PLUMBING', 'HOUR', 0.00, false, 10),
            (p_company_id, 'Drain Cleaning', 'Standard drain cleaning service', 'PLUMBING', 'FLAT_FEE', 0.00, false, 11);

        ELSIF v_industry = 'ELECTRICAL' THEN
            INSERT INTO rate_cards (company_id, service_name, description, category, unit_type, rate, is_default, sort_order)
            VALUES
            (p_company_id, 'Electrical Repair', 'General electrical repair work', 'ELECTRICAL', 'HOUR', 0.00, false, 10),
            (p_company_id, 'Outlet Installation', 'Install new electrical outlet', 'ELECTRICAL', 'UNIT', 0.00, false, 11);

        END IF;

        RAISE NOTICE 'Created default rate card structure for company %', p_company_id;
    ELSE
        RAISE NOTICE 'Rate cards already exist for company %, skipping defaults', p_company_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (if RLS is enabled later)
-- ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY rate_cards_company_policy ON rate_cards FOR ALL USING (company_id = auth.jwt() ->> 'company_id'::text);

RAISE NOTICE 'Rate cards schema deployment completed successfully';
