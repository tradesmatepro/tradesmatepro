-- Verify presence of canonical columns after normalization

-- Settings columns
select column_name from information_schema.columns
where table_schema='public' and table_name='settings'
and column_name in (
  'default_payment_terms','default_invoice_terms','default_invoice_notes','invoice_footer','payment_instructions',
  'currency','currency_symbol','late_fee_rate','tax_rate','show_logo_on_invoices','show_notes_on_invoices','show_terms_on_invoices',
  'auto_invoice_on_completion','next_invoice_number','invoice_number_prefix',
  'email_notifications_enabled','sms_notifications_enabled','push_notifications_enabled','in_app_notifications_enabled',
  'labor_rate','overtime_multiplier','parts_markup','emergency_rate_multiplier','travel_charge_per_mile','minimum_travel_charge','cancellation_fee','default_tax_rate',
  'deposit_enabled','deposit_type','deposit_percent','deposit_fixed_amount','require_deposit_before_scheduling',
  'po_number_prefix','next_po_number','po_require_approval','po_approval_threshold','po_default_terms','po_default_notes','po_footer_text',
  'weekend_multiplier','holiday_multiplier','diagnostic_fee','material_markup','subcontractor_markup','senior_discount_percentage','military_discount_percentage','loyalty_discount_percentage'
)
order by column_name;

-- Companies columns
select column_name from information_schema.columns
where table_schema='public' and table_name='companies'
and column_name in (
  'business_hours_start','business_hours_end','working_days','default_buffer_before_minutes','default_buffer_after_minutes','job_buffer_minutes',
  'min_advance_booking_hours','max_advance_booking_days','enable_customer_self_scheduling','auto_approve_customer_selections',
  'invoice_prefix','invoice_start_number'
)
order by column_name;

-- Count settings rows by company
select count(*) as settings_rows from settings;

