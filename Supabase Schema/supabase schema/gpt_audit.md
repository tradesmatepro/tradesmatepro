# TradeMate Pro – Full App Audit (Schema ↔ Frontend Wiring)

Date: 2025-09-18
Author: Augment Agent (GPT-5)
Scope: End-to-end wiring audit focused on Supabase schema vs. frontend code paths causing 400s and runtime issues. Sources reviewed: Supabase Schema/supabase schema/latest.json, gpthistory.txt, main app (src/**), Customer Portal (Customer Portal/src/**), error_logs.

## Executive Summary
High-confidence root causes of your 400/network issues:
- Critical schema–frontend mismatches around marketplace requests/responses and work order creation
- RPC functions exist but assume columns that aren’t present; one RPC writes invalid enum values
- Frontend inserts/use of fields that don’t exist or wrong enum casing
- Notifications “Failed to fetch” is environment/network/CORS/tooling, not a missing table

Below is a prioritized, actionable fix plan with precise code and SQL deltas.

---

## Findings (Critical)

1) CreateRequestModal inserts invalid/mismatched columns and enum casing
- File: src/components/Marketplace/CreateRequestModal.js
- Issues:
  - Inserts marketplace_requests.trade_tag but schema has no such column; schema uses tags via request_tags join table
  - Sends request_type values as 'standard'/'emergency' (lowercase) but schema type is request_type_enum with values 'STANDARD'/'EMERGENCY'
  - Ignores pricing_preference/flat_rate/hourly_rate/service_mode fields that exist in schema and are used downstream
- Result: 400 on insert (column does not exist) and/or enum cast errors

2) RPC accept_marketplace_response assumes non-existent work_orders columns
- Schema: two overloaded functions named accept_marketplace_response exist; the 3-arg version inserts into work_orders(... marketplace_request_id, marketplace_response_id ...)
- latest.json shows work_orders does NOT have marketplace_request_id nor marketplace_response_id columns
- Result: Accept flow will fail at runtime (contractor/customer accept) when RPC tries to insert

3) RPC submit_marketplace_response writes invalid enum value
- Function submit_marketplace_response sets response_status to 'pending' (lowercase), but enum marketplace_response_status_enum allows: INTERESTED, PENDING_QUOTE, OFFERED, REJECTED, ACCEPTED
- Result: Calling this RPC will error; direct table insert may still work (your code currently uses direct insert, which is why responses often succeed)

4) Company logo/rating fields mismatch in selects
- Frontend often selects companies.logo_url, companies.rating; schema has company_logo_url and avg_rating/rating_count
- Result: nulls/missing data in UI, potential confusion

5) Case handling: service_mode and request_type
- Schema: marketplace_requests.service_mode is text default 'onsite' (lowercase). request_type is an enum with UPPERCASE values.
- Frontend frequently uses ONSITE/REMOTE/HYBRID (uppercase) and 'standard'/'emergency' (lowercase)
- Result: inserts/filters may fail or display logic may misbehave without normalization

---

## Findings (High)

6) Two get_browse_requests overloads coexist
- One overload properly joins request_tags/tags; another references r.trade_tags (array) which no longer exists
- Keeping both may confuse maintainers; only the request_tags version is aligned with current schema

7) Work Orders status/enum strategy
- latest.json shows work_orders has stage (stage_enum) plus quote_status/job_status/invoice_status enums (aligned to your preference)
- Multiple places in code still reference legacy fields or conflate enums with text-based status fields; needs a pass for consistency

8) Notifications errors are network, not schema
- Table public.notifications exists; policies present
- error_logs/latest.json shows TypeError: Failed to fetch to Supabase REST and 500s to http://localhost:4000/save-errors (your local error server)
- Likely environmental: CORS/AdBlock/VPN/Dev proxy/server not running; headers are set with service key

---

## Findings (Medium)

9) Company field aliases in selects
- Where you need companies.logo_url, prefer requesting company_logo_url (or alias in select where supported), and avg_rating/rating_count instead of rating

10) Response status display logic
- Frontend displays both lowercase and uppercase response statuses; schema enum is uppercase; normalize for consistency

---

## Precise Deltas and Fix Plan

A) Frontend fixes (safe to apply immediately)

1. Fix CreateRequestModal insert payload
- Replace trade_tag with proper fields; include pricing_preference/flat_rate/hourly_rate; normalize request_type casing; include service_mode mapped to lowercase
- After insert, keep linking tags via request_tags (your code already does this)

Suggested mapping before insert:
- request_type: formData.request_type.toUpperCase()  // 'STANDARD' | 'EMERGENCY'
- service_mode: formData.service_mode.toLowerCase() // 'onsite' | 'remote' | 'hybrid'
- pricing_preference: formData.pricing_preference   // 'NEGOTIABLE' | 'FLAT' | 'HOURLY'
- flat_rate/hourly_rate: numeric or null by preference
- max_responses: null if unlimited

2. Normalize comparisons in UI
- Anywhere UI checks request.request_type (e.g., comparing to 'emergency'), compare uppercase or normalize both sides to avoid mismatches (EMERGENCY vs emergency)

3. Update company fields used in selects/rendering
- Use companies.company_logo_url (or alias as logo_url if supported) and companies.avg_rating/companies.rating_count

B) Backend schema/RPC fixes (SQL patch)

1. Add origin-tracking columns to work_orders (to match accept RPC)
- marketplace_request_id uuid NULL
- marketplace_response_id uuid NULL
- Optional FKs to marketplace_requests/marketplace_responses

2. Fix submit_marketplace_response RPC
- Set response_status to 'INTERESTED' (or 'PENDING_QUOTE' if you want the distinct state), not 'pending'

3. Keep only the correct get_browse_requests overload
- Drop or update the legacy overload that references r.trade_tags; keep the request_tags-based version

4. Consider adding optional location fields on marketplace_requests
- You collect location_address/city/state/postal_code for onsite/hybrid but only postal_code exists; add address/city/state to preserve request intent (or store a JSON location blob)

---

## Proposed SQL Patch (apply in order)

Note: Run against your Supabase Postgres (prefer psql/pg driver). Review in staging first.

1) Add origin columns on work_orders
```sql
ALTER TABLE public.work_orders
  ADD COLUMN IF NOT EXISTS marketplace_request_id uuid NULL,
  ADD COLUMN IF NOT EXISTS marketplace_response_id uuid NULL;

-- Optional: foreign keys (defer if you want faster iteration)
ALTER TABLE public.work_orders
  ADD CONSTRAINT fk_wo_marketplace_request
    FOREIGN KEY (marketplace_request_id) REFERENCES public.marketplace_requests(id) ON DELETE SET NULL;
ALTER TABLE public.work_orders
  ADD CONSTRAINT fk_wo_marketplace_response
    FOREIGN KEY (marketplace_response_id) REFERENCES public.marketplace_responses(id) ON DELETE SET NULL;
```

2) Fix submit_marketplace_response
```sql
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
```

3) Optional: Drop legacy get_browse_requests overload that references r.trade_tags
```sql
-- Retain the version that joins request_tags/tags (pricing_preference_enum, request_type_enum)
-- Drop the older version if present (adjust arg types to match your deployment):
DROP FUNCTION IF EXISTS public.get_browse_requests(uuid, text[], numeric, pricing_enum[], text[]);
```

4) Add request location columns (optional but recommended)
```sql
ALTER TABLE public.marketplace_requests
  ADD COLUMN IF NOT EXISTS location_address text,
  ADD COLUMN IF NOT EXISTS location_city text,
  ADD COLUMN IF NOT EXISTS location_state text;
```

---

## Code Change Sketches (what to edit)

- src/components/Marketplace/CreateRequestModal.js
  - Insert payload should not include trade_tag
  - Include request_type uppercase and service_mode lowercase; add pricing fields

Example adjustment:
<augment_code_snippet path="src/components/Marketplace/CreateRequestModal.js" mode="EXCERPT">
````javascript
const payload = {
  company_id: user.company_id,
  title: formData.title.trim(),
  description: formData.description.trim(),
  request_type: formData.request_type.toUpperCase(),
  service_mode: formData.service_mode.toLowerCase(),
  pricing_preference: formData.pricing_preference,
  flat_rate: formData.pricing_preference === 'FLAT' ? Number(formData.flat_rate) : null,
  hourly_rate: formData.pricing_preference === 'HOURLY' ? Number(formData.hourly_rate) : null,
  max_responses: formData.unlimited_responses ? null : formData.max_responses,
  start_time: formData.start_time || null, end_time: formData.end_time || null,
  status: 'available'
};
````
</augment_code_snippet>

- src/services/MarketplaceService.js (main app) and Customer Portal/src/services/MarketplaceService.js
  - When selecting companies, prefer company_logo_url and avg_rating/rating_count

Example select change:
<augment_code_snippet path="src/services/MarketplaceService.js" mode="EXCERPT">
````javascript
.select(`
  *,
  companies (
    id, name, email, phone,
    avg_rating, rating_count,
    company_logo_url
  )
`)
````
</augment_code_snippet>

- src/pages/Marketplace.js
  - Normalize request_type checks for badges

Example:
<augment_code_snippet path="src/pages/Marketplace.js" mode="EXCERPT">
````javascript
{(request.request_type || '').toUpperCase() === 'EMERGENCY' && (
  <span className="...">EMERGENCY</span>
)}
````
</augment_code_snippet>

---

## Verification Plan (post-fix)
1) Post a new marketplace request with tags
- Expect 200; row has uppercase request_type, lowercase service_mode; tags linked via request_tags
2) Browse requests (contractor)
- get_browse_requests RPC returns the new request; emergency filter works with enum
3) Submit a response
- Either via direct insert or submit_marketplace_response RPC (after fix); response_status in enum; trigger enforces response cap
4) Accept a response (customer/contractor flow)
- RPC creates a work_order row; verify marketplace_request_id and marketplace_response_id populated
5) Notifications
a) Verify a simple GET directly via fetch/Postman to Supabase REST with your current headers; eliminate AdBlock/VPN issues
b) Ensure local error server at http://localhost:4000/save-errors is running or disable that logging path

---

## Notes & Rationale
- Keep DB normalized: request_tags junction table is correct; drop trade_tags remnants
- Use enums consistently: UI should send/cast exactly what DB expects (upper/lower)
- Track marketplace provenance on work_orders: lightweight columns, no pipeline disruption
- Service key in browser is acceptable for beta but should move to server/edge before prod

---

## Immediate Next Actions (recommended)
- Approve the SQL patch set above
- Approve the small UI/code deltas
- I can then implement the code changes, apply SQL in staging, and run a quick end-to-end smoke test

If you want, I can proceed to implement the frontend code edits now and prepare a migration file with the SQL above.

