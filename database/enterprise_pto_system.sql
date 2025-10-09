-- =====================================================
-- ENTERPRISE PTO SYSTEM - MARKET LEADER FEATURES
-- Automated Accrual Engine + Compliance + Audit Trail
-- =====================================================

-- 1. ENHANCED PTO POLICIES (Tenure-Based, Accrual Rules)
-- =====================================================
CREATE TABLE IF NOT EXISTS pto_accrual_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    policy_name TEXT NOT NULL,
    category_code TEXT NOT NULL, -- VAC, SICK, PERS
    
    -- Accrual Configuration
    accrual_method TEXT NOT NULL DEFAULT 'PAY_PERIOD', -- 'HOURLY', 'PAY_PERIOD', 'ANNUAL_LUMP'
    accrual_frequency TEXT NOT NULL DEFAULT 'BIWEEKLY', -- 'WEEKLY', 'BIWEEKLY', 'MONTHLY'
    
    -- Tenure-Based Accrual Rates (JSON array)
    accrual_tiers JSONB DEFAULT '[]'::jsonb, -- [{"min_months": 0, "max_months": 12, "hours_per_period": 3.08}, ...]
    
    -- Caps and Limits
    max_accrual_hours NUMERIC DEFAULT NULL, -- Cap where accrual stops
    max_carryover_hours NUMERIC DEFAULT 40, -- Max hours that can roll over
    
    -- Rollover Rules
    rollover_policy TEXT DEFAULT 'CARRYOVER', -- 'CARRYOVER', 'PAYOUT', 'FORFEIT'
    rollover_date TEXT DEFAULT '01-01', -- MM-DD format
    
    -- Compliance Settings
    state_compliance JSONB DEFAULT '{}'::jsonb, -- State-specific rules
    requires_approval BOOLEAN DEFAULT true,
    advance_notice_days INTEGER DEFAULT 0,
    blackout_periods JSONB DEFAULT '[]'::jsonb, -- [{"start": "12-20", "end": "01-05", "reason": "Holiday blackout"}]
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(company_id, policy_name, category_code)
);

-- 2. EMPLOYEE POLICY ASSIGNMENTS (Who Gets What Policy)
-- =====================================================
CREATE TABLE IF NOT EXISTS employee_pto_policy_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES pto_accrual_policies(id) ON DELETE CASCADE,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE DEFAULT NULL,
    hire_date DATE DEFAULT NULL, -- For tenure calculations
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(employee_id, policy_id, effective_date)
);

-- 3. AUTOMATED ACCRUAL PROCESSING LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS pto_accrual_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    run_date DATE NOT NULL DEFAULT CURRENT_DATE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    accrual_type TEXT NOT NULL, -- 'REGULAR', 'ADJUSTMENT', 'ROLLOVER'
    employees_processed INTEGER DEFAULT 0,
    total_hours_accrued NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'COMPLETED', -- 'RUNNING', 'COMPLETED', 'FAILED'
    error_log TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(company_id, pay_period_start, pay_period_end, accrual_type)
);

-- 4. ENHANCED LEDGER WITH ACCRUAL TRACKING
-- =====================================================
-- Add missing columns to existing pto_ledger
ALTER TABLE pto_ledger 
ADD COLUMN IF NOT EXISTS accrual_run_id UUID REFERENCES pto_accrual_runs(id),
ADD COLUMN IF NOT EXISTS pay_period_start DATE,
ADD COLUMN IF NOT EXISTS pay_period_end DATE,
ADD COLUMN IF NOT EXISTS tenure_months INTEGER,
ADD COLUMN IF NOT EXISTS accrual_rate NUMERIC;

