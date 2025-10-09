-- RUN FOURTH (optional, only if you want an Item Library)
-- Creates a minimal items_catalog table for reusable quote items

CREATE TABLE IF NOT EXISTS public.items_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  item_name text NOT NULL,
  description text,
  item_type text NOT NULL DEFAULT 'material',
  default_rate numeric NOT NULL DEFAULT 0,
  sku text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Constrain item_type to expected values
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'item_type_enum' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.item_type_enum AS ENUM ('material','part','labor','service');
  END IF;
END $$;

-- Add check that item_type is in enum list (without converting column to enum)
ALTER TABLE public.items_catalog
  ADD CONSTRAINT items_catalog_item_type_check
  CHECK (item_type IN ('material','part','labor','service'));

-- Helpful indexes
CREATE INDEX IF NOT EXISTS items_catalog_company_idx ON public.items_catalog (company_id);
-- Optional trigram index (requires pg_trgm extension). Uncomment if enabled:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS items_catalog_name_trgm ON public.items_catalog USING GIN (item_name gin_trgm_ops);

-- Notes:
-- - RLS assumed disabled in beta as per your setup; otherwise add RLS policies.
-- - If you prefer a true ENUM column, run: ALTER TABLE ... ALTER COLUMN item_type TYPE item_type_enum USING item_type::item_type_enum;

