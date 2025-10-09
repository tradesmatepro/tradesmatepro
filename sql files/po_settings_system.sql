-- Purchase Order Settings System Enhancement
-- This script adds comprehensive PO settings to the existing settings tables

-- Add PO-related columns to business_settings table
ALTER TABLE business_settings 
ADD COLUMN IF NOT EXISTS po_number_prefix TEXT DEFAULT 'PO-',
ADD COLUMN IF NOT EXISTS next_po_number INTEGER DEFAULT 1001,
ADD COLUMN IF NOT EXISTS po_auto_numbering BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS po_require_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS po_approval_threshold NUMERIC DEFAULT 1000.00,
ADD COLUMN IF NOT EXISTS po_default_terms TEXT DEFAULT 'NET_30',
ADD COLUMN IF NOT EXISTS po_auto_send_to_vendor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS po_require_receipt_confirmation BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS po_allow_partial_receiving BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS po_default_shipping_method TEXT DEFAULT 'STANDARD',
ADD COLUMN IF NOT EXISTS po_tax_calculation_method TEXT DEFAULT 'AUTOMATIC',
ADD COLUMN IF NOT EXISTS po_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS po_payment_terms_options JSONB DEFAULT '["NET_15", "NET_30", "NET_45", "NET_60", "DUE_ON_RECEIPT", "2_10_NET_30"]'::jsonb,
ADD COLUMN IF NOT EXISTS po_default_notes TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS po_footer_text TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS po_email_template TEXT DEFAULT 'Please find attached Purchase Order #{po_number}. Please confirm receipt and expected delivery date.',
ADD COLUMN IF NOT EXISTS po_reminder_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS po_overdue_notification_days INTEGER DEFAULT 14;

-- Add PO-related columns to settings table (legacy support)
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS po_number_prefix TEXT DEFAULT 'PO-',
ADD COLUMN IF NOT EXISTS next_po_number INTEGER DEFAULT 1001,
ADD COLUMN IF NOT EXISTS po_default_terms TEXT DEFAULT 'NET_30',
ADD COLUMN IF NOT EXISTS po_require_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS po_approval_threshold NUMERIC DEFAULT 1000.00;

