-- Deposit policy schema additions
-- Safe/idempotent migration for company-level defaults and per-work-order capture

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deposit_type_enum') THEN
    CREATE TYPE deposit_type_enum AS ENUM ('PERCENTAGE', 'FIXED');
  END IF;
END $$;

-- Company settings defaults
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS deposit_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_type deposit_type_enum DEFAULT 'PERCENTAGE',
  ADD COLUMN IF NOT EXISTS deposit_percent numeric(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deposit_fixed_amount numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS require_deposit_before_scheduling boolean DEFAULT false;

-- Per work order capture (audit what was requested/collected)
ALTER TABLE work_orders
  ADD COLUMN IF NOT EXISTS deposit_required boolean,
  ADD COLUMN IF NOT EXISTS deposit_type deposit_type_enum,
  ADD COLUMN IF NOT EXISTS deposit_value numeric(12,2),      -- percent value or fixed amount entered
  ADD COLUMN IF NOT EXISTS deposit_amount numeric(12,2),     -- computed/requested amount
  ADD COLUMN IF NOT EXISTS deposit_method text;              -- e.g., 'card','cash','check','ach'

-- Optional: simple check to keep percent in 0..100 when type is PERCENTAGE
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'company_settings_deposit_percent_range'
  ) THEN
    ALTER TABLE company_settings
      ADD CONSTRAINT company_settings_deposit_percent_range
      CHECK (deposit_type <> 'PERCENTAGE' OR (deposit_percent >= 0 AND deposit_percent <= 100));
  END IF;
END $$;

