-- COMPREHENSIVE SCHEMA FIX
-- This script addresses all the schema mismatches found in the audit

-- =====================================================
-- 1. FIX EXPENSES TABLE - ADD MISSING STATUS COLUMN
-- =====================================================

-- Add status column to expenses table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expenses' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.expenses 
        ADD COLUMN status TEXT DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed'));
        
        -- Update existing records
        UPDATE public.expenses SET status = 'pending' WHERE status IS NULL;
        
        -- Create index for performance
        CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
        
        RAISE NOTICE 'Added status column to expenses table';
    ELSE
        RAISE NOTICE 'Status column already exists in expenses table';
    END IF;
END $$;

-- =====================================================
-- 2. ENSURE WORK_ORDER_ITEMS TABLE IS PROPERLY STRUCTURED
-- =====================================================

-- Check if work_order_items table has all required columns
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'work_order_items' 
        AND column_name = 'item_name'
    ) THEN
        ALTER TABLE public.work_order_items ADD COLUMN item_name TEXT;
        RAISE NOTICE 'Added item_name column to work_order_items';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'work_order_items' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE public.work_order_items ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to work_order_items';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'work_order_items' 
        AND column_name = 'quantity'
    ) THEN
        ALTER TABLE public.work_order_items ADD COLUMN quantity DECIMAL(10,2) DEFAULT 1;
        RAISE NOTICE 'Added quantity column to work_order_items';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'work_order_items' 
        AND column_name = 'rate'
    ) THEN
        ALTER TABLE public.work_order_items ADD COLUMN rate DECIMAL(12,4) DEFAULT 0;
        RAISE NOTICE 'Added rate column to work_order_items';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'work_order_items' 
        AND column_name = 'total'
    ) THEN
        ALTER TABLE public.work_order_items ADD COLUMN total DECIMAL(12,4) DEFAULT 0;
        RAISE NOTICE 'Added total column to work_order_items';
    END IF;
END $$;

-- =====================================================
-- 3. ENSURE EMPLOYEE_TIMESHEETS HAS REQUIRED COLUMNS
-- =====================================================

-- Check if employee_timesheets table exists and has required columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employee_timesheets') THEN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'employee_timesheets' 
            AND column_name = 'work_date'
        ) THEN
            ALTER TABLE public.employee_timesheets ADD COLUMN work_date DATE DEFAULT CURRENT_DATE;
            RAISE NOTICE 'Added work_date column to employee_timesheets';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'employee_timesheets' 
            AND column_name = 'total_hours'
        ) THEN
            ALTER TABLE public.employee_timesheets ADD COLUMN total_hours DECIMAL(8,2) DEFAULT 0;
            RAISE NOTICE 'Added total_hours column to employee_timesheets';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'employee_timesheets' 
            AND column_name = 'status'
        ) THEN
            ALTER TABLE public.employee_timesheets ADD COLUMN status TEXT DEFAULT 'draft' 
            CHECK (status IN ('draft', 'submitted', 'approved', 'rejected'));
            RAISE NOTICE 'Added status column to employee_timesheets';
        END IF;
    ELSE
        RAISE NOTICE 'employee_timesheets table does not exist - skipping';
    END IF;
END $$;

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_company_date ON public.expenses(company_id, date);

-- Work order items indexes
CREATE INDEX IF NOT EXISTS idx_work_order_items_work_order_id ON public.work_order_items(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_items_company_id ON public.work_order_items(company_id);

-- Employee timesheets indexes (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employee_timesheets') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_employee_timesheets_user_date ON public.employee_timesheets(user_id, work_date)';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_employee_timesheets_status ON public.employee_timesheets(status)';
        RAISE NOTICE 'Created indexes for employee_timesheets';
    END IF;
END $$;

-- =====================================================
-- 5. ENSURE PROPER RLS POLICIES
-- =====================================================

-- Enable RLS on expenses if not already enabled
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Update expenses RLS policy
DROP POLICY IF EXISTS "Users can view company expenses" ON public.expenses;
CREATE POLICY "Users can view company expenses" ON public.expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = expenses.company_id
        )
    );

