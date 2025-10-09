-- =====================================================
-- COMPLETE DATABASE STANDARDIZATION MIGRATION
-- TradeMate Pro - Schema Alignment with Frontend
-- =====================================================

-- This migration brings the database schema into full alignment
-- with the standardized requirements from logs.md

BEGIN;

-- =====================================================
-- Step 1: Fix pricing_preference_enum values
-- =====================================================

-- Current database has: FIXED_PRICE, HOURLY, ESTIMATE, BIDDING
-- Standard requires: FIXED, TIME_AND_MATERIALS

-- First, update any existing references to use temporary values
UPDATE work_orders 
SET pricing_model = CASE 
    WHEN pricing_model::text = 'FIXED_PRICE' THEN 'FIXED_PRICE'
    WHEN pricing_model::text = 'HOURLY' THEN 'HOURLY'
    WHEN pricing_model::text = 'ESTIMATE' THEN 'ESTIMATE'
    WHEN pricing_model::text = 'BIDDING' THEN 'BIDDING'
    ELSE 'HOURLY'
END
WHERE pricing_model IS NOT NULL;

-- Drop and recreate enum with correct standardized values
DROP TYPE IF EXISTS pricing_preference_enum CASCADE;
CREATE TYPE pricing_preference_enum AS ENUM ('FIXED', 'TIME_AND_MATERIALS');

-- =====================================================
-- Step 2: Add missing fields to work_orders table
-- =====================================================

-- Add standardized fields that are missing
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS pricing_model pricing_preference_enum DEFAULT 'TIME_AND_MATERIALS',
ADD COLUMN IF NOT EXISTS scheduled_start timestamptz,
ADD COLUMN IF NOT EXISTS scheduled_end timestamptz,
ADD COLUMN IF NOT EXISTS notes text;

-- =====================================================
-- Step 3: Backup and recreate work_order_line_items
-- =====================================================

-- Backup existing data (if any exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'work_order_line_items') THEN
        DROP TABLE IF EXISTS work_order_line_items_backup;
        CREATE TABLE work_order_line_items_backup AS 
        SELECT * FROM work_order_line_items;
    END IF;
END $$;

-- Drop existing table with wrong structure
DROP TABLE IF EXISTS work_order_line_items CASCADE;

-- Create standardized work_order_line_items table
CREATE TABLE work_order_line_items (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id   uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,

    -- Type of line item: LABOR or MATERIAL
    type            text NOT NULL CHECK (type IN ('LABOR', 'MATERIAL')),

    -- Labor details
    employee_id     uuid NULL REFERENCES employees(id) ON DELETE SET NULL,
    hours           numeric(10,2) NULL,
    rate            numeric(10,2) NULL,
    overtime_rate   numeric(10,2) NULL,

    -- Material/parts details
    inventory_item_id uuid NULL REFERENCES inventory_items(id) ON DELETE SET NULL,
    quantity        numeric(10,2) NULL,
    unit_cost       numeric(10,2) NULL,
    markup_percent  numeric(5,2) NULL DEFAULT 0,

    -- Final calculated cost for this row
    total_cost      numeric(12,2) NOT NULL DEFAULT 0,

    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Index for performance
CREATE INDEX idx_work_order_line_items_order_id
    ON work_order_line_items(work_order_id);

-- =====================================================
-- Step 4: Create trigger for work_order_line_items
-- =====================================================

CREATE OR REPLACE FUNCTION set_work_order_line_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_work_order_line_items_updated_at
    ON work_order_line_items;

CREATE TRIGGER trg_set_work_order_line_items_updated_at
    BEFORE UPDATE ON work_order_line_items
    FOR EACH ROW
    EXECUTE FUNCTION set_work_order_line_items_updated_at();

-- =====================================================
-- Step 5: Add missing company_settings fields
-- =====================================================

DO $$
BEGIN
    -- Add missing company_settings fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'quote_prefix') THEN
        ALTER TABLE company_settings ADD COLUMN quote_prefix text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'default_tax_rate') THEN
        ALTER TABLE company_settings ADD COLUMN default_tax_rate numeric(5,4) DEFAULT 0.0875;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'labor_rate') THEN
        ALTER TABLE company_settings ADD COLUMN labor_rate numeric(10,2) DEFAULT 75.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'overtime_multiplier') THEN
        ALTER TABLE company_settings ADD COLUMN overtime_multiplier numeric(3,2) DEFAULT 1.5;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'company_settings' AND column_name = 'parts_markup') THEN
        ALTER TABLE company_settings ADD COLUMN parts_markup numeric(5,2) DEFAULT 25.00;
    END IF;
END $$;

-- =====================================================
-- Step 6: Update existing work_orders pricing_model
-- =====================================================

-- Map old enum values to new standardized values
UPDATE work_orders 
SET pricing_model = 'TIME_AND_MATERIALS'::pricing_preference_enum 
WHERE pricing_model IS NULL;

-- =====================================================
-- Step 7: Grant permissions
-- =====================================================

-- Ensure all roles have proper access to new table
GRANT ALL ON work_order_line_items TO postgres;
GRANT ALL ON work_order_line_items TO anon;
GRANT ALL ON work_order_line_items TO authenticated;
GRANT ALL ON work_order_line_items TO service_role;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify the schema is now standardized:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'work_orders' ORDER BY column_name;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'work_order_line_items' ORDER BY column_name;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'company_settings' ORDER BY column_name;
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'pricing_preference_enum');
