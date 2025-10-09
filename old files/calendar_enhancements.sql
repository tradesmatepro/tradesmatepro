-- Calendar Enhancements SQL Script
-- Add columns and tables for route optimization, customer notifications, and recurring appointments

-- Add customer notification tracking columns to work_orders
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reminder_method VARCHAR(10) CHECK (reminder_method IN ('email', 'sms')),
ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS customer_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reschedule_requested_at TIMESTAMPTZ;

-- Add recurring job support columns to work_orders
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurring_parent_id UUID,
ADD COLUMN IF NOT EXISTS recurring_sequence INTEGER DEFAULT 0;

-- Create recurring_jobs table for managing recurring appointment templates
CREATE TABLE IF NOT EXISTS recurring_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    customer_id UUID REFERENCES customers(id),
    
    -- Recurring pattern settings
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    interval_value INTEGER NOT NULL DEFAULT 1, -- Every X days/weeks/months
    days_of_week INTEGER[], -- For weekly: [1,2,3,4,5] for Mon-Fri
    day_of_month INTEGER, -- For monthly: specific day of month
    
    -- Scheduling details
    start_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    assigned_to UUID REFERENCES auth.users(id),
    
    -- Recurring schedule bounds
    first_occurrence DATE NOT NULL,
    last_occurrence DATE,
    max_occurrences INTEGER,
    
    -- Job template data
    pricing_model VARCHAR(20) DEFAULT 'TIME_MATERIALS',
    estimated_cost DECIMAL(10,2),
    labor_summary JSONB DEFAULT '{}',
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT TRUE,
    next_occurrence DATE,
    occurrences_created INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT recurring_jobs_company_fk FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT valid_frequency CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    CONSTRAINT valid_interval CHECK (interval_value > 0),
    CONSTRAINT valid_duration CHECK (duration_minutes > 0)
);

