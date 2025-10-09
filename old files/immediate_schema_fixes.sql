-- ============================================================================
-- IMMEDIATE SCHEMA FIXES - RESOLVE 400 ERRORS
-- ============================================================================
-- Run these fixes IMMEDIATELY to resolve application 400 errors
-- These are the most critical enum and constraint mismatches
-- ============================================================================

-- BACKUP REMINDER
-- Before running this script, create a full database backup:
-- pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql

-- ============================================================================
-- 1. FIX INVOICE STATUS ENUM (CRITICAL - CAUSING 400 ERRORS)
-- ============================================================================

-- Current DB enum: ['UNPAID', 'PAID', 'OVERDUE', 'PARTIALLY_PAID', 'CANCELLED']
-- Application expects: ['DRAFT', 'SENT', 'PAID', 'VOID']

-- Step 1: Update existing data to match application expectations
UPDATE invoices SET status = 'DRAFT' WHERE status = 'UNPAID';
UPDATE invoices SET status = 'VOID' WHERE status = 'CANCELLED';
-- Note: OVERDUE and PARTIALLY_PAID will need business logic decisions

-- Step 2: Drop old constraint and add new one
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
CHECK ((status = ANY (ARRAY['DRAFT'::text, 'SENT'::text, 'PAID'::text, 'VOID'::text])));

-- ============================================================================
-- 2. FIX USER ROLE ENUM (CRITICAL - CAUSING AUTH ERRORS)
-- ============================================================================

-- Current DB enum: ['owner', 'admin', 'employee']  
-- Application expects: ['admin', 'tech', 'dispatcher', 'client']

-- Step 1: Update existing data
UPDATE users SET role = 'admin' WHERE role = 'owner';
UPDATE users SET role = 'tech' WHERE role = 'employee';

-- Step 2: Drop old constraint and add new one
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK ((role = ANY (ARRAY['admin'::text, 'tech'::text, 'dispatcher'::text, 'client'::text])));

-- ============================================================================
-- 3. FIX WORK ORDER STATUS ENUM (CRITICAL - CAUSING STATUS UPDATE ERRORS)
-- ============================================================================

-- Current DB enum: ['QUOTE', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'CANCELLED']
-- Application expects: ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

-- Step 1: Update existing data
UPDATE work_orders SET status = 'DRAFT' WHERE status = 'QUOTE';
UPDATE work_orders SET status = 'COMPLETED' WHERE status = 'INVOICED';
UPDATE work_orders SET status = 'SCHEDULED' WHERE status = 'ACCEPTED';

-- Step 2: Drop old constraint and add new one  
ALTER TABLE work_orders DROP CONSTRAINT IF EXISTS work_orders_status_check;
ALTER TABLE work_orders ADD CONSTRAINT work_orders_status_check 
CHECK ((status = ANY (ARRAY['DRAFT'::text, 'SCHEDULED'::text, 'IN_PROGRESS'::text, 'COMPLETED'::text, 'CANCELLED'::text])));

-- ============================================================================
-- 4. FIX CUSTOMER STATUS ENUM (CAUSING CUSTOMER UPDATE ERRORS)
-- ============================================================================

-- Current DB enum: ['active', 'inactive', 'suspended', 'credit_hold', 'do_not_service']
-- Application expects: ['ACTIVE', 'INACTIVE', 'SUSPENDED']

-- Step 1: Update existing data to uppercase and consolidate
UPDATE customers SET status = 'ACTIVE' WHERE status = 'active';
UPDATE customers SET status = 'INACTIVE' WHERE status = 'inactive';  
UPDATE customers SET status = 'SUSPENDED' WHERE status IN ('suspended', 'credit_hold', 'do_not_service');

-- Step 2: Drop old constraint and add new one
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_status_check;
ALTER TABLE customers ADD CONSTRAINT customers_status_check 
CHECK ((status = ANY (ARRAY['ACTIVE'::text, 'INACTIVE'::text, 'SUSPENDED'::text])));

-- ============================================================================
-- 5. FIX PAYMENT METHOD ENUM (CAUSING PAYMENT ERRORS)
-- ============================================================================

-- Current DB enum: ['CASH', 'CARD', 'CHECK', 'ACH', 'OTHER']
-- Application expects: ['CASH', 'CREDIT_CARD', 'CHECK', 'ACH', 'OTHER']

-- Step 1: Update existing data
UPDATE invoice_payments SET method = 'CREDIT_CARD' WHERE method = 'CARD';

-- Step 2: Drop old constraint and add new one
ALTER TABLE invoice_payments DROP CONSTRAINT IF EXISTS invoice_payments_method_check;
ALTER TABLE invoice_payments ADD CONSTRAINT invoice_payments_method_check 
CHECK ((method = ANY (ARRAY['CASH'::text, 'CREDIT_CARD'::text, 'CHECK'::text, 'ACH'::text, 'OTHER'::text])));

-- ============================================================================
-- 6. FIX EMPLOYEE TIME OFF STATUS ENUM (CAUSING PTO ERRORS)
-- ============================================================================

-- Current DB enum: ['REQUESTED', 'APPROVED', 'DENIED', 'CANCELLED', 'EXPIRED']
-- Application expects: ['PENDING', 'APPROVED', 'DENIED', 'CANCELLED']

