-- Test the status validation function
-- Should return TRUE for same-status transitions

SELECT 
    'quote → quote' as test_case,
    validate_work_order_status_transition('quote'::work_order_status_enum, 'quote'::work_order_status_enum) as result,
    'Should be TRUE' as expected;

SELECT 
    'draft → draft' as test_case,
    validate_work_order_status_transition('draft'::work_order_status_enum, 'draft'::work_order_status_enum) as result,
    'Should be TRUE' as expected;

SELECT 
    'quote → approved' as test_case,
    validate_work_order_status_transition('quote'::work_order_status_enum, 'approved'::work_order_status_enum) as result,
    'Should be TRUE' as expected;

SELECT 
    'completed → draft' as test_case,
    validate_work_order_status_transition('completed'::work_order_status_enum, 'draft'::work_order_status_enum) as result,
    'Should be FALSE' as expected;

