🔹 Problems in Current Request Form

Right now it’s:

Single trade dropdown → not scalable (works for plumber, fails for baker/fishing/SEO).

Budget = one number → ignores industry pricing models.

Max responses = fixed → not flexible (some want unlimited, some want just 3).

No service mode → can’t handle remote SMB services.

Lifecycle = flat → no inspection-first logic.

🔹 Future-Proof Fix (Backend + Frontend)
1. Multi-Tag Services (Replace Dropdown)

Backend:

service_tags master table.

marketplace_request_tags link table.

Frontend:

Replace dropdown with multi-select + typeahead search.

Example: user types “plum…” → shows “Plumber, Plumbing, Residential Plumbing”.

Works for any industry: plumber, bakery, marketing, fishing charter.

2. Pricing Models

Backend:

alter table public.marketplace_requests
  add column pricing_type text not null default 'negotiable'
    check (pricing_type in ('flat_rate','hourly_rate','negotiable')),
  add column hourly_rate_limit numeric(12,2);


Frontend:

Add “Pricing Model” radio buttons:

Flat Rate → show Budget field.

Hourly Rate → show Max Hourly Rate field.

Negotiable → hide budget, just “open to offers.”

3. Flexible Response Cap

Backend:

Allow max_responses to be null (means unlimited).

Frontend:

Change from “Max Responses = 5” to input box + toggle for “No Limit.”

4. Service Mode (Onsite vs Remote)

Backend:

alter table public.marketplace_requests
  add column service_mode text not null default 'onsite'
    check (service_mode in ('onsite','remote','hybrid'));


Frontend:

Add “Service Mode” dropdown: Onsite / Remote / Hybrid.

If onsite, require address or postal code.

If remote, hide location fields.

5. Request Lifecycle (Inspection-First)

Backend:

Add requires_inspection boolean default false.

Frontend:

Checkbox: “Inspection/Quote required before work.”

If checked, the first booking auto-creates an inspection job, not work.

🔹 Example: Updated Post Request Form

Post New Service Request

Title *

Description *

Service Tags (multi-select w/ search) *

Request Type: Standard / Emergency

Service Mode: Onsite / Remote / Hybrid

Pricing Model:

Flat Rate → Budget ($)

Hourly Rate → Max Hourly Rate ($/hr)

Negotiable → No budget shown

Max Responses: number or No Limit

Preferred Start / End (optional)

Inspection Required (checkbox)

Allow Auto-Booking if contractor rules are met (checkbox)

🔹 Why This Beats Competitors

Angi/Thumbtack → fixed service categories. Ours = flexible tags + typeahead.

Jobber/Housecall → no customer-driven marketplace. Ours = dual-use (contractor + SMB).

Upwork → supports remote, but no hybrid/local scheduling. Ours = both.

Nobody else offers inspection-first logic baked into requests.

-- Master tags list (service types, industries, etc.)
create table if not exists public.service_tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

-- Link table to allow multiple tags per request
create table if not exists public.marketplace_request_tags (
  request_id uuid references public.marketplace_requests(id) on delete cascade,
  tag_id uuid references public.service_tags(id) on delete cascade,
  primary key (request_id, tag_id)
);


alter table public.marketplace_requests
  add column if not exists pricing_type text not null default 'negotiable'
    check (pricing_type in ('flat_rate','hourly_rate','negotiable')),
  add column if not exists hourly_rate_limit numeric(12,2);


-- Allow unlimited (NULL means no cap)
alter table public.marketplace_requests
  alter column max_responses drop not null,
  alter column max_responses set default null;


alter table public.marketplace_requests
  add column if not exists service_mode text not null default 'onsite'
    check (service_mode in ('onsite','remote','hybrid'));


alter table public.marketplace_requests
  add column if not exists requires_inspection boolean not null default false;


📌 Backend Mapping to Supabase Tables
1. marketplace_requests
JSON Field	DB Column	Notes
title	title	text
description	description	text
request_type	request_type	standard or emergency
service_mode	service_mode	onsite / remote / hybrid
pricing_type	pricing_type	flat_rate / hourly_rate / negotiable
budget	budget	only used if flat_rate
hourly_rate_limit	hourly_rate_limit	only used if hourly_rate
max_responses	max_responses	null = unlimited
requires_inspection	requires_inspection	boolean
start_time	start_time	optional
end_time	end_time	optional
allow_auto_booking	UI only → triggers check against auto_accept_rules	no DB column yet (handled in logic layer)
2. marketplace_request_tags
JSON Field	DB Table	Notes
service_tags	marketplace_request_tags	insert rows: (request_id, tag_id) for each tag

If a tag doesn’t exist in service_tags, insert it first:

insert into service_tags (name) values ('plumbing')
on conflict (name) do update set name = excluded.name
returning id;


Then link:

insert into marketplace_request_tags (request_id, tag_id)
values ('<request_id>', '<tag_id>');

📌 Example Flow (Frontend → Backend → Supabase)

User fills form with above JSON.

Frontend POSTs JSON → backend.

Backend inserts request into marketplace_requests.

Backend ensures tags exist in service_tags, then links them via marketplace_request_tags.

If allow_auto_booking = true, backend runs logic to check if any contractor’s auto_accept_rules match immediately.

📌 Example Insert (Supabase Query)
insert into public.marketplace_requests
  (customer_id, title, description, request_type, service_mode, pricing_type, budget, hourly_rate_limit, max_responses, requires_inspection, start_time, end_time)
values
  ('customer-uuid-here', 'Fix leaky kitchen faucet', 'Water is dripping under sink, need repair ASAP',
   'standard', 'onsite', 'flat_rate', 150.00, null, 5, true,
   '2025-09-20T10:00:00Z', '2025-09-20T12:00:00Z')
