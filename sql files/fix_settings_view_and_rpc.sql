-- PRODUCTION FIX: Update settings VIEW to include missing columns and create RPC function
-- This fixes the 400 Bad Request errors in logs

-- ============================================================================
-- PART 1: Drop existing get_schedulable_employees RPC function (if exists)
-- ============================================================================

DROP FUNCTION IF EXISTS get_schedulable_employees(UUID) CASCADE;

-- ============================================================================
-- PART 2: Create get_schedulable_employees RPC function
-- ============================================================================

CREATE OR REPLACE FUNCTION get_schedulable_employees(p_company_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  employee_id UUID,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  role TEXT,
  status TEXT,
  job_title TEXT,
  is_schedulable BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    e.user_id,
    e.id AS employee_id,
    u.name AS full_name,
    u.first_name,
    u.last_name,
    u.email,
    u.role,
    u.status,
    e.job_title,
    COALESCE(e.is_schedulable, true) AS is_schedulable
  FROM employees e
  INNER JOIN users u ON e.user_id = u.id
  WHERE e.company_id = p_company_id
    AND COALESCE(e.is_schedulable, true) = true
  ORDER BY u.name ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_schedulable_employees(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_schedulable_employees(UUID) TO anon;

COMMENT ON FUNCTION get_schedulable_employees(UUID) IS 'Returns all schedulable employees for a company with their user details. Used by scheduling components.';

-- ============================================================================
-- PART 3: Recreate settings VIEW with missing columns
-- ============================================================================

DROP VIEW IF EXISTS settings CASCADE;

CREATE OR REPLACE VIEW settings AS
SELECT 
    id,
    company_id,
    created_at,
    updated_at,
    default_payment_terms,
    default_invoice_terms,
    default_invoice_notes,
    invoice_footer,
    payment_instructions,
    currency,
    currency_symbol,
    late_fee_rate,
    tax_rate,
    show_logo_on_invoices,
    show_notes_on_invoices,
    show_terms_on_invoices,
    auto_invoice_on_completion,
    next_invoice_number,
    invoice_number_prefix,
    email_notifications_enabled,
    sms_notifications_enabled,
    push_notifications_enabled,
    in_app_notifications_enabled,
    labor_rate,
    overtime_multiplier,
    parts_markup,
    emergency_rate_multiplier,
    travel_charge_per_mile,
    minimum_travel_charge,
    cancellation_fee,
    default_tax_rate,
    deposit_enabled,
    deposit_type,
    deposit_percent,
    deposit_fixed_amount,
    require_deposit_before_scheduling,
    po_number_prefix,
    next_po_number,
    po_auto_numbering,
    po_require_approval,
    po_approval_threshold,
    po_default_terms,
    po_auto_send_to_vendor,
    po_require_receipt_confirmation,
    po_allow_partial_receiving,
    po_default_shipping_method,
    po_tax_calculation_method,
    po_currency,
    po_payment_terms_options,
    po_default_notes,
    po_footer_text,
    po_email_template,
    po_reminder_days,
    po_overdue_notification_days,
    weekend_multiplier,
    holiday_multiplier,
    diagnostic_fee,
    material_markup,
    subcontractor_markup,
    senior_discount_percentage,
    military_discount_percentage,
    loyalty_discount_percentage,
    require_signature_on_approval,
    require_terms_acceptance,
    require_deposit_on_approval,
    default_deposit_percentage,
    default_deposit_amount,
    allow_customer_scheduling,
    auto_schedule_after_approval,
    allow_partial_deposits,
    rejection_follow_up_enabled,
    terms_and_conditions_text,
    terms_version,
    signature_type,
    show_technician_names,
    scheduling_buffer_hours,
    auto_send_rejection_email,
    stripe_enabled,
    stripe_public_key,
    stripe_secret_key,
    business_hours_start,
    business_hours_end,
    working_days,
    timezone,
    min_advance_booking_hours,
    max_advance_booking_days,
    job_buffer_minutes,
    default_buffer_before_minutes,
    default_buffer_after_minutes,
    enable_customer_self_scheduling,
    auto_approve_customer_selections,
    password_expiry_days,
    session_timeout_minutes,
    max_login_attempts,
    lockout_duration_minutes,
    auto_logout_enabled,
    device_tracking_enabled,
    min_password_length,
    require_special_chars,
    require_numbers,
    require_uppercase,
    password_breach_checking,
    suspicious_activity_alerts,
    failed_login_notifications,
    ip_whitelist_enabled,
    ip_whitelist,
    audit_log_retention_days,
    require_https,
    security_headers_enabled
FROM company_settings;

-- ============================================================================
-- PART 4: Verify the changes
-- ============================================================================

-- Verify RPC function exists
SELECT 'RPC Function Status' as check_type, 
       CASE WHEN EXISTS (
         SELECT 1 FROM pg_proc 
         WHERE proname = 'get_schedulable_employees'
       ) THEN '✅ CREATED' ELSE '❌ MISSING' END as status;

-- Verify VIEW has the columns
SELECT 'Settings VIEW Columns' as check_type,
       COUNT(*) as columns_found
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'settings' 
  AND column_name IN (
    'enable_customer_self_scheduling',
    'auto_approve_customer_selections',
    'job_buffer_minutes',
    'default_buffer_before_minutes',
    'default_buffer_after_minutes'
  );

