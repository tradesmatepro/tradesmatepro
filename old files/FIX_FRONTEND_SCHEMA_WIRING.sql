-- =========================================
-- FRONTEND SCHEMA WIRING FIXES
-- Fix mismatches between frontend and deployed schema
-- =========================================

-- The frontend is expecting a 'user_profiles' view that doesn't exist
-- and some tables have different structures than expected

BEGIN;

-- =========================================
-- CREATE MISSING VIEWS FOR FRONTEND
-- =========================================

-- Create user_profiles view that frontend expects
-- This joins users + profiles tables as expected by frontend code
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    u.id as user_id,
    u.auth_user_id,
    u.company_id,
    u.role,
    u.status,
    u.created_at,
    u.updated_at,
    
    -- Profile information
    p.first_name,
    p.last_name,
    p.first_name || ' ' || p.last_name as full_name,
    p.phone,
    p.avatar_url,
    p.preferences,
    
    -- Get email from auth.users (if accessible) or construct from profile
    COALESCE(
        (SELECT email FROM auth.users WHERE id = u.auth_user_id),
        p.first_name || '.' || p.last_name || '@company.local'
    ) as email

FROM users u
LEFT JOIN profiles p ON u.id = p.user_id;

-- Create companies view with additional fields frontend expects
CREATE OR REPLACE VIEW companies_extended AS
SELECT 
    c.*,
    cs.business_hours,
    cs.default_tax_rate,
    cs.invoice_terms,
    cs.auto_invoice,
    cs.require_signatures,
    cs.allow_online_payments,
    cs.emergency_rate_multiplier,
    cs.travel_charge_per_mile,
    cs.minimum_travel_charge,
    cs.cancellation_fee,
    cs.transparency_mode
FROM companies c
LEFT JOIN company_settings cs ON c.id = cs.company_id;

-- =========================================
-- FIX PROFILES TABLE STRUCTURE
-- =========================================

-- The admin dashboard expects profiles to have email and role fields
-- But our schema has these in the users table
-- Add computed columns to profiles for backward compatibility

-- Add email column to profiles (computed from auth.users)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Add role column to profiles (computed from users)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role user_role_enum;
    END IF;
END $$;

-- Add company_id column to profiles (computed from users)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'company_id') THEN
        ALTER TABLE profiles ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;
END $$;

-- Create trigger to sync profiles with users data
CREATE OR REPLACE FUNCTION sync_profile_from_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Update profile when user is updated
    IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'users' THEN
        UPDATE profiles 
        SET 
            role = NEW.role,
            company_id = NEW.company_id,
            email = COALESCE(
                (SELECT email FROM auth.users WHERE id = NEW.auth_user_id),
                first_name || '.' || last_name || '@company.local'
            )
        WHERE user_id = NEW.id;
        RETURN NEW;
    END IF;
    
    -- Update profile when profile is updated
    IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'profiles' THEN
        -- Sync email and role from users table
        SELECT u.role, u.company_id INTO NEW.role, NEW.company_id
        FROM users u WHERE u.id = NEW.user_id;
        
        NEW.email = COALESCE(
            (SELECT email FROM auth.users au JOIN users u ON au.id = u.auth_user_id WHERE u.id = NEW.user_id),
            NEW.first_name || '.' || NEW.last_name || '@company.local'
        );
        RETURN NEW;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply sync triggers
DROP TRIGGER IF EXISTS trg_sync_profile_from_user ON users;
CREATE TRIGGER trg_sync_profile_from_user
    AFTER UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION sync_profile_from_user();

DROP TRIGGER IF EXISTS trg_sync_profile_data ON profiles;
CREATE TRIGGER trg_sync_profile_data
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION sync_profile_from_user();

-- =========================================
-- SYNC EXISTING DATA
-- =========================================

-- Sync existing profiles with users data
UPDATE profiles 
SET 
    role = u.role,
    company_id = u.company_id,
    email = COALESCE(
        (SELECT email FROM auth.users WHERE id = u.auth_user_id),
        profiles.first_name || '.' || profiles.last_name || '@company.local'
    )
FROM users u 
WHERE profiles.user_id = u.id;

-- =========================================
-- CREATE ADDITIONAL VIEWS FOR COMPATIBILITY
-- =========================================

-- Enhanced work orders view that frontend expects
CREATE OR REPLACE VIEW work_orders_extended AS
SELECT 
    wo.*,
    -- Customer info
    c.customer_number,
    CASE 
        WHEN c.company_name IS NOT NULL THEN c.company_name
        ELSE c.first_name || ' ' || c.last_name
    END AS customer_name,
    c.email as customer_email,
    c.phone as customer_phone,
    
    -- Service address
    ca.address_line1,
    ca.address_line2,
    ca.city,
    ca.state_province,
    ca.postal_code,
    ca.address_line1 || COALESCE(', ' || ca.address_line2, '') || ', ' || 
    ca.city || ', ' || ca.state_province || ' ' || ca.postal_code AS full_address,
    
    -- Service info
    sc.name as service_category_name,
    st.name as service_type_name,
    
    -- Assigned technician
    up.full_name as assigned_technician_name,
    up.role as technician_role

