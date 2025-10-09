-- Add auto-invoice toggle to company settings
-- This enables optional automatic invoice creation when a job is completed

alter table if exists company_settings
add column if not exists auto_invoice_on_completion boolean not null default false;

comment on column company_settings.auto_invoice_on_completion is 'When true, automatically create an invoice when a job is marked completed.';