-- Enable RLS on work_order_items if not already enabled
ALTER TABLE public.work_order_items ENABLE ROW LEVEL SECURITY;

-- Update work_order_items RLS policy
DROP POLICY IF EXISTS "Users can view company work order items" ON public.work_order_items;
CREATE POLICY "Users can view company work order items" ON public.work_order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = work_order_items.company_id
        )
    );

-- =====================================================
-- 6. CREATE SAMPLE DATA FOR TESTING (OPTIONAL)
-- =====================================================

-- Add sample expenses with status for testing
INSERT INTO public.expenses (company_id, user_id, amount, description, category, date, status)
SELECT 
    c.id as company_id,
    u.id as user_id,
    75.50 as amount,
    'Sample expense for dashboard testing' as description,
    'Office Supplies' as category,
    CURRENT_DATE as date,
    'pending' as status
FROM public.companies c
JOIN public.users u ON u.company_id = c.id
WHERE NOT EXISTS (
    SELECT 1 FROM public.expenses 
    WHERE company_id = c.id 
    AND description = 'Sample expense for dashboard testing'
)
LIMIT 3;

-- Add sample work order items for testing
INSERT INTO public.work_order_items (work_order_id, company_id, item_name, description, quantity, rate, total, item_type)
SELECT 
    wo.id as work_order_id,
    wo.company_id,
    'Standard Labor' as item_name,
    'Labor for job completion' as description,
    8.0 as quantity,
    75.00 as rate,
    600.00 as total,
    'labor' as item_type
FROM public.work_orders wo
WHERE wo.stage IN ('JOB', 'WORK_ORDER')
AND NOT EXISTS (
    SELECT 1 FROM public.work_order_items woi 
    WHERE woi.work_order_id = wo.id
    AND woi.item_name = 'Standard Labor'
)
LIMIT 5;

-- Add material items too
INSERT INTO public.work_order_items (work_order_id, company_id, item_name, description, quantity, rate, total, item_type)
SELECT 
    wo.id as work_order_id,
    wo.company_id,
    'Standard Materials' as item_name,
    'Materials required for job' as description,
    1.0 as quantity,
    150.00 as rate,
    150.00 as total,
    'material' as item_type
FROM public.work_orders wo
WHERE wo.stage IN ('JOB', 'WORK_ORDER')
AND EXISTS (
    SELECT 1 FROM public.work_order_items woi 
    WHERE woi.work_order_id = wo.id 
    AND woi.item_name = 'Standard Labor'
)
AND NOT EXISTS (
    SELECT 1 FROM public.work_order_items woi 
    WHERE woi.work_order_id = wo.id 
    AND woi.item_name = 'Standard Materials'
)
LIMIT 5;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON public.expenses TO authenticated;
GRANT ALL ON public.work_order_items TO authenticated;

-- Grant permissions on employee_timesheets if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employee_timesheets') THEN
        EXECUTE 'GRANT ALL ON public.employee_timesheets TO authenticated';
        RAISE NOTICE 'Granted permissions on employee_timesheets';
    END IF;
END $$;

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Verify expenses table structure
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_name = 'expenses' 
    AND column_name IN ('id', 'company_id', 'user_id', 'amount', 'description', 'status', 'date');
    
    RAISE NOTICE 'Expenses table has % required columns', col_count;
END $$;

-- Verify work_order_items table structure
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_name = 'work_order_items' 
    AND column_name IN ('id', 'work_order_id', 'company_id', 'item_name', 'quantity', 'rate', 'total');
    
    RAISE NOTICE 'Work_order_items table has % required columns', col_count;
END $$;

RAISE NOTICE 'Schema fix completed successfully!';
RAISE NOTICE 'You can now test the Dashboard and Jobs pages.';

COMMIT;
