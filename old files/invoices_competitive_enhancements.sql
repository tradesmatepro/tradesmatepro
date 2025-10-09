-- =====================================================
-- INVOICES COMPETITIVE ENHANCEMENTS DATABASE SCHEMA
-- =====================================================
-- This script creates advanced invoicing features to match/exceed
-- ServiceTitan, Jobber, and Housecall Pro capabilities
-- =====================================================

-- 1. SALES ANALYTICS INTEGRATION
-- =====================================================

-- Sales rep attribution for invoices
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS sales_rep_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS lead_source TEXT,
ADD COLUMN IF NOT EXISTS customer_acquisition_cost NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(10,2) DEFAULT 0;

-- Customer lifetime value tracking
CREATE TABLE IF NOT EXISTS customer_lifetime_value (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    total_revenue NUMERIC(12,2) DEFAULT 0,
    total_invoices INTEGER DEFAULT 0,
    average_invoice_value NUMERIC(10,2) DEFAULT 0,
    first_invoice_date TIMESTAMPTZ,
    last_invoice_date TIMESTAMPTZ,
    customer_lifetime_days INTEGER DEFAULT 0,
    predicted_lifetime_value NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, customer_id)
);

-- Sales commission tracking
CREATE TABLE IF NOT EXISTS invoice_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    sales_rep_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    commission_rate NUMERIC(5,2) NOT NULL,
    commission_amount NUMERIC(10,2) NOT NULL,
    commission_status TEXT DEFAULT 'pending' CHECK (commission_status IN ('pending', 'approved', 'paid', 'cancelled')),
    commission_paid_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADVANCED PAYMENT FEATURES
-- =====================================================

-- Payment reminders automation
CREATE TABLE IF NOT EXISTS payment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('email', 'sms', 'call', 'letter')),
    days_before_due INTEGER,
    days_after_due INTEGER,
    reminder_status TEXT DEFAULT 'scheduled' CHECK (reminder_status IN ('scheduled', 'sent', 'failed', 'cancelled')),
    scheduled_date TIMESTAMPTZ NOT NULL,
    sent_date TIMESTAMPTZ,
    template_used TEXT,
    recipient_email TEXT,
    recipient_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment plans management
CREATE TABLE IF NOT EXISTS payment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    number_of_payments INTEGER NOT NULL,
    payment_frequency TEXT DEFAULT 'monthly' CHECK (payment_frequency IN ('weekly', 'bi-weekly', 'monthly', 'quarterly')),
    first_payment_date TIMESTAMPTZ NOT NULL,
    plan_status TEXT DEFAULT 'active' CHECK (plan_status IN ('active', 'completed', 'cancelled', 'defaulted')),
    setup_fee NUMERIC(10,2) DEFAULT 0,
    interest_rate NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment plan installments
CREATE TABLE IF NOT EXISTS payment_plan_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    payment_plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    amount_due NUMERIC(10,2) NOT NULL,
    amount_paid NUMERIC(10,2) DEFAULT 0,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled')),
    paid_date TIMESTAMPTZ,
    late_fee_amount NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Online payment processing tracking
CREATE TABLE IF NOT EXISTS online_payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE,
    payment_processor TEXT, -- 'stripe', 'square', 'paypal', etc.
    processor_fee NUMERIC(10,2) DEFAULT 0,
    net_amount NUMERIC(10,2) NOT NULL,
    transaction_status TEXT DEFAULT 'pending' CHECK (transaction_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    processor_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REVENUE RECOGNITION & FORECASTING
-- =====================================================

-- Recurring revenue tracking
CREATE TABLE IF NOT EXISTS recurring_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    contract_name TEXT NOT NULL,
    monthly_recurring_revenue NUMERIC(10,2) NOT NULL,
    annual_contract_value NUMERIC(12,2) NOT NULL,
    contract_start_date TIMESTAMPTZ NOT NULL,
    contract_end_date TIMESTAMPTZ,
    billing_frequency TEXT DEFAULT 'monthly' CHECK (billing_frequency IN ('weekly', 'monthly', 'quarterly', 'annually')),
    contract_status TEXT DEFAULT 'active' CHECK (contract_status IN ('active', 'cancelled', 'expired', 'paused')),
    auto_renew BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue forecasting
CREATE TABLE IF NOT EXISTS revenue_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    forecast_period TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly'
    forecast_date TIMESTAMPTZ NOT NULL,
    forecasted_revenue NUMERIC(12,2) NOT NULL,
    actual_revenue NUMERIC(12,2) DEFAULT 0,
    variance_amount NUMERIC(12,2) DEFAULT 0,
    variance_percentage NUMERIC(5,2) DEFAULT 0,
    forecast_confidence NUMERIC(3,2) DEFAULT 0, -- 0-1 scale
    forecast_method TEXT, -- 'historical', 'pipeline', 'seasonal', 'ml'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, forecast_period, forecast_date)
);

