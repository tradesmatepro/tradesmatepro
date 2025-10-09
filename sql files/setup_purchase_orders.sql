-- Purchase Orders schema for TradeMate Pro
-- Run this in Supabase SQL editor. Company-scoped with basic RLS-ready structure.

-- 1) Vendors (optional, you can skip if you prefer free-text vendor fields)
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  contact_name text,
  email text,
  phone text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  zip_code text,
  country text default 'United States',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (company_id, name)
);

-- 2) Purchase Orders
create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  po_number text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT','SENT','APPROVED','PARTIAL','RECEIVED','CLOSED','CANCELLED')),
  vendor_id uuid references public.vendors(id) on delete set null,
  vendor_name text,
  vendor_contact text,
  vendor_email text,
  vendor_phone text,
  ship_to_name text,
  ship_to_address_line_1 text,
  ship_to_address_line_2 text,
  ship_to_city text,
  ship_to_state text,
  ship_to_zip_code text,
  ship_to_country text default 'United States',
  expected_date date,
  currency text default 'USD',
  subtotal numeric,
  tax_rate numeric,
  tax_amount numeric,
  shipping_amount numeric,
  total_amount numeric,
  notes text,
  terms text,
  attachments jsonb default '[]'::jsonb,
  related_work_order_id uuid references public.work_orders(id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (company_id, po_number)
);

-- 3) Purchase Order Items
create table if not exists public.po_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  item_sku text,
  item_name text not null,
  description text,
  quantity numeric not null default 1,
  unit_cost numeric not null default 0,
  tax_rate numeric,
  line_total numeric,
  received_quantity numeric not null default 0,
  supplier_part_number text,
  inventory_item_id uuid references public.inventory_items(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4) PO Status History (audit)
create table if not exists public.po_status_history (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  old_status text,
  new_status text,
  changed_by uuid references public.users(id) on delete set null,
  note text,
  changed_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_po_company on public.purchase_orders(company_id);
create index if not exists idx_po_status on public.purchase_orders(company_id, status);
create index if not exists idx_po_number on public.purchase_orders(company_id, po_number);
create index if not exists idx_po_items_po on public.po_items(company_id, purchase_order_id);
create index if not exists idx_po_vendor on public.purchase_orders(company_id, vendor_id);

-- RLS (enable and add policies as you usually do)
-- alter table public.purchase_orders enable row level security;
-- alter table public.po_items enable row level security;
-- alter table public.vendors enable row level security;
-- alter table public.po_status_history enable row level security;
-- Create company_id-based SELECT/INSERT/UPDATE policies similar to other tables.

