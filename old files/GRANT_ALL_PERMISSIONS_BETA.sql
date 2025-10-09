-- ===============================================
-- GRANT ALL PERMISSIONS FOR BETA
-- Based on GPT's recommendation from logs.md
-- Ensures authenticated role has full access to all tables
-- ===============================================

-- Grant full CRUD permissions to all existing tables
DO $$
DECLARE
    t RECORD;
BEGIN
    FOR t IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated;', t.tablename);
        RAISE NOTICE 'Granted permissions on table: %', t.tablename;
    END LOOP;
END$$;

-- Grant sequence permissions (for auto-incrementing IDs)
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant specific permissions for the tables causing 403 errors
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_service_agreements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customer_communications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON work_orders TO authenticated;

-- Grant permissions on any views that might exist
DO $$
DECLARE
    v RECORD;
BEGIN
    FOR v IN
        SELECT viewname
        FROM pg_views
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('GRANT SELECT ON public.%I TO authenticated;', v.viewname);
        RAISE NOTICE 'Granted SELECT on view: %', v.viewname;
    END LOOP;
END$$;

-- Verification queries
SELECT 'PERMISSIONS GRANTED' as status;

-- Show all tables and their permissions
SELECT 
    schemaname,
    tablename,
    'authenticated' as role,
    'SELECT, INSERT, UPDATE, DELETE' as permissions
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ===============================================
-- NOTES:
-- 1. This grants full CRUD to authenticated role on ALL tables
-- 2. Run this after any new table creation/migration
-- 3. For production, use more restrictive permissions
-- 4. This should resolve all 403 Forbidden errors in beta
-- ===============================================
