-- =====================================================
-- PTO SYSTEM OPTIMIZATION MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

BEGIN;

-- Step 1: Create PTO Categories Table
-- =====================================================
CREATE TABLE IF NOT EXISTS pto_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#10B981',
    requires_approval BOOLEAN DEFAULT true,
    advance_notice_days INTEGER DEFAULT 0,
    max_consecutive_days INTEGER DEFAULT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, code)
);

-- Step 2: Add missing columns to employee_time_off
-- =====================================================
DO $$ 
BEGIN
    -- Add category_code column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employee_time_off' AND column_name = 'category_code') THEN
        ALTER TABLE employee_time_off ADD COLUMN category_code TEXT;
    END IF;
    
    -- Add reason column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employee_time_off' AND column_name = 'reason') THEN
        ALTER TABLE employee_time_off ADD COLUMN reason TEXT;
    END IF;
    
    -- Add review_notes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employee_time_off' AND column_name = 'review_notes') THEN
        ALTER TABLE employee_time_off ADD COLUMN review_notes TEXT;
    END IF;
    
    -- Add reviewed_by column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employee_time_off' AND column_name = 'reviewed_by') THEN
        ALTER TABLE employee_time_off ADD COLUMN reviewed_by UUID REFERENCES users(id);
    END IF;
    
    -- Add reviewed_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employee_time_off' AND column_name = 'reviewed_at') THEN
        ALTER TABLE employee_time_off ADD COLUMN reviewed_at TIMESTAMPTZ;
    END IF;
END $$;

-- Step 3: Add missing columns to pto_ledger
-- =====================================================
DO $$ 
BEGIN
    -- Add category_code column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pto_ledger' AND column_name = 'category_code') THEN
        ALTER TABLE pto_ledger ADD COLUMN category_code TEXT;
    END IF;
    
    -- Add company_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pto_ledger' AND column_name = 'company_id') THEN
        ALTER TABLE pto_ledger ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;
END $$;

-- Step 4: Create default PTO categories for all companies
-- =====================================================
INSERT INTO pto_categories (company_id, code, name, color, requires_approval, advance_notice_days)
SELECT DISTINCT 
    c.id,
    'VAC',
    'Vacation',
    '#10B981',
    true,
    7
FROM companies c
WHERE NOT EXISTS (SELECT 1 FROM pto_categories pc WHERE pc.company_id = c.id AND pc.code = 'VAC')
ON CONFLICT (company_id, code) DO NOTHING;

INSERT INTO pto_categories (company_id, code, name, color, requires_approval, advance_notice_days)
SELECT DISTINCT 
    c.id,
    'SICK',
    'Sick Leave',
    '#EF4444',
    false,
    0
FROM companies c
WHERE NOT EXISTS (SELECT 1 FROM pto_categories pc WHERE pc.company_id = c.id AND pc.code = 'SICK')
ON CONFLICT (company_id, code) DO NOTHING;

INSERT INTO pto_categories (company_id, code, name, color, requires_approval, advance_notice_days)
SELECT DISTINCT 
    c.id,
    'PERS',
    'Personal',
    '#8B5CF6',
    true,
    3
FROM companies c
WHERE NOT EXISTS (SELECT 1 FROM pto_categories pc WHERE pc.company_id = c.id AND pc.code = 'PERS')
ON CONFLICT (company_id, code) DO NOTHING;

-- Step 5: Update existing PTO data
-- =====================================================
-- Map existing 'kind' values to category codes (using your actual 'kind' column)
UPDATE employee_time_off
SET category_code = CASE
    WHEN LOWER(kind) LIKE '%vacation%' OR LOWER(kind) LIKE '%vac%' THEN 'VAC'
    WHEN LOWER(kind) LIKE '%sick%' THEN 'SICK'
    WHEN LOWER(kind) LIKE '%personal%' OR LOWER(kind) LIKE '%pers%' THEN 'PERS'
    WHEN LOWER(kind) LIKE '%pto%' THEN 'VAC'
    ELSE 'VAC'
END
WHERE category_code IS NULL;

-- Copy 'note' to 'reason' for better UX
UPDATE employee_time_off
SET reason = note
WHERE reason IS NULL AND note IS NOT NULL;

-- Ensure hours_requested is populated (calculate from date range if missing)
UPDATE employee_time_off
SET hours_requested = CASE
    WHEN hours_requested IS NULL OR hours_requested = 0 THEN
        GREATEST(1, EXTRACT(days FROM (ends_at - starts_at)) + 1) * 8
    ELSE hours_requested