-- Cash flow projections
CREATE TABLE IF NOT EXISTS cash_flow_projections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    projection_date TIMESTAMPTZ NOT NULL,
    projected_inflow NUMERIC(12,2) DEFAULT 0,
    projected_outflow NUMERIC(12,2) DEFAULT 0,
    net_cash_flow NUMERIC(12,2) DEFAULT 0,
    cumulative_cash_flow NUMERIC(12,2) DEFAULT 0,
    confidence_level NUMERIC(3,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, projection_date)
);

-- 4. SALES PERFORMANCE METRICS
-- =====================================================

-- Invoice performance analytics
CREATE TABLE IF NOT EXISTS invoice_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    days_to_payment INTEGER,
    payment_velocity_score NUMERIC(5,2), -- 0-100 scale
    collection_difficulty_score NUMERIC(5,2), -- 0-100 scale
    customer_payment_behavior TEXT, -- 'excellent', 'good', 'fair', 'poor'
    follow_up_count INTEGER DEFAULT 0,
    reminder_count INTEGER DEFAULT 0,
    dispute_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, invoice_id)
);

-- Customer payment behavior analysis
CREATE TABLE IF NOT EXISTS customer_payment_behavior (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    average_days_to_pay NUMERIC(5,2) DEFAULT 0,
    payment_reliability_score NUMERIC(5,2) DEFAULT 0, -- 0-100 scale
    total_invoices INTEGER DEFAULT 0,
    on_time_payments INTEGER DEFAULT 0,
    late_payments INTEGER DEFAULT 0,
    disputed_invoices INTEGER DEFAULT 0,
    bad_debt_amount NUMERIC(10,2) DEFAULT 0,
    preferred_payment_method TEXT,
    credit_limit NUMERIC(10,2) DEFAULT 0,
    risk_category TEXT DEFAULT 'low' CHECK (risk_category IN ('low', 'medium', 'high', 'critical')),
    last_payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, customer_id)
);

-- Collection effectiveness tracking
CREATE TABLE IF NOT EXISTS collection_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'letter', 'visit', 'legal')),
    activity_date TIMESTAMPTZ NOT NULL,
    performed_by UUID REFERENCES users(id),
    activity_result TEXT, -- 'payment_received', 'payment_promised', 'dispute_raised', 'no_response'
    notes TEXT,
    follow_up_date TIMESTAMPTZ,
    amount_collected NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Customer lifetime value indexes
