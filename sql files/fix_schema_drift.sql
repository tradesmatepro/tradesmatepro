-- ============================================================================
-- SCHEMA DRIFT FIX: Add Missing Columns to Match App Expectations
-- ============================================================================
-- Generated: 2025-10-12
-- Purpose: Fix schema drift between app code and actual database
-- 
-- Issues Found:
-- 1. companies table missing license and scheduling columns
-- 2. rate_cards table missing sort_order column
-- 3. invoice_items table doesn't exist
-- ============================================================================

-- ============================================================================
-- FIX 1: COMPANIES TABLE - Add License Column
-- ============================================================================

-- Option A: Add licenses as JSONB array (industry standard for multiple licenses)
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS licenses JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN companies.licenses IS 'Array of license objects: [{number, state, expiry_date, status}]';

-- Option B: Add license_number as TEXT (simple single license)
-- ALTER TABLE companies 
-- ADD COLUMN IF NOT EXISTS license_number TEXT;

-- ============================================================================
-- FIX 2: COMPANIES TABLE - Add Scheduling Columns
-- ============================================================================

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS job_buffer_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS default_buffer_before_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS default_buffer_after_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS enable_customer_self_scheduling BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_approve_customer_selections BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS business_hours_start TIME DEFAULT '07:30',
ADD COLUMN IF NOT EXISTS business_hours_end TIME DEFAULT '17:00',
ADD COLUMN IF NOT EXISTS working_days JSONB DEFAULT '[1,2,3,4,5]'::jsonb,
ADD COLUMN IF NOT EXISTS min_advance_booking_hours INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_advance_booking_days INTEGER DEFAULT 30;

COMMENT ON COLUMN companies.job_buffer_minutes IS 'Legacy buffer setting (use default_buffer_before/after instead)';
COMMENT ON COLUMN companies.default_buffer_before_minutes IS 'Buffer time before appointments (minutes)';
COMMENT ON COLUMN companies.default_buffer_after_minutes IS 'Buffer time after appointments (minutes)';
COMMENT ON COLUMN companies.business_hours_start IS 'Business hours start time (HH:MM format)';
COMMENT ON COLUMN companies.business_hours_end IS 'Business hours end time (HH:MM format)';
COMMENT ON COLUMN companies.working_days IS 'Array of working days (0=Sunday, 1=Monday, etc)';

-- ============================================================================
-- FIX 3: RATE_CARDS TABLE - Add Missing Columns
-- ============================================================================

-- Add all missing columns that the app expects
ALTER TABLE rate_cards
ADD COLUMN IF NOT EXISTS service_name TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'OTHER',
ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'FLAT_FEE',
ADD COLUMN IF NOT EXISTS rate NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_quantity INTEGER,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

COMMENT ON COLUMN rate_cards.service_name IS 'Name of the service (e.g., "General Labor", "HVAC Repair")';
COMMENT ON COLUMN rate_cards.description IS 'Detailed description of the service';
COMMENT ON COLUMN rate_cards.category IS 'Service category (HVAC, PLUMBING, ELECTRICAL, OTHER)';
COMMENT ON COLUMN rate_cards.unit_type IS 'Pricing unit (HOUR, FLAT_FEE, UNIT, etc.)';
COMMENT ON COLUMN rate_cards.rate IS 'Price per unit';
COMMENT ON COLUMN rate_cards.sort_order IS 'Display order for rate cards (lower = higher priority)';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rate_cards_company_category ON rate_cards(company_id, category);
CREATE INDEX IF NOT EXISTS idx_rate_cards_sort_order ON rate_cards(company_id, category, sort_order);
CREATE INDEX IF NOT EXISTS idx_rate_cards_active ON rate_cards(company_id, is_active);

-- ============================================================================
-- FIX 4: INVOICE_ITEMS TABLE - Create if Missing
-- ============================================================================

-- Check if invoice_items table exists, if not create it
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Line Item Details
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    
    -- Item Type
    line_type TEXT NOT NULL DEFAULT 'service' CHECK (line_type IN ('labor', 'material', 'equipment', 'service', 'fee', 'discount', 'tax')),
    
    -- Tax
    taxable BOOLEAN DEFAULT true,
    tax_rate NUMERIC(5,2) DEFAULT 0,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    
    -- Sorting
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_sort_order ON invoice_items(invoice_id, sort_order);

COMMENT ON TABLE invoice_items IS 'Line items for invoices';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify the fixes worked:

-- Check companies table columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'companies'
AND column_name IN ('licenses', 'license_number', 'job_buffer_minutes', 'business_hours_start', 'working_days')
ORDER BY column_name;

-- Check rate_cards table columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'rate_cards'
AND column_name IN ('service_name', 'description', 'category', 'unit_type', 'rate', 'sort_order', 'is_active')
ORDER BY column_name;

-- Check invoice_items table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'invoice_items';

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- Uncomment to rollback changes:

-- ALTER TABLE companies DROP COLUMN IF EXISTS licenses;
-- ALTER TABLE companies DROP COLUMN IF EXISTS job_buffer_minutes;
-- ALTER TABLE companies DROP COLUMN IF EXISTS default_buffer_before_minutes;
-- ALTER TABLE companies DROP COLUMN IF EXISTS default_buffer_after_minutes;
-- ALTER TABLE companies DROP COLUMN IF EXISTS enable_customer_self_scheduling;
-- ALTER TABLE companies DROP COLUMN IF EXISTS auto_approve_customer_selections;
-- ALTER TABLE companies DROP COLUMN IF EXISTS business_hours_start;
-- ALTER TABLE companies DROP COLUMN IF EXISTS business_hours_end;
-- ALTER TABLE companies DROP COLUMN IF EXISTS working_days;
-- ALTER TABLE companies DROP COLUMN IF EXISTS min_advance_booking_hours;
-- ALTER TABLE companies DROP COLUMN IF EXISTS max_advance_booking_days;
-- ALTER TABLE rate_cards DROP COLUMN IF EXISTS sort_order;
-- DROP TABLE IF EXISTS invoice_items;

-- ============================================================================
-- NOTES
-- ============================================================================

-- After running this migration:
-- 1. Rebuild the app (Ctrl+C, npm start)
-- 2. Test Company Profile Settings (should save without errors)
-- 3. Test Smart Scheduling Settings (should load/save without errors)
-- 4. Test Rate Cards (should sort properly)
-- 5. Test Invoices (should create line items)

-- Schema drift prevention:
-- - Always run schema migrations before deploying code changes
-- - Use this audit tool regularly: node devtools/fullSchemaAudit.js
-- - Keep schema files in sync with actual database
-- - Document all schema changes in migration files

