-- MANUAL ONBOARDING FIX
-- Copy and paste this into Supabase SQL Editor

-- 1. Add missing columns to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS industry_tags TEXT[];

-- 2. Add missing columns to company_settings table  
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
ADD COLUMN IF NOT EXISTS onboarding_progress JSONB DEFAULT '{"current_step": 1, "completed_steps": [], "started_at": null, "completed_at": null, "skipped": false, "steps": {}}'::jsonb,
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 3. Clean up duplicate company_settings records
WITH ranked_settings AS (
    SELECT 
        id,
        company_id,
        ROW_NUMBER() OVER (
            PARTITION BY company_id 
            ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
        ) as rn
    FROM company_settings
)
DELETE FROM company_settings 
WHERE id IN (
    SELECT id 
    FROM ranked_settings 
    WHERE rn > 1
);

-- 4. Add unique constraint
ALTER TABLE company_settings 
ADD CONSTRAINT IF NOT EXISTS company_settings_company_id_unique UNIQUE (company_id);

-- 5. Update display names
UPDATE company_settings 
SET display_name = c.name || ' Settings'
FROM companies c 
WHERE company_settings.company_id = c.id 
AND company_settings.display_name IS NULL;

-- 6. Verification
SELECT 
    'COMPANIES' as table_name,
    COUNT(*) as count
FROM companies
UNION ALL
SELECT 
    'COMPANY_SETTINGS' as table_name,
    COUNT(*) as count
FROM company_settings
UNION ALL
SELECT 
    'DUPLICATES' as table_name,
    COUNT(*) as count
FROM (
    SELECT company_id
    FROM company_settings 
    GROUP BY company_id 
    HAVING COUNT(*) > 1
) duplicates;
