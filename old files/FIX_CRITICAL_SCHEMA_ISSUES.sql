-- ========================================
-- TradeMate Pro - Critical Schema Fixes
-- ========================================
-- Fixes 400 errors from logs.md
-- Based on diagnostic analysis
--
-- IMPORTANT: Run DIAGNOSTIC_SCHEMA_CHECK.sql first!
-- IMPORTANT: Backup database before running!
--
-- Run this via Supabase SQL Editor or psql:
-- psql -h db.cxlqzejzraczumqmsrcx.supabase.co -p 5432 -U postgres -d postgres -f FIX_CRITICAL_SCHEMA_ISSUES.sql
-- ========================================

BEGIN;

-- Enable output
\set ON_ERROR_STOP on
\set ECHO all

SELECT '=== STARTING CRITICAL SCHEMA FIXES ===' as status;

-- ========================================
-- PRIORITY 1: FIX PROFILES TABLE
-- ========================================
\echo 'PRIORITY 1: Fixing profiles table...'

-- Add missing status column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'status'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN status TEXT DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'));
        
        \echo '✅ Added status column to profiles';
    ELSE
        \echo '⏭️  status column already exists in profiles';
    END IF;
END $$;

-- Add missing user_id column (link to users table)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'user_id'
    ) THEN
        -- First add the column as nullable
        ALTER TABLE profiles ADD COLUMN user_id UUID;
        
        -- Try to populate it from existing data if possible
        -- (This assumes profiles.id might match users.id in some cases)
        UPDATE profiles p
        SET user_id = u.id
        FROM users u
        WHERE p.company_id = u.company_id
          AND p.first_name || ' ' || p.last_name = u.full_name
          AND p.user_id IS NULL;
        
        -- Add foreign key constraint
        ALTER TABLE profiles 
        ADD CONSTRAINT fk_profiles_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        
        \echo '✅ Added user_id column to profiles with FK constraint';
    ELSE
        \echo '⏭️  user_id column already exists in profiles';
    END IF;
END $$;

-- Add missing email column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
        
        -- Try to populate from users table if user_id exists
        UPDATE profiles p
        SET email = u.email
        FROM users u
        WHERE p.user_id = u.id
          AND p.email IS NULL;
        
        \echo '✅ Added email column to profiles';
    ELSE
        \echo '⏭️  email column already exists in profiles';
    END IF;
END $$;

-- Add missing full_name column (computed or regular)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'full_name'
    ) THEN
        -- Add as a regular column (not generated) for compatibility
        ALTER TABLE profiles ADD COLUMN full_name TEXT;
        
        -- Populate it
        UPDATE profiles 
        SET full_name = COALESCE(first_name || ' ' || last_name, first_name, last_name, 'Unknown User')
        WHERE full_name IS NULL;
        
        \echo '✅ Added full_name column to profiles';
    ELSE
        \echo '⏭️  full_name column already exists in profiles';
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

\echo '✅ Added indexes to profiles table'
\echo ''

-- ========================================
-- PRIORITY 2: FIX WORK_ORDERS STATUS ENUM
-- ========================================
\echo 'PRIORITY 2: Fixing work_orders status enum...'

-- Check if enum exists, create if not
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_order_status_enum') THEN
        CREATE TYPE work_order_status_enum AS ENUM (
            'DRAFT',
            'QUOTE',
            'SENT',
            'ACCEPTED',
            'SCHEDULED',
            'IN_PROGRESS',
            'COMPLETED',
            'CANCELLED',
            'INVOICED'
        );
        \echo '✅ Created work_order_status_enum';
    ELSE
        \echo '⏭️  work_order_status_enum already exists';
    END IF;
END $$;

