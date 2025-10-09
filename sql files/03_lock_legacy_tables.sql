-- RUN THIRD (optional but recommended)
-- Rename legacy tables (if they still exist) and block writes to avoid future drift

DO $$ BEGIN
  IF to_regclass('public.quotes') IS NOT NULL THEN
    ALTER TABLE public.quotes RENAME TO quotes_legacy;
  END IF;
  IF to_regclass('public.quote_items') IS NOT NULL THEN
    ALTER TABLE public.quote_items RENAME TO quote_items_legacy;
  END IF;
  IF to_regclass('public.wo_master') IS NOT NULL THEN
    ALTER TABLE public.wo_master RENAME TO wo_master_legacy;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.forbid_writes()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Legacy table is read-only';
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF to_regclass('public.quotes_legacy') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS quotes_legacy_block ON public.quotes_legacy;
    CREATE TRIGGER quotes_legacy_block BEFORE INSERT OR UPDATE OR DELETE ON public.quotes_legacy
    FOR EACH STATEMENT EXECUTE FUNCTION public.forbid_writes();
  END IF;
  IF to_regclass('public.quote_items_legacy') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS quote_items_legacy_block ON public.quote_items_legacy;
    CREATE TRIGGER quote_items_legacy_block BEFORE INSERT OR UPDATE OR DELETE ON public.quote_items_legacy
    FOR EACH STATEMENT EXECUTE FUNCTION public.forbid_writes();
  END IF;
  IF to_regclass('public.wo_master_legacy') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS wo_master_legacy_block ON public.wo_master_legacy;
    CREATE TRIGGER wo_master_legacy_block BEFORE INSERT OR UPDATE OR DELETE ON public.wo_master_legacy
    FOR EACH STATEMENT EXECUTE FUNCTION public.forbid_writes();
  END IF;
END $$;

