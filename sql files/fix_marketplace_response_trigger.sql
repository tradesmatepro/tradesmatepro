-- Fix marketplace response schema and trigger issues
-- Problem: Table has old CHECK constraint AND new enum, causing conflicts
-- Solution: Remove old constraint, ensure column uses enum, fix trigger

BEGIN;

-- Step 1: Remove the old CHECK constraint that conflicts with the enum
ALTER TABLE public.marketplace_responses
DROP CONSTRAINT IF EXISTS marketplace_responses_response_status_check;

-- Step 2: First convert the column to TEXT to allow data updates
ALTER TABLE public.marketplace_responses
ALTER COLUMN response_status TYPE TEXT;

-- Step 3: Update any existing data that uses old values
UPDATE public.marketplace_responses
SET response_status = 'REJECTED'
WHERE response_status = 'declined';

UPDATE public.marketplace_responses
SET response_status = 'OFFERED'
WHERE response_status = 'counter';

UPDATE public.marketplace_responses
SET response_status = 'INTERESTED'
WHERE response_status = 'accepted';

-- Step 4: Now convert the column to use the enum type
ALTER TABLE public.marketplace_responses
ALTER COLUMN response_status TYPE marketplace_response_status_enum
USING response_status::marketplace_response_status_enum;

-- Step 5: Update the decline tracking trigger function to use correct enum values
CREATE OR REPLACE FUNCTION trg_log_decline_reason()
RETURNS trigger AS $$
BEGIN
  -- New decline (use REJECTED instead of declined)
  IF NEW.response_status = 'REJECTED' AND NEW.decline_reason_code IS NOT NULL THEN
    INSERT INTO public.marketplace_request_decline_stats (request_id, reason_code, decline_count)
    VALUES (NEW.request_id, NEW.decline_reason_code, 1)
    ON CONFLICT (request_id, reason_code)
    DO UPDATE SET decline_count = marketplace_request_decline_stats.decline_count + 1,
                  updated_at = now();

    UPDATE public.marketplace_requests
    SET total_declines = total_declines + 1,
        updated_at = now()
    WHERE id = NEW.request_id;
  END IF;

  -- Undo decline (use REJECTED instead of declined)
  IF OLD.response_status = 'REJECTED' AND NEW.response_status <> 'REJECTED' AND OLD.decline_reason_code IS NOT NULL THEN
    UPDATE public.marketplace_request_decline_stats
    SET decline_count = greatest(decline_count - 1, 0),
        updated_at = now()
    WHERE request_id = OLD.request_id AND reason_code = OLD.decline_reason_code;

    UPDATE public.marketplace_requests
    SET total_declines = greatest(total_declines - 1, 0),
        updated_at = now()
    WHERE id = OLD.request_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- The trigger should already exist, but recreate it to be safe
DROP TRIGGER IF EXISTS trg_marketplace_response_decline ON public.marketplace_responses;

CREATE TRIGGER trg_marketplace_response_decline
AFTER INSERT OR UPDATE ON public.marketplace_responses
FOR EACH ROW
EXECUTE FUNCTION trg_log_decline_reason();

COMMIT;
