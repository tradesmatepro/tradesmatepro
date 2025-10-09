-- TradeMate Pro Settings Normalization Migration
-- Goal: Single source of truth with no fallbacks
-- - Scheduling: companies table
-- - App settings (invoicing/notifications/business prefs): settings table
-- - Legacy company_settings: backfill into canonical tables, then unused by app code

begin;

-- Ensure UUID generation is available (Supabase usually has pgcrypto enabled)
create extension if not exists "pgcrypto";

-- 1) Canonicalize Scheduling to companies table
alter table companies
  add column if not exists business_hours_start text,
  add column if not exists business_hours_end text,
  add column if not exists working_days jsonb,
  add column if not exists default_buffer_before_minutes int,
  add column if not exists default_buffer_after_minutes int,
  add column if not exists job_buffer_minutes int,
  add column if not exists min_advance_booking_hours int,
  add column if not exists max_advance_booking_days int,
  add column if not exists enable_customer_self_scheduling boolean,
  add column if not exists auto_approve_customer_selections boolean,
  add column if not exists invoice_prefix text,
  add column if not exists invoice_start_number int;

-- 2) Create canonical settings table if missing
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references companies(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz
);

-- 2a) Ensure commonly used settings columns exist (additive/idempotent)
-- Invoicing
alter table settings
  add column if not exists default_payment_terms text,
  add column if not exists default_invoice_terms text,
  add column if not exists default_invoice_notes text,
  add column if not exists invoice_footer text,
  add column if not exists payment_instructions text,
  add column if not exists currency text,
  add column if not exists currency_symbol text,
  add column if not exists late_fee_rate numeric,
  add column if not exists tax_rate numeric,
  add column if not exists show_logo_on_invoices boolean,
  add column if not exists show_notes_on_invoices boolean,
  add column if not exists show_terms_on_invoices boolean,
  add column if not exists auto_invoice_on_completion boolean,
  add column if not exists next_invoice_number int,
  add column if not exists invoice_number_prefix text;

-- Notifications
alter table settings
  add column if not exists email_notifications_enabled boolean,
  add column if not exists sms_notifications_enabled boolean,
  add column if not exists push_notifications_enabled boolean,
  add column if not exists in_app_notifications_enabled boolean;

-- Rates/pricing fallback fields (until fully moved to rate_cards everywhere)
alter table settings
  add column if not exists labor_rate numeric,
  add column if not exists overtime_multiplier numeric,
  add column if not exists parts_markup numeric,
  add column if not exists emergency_rate_multiplier numeric,
  add column if not exists travel_charge_per_mile numeric,
  add column if not exists minimum_travel_charge numeric,
  add column if not exists cancellation_fee numeric,
  add column if not exists default_tax_rate numeric;

-- Deposits and automations
alter table settings
  add column if not exists deposit_enabled boolean,
  add column if not exists deposit_type text,
  add column if not exists deposit_percent numeric,
  add column if not exists deposit_fixed_amount numeric,
  add column if not exists require_deposit_before_scheduling boolean;

-- 3) Backfill data from legacy company_settings into canonical tables (if legacy table exists)
-- Create helper temp table with company_settings presence
create temp table if not exists _legacy_cs as
select * from company_settings limit 0;