-- Create route_optimizations table for storing optimized routes
CREATE TABLE IF NOT EXISTS route_optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    technician_id UUID REFERENCES auth.users(id),
    optimization_date DATE NOT NULL,
    
    -- Route data
    original_order JSONB NOT NULL, -- Array of work_order_ids in original order
    optimized_order JSONB NOT NULL, -- Array of work_order_ids in optimized order
    estimated_travel_time INTEGER, -- Total travel time in minutes
    estimated_distance DECIMAL(10,2), -- Total distance in miles/km
    
    -- Optimization metadata
    optimization_method VARCHAR(50) DEFAULT 'basic', -- 'basic', 'google_maps', 'advanced'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT route_optimizations_company_fk FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Create notification_settings table for customer communication preferences
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    
    -- Reminder settings
    appointment_reminders_enabled BOOLEAN DEFAULT TRUE,
    reminder_hours_before INTEGER DEFAULT 24,
    reminder_methods VARCHAR(20)[] DEFAULT ARRAY['email'], -- ['email', 'sms', 'both']
    
    -- Confirmation settings
    confirmation_requests_enabled BOOLEAN DEFAULT TRUE,
    confirmation_hours_before INTEGER DEFAULT 2,
    
    -- Reschedule settings
    reschedule_notifications_enabled BOOLEAN DEFAULT TRUE,
    reschedule_buffer_hours INTEGER DEFAULT 4,
    
    -- Message templates
    reminder_email_template TEXT DEFAULT 'Hi {customer_name}, this is a reminder that you have an appointment scheduled for {appointment_time} with {company_name}.',
    reminder_sms_template TEXT DEFAULT 'Reminder: Your appointment with {company_name} is scheduled for {appointment_time}. Reply CONFIRM to confirm.',
    confirmation_template TEXT DEFAULT 'Please confirm your appointment for {appointment_time}. Reply YES to confirm or RESCHEDULE to change.',
    
    -- Integration settings
    email_provider VARCHAR(50), -- 'sendgrid', 'mailgun', 'ses'
    sms_provider VARCHAR(50), -- 'twilio', 'nexmo', 'aws_sns'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT notification_settings_company_fk FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT one_setting_per_company UNIQUE (company_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_orders_recurring ON work_orders(is_recurring, recurring_parent_id) WHERE is_recurring = TRUE;
CREATE INDEX IF NOT EXISTS idx_work_orders_reminders ON work_orders(reminder_sent_at, start_time) WHERE reminder_sent_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recurring_jobs_active ON recurring_jobs(is_active, next_occurrence) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_recurring_jobs_company ON recurring_jobs(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_route_optimizations_date ON route_optimizations(company_id, optimization_date, technician_id);

-- Create function to generate next recurring job occurrences
CREATE OR REPLACE FUNCTION generate_recurring_occurrences(
    recurring_job_id UUID,
    generate_until DATE DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    rj recurring_jobs%ROWTYPE;
    next_date DATE;
    end_date DATE;
    count INTEGER := 0;
    work_order_data JSONB;
BEGIN
    -- Get recurring job details
    SELECT * INTO rj FROM recurring_jobs WHERE id = recurring_job_id AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Determine end date
    end_date := COALESCE(generate_until, rj.last_occurrence, CURRENT_DATE + INTERVAL '1 year');
    next_date := COALESCE(rj.next_occurrence, rj.first_occurrence);
    
    -- Generate work orders until end date or max occurrences
    WHILE next_date <= end_date AND (rj.max_occurrences IS NULL OR rj.occurrences_created < rj.max_occurrences) LOOP
        -- Create work order for this occurrence
        INSERT INTO work_orders (
            company_id,
            title,
            description,
            customer_id,
            start_time,
            end_time,
            assigned_to,
            pricing_model,
            estimated_cost,
            labor_summary,
            is_recurring,
            recurring_parent_id,
            recurring_sequence,
            unified_status,
            created_by
        ) VALUES (
            rj.company_id,
            rj.title,
            rj.description,
            rj.customer_id,
            next_date + rj.start_time,
            next_date + rj.start_time + (rj.duration_minutes || ' minutes')::INTERVAL,
            rj.assigned_to,
            rj.pricing_model,
            rj.estimated_cost,
            rj.labor_summary,
            TRUE,
            recurring_job_id,
            rj.occurrences_created + count + 1,
            'scheduled_job',
            rj.created_by
        );
        
        count := count + 1;
        
        -- Calculate next occurrence date
        IF rj.frequency = 'daily' THEN
            next_date := next_date + (rj.interval_value || ' days')::INTERVAL;
        ELSIF rj.frequency = 'weekly' THEN
            next_date := next_date + (rj.interval_value * 7 || ' days')::INTERVAL;
        ELSIF rj.frequency = 'monthly' THEN
            next_date := next_date + (rj.interval_value || ' months')::INTERVAL;
        ELSIF rj.frequency = 'yearly' THEN
            next_date := next_date + (rj.interval_value || ' years')::INTERVAL;
        END IF;
    END LOOP;
    
    -- Update recurring job with next occurrence and count
    UPDATE recurring_jobs 
    SET 
        next_occurrence = CASE WHEN next_date <= end_date THEN next_date ELSE NULL END,
        occurrences_created = occurrences_created + count,
        updated_at = NOW()
    WHERE id = recurring_job_id;
    
    RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Create function to send appointment reminders (placeholder for integration)
CREATE OR REPLACE FUNCTION send_appointment_reminder(
    work_order_id UUID,
    method VARCHAR(10) DEFAULT 'email'
) RETURNS BOOLEAN AS $$
DECLARE
    wo work_orders%ROWTYPE;
    customer customers%ROWTYPE;
    settings notification_settings%ROWTYPE;
BEGIN
    -- Get work order and customer details
    SELECT * INTO wo FROM work_orders WHERE id = work_order_id;
    SELECT * INTO customer FROM customers WHERE id = wo.customer_id;
    SELECT * INTO settings FROM notification_settings WHERE company_id = wo.company_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update work order to track reminder sent
    UPDATE work_orders 
    SET 
        reminder_sent_at = NOW(),
        reminder_method = method
    WHERE id = work_order_id;
    
    -- TODO: Integrate with actual email/SMS service
    -- This is a placeholder that would integrate with SendGrid, Twilio, etc.
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Insert default notification settings for existing companies
INSERT INTO notification_settings (company_id)
SELECT id FROM companies 
WHERE id NOT IN (SELECT company_id FROM notification_settings);

-- Add RLS policies (assuming RLS is enabled)
ALTER TABLE recurring_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON recurring_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON route_optimizations TO authenticated;
GRANT SELECT, UPDATE ON notification_settings TO authenticated;
GRANT EXECUTE ON FUNCTION generate_recurring_occurrences(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION send_appointment_reminder(UUID, VARCHAR) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE recurring_jobs IS 'Master templates for recurring appointments and maintenance contracts';
COMMENT ON TABLE route_optimizations IS 'Stores optimized routes for technicians by date';
COMMENT ON TABLE notification_settings IS 'Company-wide settings for customer notifications';
COMMENT ON FUNCTION generate_recurring_occurrences IS 'Generates work orders from recurring job templates';
COMMENT ON FUNCTION send_appointment_reminder IS 'Sends appointment reminders via email or SMS';

-- Sample data (optional - uncomment to add test data)
/*
-- Add sample recurring job
INSERT INTO recurring_jobs (
    company_id, title, customer_id, frequency, interval_value,
    start_time, duration_minutes, first_occurrence, max_occurrences
) VALUES (
    (SELECT id FROM companies LIMIT 1),
    'Monthly HVAC Maintenance',
    (SELECT id FROM customers LIMIT 1),
    'monthly', 1,
    '09:00:00', 120,
    CURRENT_DATE + INTERVAL '1 week',
    12
);
*/
