-- Fix Onboarding Database Issues
-- This script adds the missing onboarding_progress column and ensures proper setup

-- 1. Add onboarding_progress column to company_settings if it doesn't exist
DO $$ 
BEGIN
    -- Check if column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_settings' 
        AND column_name = 'onboarding_progress'
    ) THEN
        -- Add the column
        ALTER TABLE company_settings 
        ADD COLUMN onboarding_progress JSONB DEFAULT '{
          "current_step": 1,
          "completed_steps": [],
          "started_at": null,
          "completed_at": null,
          "skipped": false,
          "steps": {
            "1": {"name": "Company Basics", "completed": false, "completed_at": null},
            "2": {"name": "Services & Pricing", "completed": false, "completed_at": null},
            "3": {"name": "Team Setup", "completed": false, "completed_at": null},
            "4": {"name": "Business Preferences", "completed": false, "completed_at": null},
            "5": {"name": "Financial Setup", "completed": false, "completed_at": null},
            "6": {"name": "Go Live", "completed": false, "completed_at": null}
          }
        }'::jsonb;
        
        RAISE NOTICE 'Added onboarding_progress column to company_settings';
    ELSE
        RAISE NOTICE 'onboarding_progress column already exists';
    END IF;
END $$;

-- 2. Ensure company_settings record exists for current user
INSERT INTO company_settings (company_id, onboarding_progress)
SELECT 
    c.id,
    '{
      "current_step": 1,
      "completed_steps": [],
      "started_at": null,
      "completed_at": null,
      "skipped": false,
      "steps": {
        "1": {"name": "Company Basics", "completed": false, "completed_at": null},
        "2": {"name": "Services & Pricing", "completed": false, "completed_at": null},
        "3": {"name": "Team Setup", "completed": false, "completed_at": null},
        "4": {"name": "Business Preferences", "completed": false, "completed_at": null},
        "5": {"name": "Financial Setup", "completed": false, "completed_at": null},
        "6": {"name": "Go Live", "completed": false, "completed_at": null}
      }
    }'::jsonb
FROM companies c
WHERE c.id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'
AND NOT EXISTS (
    SELECT 1 FROM company_settings cs WHERE cs.company_id = c.id
)
ON CONFLICT (company_id) DO NOTHING;

-- 3. Update existing company_settings records that don't have onboarding_progress
UPDATE company_settings 
SET onboarding_progress = '{
  "current_step": 1,
  "completed_steps": [],
  "started_at": null,
  "completed_at": null,
  "skipped": false,
  "steps": {
    "1": {"name": "Company Basics", "completed": false, "completed_at": null},
    "2": {"name": "Services & Pricing", "completed": false, "completed_at": null},
    "3": {"name": "Team Setup", "completed": false, "completed_at": null},
    "4": {"name": "Business Preferences", "completed": false, "completed_at": null},
    "5": {"name": "Financial Setup", "completed": false, "completed_at": null},
    "6": {"name": "Go Live", "completed": false, "completed_at": null}
  }
}'::jsonb
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'
AND (onboarding_progress IS NULL OR onboarding_progress = '{}'::jsonb);

-- 4. Show current company data for verification
SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    c.industry,
    c.address_line1 as address,
    c.city,
    c.state,
    cs.onboarding_progress
FROM companies c
LEFT JOIN company_settings cs ON c.id = cs.company_id
WHERE c.id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';
