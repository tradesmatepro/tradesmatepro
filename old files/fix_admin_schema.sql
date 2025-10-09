-- Fix Admin Dashboard Schema Issues
-- This will be deployed using the enhanced deployer system

-- Phase 1: Add APP_OWNER to user_role_enum
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'APP_OWNER' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        ALTER TYPE user_role_enum ADD VALUE 'APP_OWNER';
    END IF;
END $$;

-- Phase 2: Fix foreign key relationship between users and profiles
-- Drop existing constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Add correct foreign key constraint
-- profiles.user_id should reference users.id (not auth.users.id)
ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Phase 3: Verify the constraint was created correctly
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_user_id_fkey' 
        AND table_name = 'profiles'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        RAISE NOTICE 'Foreign key constraint profiles_user_id_fkey created successfully';
    ELSE
        RAISE EXCEPTION 'Failed to create foreign key constraint profiles_user_id_fkey';
    END IF;
END $$;
