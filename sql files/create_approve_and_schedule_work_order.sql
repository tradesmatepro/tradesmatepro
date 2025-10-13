-- Atomic approval + scheduling RPC
-- Approves a quote (if needed), validates availability, assigns crew, creates schedule events,
-- and marks the work order as scheduled in a single transaction.
--
-- Inputs:
--   p_quote_id     uuid            -- work_orders.id
--   p_start        timestamptz     -- scheduled start (UTC)
--   p_end          timestamptz     -- scheduled end (UTC)
--   p_employee_ids uuid[]          -- preferred/available employee IDs from client slot
--   p_crew_size    int             -- number of technicians needed
--
-- Returns jsonb: { success, message, scheduled_start, scheduled_end, assigned_employee_ids, created_events }

create or replace function public.approve_and_schedule_work_order(
  p_quote_id uuid,
  p_start timestamptz,
  p_end timestamptz,
  p_employee_ids uuid[] default '{}',
  p_crew_size int default 1
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_status text;
  v_required_crew int;
  v_assignees uuid[] := '{}';
  v_created int := 0;
  v_title text;
  v_work_order_number text;
  v_now timestamptz := now();
  v_missing int;
  v_employee_id uuid;
begin
  -- Basic validations
  if p_quote_id is null then
    raise exception 'p_quote_id is required';
  end if;
  if p_start is null or p_end is null or p_end <= p_start then
    raise exception 'Invalid start/end time';
  end if;
  if coalesce(p_crew_size, 1) < 1 then
    raise exception 'p_crew_size must be >= 1';
  end if;

  -- Load work order
  select company_id, status::text, coalesce((labor_summary->>'crew_size')::int, 1), work_order_number
  into v_company_id, v_status, v_required_crew, v_work_order_number
  from work_orders
  where id = p_quote_id
  for update; -- lock row for update

  if v_company_id is null then
    raise exception 'Work order not found: %', p_quote_id;
  end if;

  -- Determine crew size to use
  v_required_crew := greatest(coalesce(p_crew_size, v_required_crew, 1), 1);

  -- If not yet approved, approve it now
  if v_status in ('sent', 'quote', 'quoted') then
    update work_orders
    set status = 'approved',
        approved_at = coalesce(approved_at, v_now),
        customer_approved_at = coalesce(customer_approved_at, v_now)
    where id = p_quote_id;
  end if;

  -- Use provided preferred employees first, up to crew size
  v_assignees := coalesce(p_employee_ids, '{}')[:v_required_crew];

  -- Verify availability for each selected employee
  foreach v_employee_id in array v_assignees loop
    -- Overlap with existing schedule_events
    if exists (
      select 1 from schedule_events se
      where se.company_id = v_company_id
        and se.employee_id = v_employee_id
        and se.start_time < p_end
        and se.end_time   > p_start
    ) then
      raise exception 'Selected employee % is not available for the requested time window', v_employee_id;
    end if;
  end loop;

  -- Ensure we have enough employees to cover the crew size
  v_missing := v_required_crew - coalesce(array_length(v_assignees, 1), 0);
  if v_missing > 0 then
    -- Try to auto-fill from employees of this company that are not conflicting
    -- and not already in v_assignees
    with eligible as (
      select e.id as employee_id
      from employees e
      where e.company_id = v_company_id
        and (coalesce(e.is_schedulable, true))
        and not (e.id = any(v_assignees))
        and not exists (
          select 1 from schedule_events se
          where se.company_id = v_company_id
            and se.employee_id = e.id
            and se.start_time < p_end
            and se.end_time   > p_start
        )
      limit v_missing
    )
    select coalesce(array_agg(employee_id), '{}') into strict v_assignees
    from (
      select unnest(v_assignees) as employee_id
      union all
      select employee_id from eligible
    ) s;
  end if;

  if coalesce(array_length(v_assignees, 1), 0) < v_required_crew then
    raise exception 'Not enough available technicians. Needed %, available %', v_required_crew, coalesce(array_length(v_assignees, 1), 0);
  end if;

  -- Create schedule_events for each assignee
  v_title := coalesce('Customer Scheduled: Work Order #' || v_work_order_number, 'Customer Scheduled');
  insert into schedule_events (company_id, employee_id, work_order_id, title, start_time, end_time, created_by_customer, auto_scheduled)
  select v_company_id, x.emp_id, p_quote_id, v_title, p_start, p_end, true, true
  from unnest(v_assignees) as x(emp_id);
  get diagnostics v_created = row_count;

  -- Update work order as scheduled
  update work_orders
  set status = 'scheduled',
      scheduled_start = p_start,
      scheduled_end = p_end,
      updated_at = v_now
  where id = p_quote_id;

  return jsonb_build_object(
    'success', true,
    'message', 'Approved and scheduled',
    'work_order_id', p_quote_id,
    'scheduled_start', p_start,
    'scheduled_end', p_end,
    'assigned_employee_ids', v_assignees,
    'created_events', v_created
  );

exception
  when others then
    return jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
end;
$$;

-- Permissions
grant execute on function public.approve_and_schedule_work_order(uuid, timestamptz, timestamptz, uuid[], int) to anon;
grant execute on function public.approve_and_schedule_work_order(uuid, timestamptz, timestamptz, uuid[], int) to authenticated;

