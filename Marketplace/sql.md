Got it 👍 — here’s a clean recap of the SQL we’ve already implemented, with a short description for each. You can drop this straight into a doc for Claude so he knows exactly what exists and doesn’t try to reinvent things.

📌 Marketplace SQL Baseline (Implemented)
1. Marketplace Requests

Holds all job requests (customer → company, or company → company).

create table public.marketplace_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null, -- if a company posts
  title text not null,
  description text,
  trade_tag text not null, -- e.g. 'plumber', 'electrician'
  budget numeric(12,2),
  request_type text not null default 'standard'
    check (request_type in ('standard','emergency')),
  max_responses int default 5,
  response_count int default 0,
  status text not null default 'available'
    check (status in (
      'available','negotiation','auto_hold',
      'booked','in_progress','completed','canceled'
    )),
  start_time timestamptz,
  end_time timestamptz,
  booked_response_id uuid, -- FK added later
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

2. Marketplace Responses

Offers from companies replying to a request.

create table public.marketplace_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.marketplace_requests(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  response_status text not null
    check (response_status in ('accepted','declined','counter')),
  counter_offer numeric(12,2),
  available_start timestamptz,
  available_end timestamptz,
  message text,
  created_at timestamptz default now()
);

3. Link Requests → Responses

Connects a request to its “winning” booked response.

alter table public.marketplace_requests
  add constraint fk_marketplace_requests_booked_response
  foreign key (booked_response_id)
  references public.marketplace_responses(id)
  on delete set null;

4. Reviews

Customer feedback for completed jobs.

create table public.marketplace_reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.marketplace_requests(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  review text,
  created_at timestamptz default now()
);

5. Auto-Accept Rules

Lets companies configure “auto-book if conditions met.”

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

6. Preferred Relationships

Unifies customer and company favorites in one table.

create table public.preferred_relationships (
  id uuid primary key default gen_random_uuid(),
  requester_customer_id uuid references public.customers(id) on delete cascade,
  requester_company_id uuid references public.companies(id) on delete cascade,
  preferred_company_id uuid references public.companies(id) on delete cascade not null,
  created_at timestamptz default now(),
  check (
    (requester_customer_id is not null and requester_company_id is null)
    or
    (requester_customer_id is null and requester_company_id is not null)
  ),
  unique (requester_customer_id, requester_company_id, preferred_company_id)
);

7. Company Emergency Settings

Extends companies for emergency jobs.

alter table public.companies
  add column accepts_emergency boolean not null default false,
  add column emergency_fee numeric(12,2),
  add column nights_weekends boolean not null default false;


(Already applied, confirmed by inspection ✅)

8. Response Cap Trigger

Prevents requests from exceeding max_responses.

create or replace function enforce_response_cap()
returns trigger as $$
begin
  if (select response_count from public.marketplace_requests where id = new.request_id) >=
     (select max_responses from public.marketplace_requests where id = new.request_id) then
    raise exception 'This request is no longer accepting responses';
  end if;

  update public.marketplace_requests
    set response_count = response_count + 1
    where id = new.request_id;

  return new;
end;
$$ language plpgsql;

create trigger trg_enforce_response_cap
before insert on public.marketplace_responses
for each row
execute function enforce_response_cap();

9. Ratings Sync Triggers

Keeps companies.avg_rating and rating_count in sync with marketplace_reviews.

create or replace function update_company_rating(company uuid)
returns void as $$
begin
  update public.companies c
  set avg_rating = sub.new_avg,
      rating_count = sub.new_count
  from (
    select
      r.company_id,
      avg(r.rating)::numeric(3,2) as new_avg,
      count(r.id) as new_count
    from public.marketplace_reviews r
    where r.company_id = company
    group by r.company_id
  ) sub
  where c.id = sub.company_id;
end;
$$ language plpgsql;

create or replace function trg_review_insert()
returns trigger as $$
begin
  perform update_company_rating(new.company_id);
  return new;
end;
$$ language plpgsql;

create or replace function trg_review_update()
returns trigger as $$
begin
  perform update_company_rating(new.company_id);
  return new;
end;
$$ language plpgsql;

