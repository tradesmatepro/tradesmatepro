-- Fix user_role_enum to match the locked schema
-- Based on APP Schemas\Locked\MASTER_DATABASE_SCHEMA_LOCKED.md

-- Add all missing role values to user_role_enum
DO $$
BEGIN
    -- Add owner if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'owner' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        ALTER TYPE user_role_enum ADD VALUE 'owner';
        RAISE NOTICE 'Added owner to user_role_enum';
    END IF;

    -- Add admin if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'admin' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        ALTER TYPE user_role_enum ADD VALUE 'admin';
        RAISE NOTICE 'Added admin to user_role_enum';
    END IF;

    -- Add manager if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'manager' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        ALTER TYPE user_role_enum ADD VALUE 'manager';
        RAISE NOTICE 'Added manager to user_role_enum';
    END IF;

    -- Add dispatcher if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'dispatcher' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        ALTER TYPE user_role_enum ADD VALUE 'dispatcher';
        RAISE NOTICE 'Added dispatcher to user_role_enum';
    END IF;

    -- Add supervisor if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'supervisor' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        ALTER TYPE user_role_enum ADD VALUE 'supervisor';
        RAISE NOTICE 'Added supervisor to user_role_enum';
    END IF;

    -- Add lead_technician if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'lead_technician' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        ALTER TYPE user_role_enum ADD VALUE 'lead_technician';
        RAISE NOTICE 'Added lead_technician to user_role_enum';
    END IF;

    -- Add apprentice if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'apprentice' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        ALTER TYPE user_role_enum ADD VALUE 'apprentice';
        RAISE NOTICE 'Added apprentice to user_role_enum';
    END IF;

    -- Add helper if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'helper' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        ALTER TYPE user_role_enum ADD VALUE 'helper';
        RAISE NOTICE 'Added helper to user_role_enum';
    END IF;

    -- Add accountant if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'accountant' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        ALTER TYPE user_role_enum ADD VALUE 'accountant';
        RAISE NOTICE 'Added accountant to user_role_enum';
    END IF;

    -- Add sales_rep if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'sales_rep' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        ALTER TYPE user_role_enum ADD VALUE 'sales_rep';
        RAISE NOTICE 'Added sales_rep to user_role_enum';
    END IF;

    -- Add customer_service if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'customer_service' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        ALTER TYPE user_role_enum ADD VALUE 'customer_service';
        RAISE NOTICE 'Added customer_service to user_role_enum';
    END IF;

    -- Add customer_portal if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'customer_portal' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        ALTER TYPE user_role_enum ADD VALUE 'customer_portal';
        RAISE NOTICE 'Added customer_portal to user_role_enum';
    END IF;

    -- Add vendor_portal if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'vendor_portal' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
    ) THEN
        ALTER TYPE user_role_enum ADD VALUE 'vendor_portal';
        RAISE NOTICE 'Added vendor_portal to user_role_enum';
    END IF;

END $$;

-- Verify all enum values are present
SELECT 'user_role_enum complete values:' as info, enumlabel
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role_enum')
ORDER BY enumsortorder;
