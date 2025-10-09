-- ========================================
-- ADD MISSING INDUSTRY STANDARD FIELDS
-- Based on ServiceTitan, Jobber, Housecall Pro
-- Avoiding competitor pain points
-- ========================================

BEGIN;

-- ========================================
-- 1. FINANCIAL FIELDS (Priority 1)
-- ========================================

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS deposit_percentage NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS payment_schedule JSONB, -- [{date, amount, description, paid}]
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'Net 30';

COMMENT ON COLUMN work_orders.deposit_amount IS 'Deposit amount required upfront';
COMMENT ON COLUMN work_orders.deposit_percentage IS 'Deposit percentage of total (auto-calculated)';
COMMENT ON COLUMN work_orders.payment_schedule IS 'Payment schedule for large jobs: [{date, amount, description, paid}]';
COMMENT ON COLUMN work_orders.discount_amount IS 'Discount amount applied';
COMMENT ON COLUMN work_orders.discount_percentage IS 'Discount percentage applied';
COMMENT ON COLUMN work_orders.payment_terms IS 'Payment terms: Net 30, Net 60, 50% deposit, etc.';

-- ========================================
-- 2. SERVICE DETAILS (Priority 2)
-- ========================================

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS estimated_duration_hours NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS requires_site_visit BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS urgency_level TEXT CHECK (urgency_level IN ('routine', 'urgent', 'emergency')) DEFAULT 'routine',
ADD COLUMN IF NOT EXISTS service_location_type TEXT CHECK (service_location_type IN ('residential', 'commercial', 'industrial')) DEFAULT 'residential';

COMMENT ON COLUMN work_orders.estimated_duration_hours IS 'Estimated time to complete job in hours';
COMMENT ON COLUMN work_orders.requires_site_visit IS 'Whether site visit is required before quote';
COMMENT ON COLUMN work_orders.urgency_level IS 'Urgency: routine, urgent (48hrs), emergency (same day)';
COMMENT ON COLUMN work_orders.service_location_type IS 'Type of service location';

-- ========================================
-- 3. CUSTOMER COMMUNICATION (Priority 3)
-- ========================================

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT,
ADD COLUMN IF NOT EXISTS warranty_info TEXT,
ADD COLUMN IF NOT EXISTS cancellation_policy TEXT,
ADD COLUMN IF NOT EXISTS special_instructions TEXT;

COMMENT ON COLUMN work_orders.terms_and_conditions IS 'Terms and conditions for this quote/job';
COMMENT ON COLUMN work_orders.warranty_info IS 'Warranty information for customer';
COMMENT ON COLUMN work_orders.cancellation_policy IS 'Cancellation policy for this job';
COMMENT ON COLUMN work_orders.special_instructions IS 'Special instructions from customer';

-- ========================================
-- 4. SCHEDULING (Priority 4)
-- ========================================

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS preferred_start_date DATE,
ADD COLUMN IF NOT EXISTS estimated_completion_date DATE,
ADD COLUMN IF NOT EXISTS assigned_technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN work_orders.preferred_start_date IS 'Customer preferred start date';
COMMENT ON COLUMN work_orders.estimated_completion_date IS 'Estimated completion date';
COMMENT ON COLUMN work_orders.assigned_technician_id IS 'Assigned technician/crew lead';

CREATE INDEX IF NOT EXISTS idx_work_orders_assigned_technician ON work_orders(assigned_technician_id) WHERE assigned_technician_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_work_orders_preferred_start ON work_orders(preferred_start_date) WHERE preferred_start_date IS NOT NULL;

-- ========================================
-- 5. ATTACHMENTS (Priority 5)
-- ========================================

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS attachment_urls TEXT[], -- General attachments
ADD COLUMN IF NOT EXISTS photo_urls TEXT[], -- Photos
ADD COLUMN IF NOT EXISTS document_urls TEXT[]; -- Documents (PDFs, specs)

COMMENT ON COLUMN work_orders.attachment_urls IS 'Array of attachment URLs';
COMMENT ON COLUMN work_orders.photo_urls IS 'Array of photo URLs (before/after, site photos)';
COMMENT ON COLUMN work_orders.document_urls IS 'Array of document URLs (permits, specs, diagrams)';

-- ========================================
-- 6. CUSTOMER APPROVAL (eSign)
-- ========================================

ALTER TABLE work_orders
ADD COLUMN IF NOT EXISTS customer_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS customer_signature_data TEXT, -- Base64 signature image
ADD COLUMN IF NOT EXISTS customer_ip_address INET,
ADD COLUMN IF NOT EXISTS approval_method TEXT CHECK (approval_method IN ('esign', 'email', 'phone', 'in_person'));

COMMENT ON COLUMN work_orders.customer_approved_at IS 'When customer approved/signed quote';
COMMENT ON COLUMN work_orders.customer_signature_data IS 'Customer signature (base64 image)';
COMMENT ON COLUMN work_orders.customer_ip_address IS 'Customer IP address when approved';
COMMENT ON COLUMN work_orders.approval_method IS 'How customer approved: esign, email, phone, in_person';

-- ========================================
-- 7. SMART DEFAULTS TABLE
-- Store company-wide defaults for quotes
-- ========================================

