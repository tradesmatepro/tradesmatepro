-- Verify all required columns exist for quote acceptance workflow

-- 1. Check work_orders table columns
SELECT 'work_orders columns:' as check_type;
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'work_orders' 
AND column_name IN (
  'approved_at',
  'rejected_at',
  'customer_approved_at',
  'quote_rejected_at',
  'customer_signature_url',
  'customer_signature_data',
  'deposit_required',
  'deposit_type',
  'deposit_amount',
  'deposit_percentage',
  'deposit_value',
  'deposit_method'
)
ORDER BY column_name;

-- 2. Check settings table columns
SELECT 'settings columns:' as check_type;
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'settings' 
AND column_name IN (
  'require_signature_on_approval',
  'signature_type',
  'require_terms_acceptance',
  'terms_and_conditions_text',
  'terms_version',
  'require_deposit_on_approval',
  'deposit_type',
  'default_deposit_percentage',
  'default_deposit_amount',
  'allow_partial_deposits',
  'allow_customer_scheduling',
  'auto_schedule_after_approval',
  'show_technician_names',
  'scheduling_buffer_hours',
  'rejection_follow_up_enabled',
  'auto_send_rejection_email',
  'stripe_enabled',
  'stripe_public_key',
  'stripe_secret_key'
)
ORDER BY column_name;

-- 3. Check if quote acceptance tables exist
SELECT 'quote acceptance tables:' as check_type;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'quote_signatures',
  'quote_rejections',
  'quote_change_requests',
  'quote_deposits',
  'quote_approvals'
)
ORDER BY table_name;

-- 4. Check RLS policies for anonymous access
SELECT 'RLS policies for anonymous:' as check_type;
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('work_orders', 'work_order_line_items', 'quote_signatures', 'quote_rejections', 'quote_deposits')
AND roles @> ARRAY['anon']::name[]
ORDER BY tablename, policyname;

