-- Marketplace + Work Orders alignment migration
-- Sandbox-only. Apply via pg client or Supabase SQL Editor.

-- 1) Work Orders: add origin tracking columns
ALTER TABLE public.work_orders
  ADD COLUMN IF NOT EXISTS marketplace_request_id uuid NULL,
  ADD COLUMN IF NOT EXISTS marketplace_response_id uuid NULL;

-- Optional FK constraints (enable if desired)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_wo_marketplace_request'
  ) THEN
    ALTER TABLE public.work_orders
      ADD CONSTRAINT fk_wo_marketplace_request
      FOREIGN KEY (marketplace_request_id)
      REFERENCES public.marketplace_requests(id)
      ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_wo_marketplace_response'
  ) THEN
    ALTER TABLE public.work_orders
      ADD CONSTRAINT fk_wo_marketplace_response
      FOREIGN KEY (marketplace_response_id)
      REFERENCES public.marketplace_responses(id)
      ON DELETE SET NULL;
  END IF;
END$$;

-- 2) Fix submit_marketplace_response to use valid enum value
CREATE OR REPLACE FUNCTION public.submit_marketplace_response(
  _request_id uuid,
  _company_id uuid,
  _counter_offer numeric DEFAULT NULL,
  _available_start timestamptz DEFAULT NULL,
  _available_end   timestamptz DEFAULT NULL,
  _message         text        DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  _id uuid;
  _max int;
  _count int;
BEGIN
  SELECT max_responses, response_count INTO _max, _count
  FROM public.marketplace_requests
  WHERE id = _request_id AND status = 'available'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not available or does not exist';
  END IF;

  IF _max IS NOT NULL AND _count >= _max THEN
    RAISE EXCEPTION 'This request has reached its maximum number of responses';
  END IF;

  INSERT INTO public.marketplace_responses (
    request_id, company_id, response_status, counter_offer,
    available_start, available_end, message, created_at
  ) VALUES (
    _request_id, _company_id, 'INTERESTED', _counter_offer,
    _available_start, _available_end, _message, now()
  ) RETURNING id INTO _id;

  UPDATE public.marketplace_requests
  SET response_count = COALESCE(response_count, 0) + 1
  WHERE id = _request_id;

  RETURN _id;
END;
$$;

-- 3) Optional: add additional location fields captured by UI (onsite/hybrid)
ALTER TABLE public.marketplace_requests
  ADD COLUMN IF NOT EXISTS location_address text,
  ADD COLUMN IF NOT EXISTS location_city text,
  ADD COLUMN IF NOT EXISTS location_state text;

-- Note: If you have a legacy get_browse_requests() overload referencing r.trade_tags,
-- drop it manually in SQL Editor with the exact signature. Keep the request_tags-based one.

