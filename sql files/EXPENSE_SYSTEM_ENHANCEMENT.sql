-- Enhanced Expense Management System
-- Brings TradeMate Pro up to industry standards with comprehensive expense tracking

-- 1. Enhanced expense categories with subcategories
INSERT INTO expense_categories (company_id, name, description, is_default) VALUES
-- Vehicle Expenses
('00000000-0000-0000-0000-000000000000', 'Vehicle - Fuel', 'Gas, diesel, and other fuel costs', true),
('00000000-0000-0000-0000-000000000000', 'Vehicle - Maintenance', 'Oil changes, repairs, tire replacement', true),
('00000000-0000-0000-0000-000000000000', 'Vehicle - Insurance', 'Commercial vehicle insurance premiums', true),
('00000000-0000-0000-0000-000000000000', 'Vehicle - Registration', 'License plates, registration fees, inspections', true),
('00000000-0000-0000-0000-000000000000', 'Vehicle - Parking & Tolls', 'Parking fees, toll roads, meters', true),

-- Meals & Entertainment
('00000000-0000-0000-0000-000000000000', 'Meals - Business', 'Business meals with clients or colleagues', true),
('00000000-0000-0000-0000-000000000000', 'Meals - Travel', 'Meals while traveling for business', true),
('00000000-0000-0000-0000-000000000000', 'Meals - Training', 'Meals during training sessions or conferences', true),
('00000000-0000-0000-0000-000000000000', 'Entertainment - Client', 'Client entertainment and relationship building', true),

-- Travel Expenses
('00000000-0000-0000-0000-000000000000', 'Travel - Lodging', 'Hotels, motels, and other accommodations', true),
('00000000-0000-0000-0000-000000000000', 'Travel - Transportation', 'Flights, trains, buses, rental cars', true),
('00000000-0000-0000-0000-000000000000', 'Travel - Mileage', 'Personal vehicle use for business travel', true),

-- Training & Education
('00000000-0000-0000-0000-000000000000', 'Training - Courses', 'Professional development courses and certifications', true),
('00000000-0000-0000-0000-000000000000', 'Training - Conferences', 'Industry conferences and seminars', true),
('00000000-0000-0000-0000-000000000000', 'Training - Materials', 'Books, manuals, and training materials', true),

-- Office & Supplies
('00000000-0000-0000-0000-000000000000', 'Office - Supplies', 'Pens, paper, folders, and general office supplies', true),
('00000000-0000-0000-0000-000000000000', 'Office - Equipment', 'Computers, printers, phones, and office equipment', true),
('00000000-0000-0000-0000-000000000000', 'Office - Software', 'Software licenses and subscriptions', true),

-- Professional Services
('00000000-0000-0000-0000-000000000000', 'Professional - Legal', 'Legal fees and attorney services', true),
('00000000-0000-0000-0000-000000000000', 'Professional - Accounting', 'Accounting and bookkeeping services', true),
('00000000-0000-0000-0000-000000000000', 'Professional - Consulting', 'Business consulting and advisory services', true),

-- Marketing & Advertising
('00000000-0000-0000-0000-000000000000', 'Marketing - Advertising', 'Online ads, print ads, radio/TV advertising', true),
('00000000-0000-0000-0000-000000000000', 'Marketing - Materials', 'Brochures, business cards, promotional items', true),
('00000000-0000-0000-0000-000000000000', 'Marketing - Website', 'Website development and maintenance', true),

-- Tools & Equipment
('00000000-0000-0000-0000-000000000000', 'Tools - Hand Tools', 'Wrenches, screwdrivers, and hand tools', true),
('00000000-0000-0000-0000-000000000000', 'Tools - Power Tools', 'Drills, saws, and power equipment', true),
('00000000-0000-0000-0000-000000000000', 'Tools - Safety Equipment', 'Hard hats, safety glasses, protective gear', true),

-- Utilities & Communications
('00000000-0000-0000-0000-000000000000', 'Utilities - Phone', 'Business phone and mobile service', true),
('00000000-0000-0000-0000-000000000000', 'Utilities - Internet', 'Internet service and connectivity', true),
('00000000-0000-0000-0000-000000000000', 'Utilities - Electric', 'Electricity for business operations', true),

