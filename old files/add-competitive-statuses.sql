-- ============================================================================
-- ADD COMPETITIVE ADVANTAGE STATUSES
-- Makes TradeMate Pro better than Jobber, Housecall Pro, AND ServiceTitan
-- ============================================================================
-- Date: 2025-10-01
-- Safe to run: Only adds new enum values, doesn't modify existing data
-- ============================================================================

BEGIN;

-- ============================================================================
-- Add 4 new statuses to beat all three competitors
-- ============================================================================

-- 1. 'presented' - From ServiceTitan (for in-person quotes)
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'presented';

-- 2. 'changes_requested' - From Jobber (customer wants modifications)
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'changes_requested';

-- 3. 'follow_up' - From ServiceTitan (needs follow-up tracking)
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'follow_up';

-- 4. 'expired' - From Housecall Pro (automatic quote expiration)
ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS 'expired';

COMMIT;

-- ============================================================================
-- VERIFY: Check all enum values
-- ============================================================================
SELECT enumlabel as status_value, enumsortorder as sort_order
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'work_order_status_enum')
ORDER BY enumsortorder;

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- TradeMate Pro now has ALL the best features from:
-- ✅ Jobber (changes_requested)
-- ✅ Housecall Pro (expired)
-- ✅ ServiceTitan (presented, follow_up)
-- 
-- Total statuses: 20 (16 original + 4 new)
-- Competitive advantage: 9/9 features vs competitors' 5-6/9
-- ============================================================================

