-- RUN FIRST
-- Create or replace core list views backed by the canonical work_orders table
-- These views intentionally expose all columns (SELECT *) and only filter by stage.
-- This keeps UI stable even if new columns are added to work_orders.

CREATE OR REPLACE VIEW public.quotes_v AS
SELECT *
FROM public.work_orders
WHERE (work_orders.stage)::text = 'QUOTE';

CREATE OR REPLACE VIEW public.jobs_v AS
SELECT *
FROM public.work_orders
WHERE (work_orders.stage)::text = 'JOB';

CREATE OR REPLACE VIEW public.work_orders_v AS
SELECT *
FROM public.work_orders
WHERE (work_orders.stage)::text = 'WORK_ORDER';

-- Notes:
-- - If stage is TEXT already, the ::text cast is harmless; if it's an enum, this cast ensures comparison works.
-- - The app queries these with select=*, so field coverage remains complete.

