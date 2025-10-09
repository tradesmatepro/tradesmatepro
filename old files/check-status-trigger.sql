-- Check the current status trigger function
SELECT prosrc FROM pg_proc WHERE proname = 'enforce_work_order_status';

