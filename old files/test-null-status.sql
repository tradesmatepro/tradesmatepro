-- Test what happens when we pass NULL to the validation function
SELECT validate_work_order_status_transition('quote'::work_order_status_enum, NULL::work_order_status_enum) as result;

