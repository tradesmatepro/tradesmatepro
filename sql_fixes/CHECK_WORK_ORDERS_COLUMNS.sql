-- Check actual columns in work_orders table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'work_orders' 
AND column_name IN (
  'subtotal', 'discount_total', 'tax_total', 'grand_total',
  'discount_amount', 'tax_amount', 'total_amount',
  'labor_summary', 'customer_notes', 'internal_notes'
)
ORDER BY column_name;

