-- Simple check of enum values
SELECT unnest(enum_range(NULL::work_order_status_enum))::text as value;

