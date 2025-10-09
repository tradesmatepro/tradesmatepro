-- FIX CALENDAR FUNCTION
-- Creates the missing get_calendar_events_with_context function that Calendar.js is trying to call

-- 1. First ensure schedule_events table has work_order_id column
DO $$
BEGIN
    -- Add work_order_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'schedule_events' AND column_name = 'work_order_id'
    ) THEN
        ALTER TABLE schedule_events ADD COLUMN work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added work_order_id column to schedule_events table';
    ELSE
        RAISE NOTICE 'work_order_id column already exists in schedule_events table';
    END IF;
END $$;

-- 2. Ensure schedule_events has all required columns
DO $$
BEGIN
    -- Add event_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'schedule_events' AND column_name = 'event_type'
    ) THEN
        ALTER TABLE schedule_events ADD COLUMN event_type TEXT DEFAULT 'appointment';
        RAISE NOTICE 'Added event_type column to schedule_events table';
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'schedule_events' AND column_name = 'status'
    ) THEN
        ALTER TABLE schedule_events ADD COLUMN status TEXT DEFAULT 'scheduled';
        RAISE NOTICE 'Added status column to schedule_events table';
    END IF;
    
    -- Add employee_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'schedule_events' AND column_name = 'employee_id'
    ) THEN
        ALTER TABLE schedule_events ADD COLUMN employee_id UUID REFERENCES users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added employee_id column to schedule_events table';
    END IF;
    
    -- Add customer_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'schedule_events' AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE schedule_events ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added customer_id column to schedule_events table';
    END IF;
END $$;

-- 3. Create the missing function that Calendar.js is trying to call
CREATE OR REPLACE FUNCTION public.get_calendar_events_with_context(
    p_company_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_employee_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    event_type TEXT,
    status TEXT,
    work_order_id UUID,
    work_order_stage TEXT,
    work_order_status TEXT,
    customer_id UUID,
    customer_name TEXT,
    employee_id UUID,
    employee_name TEXT,
    service_address TEXT,
    estimated_duration INTEGER,
    total_amount NUMERIC
) AS $$
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
        wo.stage as work_order_stage,
        wo.work_status as work_order_status,
        se.customer_id,
        c.name as customer_name,
        se.employee_id,
        u.full_name as employee_name,
        COALESCE(
            wo.service_address_line_1 || 
            CASE WHEN wo.service_city IS NOT NULL THEN ', ' || wo.service_city ELSE '' END ||
            CASE WHEN wo.service_state IS NOT NULL THEN ', ' || wo.service_state ELSE '' END,
            ca.address_line_1 || 
            CASE WHEN ca.city IS NOT NULL THEN ', ' || ca.city ELSE '' END ||
            CASE WHEN ca.state IS NOT NULL THEN ', ' || ca.state ELSE '' END,
            'No address specified'
        ) as service_address,
        COALESCE(wo.estimated_duration, 120) as estimated_duration, -- Default 2 hours
        COALESCE(wo.total_amount, 0) as total_amount
    FROM public.schedule_events se
    LEFT JOIN public.work_orders wo ON se.work_order_id = wo.id
    LEFT JOIN public.customers c ON se.customer_id = c.id
    LEFT JOIN public.users u ON se.employee_id = u.id
    LEFT JOIN public.customer_addresses ca ON wo.service_address_id = ca.id
    WHERE se.company_id = p_company_id
        AND (p_start_date IS NULL OR se.start_time >= p_start_date)
        AND (p_end_date IS NULL OR se.start_time <= p_end_date)
        AND (p_employee_id IS NULL OR se.employee_id = p_employee_id)
    ORDER BY se.start_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create sync function to keep schedule_events in sync with work_orders
