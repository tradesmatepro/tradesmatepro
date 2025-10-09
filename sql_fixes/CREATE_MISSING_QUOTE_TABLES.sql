-- ========================================
-- CREATE MISSING TABLES FOR QUOTE CREATION
-- Fix 404 errors when creating quotes
-- ========================================

BEGIN;

-- ========================================
-- 1. SERVICE_RATES TABLE
-- Store service-specific pricing rates
-- ========================================

CREATE TABLE IF NOT EXISTS service_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    service_category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
    service_type_id UUID REFERENCES service_types(id) ON DELETE SET NULL,
    
    -- Rate details
    rate_name TEXT NOT NULL,
    rate_type TEXT CHECK (rate_type IN ('hourly', 'flat', 'unit')) DEFAULT 'hourly',
    base_rate NUMERIC(10,2) NOT NULL,
    overtime_rate NUMERIC(10,2),
    emergency_rate NUMERIC(10,2),
    
    -- Effective dates
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_rates_company ON service_rates(company_id);
CREATE INDEX IF NOT EXISTS idx_service_rates_category ON service_rates(service_category_id);
CREATE INDEX IF NOT EXISTS idx_service_rates_effective ON service_rates(effective_date) WHERE is_active = TRUE;

COMMENT ON TABLE service_rates IS 'Service-specific pricing rates';

-- ========================================
-- 2. PRICING_RULES TABLE
-- Dynamic pricing rules and adjustments
-- ========================================

CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Rule details
    rule_name TEXT NOT NULL,
    rule_type TEXT CHECK (rule_type IN ('markup', 'discount', 'surcharge', 'minimum')) DEFAULT 'markup',
    
    -- Conditions
    applies_to TEXT CHECK (applies_to IN ('labor', 'materials', 'equipment', 'all')) DEFAULT 'all',
    condition_type TEXT CHECK (condition_type IN ('always', 'time_of_day', 'day_of_week', 'urgency', 'customer_type')),
    condition_value JSONB, -- Store condition details
    
    -- Adjustment
    adjustment_type TEXT CHECK (adjustment_type IN ('percentage', 'fixed_amount')) DEFAULT 'percentage',
    adjustment_value NUMERIC(10,2) NOT NULL,
    
    -- Validity
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_to DATE,
    
    -- Priority (higher number = higher priority)
    priority INTEGER DEFAULT 0,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_rules_company ON pricing_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_valid ON pricing_rules(valid_from, valid_to) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_pricing_rules_priority ON pricing_rules(priority DESC) WHERE is_active = TRUE;

COMMENT ON TABLE pricing_rules IS 'Dynamic pricing rules and adjustments';

-- ========================================
-- 3. TOOL_PREFERENCES TABLE
-- User-specific tool and UI preferences
-- ========================================

CREATE TABLE IF NOT EXISTS tool_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Quote builder preferences
    default_pricing_model TEXT DEFAULT 'TIME_MATERIALS',
    default_tax_rate NUMERIC(5,2),
    auto_add_labor_row BOOLEAN DEFAULT TRUE,
    default_labor_hours NUMERIC(10,2) DEFAULT 8,
    default_crew_size INTEGER DEFAULT 1,
    
    -- Display preferences
    show_advanced_options BOOLEAN DEFAULT FALSE,
    show_cost_breakdown BOOLEAN DEFAULT TRUE,
    show_profit_margin BOOLEAN DEFAULT FALSE,
    
    -- Calculation preferences
    round_to_nearest NUMERIC(10,2) DEFAULT 0.01, -- Round to nearest cent
    auto_calculate_totals BOOLEAN DEFAULT TRUE,
    
    -- Notification preferences
    notify_on_quote_viewed BOOLEAN DEFAULT TRUE,
    notify_on_quote_accepted BOOLEAN DEFAULT TRUE,
    notify_on_quote_rejected BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_preferences_user ON tool_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_preferences_company ON tool_preferences(company_id);

COMMENT ON TABLE tool_preferences IS 'User-specific tool and UI preferences';

-- ========================================
-- 4. FIX EMPLOYEES TABLE QUERY
-- The query is trying to join profiles with wrong FK name
-- Check actual employees table structure
-- ========================================

-- Check if employees table exists and has correct structure
DO $$
BEGIN
    -- If employees table exists but has wrong FK, we'll handle it gracefully
    -- The error is: employees?select=*,user:profiles!user_id(full_name)
    -- This suggests employees.user_id should reference profiles.id
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') THEN
        -- Check if user_id column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'employees' AND column_name = 'user_id'
        ) THEN
            -- Add user_id if missing
            ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
            CREATE INDEX IF NOT EXISTS idx_employees_user ON employees(user_id);
        END IF;
    ELSE
        -- Create employees table if it doesn't exist
        CREATE TABLE employees (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
            user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
            
            -- Employee details
            employee_number TEXT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            
            -- Employment details
            position TEXT,
            department TEXT,
            hire_date DATE,
            termination_date DATE,
            employment_status TEXT CHECK (employment_status IN ('active', 'inactive', 'terminated')) DEFAULT 'active',
            
            -- Rates
            hourly_rate NUMERIC(10,2),
            overtime_rate NUMERIC(10,2),
            
            -- Metadata
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);
        CREATE INDEX IF NOT EXISTS idx_employees_user ON employees(user_id);
        CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status) WHERE is_active = TRUE;
    END IF;
END $$;

-- ========================================
-- 5. INSERT DEFAULT DATA
-- ========================================

-- Insert default tool preferences for existing users
INSERT INTO tool_preferences (user_id, company_id, default_pricing_model, auto_add_labor_row)
SELECT 
    p.id,
    p.company_id,
    'TIME_MATERIALS',
    TRUE
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM tool_preferences WHERE user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

-- ========================================
-- VERIFICATION
-- ========================================

SELECT '✅ Missing quote tables created!' as result;

-- Show created tables
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
    '✅ CREATED' as status
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('service_rates', 'pricing_rules', 'tool_preferences', 'employees')
ORDER BY table_name;
