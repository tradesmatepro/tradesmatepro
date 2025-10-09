-- =====================================================
-- MINIMAL SCHEMA ALIGNMENT - ONLY MISSING FIELDS
-- Based on actual database inspection via tools
-- =====================================================

-- FACTS FROM ACTUAL DATABASE INSPECTION:
-- ✅ pricing_preference_enum EXISTS with CORRECT values: FIXED_PRICE, HOURLY, ESTIMATE, BIDDING
-- ✅ work_order_status_enum EXISTS with CORRECT values: QUOTE, SENT, ACCEPTED, etc.
-- ✅ work_order_line_items table EXISTS with COMPLETE structure (type, employee_id, hours, etc.)
-- ❌ work_orders table MISSING: pricing_model, scheduled_start, scheduled_end, notes fields

-- This adds ONLY the missing fields without breaking existing schema

BEGIN;

-- =====================================================
-- Step 1: SKIP enum changes - they're already correct!
-- =====================================================

-- The database already has the correct enum values:
-- pricing_preference_enum = FIXED_PRICE, HOURLY, ESTIMATE, BIDDING (✅ CORRECT)
-- work_order_status_enum = QUOTE, SENT, ACCEPTED, REJECTED, etc. (✅ CORRECT)

-- GPT was WRONG about changing these to FIXED, TIME_AND_MATERIALS

-- =====================================================
-- Step 2: Add missing fields to work_orders table
-- =====================================================

-- Add only the fields that are actually missing
DO $$
BEGIN
    -- Add pricing_model field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'work_orders' AND column_name = 'pricing_model') THEN
        ALTER TABLE work_orders ADD COLUMN pricing_model pricing_preference_enum DEFAULT 'HOURLY';
    END IF;

    -- Add scheduled_start field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'work_orders' AND column_name = 'scheduled_start') THEN
        ALTER TABLE work_orders ADD COLUMN scheduled_start timestamptz;
    END IF;

    -- Add scheduled_end field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'work_orders' AND column_name = 'scheduled_end') THEN
        ALTER TABLE work_orders ADD COLUMN scheduled_end timestamptz;
    END IF;

    -- Add notes field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'work_orders' AND column_name = 'notes') THEN
        ALTER TABLE work_orders ADD COLUMN notes text;
    END IF;
END $$;

-- =====================================================
-- Step 3: SKIP work_order_line_items - already complete!
-- =====================================================

-- The work_order_line_items table already has the COMPLETE structure:
-- ✅ id, work_order_id, type, employee_id, hours, rate, overtime_rate
-- ✅ inventory_item_id, quantity, unit_cost, markup_percent, total_cost
-- ✅ created_at, updated_at
-- ✅ CHECK constraint: type IN ('LABOR', 'MATERIAL')

-- NO CHANGES NEEDED - table is already standardized!

-- =====================================================
-- Step 4: Add missing company_settings fields
-- =====================================================

-- Check if company_settings table exists and add missing pricing fields
DO $$
BEGIN
    -- Only proceed if company_settings table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_settings') THEN
        
        -- Add quote_prefix if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'company_settings' AND column_name = 'quote_prefix') THEN
            ALTER TABLE company_settings ADD COLUMN quote_prefix text DEFAULT 'Q';
        END IF;
        
        -- Add default_tax_rate if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'company_settings' AND column_name = 'default_tax_rate') THEN
            ALTER TABLE company_settings ADD COLUMN default_tax_rate numeric(5,4) DEFAULT 0.0875;
        END IF;
        
        -- Add labor_rate if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'company_settings' AND column_name = 'labor_rate') THEN
            ALTER TABLE company_settings ADD COLUMN labor_rate numeric(10,2) DEFAULT 75.00;
        END IF;
        
        -- Add overtime_multiplier if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'company_settings' AND column_name = 'overtime_multiplier') THEN
            ALTER TABLE company_settings ADD COLUMN overtime_multiplier numeric(3,2) DEFAULT 1.5;
        END IF;
        
        -- Add parts_markup if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'company_settings' AND column_name = 'parts_markup') THEN
            ALTER TABLE company_settings ADD COLUMN parts_markup numeric(5,2) DEFAULT 25.00;
        END IF;
        
    END IF;
END $$;

-- =====================================================
-- Step 5: Set defaults for new pricing_model field
-- =====================================================

-- Set default values for existing work_orders
DO $$
BEGIN
    -- Only update if the pricing_model column was just added
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'work_orders' AND column_name = 'pricing_model') THEN

        -- Set default for existing NULL records
        UPDATE work_orders
        SET pricing_model = 'HOURLY'::pricing_preference_enum
        WHERE pricing_model IS NULL;

    END IF;
END $$;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify the minimal changes were applied:
-- SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name IN ('pricing_model', 'scheduled_start', 'scheduled_end', 'notes') ORDER BY column_name;
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'pricing_preference_enum') ORDER BY enumlabel;
