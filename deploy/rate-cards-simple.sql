-- Simple Rate Cards Schema Deployment
-- Step 1: Create enums

-- Create unit_type_enum if it doesn't exist
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
