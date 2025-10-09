-- Check work_order_status_enum values
SELECT unnest(enum_range(NULL::work_order_status_enum))::text AS status_value;

