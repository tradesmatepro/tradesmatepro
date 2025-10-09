-- Verify the fix was applied by testing same-status transitions
SELECT 
    'Testing quote → quote transition' as test,
    validate_work_order_status_transition('quote'::work_order_status_enum, 'quote'::work_order_status_enum) as result,
    CASE 
        WHEN validate_work_order_status_transition('quote'::work_order_status_enum, 'quote'::work_order_status_enum) = TRUE 
        THEN '✅ FIX APPLIED'
        ELSE '❌ FIX NOT APPLIED'
    END as status;

