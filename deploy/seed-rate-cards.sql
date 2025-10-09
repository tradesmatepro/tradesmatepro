-- ========================================
-- SEED DEFAULT RATE CARDS
-- ========================================
-- Creates default rate cards for companies that don't have one
-- Self-healing: Checks if table exists, checks if data exists
-- Idempotent: Safe to run multiple times
-- ========================================

-- Step 1: Verify rate_cards table exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'rate_cards'
    ) THEN
        RAISE EXCEPTION 'CRITICAL: rate_cards table does not exist in schema. Check MASTER_DATABASE_SCHEMA_LOCKED.md';
    END IF;
    
    RAISE NOTICE '✅ rate_cards table exists';
END $$;

-- Step 2: Verify rate_card_type_enum exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'rate_card_type_enum'
    ) THEN
        RAISE EXCEPTION 'CRITICAL: rate_card_type_enum does not exist. Check enums in locked schema.';
    END IF;
    
    RAISE NOTICE '✅ rate_card_type_enum exists';
END $$;

-- Step 3: Check current state
DO $$ 
DECLARE
    total_companies INTEGER;
    companies_with_rates INTEGER;
    companies_without_rates INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_companies FROM companies;
    SELECT COUNT(DISTINCT company_id) INTO companies_with_rates FROM rate_cards;
    companies_without_rates := total_companies - companies_with_rates;
    
    RAISE NOTICE '📊 Current state:';
    RAISE NOTICE '   Total companies: %', total_companies;
    RAISE NOTICE '   Companies with rate cards: %', companies_with_rates;
    RAISE NOTICE '   Companies without rate cards: %', companies_without_rates;
END $$;

-- Step 4: Insert default rate cards for companies without one
INSERT INTO rate_cards (
    company_id, 
    name, 
    description, 
    rate_type, 
    base_rate,
    overtime_multiplier,
    emergency_multiplier,
    weekend_multiplier,
    holiday_multiplier,
    effective_date,
    is_active
)
SELECT 
    c.id as company_id,
    'Standard Rates' as name,
    'Default hourly rates for labor' as description,
    'HOURLY'::rate_card_type_enum as rate_type,
    75.00 as base_rate,
    1.50 as overtime_multiplier,
    2.00 as emergency_multiplier,
    1.25 as weekend_multiplier,
    1.50 as holiday_multiplier,
    CURRENT_DATE as effective_date,
    true as is_active
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM rate_cards rc 
    WHERE rc.company_id = c.id
)
ON CONFLICT DO NOTHING;

-- Step 5: Report results
DO $$ 
DECLARE
    total_rate_cards INTEGER;
    active_rate_cards INTEGER;
    companies_covered INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_rate_cards FROM rate_cards;
    SELECT COUNT(*) INTO active_rate_cards FROM rate_cards WHERE is_active = true;
    SELECT COUNT(DISTINCT company_id) INTO companies_covered FROM rate_cards;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ DEPLOYMENT COMPLETE';
    RAISE NOTICE '📊 Final state:';
    RAISE NOTICE '   Total rate cards: %', total_rate_cards;
    RAISE NOTICE '   Active rate cards: %', active_rate_cards;
    RAISE NOTICE '   Companies with rate cards: %', companies_covered;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next steps:';
    RAISE NOTICE '   1. Restart frontend server';
    RAISE NOTICE '   2. Hard refresh browser (Ctrl+F5)';
    RAISE NOTICE '   3. Check console for "✅ Using rate_cards table"';
END $$;

-- Step 6: Verify data integrity
DO $$ 
DECLARE
    invalid_rates INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_rates 
    FROM rate_cards 
    WHERE base_rate <= 0 
       OR overtime_multiplier <= 0 
       OR emergency_multiplier <= 0;
    
    IF invalid_rates > 0 THEN
        RAISE WARNING 'Found % rate cards with invalid values (rates <= 0)', invalid_rates;
    ELSE
        RAISE NOTICE '✅ All rate cards have valid values';
    END IF;
END $$;

-- Step 7: Show sample data
SELECT 
    c.name as company_name,
    rc.name as rate_card_name,
    rc.base_rate,
    rc.overtime_multiplier,
    rc.emergency_multiplier,
    rc.is_active,
    rc.effective_date
FROM companies c
JOIN rate_cards rc ON rc.company_id = c.id
ORDER BY c.name, rc.effective_date DESC
LIMIT 10;

