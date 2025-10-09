-- ========================================
-- CREATE MISSING INDUSTRY STANDARD CUSTOMER TABLES
-- Based on ServiceTitan, Jobber, Housecall Pro standards
-- ========================================

-- 1. CREATE CUSTOMER COMMUNICATIONS TABLE
-- Industry standard for tracking all customer interactions
CREATE TABLE IF NOT EXISTS customer_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    communication_type TEXT NOT NULL CHECK (communication_type IN ('call', 'email', 'text', 'meeting', 'note', 'visit')),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    subject TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'failed', 'cancelled')),
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE SERVICE AGREEMENTS TABLE  
-- Industry standard for recurring maintenance contracts
CREATE TABLE IF NOT EXISTS service_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    agreement_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    agreement_type TEXT NOT NULL CHECK (agreement_type IN ('maintenance', 'warranty', 'service_plan', 'subscription')),
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'suspended', 'expired', 'cancelled')),
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew BOOLEAN DEFAULT false,
    renewal_period_months INTEGER DEFAULT 12,
    service_frequency TEXT CHECK (service_frequency IN ('weekly', 'monthly', 'quarterly', 'semi_annual', 'annual')),
    contract_value NUMERIC(10,2) DEFAULT 0.00,
    billing_frequency TEXT DEFAULT 'monthly' CHECK (billing_frequency IN ('monthly', 'quarterly', 'annual', 'one_time')),
    next_service_date DATE,
    last_service_date DATE,
    terms_and_conditions TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_agreement_number_per_company UNIQUE (company_id, agreement_number),
    CONSTRAINT chk_end_date_after_start CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT chk_contract_value_positive CHECK (contract_value >= 0),
    CONSTRAINT chk_renewal_period_positive CHECK (renewal_period_months > 0)
);

-- 3. CREATE CUSTOMER PREFERENCES TABLE
-- Industry standard for storing customer preferences and settings
CREATE TABLE IF NOT EXISTS customer_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    preference_type TEXT NOT NULL,
    preference_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_customer_preference UNIQUE (customer_id, preference_type)
);

-- 4. CREATE CUSTOMER HISTORY TABLE
-- Industry standard for tracking customer interaction history
CREATE TABLE IF NOT EXISTS customer_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('created', 'updated', 'contacted', 'service_completed', 'payment_received', 'complaint', 'compliment')),
    event_description TEXT NOT NULL,
    event_data JSONB,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_customer_communications_customer_id ON customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_company_id ON customer_communications(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_type ON customer_communications(communication_type);
CREATE INDEX IF NOT EXISTS idx_customer_communications_created_at ON customer_communications(created_at);

CREATE INDEX IF NOT EXISTS idx_service_agreements_customer_id ON service_agreements(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_agreements_company_id ON service_agreements(company_id);
CREATE INDEX IF NOT EXISTS idx_service_agreements_status ON service_agreements(status);
CREATE INDEX IF NOT EXISTS idx_service_agreements_next_service_date ON service_agreements(next_service_date);

CREATE INDEX IF NOT EXISTS idx_customer_preferences_customer_id ON customer_preferences(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_preferences_type ON customer_preferences(preference_type);

CREATE INDEX IF NOT EXISTS idx_customer_history_customer_id ON customer_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_history_event_type ON customer_history(event_type);
CREATE INDEX IF NOT EXISTS idx_customer_history_created_at ON customer_history(created_at);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_history ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES
CREATE POLICY "Users can manage customer communications for their company" 
ON customer_communications FOR ALL 
TO authenticated 
USING (
    company_id = (
        SELECT company_id FROM profiles 
        WHERE id = auth.uid()
    )
);

CREATE POLICY "Users can manage service agreements for their company" 
ON service_agreements FOR ALL 
TO authenticated 
USING (
    company_id = (
        SELECT company_id FROM profiles 
        WHERE id = auth.uid()
    )
);

CREATE POLICY "Users can manage customer preferences for their company customers" 
ON customer_preferences FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM customers c 
        WHERE c.id = customer_preferences.customer_id 
        AND c.company_id = (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid()
        )
    )
);

CREATE POLICY "Users can view customer history for their company customers" 
ON customer_history FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM customers c 
        WHERE c.id = customer_history.customer_id 
        AND c.company_id = (
            SELECT company_id FROM profiles 
            WHERE id = auth.uid()
        )
    )
);

-- 8. CREATE TRIGGERS FOR UPDATED_AT
CREATE TRIGGER update_customer_communications_updated_at
    BEFORE UPDATE ON customer_communications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_agreements_updated_at
    BEFORE UPDATE ON service_agreements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_preferences_updated_at
    BEFORE UPDATE ON customer_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. GRANT PERMISSIONS
GRANT ALL ON customer_communications TO authenticated;
GRANT ALL ON service_agreements TO authenticated;
GRANT ALL ON customer_preferences TO authenticated;
GRANT ALL ON customer_history TO authenticated;

-- 10. CREATE HELPER FUNCTIONS

-- Function to generate service agreement numbers
CREATE OR REPLACE FUNCTION generate_service_agreement_number(p_company_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN generate_smart_reference_number(p_company_id, 'service_agreement');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log customer events automatically
CREATE OR REPLACE FUNCTION log_customer_event(
    p_customer_id UUID,
    p_event_type TEXT,
    p_event_description TEXT,
    p_event_data JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_history_id UUID;
BEGIN
    INSERT INTO customer_history (
        customer_id, 
        event_type, 
        event_description, 
        event_data, 
        created_by
    ) VALUES (
        p_customer_id,
        p_event_type,
        p_event_description,
        p_event_data,
        auth.uid()
    ) RETURNING id INTO v_history_id;
    
    RETURN v_history_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'Industry standard customer tables created successfully!' as result,
       'customer_communications, service_agreements, customer_preferences, customer_history' as tables_created;