-- Step 1: Update existing data
UPDATE employee_time_off SET status = 'PENDING' WHERE status = 'REQUESTED';
UPDATE employee_time_off SET status = 'CANCELLED' WHERE status = 'EXPIRED';

-- Step 2: Drop old constraint and add new one
ALTER TABLE employee_time_off DROP CONSTRAINT IF EXISTS employee_time_off_status_check;
ALTER TABLE employee_time_off ADD CONSTRAINT employee_time_off_status_check 
CHECK ((status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'DENIED'::text, 'CANCELLED'::text])));

-- ============================================================================
-- 7. FIX EXPENSE STATUS ENUM (CAUSING EXPENSE ERRORS)
-- ============================================================================

-- Current DB enum: ['pending', 'approved', 'rejected', 'reimbursed']
-- Application expects: ['PENDING', 'APPROVED', 'REJECTED', 'PAID']

-- Step 1: Update existing data to uppercase
UPDATE expenses SET status = 'PENDING' WHERE status = 'pending';
UPDATE expenses SET status = 'APPROVED' WHERE status = 'approved';
UPDATE expenses SET status = 'REJECTED' WHERE status = 'rejected';
UPDATE expenses SET status = 'PAID' WHERE status = 'reimbursed';

-- Step 2: Drop old constraint and add new one
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_status_check;
ALTER TABLE expenses ADD CONSTRAINT expenses_status_check 
CHECK ((status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REJECTED'::text, 'PAID'::text])));

-- ============================================================================
-- 8. FIX NOTIFICATION SEVERITY ENUM (CAUSING NOTIFICATION ERRORS)
-- ============================================================================

-- Current DB enum: ['INFO', 'WARNING', 'CRITICAL']
-- Application expects: ['info', 'warning', 'error', 'success']

-- Step 1: Update existing data to lowercase and map CRITICAL to error
UPDATE notifications SET severity = 'info' WHERE severity = 'INFO';
UPDATE notifications SET severity = 'warning' WHERE severity = 'WARNING';
UPDATE notifications SET severity = 'error' WHERE severity = 'CRITICAL';

-- Step 2: Drop old constraint and add new one
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_severity_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_severity_check 
CHECK ((severity = ANY (ARRAY['info'::text, 'warning'::text, 'error'::text, 'success'::text])));

-- ============================================================================
-- 9. ADD MISSING FOREIGN KEY COLUMNS (CAUSING RELATIONSHIP ERRORS)
-- ============================================================================

-- Add missing company_id to tables that need it
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE attachments ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Update existing records to have proper company_id
UPDATE quotes SET company_id = (
    SELECT c.company_id FROM customers c WHERE c.id = quotes.customer_id
) WHERE company_id IS NULL;

UPDATE attachments SET company_id = (
    SELECT company_id FROM work_orders w WHERE w.work_order_id = attachments.work_order_id
) WHERE company_id IS NULL AND work_order_id IS NOT NULL;

-- ============================================================================
-- 10. FIX DUPLICATE CONSTRAINT NAMES (CAUSING CONSTRAINT ERRORS)
-- ============================================================================

-- Remove duplicate constraints that are causing conflicts
ALTER TABLE work_order_items DROP CONSTRAINT IF EXISTS work_order_items_type_check;
ALTER TABLE work_order_items DROP CONSTRAINT IF EXISTS work_order_items_item_type_check;

-- Add single, correct constraint
ALTER TABLE work_order_items ADD CONSTRAINT work_order_items_item_type_check 
CHECK ((item_type = ANY (ARRAY['labor'::text, 'material'::text, 'part'::text, 'service'::text])));

-- ============================================================================
-- VALIDATION QUERIES - RUN AFTER FIXES
-- ============================================================================

-- Check that all enum values are now valid
SELECT 'invoices' as table_name, status, count(*) FROM invoices GROUP BY status;
SELECT 'users' as table_name, role, count(*) FROM users GROUP BY role;
SELECT 'work_orders' as table_name, status, count(*) FROM work_orders GROUP BY status;
SELECT 'customers' as table_name, status, count(*) FROM customers GROUP BY status;

-- Check for any remaining constraint violations
SELECT conname, conrelid::regclass 
FROM pg_constraint 
WHERE NOT convalidated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'IMMEDIATE SCHEMA FIXES COMPLETED';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Fixed enum constraints that were causing 400 errors:';
    RAISE NOTICE '✅ Invoice status enum updated';
    RAISE NOTICE '✅ User role enum updated';  
    RAISE NOTICE '✅ Work order status enum updated';
    RAISE NOTICE '✅ Customer status enum updated';
    RAISE NOTICE '✅ Payment method enum updated';
    RAISE NOTICE '✅ Employee time off status enum updated';
    RAISE NOTICE '✅ Expense status enum updated';
    RAISE NOTICE '✅ Notification severity enum updated';
    RAISE NOTICE '✅ Missing foreign keys added';
    RAISE NOTICE '✅ Duplicate constraints removed';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Test application functionality';
    RAISE NOTICE '2. Verify 400 errors are resolved';
    RAISE NOTICE '3. Plan structural fixes from schema_audit.md';
    RAISE NOTICE '============================================================================';
END $$;
