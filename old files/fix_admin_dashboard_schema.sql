-- Fix Admin Dashboard Schema Issues
-- Run this directly in Supabase SQL Editor

-- 1. Add EMPLOYEE to user_role_enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'EMPLOYEE' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        ALTER TYPE user_role_enum ADD VALUE 'EMPLOYEE';
        RAISE NOTICE 'Added EMPLOYEE to user_role_enum';
    ELSE
        RAISE NOTICE 'EMPLOYEE already exists in user_role_enum';
    END IF;
END $$;

-- 2. Add created_by to companies table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='created_by') THEN
        ALTER TABLE companies ADD COLUMN created_by UUID REFERENCES users(id);
        RAISE NOTICE 'Added created_by column to companies table';
    ELSE
        RAISE NOTICE 'created_by column already exists in companies table';
    END IF;
END $$;

-- 3. Add email to profiles table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
        RAISE NOTICE 'Added email column to profiles table';
    ELSE
        RAISE NOTICE 'email column already exists in profiles table';
    END IF;
END $$;

-- 4. Add role to profiles table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE profiles ADD COLUMN role user_role_enum DEFAULT 'technician';
        RAISE NOTICE 'Added role column to profiles table';
    ELSE
        RAISE NOTICE 'role column already exists in profiles table';
    END IF;
END $$;

-- 5. Add company_id to profiles table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='company_id') THEN
        ALTER TABLE profiles ADD COLUMN company_id UUID REFERENCES companies(id);
        RAISE NOTICE 'Added company_id column to profiles table';
    ELSE
        RAISE NOTICE 'company_id column already exists in profiles table';
    END IF;
END $$;

-- 6. Fix foreign key relationship between users and profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 7. Verify the changes
SELECT 'Schema verification:' as info;

SELECT 'companies columns:' as table_info, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'companies' AND column_name IN ('created_by')
ORDER BY ordinal_position;

SELECT 'profiles columns:' as table_info, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name IN ('email', 'role', 'company_id')
ORDER BY ordinal_position;

SELECT 'user_role_enum values:' as enum_info, enumlabel
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
ORDER BY enumsortorder;
