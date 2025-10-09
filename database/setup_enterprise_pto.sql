-- =====================================================
-- ENTERPRISE PTO SYSTEM SETUP
-- Run this after the basic optimization
-- =====================================================

BEGIN;

-- Step 1: Run the enterprise PTO system creation
\i database/enterprise_pto_system.sql

-- Step 2: Initialize starting balances for existing employees
-- =====================================================
-- Give all active employees starting balances based on typical accrual
INSERT INTO pto_ledger (
    employee_id, 
    category_code, 
    company_id,
    entry_type, 
    hours, 
    effective_date, 
    notes
)
SELECT 
    u.id,
    'VAC',
    u.company_id,
    'MANUAL_ADD',
    80, -- Starting vacation balance
    CURRENT_DATE,
    'Initial balance - system setup'
FROM users u
WHERE u.active = true
AND NOT EXISTS (
    SELECT 1 FROM pto_ledger pl 
    WHERE pl.employee_id = u.id AND pl.category_code = 'VAC'
);

INSERT INTO pto_ledger (
    employee_id, 
    category_code, 
    company_id,
    entry_type, 
    hours, 
    effective_date, 
    notes
)
SELECT 
    u.id,
    'SICK',
    u.company_id,
    'MANUAL_ADD',
    40, -- Starting sick balance
    CURRENT_DATE,
    'Initial balance - system setup'
FROM users u
WHERE u.active = true
AND NOT EXISTS (
    SELECT 1 FROM pto_ledger pl 
    WHERE pl.employee_id = u.id AND pl.category_code = 'SICK'
);

INSERT INTO pto_ledger (
    employee_id, 
    category_code, 
    company_id,
    entry_type, 
    hours, 
    effective_date, 
    notes
)
SELECT 
    u.id,
    'PERS',
    u.company_id,
    'MANUAL_ADD',
    16, -- Starting personal balance
    CURRENT_DATE,
    'Initial balance - system setup'
FROM users u
WHERE u.active = true
AND NOT EXISTS (
    SELECT 1 FROM pto_ledger pl 
    WHERE pl.employee_id = u.id AND pl.category_code = 'PERS'
);

-- Step 3: Process first accrual run (current pay period)
-- =====================================================
-- Calculate current biweekly pay period (assuming Sunday start)
DO $$
DECLARE
    v_company_id UUID;
    v_pay_start DATE;
    v_pay_end DATE;
    v_run_id UUID;
BEGIN
    -- Get first company (adjust as needed)
    SELECT id INTO v_company_id FROM companies LIMIT 1;
    
    -- Calculate current pay period (biweekly, Sunday start)
    v_pay_start := DATE_TRUNC('week', CURRENT_DATE)::date;
    v_pay_end := v_pay_start + INTERVAL '13 days';
    
    -- Process accruals
    SELECT process_pto_accruals(v_company_id, v_pay_start, v_pay_end) INTO v_run_id;
    
    RAISE NOTICE 'Processed accruals for company %, run ID: %', v_company_id, v_run_id;
END $$;

COMMIT;

-- Verification Queries
-- =====================================================
SELECT 'Enterprise PTO System Setup Complete' as status;

-- Check policies created
SELECT 
    'Accrual Policies' as component,
    COUNT(*) as count,
    STRING_AGG(DISTINCT category_code, ', ') as categories
FROM pto_accrual_policies;

-- Check employee assignments
SELECT 
    'Employee Policy Assignments' as component,
    COUNT(*) as count
FROM employee_pto_policy_assignments;

-- Check starting balances
SELECT 
    'Starting Balances Created' as component,
    category_code,
    COUNT(*) as employees,
    SUM(hours) as total_hours
FROM pto_ledger 
WHERE entry_type = 'MANUAL_ADD'
GROUP BY category_code;

-- Check accrual runs
SELECT 
    'Accrual Runs Completed' as component,
    COUNT(*) as runs,
    SUM(employees_processed) as total_employees,
    SUM(total_hours_accrued) as total_hours
FROM pto_accrual_runs;

-- Sample balance calculation
SELECT 
    'Sample Employee Balance' as component,
    u.full_name,
    cb.*
FROM users u
CROSS JOIN LATERAL calculate_pto_balance(u.id, 'VAC') cb
WHERE u.active = true
LIMIT 3;
