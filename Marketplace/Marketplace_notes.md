📌 Marketplace Baseline (v1.0 Reference)
🔹 Purpose

The Marketplace is the discovery and matching system for customers, contractors, and subcontractors.

Customers post jobs.

Contractors and subs respond with offers.

Customers (or GCs) choose who to book.

Transparency, fairness, and simplicity are core.

This is not duplicated inside dashboards. It’s a standalone module connected to both sides of the app.

🔹 Core Flow
1. Posting a Request

Can be created by a customer (looking for a contractor) or a contractor (looking for subs).

Required fields:

Title, description

Trade tags (plumber, electrician, drywall, etc.)

Location / zip code

Request type (standard or emergency)

Budget (optional or required depending on context)

Max responses (default = 5)

Preferred date/time (optional)

2. Contractor/Helper Responses

Stored in marketplace_responses.

Contractor can:

Accept (with rate + availability)

Counter (propose new rate/time)

Decline (optionally give reason → used for system feedback)

3. Customer/GC Selection

Not first-come-first-serve.

Multiple contractors can submit offers.

Customer/GC sees offers side-by-side:

Rate / counter offer

Availability (start/end)

Rating & verification badges

Emergency fee (if applicable)

They choose which to book → job moves to booked.

4. Emergency Requests

Contractors can toggle accept emergency + set emergency fee.

Only those contractors get pinged for emergencies.

Emergency offers highlight ETA (e.g., “available in 1h vs tomorrow”).

Customer chooses based on speed vs price.

5. Auto-Accept (Future Layer)

Once ratings are established, requesters can set auto-accept rules:

Example: Auto-book electricians with ≥4★ rating, fee ≤$120/hr, ETA <2h.

Auto-accept puts request into auto_hold → 5-minute undo → then booked.

🔹 Backend / Database
Marketplace Requests
create table public.marketplace_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  contractor_id uuid references public.contractors(id) on delete set null,
  title text not null,
  description text,
  trade_tag text not null,
  budget numeric(12,2),
  request_type text not null default 'standard'
    check (request_type in ('standard','emergency')),
  max_responses int default 5,
  response_count int default 0,
  status text not null default 'available'
    check (status in ('available','negotiation','auto_hold','booked','in_progress','completed','canceled')),
  start_time timestamptz,
  end_time timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

Marketplace Responses
create table public.marketplace_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.marketplace_requests(id) on delete cascade,
  contractor_id uuid references public.contractors(id) on delete cascade,
  response_status text not null
    check (response_status in ('accepted','declined','counter')),
  counter_offer numeric(12,2),
  available_start timestamptz,
  available_end timestamptz,
  message text,
  created_at timestamptz default now()
);

Reviews (for fairness + ratings)
create table public.marketplace_reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.marketplace_requests(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  contractor_id uuid references public.contractors(id) on delete cascade,
  rating int check (rating between 1 and 5),
  review text,
  created_at timestamptz default now()
);

Auto-Accept Rules (future)
create table public.auto_accept_rules (
  id uuid primary key default gen_random_uuid(),
  requester_company_id uuid references public.companies(id) on delete cascade,
  trade_tag text not null,
  request_type text not null default 'standard'
    check (request_type in ('standard','emergency')),
  min_internal_rating numeric(3,2) default 0,
  require_verified boolean default false,
  max_hourly_rate numeric(12,2),
  max_eta_hours int,
  max_distance_km numeric(6,2),
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

🔹 Fairness & Transparency Rules

Customers and contractors both see why a job was booked/not booked.

Decline reasons feed back into system nudges:

“3 contractors declined due to budget → consider raising it.”

Requests expire after X hours (emergency) or Y days (standard).

Both sides can block/blacklist bad actors.

Response caps prevent spam (default = 5).

🔹 Competitive Differentiators

How Marketplace beats Angi/Thumbtack/Jobber/Housecall:

Transparency: customers see offers side-by-side with rates, times, ratings.

Fairness: no first-come-first-serve, no pay-to-play leads.

Control: requesters set max responses, auto-accept rules, emergency fees.

Flexibility: works for customers → contractors and contractors → subs.

Trust: tiered verification + ratings/reviews + repeat-customer badges.

🔹 UX Principles

Simple upfront: request form defaults to minimal fields.

Advanced on demand: expand to set budget, tools, materials, max responses.

Role-gated: customer, contractor, and sub each see only their flows.

Progressive disclosure: show only what’s relevant at each stage.

✅ With this baseline doc, you now have a full Marketplace blueprint:

Clear purpose

How it works

DB schema

Transparency/fairness rules

Competitive differentiators