-- Add missing enum values (PostgreSQL 9.1+)
DO $$ 
BEGIN
    -- Add DRAFT if missing
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'DRAFT' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'DRAFT';
        \echo '✅ Added DRAFT to work_order_status_enum';
    END IF;
    
    -- Add QUOTE if missing
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'QUOTE' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'QUOTE';
        \echo '✅ Added QUOTE to work_order_status_enum';
    END IF;
    
    -- Add SENT if missing
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SENT' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'SENT';
        \echo '✅ Added SENT to work_order_status_enum';
    END IF;
    
    -- Add ACCEPTED if missing
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ACCEPTED' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'ACCEPTED';
        \echo '✅ Added ACCEPTED to work_order_status_enum';
    END IF;
    
    -- Add SCHEDULED if missing
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SCHEDULED' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'SCHEDULED';
        \echo '✅ Added SCHEDULED to work_order_status_enum';
    END IF;
    
    -- Add IN_PROGRESS if missing
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'IN_PROGRESS' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'IN_PROGRESS';
        \echo '✅ Added IN_PROGRESS to work_order_status_enum';
    END IF;
    
    -- Add COMPLETED if missing
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'COMPLETED' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'COMPLETED';
        \echo '✅ Added COMPLETED to work_order_status_enum';
    END IF;
    
    -- Add CANCELLED if missing
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CANCELLED' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'CANCELLED';
        \echo '✅ Added CANCELLED to work_order_status_enum';
    END IF;
    
    -- Add INVOICED if missing
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'INVOICED' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'INVOICED';
        \echo '✅ Added INVOICED to work_order_status_enum';
    END IF;
END $$;

-- Ensure work_orders.status uses the enum
DO $$ 
BEGIN
    -- Check if status column exists and what type it is
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'work_orders' 
          AND column_name = 'status'
          AND data_type != 'USER-DEFINED'
    ) THEN
        -- Convert text to enum
        ALTER TABLE work_orders 
        ALTER COLUMN status TYPE work_order_status_enum 
        USING status::work_order_status_enum;
        
        \echo '✅ Converted work_orders.status to enum type';
    ELSE
        \echo '⏭️  work_orders.status already using enum type';
    END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_company_id ON work_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_customer_id ON work_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_at ON work_orders(created_at);

\echo '✅ Added indexes to work_orders table'
\echo ''

-- ========================================
-- PRIORITY 3: FIX EMPLOYEES TABLE
-- ========================================
\echo 'PRIORITY 3: Fixing employees table...'

-- Create employee_status_enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_status_enum') THEN
        CREATE TYPE employee_status_enum AS ENUM (
            'ACTIVE',
            'INACTIVE',
            'TERMINATED',
            'ON_LEAVE',
            'SUSPENDED'
        );
        \echo '✅ Created employee_status_enum';
    ELSE
        \echo '⏭️  employee_status_enum already exists';
    END IF;
END $$;

-- Convert employees.status to enum if it's text
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' 
          AND column_name = 'status'
          AND data_type = 'text'
    ) THEN
        -- First, normalize any existing values
        UPDATE employees 
        SET status = UPPER(status)
        WHERE status IS NOT NULL;
        
        -- Convert to enum
        ALTER TABLE employees 
        ALTER COLUMN status TYPE employee_status_enum 
        USING status::employee_status_enum;
        
        \echo '✅ Converted employees.status to enum type';
    ELSE
        \echo '⏭️  employees.status already using enum type or does not exist';
    END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);

\echo '✅ Added indexes to employees table'
\echo ''

-- ========================================
-- PRIORITY 4: CREATE MISSING VIEWS
-- ========================================
\echo 'PRIORITY 4: Creating compatibility views...'

-- Create or replace settings view that points to company_settings
CREATE OR REPLACE VIEW settings AS
SELECT 
    id,
    company_id,
    created_at,
    updated_at,
    -- Map company_settings columns to expected settings columns
    default_tax_rate as tax_rate,
    invoice_terms,
    auto_invoice,
    require_signatures,
    allow_online_payments,
    emergency_rate_multiplier,
    travel_charge_per_mile,
    minimum_travel_charge,
    cancellation_fee,
    transparency_mode
FROM company_settings;

\echo '✅ Created settings view (maps to company_settings)'
\echo ''

-- ========================================
-- COMMIT AND VERIFY
-- ========================================
\echo '=== VERIFYING FIXES ==='
\echo ''

-- Verify profiles table
\echo 'Profiles table columns:'
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('status', 'user_id', 'email', 'full_name')
ORDER BY column_name;

-- Verify work_orders enum
\echo ''
\echo 'Work orders status enum values:'
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'work_order_status_enum'::regtype 
ORDER BY enumsortorder;

-- Verify employees enum
\echo ''
\echo 'Employees status enum values:'
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'employee_status_enum'::regtype 
ORDER BY enumsortorder;

\echo ''
\echo '=== FIXES COMPLETE ==='
\echo ''
\echo 'Next steps:'
\echo '1. Test dashboard queries'
\echo '2. Check logs.md for remaining errors'
\echo '3. Run DIAGNOSTIC_SCHEMA_CHECK.sql to verify'
\echo '4. Update frontend code if needed (see FRONTEND_FIXES.md)'

COMMIT;

