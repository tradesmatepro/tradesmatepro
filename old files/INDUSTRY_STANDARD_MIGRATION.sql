-- =====================================================
-- INDUSTRY STANDARD MIGRATION: USERS + PROFILES
-- Implements Jobber/Titan/Housecall pattern
-- =====================================================

BEGIN;

-- =====================================================
-- STEP 1: BACKUP CURRENT DATA
-- =====================================================

-- Create backup tables
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;
CREATE TABLE IF NOT EXISTS profiles_backup AS SELECT * FROM profiles;

-- =====================================================
-- STEP 2: RESTRUCTURE USERS TABLE (PRIMARY BUSINESS DATA)
-- =====================================================

-- Drop existing users table constraints temporarily
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_company_id_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_created_by_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_updated_by_fkey;

-- Recreate users table with industry standard structure
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    role text NOT NULL DEFAULT 'EMPLOYEE' CHECK (role IN ('OWNER', 'ADMIN', 'EMPLOYEE')),
    status user_status_enum NOT NULL DEFAULT 'ACTIVE',
    permissions jsonb DEFAULT '{}',
    last_login timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid,
    updated_by uuid
);

-- Add self-referencing foreign keys after table creation
ALTER TABLE users 
ADD CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id),
ADD CONSTRAINT users_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id);

-- =====================================================
-- STEP 3: RESTRUCTURE PROFILES TABLE (PERSONAL DATA EXTENSION)
-- =====================================================

-- Drop existing profiles table
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name text,
    last_name text,
    full_name text,
    phone text,
    avatar_url text,
    profile_picture_url text,
    settings jsonb DEFAULT '{}',
    preferences jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- STEP 4: MIGRATE DATA FROM BACKUPS
-- =====================================================

-- Migrate users data (business data only)
INSERT INTO users (id, company_id, email, role, status, permissions, last_login, created_at, updated_at)
SELECT 
    id,
    company_id,
    email,
    CASE 
        WHEN role = 'owner' THEN 'OWNER'
        WHEN role = 'admin' THEN 'ADMIN'
        WHEN role = 'employee' THEN 'EMPLOYEE'
        ELSE 'EMPLOYEE'
    END as role,
    CASE 
        WHEN status = 'ACTIVE' THEN 'ACTIVE'::user_status_enum
        ELSE 'INACTIVE'::user_status_enum
    END as status,
    COALESCE(settings, '{}'),
    last_login,
    created_at,
    updated_at
FROM users_backup
WHERE email IS NOT NULL;

-- Migrate profiles data (personal data only)
-- First, we need to link auth.users to business users via email
INSERT INTO profiles (id, user_id, first_name, last_name, full_name, phone, avatar_url, profile_picture_url, settings, preferences, created_at, updated_at)
SELECT 
    pb.id,  -- auth.users.id from profiles_backup
    u.id,   -- business users.id
    SPLIT_PART(pb.full_name, ' ', 1) as first_name,
    CASE 
        WHEN array_length(string_to_array(pb.full_name, ' '), 1) > 1 
        THEN array_to_string(string_to_array(pb.full_name, ' ')[2:], ' ')
        ELSE ''
    END as last_name,
    pb.full_name,
    pb.phone,
    pb.avatar_url,
    ub.profile_picture_url,
    COALESCE(pb.settings, '{}'),
    COALESCE(ub.preferences, '{}'),
    pb.created_at,
    pb.updated_at
FROM profiles_backup pb
JOIN users u ON pb.email = u.email
LEFT JOIN users_backup ub ON pb.email = ub.email;

-- =====================================================
-- STEP 5: UPDATE FOREIGN KEY REFERENCES
-- =====================================================

-- Update all tables that currently reference profiles.id to reference users.id
-- This is the key change for industry standard compliance

-- Update employees table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'user_id') THEN
        -- Drop existing constraint
        ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_user_id_fkey;
        
        -- Update references from profiles.id to users.id
        UPDATE employees e 
        SET user_id = u.id
        FROM users u
        JOIN profiles p ON p.user_id = u.id
        WHERE e.user_id = p.id;
        
        -- Add new constraint
        ALTER TABLE employees 
        ADD CONSTRAINT employees_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update created_by/updated_by references
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT table_name, column_name
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name IN ('created_by', 'updated_by')
        AND data_type = 'uuid'
        AND table_name != 'users'  -- Skip users table itself
    LOOP
        -- Drop existing constraint
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', 
                      rec.table_name, 
                      rec.table_name || '_' || rec.column_name || '_fkey');
        
        -- Update references from profiles.id to users.id
        EXECUTE format('
            UPDATE %I t 
            SET %I = u.id
            FROM users u
            JOIN profiles p ON p.user_id = u.id
            WHERE t.%I = p.id', 
            rec.table_name, rec.column_name, rec.column_name);
        
        -- Add new constraint
        EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES users(id)', 
                      rec.table_name, 
                      rec.table_name || '_' || rec.column_name || '_fkey',
                      rec.column_name);
    END LOOP;
END $$;

-- =====================================================
-- STEP 6: CREATE HELPER VIEWS FOR EASY QUERYING
-- =====================================================

-- Create a view that joins users + profiles for easy access
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    u.id as user_id,
    u.company_id,
    u.email,
    u.role,
    u.status,
    u.permissions,
    u.last_login,
    p.id as auth_user_id,
    p.first_name,
    p.last_name,
    p.full_name,
    p.phone,
    p.avatar_url,
    p.profile_picture_url,
    p.settings,
    p.preferences,
    u.created_at,
    u.updated_at
FROM users u
LEFT JOIN profiles p ON p.user_id = u.id;

-- =====================================================
-- STEP 7: VERIFICATION QUERIES
-- =====================================================

-- Verify migration success
SELECT 'MIGRATION_VERIFICATION' as check_type,
       'Users count: ' || COUNT(*) as result
FROM users;

SELECT 'MIGRATION_VERIFICATION' as check_type,
       'Profiles count: ' || COUNT(*) as result  
FROM profiles;

SELECT 'MIGRATION_VERIFICATION' as check_type,
       'Linked profiles: ' || COUNT(*) as result
FROM profiles p
JOIN users u ON p.user_id = u.id;

-- Check foreign key constraints
SELECT 'FK_VERIFICATION' as check_type,
       table_name || '.' || column_name || ' -> ' || referenced_table_name as result
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND kcu.referenced_table_name = 'users'
ORDER BY table_name, column_name;

COMMIT;

-- =====================================================
-- CLEANUP (Run after verification)
-- =====================================================
-- DROP TABLE users_backup;
-- DROP TABLE profiles_backup;
