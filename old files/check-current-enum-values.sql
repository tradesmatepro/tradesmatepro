-- Check what enum values actually exist in the database after reset
SELECT 
    'work_order_status_enum' as enum_name,
    unnest(enum_range(NULL::work_order_status_enum))::text as enum_value
ORDER BY enum_value;

-- Also check if profiles table has a status column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'status';

