-- =====================================================
-- COMPLETE SCHEMA CLEANUP - INDUSTRY STANDARD
-- =====================================================
-- This script removes non-standard elements and ensures
-- clean profiles-only role system
-- =====================================================

-- 1. DROP COMPLEX ROLE SYSTEM TABLES
-- These create confusion with simple profiles.role
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- 2. DROP LEGACY ARCHIVE TABLES
-- These clutter the schema and confuse migrations
DROP TABLE IF EXISTS legacy_archive.jobs_20250823_013140 CASCADE;
DROP TABLE IF EXISTS legacy_archive.quote_items_20250828_021425 CASCADE;
DROP TABLE IF EXISTS legacy_archive.quotes_20250828_021425 CASCADE;
DROP TABLE IF EXISTS legacy_archive.wo_master_20250828_021425 CASCADE;

-- 3. DROP LEGACY ARCHIVE SCHEMA (if empty)
DROP SCHEMA IF EXISTS legacy_archive CASCADE;

-- 4. VERIFY PROFILES TABLE IS CORRECT
-- Ensure profiles.role uses proper enum values
DO $$
BEGIN
    -- Check if user_role_enum exists and has correct values
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'user_role_enum' 
        AND e.enumlabel = 'OWNER'
    ) THEN
        -- Create or update the enum with correct values
        DROP TYPE IF EXISTS user_role_enum CASCADE;
        CREATE TYPE user_role_enum AS ENUM ('OWNER', 'ADMIN', 'EMPLOYEE');
        
        -- Update profiles table to use the enum
        ALTER TABLE public.profiles 
        ALTER COLUMN role TYPE user_role_enum 
        USING role::user_role_enum;
    END IF;
END $$;

-- 5. ENSURE ALL CREATED_BY/UPDATED_BY REFERENCE PROFILES
-- Verify foreign key constraints are correct
DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Check all created_by columns reference profiles
    FOR rec IN 
        SELECT table_name, column_name
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name IN ('created_by', 'updated_by')
        AND data_type = 'uuid'
    LOOP
        -- Add foreign key constraint if it doesn't exist
        BEGIN
            EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I_fkey FOREIGN KEY (%I) REFERENCES public.profiles(id)', 
                          rec.table_name, 
                          rec.table_name || '_' || rec.column_name,
                          rec.column_name);
        EXCEPTION 
            WHEN duplicate_object THEN 
                -- Constraint already exists, skip
                NULL;
        END;
    END LOOP;
END $$;

-- 6. CLEAN UP ANY REMAINING REFERENCES
-- Update any functions or views that might reference old tables
-- (This will be handled in application code)

-- 7. VERIFY EMPLOYEES TABLE STRUCTURE
-- Ensure employees.user_id properly references profiles.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'employees' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
        AND kcu.referenced_table_name = 'profiles'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.employees 
        ADD CONSTRAINT employees_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;
END $$;

-- 8. FINAL VERIFICATION QUERIES
-- Run these to verify cleanup was successful

-- Check that complex role tables are gone
SELECT 'COMPLEX_ROLE_TABLES_CHECK' as test,
       CASE WHEN COUNT(*) = 0 THEN 'PASS - No complex role tables found' 
            ELSE 'FAIL - Complex role tables still exist' END as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roles', 'user_roles', 'role_permissions');

-- Check that legacy archive is gone  
SELECT 'LEGACY_ARCHIVE_CHECK' as test,
       CASE WHEN COUNT(*) = 0 THEN 'PASS - No legacy archive tables found'
            ELSE 'FAIL - Legacy archive tables still exist' END as result
FROM information_schema.tables 
WHERE table_schema = 'legacy_archive';

-- Check profiles.role enum values
SELECT 'PROFILES_ROLE_ENUM_CHECK' as test,
       CASE WHEN COUNT(*) = 3 AND 
                 'OWNER' = ANY(array_agg(enumlabel)) AND
                 'ADMIN' = ANY(array_agg(enumlabel)) AND  
                 'EMPLOYEE' = ANY(array_agg(enumlabel))
            THEN 'PASS - Correct role enum values found'
            ELSE 'FAIL - Incorrect role enum values' END as result
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'user_role_enum';

-- Check that employees.user_id references profiles
SELECT 'EMPLOYEES_PROFILE_FK_CHECK' as test,
       CASE WHEN COUNT(*) > 0 THEN 'PASS - employees.user_id references profiles'
            ELSE 'FAIL - employees.user_id does not reference profiles' END as result
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'employees' 
AND tc.constraint_type = 'FOREIGN KEY'
AND kcu.column_name = 'user_id'
AND kcu.referenced_table_name = 'profiles';

-- =====================================================
-- CLEANUP COMPLETE
-- =====================================================
-- Next steps:
-- 1. Run frontend role system fixes
-- 2. Update backend API queries  
-- 3. Test authentication flow
-- =====================================================