-- If company_settings exists, repopulate temp with actual rows (will no-op if table doesn't exist)
-- Use DO block to guard against missing table errors
do $$
begin
  if exists (
    select 1 from information_schema.tables where table_schema = 'public' and table_name = 'company_settings'
  ) then
    delete from _legacy_cs;
    insert into _legacy_cs select * from company_settings;
  end if;
end $$;


-- Ensure optional legacy columns exist on temp table for safe reference
alter table _legacy_cs
  add column if not exists default_payment_terms text,
  add column if not exists default_invoice_terms text,
  add column if not exists default_invoice_notes text,
  add column if not exists invoice_footer text,
  add column if not exists payment_instructions text,
  add column if not exists currency text,
  add column if not exists currency_symbol text,
  add column if not exists late_fee_rate numeric,
  add column if not exists default_tax_rate numeric,
  add column if not exists show_logo_on_invoices boolean,
  add column if not exists show_notes_on_invoices boolean,
  add column if not exists show_terms_on_invoices boolean,
  add column if not exists auto_invoice_on_completion boolean,
  add column if not exists next_invoice_number int,
  add column if not exists invoice_number_prefix text,
  add column if not exists email_notifications_enabled boolean,
  add column if not exists sms_notifications_enabled boolean,
  add column if not exists push_notifications_enabled boolean,
  add column if not exists in_app_notifications_enabled boolean,
  add column if not exists labor_rate numeric,
  add column if not exists overtime_multiplier numeric,
  add column if not exists parts_markup numeric,
  add column if not exists emergency_rate_multiplier numeric,
  add column if not exists travel_charge_per_mile numeric,
  add column if not exists minimum_travel_charge numeric,
  add column if not exists cancellation_fee numeric,
  add column if not exists deposit_enabled boolean,
  add column if not exists deposit_type text,
  add column if not exists deposit_percent numeric,
  add column if not exists deposit_fixed_amount numeric,
  add column if not exists require_deposit_before_scheduling boolean,
  add column if not exists business_hours_start text,
  add column if not exists business_hours_end text,
  add column if not exists working_days jsonb,
  add column if not exists default_buffer_before_minutes int,
  add column if not exists default_buffer_after_minutes int,
  add column if not exists job_buffer_minutes int,
  add column if not exists min_advance_booking_hours int,
  add column if not exists max_advance_booking_days int,
  add column if not exists enable_customer_self_scheduling boolean,
  add column if not exists auto_approve_customer_selections boolean;

-- 3a) Ensure every company with legacy row has a settings row
insert into settings (company_id, created_at)
select cs.company_id, now()
from _legacy_cs cs
left join settings s on s.company_id = cs.company_id
where s.company_id is null
on conflict do nothing;

-- 3b) Backfill invoicing/notifications/rates into settings where null
update settings s
set
  default_payment_terms = coalesce(s.default_payment_terms, cs.default_payment_terms),
  default_invoice_terms = coalesce(s.default_invoice_terms, cs.default_invoice_terms),
  default_invoice_notes = coalesce(s.default_invoice_notes, cs.default_invoice_notes),
  invoice_footer = coalesce(s.invoice_footer, cs.invoice_footer),
  payment_instructions = coalesce(s.payment_instructions, cs.payment_instructions),
  currency = coalesce(s.currency, cs.currency),
  currency_symbol = coalesce(s.currency_symbol, cs.currency_symbol),
  late_fee_rate = coalesce(s.late_fee_rate, cs.late_fee_rate),
  tax_rate = coalesce(s.tax_rate, cs.default_tax_rate),
  show_logo_on_invoices = coalesce(s.show_logo_on_invoices, cs.show_logo_on_invoices),
  show_notes_on_invoices = coalesce(s.show_notes_on_invoices, cs.show_notes_on_invoices),
  show_terms_on_invoices = coalesce(s.show_terms_on_invoices, cs.show_terms_on_invoices),
  auto_invoice_on_completion = coalesce(s.auto_invoice_on_completion, cs.auto_invoice_on_completion),
  next_invoice_number = coalesce(s.next_invoice_number, cs.next_invoice_number),
  invoice_number_prefix = coalesce(s.invoice_number_prefix, cs.invoice_number_prefix),
  email_notifications_enabled = coalesce(s.email_notifications_enabled, cs.email_notifications_enabled),
  sms_notifications_enabled = coalesce(s.sms_notifications_enabled, cs.sms_notifications_enabled),
  push_notifications_enabled = coalesce(s.push_notifications_enabled, cs.push_notifications_enabled),
  in_app_notifications_enabled = coalesce(s.in_app_notifications_enabled, cs.in_app_notifications_enabled),
  labor_rate = coalesce(s.labor_rate, cs.labor_rate),
  overtime_multiplier = coalesce(s.overtime_multiplier, cs.overtime_multiplier),
  parts_markup = coalesce(s.parts_markup, cs.parts_markup),
  emergency_rate_multiplier = coalesce(s.emergency_rate_multiplier, cs.emergency_rate_multiplier),
  travel_charge_per_mile = coalesce(s.travel_charge_per_mile, cs.travel_charge_per_mile),
  minimum_travel_charge = coalesce(s.minimum_travel_charge, cs.minimum_travel_charge),
  cancellation_fee = coalesce(s.cancellation_fee, cs.cancellation_fee),
  default_tax_rate = coalesce(s.default_tax_rate, cs.default_tax_rate),
  deposit_enabled = coalesce(s.deposit_enabled, cs.deposit_enabled),
  deposit_type = coalesce(s.deposit_type, cs.deposit_type::text),
  deposit_percent = coalesce(s.deposit_percent, cs.deposit_percent),
  deposit_fixed_amount = coalesce(s.deposit_fixed_amount, cs.deposit_fixed_amount),
  require_deposit_before_scheduling = coalesce(s.require_deposit_before_scheduling, cs.require_deposit_before_scheduling),
  updated_at = now()
