-- Phase 1: Scheduling Intelligence v1 (skills/capacity + overbooking guards)
-- Creates normalized skills tables and basic capacity field

begin;

-- 1) Skills catalog (per company)
create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint skills_unique_name_per_company unique (company_id, name)
);

-- 2) Employee skills mapping
create table if not exists employee_skills (
  employee_id uuid not null references employees(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  level smallint, -- 1-5 scale optional
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (employee_id, skill_id)
);

-- 3) Work order required skills
create table if not exists work_order_required_skills (
  work_order_id uuid not null references work_orders(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  required_level smallint,
  quantity smallint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (work_order_id, skill_id)
);

-- 4) Capacity per employee (hours/day)
alter table if exists employees
  add column if not exists capacity_hours_per_day numeric(4,2) default 8;

-- 5) Basic updated_at triggers (optional minimal)
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach trigger to tables created above
create trigger set_updated_at_skills
before update on skills
for each row execute function set_updated_at();

create trigger set_updated_at_employee_skills
before update on employee_skills
for each row execute function set_updated_at();

create trigger set_updated_at_work_order_required_skills
before update on work_order_required_skills
for each row execute function set_updated_at();

commit;
