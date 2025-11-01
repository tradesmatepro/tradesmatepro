-- ============================================
-- REMOVE GENERATED COLUMN CONSTRAINT FROM total_price
-- ============================================
-- Problem: total_price is a GENERATED column that auto-calculates as quantity × unit_price
-- This doesn't allow us to apply markup for parts/materials.
--
-- Solution: Drop the generated column and recreate it as a regular NUMERIC column
-- that can be set by the application with markup applied.
-- ============================================

-- Step 1: Drop the generated column
ALTER TABLE work_order_line_items 
DROP COLUMN IF EXISTS total_price;

-- Step 2: Add it back as a regular column (not generated)
ALTER TABLE work_order_line_items 
ADD COLUMN total_price NUMERIC(10, 2) DEFAULT 0;

-- Step 3: Backfill existing rows with quantity × unit_price (no markup for now)
-- The application will handle markup going forward
UPDATE work_order_line_items
SET total_price = COALESCE(quantity, 0) * COALESCE(unit_price, 0)
WHERE total_price IS NULL OR total_price = 0;

-- Step 4: Verify the change
SELECT 
  id,
  line_type,
  description,
  quantity,
  unit_price,
  total_price,
  (quantity * unit_price) as calculated
FROM work_order_line_items
LIMIT 10;