CREATE TABLE IF NOT EXISTS quote_defaults (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
    
    -- Financial defaults
    default_tax_rate NUMERIC(5,2) DEFAULT 0.00,
    default_payment_terms TEXT DEFAULT 'Net 30',
    default_deposit_percentage NUMERIC(5,2),
    require_deposit BOOLEAN DEFAULT FALSE,
    
    -- Communication defaults
    default_terms_and_conditions TEXT,
    default_warranty_info TEXT,
    default_cancellation_policy TEXT,
    
    -- Quote settings
    default_quote_expiration_days INTEGER DEFAULT 30,
    auto_send_follow_ups BOOLEAN DEFAULT TRUE,
    follow_up_days INTEGER[] DEFAULT ARRAY[3, 7, 14], -- Days after sending
    
    -- Approval settings
    require_manager_approval BOOLEAN DEFAULT FALSE,
    approval_threshold_amount NUMERIC(12,2), -- Require approval above this amount
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_defaults_company ON quote_defaults(company_id);

COMMENT ON TABLE quote_defaults IS 'Company-wide default settings for quotes';

-- ========================================
-- 8. TRIGGER TO AUTO-CALCULATE DEPOSIT
-- ========================================

CREATE OR REPLACE FUNCTION calculate_deposit_amount()
RETURNS TRIGGER AS $$
BEGIN
    -- If deposit_percentage is set, calculate deposit_amount
    IF NEW.deposit_percentage IS NOT NULL AND NEW.total_amount IS NOT NULL THEN
        NEW.deposit_amount := ROUND((NEW.total_amount * NEW.deposit_percentage / 100), 2);
    END IF;
    
    -- If deposit_amount is set, calculate deposit_percentage
    IF NEW.deposit_amount IS NOT NULL AND NEW.deposit_amount > 0 AND NEW.total_amount IS NOT NULL AND NEW.total_amount > 0 THEN
        NEW.deposit_percentage := ROUND((NEW.deposit_amount / NEW.total_amount * 100), 2);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_deposit ON work_orders;
CREATE TRIGGER trg_calculate_deposit
    BEFORE INSERT OR UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_deposit_amount();

-- ========================================
-- 9. TRIGGER TO AUTO-CALCULATE DISCOUNT
-- ========================================

CREATE OR REPLACE FUNCTION calculate_discount_amount()
RETURNS TRIGGER AS $$
BEGIN
    -- If discount_percentage is set, calculate discount_amount from subtotal
    IF NEW.discount_percentage IS NOT NULL AND NEW.subtotal IS NOT NULL THEN
        NEW.discount_amount := ROUND((NEW.subtotal * NEW.discount_percentage / 100), 2);
    END IF;
    
    -- If discount_amount is set, calculate discount_percentage
    IF NEW.discount_amount IS NOT NULL AND NEW.discount_amount > 0 AND NEW.subtotal IS NOT NULL AND NEW.subtotal > 0 THEN
        NEW.discount_percentage := ROUND((NEW.discount_amount / NEW.subtotal * 100), 2);
    END IF;
    
    -- Recalculate total_amount with discount
    IF NEW.discount_amount IS NOT NULL AND NEW.discount_amount > 0 THEN
        NEW.total_amount := (NEW.subtotal - NEW.discount_amount) + COALESCE(NEW.tax_amount, 0);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_discount ON work_orders;
CREATE TRIGGER trg_calculate_discount
    BEFORE INSERT OR UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_discount_amount();

-- ========================================
-- 10. FUNCTION TO GET QUOTE DEFAULTS
-- ========================================

CREATE OR REPLACE FUNCTION get_quote_defaults(p_company_id UUID)
RETURNS TABLE (
    tax_rate NUMERIC,
    payment_terms TEXT,
    deposit_percentage NUMERIC,
    terms_and_conditions TEXT,
    warranty_info TEXT,
    cancellation_policy TEXT,
    quote_expiration_days INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qd.default_tax_rate,
        qd.default_payment_terms,
        qd.default_deposit_percentage,
        qd.default_terms_and_conditions,
        qd.default_warranty_info,
        qd.default_cancellation_policy,
        qd.default_quote_expiration_days
    FROM quote_defaults qd
    WHERE qd.company_id = p_company_id;
    
    -- If no defaults exist, return sensible defaults
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            0.00::NUMERIC as tax_rate,
            'Net 30'::TEXT as payment_terms,
            NULL::NUMERIC as deposit_percentage,
            NULL::TEXT as terms_and_conditions,
            NULL::TEXT as warranty_info,
            NULL::TEXT as cancellation_policy,
            30::INTEGER as quote_expiration_days;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 11. CREATE DEFAULT SETTINGS FOR EXISTING COMPANIES
-- ========================================

INSERT INTO quote_defaults (company_id, default_tax_rate, default_payment_terms, default_quote_expiration_days)
SELECT 
    id,
    0.00,
    'Net 30',
    30
FROM companies
WHERE id NOT IN (SELECT company_id FROM quote_defaults)
ON CONFLICT (company_id) DO NOTHING;

COMMIT;

-- ========================================
-- VERIFICATION
-- ========================================

SELECT '✅ Industry standard fields added!' as result;

-- Show new fields
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'work_orders'
AND column_name IN (
    'deposit_amount', 'deposit_percentage', 'payment_schedule',
    'discount_amount', 'discount_percentage', 'payment_terms',
    'estimated_duration_hours', 'requires_site_visit', 'urgency_level',
    'terms_and_conditions', 'warranty_info', 'cancellation_policy',
    'preferred_start_date', 'estimated_completion_date', 'assigned_technician_id',
    'attachment_urls', 'photo_urls', 'document_urls',
    'customer_approved_at', 'customer_signature_data', 'approval_method'
)
ORDER BY column_name;
