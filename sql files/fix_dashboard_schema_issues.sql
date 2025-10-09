-- Fix Dashboard Schema Issues
-- Run this in your Supabase SQL editor to fix the 400 errors

-- 1. Add missing status column to expenses table
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed'));

-- 2. Ensure employee_timesheets has all required columns
-- (These should already exist based on the schema, but let's make sure)
ALTER TABLE public.employee_timesheets 
ADD COLUMN IF NOT EXISTS work_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS total_hours DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' 
CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- 3. Create indexes for better performance on dashboard queries
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_employee_timesheets_user_date ON public.employee_timesheets(user_id, work_date);
CREATE INDEX IF NOT EXISTS idx_employee_timesheets_status ON public.employee_timesheets(status);

-- 4. Update RLS policies for expenses to include status filtering
DROP POLICY IF EXISTS "Users can view company expenses" ON public.expenses;
CREATE POLICY "Users can view company expenses" ON public.expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = expenses.company_id
        )
    );

-- 5. Ensure employee_timesheets has proper RLS
ALTER TABLE public.employee_timesheets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view company timesheets" ON public.employee_timesheets;
CREATE POLICY "Users can view company timesheets" ON public.employee_timesheets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = employee_timesheets.company_id
        )
    );

DROP POLICY IF EXISTS "Users can manage own timesheets" ON public.employee_timesheets;
CREATE POLICY "Users can manage own timesheets" ON public.employee_timesheets
    FOR ALL USING (
        user_id = auth.uid() OR employee_id = auth.uid()
    );

-- 6. Grant necessary permissions
GRANT ALL ON public.employee_timesheets TO authenticated;

-- 7. Create some sample data if tables are empty (optional - remove if you have data)
-- Sample expenses
INSERT INTO public.expenses (company_id, user_id, amount, description, category, date, status)
SELECT 
    c.id as company_id,
    u.id as user_id,
    50.00 as amount,
    'Sample expense for testing' as description,
    'Office Supplies' as category,
    CURRENT_DATE as date,
    'pending' as status
FROM public.companies c
JOIN public.users u ON u.company_id = c.id
WHERE NOT EXISTS (SELECT 1 FROM public.expenses WHERE company_id = c.id)
LIMIT 1;

-- Sample timesheets
INSERT INTO public.employee_timesheets (company_id, user_id, employee_id, work_date, total_hours, status)
SELECT 
    c.id as company_id,
    u.id as user_id,
    u.id as employee_id,
    CURRENT_DATE as work_date,
    8.0 as total_hours,
    'approved' as status
FROM public.companies c
JOIN public.users u ON u.company_id = c.id
WHERE NOT EXISTS (SELECT 1 FROM public.employee_timesheets WHERE company_id = c.id)
LIMIT 1;

-- 8. Create a function to populate missing timesheet data for the current week
CREATE OR REPLACE FUNCTION populate_sample_timesheets()
RETURNS void AS $$
DECLARE
    company_rec RECORD;
    user_rec RECORD;
    day_offset INTEGER;
BEGIN
    -- For each company and user, create sample timesheet entries for the current week
    FOR company_rec IN SELECT id FROM public.companies LOOP
        FOR user_rec IN SELECT id FROM public.users WHERE company_id = company_rec.id LOOP
            -- Create entries for the past 7 days
            FOR day_offset IN 0..6 LOOP
                INSERT INTO public.employee_timesheets (
                    company_id, 
                    user_id, 
                    employee_id, 
                    work_date, 
                    total_hours, 
                    status
                )
                VALUES (
                    company_rec.id,
                    user_rec.id,
                    user_rec.id,
                    CURRENT_DATE - day_offset,
                    CASE 
                        WHEN EXTRACT(DOW FROM CURRENT_DATE - day_offset) IN (0, 6) THEN 0  -- Weekend
                        ELSE 8.0  -- Weekday
                    END,
                    'approved'
                )
                ON CONFLICT DO NOTHING;  -- Skip if already exists
            END LOOP;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the function to populate sample data (comment out if you don't want sample data)
-- SELECT populate_sample_timesheets();

-- 9. Create updated_at trigger for employee_timesheets if it doesn't exist
CREATE TRIGGER employee_timesheets_updated_at
    BEFORE UPDATE ON public.employee_timesheets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

COMMIT;
