-- RUN THIRD (Option A: Archive then drop legacy tables)
-- Archives data from legacy tables into a separate schema, then drops them from public
-- This prevents accidental usage while keeping a historical copy

CREATE SCHEMA IF NOT EXISTS legacy_archive;

DO $$
DECLARE
  ts TEXT := to_char(now(), 'YYYYMMDD_HH24MISS');
BEGIN
  -- quotes
  IF to_regclass('public.quotes') IS NOT NULL THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS legacy_archive.quotes_%s AS TABLE public.quotes', ts);
    EXECUTE 'DROP TABLE public.quotes CASCADE';
  END IF;
  -- quote_items
  IF to_regclass('public.quote_items') IS NOT NULL THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS legacy_archive.quote_items_%s AS TABLE public.quote_items', ts);
    EXECUTE 'DROP TABLE public.quote_items CASCADE';
  END IF;
  -- jobs (legacy standalone jobs table)
  IF to_regclass('public.jobs') IS NOT NULL THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS legacy_archive.jobs_%s AS TABLE public.jobs', ts);
    EXECUTE 'DROP TABLE public.jobs CASCADE';
  END IF;
  -- wo_master (old work order master)
  IF to_regclass('public.wo_master') IS NOT NULL THEN
    EXECUTE format('CREATE TABLE IF NOT EXISTS legacy_archive.wo_master_%s AS TABLE public.wo_master', ts);
    EXECUTE 'DROP TABLE public.wo_master CASCADE';
  END IF;
END $$;

COMMENT ON SCHEMA legacy_archive IS 'Stores archived copies of deprecated tables to avoid accidental use in the app.';

