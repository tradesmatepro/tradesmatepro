-- =====================================================
-- PTO SYSTEM CONSOLIDATION
-- Consolidates multiple overlapping PTO tables into single source of truth
-- =====================================================

BEGIN;

-- 1. ENSURE PTO_CURRENT_BALANCES_V VIEW EXISTS
-- =====================================================
CREATE OR REPLACE VIEW pto_current_balances_v AS
SELECT 
    e.id as employee_id,
    e.company_id,
    e.full_name as employee_name,
    pc.code as category_code,
    pc.name as category_name,
    pc.color,
    
    -- Calculate current balance from ledger (SINGLE SOURCE OF TRUTH)
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
    ) as available_balance,
    
    -- Last transaction date for audit trail
    (SELECT MAX(effective_date)
     FROM pto_ledger pl 
     WHERE pl.employee_id = e.id 
     AND pl.category_code = pc.code) as last_transaction_date

FROM users e
CROSS JOIN pto_categories pc
WHERE e.active = true 
AND e.company_id = pc.company_id
AND pc.is_active = true;

COMMENT ON VIEW pto_current_balances_v IS 'CONSOLIDATED PTO BALANCES - Single source of truth computed from pto_ledger. Replaces pto_balances, pto_current_balances, employee_pto_balances tables.';

-- 2. ADD DEPRECATION COMMENTS TO OLD TABLES
-- =====================================================

-- Mark pto_balances as deprecated
COMMENT ON TABLE pto_balances IS 'DEPRECATED: Use pto_current_balances_v view instead. This table causes data inconsistency.';

-- Mark employee_pto_balances as deprecated  
COMMENT ON TABLE employee_pto_balances IS 'DEPRECATED: Use pto_current_balances_v view instead. This table causes data inconsistency.';

-- Mark pto_current_balances table as deprecated (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pto_current_balances' AND table_type = 'BASE TABLE') THEN
        COMMENT ON TABLE pto_current_balances IS 'DEPRECATED: Use pto_current_balances_v view instead. This table causes data inconsistency.';
    END IF;
END $$;

-- 3. CREATE HELPER FUNCTIONS FOR PTO OPERATIONS
-- =====================================================

-- Function to add PTO ledger entry with validation
CREATE OR REPLACE FUNCTION add_pto_ledger_entry(
    p_company_id UUID,
    p_employee_id UUID,
    p_category_code TEXT,
    p_entry_type TEXT,
    p_hours NUMERIC,
    p_effective_date DATE DEFAULT CURRENT_DATE,
    p_description TEXT DEFAULT '',
    p_reference_id UUID DEFAULT NULL,
    p_reference_type TEXT DEFAULT 'MANUAL',
    p_created_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_entry_id UUID;
BEGIN
    -- Validate entry type
    IF p_entry_type NOT IN ('ACCRUAL', 'USAGE', 'ADJUSTMENT_ADD', 'ADJUSTMENT_SUB', 'CARRYOVER', 'FORFEITURE') THEN
        RAISE EXCEPTION 'Invalid entry_type: %. Must be one of: ACCRUAL, USAGE, ADJUSTMENT_ADD, ADJUSTMENT_SUB, CARRYOVER, FORFEITURE', p_entry_type;
    END IF;
    
    -- Validate hours is positive
    IF p_hours <= 0 THEN
        RAISE EXCEPTION 'Hours must be positive: %', p_hours;
    END IF;
    
    -- Insert ledger entry
    INSERT INTO pto_ledger (
        company_id, employee_id, category_code, entry_type, hours,
        effective_date, description, reference_id, reference_type, created_by
    ) VALUES (
        p_company_id, p_employee_id, p_category_code, p_entry_type, p_hours,
        p_effective_date, p_description, p_reference_id, p_reference_type, p_created_by
    ) RETURNING id INTO v_entry_id;
    
    RETURN v_entry_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get employee PTO balance for specific category
CREATE OR REPLACE FUNCTION get_pto_balance(
    p_employee_id UUID,
    p_category_code TEXT,
    p_as_of_date DATE DEFAULT CURRENT_DATE
) RETURNS NUMERIC AS $$
DECLARE
    v_balance NUMERIC;
BEGIN
    SELECT COALESCE(SUM(
        CASE 
            WHEN entry_type IN ('ACCRUAL', 'ADJUSTMENT_ADD', 'CARRYOVER') THEN hours
            WHEN entry_type IN ('USAGE', 'ADJUSTMENT_SUB', 'FORFEITURE') THEN -hours
            ELSE 0
        END
    ), 0) INTO v_balance
    FROM pto_ledger 
    WHERE employee_id = p_employee_id 
    AND category_code = p_category_code
    AND effective_date <= p_as_of_date;
    
    RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index on pto_ledger for balance calculations
CREATE INDEX IF NOT EXISTS idx_pto_ledger_balance_calc 
ON pto_ledger (employee_id, category_code, effective_date);

-- Index on employee_time_off for pending calculations
CREATE INDEX IF NOT EXISTS idx_employee_time_off_pending 
ON employee_time_off (employee_id, category_code, status) 
WHERE status = 'PENDING';

-- 5. GRANT PERMISSIONS
-- =====================================================

-- Grant access to the consolidated view
GRANT SELECT ON pto_current_balances_v TO authenticated;
GRANT SELECT ON pto_current_balances_v TO anon;

-- Grant access to helper functions
GRANT EXECUTE ON FUNCTION add_pto_ledger_entry TO authenticated;
GRANT EXECUTE ON FUNCTION get_pto_balance TO authenticated;

COMMIT;

-- =====================================================
-- CONSOLIDATION COMPLETED!
--
-- What was accomplished:
-- 1. ✅ Created pto_current_balances_v as single source of truth
-- 2. ✅ Marked redundant tables as deprecated with comments
-- 3. ✅ Added helper functions for PTO operations
-- 4. ✅ Created performance indexes
-- 5. ✅ Granted proper permissions
--
-- Next Steps:
-- - All PTO components now use pto_current_balances_v view
-- - PTOService.js writes only to pto_ledger table
-- - Old tables can be safely ignored (marked deprecated)
-- - System has single source of truth for PTO data
-- =====================================================