create or replace function trg_review_delete()
returns trigger as $$
begin
  perform update_company_rating(old.company_id);
  return old;
end;
$$ language plpgsql;

create trigger trg_marketplace_review_insert
after insert on public.marketplace_reviews
for each row
execute function trg_review_insert();

create trigger trg_marketplace_review_update
after update on public.marketplace_reviews
for each row
execute function trg_review_update();

create trigger trg_marketplace_review_delete
after delete on public.marketplace_reviews
for each row
execute function trg_review_delete();

✅ Current Status

Marketplace schema is installed and working.

Emergency support, auto-accept, preferred companies, reviews, and response caps are implemented.

Companies table has been cleaned (standardized to avg_rating + rating_count).

📌 Step 1: Decline Reasons (Response-Level)

Each response can have an optional reason when status = declined.

alter table public.marketplace_responses
  add column decline_reason text,
  add column decline_reason_code text;  -- e.g. 'too_low_budget', 'schedule_conflict'


💡 decline_reason_code lets you standardize reporting, while decline_reason gives contractors free text if they want.

📌 Step 2: Cancellation Reasons (Request-Level)

When a request (job) is canceled, we capture who canceled and why.

create table public.marketplace_cancellations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.marketplace_requests(id) on delete cascade,
  canceled_by_customer_id uuid references public.customers(id) on delete set null,
  canceled_by_company_id uuid references public.companies(id) on delete set null,
  reason_code text, -- e.g. 'customer_unresponsive', 'price_dispute', 'personal_issue'
  reason text,      -- optional free-text reason
  created_at timestamptz default now()
);


💡 This allows:

Customers and companies to both cancel.

Analytics: "Top reasons jobs get canceled" → you can use this later for auto feedback suggestions.

📌 Step 3: Status Sync on Cancel

When a cancellation record is inserted, we should also flip the request status.

create or replace function trg_cancel_request()
returns trigger as $$
begin
  update public.marketplace_requests
  set status = 'canceled'
  where id = new.request_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_marketplace_request_cancel
after insert on public.marketplace_cancellations
for each row
execute function trg_cancel_request();

📌 Marketplace SQL Baseline (Final)
1. Marketplace Requests
create table if not exists public.marketplace_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  title text not null,
  description text,
  trade_tag text not null,
  budget numeric(12,2),
  request_type text not null default 'standard'
    check (request_type in ('standard','emergency')),
  max_responses int default 5,
  response_count int default 0,
  total_declines int not null default 0,
  status text not null default 'available'
    check (status in (
      'available','negotiation','auto_hold',
      'booked','in_progress','completed','canceled'
    )),
  start_time timestamptz,
  end_time timestamptz,
  booked_response_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.marketplace_requests
  add constraint fk_marketplace_requests_booked_response
  foreign key (booked_response_id)
  references public.marketplace_responses(id)
  on delete set null;

2. Marketplace Responses
create table if not exists public.marketplace_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.marketplace_requests(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  response_status text not null
    check (response_status in ('accepted','declined','counter')),
  counter_offer numeric(12,2),
  available_start timestamptz,
  available_end timestamptz,
  message text,
  decline_reason_code text references public.decline_reason_codes(code),
  decline_reason text,
  created_at timestamptz default now()
);

3. Reviews
create table if not exists public.marketplace_reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.marketplace_requests(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  review text,
  created_at timestamptz default now()
);

