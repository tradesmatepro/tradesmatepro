-- URGENT: Clean up duplicate company_settings records
-- Copy and paste this into your Supabase SQL Editor

-- Step 1: See the damage
SELECT 
    'DUPLICATE RECORDS FOUND' as issue,
    company_id,
    COUNT(*) as duplicate_count
FROM company_settings 
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'
GROUP BY company_id;

-- Step 2: Keep only the most recent record, delete the rest
WITH ranked_settings AS (
    SELECT 
        id,
        company_id,
        created_at,
        updated_at,
        ROW_NUMBER() OVER (
            PARTITION BY company_id 
            ORDER BY updated_at DESC, created_at DESC
        ) as rn
    FROM company_settings
    WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'
)
DELETE FROM company_settings 
WHERE id IN (
    SELECT id 
    FROM ranked_settings 
    WHERE rn > 1
);

-- Step 3: Add unique constraint to prevent future duplicates
ALTER TABLE company_settings 
ADD CONSTRAINT IF NOT EXISTS company_settings_company_id_unique 
UNIQUE (company_id);

-- Step 4: Verify cleanup
SELECT 
    'AFTER CLEANUP' as status,
    COUNT(*) as remaining_records
FROM company_settings 
WHERE company_id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';
