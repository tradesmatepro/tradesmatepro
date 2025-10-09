🔹 Phase 2 — Service Layer Rebuild
🎯 Goal

Fix the broken marketplace pipeline by moving all core logic into Postgres functions (RPC) so the app always calls a consistent contract. This eliminates dual submission paths and inconsistent acceptance behavior.

✅ Part 1. SQL (Supabase Functions)

Here’s the complete set you should run in Supabase SQL editor. This creates the functions Claude’s code will call.

1. Submit Marketplace Response
CREATE OR REPLACE FUNCTION submit_marketplace_response(
    _request_id uuid,
    _company_id uuid,
    _role_id uuid,
    _response_status marketplace_response_status_enum,
    _proposed_rate numeric DEFAULT NULL,
    _duration_hours integer DEFAULT NULL,
    _proposed_start timestamptz DEFAULT NULL,
    _proposed_end timestamptz DEFAULT NULL,
    _message text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    new_response_id uuid;
BEGIN
    INSERT INTO marketplace_responses (
        request_id, company_id, role_id, response_status,
        proposed_rate, duration_hours, proposed_start, proposed_end, message
    ) VALUES (
        _request_id, _company_id, _role_id, _response_status,
        _proposed_rate, _duration_hours, _proposed_start, _proposed_end, _message
    )
    RETURNING id INTO new_response_id;

    -- increment response_count
    UPDATE marketplace_requests
    SET response_count = COALESCE(response_count, 0) + 1
    WHERE id = _request_id;

    RETURN new_response_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

2. Accept Marketplace Response
CREATE OR REPLACE FUNCTION accept_marketplace_response(
    _response_id uuid,
    _customer_id uuid
)
RETURNS uuid AS $$
DECLARE
    _request_id uuid;
    new_work_order_id uuid;
BEGIN
    -- get request id from response
    SELECT request_id INTO _request_id
    FROM marketplace_responses
    WHERE id = _response_id;

    -- mark selected response accepted
    UPDATE marketplace_responses
    SET response_status = 'ACCEPTED'
    WHERE id = _response_id;

    -- decline all others
    UPDATE marketplace_responses
    SET response_status = 'DECLINED'
    WHERE request_id = _request_id
      AND id <> _response_id;

    -- create linked work order
    INSERT INTO work_orders (
        marketplace_request_id,
        marketplace_response_id,
        customer_id,
        status,
        created_at
    ) VALUES (
        _request_id,
        _response_id,
        _customer_id,
        'PENDING',
        now()
    )
    RETURNING id INTO new_work_order_id;

    RETURN new_work_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

3. Match Contractors to Request
CREATE OR REPLACE FUNCTION match_contractors_to_request(_request_id uuid)
RETURNS TABLE(company_id uuid, company_name text) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.name
    FROM companies c
    JOIN company_tags ct ON ct.company_id = c.id
    JOIN marketplace_request_tags rt ON rt.tag_id = ct.tag_id
    WHERE rt.request_id = _request_id
      AND c.verification_status != 'BANNED'
    ORDER BY c.avg_rating DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE;

4. Notification Logging (prep for Phase 3)
CREATE TABLE IF NOT EXISTS marketplace_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL,
    request_id uuid NOT NULL,
    message text,
    created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION notify_on_new_request()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO marketplace_notifications (company_id, request_id, message)
    SELECT ct.company_id, NEW.id, 'New request available'
    FROM marketplace_request_tags rt
    JOIN company_tags ct ON rt.tag_id = ct.tag_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_new_request ON marketplace_requests;
CREATE TRIGGER trg_notify_new_request
AFTER INSERT ON marketplace_requests
FOR EACH ROW EXECUTE FUNCTION notify_on_new_request();

✅ Part 2. Claude Prompt (Code Side)

Now here’s the exact prompt for Claude. This is what you hand him to update the service layer + frontend. No assumptions, fully aligned with the SQL above.

📌 Claude Prompt — Phase 2 Service Layer Rebuild

You are updating TradeMate Pro’s Marketplace service layer and components to use new Postgres functions.
Do not assume schema — use only what’s defined here.

Backend RPCs Available

submit_marketplace_response(...) → inserts response + increments request counter.

accept_marketplace_response(...) → accepts one response, declines others, creates work order.

match_contractors_to_request(...) → returns contractor list by tags/rating.

notify_on_new_request() → trigger inserts notification rows on new requests.

Tasks
1. Service Layer Updates

File: src/services/MarketplaceService.js

Replace direct inserts/updates with RPC calls:

submitMarketplaceResponse(payload) → calls submit_marketplace_response.

acceptMarketplaceResponse(responseId, customerId) → calls accept_marketplace_response.

getMatchingContractors(requestId) → calls match_contractors_to_request.

Ensure all payloads use current schema fields:

response_status (enum).

proposed_rate, duration_hours, proposed_start, proposed_end, message.

2. Inline Response Form

File: src/components/InlineResponseForm.js

Must call submitMarketplaceResponse() service only.

Remove all direct Supabase .insert() calls.

Ensure form values map correctly:

response_status = enum value.

proposed_rate, duration_hours, proposed_start, proposed_end, message.

3. Response Management Modal

File: src/components/ResponseManagementModal.js

Load responses by joining marketplace_responses with companies.

When customer accepts: call acceptMarketplaceResponse(responseId, customerId).

Refresh modal after acceptance so counts update.

Ensure declined responses show as DECLINED.

4. Customer Request Posting

File: src/components/RequestForm.js

After creating a new request, matching contractors are returned by match_contractors_to_request(requestId).

This prepares for Phase 3 notifications — don’t implement UI yet, but make sure service is callable.

5. Testing Flow

Add integration tests to confirm:

Posting a request triggers marketplace_notifications.

Submitting response increments response_count.

Accepting one response sets it to ACCEPTED, others to DECLINED.

Work order is created and linked.

Contractor can see accepted job under Quotes.

🚫 Forbidden

Do not call tables directly (supabase.from('...').insert).

Do not use old fields (response_type, counter_offer).

Do not leave dual submission paths. All marketplace ops go through service layer.

✅ Expected Outcome

Service layer fully RPC-driven.

Frontend forms and modals updated.

Customer → Response → Acceptance → Work Order pipeline works end-to-end.

Matching + notification groundwork ready for Phase 3.