from _legacy_cs cs
where s.company_id = cs.company_id;

-- 3c) Backfill scheduling into companies where null
update companies c
set
  business_hours_start = coalesce(c.business_hours_start, cs.business_hours_start, '07:30'),
  business_hours_end = coalesce(c.business_hours_end, cs.business_hours_end, '17:00'),
  working_days = coalesce(c.working_days, cs.working_days, '[1,2,3,4,5]'::jsonb),
  default_buffer_before_minutes = coalesce(c.default_buffer_before_minutes, cs.default_buffer_before_minutes, cs.job_buffer_minutes, 30),
  default_buffer_after_minutes = coalesce(c.default_buffer_after_minutes, cs.default_buffer_after_minutes, cs.job_buffer_minutes, 30),
  job_buffer_minutes = coalesce(c.job_buffer_minutes, cs.job_buffer_minutes, 30),
  min_advance_booking_hours = coalesce(c.min_advance_booking_hours, cs.min_advance_booking_hours, 1),
  max_advance_booking_days = coalesce(c.max_advance_booking_days, cs.max_advance_booking_days, 30),
  enable_customer_self_scheduling = coalesce(c.enable_customer_self_scheduling, cs.enable_customer_self_scheduling, false),
  auto_approve_customer_selections = coalesce(c.auto_approve_customer_selections, cs.auto_approve_customer_selections, false),
  invoice_prefix = coalesce(c.invoice_prefix, cs.invoice_number_prefix, 'INV'),
  invoice_start_number = coalesce(c.invoice_start_number, cs.next_invoice_number, 1)
from _legacy_cs cs
where c.id = cs.company_id;

-- 4) Final defaults for scheduling if still null (safety net)
update companies
set
  business_hours_start = coalesce(business_hours_start, '07:30'),
  business_hours_end = coalesce(business_hours_end, '17:00'),
  working_days = coalesce(working_days, '[1,2,3,4,5]'::jsonb),
  default_buffer_before_minutes = coalesce(default_buffer_before_minutes, job_buffer_minutes, 30),
  default_buffer_after_minutes = coalesce(default_buffer_after_minutes, job_buffer_minutes, 30),
  job_buffer_minutes = coalesce(job_buffer_minutes, 30),
  min_advance_booking_hours = coalesce(min_advance_booking_hours, 1),
  max_advance_booking_days = coalesce(max_advance_booking_days, 30),
  enable_customer_self_scheduling = coalesce(enable_customer_self_scheduling, false),
  auto_approve_customer_selections = coalesce(auto_approve_customer_selections, false),
  invoice_prefix = coalesce(invoice_prefix, 'INV'),
  invoice_start_number = coalesce(invoice_start_number, 1);

commit;

