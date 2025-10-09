-- ========================================
-- TradeMate Pro - CRITICAL FIXES
-- ========================================
-- Run this in Supabase SQL Editor NOW
-- Fixes all 400 errors from logs.md
-- ========================================

-- ========================================
-- 1. FIX PROFILES TABLE
-- ========================================

-- Add status column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'status'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN status TEXT DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'));
        
        RAISE NOTICE '✅ Added status column to profiles';
    ELSE
        RAISE NOTICE '⏭️  status column already exists in profiles';
    END IF;
END $$;

-- Add user_id column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE profiles ADD COLUMN user_id UUID;
        
        -- Add foreign key constraint
        ALTER TABLE profiles 
        ADD CONSTRAINT fk_profiles_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        
        RAISE NOTICE '✅ Added user_id column to profiles';
    ELSE
        RAISE NOTICE '⏭️  user_id column already exists in profiles';
    END IF;
END $$;

-- Add email column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
        RAISE NOTICE '✅ Added email column to profiles';
    ELSE
        RAISE NOTICE '⏭️  email column already exists in profiles';
    END IF;
END $$;

-- Add full_name column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN full_name TEXT;
        
        -- Populate it
        UPDATE profiles 
        SET full_name = COALESCE(first_name || ' ' || last_name, first_name, last_name, 'Unknown User')
        WHERE full_name IS NULL;
        
        RAISE NOTICE '✅ Added full_name column to profiles';
    ELSE
        RAISE NOTICE '⏭️  full_name column already exists in profiles';
    END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ========================================
-- 2. FIX WORK_ORDERS STATUS ENUM
-- ========================================

-- Create enum if it doesn't exist
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
        RAISE NOTICE '✅ Created work_order_status_enum';
    ELSE
        RAISE NOTICE '⏭️  work_order_status_enum already exists';
    END IF;
END $$;

-- Add missing enum values
DO $$ 
BEGIN
    -- Add DRAFT
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'DRAFT' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'DRAFT';
        RAISE NOTICE '✅ Added DRAFT to work_order_status_enum';
    END IF;
    
    -- Add QUOTE
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'QUOTE' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'QUOTE';
        RAISE NOTICE '✅ Added QUOTE to work_order_status_enum';
    END IF;
    
    -- Add SENT
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SENT' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'SENT';
        RAISE NOTICE '✅ Added SENT to work_order_status_enum';
    END IF;
    
    -- Add ACCEPTED
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ACCEPTED' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'ACCEPTED';
        RAISE NOTICE '✅ Added ACCEPTED to work_order_status_enum';
    END IF;
    
    -- Add SCHEDULED
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SCHEDULED' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'SCHEDULED';
        RAISE NOTICE '✅ Added SCHEDULED to work_order_status_enum';
    END IF;
    
    -- Add IN_PROGRESS
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'IN_PROGRESS' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'IN_PROGRESS';
        RAISE NOTICE '✅ Added IN_PROGRESS to work_order_status_enum';
    END IF;
    
    -- Add COMPLETED
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'COMPLETED' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'COMPLETED';
        RAISE NOTICE '✅ Added COMPLETED to work_order_status_enum';
    END IF;
    
    -- Add CANCELLED
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CANCELLED' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'CANCELLED';
        RAISE NOTICE '✅ Added CANCELLED to work_order_status_enum';
    END IF;
    
    -- Add INVOICED
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'INVOICED' AND enumtypid = 'work_order_status_enum'::regtype) THEN
        ALTER TYPE work_order_status_enum ADD VALUE 'INVOICED';
        RAISE NOTICE '✅ Added INVOICED to work_order_status_enum';
    END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_company_id ON work_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_customer_id ON work_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_at ON work_orders(created_at);

-- ========================================
-- 3. FIX EMPLOYEES TABLE
-- ========================================

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
        RAISE NOTICE '✅ Created employee_status_enum';
    ELSE
        RAISE NOTICE '⏭️  employee_status_enum already exists';
    END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);

-- ========================================
-- 4. CREATE SETTINGS VIEW (Compatibility)
-- ========================================

-- Drop view if exists
DROP VIEW IF EXISTS settings;

-- Create view that maps company_settings to settings
CREATE OR REPLACE VIEW settings AS
SELECT 
    id,
    company_id,
    created_at,
    updated_at,
    -- Map company_settings columns to expected settings columns
    default_tax_rate as tax_rate,
    labor_rate as default_hourly_rate,
    overtime_multiplier,
    parts_markup as parts_markup_percent
FROM company_settings;

-- ========================================
-- VERIFICATION
-- ========================================

-- Show profiles columns
SELECT 'Profiles columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('status', 'user_id', 'email', 'full_name')
ORDER BY column_name;

-- Show work_orders enum values
SELECT 'Work orders status enum:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'work_order_status_enum'::regtype 
ORDER BY enumsortorder;

-- Show employees enum values
SELECT 'Employees status enum:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'employee_status_enum'::regtype 
ORDER BY enumsortorder;

-- Show settings view
SELECT 'Settings view created:' as info;
SELECT COUNT(*) as settings_view_exists
FROM information_schema.views
WHERE table_name = 'settings';

SELECT '✅ ALL FIXES APPLIED SUCCESSFULLY!' as status;

