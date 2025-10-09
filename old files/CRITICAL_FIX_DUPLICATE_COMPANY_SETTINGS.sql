-- CRITICAL FIX: Remove duplicate company_settings records and prevent future duplicates
-- This fixes the massive data leak where hundreds of duplicate records were created

-- 1. First, let's see what we're dealing with
SELECT 
    'BEFORE CLEANUP' as status,
    company_id,
    COUNT(*) as duplicate_count,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM company_settings 
GROUP BY company_id 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 2. Keep only the MOST RECENT record for each company_id (has latest data)
WITH ranked_settings AS (
    SELECT 
        id,
        company_id,
        ROW_NUMBER() OVER (
            PARTITION BY company_id 
            ORDER BY updated_at DESC, created_at DESC
        ) as rn
    FROM company_settings
),
records_to_delete AS (
    SELECT id 
    FROM ranked_settings 
    WHERE rn > 1
)
DELETE FROM company_settings 
WHERE id IN (SELECT id FROM records_to_delete);

-- 3. Add unique constraint to prevent future duplicates
ALTER TABLE company_settings 
DROP CONSTRAINT IF EXISTS company_settings_company_id_unique;

ALTER TABLE company_settings 
ADD CONSTRAINT company_settings_company_id_unique 
UNIQUE (company_id);

-- 4. Verify the fix
SELECT 
    'AFTER CLEANUP' as status,
    company_id,
    COUNT(*) as record_count,
    created_at,
    updated_at
FROM company_settings 
GROUP BY company_id, created_at, updated_at
ORDER BY company_id;

-- 5. Show total records removed
SELECT 
    'CLEANUP SUMMARY' as status,
    COUNT(*) as total_remaining_records
FROM company_settings;

-- 6. Create a function to safely upsert company_settings (for future use)
CREATE OR REPLACE FUNCTION safe_upsert_company_settings(
    p_company_id UUID,
    p_settings JSONB
) RETURNS UUID AS $$
DECLARE
    result_id UUID;
BEGIN
    -- Try to update first
    UPDATE company_settings 
    SET 
        business_hours = COALESCE((p_settings->>'business_hours')::JSONB, business_hours),
        default_tax_rate = COALESCE((p_settings->>'default_tax_rate')::NUMERIC, default_tax_rate),
        invoice_terms = COALESCE(p_settings->>'invoice_terms', invoice_terms),
        auto_invoice = COALESCE((p_settings->>'auto_invoice')::BOOLEAN, auto_invoice),
        require_signatures = COALESCE((p_settings->>'require_signatures')::BOOLEAN, require_signatures),
        allow_online_payments = COALESCE((p_settings->>'allow_online_payments')::BOOLEAN, allow_online_payments),
        emergency_rate_multiplier = COALESCE((p_settings->>'emergency_rate_multiplier')::NUMERIC, emergency_rate_multiplier),
        travel_charge_per_mile = COALESCE((p_settings->>'travel_charge_per_mile')::NUMERIC, travel_charge_per_mile),
        minimum_travel_charge = COALESCE((p_settings->>'minimum_travel_charge')::NUMERIC, minimum_travel_charge),
        cancellation_fee = COALESCE((p_settings->>'cancellation_fee')::NUMERIC, cancellation_fee),
        transparency_mode = COALESCE((p_settings->>'transparency_mode')::BOOLEAN, transparency_mode),
        onboarding_progress = COALESCE((p_settings->>'onboarding_progress')::JSONB, onboarding_progress),
        updated_at = NOW()
    WHERE company_id = p_company_id
    RETURNING id INTO result_id;
    
    -- If no rows were updated, insert a new record
    IF result_id IS NULL THEN
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
            onboarding_progress,
            created_at,
            updated_at
        ) VALUES (
            p_company_id,
            COALESCE((p_settings->>'business_hours')::JSONB, '{"monday": {"open": "08:00", "close": "17:00"}}'::JSONB),
            COALESCE((p_settings->>'default_tax_rate')::NUMERIC, 0.0000),
            COALESCE(p_settings->>'invoice_terms', 'NET30'),
            COALESCE((p_settings->>'auto_invoice')::BOOLEAN, FALSE),
            COALESCE((p_settings->>'require_signatures')::BOOLEAN, TRUE),
            COALESCE((p_settings->>'allow_online_payments')::BOOLEAN, TRUE),
            COALESCE((p_settings->>'emergency_rate_multiplier')::NUMERIC, 1.50),
            COALESCE((p_settings->>'travel_charge_per_mile')::NUMERIC, 0.65),
            COALESCE((p_settings->>'minimum_travel_charge')::NUMERIC, 25.00),
            COALESCE((p_settings->>'cancellation_fee')::NUMERIC, 50.00),
            COALESCE((p_settings->>'transparency_mode')::BOOLEAN, TRUE),
            COALESCE((p_settings->>'onboarding_progress')::JSONB, '{}'::JSONB),
            NOW(),
            NOW()
        )
        RETURNING id INTO result_id;
    END IF;
    
    RETURN result_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Test the function (optional)
-- SELECT safe_upsert_company_settings(
--     'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e'::UUID,
--     '{"default_tax_rate": "0.0875", "invoice_terms": "NET15"}'::JSONB
-- );

COMMIT;
