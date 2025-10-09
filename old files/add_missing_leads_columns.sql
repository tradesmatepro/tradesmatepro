-- Add missing columns to leads table for Sales Dashboard
-- These are required by the React app SalesDashboard.js

-- Add stage column (for pipeline tracking)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'new'
CHECK (stage IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed'));

-- Add expected_value column (for pipeline value calculations)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS expected_value DECIMAL(12,2) DEFAULT 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- Add indexes for opportunities (performance optimization)
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);

-- Add missing indexes for customer tables (performance)
CREATE INDEX IF NOT EXISTS idx_customer_communications_customer_id ON customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_tags_company_id ON customer_tags(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_service_agreements_customer_id ON customer_service_agreements(customer_id);
