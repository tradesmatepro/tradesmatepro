-- Expenses and Tools Schema Additions
-- Run this SQL in Supabase SQL Editor

-- 1. Verify expenses table exists (it should based on schema.csv)
-- If it doesn't exist, create it:
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    category TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_url TEXT,
    vendor TEXT,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    is_billable BOOLEAN DEFAULT false,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_company_id ON public.expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON public.expenses(project_id);

-- 3. Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for expenses
-- Users can view expenses from their company
CREATE POLICY "Users can view company expenses" ON public.expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = expenses.company_id
        )
    );

-- Users can insert their own expenses
CREATE POLICY "Users can create own expenses" ON public.expenses
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = expenses.company_id
        )
    );

-- Users can update their own expenses, admins can update all company expenses
CREATE POLICY "Users can update expenses" ON public.expenses
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = expenses.company_id 
            AND role IN ('owner', 'admin')
        )
    );

-- Users can delete their own expenses, admins can delete all company expenses
CREATE POLICY "Users can delete expenses" ON public.expenses
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = expenses.company_id 
            AND role IN ('owner', 'admin')
        )
    );

-- 5. Create expense categories table for better organization
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(company_id, name)
);

-- 6. Insert default expense categories
INSERT INTO public.expense_categories (company_id, name, description, is_default)
SELECT 
    c.id,
    category.name,
    category.description,
    true
FROM public.companies c
CROSS JOIN (
    VALUES 
        ('Materials', 'Construction materials and supplies'),
        ('Equipment', 'Tools and equipment purchases'),
        ('Vehicle', 'Vehicle expenses and fuel'),
        ('Travel', 'Travel and transportation costs'),
        ('Office', 'Office supplies and expenses'),
        ('Insurance', 'Business insurance premiums'),
        ('Utilities', 'Utilities and phone bills'),
        ('Professional Services', 'Legal, accounting, consulting'),
        ('Marketing', 'Advertising and marketing expenses'),
        ('Meals', 'Business meals and entertainment'),
        ('Training', 'Employee training and certification'),
        ('Other', 'Miscellaneous business expenses')
) AS category(name, description)
ON CONFLICT (company_id, name) DO NOTHING;

-- 7. Enable RLS on expense categories
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for expense categories
CREATE POLICY "Users can view company expense categories" ON public.expense_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = expense_categories.company_id
        )
    );

CREATE POLICY "Admins can manage expense categories" ON public.expense_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = expense_categories.company_id 
            AND role IN ('owner', 'admin')
        )
    );

-- 9. Create tools usage tracking table (optional - for analytics)
CREATE TABLE IF NOT EXISTS public.tool_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    tool_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(company_id, user_id, tool_name)
);

-- 10. Enable RLS on tool usage
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policy for tool usage
CREATE POLICY "Users can track own tool usage" ON public.tool_usage
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND company_id = tool_usage.company_id 
            AND role IN ('owner', 'admin')
        )
    );

-- 12. Grant permissions
GRANT ALL ON public.expenses TO authenticated;
GRANT ALL ON public.expense_categories TO authenticated;
GRANT ALL ON public.tool_usage TO authenticated;

-- 13. Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Add updated_at triggers
CREATE TRIGGER expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER expense_categories_updated_at
    BEFORE UPDATE ON public.expense_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 15. Create view for expense summaries (optional - for better performance)
CREATE OR REPLACE VIEW public.expense_monthly_summary AS
SELECT 
    company_id,
    user_id,
    DATE_TRUNC('month', date) as month,
    category,
    COUNT(*) as expense_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
FROM public.expenses
GROUP BY company_id, user_id, DATE_TRUNC('month', date), category;

-- Grant access to the view
GRANT SELECT ON public.expense_monthly_summary TO authenticated;

-- 16. Add RLS to the view
ALTER VIEW public.expense_monthly_summary SET (security_invoker = true);
