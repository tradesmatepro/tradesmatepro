-- ========================================
-- Seed Default Rate Cards
-- ========================================
-- Creates a default rate card for companies that don't have one
-- Run this in Supabase SQL Editor
-- ========================================

-- Check if rate_cards table exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'rate_cards'
    ) THEN
        RAISE EXCEPTION 'rate_cards table does not exist! Check your schema.';
    END IF;
END $$;

-- Check current rate cards
SELECT 'Current rate cards:' as status;
SELECT company_id, name, base_rate, is_active 
FROM rate_cards 
ORDER BY company_id, effective_date DESC;

-- Insert default rate card for companies without one
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
    'HOURLY' as rate_type,
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
);

-- Show results
SELECT 'Rate cards after seeding:' as status;
SELECT company_id, name, base_rate, is_active, effective_date
FROM rate_cards 
ORDER BY company_id, effective_date DESC;

SELECT '✅ Default rate cards created!' as status;