END
WHERE hours_requested IS NULL OR hours_requested = 0;

-- Step 6: Create performance indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_employee_time_off_employee_category 
ON employee_time_off(employee_id, category_code);

CREATE INDEX IF NOT EXISTS idx_employee_time_off_company_status 
ON employee_time_off(company_id, status);

CREATE INDEX IF NOT EXISTS idx_employee_time_off_dates 
ON employee_time_off(starts_at, ends_at);

CREATE INDEX IF NOT EXISTS idx_pto_ledger_employee_category 
ON pto_ledger(employee_id, category_code);

CREATE INDEX IF NOT EXISTS idx_pto_categories_company_code 
ON pto_categories(company_id, code);

-- Step 7: Enable RLS
-- =====================================================
ALTER TABLE pto_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS pto_categories_company_policy ON pto_categories;
CREATE POLICY pto_categories_company_policy ON pto_categories
    FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Step 8: Create the current balances view
-- =====================================================
CREATE OR REPLACE VIEW pto_current_balances AS
SELECT 
    e.id as employee_id,
    e.company_id,
    e.full_name as employee_name,
    pc.code as category_code,
    pc.name as category_name,
    pc.color,
    
    -- Current balance from ledger (simplified for now)
    COALESCE(
        (SELECT SUM(
            CASE 
                WHEN entry_type IN ('ACCRUAL', 'ADJUSTMENT_ADD', 'CARRYOVER') THEN hours
                WHEN entry_type IN ('USAGE', 'ADJUSTMENT_SUB', 'FORFEITURE') THEN -hours
                ELSE 0
            END
        )
        FROM pto_ledger pl 
        WHERE pl.employee_id = e.id 
        AND pl.category_code = pc.code
        AND pl.effective_date <= CURRENT_DATE), 
        -- Default starting balances if no ledger entries
        CASE 
            WHEN pc.code = 'VAC' THEN 80  -- 80 hours vacation
            WHEN pc.code = 'SICK' THEN 40 -- 40 hours sick
            WHEN pc.code = 'PERS' THEN 16 -- 16 hours personal
            ELSE 0
        END
    ) as current_balance,
    
    -- Pending requests
    COALESCE(
        (SELECT SUM(hours_requested)
        FROM employee_time_off eto
        WHERE eto.employee_id = e.id 
        AND eto.category_code = pc.code
        AND eto.status = 'PENDING'), 0
    ) as pending_hours,
    
    -- Available balance
    COALESCE(
        (SELECT SUM(
            CASE 
                WHEN entry_type IN ('ACCRUAL', 'ADJUSTMENT_ADD', 'CARRYOVER') THEN hours
                WHEN entry_type IN ('USAGE', 'ADJUSTMENT_SUB', 'FORFEITURE') THEN -hours
                ELSE 0
            END
        )
        FROM pto_ledger pl 
        WHERE pl.employee_id = e.id 
        AND pl.category_code = pc.code
        AND pl.effective_date <= CURRENT_DATE), 
        CASE 
            WHEN pc.code = 'VAC' THEN 80
            WHEN pc.code = 'SICK' THEN 40
            WHEN pc.code = 'PERS' THEN 16
            ELSE 0
        END
    ) - COALESCE(
        (SELECT SUM(hours_requested)
        FROM employee_time_off eto
        WHERE eto.employee_id = e.id 
        AND eto.category_code = pc.code
        AND eto.status = 'PENDING'), 0
    ) as available_balance

FROM users e
CROSS JOIN pto_categories pc
WHERE e.active = true 
AND e.company_id = pc.company_id
AND pc.is_active = true;

COMMIT;

-- Verification queries (run these to check the migration)
-- =====================================================
-- SELECT 'PTO Categories Created' as status, COUNT(*) as count FROM pto_categories;
-- SELECT 'Employee Time Off Records' as status, COUNT(*) as count FROM employee_time_off WHERE category_code IS NOT NULL;
-- SELECT 'Hours Populated' as status, COUNT(*) as count FROM employee_time_off WHERE hours_requested > 0;
-- SELECT 'Current Balances Available' as status, COUNT(*) as count FROM pto_current_balances;
-- SELECT 'Sample PTO Data' as status, id, kind, category_code, hours_requested, note, reason FROM employee_time_off LIMIT 3;