CREATE INDEX IF NOT EXISTS idx_customer_lifetime_value_company_customer ON customer_lifetime_value(company_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_lifetime_value_revenue ON customer_lifetime_value(total_revenue DESC);

-- Commission tracking indexes
CREATE INDEX IF NOT EXISTS idx_invoice_commissions_company_rep ON invoice_commissions(company_id, sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_invoice_commissions_status ON invoice_commissions(commission_status);

-- Payment reminders indexes
CREATE INDEX IF NOT EXISTS idx_payment_reminders_company_scheduled ON payment_reminders(company_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_status ON payment_reminders(reminder_status);

-- Payment plans indexes
CREATE INDEX IF NOT EXISTS idx_payment_plans_company_customer ON payment_plans(company_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_plan_installments_due_date ON payment_plan_installments(due_date);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_invoice_analytics_company_performance ON invoice_analytics(company_id, payment_velocity_score DESC);
CREATE INDEX IF NOT EXISTS idx_customer_payment_behavior_risk ON customer_payment_behavior(company_id, risk_category);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE customer_lifetime_value ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plan_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_payment_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for company isolation
CREATE POLICY "Company isolation" ON customer_lifetime_value FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY "Company isolation" ON invoice_commissions FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY "Company isolation" ON payment_reminders FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY "Company isolation" ON payment_plans FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY "Company isolation" ON payment_plan_installments FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY "Company isolation" ON online_payment_transactions FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY "Company isolation" ON recurring_revenue FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY "Company isolation" ON revenue_forecasts FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY "Company isolation" ON cash_flow_projections FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY "Company isolation" ON invoice_analytics FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY "Company isolation" ON customer_payment_behavior FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY "Company isolation" ON collection_activities FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);

-- =====================================================
-- ADVANCED DATABASE FUNCTIONS
-- =====================================================

-- Function to update customer lifetime value
CREATE OR REPLACE FUNCTION update_customer_lifetime_value(p_customer_id UUID, p_company_id UUID)
RETURNS VOID AS $$
DECLARE
    v_total_revenue NUMERIC(12,2);
    v_total_invoices INTEGER;
    v_avg_invoice_value NUMERIC(10,2);
    v_first_invoice_date TIMESTAMPTZ;
    v_last_invoice_date TIMESTAMPTZ;
    v_lifetime_days INTEGER;
    v_predicted_ltv NUMERIC(12,2);
BEGIN
    -- Calculate customer metrics from invoices
    SELECT
        COALESCE(SUM(total_amount), 0),
        COUNT(*),
        COALESCE(AVG(total_amount), 0),
        MIN(issued_at),
        MAX(issued_at)
    INTO v_total_revenue, v_total_invoices, v_avg_invoice_value, v_first_invoice_date, v_last_invoice_date
    FROM invoices
    WHERE customer_id = p_customer_id
    AND company_id = p_company_id
    AND status IN ('PAID', 'PARTIAL_PAID');

    -- Calculate customer lifetime in days
    v_lifetime_days := COALESCE(EXTRACT(DAYS FROM (v_last_invoice_date - v_first_invoice_date)), 0);

    -- Simple predicted LTV calculation (can be enhanced with ML)
    v_predicted_ltv := CASE
        WHEN v_lifetime_days > 0 THEN v_total_revenue * (365.0 / v_lifetime_days) * 2
        ELSE v_avg_invoice_value * 12
    END;

    -- Insert or update customer lifetime value
    INSERT INTO customer_lifetime_value (
        company_id, customer_id, total_revenue, total_invoices,
        average_invoice_value, first_invoice_date, last_invoice_date,
        customer_lifetime_days, predicted_lifetime_value, updated_at
    ) VALUES (
        p_company_id, p_customer_id, v_total_revenue, v_total_invoices,
        v_avg_invoice_value, v_first_invoice_date, v_last_invoice_date,
        v_lifetime_days, v_predicted_ltv, NOW()
    )
    ON CONFLICT (company_id, customer_id)
    DO UPDATE SET
        total_revenue = v_total_revenue,
        total_invoices = v_total_invoices,
        average_invoice_value = v_avg_invoice_value,
        first_invoice_date = v_first_invoice_date,
        last_invoice_date = v_last_invoice_date,
        customer_lifetime_days = v_lifetime_days,
        predicted_lifetime_value = v_predicted_ltv,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to calculate invoice analytics
CREATE OR REPLACE FUNCTION calculate_invoice_analytics(p_invoice_id UUID, p_company_id UUID)
RETURNS VOID AS $$
DECLARE
    v_invoice_record RECORD;
    v_payment_record RECORD;
    v_days_to_payment INTEGER;
    v_velocity_score NUMERIC(5,2);
    v_difficulty_score NUMERIC(5,2);
    v_behavior_category TEXT;
    v_follow_up_count INTEGER;
    v_reminder_count INTEGER;
BEGIN
    -- Get invoice details
    SELECT issued_at, due_date, total_amount, status, customer_id
    INTO v_invoice_record
    FROM invoices
    WHERE id = p_invoice_id AND company_id = p_company_id;

    -- Get payment details
    SELECT MIN(paid_at) as first_payment_date, SUM(amount) as total_paid
    INTO v_payment_record
    FROM payments
    WHERE invoice_id = p_invoice_id;

    -- Calculate days to payment
    IF v_payment_record.first_payment_date IS NOT NULL THEN
        v_days_to_payment := EXTRACT(DAYS FROM (v_payment_record.first_payment_date - v_invoice_record.issued_at));
    END IF;

    -- Calculate velocity score (0-100, higher is better)
    v_velocity_score := CASE
        WHEN v_days_to_payment IS NULL THEN 0
        WHEN v_days_to_payment <= 0 THEN 100
        WHEN v_days_to_payment <= 7 THEN 90
        WHEN v_days_to_payment <= 14 THEN 80
        WHEN v_days_to_payment <= 30 THEN 60
        WHEN v_days_to_payment <= 60 THEN 40
        ELSE 20
    END;

    -- Get follow-up and reminder counts
    SELECT COUNT(*) INTO v_follow_up_count FROM collection_activities WHERE invoice_id = p_invoice_id;
    SELECT COUNT(*) INTO v_reminder_count FROM payment_reminders WHERE invoice_id = p_invoice_id AND reminder_status = 'sent';

    -- Calculate collection difficulty score (0-100, higher is more difficult)
    v_difficulty_score := LEAST(100, (v_follow_up_count * 10) + (v_reminder_count * 5) +
        CASE WHEN v_days_to_payment > 30 THEN 30 ELSE 0 END);

    -- Determine payment behavior category
    v_behavior_category := CASE
        WHEN v_velocity_score >= 80 THEN 'excellent'
        WHEN v_velocity_score >= 60 THEN 'good'
        WHEN v_velocity_score >= 40 THEN 'fair'
        ELSE 'poor'
    END;

    -- Insert or update analytics
    INSERT INTO invoice_analytics (
        company_id, invoice_id, days_to_payment, payment_velocity_score,
        collection_difficulty_score, customer_payment_behavior,
        follow_up_count, reminder_count, updated_at
    ) VALUES (
        p_company_id, p_invoice_id, v_days_to_payment, v_velocity_score,
        v_difficulty_score, v_behavior_category, v_follow_up_count, v_reminder_count, NOW()
    )
    ON CONFLICT (company_id, invoice_id)
    DO UPDATE SET
        days_to_payment = v_days_to_payment,
        payment_velocity_score = v_velocity_score,
        collection_difficulty_score = v_difficulty_score,
        customer_payment_behavior = v_behavior_category,
        follow_up_count = v_follow_up_count,
        reminder_count = v_reminder_count,
        updated_at = NOW();

    -- Update customer payment behavior
    PERFORM update_customer_payment_behavior(v_invoice_record.customer_id, p_company_id);
END;
$$ LANGUAGE plpgsql;

-- Function to update customer payment behavior
CREATE OR REPLACE FUNCTION update_customer_payment_behavior(p_customer_id UUID, p_company_id UUID)
RETURNS VOID AS $$
DECLARE
    v_avg_days NUMERIC(5,2);
    v_reliability_score NUMERIC(5,2);
    v_total_invoices INTEGER;
    v_on_time_payments INTEGER;
    v_late_payments INTEGER;
    v_disputed_invoices INTEGER;
    v_bad_debt_amount NUMERIC(10,2);
    v_last_payment_date TIMESTAMPTZ;
    v_risk_category TEXT;
BEGIN
    -- Calculate payment behavior metrics
    SELECT
        COALESCE(AVG(ia.days_to_payment), 0),
        COUNT(*),
        COUNT(CASE WHEN ia.days_to_payment <= 30 THEN 1 END),
        COUNT(CASE WHEN ia.days_to_payment > 30 THEN 1 END),
        COUNT(CASE WHEN ia.dispute_count > 0 THEN 1 END),
        COALESCE(SUM(CASE WHEN i.status = 'CANCELLED' THEN i.total_amount ELSE 0 END), 0),
        MAX(p.paid_at)
    INTO v_avg_days, v_total_invoices, v_on_time_payments, v_late_payments,
         v_disputed_invoices, v_bad_debt_amount, v_last_payment_date
    FROM invoice_analytics ia
    JOIN invoices i ON ia.invoice_id = i.id
    LEFT JOIN payments p ON i.id = p.invoice_id
    WHERE i.customer_id = p_customer_id AND i.company_id = p_company_id;

    -- Calculate reliability score (0-100)
    v_reliability_score := CASE
        WHEN v_total_invoices = 0 THEN 50
        ELSE LEAST(100, (v_on_time_payments::NUMERIC / v_total_invoices * 100) - (v_disputed_invoices * 10))
    END;

    -- Determine risk category
    v_risk_category := CASE
        WHEN v_reliability_score >= 80 AND v_bad_debt_amount = 0 THEN 'low'
        WHEN v_reliability_score >= 60 AND v_bad_debt_amount < 1000 THEN 'medium'
        WHEN v_reliability_score >= 40 OR v_bad_debt_amount < 5000 THEN 'high'
        ELSE 'critical'
    END;

    -- Insert or update customer payment behavior
    INSERT INTO customer_payment_behavior (
        company_id, customer_id, average_days_to_pay, payment_reliability_score,
        total_invoices, on_time_payments, late_payments, disputed_invoices,
        bad_debt_amount, last_payment_date, risk_category, updated_at
    ) VALUES (
        p_company_id, p_customer_id, v_avg_days, v_reliability_score,
        v_total_invoices, v_on_time_payments, v_late_payments, v_disputed_invoices,
        v_bad_debt_amount, v_last_payment_date, v_risk_category, NOW()
    )
    ON CONFLICT (company_id, customer_id)
    DO UPDATE SET
        average_days_to_pay = v_avg_days,
        payment_reliability_score = v_reliability_score,
        total_invoices = v_total_invoices,
        on_time_payments = v_on_time_payments,
        late_payments = v_late_payments,
        disputed_invoices = v_disputed_invoices,
        bad_debt_amount = v_bad_debt_amount,
        last_payment_date = v_last_payment_date,
        risk_category = v_risk_category,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ADVANCED DATABASE VIEWS
-- =====================================================

-- Invoice performance dashboard view
CREATE OR REPLACE VIEW invoice_performance_dashboard AS
SELECT
    i.company_id,
    COUNT(*) as total_invoices,
    SUM(i.total_amount) as total_revenue,
    AVG(i.total_amount) as average_invoice_value,
    COUNT(CASE WHEN i.status = 'PAID' THEN 1 END) as paid_invoices,
    COUNT(CASE WHEN i.status = 'OVERDUE' THEN 1 END) as overdue_invoices,
    COUNT(CASE WHEN i.due_date < NOW() AND i.status NOT IN ('PAID', 'CANCELLED') THEN 1 END) as past_due_invoices,
    COALESCE(AVG(ia.days_to_payment), 0) as average_days_to_payment,
    COALESCE(AVG(ia.payment_velocity_score), 0) as average_velocity_score,
    SUM(CASE WHEN i.status = 'PAID' THEN i.total_amount ELSE 0 END) as collected_revenue,
    SUM(CASE WHEN i.status IN ('UNPAID', 'OVERDUE', 'PARTIAL_PAID') THEN i.total_amount ELSE 0 END) as outstanding_revenue
FROM invoices i
LEFT JOIN invoice_analytics ia ON i.id = ia.invoice_id
GROUP BY i.company_id;

-- Customer payment behavior summary view
CREATE OR REPLACE VIEW customer_payment_summary AS
SELECT
    cpb.company_id,
    cpb.customer_id,
    c.name as customer_name,
    cpb.payment_reliability_score,
    cpb.average_days_to_pay,
    cpb.total_invoices,
    cpb.on_time_payments,
    cpb.late_payments,
    cpb.risk_category,
    clv.total_revenue,
    clv.predicted_lifetime_value,
    cpb.last_payment_date
FROM customer_payment_behavior cpb
JOIN customers c ON cpb.customer_id = c.id
LEFT JOIN customer_lifetime_value clv ON cpb.customer_id = clv.customer_id AND cpb.company_id = clv.company_id;

-- Sales rep commission summary view
CREATE OR REPLACE VIEW sales_rep_commission_summary AS
SELECT
    ic.company_id,
    ic.sales_rep_id,
    u.first_name || ' ' || u.last_name as sales_rep_name,
    COUNT(*) as total_invoices,
    SUM(i.total_amount) as total_sales,
    SUM(ic.commission_amount) as total_commission_earned,
    SUM(CASE WHEN ic.commission_status = 'paid' THEN ic.commission_amount ELSE 0 END) as commission_paid,
    SUM(CASE WHEN ic.commission_status = 'pending' THEN ic.commission_amount ELSE 0 END) as commission_pending,
    AVG(ic.commission_rate) as average_commission_rate
FROM invoice_commissions ic
JOIN invoices i ON ic.invoice_id = i.id
JOIN users u ON ic.sales_rep_id = u.id
GROUP BY ic.company_id, ic.sales_rep_id, u.first_name, u.last_name;

-- Revenue forecast accuracy view
CREATE OR REPLACE VIEW revenue_forecast_accuracy AS
SELECT
    rf.company_id,
    rf.forecast_period,
    rf.forecast_date,
    rf.forecasted_revenue,
    rf.actual_revenue,
    rf.variance_amount,
    rf.variance_percentage,
    rf.forecast_confidence,
    CASE
        WHEN ABS(rf.variance_percentage) <= 5 THEN 'Excellent'
        WHEN ABS(rf.variance_percentage) <= 10 THEN 'Good'
        WHEN ABS(rf.variance_percentage) <= 20 THEN 'Fair'
        ELSE 'Poor'
    END as forecast_accuracy_rating
FROM revenue_forecasts rf
WHERE rf.actual_revenue > 0;

-- =====================================================
-- AUTOMATED TRIGGERS
-- =====================================================

-- Trigger to update analytics when payment is recorded
CREATE OR REPLACE FUNCTION trigger_update_invoice_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update invoice analytics when payment is recorded
    IF TG_OP = 'INSERT' THEN
        PERFORM calculate_invoice_analytics(NEW.invoice_id,
            (SELECT company_id FROM invoices WHERE id = NEW.invoice_id));
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger on payments table
DROP TRIGGER IF EXISTS update_invoice_analytics_on_payment ON payments;
CREATE TRIGGER update_invoice_analytics_on_payment
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_invoice_analytics();

-- Trigger to update customer lifetime value when invoice is paid
CREATE OR REPLACE FUNCTION trigger_update_customer_ltv()
RETURNS TRIGGER AS $$
BEGIN
    -- Update customer LTV when invoice status changes to paid
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'PAID' THEN
        PERFORM update_customer_lifetime_value(NEW.customer_id, NEW.company_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on invoices table
DROP TRIGGER IF EXISTS update_customer_ltv_on_payment ON invoices;
CREATE TRIGGER update_customer_ltv_on_payment
    AFTER UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_customer_ltv();

-- Trigger to calculate commission when invoice is paid
CREATE OR REPLACE FUNCTION trigger_calculate_commission()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate commission when invoice is paid and has sales rep
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'PAID' AND NEW.sales_rep_id IS NOT NULL THEN
        INSERT INTO invoice_commissions (
            company_id, invoice_id, sales_rep_id, commission_rate, commission_amount
        ) VALUES (
            NEW.company_id,
            NEW.id,
            NEW.sales_rep_id,
            COALESCE(NEW.commission_rate, 5.0), -- Default 5% commission
            NEW.total_amount * (COALESCE(NEW.commission_rate, 5.0) / 100)
        )
        ON CONFLICT (company_id, invoice_id, sales_rep_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on invoices table for commission calculation
DROP TRIGGER IF EXISTS calculate_commission_on_payment ON invoices;
CREATE TRIGGER calculate_commission_on_payment
    AFTER UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calculate_commission();
