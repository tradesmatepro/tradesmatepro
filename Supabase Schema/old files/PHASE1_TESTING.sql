-- ========================================
-- Phase 1 Core Rebuild - Testing & Validation
-- ========================================
-- Run this script AFTER Phase 1 rebuild to validate everything works
-- ========================================

-- ========================================
-- 1. DATA INTEGRITY TESTS
-- ========================================

-- Test 1: Check all foreign key relationships
SELECT 'Testing foreign key integrity...' as test_name;

-- Users should have valid company_id
SELECT 
    'Users with invalid company_id' as issue,
    COUNT(*) as count
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE c.id IS NULL;

-- Customers should have valid company_id
SELECT 
    'Customers with invalid company_id' as issue,
    COUNT(*) as count
FROM customers cu
LEFT JOIN companies c ON cu.company_id = c.id
WHERE c.id IS NULL;

-- Work orders should have valid company_id and customer_id
SELECT 
    'Work orders with invalid company_id' as issue,
    COUNT(*) as count
FROM work_orders wo
LEFT JOIN companies c ON wo.company_id = c.id
WHERE c.id IS NULL;

SELECT 
    'Work orders with invalid customer_id' as issue,
    COUNT(*) as count
FROM work_orders wo
LEFT JOIN customers cu ON wo.customer_id = cu.id
WHERE wo.customer_id IS NOT NULL AND cu.id IS NULL;

-- ========================================
-- 2. ENUM VALUE TESTS
-- ========================================

-- Test 2: Check all enum values are valid
SELECT 'Testing enum values...' as test_name;

-- Work order status distribution
SELECT 
    'Work Order Status Distribution' as test,
    status,
    COUNT(*) as count
FROM work_orders
GROUP BY status
ORDER BY count DESC;

-- Invoice status distribution
SELECT 
    'Invoice Status Distribution' as test,
    status,
    COUNT(*) as count
FROM invoices
GROUP BY status
ORDER BY count DESC;

-- User status distribution
SELECT 
    'User Status Distribution' as test,
    status,
    COUNT(*) as count
FROM users
GROUP BY status
ORDER BY count DESC;

-- ========================================
-- 3. UNIFIED PIPELINE TESTS
-- ========================================

-- Test 3: Verify unified pipeline views work
SELECT 'Testing unified pipeline views...' as test_name;

-- Quotes view test
SELECT 
    'Quotes View' as view_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT status) as unique_statuses
FROM quotes;

-- Jobs view test
SELECT 
    'Jobs View' as view_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT status) as unique_statuses
FROM jobs;

