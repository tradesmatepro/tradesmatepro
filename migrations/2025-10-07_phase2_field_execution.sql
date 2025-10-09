-- Phase 2: Field Execution Pack (checklists, photos, signatures)
-- NOTE: Idempotent creation with IF NOT EXISTS

create table if not exists work_order_checklists (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  work_order_id uuid not null references work_orders(id) on delete cascade,
  name text not null default 'Completion Checklist',
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_work_order_checklists_wo on work_order_checklists(work_order_id);

create table if not exists work_order_checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references work_order_checklists(id) on delete cascade,
  description text not null,
  required boolean not null default false,
  completed boolean not null default false,
  completed_by uuid references users(id),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_work_order_checklist_items_checklist on work_order_checklist_items(checklist_id);

create table if not exists work_order_photos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  work_order_id uuid not null references work_orders(id) on delete cascade,
  uploaded_by uuid references users(id),
  url text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index if not exists idx_work_order_photos_wo on work_order_photos(work_order_id);

-- Minimal signatures (typed name); can be upgraded later to canvas/draw
create table if not exists work_order_signatures (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  work_order_id uuid not null references work_orders(id) on delete cascade,
  signer_name text not null,
  signer_role text,
  signature_type text not null default 'typed',
  signature_data text, -- typed name or data URL placeholder
  signed_at timestamptz not null default now()
);

create index if not exists idx_work_order_signatures_wo on work_order_signatures(work_order_id);

