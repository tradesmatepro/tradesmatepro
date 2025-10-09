-- Optional: Create a view to accelerate closed jobs/history queries
-- This view shows completed jobs and those linked to invoices
create or replace view public.work_orders_history as
select
  wo.id,
  wo.company_id,
  wo.customer_id,
  wo.title,
  wo.description,
  wo.job_status,
  wo.work_status,
  wo.invoice_id,
  wo.updated_at,
  c.name as customer_name,
  c.email as customer_email,
  c.phone as customer_phone
from public.work_orders wo
left join public.customers c on c.id = wo.customer_id
where (wo.job_status = 'COMPLETED') or (wo.invoice_id is not null);

-- Grant select to anon/authenticated if needed (RLS off in beta)
-- grant select on public.work_orders_history to anon, authenticated;

