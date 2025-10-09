-- =========================================
-- FIX QUOTE BUILDER ERRORS
-- =========================================
-- Based on actual schema analysis:
-- 1. rate_cards has 'active' not 'is_active'
-- 2. rate_cards missing effective_date, expiration_date
-- 3. employees table exists but query syntax is wrong
-- =========================================

BEGIN;

-- =========================================
-- STEP 1: FIX RATE_CARDS TABLE
-- =========================================
-- Frontend queries: is_active, effective_date, expiration_date
-- Actual schema: active (boolean)
-- Industry standard (Jobber/ServiceTitan): has effective/expiration dates

-- Rename 'active' to 'is_active' (industry standard)
ALTER TABLE rate_cards RENAME COLUMN active TO is_active;

-- Add effective_date and expiration_date (industry standard)
ALTER TABLE rate_cards ADD COLUMN IF NOT EXISTS effective_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE rate_cards ADD COLUMN IF NOT EXISTS expiration_date DATE DEFAULT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_rate_cards_active_dates 
ON rate_cards(company_id, is_active, effective_date, expiration_date) 
WHERE is_active = true;

-- =========================================
-- VERIFICATION
-- =========================================

DO $$
DECLARE
    rate_cards_columns TEXT[];
    has_is_active BOOLEAN;
    has_effective_date BOOLEAN;
    has_expiration_date BOOLEAN;
BEGIN
    -- Check rate_cards columns
    SELECT ARRAY_AGG(column_name::TEXT) INTO rate_cards_columns
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'rate_cards';
    
    has_is_active := 'is_active' = ANY(rate_cards_columns);
    has_effective_date := 'effective_date' = ANY(rate_cards_columns);
    has_expiration_date := 'expiration_date' = ANY(rate_cards_columns);
    
    IF has_is_active AND has_effective_date AND has_expiration_date THEN
        RAISE NOTICE '✅ rate_cards table fixed: is_active, effective_date, expiration_date columns exist';
    ELSE
        RAISE WARNING '⚠️ rate_cards table incomplete: is_active=%, effective_date=%, expiration_date=%', 
            has_is_active, has_effective_date, has_expiration_date;
    END IF;
    
    RAISE NOTICE '📊 rate_cards columns: %', rate_cards_columns;
END $$;

COMMIT;

-- =========================================
-- DEPLOYMENT SUMMARY
-- =========================================
-- ✅ Renamed rate_cards.active → is_active (industry standard)
-- ✅ Added rate_cards.effective_date (industry standard)
-- ✅ Added rate_cards.expiration_date (industry standard)
-- ✅ Added performance index
-- 
-- FRONTEND FIXES NEEDED:
-- ✅ rate_cards query will now work (columns exist)
-- ✅ employees query needs syntax fix (separate frontend fix)
-- =========================================

