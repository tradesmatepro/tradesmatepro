-- CRITICAL ONBOARDING FIXES - Run in Supabase SQL Editor
-- Based on actual error logs from logs.md

-- 1. Fix companies table - add missing columns
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS industry_tags TEXT[];

-- 2. Fix company_settings table - add missing columns and constraints
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
ADD COLUMN IF NOT EXISTS onboarding_progress JSONB DEFAULT '{
  "current_step": 1,
  "completed_steps": [],
  "started_at": null,
  "completed_at": null,
  "skipped": false,
  "steps": {}
}'::jsonb;

-- 3. Add unique constraint to prevent duplicates (handle existing duplicates first)
DO $$
BEGIN
    -- Remove duplicate company_settings records (keep most recent)
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
    
    -- Add unique constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'company_settings_company_id_unique'
        AND table_name = 'company_settings'
    ) THEN
        ALTER TABLE company_settings 
        ADD CONSTRAINT company_settings_company_id_unique UNIQUE (company_id);
    END IF;
END $$;

-- 4. Ensure every company has a company_settings record
INSERT INTO company_settings (
    company_id,
    business_hours,
    default_tax_rate,
    invoice_terms,
    auto_invoice,
    require_signatures,
    allow_online_payments,
    emergency_rate_multiplier,
    travel_charge_per_mile,
    minimum_travel_charge,
    cancellation_fee,
    transparency_mode,
    timezone,
    onboarding_progress
)
SELECT 
    c.id,
    '{"monday": {"open": "08:00", "close": "17:00"}}'::jsonb,
    0.0000,
    'NET30',
    FALSE,
    TRUE,
    TRUE,
    1.50,
    0.65,
    25.00,
    50.00,
    TRUE,
    'America/New_York',
    '{
      "current_step": 1,
      "completed_steps": [],
      "started_at": null,
      "completed_at": null,
      "skipped": false,
      "steps": {}
    }'::jsonb
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM company_settings cs WHERE cs.company_id = c.id
)
ON CONFLICT (company_id) DO NOTHING;

-- 5. Add company_settings display name for human readability
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update display names based on company names
UPDATE company_settings 
SET display_name = c.name || ' Settings'
FROM companies c 
WHERE company_settings.company_id = c.id 
AND company_settings.display_name IS NULL;

-- 6. Create service categories if missing
INSERT INTO service_categories (
    company_id,
    name,
    description,
    color,
    is_active
)
SELECT 
    c.id,
    'General Contracting',
    'General construction and contracting services',
    '#6b7280',
    true
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM service_categories sc WHERE sc.company_id = c.id
)
ON CONFLICT DO NOTHING;

-- 7. Verification queries
SELECT 
    'VERIFICATION RESULTS' as status,
    (SELECT COUNT(*) FROM companies) as total_companies,
    (SELECT COUNT(*) FROM company_settings) as total_settings,
    (SELECT COUNT(*) FROM service_categories) as total_categories;

-- Check for any remaining duplicates
SELECT 
    company_id,
    COUNT(*) as duplicate_count
FROM company_settings 
GROUP BY company_id 
HAVING COUNT(*) > 1;

-- Show sample data
SELECT 
    c.name as company_name,
    c.industry,
    cs.display_name,
    cs.timezone,
    cs.onboarding_progress->>'current_step' as current_step
FROM companies c
LEFT JOIN company_settings cs ON c.id = cs.company_id
LIMIT 5;
