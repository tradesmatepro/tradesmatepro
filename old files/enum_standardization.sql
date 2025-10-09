-- ============================================================================
-- ENUM STANDARDIZATION - PROPER FUTURE-PROOF APPROACH
-- ============================================================================
-- Convert mixed TEXT+CHECK and conflicting ENUMs to clean, standard ENUMs
-- This prevents future drift between app code and database schema
-- ============================================================================

-- Step 1: Drop all existing conflicting enum types and constraints
DROP TYPE IF EXISTS invoice_status_enum CASCADE;
DROP TYPE IF EXISTS job_status_enum CASCADE;
DROP TYPE IF EXISTS unified_job_status_enum CASCADE;
DROP TYPE IF EXISTS work_order_status_enum CASCADE;

-- Drop all status-related CHECK constraints
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE work_orders DROP CONSTRAINT IF EXISTS work_orders_status_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_status_check;

-- Step 2: Create clean, standard ENUM types that match application expectations
CREATE TYPE invoice_status_enum AS ENUM ('DRAFT', 'SENT', 'PAID', 'VOID');
CREATE TYPE work_order_status_enum AS ENUM ('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE user_role_enum AS ENUM ('admin', 'tech', 'dispatcher', 'client');
CREATE TYPE customer_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE payment_method_enum AS ENUM ('CASH', 'CREDIT_CARD', 'CHECK', 'ACH', 'OTHER');

-- Step 3: Convert columns to use standard ENUMs

-- 3a. Invoices status
-- First, normalize all existing values to valid enum values
UPDATE invoices SET status = 'DRAFT' WHERE status IN ('UNPAID', 'QUOTE', 'PENDING');
UPDATE invoices SET status = 'SENT' WHERE status IN ('OVERDUE', 'SENT_TO_CUSTOMER');
UPDATE invoices SET status = 'PAID' WHERE status IN ('PARTIALLY_PAID', 'FULLY_PAID');
UPDATE invoices SET status = 'VOID' WHERE status IN ('CANCELLED', 'CANCELED');

-- Convert column to ENUM type
ALTER TABLE invoices ALTER COLUMN status TYPE invoice_status_enum USING status::invoice_status_enum;

-- 3b. Work Orders status  
-- Normalize existing values
UPDATE work_orders SET status = 'DRAFT' WHERE status IN ('QUOTE', 'PENDING', 'TBD', 'WORK_ORDER');
UPDATE work_orders SET status = 'SCHEDULED' WHERE status IN ('ACCEPTED', 'ASSIGNED', 'NORMAL');
UPDATE work_orders SET status = 'IN_PROGRESS' WHERE status IN ('INPROGRESS', 'ACTIVE');
UPDATE work_orders SET status = 'COMPLETED' WHERE status IN ('DONE', 'FINISHED');
UPDATE work_orders SET status = 'CANCELLED' WHERE status IN ('CANCEL', 'CANCELED');

-- Convert column to ENUM type
ALTER TABLE work_orders ALTER COLUMN status TYPE work_order_status_enum USING status::work_order_status_enum;

-- 3c. Users role
-- Normalize existing values
UPDATE users SET role = 'admin' WHERE role IN ('owner', 'administrator');
UPDATE users SET role = 'tech' WHERE role IN ('employee', 'technician');

-- Convert column to ENUM type
ALTER TABLE users ALTER COLUMN role TYPE user_role_enum USING role::user_role_enum;

-- 3d. Customers status
-- Normalize existing values
UPDATE customers SET status = 'ACTIVE' WHERE status = 'active';
UPDATE customers SET status = 'INACTIVE' WHERE status = 'inactive';
UPDATE customers SET status = 'SUSPENDED' WHERE status IN ('suspended', 'credit_hold', 'do_not_service');

-- Convert column to ENUM type
ALTER TABLE customers ALTER COLUMN status TYPE customer_status_enum USING status::customer_status_enum;

-- 3e. Payment methods
-- Normalize existing values in invoice_payments
UPDATE invoice_payments SET method = 'CREDIT_CARD' WHERE method = 'CARD';
UPDATE invoice_payments SET method = 'CASH' WHERE method = 'cash';
UPDATE invoice_payments SET method = 'CHECK' WHERE method = 'check';
UPDATE invoice_payments SET method = 'ACH' WHERE method = 'ach';
UPDATE invoice_payments SET method = 'OTHER' WHERE method = 'other';

-- Convert column to ENUM type
ALTER TABLE invoice_payments ALTER COLUMN method TYPE payment_method_enum USING method::payment_method_enum;

-- Step 4: Add NOT NULL constraints where appropriate
ALTER TABLE invoices ALTER COLUMN status SET NOT NULL;
ALTER TABLE work_orders ALTER COLUMN status SET NOT NULL;
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE customers ALTER COLUMN status SET NOT NULL;

-- Step 5: Create indexes on ENUM columns for performance
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- Step 6: Verification queries
SELECT 'invoices' as table_name, status, count(*) FROM invoices GROUP BY status;
SELECT 'work_orders' as table_name, status, count(*) FROM work_orders GROUP BY status;
SELECT 'users' as table_name, role, count(*) FROM users GROUP BY role;
SELECT 'customers' as table_name, status, count(*) FROM customers GROUP BY status;

-- Step 7: Show the clean ENUM definitions
SELECT 
    t.typname as enum_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as allowed_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname IN ('invoice_status_enum', 'work_order_status_enum', 'user_role_enum', 'customer_status_enum', 'payment_method_enum')
GROUP BY t.typname
ORDER BY t.typname;

-- ============================================================================
-- FUTURE-PROOF GUIDELINES
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'ENUM STANDARDIZATION COMPLETED';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Status columns now use proper PostgreSQL ENUMs:';
    RAISE NOTICE '✅ invoices.status → invoice_status_enum';
    RAISE NOTICE '✅ work_orders.status → work_order_status_enum';
    RAISE NOTICE '✅ users.role → user_role_enum';
    RAISE NOTICE '✅ customers.status → customer_status_enum';
    RAISE NOTICE '✅ invoice_payments.method → payment_method_enum';
    RAISE NOTICE '';
    RAISE NOTICE 'FUTURE GUIDELINES:';
    RAISE NOTICE '1. Status columns = ENUMs (not TEXT + CHECK)';
    RAISE NOTICE '2. App code must match ENUM values exactly';
    RAISE NOTICE '3. New status values require explicit migration:';
    RAISE NOTICE '   ALTER TYPE invoice_status_enum ADD VALUE ''NEW_STATUS'';';
    RAISE NOTICE '4. No more rogue values possible';
    RAISE NOTICE '5. Database enforces business logic integrity';
    RAISE NOTICE '============================================================================';
END $$;
