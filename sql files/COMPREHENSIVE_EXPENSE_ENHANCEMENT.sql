-- ===============================================
-- COMPREHENSIVE EXPENSE SYSTEM ENHANCEMENT
-- Building on existing schema from notes.md
-- Adding 40+ industry-standard categories + reimbursement workflows
-- ===============================================

-- 1. Add comprehensive expense categories (building on your existing 37)
-- Adding the missing categories to reach 40+ industry standard
WITH companies_list AS (
    SELECT id FROM public.companies
)
INSERT INTO public.expense_categories (company_id, name, description, is_tax_deductible, is_taxable, default_tax_rate, reimbursement_type)
SELECT c.id, cat_name, cat_desc, is_deductible, is_taxable_flag, tax_rate, reimb_type
FROM companies_list c
CROSS JOIN (
    VALUES
        -- Additional Professional Services
        ('Contract Labor', 'Independent contractors and freelancers', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        ('Collection Fees', 'Debt collection and credit recovery services', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        ('Research & Development', 'R&D costs for new products/services', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        
        -- Employee-Related Expenses
        ('Employee Benefits', 'Health insurance, retirement contributions', TRUE, FALSE, 0.0000, 'NONE'),
        ('Employee Training', 'Skills development and certification programs', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        ('Employee Meals & Entertainment', 'Team meals and company events', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        ('Employee Transportation', 'Transit passes, parking allowances', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        ('Employee Assistance Programs', 'EAP services and wellness programs', TRUE, FALSE, 0.0000, 'NONE'),
        ('Tuition Reimbursement', 'Educational assistance for employees', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        
        -- Equipment & Maintenance
        ('Equipment Maintenance Contracts', 'Service agreements for equipment', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        ('Safety Equipment', 'PPE and workplace safety items', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        ('Depreciation', 'Asset depreciation expenses', TRUE, FALSE, 0.0000, 'NONE'),
        
        -- Business Operations
        ('Inventory', 'Cost of goods for resale', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        ('Shipping & Postage', 'Freight, courier, and mailing costs', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        ('Printing', 'Business cards, brochures, documents', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        ('Security', 'Security systems and monitoring services', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        ('Moving Expenses', 'Business relocation costs', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        
        -- Financial & Tax
        ('Foreign-Earned Income', 'International business income', TRUE, FALSE, 0.0000, 'NONE'),
        ('Pension Contributions', 'Employer retirement plan contributions', TRUE, FALSE, 0.0000, 'NONE'),
        ('Work Opportunity Tax Credit', 'WOTC eligible employee hiring', TRUE, FALSE, 0.0000, 'NONE'),
        
        -- Travel & Per Diem Categories
        ('Per Diem - Meals', 'Daily meal allowances for travel', TRUE, FALSE, 0.0000, 'PER_DIEM'),
        ('Per Diem - Lodging', 'Daily lodging allowances', TRUE, FALSE, 0.0000, 'PER_DIEM'),
        ('Per Diem - Incidentals', 'Miscellaneous travel expenses', TRUE, FALSE, 0.0000, 'PER_DIEM'),
        
        -- Gifts & Recognition
        ('Business Gifts', 'Client and employee gifts', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        ('Employee Recognition', 'Awards and recognition programs', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        
        -- Startup & Special
        ('Startup Expenses', 'Initial business setup costs', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        ('Dues & Subscriptions', 'Professional memberships and publications', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE'),
        ('Continuing Education', 'Professional development courses', TRUE, FALSE, 0.0000, 'DIRECT_PURCHASE')
) AS t(cat_name, cat_desc, is_deductible, is_taxable_flag, tax_rate, reimb_type)
WHERE NOT EXISTS (
    SELECT 1
    FROM public.expense_categories ec
    WHERE ec.company_id = c.id AND ec.name = cat_name
);

-- 2. Add per diem rates table for standardized allowances
CREATE TABLE IF NOT EXISTS public.per_diem_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    location_type TEXT NOT NULL CHECK (location_type IN ('DOMESTIC','INTERNATIONAL','HIGH_COST','STANDARD')),
    location_name TEXT, -- e.g., "New York, NY" or "London, UK"
    
    -- Daily rates
    meals_rate NUMERIC(8,2) DEFAULT 0.00,
    lodging_rate NUMERIC(8,2) DEFAULT 0.00,
    incidentals_rate NUMERIC(8,2) DEFAULT 0.00,
    
    -- Effective dates
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(company_id, location_type, location_name, effective_from)
);

-- 3. Enhanced mileage tracking (building on existing structure)
-- Add trip categories and business purpose tracking
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS trip_category TEXT CHECK (trip_category IN ('CLIENT_VISIT','OFFICE_COMMUTE','BUSINESS_TRAVEL','DELIVERY','SITE_VISIT','OTHER')),
ADD COLUMN IF NOT EXISTS odometer_start INTEGER,
ADD COLUMN IF NOT EXISTS odometer_end INTEGER,
ADD COLUMN IF NOT EXISTS vehicle_description TEXT;

-- 4. Create comprehensive reimbursement request workflow
CREATE TABLE IF NOT EXISTS public.reimbursement_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Request details
    request_number TEXT GENERATED ALWAYS AS ('REQ-' || EXTRACT(YEAR FROM created_at) || '-' || LPAD(EXTRACT(DOY FROM created_at)::TEXT, 3, '0') || '-' || LPAD((EXTRACT(EPOCH FROM created_at) % 86400)::INTEGER::TEXT, 5, '0')) STORED,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Financial details
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    
    -- Status workflow
    status TEXT NOT NULL CHECK (status IN ('DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','PAID')) DEFAULT 'DRAFT',
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    
    -- Approver tracking
    reviewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approver_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Payment details
    payment_method TEXT CHECK (payment_method IN ('PAYROLL','CHECK','BANK_TRANSFER','PETTY_CASH')) DEFAULT 'PAYROLL',
    payment_reference TEXT,
    
    -- Comments and notes
    employee_notes TEXT,
    reviewer_comments TEXT,
    approver_comments TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Link expenses to reimbursement requests
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS reimbursement_request_id UUID REFERENCES public.reimbursement_requests(id) ON DELETE SET NULL;

-- 6. Create reimbursement approval workflow
CREATE TABLE IF NOT EXISTS public.reimbursement_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reimbursement_request_id UUID NOT NULL REFERENCES public.reimbursement_requests(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Approval details
    approval_level INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED','DELEGATED')) DEFAULT 'PENDING',
    comments TEXT,
    
    -- Timing
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Add expense receipt management (multiple receipts per expense)
CREATE TABLE IF NOT EXISTS public.expense_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
    
    -- File details
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    
    -- OCR extracted data (for future implementation)
    ocr_text TEXT,
    ocr_vendor TEXT,
    ocr_amount NUMERIC(10,2),
    ocr_date DATE,
    ocr_confidence NUMERIC(3,2), -- 0.00 to 1.00
    
    -- Status
    status TEXT DEFAULT 'UPLOADED' CHECK (status IN ('UPLOADED','PROCESSING','PROCESSED','FAILED')),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Create expense policy compliance table
CREATE TABLE IF NOT EXISTS public.expense_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    
    -- Policy details
    policy_name TEXT NOT NULL,
    category_id UUID REFERENCES public.expense_categories(id) ON DELETE CASCADE,
    
    -- Limits and rules
    daily_limit NUMERIC(10,2),
    monthly_limit NUMERIC(10,2),
    annual_limit NUMERIC(10,2),
    requires_receipt_over NUMERIC(10,2) DEFAULT 25.00,
    requires_approval_over NUMERIC(10,2) DEFAULT 100.00,
    
    -- Approval workflow
    approval_required BOOLEAN DEFAULT FALSE,
    auto_approve_under NUMERIC(10,2),
    
    -- Policy rules
    business_purpose_required BOOLEAN DEFAULT TRUE,
    attendees_required_for_meals BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Insert default per diem rates (US GSA standard rates)
INSERT INTO public.per_diem_rates (company_id, location_type, location_name, meals_rate, lodging_rate, incidentals_rate)
SELECT c.id, 'STANDARD', 'Continental US (Standard)', 59.00, 98.00, 5.00
FROM public.companies c
WHERE NOT EXISTS (
    SELECT 1 FROM public.per_diem_rates pdr 
    WHERE pdr.company_id = c.id AND pdr.location_type = 'STANDARD'
);

INSERT INTO public.per_diem_rates (company_id, location_type, location_name, meals_rate, lodging_rate, incidentals_rate)
SELECT c.id, 'HIGH_COST', 'High Cost Areas (NYC, SF, DC)', 79.00, 205.00, 5.00
FROM public.companies c
WHERE NOT EXISTS (
    SELECT 1 FROM public.per_diem_rates pdr 
    WHERE pdr.company_id = c.id AND pdr.location_type = 'HIGH_COST'
);

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reimbursement_requests_employee ON public.reimbursement_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_reimbursement_requests_status ON public.reimbursement_requests(company_id, status);
CREATE INDEX IF NOT EXISTS idx_expense_receipts_expense ON public.expense_receipts(expense_id);
CREATE INDEX IF NOT EXISTS idx_per_diem_rates_location ON public.per_diem_rates(company_id, location_type, effective_from);
CREATE INDEX IF NOT EXISTS idx_expense_policies_category ON public.expense_policies(company_id, category_id, is_active);

-- 11. Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_per_diem_rates_updated_at BEFORE UPDATE ON public.per_diem_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reimbursement_requests_updated_at BEFORE UPDATE ON public.reimbursement_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reimbursement_approvals_updated_at BEFORE UPDATE ON public.reimbursement_approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expense_receipts_updated_at BEFORE UPDATE ON public.expense_receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expense_policies_updated_at BEFORE UPDATE ON public.expense_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Grant permissions
GRANT ALL ON public.per_diem_rates TO authenticated;
GRANT ALL ON public.reimbursement_requests TO authenticated;
GRANT ALL ON public.reimbursement_approvals TO authenticated;
GRANT ALL ON public.expense_receipts TO authenticated;
GRANT ALL ON public.expense_policies TO authenticated;

-- 13. Update existing mileage expenses to use new trip categories
UPDATE public.expenses 
SET trip_category = 'CLIENT_VISIT' 
WHERE category = 'Mileage' AND trip_category IS NULL;

-- 14. Create default expense policies for common categories
INSERT INTO public.expense_policies (company_id, policy_name, category_id, daily_limit, requires_receipt_over, requires_approval_over)
SELECT 
    c.id,
    'Default ' || ec.name || ' Policy',
    ec.id,
    CASE 
        WHEN ec.name LIKE '%Meal%' THEN 75.00
        WHEN ec.name = 'Mileage' THEN 500.00
        WHEN ec.name LIKE '%Travel%' THEN 300.00
        ELSE 200.00
    END,
    25.00,
    CASE 
        WHEN ec.name LIKE '%Meal%' THEN 50.00
        WHEN ec.name = 'Mileage' THEN 100.00
        ELSE 100.00
    END
FROM public.companies c
CROSS JOIN public.expense_categories ec
WHERE ec.company_id = c.id 
AND ec.name IN ('Meals - Client', 'Meals - Staff', 'Mileage', 'Lodging', 'Flights')
AND NOT EXISTS (
    SELECT 1 FROM public.expense_policies ep 
    WHERE ep.company_id = c.id AND ep.category_id = ec.id
);

-- Summary: This enhancement adds:
-- ✅ 27 additional expense categories (reaching 40+ total)
-- ✅ Per diem rate management with GSA standards
-- ✅ Comprehensive reimbursement request workflow
-- ✅ Multi-level approval system
-- ✅ Receipt management with OCR readiness
-- ✅ Expense policy compliance framework
-- ✅ Enhanced mileage tracking with trip categories
-- ✅ Payment method tracking and reference numbers