-- Pipeline stage distribution
SELECT 
    'Pipeline Stage Distribution' as test,
    CASE 
        WHEN status IN ('DRAFT', 'QUOTE', 'SENT') THEN 'Quote Stage'
        WHEN status IN ('ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'ASSIGNED') THEN 'Job Stage'
        WHEN status IN ('COMPLETED', 'INVOICED') THEN 'Complete Stage'
        ELSE 'Other'
    END as pipeline_stage,
    COUNT(*) as count
FROM work_orders
GROUP BY 
    CASE 
        WHEN status IN ('DRAFT', 'QUOTE', 'SENT') THEN 'Quote Stage'
        WHEN status IN ('ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'ASSIGNED') THEN 'Job Stage'
        WHEN status IN ('COMPLETED', 'INVOICED') THEN 'Complete Stage'
        ELSE 'Other'
    END
ORDER BY count DESC;

-- ========================================
-- 4. FUNCTION TESTS
-- ========================================

-- Test 4: Test status change function
SELECT 'Testing status change function...' as test_name;

-- Create a test work order if none exist
DO $$
DECLARE
    test_company_id uuid;
    test_customer_id uuid;
    test_work_order_id uuid;
    test_user_id uuid;
BEGIN
    -- Get or create test data
    SELECT id INTO test_company_id FROM companies LIMIT 1;
    SELECT id INTO test_customer_id FROM customers LIMIT 1;
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_company_id IS NOT NULL AND test_customer_id IS NOT NULL THEN
        -- Create test work order
        INSERT INTO work_orders (company_id, customer_id, description, status)
        VALUES (test_company_id, test_customer_id, 'Test work order for function testing', 'DRAFT')
        RETURNING id INTO test_work_order_id;
        
        -- Test status change function
        PERFORM change_work_order_status(test_work_order_id, 'QUOTE'::work_order_status_enum, test_user_id);
        
        -- Verify the change
        IF EXISTS (
            SELECT 1 FROM work_orders 
            WHERE id = test_work_order_id AND status = 'QUOTE'::work_order_status_enum
        ) THEN
            RAISE NOTICE 'Status change function test: PASSED';
        ELSE
            RAISE NOTICE 'Status change function test: FAILED';
        END IF;
        
        -- Verify audit log entry
        IF EXISTS (
            SELECT 1 FROM work_order_audit_log 
            WHERE work_order_id = test_work_order_id 
            AND action = 'status_change'
            AND old_status = 'DRAFT'
            AND new_status = 'QUOTE'
        ) THEN
            RAISE NOTICE 'Audit logging test: PASSED';
        ELSE
            RAISE NOTICE 'Audit logging test: FAILED';
        END IF;
        
        -- Clean up test data
        DELETE FROM work_orders WHERE id = test_work_order_id;
        DELETE FROM work_order_audit_log WHERE work_order_id = test_work_order_id;
        
    ELSE
        RAISE NOTICE 'Cannot test functions - no test data available';
    END IF;
END $$;

-- ========================================
-- 5. PERFORMANCE TESTS
-- ========================================

-- Test 5: Check indexes are being used
SELECT 'Testing index usage...' as test_name;

-- Explain a common query to verify index usage
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM work_orders 
WHERE company_id = (SELECT id FROM companies LIMIT 1)
AND status = 'IN_PROGRESS'::work_order_status_enum;

-- ========================================
-- 6. MIGRATION VALIDATION
-- ========================================

-- Test 6: Compare record counts with backup tables
SELECT 'Validating migration completeness...' as test_name;

-- Compare companies
SELECT 
    'Companies' as table_name,
    (SELECT COUNT(*) FROM backup_companies) as backup_count,
    (SELECT COUNT(*) FROM companies) as migrated_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM backup_companies) = (SELECT COUNT(*) FROM companies) 
        THEN 'MATCH' 
        ELSE 'MISMATCH' 
    END as status;

-- Compare users
SELECT 
    'Users' as table_name,
    (SELECT COUNT(*) FROM backup_users) as backup_count,
    (SELECT COUNT(*) FROM users) as migrated_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM backup_users) = (SELECT COUNT(*) FROM users) 
        THEN 'MATCH' 
        ELSE 'MISMATCH' 
    END as status;

-- Compare customers
SELECT 
    'Customers' as table_name,
    (SELECT COUNT(*) FROM backup_customers) as backup_count,
    (SELECT COUNT(*) FROM customers) as migrated_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM backup_customers) = (SELECT COUNT(*) FROM customers) 
        THEN 'MATCH' 
        ELSE 'MISMATCH' 
    END as status;

-- Compare work orders
SELECT 
    'Work Orders' as table_name,
    (SELECT COUNT(*) FROM backup_work_orders) as backup_count,
    (SELECT COUNT(*) FROM work_orders) as migrated_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM backup_work_orders) = (SELECT COUNT(*) FROM work_orders) 
        THEN 'MATCH' 
        ELSE 'MISMATCH' 
    END as status;

-- Compare invoices
SELECT 
    'Invoices' as table_name,
    (SELECT COUNT(*) FROM backup_invoices) as backup_count,
    (SELECT COUNT(*) FROM invoices) as migrated_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM backup_invoices) = (SELECT COUNT(*) FROM invoices) 
        THEN 'MATCH' 
        ELSE 'MISMATCH' 
    END as status;

-- ========================================
-- 7. FINAL VALIDATION SUMMARY
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PHASE 1 TESTING COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Review the test results above.';
    RAISE NOTICE 'All foreign key counts should be 0.';
    RAISE NOTICE 'All migration counts should MATCH.';
    RAISE NOTICE 'Function tests should show PASSED.';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'If all tests pass, Phase 1 is successful!';
    RAISE NOTICE 'You can now test your frontend application.';
    RAISE NOTICE '========================================';
END $$;
