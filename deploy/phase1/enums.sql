-- =========================================
-- PHASE 1: CORE FSM ENUMS
-- Add missing enum values for admin dashboard
-- =========================================

-- Add EMPLOYEE to user_role_enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'EMPLOYEE' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        ALTER TYPE user_role_enum ADD VALUE 'EMPLOYEE';
    END IF;
END $$;