-- 5. REAL-TIME BALANCE CALCULATION FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_pto_balance(
    p_employee_id UUID,
    p_category_code TEXT,
    p_as_of_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    current_balance NUMERIC,
    pending_requests NUMERIC,
    available_balance NUMERIC,
    ytd_accrued NUMERIC,
    ytd_used NUMERIC,
    last_accrual_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Current balance from ledger
        COALESCE(
            (SELECT SUM(
                CASE 
                    WHEN entry_type IN ('ACCRUAL', 'ADJUSTMENT_ADD', 'CARRYOVER', 'MANUAL_ADD') THEN hours
                    WHEN entry_type IN ('USAGE', 'ADJUSTMENT_SUB', 'FORFEITURE', 'PAYOUT') THEN -hours
                    ELSE 0
                END
            )
            FROM pto_ledger 
            WHERE employee_id = p_employee_id 
            AND category_code = p_category_code
            AND effective_date <= p_as_of_date), 0
        )::NUMERIC as current_balance,
        
        -- Pending requests
        COALESCE(
            (SELECT SUM(hours_requested)
            FROM employee_time_off
            WHERE employee_id = p_employee_id 
            AND category_code = p_category_code
            AND status = 'PENDING'
            AND starts_at::date <= p_as_of_date), 0
        )::NUMERIC as pending_requests,
        
        -- Available balance (current - pending)
        (COALESCE(
            (SELECT SUM(
                CASE 
                    WHEN entry_type IN ('ACCRUAL', 'ADJUSTMENT_ADD', 'CARRYOVER', 'MANUAL_ADD') THEN hours
                    WHEN entry_type IN ('USAGE', 'ADJUSTMENT_SUB', 'FORFEITURE', 'PAYOUT') THEN -hours
                    ELSE 0
                END
            )
            FROM pto_ledger 
            WHERE employee_id = p_employee_id 
            AND category_code = p_category_code
            AND effective_date <= p_as_of_date), 0
        ) - COALESCE(
            (SELECT SUM(hours_requested)
            FROM employee_time_off
            WHERE employee_id = p_employee_id 
            AND category_code = p_category_code
            AND status = 'PENDING'
            AND starts_at::date <= p_as_of_date), 0
        ))::NUMERIC as available_balance,
        
        -- YTD Accrued
        COALESCE(
            (SELECT SUM(hours)
            FROM pto_ledger 
            WHERE employee_id = p_employee_id 
            AND category_code = p_category_code
            AND entry_type IN ('ACCRUAL', 'ADJUSTMENT_ADD', 'CARRYOVER')
            AND effective_date >= DATE_TRUNC('year', p_as_of_date)::date
            AND effective_date <= p_as_of_date), 0
        )::NUMERIC as ytd_accrued,
        
        -- YTD Used
        COALESCE(
            (SELECT SUM(hours)
            FROM pto_ledger 
            WHERE employee_id = p_employee_id 
            AND category_code = p_category_code
            AND entry_type IN ('USAGE')
            AND effective_date >= DATE_TRUNC('year', p_as_of_date)::date
            AND effective_date <= p_as_of_date), 0
        )::NUMERIC as ytd_used,
        
        -- Last accrual date
        (SELECT MAX(effective_date)
        FROM pto_ledger 
        WHERE employee_id = p_employee_id 
        AND category_code = p_category_code
        AND entry_type = 'ACCRUAL')::DATE as last_accrual_date;
END;
$$ LANGUAGE plpgsql;

-- 6. AUTOMATED ACCRUAL PROCESSING FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION process_pto_accruals(
    p_company_id UUID,
    p_pay_period_start DATE,
    p_pay_period_end DATE
) RETURNS UUID AS $$
DECLARE
    v_run_id UUID;
    v_employee RECORD;
    v_policy RECORD;
    v_tenure_months INTEGER;
    v_accrual_hours NUMERIC;
    v_current_balance NUMERIC;
    v_employees_processed INTEGER := 0;
    v_total_hours NUMERIC := 0;
BEGIN
    -- Create accrual run record
    INSERT INTO pto_accrual_runs (company_id, pay_period_start, pay_period_end, accrual_type, status)
    VALUES (p_company_id, p_pay_period_start, p_pay_period_end, 'REGULAR', 'RUNNING')
    RETURNING id INTO v_run_id;
    
    -- Process each active employee
    FOR v_employee IN 
        SELECT u.id, u.hire_date, u.full_name
        FROM users u
        WHERE u.company_id = p_company_id 
        AND u.active = true
    LOOP
        -- Get active policies for this employee
        FOR v_policy IN
            SELECT ap.*, apa.hire_date as assignment_hire_date
            FROM pto_accrual_policies ap
            JOIN employee_pto_policy_assignments apa ON ap.id = apa.policy_id
            WHERE apa.employee_id = v_employee.id
            AND ap.company_id = p_company_id
            AND ap.is_active = true
            AND apa.effective_date <= p_pay_period_end
            AND (apa.end_date IS NULL OR apa.end_date >= p_pay_period_start)
        LOOP
            -- Calculate tenure in months
            v_tenure_months := EXTRACT(YEAR FROM AGE(p_pay_period_end, COALESCE(v_policy.assignment_hire_date, v_employee.hire_date, p_pay_period_start))) * 12 +
                              EXTRACT(MONTH FROM AGE(p_pay_period_end, COALESCE(v_policy.assignment_hire_date, v_employee.hire_date, p_pay_period_start)));
            
            -- Calculate accrual hours based on tenure and policy
            v_accrual_hours := calculate_accrual_for_tenure(v_policy.accrual_tiers, v_tenure_months);
            
            -- Check if employee is at accrual cap
            SELECT current_balance INTO v_current_balance
            FROM calculate_pto_balance(v_employee.id, v_policy.category_code, p_pay_period_end);
            
            -- Only accrue if under cap
            IF v_policy.max_accrual_hours IS NULL OR v_current_balance < v_policy.max_accrual_hours THEN
                -- Apply cap if necessary
                IF v_policy.max_accrual_hours IS NOT NULL THEN
                    v_accrual_hours := LEAST(v_accrual_hours, v_policy.max_accrual_hours - v_current_balance);
                END IF;
                
                -- Create ledger entry
                IF v_accrual_hours > 0 THEN
                    INSERT INTO pto_ledger (
                        employee_id, category_code, company_id, entry_type, hours, 
                        effective_date, notes, accrual_run_id, pay_period_start, 
                        pay_period_end, tenure_months, accrual_rate
                    ) VALUES (
                        v_employee.id, v_policy.category_code, p_company_id, 'ACCRUAL', v_accrual_hours,
                        p_pay_period_end, 'Automated accrual - ' || v_policy.policy_name, v_run_id,
                        p_pay_period_start, p_pay_period_end, v_tenure_months, v_accrual_hours
                    );
                    
                    v_total_hours := v_total_hours + v_accrual_hours;
                END IF;
            END IF;
        END LOOP;
        
        v_employees_processed := v_employees_processed + 1;
    END LOOP;
    
    -- Update run record
    UPDATE pto_accrual_runs 
    SET status = 'COMPLETED', 
        employees_processed = v_employees_processed,
        total_hours_accrued = v_total_hours
    WHERE id = v_run_id;
    
    RETURN v_run_id;
END;
$$ LANGUAGE plpgsql;

-- 7. HELPER FUNCTION FOR TENURE-BASED ACCRUAL CALCULATION
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_accrual_for_tenure(
    accrual_tiers JSONB,
    tenure_months INTEGER
) RETURNS NUMERIC AS $$
DECLARE
    tier JSONB;
    accrual_rate NUMERIC := 0;
BEGIN
    -- Loop through tiers to find matching tenure
    FOR tier IN SELECT * FROM jsonb_array_elements(accrual_tiers)
    LOOP
        IF tenure_months >= (tier->>'min_months')::INTEGER 
           AND (tier->>'max_months' IS NULL OR tenure_months <= (tier->>'max_months')::INTEGER) THEN
            accrual_rate := (tier->>'hours_per_period')::NUMERIC;
            EXIT;
        END IF;
    END LOOP;
    
    RETURN accrual_rate;
END;
$$ LANGUAGE plpgsql;

-- 8. CREATE DEFAULT ENTERPRISE POLICIES
-- =====================================================
-- Vacation Policy (Tenure-Based Accrual)
INSERT INTO pto_accrual_policies (
    company_id, policy_name, category_code, accrual_method, accrual_frequency,
    accrual_tiers, max_accrual_hours, max_carryover_hours, rollover_policy,
    requires_approval, advance_notice_days
)
SELECT DISTINCT
    c.id,
    'Standard Vacation Policy',
    'VAC',
    'PAY_PERIOD',
    'BIWEEKLY',
    '[
        {"min_months": 0, "max_months": 12, "hours_per_period": 3.08},
        {"min_months": 13, "max_months": 60, "hours_per_period": 4.62},
        {"min_months": 61, "max_months": null, "hours_per_period": 6.15}
    ]'::jsonb,
    200, -- 200 hour cap (5 weeks)
    40,  -- 40 hours carryover (1 week)
    'CARRYOVER',
    true,
    7
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM pto_accrual_policies p
    WHERE p.company_id = c.id AND p.category_code = 'VAC'
);
