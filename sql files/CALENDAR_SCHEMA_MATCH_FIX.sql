-- Calendar Function Fix - Match Existing Schema Exactly
-- Based on your schema: get_calendar_events_with_context(p_company_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone) returns record

-- Drop existing function
DROP FUNCTION IF EXISTS get_calendar_events_with_context(uuid, timestamp with time zone, timestamp with time zone);

-- Create function that matches your exact schema signature
CREATE OR REPLACE FUNCTION get_calendar_events_with_context(
    p_company_id uuid,
    p_start_date timestamp with time zone,
    p_end_date timestamp with time zone
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
        COALESCE(se.title, 'Untitled Event') as title,
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
        COALESCE(c.company_name, c.first_name || ' ' || c.last_name, 'Unknown Customer') as customer_name,
        se.employee_id,
        COALESCE(u.first_name || ' ' || u.last_name, u.email, 'Unassigned') as employee_name,
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
    ORDER BY se.start_time ASC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_calendar_events_with_context(uuid, timestamp with time zone, timestamp with time zone) TO authenticated;
GRANT EXECUTE ON FUNCTION get_calendar_events_with_context(uuid, timestamp with time zone, timestamp with time zone) TO service_role;

-- Test the function with your company ID
SELECT 'Testing function...' as status;
SELECT COUNT(*) as schedule_events_count FROM schedule_events WHERE company_id = 'ba643da1-c16f-468e-8fcb-f347e7929597';
SELECT COUNT(*) as work_orders_count FROM work_orders WHERE company_id = 'ba643da1-c16f-468e-8fcb-f347e7929597';

-- Test the actual function call
SELECT * FROM get_calendar_events_with_context(
    'ba643da1-c16f-468e-8fcb-f347e7929597'::uuid,
    '2025-09-01'::timestamp with time zone,
    '2025-09-30'::timestamp with time zone
) LIMIT 3;
