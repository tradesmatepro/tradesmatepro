-- ============================================================
-- FIX NOTES REDUNDANCY (Industry Standard)
-- ============================================================
-- Problem: Frontend has 3 notes fields but database only has 2
-- - "Notes" (placeholder says "internal") → saves to `notes`
-- - "Customer Notes" → tries to save to `customer_notes` (DOESN'T EXIST!)
-- - "Internal Notes" → saves to `internal_notes`
--
-- Industry Standard (Jobber/ServiceTitan):
-- - `notes` = Internal notes (NOT visible to customer by default)
-- - `customer_notes` = Notes visible to customer on quote/invoice PDF
--
-- Solution: Add customer_notes column, keep notes as internal
-- ============================================================

-- Add customer_notes column to work_orders
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS customer_notes TEXT DEFAULT NULL;

COMMENT ON COLUMN work_orders.customer_notes IS 'Notes visible to customer on quote/invoice PDF (industry standard like Jobber)';
COMMENT ON COLUMN work_orders.notes IS 'Internal notes - NOT visible to customer (industry standard like Jobber)';
COMMENT ON COLUMN work_orders.internal_notes IS 'DEPRECATED - Use notes instead. Will be removed in future migration.';

-- Migrate any existing internal_notes to notes (if notes is empty)
UPDATE work_orders 
SET notes = COALESCE(notes, '') || 
  CASE 
    WHEN notes IS NOT NULL AND notes != '' AND internal_notes IS NOT NULL AND internal_notes != '' 
    THEN E'\n\n--- Migrated from internal_notes ---\n' || internal_notes
    WHEN internal_notes IS NOT NULL AND internal_notes != ''
    THEN internal_notes
    ELSE ''
  END
WHERE internal_notes IS NOT NULL AND internal_notes != '';

-- Clear internal_notes after migration (will be dropped in future)
UPDATE work_orders SET internal_notes = NULL WHERE internal_notes IS NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_work_orders_notes 
ON work_orders(company_id) 
WHERE notes IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_work_orders_customer_notes 
ON work_orders(company_id) 
WHERE customer_notes IS NOT NULL;

-- ============================================================
-- RESULT:
-- ✅ work_orders.notes = Internal notes (NOT visible to customer)
-- ✅ work_orders.customer_notes = Customer-facing notes (visible on PDF)
-- ⚠️ work_orders.internal_notes = DEPRECATED (will be dropped later)
-- ============================================================

