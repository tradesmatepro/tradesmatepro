-- RUN FIRST (use this if 01_create_core_views.sql errors)
-- Safely drop any existing views with conflicting column lists, then recreate

-- Drop existing views to avoid column-name conflicts
DROP VIEW IF EXISTS public.quotes_v CASCADE;
DROP VIEW IF EXISTS public.jobs_v CASCADE;
DROP VIEW IF EXISTS public.work_orders_v CASCADE;

-- Recreate as simple stage-filtered views over work_orders
CREATE VIEW public.quotes_v AS
SELECT work_orders.*
FROM public.work_orders
WHERE (work_orders.stage)::text = 'QUOTE';

CREATE VIEW public.jobs_v AS
SELECT work_orders.*
FROM public.work_orders
WHERE (work_orders.stage)::text = 'JOB';

CREATE VIEW public.work_orders_v AS
SELECT work_orders.*
FROM public.work_orders
WHERE (work_orders.stage)::text = 'WORK_ORDER';

-- Notes:
-- - Using DROP ... CASCADE in case other dependent views or rules exist.
-- - Views select only work_orders.* to avoid accidental name aliasing from older definitions.
-- - If you had GRANTs on the old views, re-apply as needed after recreation.

