-- ========================================
-- FIX INTERNATIONAL PHONE NUMBER CONSTRAINTS
-- Update to proper E.164 international standard
-- Based on ITU-T E.164 recommendation
-- ========================================

-- 1. DROP EXISTING RESTRICTIVE PHONE CONSTRAINTS
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_phone_check;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_mobile_phone_check;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS chk_customers_phone_format;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS chk_customers_mobile_phone_format;

-- 2. ADD PROPER E.164 INTERNATIONAL PHONE CONSTRAINTS
-- E.164 format: +[1-9][0-9]{1,14} (1-15 digits total, no leading zeros)
ALTER TABLE customers ADD CONSTRAINT chk_customers_phone_e164 
    CHECK (phone IS NULL OR phone ~ '^\+[1-9]\d{1,14}$');

ALTER TABLE customers ADD CONSTRAINT chk_customers_mobile_phone_e164 
    CHECK (mobile_phone IS NULL OR mobile_phone ~ '^\+[1-9]\d{1,14}$');

-- 3. UPDATE CUSTOMER_CONTACTS TABLE CONSTRAINTS
ALTER TABLE customer_contacts DROP CONSTRAINT IF EXISTS customer_contacts_phone_check;
ALTER TABLE customer_contacts ADD CONSTRAINT chk_customer_contacts_phone_e164 
    CHECK (phone IS NULL OR phone ~ '^\+[1-9]\d{1,14}$');

-- 4. CREATE PHONE FORMATTING FUNCTION FOR CONSISTENCY
CREATE OR REPLACE FUNCTION format_phone_e164(input_phone TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Return null for empty input
    IF input_phone IS NULL OR trim(input_phone) = '' THEN
        RETURN NULL;
    END IF;
    
    -- If already in E.164 format, return as-is
    IF input_phone ~ '^\+[1-9]\d{1,14}$' THEN
        RETURN input_phone;
    END IF;
    
    -- Remove all non-digits except leading +
    DECLARE
        cleaned TEXT := regexp_replace(input_phone, '[^\d+]', '', 'g');
        digits TEXT;
    BEGIN
        -- Extract digits only
        digits := regexp_replace(cleaned, '[^\d]', '', 'g');
        
        -- If no digits, return null
        IF length(digits) = 0 THEN
            RETURN NULL;
        END IF;
        
        -- Handle common cases
        CASE
            -- 10 digits: assume US/Canada
            WHEN length(digits) = 10 THEN
                RETURN '+1' || digits;
            
            -- 11 digits starting with 1: US/Canada with country code
            WHEN length(digits) = 11 AND left(digits, 1) = '1' THEN
                RETURN '+' || digits;
            
            -- Other valid lengths (7-15 digits)
            WHEN length(digits) BETWEEN 7 AND 15 AND left(digits, 1) != '0' THEN
                -- If input had +, preserve it; otherwise add +
                IF left(ltrim(input_phone), 1) = '+' THEN
                    RETURN '+' || digits;
                ELSE
                    -- For international numbers without +, user should specify country code
                    -- Default to +1 for backwards compatibility if it looks like NANP
                    IF length(digits) = 10 OR (length(digits) = 11 AND left(digits, 1) = '1') THEN
                        RETURN '+1' || right(digits, 10);
                    ELSE
                        RETURN '+' || digits;
                    END IF;
                END IF;
            
            ELSE
                -- Invalid format
                RETURN NULL;
        END CASE;
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. CREATE TRIGGER TO AUTO-FORMAT PHONE NUMBERS
CREATE OR REPLACE FUNCTION auto_format_customer_phones()
RETURNS TRIGGER AS $$
BEGIN
    -- Format phone numbers on insert/update
    NEW.phone := format_phone_e164(NEW.phone);
    NEW.mobile_phone := format_phone_e164(NEW.mobile_phone);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for customers table
DROP TRIGGER IF EXISTS trg_auto_format_customer_phones ON customers;
CREATE TRIGGER trg_auto_format_customer_phones
    BEFORE INSERT OR UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION auto_format_customer_phones();

-- 6. CREATE SIMILAR TRIGGER FOR CUSTOMER_CONTACTS
CREATE OR REPLACE FUNCTION auto_format_contact_phones()
RETURNS TRIGGER AS $$
BEGIN
    NEW.phone := format_phone_e164(NEW.phone);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_format_contact_phones ON customer_contacts;
CREATE TRIGGER trg_auto_format_contact_phones
    BEFORE INSERT OR UPDATE ON customer_contacts
    FOR EACH ROW EXECUTE FUNCTION auto_format_contact_phones();

-- 7. UPDATE EXISTING PHONE NUMBERS TO E.164 FORMAT
UPDATE customers 
SET phone = format_phone_e164(phone)
WHERE phone IS NOT NULL AND phone !~ '^\+[1-9]\d{1,14}$';

UPDATE customers 
SET mobile_phone = format_phone_e164(mobile_phone)
WHERE mobile_phone IS NOT NULL AND mobile_phone !~ '^\+[1-9]\d{1,14}$';

UPDATE customer_contacts 
SET phone = format_phone_e164(phone)
WHERE phone IS NOT NULL AND phone !~ '^\+[1-9]\d{1,14}$';

-- 8. ADD HELPFUL COMMENTS
COMMENT ON CONSTRAINT chk_customers_phone_e164 ON customers IS 
'Phone numbers must be in E.164 international format: +[country code][number] (1-15 digits total)';

COMMENT ON CONSTRAINT chk_customers_mobile_phone_e164 ON customers IS 
'Mobile phone numbers must be in E.164 international format: +[country code][number] (1-15 digits total)';

COMMENT ON FUNCTION format_phone_e164(TEXT) IS 
'Formats phone numbers to E.164 international standard. Handles US/Canada (10-11 digits) and international formats.';

-- Success message
SELECT 'International phone number constraints updated!' as result,
       'Now supports E.164 format with auto-formatting triggers' as changes,
       'Examples: +1 for US/Canada, +44 for UK, +49 for Germany, etc.' as examples;
