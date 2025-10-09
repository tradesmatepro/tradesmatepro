-- Add scheduling settings columns expected by smartScheduling.js to companies table
begin;

alter table public.companies
  add column if not exists job_buffer_minutes integer default 30,
  add column if not exists default_buffer_before_minutes integer default 30,
  add column if not exists default_buffer_after_minutes integer default 30,
  add column if not exists enable_customer_self_scheduling boolean default false,
  add column if not exists auto_approve_customer_selections boolean default false,
  add column if not exists business_hours_start text default '07:30',
  add column if not exists business_hours_end text default '17:00',
  add column if not exists working_days integer[] default '{1,2,3,4,5}',
  add column if not exists min_advance_booking_hours integer default 1,
  add column if not exists max_advance_booking_days integer default 30;

commit;