4. Auto-Accept Rules
create table if not exists public.auto_accept_rules (
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

5. Preferred Relationships
create table if not exists public.preferred_relationships (
  id uuid primary key default gen_random_uuid(),
  requester_customer_id uuid references public.customers(id) on delete cascade,
  requester_company_id uuid references public.companies(id) on delete cascade,
  preferred_company_id uuid references public.companies(id) on delete cascade not null,
  created_at timestamptz default now(),
  check (
    (requester_customer_id is not null and requester_company_id is null)
    or
    (requester_customer_id is null and requester_company_id is not null)
  ),
  unique (requester_customer_id, requester_company_id, preferred_company_id)
);

6. Companies Emergency Settings
alter table public.companies
  add column if not exists accepts_emergency boolean not null default false,
  add column if not exists emergency_fee numeric(12,2),
  add column if not exists nights_weekends boolean not null default false,
  add column if not exists avg_rating numeric(3,2) default 0,
  add column if not exists rating_count int default 0;

7. Decline Reason Codes
create table if not exists public.decline_reason_codes (
  code text primary key,
  description text not null
);

insert into public.decline_reason_codes (code, description) values
  ('too_low_budget', 'Offered budget is too low'),
  ('schedule_conflict', 'Not available at requested time'),
  ('out_of_scope', 'Job is outside my expertise'),
  ('distance_too_far', 'Job is outside my service area'),
  ('customer_history', 'Past issues with this customer'),
  ('other', 'Other reason')
on conflict do nothing;

8. Cancellation Reason Codes
create table if not exists public.cancellation_reason_codes (
  code text primary key,
  description text not null
);

insert into public.cancellation_reason_codes (code, description) values
  ('customer_unresponsive', 'Customer stopped responding'),
  ('price_dispute', 'Could not agree on price'),
  ('schedule_conflict', 'Scheduling conflict'),
  ('personal_issue', 'Personal or company issue'),
  ('emergency', 'Unexpected emergency'),
  ('other', 'Other reason')
on conflict do nothing;

9. Marketplace Cancellations
create table if not exists public.marketplace_cancellations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.marketplace_requests(id) on delete cascade,
  canceled_by_customer_id uuid references public.customers(id) on delete set null,
  canceled_by_company_id uuid references public.companies(id) on delete set null,
  reason_code text references public.cancellation_reason_codes(code),
  reason text,
  created_at timestamptz default now()
);

10. Decline Stats Table
create table if not exists public.marketplace_request_decline_stats (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.marketplace_requests(id) on delete cascade,
  reason_code text references public.decline_reason_codes(code),
  decline_count int not null default 0,
  updated_at timestamptz default now(),
  unique (request_id, reason_code)
);

11. Response Cap Trigger
create or replace function enforce_response_cap()
returns trigger as $$
begin
  if (select response_count from public.marketplace_requests where id = new.request_id) >=
     (select max_responses from public.marketplace_requests where id = new.request_id) then
    raise exception 'This request is no longer accepting responses';
  end if;

  update public.marketplace_requests
  set response_count = response_count + 1,
      updated_at = now()
  where id = new.request_id;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_enforce_response_cap on public.marketplace_responses;

create trigger trg_enforce_response_cap
before insert on public.marketplace_responses
for each row
execute function enforce_response_cap();

12. Decline Tracking Trigger
create or replace function trg_log_decline_reason()
returns trigger as $$
begin
  -- New decline
  if new.response_status = 'declined' and new.decline_reason_code is not null then
    insert into public.marketplace_request_decline_stats (request_id, reason_code, decline_count)
    values (new.request_id, new.decline_reason_code, 1)
    on conflict (request_id, reason_code)
    do update set decline_count = marketplace_request_decline_stats.decline_count + 1,
                  updated_at = now();

    update public.marketplace_requests
    set total_declines = total_declines + 1,
        updated_at = now()
    where id = new.request_id;
  end if;

  -- Undo decline
  if old.response_status = 'declined' and new.response_status <> 'declined' and old.decline_reason_code is not null then
    update public.marketplace_request_decline_stats
    set decline_count = greatest(decline_count - 1, 0),
        updated_at = now()
    where request_id = old.request_id and reason_code = old.decline_reason_code;

    update public.marketplace_requests
    set total_declines = greatest(total_declines - 1, 0),
        updated_at = now()
    where id = old.request_id;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_marketplace_response_decline on public.marketplace_responses;

create trigger trg_marketplace_response_decline
after insert or update on public.marketplace_responses
for each row
execute function trg_log_decline_reason();

13. Cancellation Trigger
create or replace function trg_cancel_request()
returns trigger as $$
begin
  update public.marketplace_requests
  set status = 'canceled',
      updated_at = now()
  where id = new.request_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_marketplace_request_cancel on public.marketplace_cancellations;

create trigger trg_marketplace_request_cancel
after insert on public.marketplace_cancellations
for each row
execute function trg_cancel_request();