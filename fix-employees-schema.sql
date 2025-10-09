-- ============================================================================
-- FIX EMPLOYEES TABLE SCHEMA AND DATA
-- ============================================================================
-- This script fixes the employees table by:
-- 1. Adding missing status column
-- 2. Deleting test/mock employees
-- 3. Deleting orphaned timesheets
-- 4. Setting real employees to active status
-- ============================================================================

-- STEP 1: Add status column if it doesn't exist
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' AND column_name = 'status'
    ) THEN
        ALTER TABLE employees ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE 'Added status column to employees table';
    ELSE
        RAISE NOTICE 'Status column already exists';
    END IF;
END $$;

-- STEP 2: Check if role column exists (it might be in profiles or users table)
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' AND column_name = 'role'
    ) THEN
        RAISE NOTICE 'Role column does NOT exist in employees table';
        RAISE NOTICE 'Check if role is stored in profiles or users table instead';
    ELSE
        RAISE NOTICE 'Role column exists in employees table';
    END IF;
END $$;

-- STEP 3: Show current state BEFORE cleanup
-- ============================================================================
SELECT 
    '=== BEFORE CLEANUP ===' as info,
    COUNT(*) as total_employees,
    COUNT(*) FILTER (WHERE employee_number LIKE '%TEST%') as test_employees,
    COUNT(*) FILTER (WHERE employee_number NOT LIKE '%TEST%') as real_employees
FROM employees
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';

-- STEP 4: Delete timesheets for test employees FIRST (foreign key constraint)
-- ============================================================================
DELETE FROM employee_timesheets
WHERE employee_id IN (
    SELECT id FROM employees 
    WHERE employee_number LIKE '%TEST%'
    AND company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'
);

-- Show how many timesheets were deleted
SELECT 
    '=== TIMESHEETS DELETED ===' as info,
    COUNT(*) as deleted_timesheets
FROM employee_timesheets
WHERE employee_id IN (
    SELECT id FROM employees 
    WHERE employee_number LIKE '%TEST%'
    AND company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'
);

-- STEP 5: Delete test employees
-- ============================================================================
DELETE FROM employees
WHERE employee_number LIKE '%TEST%'
AND company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';

-- STEP 6: Set real employees to active status
-- ============================================================================
UPDATE employees
SET status = 'active'
WHERE employee_number NOT LIKE '%TEST%'
AND company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';

-- STEP 7: Show final state AFTER cleanup
-- ============================================================================
SELECT 
    '=== AFTER CLEANUP ===' as info,
    COUNT(*) as total_employees,
    COUNT(*) FILTER (WHERE status = 'active') as active_employees,
    COUNT(*) FILTER (WHERE status = 'inactive') as inactive_employees,
    COUNT(*) FILTER (WHERE status IS NULL) as no_status
FROM employees
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';

-- STEP 8: Show remaining employees
-- ============================================================================
SELECT 
    '=== REMAINING EMPLOYEES ===' as info,
    employee_number,
    status,
    is_schedulable,
    created_at
FROM employees
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'
ORDER BY created_at;

-- STEP 9: Show remaining timesheets count
-- ============================================================================
SELECT 
    '=== REMAINING TIMESHEETS ===' as info,
    COUNT(*) as total_timesheets,
    COUNT(DISTINCT employee_id) as unique_employees
FROM employee_timesheets
WHERE employee_id IN (
    SELECT id FROM employees 
    WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'
);

-- ============================================================================
-- VERIFICATION QUERIES (Run these after the script)
-- ============================================================================

-- Check employees table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'employees'
-- ORDER BY ordinal_position;

-- Check all employees for your company
-- SELECT id, employee_number, status, is_schedulable, created_at
-- FROM employees
-- WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';

-- Check timesheets count
-- SELECT 
--     e.employee_number,
--     COUNT(et.id) as timesheet_count
-- FROM employees e
-- LEFT JOIN employee_timesheets et ON et.employee_id = e.id
-- WHERE e.company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'
-- GROUP BY e.employee_number;

