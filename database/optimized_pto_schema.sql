-- =====================================================
-- OPTIMIZED PTO SYSTEM SCHEMA - HOURS-BASED
-- Market Research Optimized for Business Applications
-- =====================================================

-- 1. CREATE PTO CATEGORIES TABLE (Industry Standard)
-- =====================================================
CREATE TABLE IF NOT EXISTS pto_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- 'VAC', 'SICK', 'PERS', 'COMP', 'HOLI'
    name TEXT NOT NULL, -- 'Vacation', 'Sick Leave', 'Personal', 'Comp Time', 'Holiday'
    color TEXT DEFAULT '#10B981', -- UI color for display
    requires_approval BOOLEAN DEFAULT true,
    advance_notice_days INTEGER DEFAULT 0, -- How many days notice required
    max_consecutive_days INTEGER DEFAULT NULL, -- Max days in a row
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, code)
);

-- 2. OPTIMIZE EMPLOYEE_TIME_OFF TABLE (Your Main PTO Table)
-- =====================================================
-- Add missing columns for hours-based system
ALTER TABLE employee_time_off 
ADD COLUMN IF NOT EXISTS category_code TEXT REFERENCES pto_categories(code),
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Update existing data to use hours if missing
UPDATE employee_time_off 
SET hours_requested = CASE 
    WHEN hours_requested IS NULL OR hours_requested = 0 THEN
        -- Calculate hours from date range (8 hours per day)
        (EXTRACT(days FROM (ends_at - starts_at)) + 1) * 8
    ELSE hours_requested
END
WHERE hours_requested IS NULL OR hours_requested = 0;

-- 3. CREATE PTO CURRENT BALANCES VIEW (Real-time balances)
-- =====================================================
CREATE OR REPLACE VIEW pto_current_balances AS
SELECT 
    e.id as employee_id,
    e.company_id,
    e.full_name as employee_name,
    pc.code as category_code,
    pc.name as category_name,
    pc.color,
    
    -- Calculate current balance from ledger
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
        AND pl.effective_date <= CURRENT_DATE), 0
    ) as current_balance,
    
    -- Pending requests (not yet approved/denied)
    COALESCE(
        (SELECT SUM(hours_requested)
        FROM employee_time_off eto
        WHERE eto.employee_id = e.id 
        AND eto.category_code = pc.code
        AND eto.status = 'PENDING'), 0
    ) as pending_hours,
    
    -- Available balance (current - pending)
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
        AND pl.effective_date <= CURRENT_DATE), 0
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

-- 4. UPDATE PTO_LEDGER TABLE (Add category support)
-- =====================================================
ALTER TABLE pto_ledger 
ADD COLUMN IF NOT EXISTS category_code TEXT,
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- 5. CREATE DEFAULT PTO CATEGORIES FOR EXISTING COMPANIES
-- =====================================================
INSERT INTO pto_categories (company_id, code, name, color, requires_approval, advance_notice_days)
SELECT DISTINCT 
    c.id as company_id,
    'VAC' as code,
    'Vacation' as name,
    '#10B981' as color,
    true as requires_approval,
    7 as advance_notice_days
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM pto_categories pc 
    WHERE pc.company_id = c.id AND pc.code = 'VAC'
);

INSERT INTO pto_categories (company_id, code, name, color, requires_approval, advance_notice_days)
SELECT DISTINCT 
    c.id as company_id,
    'SICK' as code,
    'Sick Leave' as name,
    '#EF4444' as color,
    false as requires_approval,
    0 as advance_notice_days
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM pto_categories pc 
    WHERE pc.company_id = c.id AND pc.code = 'SICK'
);

INSERT INTO pto_categories (company_id, code, name, color, requires_approval, advance_notice_days)
SELECT DISTINCT 
    c.id as company_id,
    'PERS' as code,
    'Personal' as name,
    '#8B5CF6' as color,
    true as requires_approval,
    3 as advance_notice_days
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM pto_categories pc 
    WHERE pc.company_id = c.id AND pc.code = 'PERS'
);

-- 6. UPDATE EXISTING PTO DATA
-- =====================================================
-- Map existing 'kind' values to category codes
UPDATE employee_time_off 
SET category_code = CASE 
    WHEN LOWER(kind) LIKE '%vacation%' OR LOWER(kind) LIKE '%vac%' THEN 'VAC'
    WHEN LOWER(kind) LIKE '%sick%' THEN 'SICK'
    WHEN LOWER(kind) LIKE '%personal%' OR LOWER(kind) LIKE '%pers%' THEN 'PERS'
    WHEN LOWER(kind) LIKE '%pto%' THEN 'VAC' -- Default PTO to vacation
    ELSE 'VAC' -- Default fallback
END
WHERE category_code IS NULL;

-- 7. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_employee_time_off_employee_category 
ON employee_time_off(employee_id, category_code);

CREATE INDEX IF NOT EXISTS idx_employee_time_off_company_status 
ON employee_time_off(company_id, status);

CREATE INDEX IF NOT EXISTS idx_employee_time_off_dates 
ON employee_time_off(starts_at, ends_at);

CREATE INDEX IF NOT EXISTS idx_pto_ledger_employee_category 
ON pto_ledger(employee_id, category_code);

-- 8. ADD TRIGGERS FOR AUTOMATIC LEDGER ENTRIES
-- =====================================================
CREATE OR REPLACE FUNCTION update_pto_ledger()
RETURNS TRIGGER AS $$
BEGIN
    -- When PTO request is approved, create ledger entry
    IF NEW.status = 'APPROVED' AND (OLD.status IS NULL OR OLD.status != 'APPROVED') THEN
        INSERT INTO pto_ledger (
            employee_id, 
            category_code, 
            company_id,
            entry_type, 
            hours, 
            effective_date, 
            notes
        ) VALUES (
            NEW.employee_id,
            NEW.category_code,
            NEW.company_id,
            'USAGE',
            NEW.hours_requested,
            NEW.starts_at::date,
            'PTO Request: ' || COALESCE(NEW.reason, 'Time off request')
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pto_ledger
    AFTER UPDATE ON employee_time_off
    FOR EACH ROW
    EXECUTE FUNCTION update_pto_ledger();

-- 9. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE pto_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pto_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY pto_categories_company_policy ON pto_categories
    FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY pto_ledger_company_policy ON pto_ledger
    FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
