-- Enhanced Marketplace Schema Updates
-- This makes the marketplace truly scalable for any service business

-- 1. Service Tags System (replaces single trade dropdown)
create table if not exists public.service_tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  category text, -- e.g., 'trades', 'professional_services', 'creative', 'hospitality'
  description text,
  created_at timestamptz default now()
);

-- Link table for multiple tags per request
create table if not exists public.marketplace_request_tags (
  request_id uuid references public.marketplace_requests(id) on delete cascade,
  tag_id uuid references public.service_tags(id) on delete cascade,
  primary key (request_id, tag_id)
);

-- 2. Enhanced marketplace_requests table
alter table public.marketplace_requests
  -- Remove old single trade_tag column (will be replaced by tags system)
  drop column if exists trade_tag,
  
  -- Add pricing models
  add column if not exists pricing_type text not null default 'negotiable'
    check (pricing_type in ('flat_rate','hourly_rate','negotiable')),
  add column if not exists hourly_rate_limit numeric(12,2),
  
  -- Make max_responses nullable for unlimited responses
  alter column max_responses drop not null,
  alter column max_responses set default null,
  
  -- Add service modes (onsite/remote/hybrid)
  add column if not exists service_mode text not null default 'onsite'
    check (service_mode in ('onsite','remote','hybrid')),
    
  -- Add inspection workflow
  add column if not exists requires_inspection boolean not null default false,
  
  -- Add location fields for onsite services
  add column if not exists location_address text,
  add column if not exists location_city text,
  add column if not exists location_state text,
  add column if not exists location_postal_code text,
  add column if not exists location_country text default 'US';

-- 3. Enhanced marketplace_responses table
alter table public.marketplace_responses
  -- Add decline tracking
  add column if not exists decline_reason_code text,
  add column if not exists decline_reason text;

-- 4. Seed common service tags
insert into public.service_tags (name, category, description) values
  -- Traditional Trades
  ('plumbing', 'trades', 'Plumbing services and repairs'),
  ('electrical', 'trades', 'Electrical work and installations'),
  ('hvac', 'trades', 'Heating, ventilation, and air conditioning'),
  ('carpentry', 'trades', 'Woodworking and construction'),
  ('painting', 'trades', 'Interior and exterior painting'),
  ('roofing', 'trades', 'Roof installation and repair'),
  ('flooring', 'trades', 'Floor installation and refinishing'),
  ('drywall', 'trades', 'Drywall installation and repair'),
  ('tile work', 'trades', 'Tile installation and repair'),
  ('landscaping', 'trades', 'Lawn care and landscaping'),
  
  -- Home Services
  ('cleaning', 'home_services', 'House and office cleaning'),
  ('handyman', 'home_services', 'General maintenance and repairs'),
  ('pest control', 'home_services', 'Pest and rodent control'),
  ('appliance repair', 'home_services', 'Appliance service and repair'),
  ('window cleaning', 'home_services', 'Window and glass cleaning'),
  
  -- Professional Services
  ('accounting', 'professional_services', 'Bookkeeping and tax services'),
  ('legal services', 'professional_services', 'Legal consultation and representation'),
  ('consulting', 'professional_services', 'Business and management consulting'),
  ('marketing', 'professional_services', 'Marketing and advertising services'),
  ('web design', 'professional_services', 'Website design and development'),
  ('seo', 'professional_services', 'Search engine optimization'),
  ('social media', 'professional_services', 'Social media management'),
  ('copywriting', 'professional_services', 'Content and copywriting services'),
  ('translation', 'professional_services', 'Language translation services'),
  
  -- Creative Services
  ('photography', 'creative', 'Photography and videography'),
  ('graphic design', 'creative', 'Graphic design and branding'),
  ('music lessons', 'creative', 'Music instruction and lessons'),
  ('art classes', 'creative', 'Art instruction and workshops'),
  ('event planning', 'creative', 'Event planning and coordination'),
  ('catering', 'creative', 'Food and catering services'),
  ('baking', 'creative', 'Custom baking and pastries'),
  ('wedding services', 'creative', 'Wedding planning and services'),
  
  -- Specialized Services
  ('fishing charter', 'specialized', 'Fishing and boat charter services'),
  ('tour guide', 'specialized', 'Tourism and guide services'),
  ('personal training', 'specialized', 'Fitness and personal training'),
  ('tutoring', 'specialized', 'Educational tutoring services'),
  ('pet services', 'specialized', 'Pet care and grooming'),
  ('moving services', 'specialized', 'Moving and relocation services'),
  ('security services', 'specialized', 'Security and protection services'),
  ('delivery services', 'specialized', 'Delivery and courier services'),
  
  -- Technology Services
  ('it support', 'technology', 'Computer and IT support'),
  ('software development', 'technology', 'Custom software development'),
  ('app development', 'technology', 'Mobile app development'),
  ('data analysis', 'technology', 'Data analysis and reporting'),
  ('cybersecurity', 'technology', 'Security and data protection')
on conflict (name) do nothing;

-- 5. RPC Function: Create marketplace request with tags
create or replace function public.create_marketplace_request(
  _customer_id uuid,
  _company_id uuid,
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
  _location_address text,
  _location_city text,
  _location_state text,
  _location_postal_code text,
  _tags text[]
)
returns uuid
language plpgsql
as $$
declare
  new_request_id uuid;
  tag_name text;
  tag_id uuid;
begin
  -- Insert request
  insert into public.marketplace_requests
    (customer_id, company_id, title, description, request_type, service_mode, pricing_type,
     budget, hourly_rate_limit, max_responses, requires_inspection, start_time, end_time,
     location_address, location_city, location_state, location_postal_code)
  values
    (_customer_id, _company_id, _title, _description, _request_type, _service_mode, _pricing_type,
     _budget, _hourly_rate_limit, _max_responses, _requires_inspection, _start_time, _end_time,
     _location_address, _location_city, _location_state, _location_postal_code)
  returning id into new_request_id;

  -- Insert tags (create if missing, then link)
  foreach tag_name in array _tags
  loop
    -- Insert or get existing tag
    insert into public.service_tags (name)
    values (lower(trim(tag_name)))
    on conflict (name) do update set name = excluded.name
    returning id into tag_id;
    
    -- If tag already existed, get its ID
    if tag_id is null then
      select id into tag_id from public.service_tags where name = lower(trim(tag_name));
    end if;

    -- Link tag to request
    insert into public.marketplace_request_tags (request_id, tag_id)
    values (new_request_id, tag_id)
    on conflict do nothing;
  end loop;

  return new_request_id;
end;
$$;

-- 6. RPC Function: Respond to marketplace request
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

-- 7. Function to search service tags
create or replace function public.search_service_tags(search_term text)
returns table(id uuid, name text, category text, description text)
language plpgsql
as $$
begin
  return query
  select st.id, st.name, st.category, st.description
  from public.service_tags st
  where st.name ilike '%' || search_term || '%'
     or st.description ilike '%' || search_term || '%'
  order by 
    case when st.name ilike search_term || '%' then 1 else 2 end,
    st.name
  limit 20;
end;
$$;
