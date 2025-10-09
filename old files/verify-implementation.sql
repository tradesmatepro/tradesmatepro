-- ============================================================================
-- Verification Script: Check Implementation
-- ============================================================================
-- Run this to verify all database changes were applied successfully
-- ============================================================================

-- Check new tables exist
SELECT 'tax_jurisdictions' as table_name, COUNT(*) as exists 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'tax_jurisdictions'
UNION ALL
SELECT 'tax_exemptions', COUNT(*) 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'tax_exemptions'
UNION ALL
SELECT 'service_address_tax_rates', COUNT(*) 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'service_address_tax_rates';

-- Check new columns on work_orders
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'work_orders'
  AND column_name IN ('service_address_id', 'tax_jurisdiction_ids', 'tax_exempt', 'tax_exemption_id')
ORDER BY column_name;

-- Check new columns on work_order_line_items
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'work_order_line_items'
  AND column_name IN ('taxable', 'tax_rate', 'tax_amount')
ORDER BY column_name;

-- Check RPC function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_enum_values';

-- Test RPC function
SELECT * FROM get_enum_values('work_order_status_enum') LIMIT 5;

-- Check triggers on new tables
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN ('tax_jurisdictions', 'tax_exemptions', 'service_address_tax_rates')
ORDER BY event_object_table, trigger_name;

-- Summary
SELECT 
  'VERIFICATION COMPLETE' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('tax_jurisdictions', 'tax_exemptions', 'service_address_tax_rates')) as new_tables,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'work_orders' AND column_name IN ('service_address_id', 'tax_jurisdiction_ids', 'tax_exempt', 'tax_exemption_id')) as work_orders_columns,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'work_order_line_items' AND column_name IN ('taxable', 'tax_rate', 'tax_amount')) as line_items_columns,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'get_enum_values') as rpc_functions;

