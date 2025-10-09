-- ✅ CREATE employee_time_off TABLE FOR PTO/VACATION TRACKING
-- This table is referenced by Timesheets.js but doesn't exist in the database

-- Create enum for time off status
DO $$ BEGIN
    CREATE TYPE time_off_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for time off kind/type
DO $$ BEGIN
    CREATE TYPE time_off_kind_enum AS ENUM ('VACATION', 'SICK', 'PERSONAL', 'BEREAVEMENT', 'JURY_DUTY', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create employee_time_off table
CREATE TABLE IF NOT EXISTS employee_time_off (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    kind time_off_kind_enum NOT NULL DEFAULT 'VACATION',
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    hours_requested NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    hours_approved NUMERIC(5,2),
    note TEXT,
    status time_off_status_enum NOT NULL DEFAULT 'PENDING',
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_time_off_dates CHECK (ends_at > starts_at),
    CONSTRAINT chk_time_off_hours CHECK (hours_requested > 0 AND (hours_approved IS NULL OR hours_approved >= 0))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_time_off_employee_id ON employee_time_off(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_time_off_company_id ON employee_time_off(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_time_off_status ON employee_time_off(status);
CREATE INDEX IF NOT EXISTS idx_employee_time_off_dates ON employee_time_off(starts_at, ends_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_employee_time_off_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employee_time_off_updated_at
    BEFORE UPDATE ON employee_time_off
    FOR EACH ROW
    EXECUTE FUNCTION update_employee_time_off_updated_at();

-- Enable RLS
ALTER TABLE employee_time_off ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy 1: Users can view time off for their company
CREATE POLICY "Users can view time off for their company"
    ON employee_time_off
    FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

-- Policy 2: Users can create time off requests for their company
CREATE POLICY "Users can create time off requests"
    ON employee_time_off
    FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

-- Policy 3: Owners/Admins can update time off (approve/reject)
CREATE POLICY "Owners and admins can update time off"
    ON employee_time_off
    FOR UPDATE
    USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('OWNER', 'ADMIN')
        )
    );

-- Policy 4: Employees can update their own pending requests
CREATE POLICY "Employees can update their own pending requests"
    ON employee_time_off
    FOR UPDATE
    USING (
        status = 'PENDING' 
        AND employee_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid()
        )
    );

-- Policy 5: Users can delete their own pending requests
CREATE POLICY "Users can delete their own pending requests"
    ON employee_time_off
    FOR DELETE
    USING (
        status = 'PENDING' 
        AND employee_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON employee_time_off TO authenticated;
GRANT ALL ON employee_time_off TO service_role;

-- Add comment
COMMENT ON TABLE employee_time_off IS 'Tracks employee PTO, vacation, sick leave, and other time off requests';

