-- ========================================
-- UNDO BANDAID - DROP WRONG TABLES
-- Remove tables that shouldn't exist
-- ========================================

BEGIN;

-- Drop the bandaid tables I created
DROP TABLE IF EXISTS service_rates CASCADE;
DROP TABLE IF EXISTS pricing_rules CASCADE;
DROP TABLE IF EXISTS tool_preferences CASCADE;

-- Note: NOT dropping employees - that's a real table from DEPLOY_MASTER_SCHEMA.sql

COMMIT;

SELECT '✅ Bandaid tables removed!' as result;