-- Create PO number sequence function
CREATE OR REPLACE FUNCTION generate_po_number(company_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    settings_record RECORD;
    new_number INTEGER;
    po_number TEXT;
BEGIN
    -- Get current settings
    SELECT po_number_prefix, next_po_number, po_auto_numbering
    INTO settings_record
    FROM business_settings 
    WHERE company_id = company_id_param;
    
    -- Fallback to legacy settings table if business_settings not found
    IF NOT FOUND THEN
        SELECT po_number_prefix, next_po_number, true as po_auto_numbering
        INTO settings_record
        FROM settings 
        WHERE company_id = company_id_param;
    END IF;
    
    -- Use defaults if no settings found
    IF NOT FOUND THEN
        settings_record.po_number_prefix := 'PO-';
        settings_record.next_po_number := 1001;
        settings_record.po_auto_numbering := true;
    END IF;
    
    -- Generate PO number
    IF settings_record.po_auto_numbering THEN
        new_number := settings_record.next_po_number;
        po_number := settings_record.po_number_prefix || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(new_number::TEXT, 4, '0');
        
        -- Update next number in business_settings
        UPDATE business_settings 
        SET next_po_number = new_number + 1, updated_at = NOW()
        WHERE company_id = company_id_param;
        
        -- Also update legacy settings table
        UPDATE settings 
        SET next_po_number = new_number + 1, updated_at = NOW()
        WHERE company_id = company_id_param;
    ELSE
        -- Manual numbering - return template
        po_number := settings_record.po_number_prefix || 'MANUAL';
    END IF;
    
    RETURN po_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to get PO settings
CREATE OR REPLACE FUNCTION get_po_settings(company_id_param UUID)
RETURNS JSONB AS $$
DECLARE
    settings_json JSONB;
BEGIN
    -- Try business_settings first
    SELECT jsonb_build_object(
        'po_number_prefix', COALESCE(po_number_prefix, 'PO-'),
        'next_po_number', COALESCE(next_po_number, 1001),
        'po_auto_numbering', COALESCE(po_auto_numbering, true),
        'po_require_approval', COALESCE(po_require_approval, false),
        'po_approval_threshold', COALESCE(po_approval_threshold, 1000.00),
        'po_default_terms', COALESCE(po_default_terms, 'NET_30'),
        'po_auto_send_to_vendor', COALESCE(po_auto_send_to_vendor, false),
        'po_require_receipt_confirmation', COALESCE(po_require_receipt_confirmation, true),
        'po_allow_partial_receiving', COALESCE(po_allow_partial_receiving, true),
        'po_default_shipping_method', COALESCE(po_default_shipping_method, 'STANDARD'),
        'po_tax_calculation_method', COALESCE(po_tax_calculation_method, 'AUTOMATIC'),
        'po_currency', COALESCE(po_currency, 'USD'),
        'po_payment_terms_options', COALESCE(po_payment_terms_options, '["NET_15", "NET_30", "NET_45", "NET_60", "DUE_ON_RECEIPT", "2_10_NET_30"]'::jsonb),
        'po_default_notes', COALESCE(po_default_notes, ''),
        'po_footer_text', COALESCE(po_footer_text, ''),
        'po_email_template', COALESCE(po_email_template, 'Please find attached Purchase Order #{po_number}. Please confirm receipt and expected delivery date.'),
        'po_reminder_days', COALESCE(po_reminder_days, 7),
        'po_overdue_notification_days', COALESCE(po_overdue_notification_days, 14)
    )
    INTO settings_json
    FROM business_settings 
    WHERE company_id = company_id_param;
    
    -- Fallback to legacy settings if business_settings not found
    IF settings_json IS NULL THEN
        SELECT jsonb_build_object(
            'po_number_prefix', COALESCE(po_number_prefix, 'PO-'),
            'next_po_number', COALESCE(next_po_number, 1001),
            'po_auto_numbering', true,
            'po_require_approval', COALESCE(po_require_approval, false),
            'po_approval_threshold', COALESCE(po_approval_threshold, 1000.00),
            'po_default_terms', COALESCE(po_default_terms, 'NET_30'),
            'po_auto_send_to_vendor', false,
            'po_require_receipt_confirmation', true,
            'po_allow_partial_receiving', true,
            'po_default_shipping_method', 'STANDARD',
            'po_tax_calculation_method', 'AUTOMATIC',
            'po_currency', 'USD',
            'po_payment_terms_options', '["NET_15", "NET_30", "NET_45", "NET_60", "DUE_ON_RECEIPT", "2_10_NET_30"]'::jsonb,
            'po_default_notes', '',
            'po_footer_text', '',
            'po_email_template', 'Please find attached Purchase Order #{po_number}. Please confirm receipt and expected delivery date.',
            'po_reminder_days', 7,
            'po_overdue_notification_days', 14
        )
        INTO settings_json
        FROM settings 
        WHERE company_id = company_id_param;
    END IF;
    
    -- Return defaults if no settings found
    IF settings_json IS NULL THEN
        settings_json := jsonb_build_object(
            'po_number_prefix', 'PO-',
            'next_po_number', 1001,
            'po_auto_numbering', true,
            'po_require_approval', false,
            'po_approval_threshold', 1000.00,
            'po_default_terms', 'NET_30',
            'po_auto_send_to_vendor', false,
            'po_require_receipt_confirmation', true,
            'po_allow_partial_receiving', true,
            'po_default_shipping_method', 'STANDARD',
            'po_tax_calculation_method', 'AUTOMATIC',
            'po_currency', 'USD',
            'po_payment_terms_options', '["NET_15", "NET_30", "NET_45", "NET_60", "DUE_ON_RECEIPT", "2_10_NET_30"]'::jsonb,
            'po_default_notes', '',
            'po_footer_text', '',
            'po_email_template', 'Please find attached Purchase Order #{po_number}. Please confirm receipt and expected delivery date.',
            'po_reminder_days', 7,
            'po_overdue_notification_days', 14
        );
    END IF;
    
    RETURN settings_json;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate PO numbers
CREATE OR REPLACE FUNCTION auto_generate_po_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if po_number is null or empty
    IF NEW.po_number IS NULL OR NEW.po_number = '' THEN
        NEW.po_number := generate_po_number(NEW.company_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on purchase_orders table
DROP TRIGGER IF EXISTS trigger_auto_generate_po_number ON purchase_orders;
CREATE TRIGGER trigger_auto_generate_po_number
    BEFORE INSERT ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_po_number();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_settings_company_po ON business_settings(company_id) WHERE po_number_prefix IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_settings_company_po ON settings(company_id) WHERE po_number_prefix IS NOT NULL;

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_po_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_po_settings(UUID) TO authenticated;

-- Insert default PO settings for existing companies that don't have business_settings
INSERT INTO business_settings (
    company_id, 
    po_number_prefix, 
    next_po_number, 
    po_auto_numbering,
    po_require_approval,
    po_approval_threshold,
    po_default_terms
)
SELECT 
    c.id,
    'PO-',
    1001,
    true,
    false,
    1000.00,
    'NET_30'
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM business_settings bs WHERE bs.company_id = c.id
)
ON CONFLICT (company_id) DO NOTHING;

-- Update existing settings records with PO defaults
UPDATE business_settings 
SET 
    po_number_prefix = COALESCE(po_number_prefix, 'PO-'),
    next_po_number = COALESCE(next_po_number, 1001),
    po_auto_numbering = COALESCE(po_auto_numbering, true),
    po_require_approval = COALESCE(po_require_approval, false),
    po_approval_threshold = COALESCE(po_approval_threshold, 1000.00),
    po_default_terms = COALESCE(po_default_terms, 'NET_30'),
    updated_at = NOW()
WHERE po_number_prefix IS NULL;

-- Update legacy settings table as well
UPDATE settings 
SET 
    po_number_prefix = COALESCE(po_number_prefix, 'PO-'),
    next_po_number = COALESCE(next_po_number, 1001),
    po_require_approval = COALESCE(po_require_approval, false),
    po_approval_threshold = COALESCE(po_approval_threshold, 1000.00),
    po_default_terms = COALESCE(po_default_terms, 'NET_30'),
    updated_at = NOW()
WHERE po_number_prefix IS NULL;
