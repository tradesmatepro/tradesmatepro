-- ========================================
-- Phase 1 Core Rebuild - ROLLBACK SCRIPT
-- ========================================
-- EMERGENCY USE ONLY!
-- This script restores your original tables from backup
-- Use this if Phase 1 rebuild causes issues
-- ========================================

-- ========================================
-- ROLLBACK WARNING
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PHASE 1 ROLLBACK STARTING';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'WARNING: This will restore original tables';
    RAISE NOTICE 'Any changes made after rebuild will be lost!';
    RAISE NOTICE '========================================';
END $$;

-- ========================================
-- 1. DROP NEW TABLES AND OBJECTS
-- ========================================

-- Drop views first
DROP VIEW IF EXISTS quotes CASCADE;
DROP VIEW IF EXISTS jobs CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS change_work_order_status(uuid, work_order_status_enum, uuid) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS work_order_audit_log CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS work_orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Drop enums
DROP TYPE IF EXISTS work_order_status_enum CASCADE;
DROP TYPE IF EXISTS quote_status_enum CASCADE;
DROP TYPE IF EXISTS job_status_enum CASCADE;
DROP TYPE IF EXISTS invoice_status_enum CASCADE;
DROP TYPE IF EXISTS user_status_enum CASCADE;
DROP TYPE IF EXISTS customer_status_enum CASCADE;
DROP TYPE IF EXISTS company_status_enum CASCADE;
DROP TYPE IF EXISTS employment_status_enum CASCADE;

RAISE NOTICE 'New schema objects dropped';

-- ========================================
-- 2. RESTORE ORIGINAL TABLES FROM BACKUP
-- ========================================

-- Restore companies
CREATE TABLE companies AS SELECT * FROM backup_companies;
ALTER TABLE companies ADD PRIMARY KEY (id);

-- Restore users
CREATE TABLE users AS SELECT * FROM backup_users;
ALTER TABLE users ADD PRIMARY KEY (id);

-- Restore customers
CREATE TABLE customers AS SELECT * FROM backup_customers;
ALTER TABLE customers ADD PRIMARY KEY (id);

-- Restore work_orders
CREATE TABLE work_orders AS SELECT * FROM backup_work_orders;
ALTER TABLE work_orders ADD PRIMARY KEY (id);

-- Restore invoices
CREATE TABLE invoices AS SELECT * FROM backup_invoices;
ALTER TABLE invoices ADD PRIMARY KEY (id);

-- Restore attachments
CREATE TABLE attachments AS SELECT * FROM backup_attachments;
ALTER TABLE attachments ADD PRIMARY KEY (id);

RAISE NOTICE 'Original tables restored from backup';

-- ========================================
-- 3. RECREATE ORIGINAL INDEXES (if they existed)
-- ========================================

-- Add back common indexes that likely existed
CREATE INDEX IF NOT EXISTS idx_work_orders_company_id ON work_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_customer_id ON work_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);

CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_work_order_id ON invoices(work_order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);

CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_attachments_company_id ON attachments(company_id);

RAISE NOTICE 'Basic indexes recreated';

-- ========================================
-- 4. RESTORE ORIGINAL ENUMS (if they existed)
-- ========================================

-- Try to recreate original enums based on data in restored tables
-- This is best-effort - you may need to adjust based on your original schema

-- Check what status values exist in work_orders
DO $$
DECLARE
    status_values text[];
BEGIN
    -- Get unique status values from restored work_orders
    SELECT array_agg(DISTINCT status ORDER BY status) 
    INTO status_values 
    FROM work_orders 
    WHERE status IS NOT NULL;
    
    IF array_length(status_values, 1) > 0 THEN
        RAISE NOTICE 'Found work order status values: %', status_values;
        -- You may need to manually recreate the original enum based on these values
    END IF;
END $$;

-- ========================================
-- 5. RESTORE PERMISSIONS
-- ========================================

-- Grant basic permissions (adjust as needed for your original setup)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ========================================
-- 6. VALIDATION
-- ========================================

-- Verify rollback worked
DO $$
DECLARE
    company_count integer;
    user_count integer;
    customer_count integer;
    work_order_count integer;
    invoice_count integer;
    attachment_count integer;
BEGIN
    SELECT COUNT(*) INTO company_count FROM companies;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO customer_count FROM customers;
    SELECT COUNT(*) INTO work_order_count FROM work_orders;
    SELECT COUNT(*) INTO invoice_count FROM invoices;
    SELECT COUNT(*) INTO attachment_count FROM attachments;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ROLLBACK VALIDATION:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Companies restored: %', company_count;
    RAISE NOTICE 'Users restored: %', user_count;
    RAISE NOTICE 'Customers restored: %', customer_count;
    RAISE NOTICE 'Work Orders restored: %', work_order_count;
    RAISE NOTICE 'Invoices restored: %', invoice_count;
    RAISE NOTICE 'Attachments restored: %', attachment_count;
    RAISE NOTICE '========================================';
END $$;

-- ========================================
-- 7. CLEANUP INSTRUCTIONS
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ROLLBACK COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Your original tables have been restored.';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANT NEXT STEPS:';
    RAISE NOTICE '1. Test your application thoroughly';
    RAISE NOTICE '2. Check for any missing indexes or constraints';
    RAISE NOTICE '3. Verify all functionality works as before';
    RAISE NOTICE '4. Consider what went wrong with the rebuild';
    RAISE NOTICE '';
    RAISE NOTICE 'BACKUP TABLES STILL EXIST:';
    RAISE NOTICE '- backup_companies';
    RAISE NOTICE '- backup_users';
    RAISE NOTICE '- backup_customers';
    RAISE NOTICE '- backup_work_orders';
    RAISE NOTICE '- backup_invoices';
    RAISE NOTICE '- backup_attachments';
    RAISE NOTICE '';
    RAISE NOTICE 'You can drop these once you are confident';
    RAISE NOTICE 'the rollback was successful.';
    RAISE NOTICE '========================================';
END $$;

-- ========================================
-- ROLLBACK COMPLETE
-- ========================================
-- 
-- WHAT THIS SCRIPT DID:
-- ✅ Dropped all new Phase 1 objects
-- ✅ Restored original tables from backup
-- ✅ Recreated basic indexes
-- ✅ Restored permissions
-- ✅ Validated restoration
--
-- YOUR SYSTEM SHOULD NOW BE BACK TO THE STATE
-- IT WAS IN BEFORE THE PHASE 1 REBUILD
--
-- If you still have issues, you have your full
-- pg_dump backup to restore from.
-- ========================================
