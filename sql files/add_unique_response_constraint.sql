-- Add unique constraint to prevent duplicate responses
-- This ensures one company can only respond once per request

BEGIN;

-- Add unique constraint on (request_id, company_id)
ALTER TABLE public.marketplace_responses
ADD CONSTRAINT unique_request_response
UNIQUE (request_id, company_id);

COMMIT;
