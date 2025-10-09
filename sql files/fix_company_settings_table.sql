-- Fix company_settings table for invoice settings
-- Run this in your Supabase SQL editor

-- Create company_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Invoice numbering
    invoice_number_prefix TEXT DEFAULT 'INV-',
    invoice_number_format TEXT DEFAULT '{prefix}{year}{month}{sequence}',
    next_invoice_number INTEGER DEFAULT 1,
    
    -- Payment terms
    default_payment_terms TEXT DEFAULT 'NET_30',
    default_due_days INTEGER DEFAULT 30,
    
    -- Late fees
    late_fee_enabled BOOLEAN DEFAULT FALSE,
    late_fee_percentage DECIMAL(5,2) DEFAULT 0.00,
    late_fee_flat_amount DECIMAL(10,2) DEFAULT 0.00,
    grace_period_days INTEGER DEFAULT 0,
    
    -- Tax settings
    default_tax_rate DECIMAL(5,2) DEFAULT 0.00,
    tax_inclusive_pricing BOOLEAN DEFAULT FALSE,
    multiple_tax_rates_enabled BOOLEAN DEFAULT FALSE,
    
    -- Invoice content
    default_invoice_terms TEXT DEFAULT '',
    invoice_footer TEXT DEFAULT '',
    payment_instructions TEXT DEFAULT '',
    
    -- Display options
    show_item_descriptions BOOLEAN DEFAULT TRUE,
    show_labor_breakdown BOOLEAN DEFAULT TRUE,
    show_material_costs BOOLEAN DEFAULT TRUE,
    
    -- Automation
    auto_send_invoices BOOLEAN DEFAULT FALSE,
    auto_send_reminders BOOLEAN DEFAULT FALSE,
    auto_apply_late_fees BOOLEAN DEFAULT FALSE,
    
    -- Payment methods (stored as JSON array)
    accepted_payment_methods JSONB DEFAULT '["cash", "check", "credit_card"]'::jsonb,
    
    -- Features
    online_payments_enabled BOOLEAN DEFAULT FALSE,
    recurring_invoices_enabled BOOLEAN DEFAULT FALSE,
    multi_currency_enabled BOOLEAN DEFAULT FALSE,
    invoice_approval_required BOOLEAN DEFAULT FALSE,
    
    -- Ensure one settings record per company
    UNIQUE(company_id)
);

-- Disable RLS for beta (as mentioned in memories)
ALTER TABLE company_settings DISABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_company_settings_updated_at ON company_settings;
CREATE TRIGGER update_company_settings_updated_at
    BEFORE UPDATE ON company_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_settings_company_id ON company_settings(company_id);

-- Verify the table was created correctly
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'company_settings'
ORDER BY ordinal_position;