-- Insurance & Licenses
('00000000-0000-0000-0000-000000000000', 'Insurance - General Liability', 'General business liability insurance', true),
('00000000-0000-0000-0000-000000000000', 'Insurance - Workers Comp', 'Workers compensation insurance', true),
('00000000-0000-0000-0000-000000000000', 'Licenses - Business', 'Business licenses and permits', true),
('00000000-0000-0000-0000-000000000000', 'Licenses - Professional', 'Professional certifications and licenses', true),

-- Miscellaneous
('00000000-0000-0000-0000-000000000000', 'Miscellaneous - Bank Fees', 'Banking fees and charges', true),
('00000000-0000-0000-0000-000000000000', 'Miscellaneous - Postage', 'Shipping and postage costs', true),
('00000000-0000-0000-0000-000000000000', 'Miscellaneous - Other', 'Other business expenses not categorized', true);

-- 2. Add mileage tracking table
CREATE TABLE IF NOT EXISTS mileage_expenses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    expense_id uuid REFERENCES expenses(id) ON DELETE CASCADE,
    
    -- Trip details
    trip_date date NOT NULL DEFAULT CURRENT_DATE,
    start_location text NOT NULL,
    end_location text NOT NULL,
    purpose text NOT NULL,
    
    -- Mileage calculation
    miles_driven numeric(10,2) NOT NULL,
    rate_per_mile numeric(10,4) DEFAULT 0.655, -- 2024 IRS standard rate
    total_amount numeric(10,2) GENERATED ALWAYS AS (miles_driven * rate_per_mile) STORED,
    
    -- Vehicle info
    vehicle_description text,
    odometer_start integer,
    odometer_end integer,
    
    -- Metadata
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Add expense approval workflow
CREATE TABLE IF NOT EXISTS expense_approvals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    expense_id uuid NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    
    -- Approval details
    approver_id uuid REFERENCES users(id) ON DELETE SET NULL,
    approval_level integer DEFAULT 1,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_info')),
    
    -- Comments and feedback
    comments text,
    approved_at timestamp with time zone,
    
    -- Metadata
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. Add receipt attachments table (multiple receipts per expense)
CREATE TABLE IF NOT EXISTS expense_receipts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    expense_id uuid NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    
    -- Receipt details
    file_url text NOT NULL,
    file_name text,
    file_size integer,
    file_type text,
    
    -- OCR extracted data
    ocr_text text,
    ocr_vendor text,
    ocr_amount numeric(10,2),
    ocr_date date,
    ocr_confidence numeric(3,2), -- 0.00 to 1.00
    
    -- Status
    status text DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'processed', 'failed')),
    
    -- Metadata
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. Enhance expenses table with new fields
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS expense_type text DEFAULT 'general' CHECK (expense_type IN ('general', 'mileage', 'per_diem', 'corporate_card'));
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS reimbursement_status text DEFAULT 'pending' CHECK (reimbursement_status IN ('pending', 'approved', 'paid', 'not_reimbursable'));
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'draft' CHECK (approval_status IN ('draft', 'submitted', 'pending_approval', 'approved', 'rejected'));
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'personal' CHECK (payment_method IN ('personal', 'corporate_card', 'petty_cash', 'company_check'));
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_tax_deductible boolean DEFAULT true;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS business_purpose text;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS attendees text; -- For meal expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS location text; -- Where expense occurred

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mileage_expenses_company_date ON mileage_expenses(company_id, trip_date);
CREATE INDEX IF NOT EXISTS idx_expense_approvals_status ON expense_approvals(expense_id, status);
CREATE INDEX IF NOT EXISTS idx_expense_receipts_expense ON expense_receipts(expense_id);
CREATE INDEX IF NOT EXISTS idx_expenses_approval_status ON expenses(company_id, approval_status);
CREATE INDEX IF NOT EXISTS idx_expenses_reimbursement_status ON expenses(company_id, reimbursement_status);

-- 7. Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mileage_expenses_updated_at BEFORE UPDATE ON mileage_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expense_approvals_updated_at BEFORE UPDATE ON expense_approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expense_receipts_updated_at BEFORE UPDATE ON expense_receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Grant permissions
GRANT ALL ON mileage_expenses TO authenticated;
GRANT ALL ON expense_approvals TO authenticated;
GRANT ALL ON expense_receipts TO authenticated;

-- Note: Replace '00000000-0000-0000-0000-000000000000' with actual company IDs when inserting categories
-- This creates default categories that all companies can use