FROM work_orders wo
LEFT JOIN customers c ON wo.customer_id = c.id
LEFT JOIN customer_addresses ca ON wo.customer_address_id = ca.id
LEFT JOIN service_categories sc ON wo.service_category_id = sc.id
LEFT JOIN service_types st ON wo.service_type_id = st.id
LEFT JOIN user_profiles up ON wo.assigned_to = up.user_id;

-- Customers with work order counts
CREATE OR REPLACE VIEW customers_extended AS
SELECT 
    c.*,
    -- Primary address
    ca.address_line1,
    ca.address_line2,
    ca.city,
    ca.state_province,
    ca.postal_code,
    ca.address_line1 || ', ' || ca.city || ', ' || ca.state_province AS primary_address,
    
    -- Work order metrics
    COUNT(wo.id) as total_work_orders,
    COUNT(CASE WHEN wo.status = 'completed' THEN 1 END) as completed_work_orders,
    COUNT(CASE WHEN wo.status IN ('scheduled', 'in_progress') THEN 1 END) as active_work_orders,
    
    -- Financial metrics
    COALESCE(SUM(wo.total_amount), 0) as total_work_value,
    MAX(wo.created_at) as last_service_date

FROM customers c
LEFT JOIN customer_addresses ca ON c.id = ca.customer_id AND ca.is_primary = true
LEFT JOIN work_orders wo ON c.id = wo.customer_id
GROUP BY c.id, ca.address_line1, ca.address_line2, ca.city, ca.state_province, ca.postal_code;

-- =========================================
-- CREATE COMPATIBILITY FUNCTIONS
-- =========================================

-- Function to get user by auth_user_id (for frontend authentication)
CREATE OR REPLACE FUNCTION get_user_by_auth_id(auth_id UUID)
RETURNS TABLE (
    user_id UUID,
    company_id UUID,
    role user_role_enum,
    status employee_status_enum,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.user_id,
        up.company_id,
        up.role,
        up.status,
        up.first_name,
        up.last_name,
        up.full_name,
        up.email,
        up.phone,
        up.avatar_url
    FROM user_profiles up
    WHERE up.auth_user_id = auth_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create user with profile (for onboarding)
CREATE OR REPLACE FUNCTION create_user_with_profile(
    p_auth_user_id UUID,
    p_company_id UUID,
    p_role user_role_enum,
    p_first_name TEXT,
    p_last_name TEXT,
    p_phone TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Create user record
    INSERT INTO users (auth_user_id, company_id, role, status)
    VALUES (p_auth_user_id, p_company_id, p_role, 'active')
    RETURNING id INTO new_user_id;
    
    -- Create profile record
    INSERT INTO profiles (user_id, first_name, last_name, phone, avatar_url)
    VALUES (new_user_id, p_first_name, p_last_name, p_phone, p_avatar_url);
    
    -- Create employee record if role is employee-related
    IF p_role IN ('technician', 'lead_technician', 'supervisor', 'manager') THEN
        INSERT INTO employees (company_id, user_id, employee_number, job_title, hire_date)
        VALUES (
            p_company_id, 
            new_user_id, 
            generate_smart_reference_number(p_company_id, 'employee', 'EMP'),
            CASE p_role
                WHEN 'technician' THEN 'Technician'
                WHEN 'lead_technician' THEN 'Lead Technician'
                WHEN 'supervisor' THEN 'Supervisor'
                WHEN 'manager' THEN 'Manager'
                ELSE 'Employee'
            END,
            CURRENT_DATE
        );
    END IF;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- =========================================
-- VERIFICATION QUERIES
-- =========================================

DO $$
BEGIN
    RAISE NOTICE '🎉 FRONTEND SCHEMA WIRING FIXES COMPLETE!';
    RAISE NOTICE '✅ Created user_profiles view for frontend compatibility';
    RAISE NOTICE '✅ Added missing columns to profiles table';
    RAISE NOTICE '✅ Created sync triggers for data consistency';
    RAISE NOTICE '✅ Created extended views for enhanced functionality';
    RAISE NOTICE '✅ Added compatibility functions for authentication';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Frontend should now work with deployed schema!';
    RAISE NOTICE '📊 Views created: user_profiles, companies_extended, work_orders_extended, customers_extended';
    RAISE NOTICE '🔄 Triggers: Profile sync with users table';
    RAISE NOTICE '⚙️ Functions: get_user_by_auth_id, create_user_with_profile';
END $$;
