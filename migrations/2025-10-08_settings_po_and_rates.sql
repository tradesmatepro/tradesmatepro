-- Settings PO and extended rates columns migration
-- Extends canonical settings table with purchase order fields and additional rate fields

begin;

-- Ensure settings table exists
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references companies(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz
);

-- Purchase Order fields
alter table settings
  add column if not exists po_number_prefix text,
  add column if not exists next_po_number int,
  add column if not exists po_auto_numbering boolean,
  add column if not exists po_require_approval boolean,
  add column if not exists po_approval_threshold numeric,
  add column if not exists po_default_terms text,
  add column if not exists po_auto_send_to_vendor boolean,
  add column if not exists po_require_receipt_confirmation boolean,
  add column if not exists po_allow_partial_receiving boolean,
  add column if not exists po_default_shipping_method text,
  add column if not exists po_tax_calculation_method text,
  add column if not exists po_currency text,
  add column if not exists po_payment_terms_options text[],
  add column if not exists po_default_notes text,
  add column if not exists po_footer_text text,
  add column if not exists po_email_template text,
  add column if not exists po_reminder_days int,
  add column if not exists po_overdue_notification_days int;

-- Extended rates/pricing and discounts
alter table settings
  add column if not exists weekend_multiplier numeric,
  add column if not exists holiday_multiplier numeric,
  add column if not exists diagnostic_fee numeric,
  add column if not exists material_markup numeric,
  add column if not exists subcontractor_markup numeric,
  add column if not exists senior_discount_percentage numeric,
  add column if not exists military_discount_percentage numeric,
  add column if not exists loyalty_discount_percentage numeric;

-- Optional backfill from legacy company_settings if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='company_settings'
  ) THEN
    -- Mirror legacy table into temp and add missing columns for safe reference
    CREATE TEMP TABLE _legacy_cs_po AS SELECT * FROM company_settings LIMIT 0;
    INSERT INTO _legacy_cs_po SELECT * FROM company_settings;

    ALTER TABLE _legacy_cs_po
      ADD COLUMN IF NOT EXISTS po_number_prefix text,
      ADD COLUMN IF NOT EXISTS next_po_number int,
      ADD COLUMN IF NOT EXISTS po_require_approval boolean,
      ADD COLUMN IF NOT EXISTS po_approval_threshold numeric,
      ADD COLUMN IF NOT EXISTS po_default_terms text,
      ADD COLUMN IF NOT EXISTS po_default_notes text,
      ADD COLUMN IF NOT EXISTS po_footer_text text,
      ADD COLUMN IF NOT EXISTS parts_markup numeric;

    -- Ensure settings row exists for all companies in legacy table
    insert into settings (company_id, created_at)
    select cs.company_id, now()
    from _legacy_cs_po cs
    left join settings s on s.company_id = cs.company_id
    where s.company_id is null
    on conflict do nothing;

    -- Backfill PO and extended rates
    update settings s
    set
      po_number_prefix = coalesce(s.po_number_prefix, cs.po_number_prefix),
      next_po_number = coalesce(s.next_po_number, cs.next_po_number),
      po_require_approval = coalesce(s.po_require_approval, cs.po_require_approval),
      po_approval_threshold = coalesce(s.po_approval_threshold, cs.po_approval_threshold),
      po_default_terms = coalesce(s.po_default_terms, cs.po_default_terms),
      po_default_notes = coalesce(s.po_default_notes, cs.po_default_notes),
      po_footer_text = coalesce(s.po_footer_text, cs.po_footer_text),
      weekend_multiplier = coalesce(s.weekend_multiplier, 1.25),
      holiday_multiplier = coalesce(s.holiday_multiplier, 1.5),
      diagnostic_fee = coalesce(s.diagnostic_fee, 0),
      material_markup = coalesce(s.material_markup, cs.parts_markup),
      subcontractor_markup = coalesce(s.subcontractor_markup, 15),
      senior_discount_percentage = coalesce(s.senior_discount_percentage, 0),
      military_discount_percentage = coalesce(s.military_discount_percentage, 0),
      loyalty_discount_percentage = coalesce(s.loyalty_discount_percentage, 0),
      updated_at = now()
    from _legacy_cs_po cs
    where s.company_id = cs.company_id;
  END IF;
END$$;

commit;

