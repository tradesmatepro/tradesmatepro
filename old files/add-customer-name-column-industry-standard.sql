-- ============================================================================
-- ADD COMPUTED 'name' COLUMN TO CUSTOMERS TABLE (INDUSTRY STANDARD)
-- ============================================================================
-- Jobber, ServiceTitan, Housecall Pro all have a single 'name' field
-- that shows either company_name OR "first_name last_name"
-- This eliminates the need to do COALESCE logic in every query
-- ============================================================================

-- Add generated column that computes name from company_name or first_name + last_name
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS name TEXT 
GENERATED ALWAYS AS (
  COALESCE(
    company_name, 
    CASE 
      WHEN first_name IS NOT NULL AND last_name IS NOT NULL 
      THEN first_name || ' ' || last_name
      WHEN first_name IS NOT NULL 
      THEN first_name
      WHEN last_name IS NOT NULL 
      THEN last_name
      ELSE 'Unnamed Customer'
    END
  )
) STORED;

-- Verify the column was added
SELECT 
  'Customers table now has computed name column' as message,
  column_name,
  data_type,
  generation_expression
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'customers'
  AND column_name = 'name';

-- Test with sample data
SELECT 
  id,
  first_name,
  last_name,
  company_name,
  name as computed_name
FROM customers
LIMIT 5;

