-- Fix Calendar Function - Complete Implementation
-- This creates the missing get_calendar_events_with_context function

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_calendar_events_with_context(uuid, timestamp with time zone, timestamp with time zone);

-- Create the comprehensive calendar events function
CREATE OR REPLACE FUNCTION get_calendar_events_with_context(
    p_company_id uuid,
    p_start_date timestamp with time zone DEFAULT NULL,
    p_end_date timestamp with time zone DEFAULT NULL,
    p_employee_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    event_type text,
    status text,
    work_order_id uuid,
    work_order_stage text,
    work_order_status text,
    customer_id uuid,
    customer_name text,
    employee_id uuid,
    employee_name text,
    service_address text,
    estimated_duration integer,
    total_amount numeric,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        se.id,
        se.title,
        se.description,
        se.start_time,
        se.end_time,
        COALESCE(se.event_type, 'appointment') as event_type,
        COALESCE(se.status, 'scheduled') as status,
        se.work_order_id,
        CASE 
            WHEN wo.stage IS NOT NULL THEN wo.stage::text
            ELSE NULL
        END as work_order_stage,
        CASE 
            WHEN wo.work_status IS NOT NULL THEN wo.work_status::text
            WHEN wo.job_status IS NOT NULL THEN wo.job_status::text
            WHEN wo.quote_status IS NOT NULL THEN wo.quote_status::text
            ELSE wo.status
        END as work_order_status,
        se.customer_id,
        COALESCE(c.company_name, c.first_name || ' ' || c.last_name) as customer_name,
        se.employee_id,
        COALESCE(u.first_name || ' ' || u.last_name, u.email) as employee_name,
        CASE 
            WHEN wo.service_address_line_1 IS NOT NULL THEN 
                wo.service_address_line_1 || 
                CASE WHEN wo.service_city IS NOT NULL THEN ', ' || wo.service_city ELSE '' END ||
                CASE WHEN wo.service_state IS NOT NULL THEN ', ' || wo.service_state ELSE '' END
            ELSE NULL
        END as service_address,
        wo.estimated_duration,
        wo.total_amount,
        se.created_at,
        se.updated_at
    FROM schedule_events se
    LEFT JOIN work_orders wo ON se.work_order_id = wo.id
    LEFT JOIN customers c ON se.customer_id = c.id
    LEFT JOIN users u ON se.employee_id = u.id
    WHERE se.company_id = p_company_id
        AND (p_start_date IS NULL OR se.start_time >= p_start_date)
        AND (p_end_date IS NULL OR se.end_time <= p_end_date)
        AND (p_employee_id IS NULL OR se.employee_id = p_employee_id)
    ORDER BY se.start_time ASC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_calendar_events_with_context(uuid, timestamp with time zone, timestamp with time zone, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_calendar_events_with_context(uuid, timestamp with time zone, timestamp with time zone, uuid) TO service_role;

-- Create a simpler version for backward compatibility
CREATE OR REPLACE FUNCTION get_calendar_events_with_context(
    p_company_id uuid
)
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    event_type text,
    status text,
    work_order_id uuid,
    work_order_stage text,
    work_order_status text,
    customer_id uuid,
    customer_name text,
    employee_id uuid,
    employee_name text,
    service_address text,
    estimated_duration integer,
    total_amount numeric,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM get_calendar_events_with_context(p_company_id, NULL::timestamp with time zone, NULL::timestamp with time zone, NULL::uuid);
END;
$$;

-- Grant execute permissions for the simpler version
GRANT EXECUTE ON FUNCTION get_calendar_events_with_context(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_calendar_events_with_context(uuid) TO service_role;

-- Ensure sync trigger exists for work_orders -> schedule_events
CREATE OR REPLACE FUNCTION public.sync_schedule_event()
RETURNS trigger AS $$
BEGIN
  -- Update by work_order_id (primary method)
  UPDATE public.schedule_events
  SET start_time = NEW.start_time,
      end_time = NEW.end_time,
      updated_at = NOW(),
      title = COALESCE(NEW.title, 'Work Order: ' || COALESCE(NEW.job_number, NEW.quote_number, 'Untitled')),
      customer_id = NEW.customer_id,
      employee_id = NEW.assigned_technician_id
  WHERE work_order_id = NEW.id;

  -- If no existing schedule event, create one for scheduled work orders
  IF NOT FOUND AND NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    INSERT INTO public.schedule_events (
      company_id,
      work_order_id,
      title,
      description,
      start_time,
      end_time,
      customer_id,
      employee_id,
      event_type,
      status,
      created_at,
      updated_at
    ) VALUES (
      NEW.company_id,
      NEW.id,
      COALESCE(NEW.title, 'Work Order: ' || COALESCE(NEW.job_number, NEW.quote_number, 'Untitled')),
      NEW.description,
      NEW.start_time,
      NEW.end_time,
      NEW.customer_id,
      NEW.assigned_technician_id,
      'work_order',
      'scheduled',
      NOW(),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS t_sync_calendar ON public.work_orders;
CREATE TRIGGER t_sync_calendar
AFTER INSERT OR UPDATE OF start_time, end_time, title, customer_id, assigned_technician_id ON public.work_orders
FOR EACH ROW EXECUTE FUNCTION public.sync_schedule_event();

-- Test the function (optional - remove in production)
-- SELECT * FROM get_calendar_events_with_context('ba643da1-c16f-468e-8fcb-f347e7929597'::uuid) LIMIT 5;