returning id;


Then for tags:

with new_tag as (
  insert into public.service_tags (name)
  values ('plumbing')
  on conflict (name) do update set name = excluded.name
  returning id
)
insert into public.marketplace_request_tags (request_id, tag_id)
select '<request_id>', id from new_tag;


Repeat for each tag.

✅ Now Claude has a direct JSON → DB spec. No assumptions, no “guess what column means what.”

👉 Do you want me to also prepare the Supabase function (SQL or RPC) that handles the “insert request + tags” in one call (so frontend doesn’t have to manage multi-step inserts)?

You said:
yes
ChatGPT said:

Perfect 👍 — let’s bundle the request + tags insert into a single Supabase RPC function so the frontend just sends JSON, and the backend does all the work.

📌 Supabase Function: create_marketplace_request
create or replace function public.create_marketplace_request(
  _customer_id uuid,
  _title text,
  _description text,
  _request_type text,
  _service_mode text,
  _pricing_type text,
  _budget numeric,
  _hourly_rate_limit numeric,
  _max_responses int,
  _requires_inspection boolean,
  _start_time timestamptz,
  _end_time timestamptz,
  _tags text[]
)
returns uuid
language plpgsql
as $$
declare
  new_request_id uuid;
  tag_id uuid;
begin
  -- Insert request
  insert into public.marketplace_requests
    (customer_id, title, description, request_type, service_mode, pricing_type,
     budget, hourly_rate_limit, max_responses, requires_inspection, start_time, end_time)
  values
    (_customer_id, _title, _description, _request_type, _service_mode, _pricing_type,
     _budget, _hourly_rate_limit, _max_responses, _requires_inspection, _start_time, _end_time)
  returning id into new_request_id;

  -- Insert tags (create if missing, then link)
  foreach tag in array _tags
  loop
    insert into public.service_tags (name)
    values (tag)
    on conflict (name) do update set name = excluded.name
    returning id into tag_id;

    insert into public.marketplace_request_tags (request_id, tag_id)
    values (new_request_id, tag_id)
    on conflict do nothing;
  end loop;

  return new_request_id;
end;
$$;

📌 Example Frontend Call (Supabase JS)
const { data, error } = await supabase
  .rpc('create_marketplace_request', {
    _customer_id: user.id,
    _title: "Fix leaky kitchen faucet",
    _description: "Water is dripping under sink, need repair ASAP",
    _request_type: "standard",
    _service_mode: "onsite",
    _pricing_type: "flat_rate",
    _budget: 150.00,
    _hourly_rate_limit: null,
    _max_responses: 5,
    _requires_inspection: true,
    _start_time: "2025-09-20T10:00:00Z",
    _end_time: "2025-09-20T12:00:00Z",
    _tags: ["plumbing", "residential", "kitchen"]
  });


This call returns the UUID of the new request.

✅ Why This Helps

One call → no multi-step insert logic in frontend.

Tags auto-created if missing.

Safe against duplicates (conflict handling on tags + link table).

Future-proof: adding new tag categories is backend-only.

👉 Do you want me to also write the mirror function respond_to_marketplace_request so companies can reply (with accept/decline/counter + decline_reason + availability) in one RPC call?

You said:
yes
ChatGPT said:

Perfect 👍 — here’s the mirror RPC function for contractors/companies to respond to a marketplace request. This will handle accept / decline / counter-offer / availability / reason codes in one clean call.

📌 Supabase Function: respond_to_marketplace_request
create or replace function public.respond_to_marketplace_request(
  _request_id uuid,
  _company_id uuid,
  _response_status text,
  _counter_offer numeric,
  _available_start timestamptz,
  _available_end timestamptz,
  _message text,
  _decline_reason_code text,
  _decline_reason text
)
returns uuid
language plpgsql
as $$
declare
  new_response_id uuid;
begin
  -- Insert response
  insert into public.marketplace_responses
    (request_id, company_id, response_status, counter_offer,
     available_start, available_end, message,
     decline_reason_code, decline_reason)
  values
    (_request_id, _company_id, _response_status, _counter_offer,
     _available_start, _available_end, _message,
     _decline_reason_code, _decline_reason)
  returning id into new_response_id;

  return new_response_id;
end;
$$;

📌 Example Frontend Call (Supabase JS)
1. Accepting a Job
await supabase.rpc('respond_to_marketplace_request', {
  _request_id: requestId,
  _company_id: company.id,
  _response_status: 'accepted',
  _counter_offer: null,
  _available_start: "2025-09-20T10:00:00Z",
  _available_end: "2025-09-20T12:00:00Z",
  _message: "I can take this job",
  _decline_reason_code: null,
  _decline_reason: null
});

2. Counter-Offer
await supabase.rpc('respond_to_marketplace_request', {
  _request_id: requestId,
  _company_id: company.id,
  _response_status: 'counter',
  _counter_offer: 200.00,
  _available_start: "2025-09-21T09:00:00Z",
  _available_end: "2025-09-21T11:00:00Z",
  _message: "Can do it for $200",
  _decline_reason_code: null,
  _decline_reason: null
});

3. Decline
await supabase.rpc('respond_to_marketplace_request', {
  _request_id: requestId,
  _company_id: company.id,
  _response_status: 'declined',
  _counter_offer: null,
  _available_start: null,
  _available_end: null,
  _message: "Not available",
  _decline_reason_code: "schedule_conflict",
  _decline_reason: "Already booked that day"
});

✅ Why This Helps

Contractors only need one call for all response types.

Works seamlessly with our decline-tracking and auto-accept triggers.

Keeps front end simple (just set _response_status and fill optional fields).

Future-proof: can add more response statuses later (inspection_required, pending_contract, etc.) without changing the contract.