CREATE OR REPLACE FUNCTION public.sync_schedule_events_with_work_orders()
RETURNS trigger AS $$
BEGIN
    -- Handle INSERT: Create schedule event for new work orders with scheduling info
    IF TG_OP = 'INSERT' AND NEW.start_time IS NOT NULL THEN
        INSERT INTO public.schedule_events (
            company_id,
            work_order_id,
            title,
            description,
            start_time,
            end_time,
            employee_id,
            customer_id,
            event_type,
            status,
            created_at,
            updated_at
        ) VALUES (
            NEW.company_id,
            NEW.id,
            COALESCE(NEW.title, 'Work Order #' || COALESCE(NEW.job_number, NEW.quote_number, NEW.id::text)),
            NEW.description,
            NEW.start_time,
            COALESCE(NEW.end_time, NEW.start_time + INTERVAL '2 hours'),
            NEW.assigned_technician_id,
            NEW.customer_id,
            'work_order',
            CASE 
                WHEN NEW.stage = 'QUOTE' THEN 'scheduled'
                WHEN NEW.stage = 'JOB' THEN 'confirmed'
                WHEN NEW.stage = 'WORK_ORDER' THEN 'in_progress'
                WHEN NEW.stage = 'INVOICED' THEN 'completed'
                WHEN NEW.stage = 'PAID' THEN 'completed'
                ELSE 'scheduled'
            END,
            NOW(),
            NOW()
        );
        
    -- Handle UPDATE: Sync changes to existing schedule events
    ELSIF TG_OP = 'UPDATE' THEN
        -- If scheduling info was added
        IF OLD.start_time IS NULL AND NEW.start_time IS NOT NULL THEN
            INSERT INTO public.schedule_events (
                company_id,
                work_order_id,
                title,
                description,
                start_time,
                end_time,
                employee_id,
                customer_id,
                event_type,
                status,
                created_at,
                updated_at
            ) VALUES (
                NEW.company_id,
                NEW.id,
                COALESCE(NEW.title, 'Work Order #' || COALESCE(NEW.job_number, NEW.quote_number, NEW.id::text)),
                NEW.description,
                NEW.start_time,
                COALESCE(NEW.end_time, NEW.start_time + INTERVAL '2 hours'),
                NEW.assigned_technician_id,
                NEW.customer_id,
                'work_order',
                CASE 
                    WHEN NEW.stage = 'QUOTE' THEN 'scheduled'
                    WHEN NEW.stage = 'JOB' THEN 'confirmed'
                    WHEN NEW.stage = 'WORK_ORDER' THEN 'in_progress'
                    WHEN NEW.stage = 'INVOICED' THEN 'completed'
                    WHEN NEW.stage = 'PAID' THEN 'completed'
                    ELSE 'scheduled'
                END,
                NOW(),
                NOW()
            );
            
        -- If scheduling info was updated
        ELSIF OLD.start_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
            UPDATE public.schedule_events
            SET 
                title = COALESCE(NEW.title, 'Work Order #' || COALESCE(NEW.job_number, NEW.quote_number, NEW.id::text)),
                description = NEW.description,
                start_time = NEW.start_time,
                end_time = COALESCE(NEW.end_time, NEW.start_time + INTERVAL '2 hours'),
                employee_id = NEW.assigned_technician_id,
                customer_id = NEW.customer_id,
                status = CASE 
                    WHEN NEW.stage = 'QUOTE' THEN 'scheduled'
                    WHEN NEW.stage = 'JOB' THEN 'confirmed'
                    WHEN NEW.stage = 'WORK_ORDER' THEN 'in_progress'
                    WHEN NEW.stage = 'INVOICED' THEN 'completed'
                    WHEN NEW.stage = 'PAID' THEN 'completed'
                    ELSE 'scheduled'
                END,
                updated_at = NOW()
            WHERE work_order_id = NEW.id;
            
        -- If scheduling info was removed
        ELSIF OLD.start_time IS NOT NULL AND NEW.start_time IS NULL THEN
            DELETE FROM public.schedule_events WHERE work_order_id = NEW.id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger to automatically sync work_orders with schedule_events
DROP TRIGGER IF EXISTS t_sync_schedule_events ON public.work_orders;
CREATE TRIGGER t_sync_schedule_events
    AFTER INSERT OR UPDATE ON public.work_orders
    FOR EACH ROW 
    EXECUTE FUNCTION public.sync_schedule_events_with_work_orders();

-- 6. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON schedule_events TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_calendar_events_with_context TO authenticated;

-- 7. Create some sample schedule events for testing (optional)
INSERT INTO schedule_events (
    company_id,
    work_order_id,
    title,
    description,
    start_time,
    end_time,
    employee_id,
    customer_id,
    event_type,
    status,
    created_at,
    updated_at
)
SELECT 
    wo.company_id,
    wo.id,
    COALESCE(wo.title, 'Work Order #' || COALESCE(wo.job_number, wo.quote_number, wo.id::text)),
    wo.description,
    COALESCE(wo.start_time, NOW() + INTERVAL '1 day'),
    COALESCE(wo.end_time, COALESCE(wo.start_time, NOW() + INTERVAL '1 day') + INTERVAL '2 hours'),
    wo.assigned_technician_id,
    wo.customer_id,
    'work_order',
    CASE 
        WHEN wo.stage = 'QUOTE' THEN 'scheduled'
        WHEN wo.stage = 'JOB' THEN 'confirmed'
        WHEN wo.stage = 'WORK_ORDER' THEN 'in_progress'
        WHEN wo.stage = 'INVOICED' THEN 'completed'
        WHEN wo.stage = 'PAID' THEN 'completed'
        ELSE 'scheduled'
    END,
    NOW(),
    NOW()
FROM work_orders wo
WHERE wo.stage IN ('JOB', 'WORK_ORDER')
AND NOT EXISTS (
    SELECT 1 FROM schedule_events se 
    WHERE se.work_order_id = wo.id
)
LIMIT 10;

RAISE NOTICE 'Calendar function and sync system created successfully!';
RAISE NOTICE 'The Calendar page should now work without 400 errors.';

COMMIT;
