-- Create notification_settings table for per-company preferences
-- This script is safe to run multiple times

create table if not exists public.notification_settings (
  company_id uuid primary key references public.companies(id) on delete cascade,

  -- Channels
  email_notifications_enabled boolean not null default true,
  sms_notifications_enabled boolean not null default false,
  push_notifications_enabled boolean not null default true,
  in_app_notifications_enabled boolean not null default true,

  -- Frequency / digests
  notification_frequency text not null default 'immediate', -- immediate | hourly | daily | weekly
  digest_email_enabled boolean not null default false,
  digest_frequency text not null default 'weekly', -- daily | weekly | monthly

  -- Quiet hours
  quiet_hours_enabled boolean not null default false,
  quiet_hours_start text not null default '22:00',
  quiet_hours_end text not null default '08:00',
  weekend_notifications_enabled boolean not null default true,

  -- Category toggles (in-app)
  in_app_inventory_alerts boolean not null default true,
  in_app_pto_events boolean not null default true,
  in_app_invoice_overdue boolean not null default true,
  in_app_quote_expiration boolean not null default true,
  in_app_system_alerts boolean not null default true,

  -- Email categories
  email_invoice_overdue boolean not null default true,
  email_quote_approved boolean not null default true,
  email_new_booking boolean not null default true,
  email_booking_cancelled boolean not null default true,
  email_booking_rescheduled boolean not null default true,
  email_payment_received boolean not null default true,
  email_work_completed boolean not null default true,
  email_customer_message boolean not null default true,

  -- SMS categories
  sms_new_booking boolean not null default false,
  sms_booking_reminder boolean not null default true,
  sms_booking_cancelled boolean not null default false,
  sms_payment_received boolean not null default false,
  sms_urgent_updates boolean not null default true,

  -- Push categories
  push_new_booking boolean not null default true,
  push_booking_reminder boolean not null default true,
  push_schedule_changes boolean not null default true,
  push_customer_message boolean not null default true,
  push_system_alerts boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_notification_settings_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_notification_settings_updated on public.notification_settings;
create trigger trg_notification_settings_updated
before update on public.notification_settings
for each row execute function public.set_notification_settings_updated_at();

comment on table public.notification_settings is 'Per-company notification channel and category preferences used by the app';

