-- ONBOARDING DATABASE FIXES
-- Run this in Supabase SQL Editor

-- 1. Add missing onboarding_progress column
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS onboarding_progress JSONB DEFAULT '{
  "current_step": 1,
  "completed_steps": [],
  "started_at": null,
  "completed_at": null,
  "skipped": false,
  "steps": {}
}'::jsonb;

-- 2. Add unique constraint to prevent duplicates
ALTER TABLE company_settings 
ADD CONSTRAINT IF NOT EXISTS company_settings_company_id_unique 
UNIQUE (company_id);

-- 3. Clean up duplicate records (keep most recent)
WITH ranked_settings AS (
    SELECT 
        id,
        company_id,
        ROW_NUMBER() OVER (
            PARTITION BY company_id 
            ORDER BY updated_at DESC, created_at DESC
        ) as rn
    FROM company_settings
)
DELETE FROM company_settings 
WHERE id IN (
    SELECT id 
    FROM ranked_settings 
    WHERE rn > 1
);

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

-- 5. Verification
SELECT 
    'VERIFICATION' as status,
    COUNT(*) as total_companies,
    COUNT(cs.id) as companies_with_settings
FROM companies c
LEFT JOIN company_settings cs ON c.id = cs.company_id;
