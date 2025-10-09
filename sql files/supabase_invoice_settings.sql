-- Add invoicing configuration fields to business_settings
alter table public.business_settings
  add column if not exists invoice_prefix text default 'INV-',
  add column if not exists next_invoice_number integer default 1001,
  add column if not exists default_invoice_due_days integer default 14,
  add column if not exists show_labor_breakdown boolean default true,
  add column if not exists show_material_costs boolean default true,
  add column if not exists enable_late_fees boolean default false,
  add column if not exists late_fee_percent numeric default 0,
  add column if not exists auto_send_invoices boolean default false,
  add column if not exists auto_send_invoice_reminders boolean default false,
  add column if not exists enable_online_payments boolean default false,
  add column if not exists payment_portal_url text;

-- Optional: move default tax rate / terms here if not present
-- alter table public.business_settings add column if not exists default_tax_rate numeric default 0;
-- alter table public.business_settings add column if not exists default_invoice_terms text default 'NET_14';

