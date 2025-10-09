-- Test creating a simple table to isolate the issue

CREATE TABLE IF NOT EXISTS test_quote_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    
    -- Simple test fields
    quote_sent_at TIMESTAMPTZ,
    quote_value NUMERIC(12,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test if this works
SELECT 'Table created successfully' as result;
