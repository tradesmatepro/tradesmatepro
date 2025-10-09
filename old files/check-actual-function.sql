-- Check what the validation function ACTUALLY returns right now
SELECT validate_work_order_status_transition('quote'::work_order_status_enum, 'quote'::work_order_status_enum) as result;

-- Also check UPPERCASE
SELECT validate_work_order_status_transition('QUOTE'::work_order_status_enum, 'QUOTE'::work_order_status_enum) as uppercase_result;

