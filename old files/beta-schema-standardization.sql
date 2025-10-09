-- =========================================
-- BETA SCHEMA STANDARDIZATION
-- Remove bandaids, standardize to industry patterns
-- No RLS - Beta development only
-- =========================================

BEGIN;

-- =========================================
-- 1. DROP ALL LEGACY/BANDAID VIEWS
-- =========================================

DROP VIEW IF EXISTS user_profiles;
DROP VIEW IF EXISTS quotes_v;
DROP VIEW IF EXISTS jobs_v;
DROP VIEW IF EXISTS quotes_compat_v;
DROP VIEW IF EXISTS quote_items_compat_v;

-- =========================================
-- 2. STANDARDIZE ROLES (LOWERCASE ONLY)
-- =========================================

-- Check if user_role_enum exists, create if not
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM (
            'owner',
            'admin', 
            'manager',
            'dispatcher',
            'supervisor',
            'lead_technician',
            'technician',
            'apprentice',
            'helper',
            'accountant',
            'sales_rep',
            'customer_service',
            'customer_portal',
            'vendor_portal',
            'app_owner',
            'employee'
        );
    END IF;
END $$;

-- Check if user_status_enum exists, create if not
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status_enum') THEN
        CREATE TYPE user_status_enum AS ENUM (
            'active',
            'inactive',
            'pending',
            'suspended'
        );
    END IF;
END $$;

-- =========================================
-- 3. ENSURE USERS TABLE MATCHES STANDARD
-- =========================================

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL DEFAULT 'technician',
    status user_status_enum NOT NULL DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    UNIQUE(auth_user_id),
    UNIQUE(company_id, auth_user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- =========================================
-- 4. ENSURE PROFILES TABLE MATCHES STANDARD
-- =========================================

CREATE TABLE IF NOT EXISTS profiles (
    user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name text,
    last_name text,
    phone text,
    avatar_url text,
    preferences jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(first_name, last_name);

-- =========================================
-- 5. HELPER FUNCTIONS FOR USER CREATION
-- =========================================

-- Function to get user by auth_user_id (for authentication)
CREATE OR REPLACE FUNCTION get_user_by_auth_id(auth_id uuid)
RETURNS TABLE (
    user_id uuid,
    company_id uuid,
    role user_role_enum,
    status user_status_enum,
    first_name text,
    last_name text,
    phone text,
    avatar_url text,
    company_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.company_id,
        u.role,
        u.status,
        p.first_name,
        p.last_name,
        p.phone,
        p.avatar_url,
        c.name as company_name
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    LEFT JOIN companies c ON u.company_id = c.id
    WHERE u.auth_user_id = auth_id
    AND u.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function to create complete user (users + profiles)
CREATE OR REPLACE FUNCTION create_complete_user(
    p_auth_user_id uuid,
    p_company_id uuid,
    p_role user_role_enum DEFAULT 'technician',
    p_first_name text DEFAULT NULL,
    p_last_name text DEFAULT NULL,
    p_phone text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Insert into users table
    INSERT INTO users (auth_user_id, company_id, role, status)
    VALUES (p_auth_user_id, p_company_id, p_role, 'active')
    RETURNING id INTO new_user_id;
    
    -- Insert into profiles table
    INSERT INTO profiles (user_id, first_name, last_name, phone)
    VALUES (new_user_id, p_first_name, p_last_name, p_phone);
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- 6. UPDATE TRIGGERS FOR TIMESTAMPS
-- =========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add triggers for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- 7. VALIDATION AND CLEANUP
-- =========================================

-- Ensure all existing users have profiles
INSERT INTO profiles (user_id, first_name, last_name)
SELECT u.id, 'Unknown', 'User'
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- =========================================
-- 8. REFRESH SCHEMA CACHE
-- =========================================

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

COMMIT;

-- =========================================
-- VERIFICATION QUERIES
-- =========================================

-- Check tables exist
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'companies' as table_name, COUNT(*) as record_count FROM companies;

-- Check enums
SELECT enumlabel as role_values FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
ORDER BY enumsortorder;

-- Test helper function
SELECT * FROM get_user_by_auth_id('268b99b5-907d-4b48-ad0e-92cdd4ac388a'::uuid);

-- Success message
SELECT '✅ Beta schema standardization complete!' as status;
